/**
 * KPIs en cascada (S25 · §E1) — de la Roca del trimestre a la actividad diaria.
 *
 * Dilio (Meet 2026-07-25): *"cuando tú estableces los cinco grandes estratégicos,
 * el sistema tiene que **obligar** a que la persona describa claramente a cada
 * implicado cuáles son los indicadores con los que él aportaría al tema general"*.
 *
 * Su ejemplo, que es el caso de prueba del sprint:
 *   15 clientes en Q1 ($75.000) → Sebastián 9 · Dilio 6 → llamadas y propuestas.
 *
 * **Dos reglas de diseño que vienen de aclaraciones explícitas de Sebas:**
 *
 * 1. **El anclaje es la Roca del TRIMESTRE** (`PENDIENTES_REVISION` §6). El
 *    "5 clientes mensuales" de Dilio es la *cadencia* de una meta trimestral
 *    (3×5 = 15), no un nivel aparte del modelo.
 *
 * 2. **La cadencia es una referencia, no una cuota.** *"Se puede dar que el primer
 *    mes no llegue a los 5, que el segundo tampoco y tal vez el último sí lo
 *    logre… pero debe saber qué está haciendo o no está haciendo para lograr el
 *    objetivo"*. O sea: `2+4+9 = 15` cierra igual. Por eso acá **no hay ningún
 *    cálculo de "cumplió el mes"** — sería el *retrovisor* que el método critica.
 *    El ritmo solo responde *"¿voy bien para llegar?"*.
 *
 * Módulo **puro**: sin Supabase, sin red, sin `Date.now()` implícito.
 */

import { daysBetweenIso, quarterEnd, quarterStart } from "./quarters";

// ── Reparto ─────────────────────────────────────────────────────────────────

export type Contribution = {
  ownerId: string;
  ownerName?: string | null;
  /** Aporte comprometido para TODO el trimestre. */
  targetValue: number;
};

export type SplitCheck = {
  /** Suma de los aportes. */
  assigned: number;
  /** Meta de la Roca. */
  target: number;
  /** `target - assigned`. Positivo = falta repartir; negativo = sobreasignado. */
  gap: number;
  status: "exact" | "under" | "over" | "no_target";
};

/**
 * Contrasta el reparto contra la meta. Es el "obligar" de Dilio en su versión
 * honesta: acá no hay juicio de un modelo, hay aritmética — si la meta son 15 y
 * los aportes suman 14, el sistema lo dice.
 *
 * Se compara con tolerancia porque los montos son `numeric` y pueden traer
 * decimales de redondeo.
 */
export function checkSplit(target: number | null | undefined, contributions: Contribution[]): SplitCheck {
  const assigned = contributions.reduce((sum, c) => sum + (Number(c.targetValue) || 0), 0);

  if (target == null || !Number.isFinite(target) || target <= 0) {
    return { assigned, target: 0, gap: 0, status: "no_target" };
  }

  const gap = round2(target - assigned);
  const status: SplitCheck["status"] =
    Math.abs(gap) < 0.01 ? "exact" : gap > 0 ? "under" : "over";

  return { assigned: round2(assigned), target: round2(target), gap, status };
}

/** Mensaje para la UI. Vacío cuando el reparto cierra (no hay nada que decir). */
export function splitMessage(check: SplitCheck, unit?: string | null): string {
  const u = unit?.trim() ? ` ${unit.trim()}` : "";
  switch (check.status) {
    case "no_target":
      return "Definí la meta de la Roca para poder repartirla entre responsables.";
    case "under":
      return `Falta repartir ${fmt(check.gap)}${u} de ${fmt(check.target)}${u}.`;
    case "over":
      return `El reparto supera la meta en ${fmt(Math.abs(check.gap))}${u}.`;
    case "exact":
      return "";
  }
}

// ── Cadencia (derivada, NO almacenada) ──────────────────────────────────────

export type Pace = {
  /** Meses que abarca el trimestre. Siempre 3, pero se calcula por claridad. */
  months: number;
  /** Ritmo mensual de referencia: total / meses. */
  perMonth: number;
  /** Ritmo semanal de referencia (el trimestre ≈ 13 semanas). */
  perWeek: number;
};

