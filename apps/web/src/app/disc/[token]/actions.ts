"use server";

import { createServerClient } from "@/lib/supabase/server";
import { computeDisc, DISC_PROFILES_FULL, type DiscAnswer } from "@/lib/disc-evaluator";
import { generateDiscNarrative } from "@/lib/ai-report";
import type { Json } from "@/types/database";

export type SubmitDiscInput = {
  token: string;
  fullName: string;
  cargo: string;
  email: string;
  answers: DiscAnswer[];
};

export type SubmitDiscResult =
  | {
      ok: true;
      raw: ReturnType<typeof computeDisc>["raw"];
      segments: ReturnType<typeof computeDisc>["segments"];
      profileKey: string;
      letters: string;
      narrative: string | null;
    }
  | { ok: false; error: string };

// El scoring se calcula en el servidor (fuente única: disc-evaluator) y se
// persiste vía RPC SECURITY DEFINER. El token secreto autoriza la escritura.
export async function submitDisc(input: SubmitDiscInput): Promise<SubmitDiscResult> {
  if (!input.token) return { ok: false, error: "token_faltante" };
  if (!Array.isArray(input.answers) || input.answers.length === 0) {
    return { ok: false, error: "respuestas_incompletas" };
  }

  const result = computeDisc(input.answers);
  const profile = DISC_PROFILES_FULL[result.profileKey];

  // Síntesis con IA (una sola vez, cacheada en DB). Gateada: si no hay clave
  // o falla, devuelve null y el informe usa solo el núcleo estático.
  const narrative = await generateDiscNarrative({
    fullName: input.fullName || null,
    cargo: input.cargo || null,
    profileKey: result.profileKey,
    letters: result.letters,
    raw: result.raw,
    segments: result.segments,
  });

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("submit_disc", {
    p_token: input.token,
    p_full_name: input.fullName || null,
    p_cargo: input.cargo || null,
    p_email: input.email || null,
    p_answers: input.answers as unknown as Json,
    p_raw: result.raw as unknown as Json,
    p_segments: result.segments as unknown as Json,
    p_profile_key: result.profileKey,
    p_letters: result.letters,
    p_disc_name: profile?.name ?? null,
    p_disc_icon: profile?.icon ?? null,
    p_narrative: narrative,
  });

  if (error) return { ok: false, error: error.message };

  const res = (data ?? {}) as { ok?: boolean; error?: string };
  if (res.ok === false) return { ok: false, error: res.error ?? "error_desconocido" };

  return {
    ok: true,
    raw: result.raw,
    segments: result.segments,
    profileKey: result.profileKey,
    letters: result.letters,
    narrative,
  };
}
