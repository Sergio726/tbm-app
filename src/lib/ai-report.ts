// =============================================================
// DISC — Síntesis narrativa con IA (server-only)
// Genera UNA síntesis personalizada del informe a partir del contenido
// canónico + los puntajes. Gateado por ANTHROPIC_API_KEY: si falta o la
// llamada falla, devuelve null y el informe usa solo el núcleo estático.
// Se llama una sola vez (al enviar el test) y el texto se cachea en DB.
// =============================================================

import { DISC_PROFILES_FULL, type DiscScores, type DiscSegments } from "./disc-evaluator";
import { DISC_FACTORS, primaryLetter, type DiscLetter } from "./disc";

export type DiscNarrativeInput = {
  fullName: string | null;
  cargo: string | null;
  profileKey: string;
  letters: string;
  raw: DiscScores;
  segments: DiscSegments;
};

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5";

export async function generateDiscNarrative(input: DiscNarrativeInput): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null; // sin clave → solo núcleo estático

  const profile = DISC_PROFILES_FULL[input.profileKey];
  if (!profile) return null;

  const primary = primaryLetter(input.letters) as DiscLetter | null;
  const factor = primary ? DISC_FACTORS[primary] : null;

  // Material canónico que el modelo DEBE respetar (no inventar rasgos nuevos).
  const canon = {
    nombre: input.fullName ?? "la persona",
    cargo: input.cargo ?? null,
    perfil: profile.name,
    letras: input.letters,
    puntajes: input.raw,
    segmentos: input.segments,
    descripcion: profile.desc,
    rasgos: profile.tags,
    aporta: profile.valor,
    cuida: profile.abusa,
    bajo_presion: profile.bajo_presion,
    teme: profile.teme,
    mas_eficaz: profile.mas_eficaz,
    luz: factor?.luz ?? [],
    sombra: factor?.sombra ?? [],
  };

  const system = [
    "Sos un coach de liderazgo del método The Business Multiplier (TBM) de Dilio Donado.",
    "Escribís síntesis DISC personalizadas, cálidas y profesionales, en español neutro con voseo rioplatense, dirigidas a la persona evaluada (segunda persona, 'vos').",
    "",
    "REGLAS ESTRICTAS:",
    "1) Usá EXCLUSIVAMENTE la información canónica provista (perfil, factor, puntajes). No inventes rasgos, anécdotas, datos ni diagnósticos nuevos.",
    "2) Sintetizá e integrá; NO copies frases literales del material ni lo enumeres. Que suene a una persona escribiéndole a otra, no a un informe técnico.",
    "3) El DISC describe estilos de comportamiento: NUNCA lo presentes como medida de inteligencia, capacidad o valor de la persona. No hay perfiles buenos ni malos.",
    "4) Tono motivador, respetuoso y concreto; nada de clichés de autoayuda ni adulación vacía.",
  ].join("\n");

  const prompt = [
    "Escribí una síntesis personalizada del perfil DISC de esta persona, en prosa fluida (sin títulos, sin viñetas, sin emojis), de 2 a 3 párrafos y ~160–200 palabras en total.",
    "",
    "Seguí este hilo, integrándolo con naturalidad:",
    "1. Abrí describiendo su estilo dominante combinando su letra primaria y secundaria (cómo tiende a operar).",
    "2. Lo que aporta a un equipo desde ese estilo.",
    "3. Un punto a cuidar (su sombra) planteado como oportunidad, no como defecto.",
    "4. Un cierre alentador orientado a su crecimiento (su 'PRIME').",
    "",
    "Si hay nombre, podés dirigirte a la persona por su nombre una vez. Devolvé SOLO la síntesis, sin preámbulos ni comentarios.",
    "",
    "INFORMACIÓN CANÓNICA (JSON):",
    JSON.stringify(canon, null, 2),
  ].join("\n");

  // Temperatura configurable (default 0.6). Acotada a [0, 1].
  const tempRaw = Number.parseFloat(process.env.DISC_AI_TEMPERATURE ?? "");
  const temperature = Number.isFinite(tempRaw) ? Math.min(1, Math.max(0, tempRaw)) : 0.6;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.DISC_AI_MODEL || DEFAULT_MODEL,
        max_tokens: 700,
        temperature,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("ai-report: Anthropic respondió", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content
      ?.filter((b) => b.type === "text" && b.text)
      .map((b) => b.text!.trim())
      .join("\n\n")
      .trim();

    return text && text.length > 0 ? text : null;
  } catch (e) {
    console.error("ai-report: error generando narrativa", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
