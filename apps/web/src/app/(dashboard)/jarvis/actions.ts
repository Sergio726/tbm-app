"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, AIError, type ChatMessage, type ProviderId } from "@/lib/ai";

const DEFAULT_SYSTEM =
  "Sos JARVIS, el asistente del método The Business Multiplier (TBM) de Dilio Donado. Ayudás a " +
  "líderes a multiplicar su negocio con el talento correcto en el sistema correcto. Respondés en " +
  "español rioplatense (voseo), claro y concreto, con la voz del método (LOST, ARQI, delegación, " +
  "DISC). No inventás datos del equipo o la empresa: usás solo el contexto provisto.";

export type JarvisResult = { ok: true; reply: string } | { ok: false; error: string };

/**
 * Chat de JARVIS (S18.2, no-streaming). Lee la config + la key (service-role),
 * arma un contexto TBM mínimo y llama al proveedor configurado.
 */
export async function sendJarvisMessage(history: ChatMessage[]): Promise<JarvisResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_config" };

  const { data: cfg } = await admin
    .from("ai_config")
    .select("enabled, provider, model, system_prompt, temperature")
    .eq("scope", "platform")
    .maybeSingle();
  if (!cfg || !cfg.enabled) return { ok: false, error: "disabled" };

  const adapter = getProvider(cfg.provider as ProviderId);
  if (!adapter) return { ok: false, error: "provider_no_implementado" };

  const { data: key } = await admin.rpc("ai_get_api_key");
  if (!key) return { ok: false, error: "sin_config" };

  // Contexto TBM mínimo (el rico —equipo/DISC/tareas— es S18.3).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, companies(name)")
    .eq("id", user.id)
    .single();
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "el usuario";
  const role = profile?.role ?? "colaborador";
  const companyName = (profile?.companies as { name: string } | null)?.name ?? "su empresa";

  const system = [
    cfg.system_prompt?.trim() || DEFAULT_SYSTEM,
    "",
    `Contexto del usuario — Nombre: ${firstName} · Rol: ${role} · Empresa: ${companyName}.`,
    "No inventes datos del equipo, tareas ni métricas que no estén en este contexto; si te faltan, pedilos o aclaralo.",
  ].join("\n");

  const trimmed = history.filter((m) => m.role !== "system").slice(-10);
  const messages: ChatMessage[] = [{ role: "system", content: system }, ...trimmed];

  try {
    const reply = await adapter.chat(
      { model: cfg.model, messages, maxTokens: 700, temperature: cfg.temperature ?? 0.7 },
      key
    );
    return { ok: true, reply: reply || "(sin respuesta)" };
  } catch (e) {
    const status = e instanceof AIError ? e.status : 0;
    if (status === 401) return { ok: false, error: "key_invalida" };
    return { ok: false, error: "fallo" };
  }
}
