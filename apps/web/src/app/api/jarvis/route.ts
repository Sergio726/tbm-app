import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, type ChatMessage, type ProviderId } from "@/lib/ai";
import { buildJarvisContext } from "@/lib/jarvis-context";
import { retrieveKnowledge } from "@/lib/jarvis-retrieval";
import { TBM_METHOD_FRAMING } from "@/lib/tbm-disc-context";
import { DC_DEFAULTS, toneLine, ragEnabled, actionsEnabled } from "@/lib/dc-persona";
import { DC_TOOL_SPECS, isToolName, prepareProposal, executeTool } from "@/lib/jarvis-tools";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function defaultSystem(name: string) {
  return (
    `Sos ${name}, el asistente del método The Business Multiplier (TBM) de Dilio Donado. Ayudás a ` +
    "líderes a multiplicar su negocio con el talento correcto en el sistema correcto. Respondés en " +
    "español rioplatense (voseo), claro y concreto, con la voz del método (LOST, ARQI, delegación, " +
    "DISC). No inventás datos del equipo o la empresa: usás solo el contexto provisto."
  );
}

// Reglas de comportamiento — se inyectan SIEMPRE (incluso si el admin guardó un system prompt propio).
function behaviorRules(name: string) {
  return [
    `Tu nombre es ${name}. Si te preguntan cómo te llamás, sos ${name}.`,
    "REGLAS DE COMPORTAMIENTO (obligatorias):",
    "1. BREVEDAD: respondé corto y al grano (2 a 4 frases). NO hagas respuestas largas ni listados extensos salvo que el usuario lo pida explícitamente.",
    "2. CIERRE CON PREGUNTA: terminá SIEMPRE con UNA sola pregunta breve para entender mejor qué necesita y seguir la conversación (ej.: '¿Querés que lo veamos con tu equipo?').",
    "3. SOLO TU DOMINIO: respondé únicamente sobre el método TBM, liderazgo, gestión y diseño de equipos, delegación, DISC, productividad del líder y el negocio del usuario. Si te preguntan algo fuera de eso (recetas, deportes, entretenimiento, trivia, temas personales no laborales), NO lo respondas: decliná con amabilidad y reencauzá. Ej.: 'Eso se sale de lo mío 🙂. Estoy para ayudarte a multiplicar tu negocio y tu equipo. ¿En qué te doy una mano hoy?'",
  ].join("\n");
}

// DC-3: marco de acciones — se inyecta al system cuando el tool use está activo.
function toolsFraming(name: string) {
  return [
    "ACCIONES EN LA APP (podés EJECUTAR, no solo explicar):",
    `Tenés herramientas para: generar el link del test DISC de un colaborador, crear una tarea de delegación (Pase de Estafeta) e invitar colaboradores por email. Cuando ${name} detecte que el usuario quiere HACER una de esas cosas, usá la herramienta correspondiente en vez de describir los pasos.`,
    "Si faltan datos para la acción (ej. los 5 puntos de la tarea, o a quién), preguntá primero — no inventes.",
    "Toda acción se le confirma al usuario antes de ejecutarse, así que no pidas confirmación vos: simplemente proponé la herramienta.",
  ].join("\n");
}

