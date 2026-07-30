import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, type ProviderId } from "@/lib/ai";
import { proactiveEnabled } from "@/lib/dc-persona";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseReviewResponse,
  reviewCacheKey,
  shouldReview,
  REVIEW_KINDS,
  type ReviewKind,
  type ReviewRequest,
} from "@/lib/dc-review";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * DC proactivo (S24 · §G1/§B1) — evalúa un campo de formulario y devuelve, si hace
 * falta, una intervención con reescritura sugerida.
 *
 * Toda la lógica de juicio vive en `lib/dc-review.ts` (puro y testeado). Acá está
 * solo la infra: sesión, config, gating, límites y la llamada al proveedor.
 *
 * **Reglas de gasto** — esto se dispara desde un formulario, no desde un chat, así
 * que el volumen potencial es mucho mayor que el de DC:
 *  · flag `features.proactive` en OFF por default → ni una llamada al modelo;
 *  · umbral de longitud (`shouldReview`) revalidado en servidor;
 *  · rate limit PROPIO, separado del chat: el de DC son 50 msg/hora de
 *    conversación y un formulario los agotaría, dejando al usuario sin chat;
 *  · `maxTokens` chico y respuesta JSON, no prosa.
 *
 * **Nunca 500 al cliente por culpa de la IA.** Todo lo que no sea una review útil
 * responde `{ result: null }` con 200: la UI no muestra nada y el formulario sigue
 * andando. Un error visible en el módulo central de la app es peor que no ayudar.
 */

/** Techo por usuario/hora, propio del proactivo. Generoso: son llamadas chicas. */
const REVIEW_RATE_LIMIT = Number(process.env.DC_REVIEW_HOURLY_LIMIT ?? 120);

/** Mismo kill-switch global de gasto que usa el chat (T7). */
const DC_KILL_SWITCH = ["1", "true", "yes"].includes(
  (process.env.DC_KILL_SWITCH ?? "").toLowerCase()
);

/** Respuesta de "no hay nada que mostrar". Siempre 200: no es un error. */
function silent(reason: string) {
  return NextResponse.json({ result: null, reason }, { status: 200 });
}

function isReviewKind(v: unknown): v is ReviewKind {
  return typeof v === "string" && v in REVIEW_KINDS;
}

export async function POST(req: Request) {
  if (DC_KILL_SWITCH) return silent("kill_switch");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_sesion" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Partial<ReviewRequest>;
  if (!isReviewKind(body.kind)) return silent("kind_invalido");
  const value = typeof body.value === "string" ? body.value : "";

  // Revalidar el umbral server-side: el cliente ya filtra, pero no es confiable.
  if (!shouldReview(value)) return silent("texto_corto");

  const admin = createAdminClient();
  if (!admin) return silent("sin_config");

  const { data: cfg } = await admin
    .from("ai_config")
    .select("enabled, provider, model, temperature, features")
    .eq("scope", "platform")
    .maybeSingle();
  if (!cfg?.enabled) return silent("disabled");
  if (!proactiveEnabled(cfg.features)) return silent("proactive_off");

  const adapter = getProvider(cfg.provider as ProviderId);
  if (!adapter) return silent("provider_no_implementado");

  const { data: key } = await admin.rpc("ai_get_api_key");
  if (!key) return silent("sin_key");

  // Rate limit propio (no toca `ai_messages`, así que no consume la cuota del chat).
  //
  // FAIL-CLOSED a propósito: si la query falla —típicamente porque la migración
  // `migration_s24_dc_reviews.sql` no se aplicó todavía— NO se evalúa. Tratarlo
  // como "0 usos" dejaría el gasto sin techo, que es el riesgo dominante de este
  // sprint. Preferimos que el patrón no funcione antes que gastar sin control.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: rateErr } = await admin
    .from("ai_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if (rateErr) {
    console.error("dc/review: sin log de reviews (¿falta la migración S24?)", rateErr.message);
    return silent("sin_log");
  }
  if ((count ?? 0) >= REVIEW_RATE_LIMIT) return silent("rate_limit");

  const request: ReviewRequest = {
    kind: body.kind,
    value,
    context: typeof body.context === "object" && body.context ? body.context : undefined,
  };

  let raw = "";
  try {
    raw = await adapter.chat(
      {
        model: cfg.model,
        messages: [
          { role: "system", content: buildSystemPrompt(request.kind) },
          { role: "user", content: buildUserPrompt(request) },
        ],
        // Corto a propósito: la respuesta es un JSON de 2-3 campos.
        maxTokens: 320,
        // Baja: se busca un juicio consistente, no creatividad.
        temperature: 0.3,
      },
      key as string
    );
  } catch (e) {
    console.error("dc/review: fallo del proveedor", e);
    return silent("provider_error");
  }

  const result = parseReviewResponse(raw);

  // Registro: sirve para el rate limit de arriba y para medir el costo real del
  // patrón (que es el riesgo dominante de S24). No guarda el texto del usuario.
  const { data: me } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  await admin.from("ai_reviews").insert({
    user_id: user.id,
    company_id: me?.company_id ?? null,
    kind: request.kind,
    verdict: result?.verdict ?? null,
    cache_key: reviewCacheKey(request.kind, value),
    model: cfg.model,
    chars_in: value.length,
  });

  return NextResponse.json({ result }, { status: 200 });
}
