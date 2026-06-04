import type { Profile } from "@/types/database";
import { DISC_DIMENSIONS, primaryLetter, segToPct, systemProfile } from "@/lib/disc";

export const FONT = "Inter, system-ui, sans-serif";
export const MONO = "JetBrains Mono, ui-monospace, monospace";

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

// Devuelve porcentajes 0-100 por letra (usa segments 1-7 si existen,
// si no raw -28..+28). Null si no hay scores reales.
export function scoresToPct(
  scores: DiscScoresShape
): { D: number; I: number; S: number; C: number } | null {
  if (!scores) return null;
  const seg = scores.segments;
  if (seg && [seg.D, seg.I, seg.S, seg.C].every((v) => typeof v === "number")) {
    return {
      D: segToPct(seg.D),
      I: segToPct(seg.I),
      S: segToPct(seg.S),
      C: segToPct(seg.C),
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

// Fallback sintético cuando no hay scores: enfasis por letra primaria/secundaria.
export function syntheticScoresFromLetters(letters: string): {
  D: number;
  I: number;
  S: number;
  C: number;
} {
  const norm = (letters || "").toUpperCase().replace(/[^DISC]/g, "").slice(0, 2);
  const primary = norm[0] as "D" | "I" | "S" | "C" | undefined;
  const secondary = norm[1] as "D" | "I" | "S" | "C" | undefined;
  const value = (k: "D" | "I" | "S" | "C") =>
    k === primary ? 96 : k === secondary ? 64 : 28;
  return { D: value("D"), I: value("I"), S: value("S"), C: value("C") };
}

export function effectiveScores(
  scores: DiscScoresShape,
  letters: string
): { D: number; I: number; S: number; C: number } {
  return scoresToPct(scores) ?? syntheticScoresFromLetters(letters);
}

// Checklist de la sticky completion bar (3 objetivos).
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
      done:
        draft.los_target != null &&
        draft.los_target >= draft.los_level &&
        draft.los_target > 0,
    },
    {
      key: "kpi",
      label: "KPI principal definido",
      done: draft.kpi_name.trim().length > 0,
    },
  ];
}

// Arquetipo por letras. Fuente ÚNICA: `DISC_SYSTEM_PROFILES` / `DISC_DIMENSIONS`
// de `@/lib/disc` (evita que el roster nombre los perfiles distinto que el informe).
export type Archetype = {
  letters: string;
  name: string;
  emoji: string;
  primary: "D" | "I" | "S" | "C";
  desc: string;
};

export function archetypeFor(rawLetters: string | null | undefined): Archetype {
  const letters = (rawLetters || "").toUpperCase().replace(/[^DISC]/g, "").slice(0, 2);
  const primary = primaryLetter(letters);
  const sys = systemProfile(letters);
  if (!primary || !sys) {
    return {
      letters: "",
      name: "Sin clasificar",
      emoji: "✦",
      primary: "D",
      desc: "Cargá las letras del informe DISC.",
    };
  }
  const dim = DISC_DIMENSIONS[primary];
  return {
    letters,
    name: sys.name,
    emoji: sys.icon,
    primary,
    desc: `Dominante: ${dim.name} — ${dim.plain}`,
  };
}
