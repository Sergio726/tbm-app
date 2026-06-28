import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getProvider,
  estimateTokens,
  type ChatMessage,
  type ProviderId,
  type TokenUsage,
} from "@/lib/ai";
import type { createClient as createServerClientType } from "@/lib/supabase/server";
import { buildJarvisContext } from "@/lib/jarvis-context";
import { retrieveKnowledge } from "@/lib/jarvis-retrieval";
import { TBM_METHOD_FRAMING } from "@/lib/tbm-disc-context";
import { DC_DEFAULTS, toneLine, ragEnabled, actionsEnabled } from "@/lib/dc-persona";
import { DC_TOOL_SPECS, isToolName, prepareProposal, executeTool } from "@/lib/jarvis-tools";
import { NAV_SLUGS, parseNavMarker } from "@/lib/dc-navigation";

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

// N1: navegación — se inyecta SIEMPRE (todos los roles). DC puede llevar al usuario
// a la pantalla correcta agregando un marcador al final que el panel vuelve botón.
function navigationFraming() {
  return [
    "NAVEGACIÓN (podés llevar al usuario a la pantalla correcta):",
    "Si tu respuesta se refiere a algo que se hace en un módulo de la app, agregá AL FINAL, en una línea sola, el marcador [[IR:<slug>]] (un solo marcador). El usuario verá un botón para ir a esa pantalla.",
    `Slugs válidos: ${NAV_SLUGS.join(", ")}.`,
    "Si la pregunta no se resuelve en un módulo concreto, NO agregues el marcador. Nunca menciones el marcador en el texto ni expliques su existencia: es una instrucción interna.",
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
function textResponse(text: string, conversationId?: string | null) {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(enc.encode(text));
      controller.close();
    },
  });
  const headers: Record<string, string> = {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  };
  if (conversationId) headers["x-conversation-id"] = conversationId;
  return new Response(stream, { headers });
}

// ── DC-6: historial + uso + rate-limit ────────────────────────────────────
const DC_RATE_LIMIT = 50; // mensajes del usuario por hora
type RlsClient = Awaited<ReturnType<typeof createServerClientType>>;

/** ¿El usuario superó el tope de mensajes/hora? (RLS limita el conteo a sus mensajes). */
async function overRateLimit(supabase: RlsClient): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", since);
  return (count ?? 0) >= DC_RATE_LIMIT;
}

/** Devuelve la conversación existente o crea una nueva (título = inicio del 1er mensaje). */
async function getOrCreateConversation(
  supabase: RlsClient,
  userId: string,
  companyId: string | null,
  conversationId: string | undefined,
  firstText: string
): Promise<string | null> {
  if (conversationId) return conversationId;
  const title = (firstText || "Conversación").slice(0, 60);
  const { data } = await supabase
    .from("ai_conversations")
    .insert({ user_id: userId, company_id: companyId, title })
    .select("id")
    .single();
  return data?.id ?? null;
}

/** Persiste un mensaje (con tokens si los hay) y toca updated_at de la conversación. */
async function saveMessage(
  supabase: RlsClient,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  model: string | null,
  usage?: TokenUsage
): Promise<void> {
  await supabase.from("ai_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    model,
    prompt_tokens: usage?.promptTokens ?? 0,
    completion_tokens: usage?.completionTokens ?? 0,
  });
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
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
    conversationId?: string;
  };

  // DC-3: rol del usuario (las acciones son solo para arquitectos) + empresa (DC-6) + origin.
  const { data: meRow } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();
  const isArquitecto = meRow?.role === "arquitecto";
  const companyId = (meRow?.company_id as string | null) ?? null;
  const useActions = !!adapter.chatWithTools && actionsEnabled(cfg.features) && isArquitecto;
  const origin = resolveOrigin(req, body.origin);

  // DC-3 (fase 2): el usuario confirmó una acción propuesta → ejecutar y responder.
  if (useActions && body.confirm?.tool && isToolName(body.confirm.tool)) {
    const result = await executeTool(body.confirm.tool, body.confirm.args ?? {}, origin);
    if (body.conversationId) {
      await saveMessage(supabase, body.conversationId, "assistant", result.message, cfg.model);
    }
    return textResponse(result.message, body.conversationId);
  }

  // DC-6: tope simple de mensajes por usuario/hora.
  if (await overRateLimit(supabase)) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  // DC-1: pantalla actual del usuario (context-aware). Sanitizada y acotada.
  const moduleLabel =
    typeof body.module === "string" ? body.module.slice(0, 80).trim() : "";

  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  // DC-6: conversación (retomar o crear) + persistir el mensaje nuevo del usuario.
  const conversationId = await getOrCreateConversation(
    supabase,
    user.id,
    companyId,
    body.conversationId,
    lastUser
  );
  if (conversationId && lastUser) {
    await saveMessage(supabase, conversationId, "user", lastUser, null);
  }

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
    "",
    navigationFraming(),
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
          // El assistant message lo guarda el confirm (cuando se ejecuta la acción).
          return NextResponse.json({ type: "proposal", proposal: prep.proposal, conversationId });
        }
        const msg = result.text ? `${result.text}\n\n${prep.message}` : prep.message;
        if (conversationId)
          await saveMessage(supabase, conversationId, "assistant", parseNavMarker(msg).clean, cfg.model, result.usage);
        return textResponse(msg, conversationId);
      }
      const finalText = result.text || "¿En qué te doy una mano con tu equipo?";
      if (conversationId)
        await saveMessage(
          supabase,
          conversationId,
          "assistant",
          parseNavMarker(finalText).clean,
          cfg.model,
          result.usage ?? { promptTokens: 0, completionTokens: estimateTokens(finalText) }
        );
      return textResponse(finalText, conversationId);
    } catch {
      return textResponse("No pude procesar eso ahora. Probá de nuevo en un momento.", conversationId);
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let acc = "";
      let usage: TokenUsage | undefined;
      try {
        // Iteración manual: el generator `return`-ea el usage al terminar (DC-6).
        const it = adapter.chatStream!(
          { model: cfg.model, messages, maxTokens: 450, temperature: cfg.temperature ?? 0.7 },
          key
        );
        while (true) {
          const r = await it.next();
          if (r.done) {
            usage = r.value ?? undefined;
            break;
          }
          acc += r.value;
          controller.enqueue(encoder.encode(r.value));
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[No pude completar la respuesta. Probá de nuevo.]"));
      } finally {
        // DC-6: persistir ANTES de close() — en Vercel el trabajo post-close puede no completarse.
        // N1: guardar el texto SIN el marcador [[IR:…]] (no recargar botones viejos del historial).
        if (conversationId && acc) {
          try {
            await saveMessage(
              supabase,
              conversationId,
              "assistant",
              parseNavMarker(acc).clean,
              cfg.model,
              usage ?? { promptTokens: 0, completionTokens: estimateTokens(acc) }
            );
          } catch {
            /* no romper la respuesta por un fallo de persistencia */
          }
        }
        controller.close();
      }
    },
  });

  const headers: Record<string, string> = {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store",
  };
  if (conversationId) headers["x-conversation-id"] = conversationId;
  return new Response(stream, { headers });
}