/** Respuesta de texto completo (no-streaming) servida como text/plain para que el panel la lea igual que un stream. */
function textResponse(text: string) {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(enc.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Origin para armar links/invitaciones: prioriza el que manda el cliente, con fallback al request. */
function resolveOrigin(req: Request, bodyOrigin: unknown): string {
  if (typeof bodyOrigin === "string" && /^https?:\/\//.test(bodyOrigin)) {
    return bodyOrigin.replace(/\/+$/, "");
  }
  try {
    return new URL(req.url).origin;
  } catch {
    return "";
  }
}

/** Chat de JARVIS en streaming (S18.3) + tool use con confirmación (DC-3). */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_sesion" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "sin_config" }, { status: 503 });

  const { data: cfg } = await admin
    .from("ai_config")
    .select("enabled, provider, model, system_prompt, temperature, persona_name, tone, features")
    .eq("scope", "platform")
    .maybeSingle();
  if (!cfg || !cfg.enabled) return NextResponse.json({ error: "disabled" }, { status: 503 });

  const personaName = cfg.persona_name?.trim() || DC_DEFAULTS.name;

  const adapter = getProvider(cfg.provider as ProviderId);
  if (!adapter?.chatStream) {
    return NextResponse.json({ error: "provider_no_implementado" }, { status: 503 });
  }

  const { data: key } = await admin.rpc("ai_get_api_key");
  if (!key) return NextResponse.json({ error: "sin_config" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    messages?: ChatMessage[];
    module?: string;
    confirm?: { tool?: string; args?: Record<string, unknown> };
    origin?: string;
  };

  // DC-3: rol del usuario (las acciones son solo para arquitectos) + origin para links.
  const { data: meRow } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isArquitecto = meRow?.role === "arquitecto";
  const useActions = !!adapter.chatWithTools && actionsEnabled(cfg.features) && isArquitecto;
  const origin = resolveOrigin(req, body.origin);

  // DC-3 (fase 2): el usuario confirmó una acción propuesta → ejecutar y responder.
  if (useActions && body.confirm?.tool && isToolName(body.confirm.tool)) {
    const result = await executeTool(body.confirm.tool, body.confirm.args ?? {}, origin);
    return textResponse(result.message);
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  // DC-1: pantalla actual del usuario (context-aware). Sanitizada y acotada.
  const moduleLabel =
    typeof body.module === "string" ? body.module.slice(0, 80).trim() : "";

  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  // RAG gateable por features (DC-2): si está off, no recuperamos material.
  const useRag = ragEnabled(cfg.features);
  const [context, knowledge] = await Promise.all([
    buildJarvisContext(user.id),
    useRag ? retrieveKnowledge(lastUser) : Promise.resolve([]),
  ]);

  const knowledgeBlock = knowledge.length
    ? [
        "",
        "MATERIAL DE REFERENCIA DEL MÉTODO (fragmentos de la investigación; citá la fuente entre [corchetes] si lo usás; no inventes fuera de esto). OJO: el material puede traer rótulos viejos (ej. 'LOS'); aplicá SIEMPRE los nombres canónicos indicados arriba:",
        ...knowledge.map((k) => `[${k.source}] ${k.content}`),
      ]
    : [];

  const screenBlock = moduleLabel
    ? [
        "",
        `PANTALLA ACTUAL: el usuario está viendo "${moduleLabel}". Si viene al caso, ajustá tus sugerencias a lo que puede hacer en esa pantalla; no lo fuerces si la pregunta es sobre otra cosa.`,
      ]
    : [];

  const system = [
    cfg.system_prompt?.trim() || defaultSystem(personaName),
    "",
    behaviorRules(personaName),
    toneLine(cfg.tone),
    ...(useActions ? ["", toolsFraming(personaName)] : []),
    "",
    TBM_METHOD_FRAMING,
    ...screenBlock,
    "",
    "CONTEXTO ACTUAL (datos reales de la empresa del usuario):",
    context,
    ...knowledgeBlock,
    "",
    "No inventes datos del equipo, tareas ni métricas que no estén en este contexto; si te faltan, pedilos o aclaralo.",
  ].join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history.filter((m) => m.role !== "system").slice(-10),
  ];

  // DC-3 (fase 1): acciones activas → un turno con tools. Si el modelo pide una
  // herramienta, devolvemos una PROPUESTA (no se ejecuta hasta que el usuario confirme).
  if (useActions) {
    try {
      const result = await adapter.chatWithTools!(
        {
          model: cfg.model,
          messages,
          maxTokens: 700,
          temperature: cfg.temperature ?? 0.7,
          tools: DC_TOOL_SPECS,
        },
        key
      );
      if (result.toolCall && isToolName(result.toolCall.name)) {
        const prep = await prepareProposal(result.toolCall.name, result.toolCall.arguments);
        if (prep.kind === "proposal") {
          return NextResponse.json({ type: "proposal", proposal: prep.proposal });
        }
        const msg = result.text ? `${result.text}\n\n${prep.message}` : prep.message;
        return textResponse(msg);
      }
      return textResponse(result.text || "¿En qué te doy una mano con tu equipo?");
    } catch {
      return textResponse("No pude procesar eso ahora. Probá de nuevo en un momento.");
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const token of adapter.chatStream!(
          { model: cfg.model, messages, maxTokens: 450, temperature: cfg.temperature ?? 0.7 },
          key
        )) {
          controller.enqueue(encoder.encode(token));
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[No pude completar la respuesta. Probá de nuevo.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
