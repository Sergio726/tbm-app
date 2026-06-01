import type { Profile } from "@/types/database";

export const FONT = "Inter, system-ui, sans-serif";

// Campos editables del perfil en este módulo
export type Draft = {
  cargo: string;
  disc_letters: string;
  disc_state: string;
  disc_temor: string;
  disc_prime_plan: string;
  los_level: number;
  los_target: number | null;
  alignment: string | null;
  kpi_name: string;
  kpi_weekly_target: number | null;
};

export function draftFrom(p: Profile): Draft {
  return {
    cargo: p.cargo ?? "",
    disc_letters: p.disc_letters ?? "",
    disc_state: p.disc_state ?? "luz",
    disc_temor: p.disc_temor ?? "",
    disc_prime_plan: p.disc_prime_plan ?? "",
    los_level: p.los_level ?? 1,
    los_target: p.los_target ?? null,
    alignment: p.alignment ?? null,
    kpi_name: p.kpi_name ?? "",
    kpi_weekly_target: p.kpi_weekly_target ?? null,
  };
}

export function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type DiscAssessmentLite = {
  id: string;
  token: string;
  profile_id: string | null;
  status: string;
  completed_at: string | null;
};

// Forma de disc_scores guardado: { raw, segments }, cada uno { D, I, S, C }
export type DiscScoresShape = {
  raw?: { D?: number; I?: number; S?: number; C?: number };
  segments?: { D?: number; I?: number; S?: number; C?: number };
} | null;

// Devuelve porcentajes (0-100) por letra, derivados de segments (1-7) si existen,
// si no de raw (-28..+28). Retorna null si no hay scores válidos.
export function scoresToPct(
  scores: DiscScoresShape
): { D: number; I: number; S: number; C: number } | null {
  if (!scores) return null;
  const seg = scores.segments;
  if (seg && [seg.D, seg.I, seg.S, seg.C].every((v) => typeof v === "number")) {
    return {
      D: Math.round(((seg.D! - 1) / 6) * 100),
      I: Math.round(((seg.I! - 1) / 6) * 100),
      S: Math.round(((seg.S! - 1) / 6) * 100),
      C: Math.round(((seg.C! - 1) / 6) * 100),
    };
  }
  const raw = scores.raw;
  if (raw && [raw.D, raw.I, raw.S, raw.C].every((v) => typeof v === "number")) {
    const norm = (v: number) =>
      Math.max(0, Math.min(100, Math.round(((v + 28) / 56) * 100)));
    return { D: norm(raw.D!), I: norm(raw.I!), S: norm(raw.S!), C: norm(raw.C!) };
  }
  return null;
}

// Checklist de la sticky completion bar.
// Los 3 objetivos exigidos para considerar la ficha "completa".
export type ChecklistItem = {
  key: "disc" | "los" | "kpi";
  label: string;
  done: boolean;
};

export function buildChecklist(draft: Draft): ChecklistItem[] {
  return [
    {
      key: "disc",
      label: "Letras DISC cargadas",
      done: draft.disc_letters.trim().length > 0,
    },
    {
      key: "los",
      label: "Nivel LOS y meta",
      done: !!draft.los_level && !!draft.los_target,
    },
    {
      key: "kpi",
      label: "KPI principal definido",
      done:
        draft.kpi_name.trim().length > 0 &&
        draft.kpi_weekly_target != null &&
        draft.kpi_weekly_target > 0,
    },
  ];
}
