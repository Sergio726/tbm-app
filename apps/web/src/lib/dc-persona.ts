// DC-2 · Persona de DC — defaults centralizados + lectura de los campos públicos.
// Server-only: usa createAdminClient (service-role) para leer ai_config (RLS lo
// bloquea a anon/authenticated). Los campos SENSIBLES (system_prompt, key) NUNCA
// salen por acá: solo los seguros para el cliente (nombre, bienvenida, chips).

import { createAdminClient } from "@/lib/supabase/admin";

export type DcTone = "cercano" | "formal" | "directo";

/** Defaults — reproducen el comportamiento previo a DC-2 si nada está configurado. */
export const DC_DEFAULTS = {
  name: "DC",
  tone: "cercano" as DcTone,
  welcome:
    "Soy tu asistente del método TBM. Preguntame sobre tu equipo, delegación, DISC o cómo multiplicar tu negocio.",
  suggestions: [
    "¿A quién debería delegar según el DISC de mi equipo?",
    "Resumime en qué enfocarme esta semana.",
    "¿Cómo lidero mejor a un perfil Dominante?",
    "¿Qué es el sistema LOST?",
  ],
  features: { rag: true },
} as const;

/** Campos seguros para mandar al cliente (panel/launcher). */
export type DcPublicPersona = {
  name: string;
  welcome: string;
  suggestions: string[];
};

/** Línea de guía de tono inyectada al system prompt según la config. */
export function toneLine(tone: string | null | undefined): string {
  switch (tone) {
    case "formal":
      return "TONO: formal y profesional, registro serio y cuidado (manteniendo el voseo rioplatense).";
    case "directo":
      return "TONO: directo y sin vueltas. Andá al grano, sin rodeos ni adornos.";
    case "cercano":
    default:
      return "TONO: cercano y cálido, como un coach de confianza. Motivador, sin exagerar.";
  }
}

/** Parsea suggested_prompts (jsonb) a un array de strings acotado, con fallback. */
export function parseSuggestions(v: unknown): string[] {
  if (!Array.isArray(v)) return [...DC_DEFAULTS.suggestions];
  const arr = v
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
    .slice(0, 6);
  return arr.length ? arr : [...DC_DEFAULTS.suggestions];
}

/** ¿RAG activo? Default ON salvo que features.rag sea explícitamente false. */
export function ragEnabled(features: unknown): boolean {
  return (features as { rag?: boolean } | null)?.rag !== false;
}

/** ¿Acciones (tool use, DC-3) activas? Default OFF: solo si features.actions === true. */
export function actionsEnabled(features: unknown): boolean {
  return (features as { actions?: boolean } | null)?.actions === true;
}

/** Lee solo los campos públicos de la persona (para el layout → launcher/panel). */
export async function getDcPublicPersona(): Promise<DcPublicPersona> {
  const fallback: DcPublicPersona = {
    name: DC_DEFAULTS.name,
    welcome: DC_DEFAULTS.welcome,
    suggestions: [...DC_DEFAULTS.suggestions],
  };
  const admin = createAdminClient();
  if (!admin) return fallback;

  const { data } = await admin
    .from("ai_config")
    .select("persona_name, welcome, suggested_prompts")
    .eq("scope", "platform")
    .maybeSingle();

  if (!data) return fallback;
  return {
    name: data.persona_name?.trim() || DC_DEFAULTS.name,
    welcome: data.welcome?.trim() || DC_DEFAULTS.welcome,
    suggestions: parseSuggestions(data.suggested_prompts),
  };
}
