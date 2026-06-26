"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProvider, AIError, type ProviderId } from "@/lib/ai";

const DEFAULT_SYSTEM_PROMPT =
  "Sos DC, el asistente del método The Business Multiplier (TBM) de Dilio Donado. Ayudás a " +
  "líderes a multiplicar su negocio con el talento correcto en el sistema correcto. Respondés en " +
  "español rioplatense (voseo), claro y concreto, con la voz del método (LOST, ARQI, delegación, " +
  "DISC). No inventás datos del equipo o la empresa: usás solo el contexto provisto.";

// Defaults de la persona de DC (espejo de DC_DEFAULTS del web). Si el admin no toca
// nada, reproducen el comportamiento previo a DC-2.
const DEFAULT_PERSONA = {
  name: "DC",
  tone: "cercano",
  welcome:
    "Soy tu asistente del método TBM. Preguntame sobre tu equipo, delegación, DISC o cómo multiplicar tu negocio.",
  suggestions: [
    "¿A quién debería delegar según el DISC de mi equipo?",
    "Resumime en qué enfocarme esta semana.",
    "¿Cómo lidero mejor a un perfil Dominante?",
    "¿Qué es el sistema LOST?",
  ],
  features: { rag: true },
};

function parseSuggestions(v: unknown): string[] {
  if (!Array.isArray(v)) return [...DEFAULT_PERSONA.suggestions];
  const arr = v
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 6);
  return arr.length ? arr : [...DEFAULT_PERSONA.suggestions];
}

export type AiConfigView = {
  provider: ProviderId;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
  hasKey: boolean;
  personaName: string;
  tone: string;
  welcome: string;
  suggestedPrompts: string[];
  features: { rag: boolean };
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false, supabase };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  return { user, isAdmin: !!isAdmin, supabase };
}

export async function getAiConfig(): Promise<AiConfigView | null> {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) return null;
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("ai_config")
    .select(
      "provider, model, system_prompt, temperature, enabled, api_key_ref, persona_name, tone, welcome, suggested_prompts, features"
    )
    .eq("scope", "platform")
    .maybeSingle();

  if (!data) {
    return {
      provider: "openrouter",
      model: "anthropic/claude-3.5-haiku",
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: 0.7,
      enabled: false,
      hasKey: false,
      personaName: DEFAULT_PERSONA.name,
      tone: DEFAULT_PERSONA.tone,
      welcome: DEFAULT_PERSONA.welcome,
      suggestedPrompts: [...DEFAULT_PERSONA.suggestions],
      features: { ...DEFAULT_PERSONA.features },
    };
  }
  const rag = (data.features as { rag?: boolean } | null)?.rag !== false;
  return {
    provider: data.provider as ProviderId,
    model: data.model,
    systemPrompt: data.system_prompt ?? DEFAULT_SYSTEM_PROMPT,
    temperature: data.temperature,
    enabled: data.enabled,
    hasKey: !!data.api_key_ref,
    personaName: data.persona_name?.trim() || DEFAULT_PERSONA.name,
    tone: data.tone?.trim() || DEFAULT_PERSONA.tone,
    welcome: data.welcome?.trim() || DEFAULT_PERSONA.welcome,
    suggestedPrompts: parseSuggestions(data.suggested_prompts),
    features: { rag },
  };
}

export async function saveAiConfig(input: {
  provider: ProviderId;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
  apiKey?: string;
  personaName: string;
  tone: string;
  welcome: string;
  suggestedPrompts: string[];
  features: { rag: boolean };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return { ok: false, error: "no_sesion" };
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  // Guardar la key en Vault si vino una nueva.
  let apiKeyRef: string | undefined;
  if (input.apiKey && input.apiKey.trim()) {
    const { data: ref, error: keyErr } = await admin.rpc("ai_set_api_key", {
      p_secret: input.apiKey.trim(),
    });
    if (keyErr || !ref) return { ok: false, error: "vault_error" };
    apiKeyRef = ref;
  }

  const temperature = Math.min(1, Math.max(0, input.temperature));
  const tone = ["cercano", "formal", "directo"].includes(input.tone) ? input.tone : "cercano";
  const suggested = parseSuggestions(input.suggestedPrompts);
  const row = {
    provider: input.provider,
    model: input.model,
    system_prompt: input.systemPrompt.trim() || null,
    temperature,
    enabled: input.enabled,
    persona_name: input.personaName.trim() || null,
    tone,
    welcome: input.welcome.trim() || null,
    suggested_prompts: suggested,
    features: { rag: input.features.rag !== false },
    updated_by: user.id,
    updated_at: new Date().toISOString(),
    ...(apiKeyRef ? { api_key_ref: apiKeyRef } : {}),
  };

  const { data: existing } = await admin
    .from("ai_config")
    .select("id")
    .eq("scope", "platform")
    .maybeSingle();

  if (existing) {
    await admin.from("ai_config").update(row).eq("id", existing.id);
  } else {
    await admin.from("ai_config").insert({ scope: "platform", ...row });
  }

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "edit_ai_config",
    target_type: "ai_config",
    target_id: "platform",
    after: {
      provider: input.provider,
      model: input.model,
      enabled: input.enabled,
      key_updated: !!apiKeyRef,
      persona_name: row.persona_name,
      tone,
      rag: row.features.rag,
    },
  });

  revalidatePath("/asistente-ia");
  return { ok: true };
}

export async function testAiConnection(): Promise<
  { ok: true; reply: string } | { ok: false; error: string }
> {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return { ok: false, error: "no_sesion" };
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  const { data: cfg } = await admin
    .from("ai_config")
    .select("provider, model")
    .eq("scope", "platform")
    .maybeSingle();

  const provider = (cfg?.provider ?? "openrouter") as ProviderId;
  const model = cfg?.model ?? "anthropic/claude-3.5-haiku";

  const adapter = getProvider(provider);
  if (!adapter) return { ok: false, error: "provider_no_implementado" };

  const { data: key } = await admin.rpc("ai_get_api_key");
  if (!key) return { ok: false, error: "sin_key" };

  try {
    const reply = await adapter.chat(
      {
        model,
        maxTokens: 16,
        temperature: 0,
        messages: [
          { role: "system", content: "Respondé únicamente la palabra: ok" },
          { role: "user", content: "ping" },
        ],
      },
      key
    );
    return { ok: true, reply: reply.slice(0, 120) };
  } catch (e) {
    const status = e instanceof AIError ? e.status : 0;
    if (status === 401) return { ok: false, error: "key_invalida" };
    return { ok: false, error: "fallo_conexion" };
  }
}
