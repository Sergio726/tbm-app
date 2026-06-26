import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, type ChatMessage, type ProviderId } from "@/lib/ai";
import { buildJarvisContext } from "@/lib/jarvis-context";
import { retrieveKnowledge } from "@/lib/jarvis-retrieval";
import { TBM_METHOD_FRAMING } from "@/lib/tbm-disc-context";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_SYSTEM =
  "Sos DC, el asistente del método The Business Multiplier (TBM) de Dilio Donado. Ayudás a " +
  "líderes a multiplicar su negocio con el talento correcto en el sistema correcto. Respondés en " +
  "español rioplatense (voseo), claro y concreto, con la voz del método (LOST, ARQI, delegación, " +
  "DISC). No inventás datos del equipo o la empresa: usás solo el contexto provisto.";

// Reglas de comportamiento — se inyectan SIEMPRE (incluso si el admin guardó un system prompt propio).
const BEHAVIOR_RULES = [
  "Tu nombre es DC (siempre en mayúsculas). Si te preguntan cómo te llamás, sos DC.",
  "REGLAS DE COMPORTAMIENTO (obligatorias):",
  "1. BREVEDAD: respondé corto y al grano (2 a 4 frases). NO hagas respuestas largas ni listados extensos salvo que el usuario lo pida explícitamente.",
  "2. CIERRE CON PREGUNTA: terminá SIEMPRE con UNA sola pregunta breve para entender mejor qué necesita y seguir la conversación (ej.: '¿Querés que lo veamos con tu equipo?').",
  "3. SOLO TU DOMINIO: respondé únicamente sobre el método TBM, liderazgo, gestión y diseño de equipos, delegación, DISC, productividad del líder y el negocio del usuario. Si te preguntan algo fuera de eso (recetas, deportes, entretenimiento, trivia, temas personales no laborales), NO lo respondas: decliná con amabilidad y reencauzá. Ej.: 'Eso se sale de lo mío 🙂. Estoy para ayudarte a multiplicar tu negocio y tu equipo. ¿En qué te doy una mano hoy?'",
].join("\n");

/** Chat de JARVIS en streaming (S18.3). Devuelve texto plano token a token. */
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
    .select("enabled, provider, model, system_prompt, temperature")
    .eq("scope", "platform")
    .maybeSingle();
  if (!cfg || !cfg.enabled) return NextResponse.json({ error: "disabled" }, { status: 503 });

  const adapter = getProvider(cfg.provider as ProviderId);
  if (!adapter?.chatStream) {
    return NextResponse.json({ error: "provider_no_implementado" }, { status: 503 });
  }

  const { data: key } = await admin.rpc("ai_get_api_key");
  if (!key) return NextResponse.json({ error: "sin_config" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    messages?: ChatMessage[];
    module?: string;
  };
  const history = Array.isArray(body.messages) ? body.messages : [];
  // DC-1: pantalla actual del usuario (context-aware). Sanitizada y acotada.
  const moduleLabel =
    typeof body.module === "string" ? body.module.slice(0, 80).trim() : "";

  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const [context, knowledge] = await Promise.all([
    buildJarvisContext(user.id),
    retrieveKnowledge(lastUser),
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
    cfg.system_prompt?.trim() || DEFAULT_SYSTEM,
    "",
    BEHAVIOR_RULES,
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