/** Semanas de un trimestre — aproximación estable para expresar ritmo. */
const WEEKS_PER_QUARTER = 13;

/**
 * Traduce un total trimestral al ritmo con el que Dilio lo enuncia ("5 clientes
 * mensuales"). Es **derivado a propósito**: guardar la cuota mensual invitaría a
 * evaluar mes por mes, que es justo lo que no queremos.
 */
export function derivePace(totalForQuarter: number): Pace {
  const total = Number(totalForQuarter) || 0;
  return {
    months: 3,
    perMonth: round2(total / 3),
    perWeek: round2(total / WEEKS_PER_QUARTER),
  };
}

// ── Progreso: "¿voy bien para llegar?" ──────────────────────────────────────

export type PaceStatus = "ahead" | "on_track" | "behind" | "at_risk" | "done";

export type Progress = {
  /** 0-100, acotado. */
  percent: number;
  /** Cuánto falta para la meta (0 si ya llegó). */
  remaining: number;
  /** Días que quedan del trimestre (0 si ya cerró). */
  daysLeft: number;
  /** Ritmo semanal necesario de acá en adelante para llegar. */
  requiredPerWeek: number;
  status: PaceStatus;
};

/**
 * Progreso acumulado contra la meta del TRIMESTRE, con el ritmo que haría falta
 * de acá en adelante.
 *
 * **No evalúa meses.** Un mes flojo no produce ningún veredicto: lo único que
 * importa es si el acumulado y el tiempo restante permiten llegar. Es la misma
 * idea de "parabrisas" de §E4, aplicada al trimestre.
 *
 * `todayIso` se pasa explícito (no `Date.now()`) para que esto sea testeable.
 */
export function computeProgress(
  target: number,
  current: number,
  todayIso: string
): Progress {
  const t = Number(target) || 0;
  const c = Math.max(0, Number(current) || 0);

  const qEnd = quarterEnd(todayIso);
  const qStart = quarterStart(todayIso);
  const totalDays = daysBetweenIso(qStart, qEnd) + 1;
  const daysLeft = Math.max(0, daysBetweenIso(todayIso, qEnd));

  if (t <= 0) {
    return { percent: 0, remaining: 0, daysLeft, requiredPerWeek: 0, status: "on_track" };
  }

  const percent = Math.min(100, Math.max(0, round2((c / t) * 100)));
  const remaining = Math.max(0, round2(t - c));

  if (remaining === 0) {
    return { percent: 100, remaining: 0, daysLeft, requiredPerWeek: 0, status: "done" };
  }

  // Ritmo necesario de acá al cierre. Sin días restantes, es inalcanzable.
  const weeksLeft = daysLeft / 7;
  const requiredPerWeek = weeksLeft > 0 ? round2(remaining / weeksLeft) : Infinity;

  // Se compara el avance con el tiempo TRANSCURRIDO, no con el mes en curso.
  const elapsedDays = totalDays - daysLeft;
  const expectedPercent = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

  let status: PaceStatus;
  if (daysLeft === 0) status = "at_risk"; // se terminó el trimestre y no llegó
  else if (percent >= expectedPercent + 10) status = "ahead";
  else if (percent >= expectedPercent - 10) status = "on_track";
  else if (percent >= expectedPercent - 30) status = "behind";
  else status = "at_risk";

  return { percent, remaining, daysLeft, requiredPerWeek, status };
}

export const PACE_LABEL: Record<PaceStatus, string> = {
  done: "Logrado",
  ahead: "Adelantado",
  on_track: "En ritmo",
  behind: "Atrasado",
  at_risk: "En riesgo",
};

export const PACE_COLOR: Record<PaceStatus, string> = {
  done: "var(--success-text)",
  ahead: "var(--success-text)",
  on_track: "var(--accent-text)",
  behind: "var(--warn-text)",
  at_risk: "var(--danger-text)",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formato corto: sin decimales si es entero (15, no 15.00). */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
