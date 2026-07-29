/**
 * Trimestres del año calendario para el Plan 90D.
 *
 * Regla de Dilio (Meet 2026-07-25): *"si la persona empieza tarde, no puede poner
 * los sprints fuera del rango de los tres meses… nuestro año sprint casa con el
 * año calendario"*. Los trimestres son **fijos**: ene-mar · abr-jun · jul-sep ·
 * oct-dic. Quien arranca tarde **recorta** su ciclo; no lo extiende al trimestre
 * siguiente. Ver `docs/OBSERVACIONES_DILIO_2026-07.md` §F1.
 *
 * Todo opera sobre strings ISO `YYYY-MM-DD` con aritmética en **UTC**, a
 * propósito: `new Date("2026-08-20")` se parsea como medianoche UTC, y usar
 * después getters locales (`getDate()`, como hace `addDays` en `plan90d.ts`)
 * corre la fecha un día en zonas con offset negativo — que es la de todos los
 * usuarios de TBM (Argentina/Colombia). Módulo puro: sin Supabase, sin `Date.now()`
 * implícito, testeable al 100%.
 */

/** Último día de cada trimestre. Ninguno cae en febrero → sin caso bisiesto. */
const QUARTER_END: ReadonlyArray<{ month: number; day: number }> = [
  { month: 3, day: 31 }, // ene-mar
  { month: 6, day: 30 }, // abr-jun
  { month: 9, day: 30 }, // jul-sep
  { month: 12, day: 31 }, // oct-dic
];

const QUARTER_LABEL = ["ene-mar", "abr-jun", "jul-sep", "oct-dic"] as const;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

type Parts = { y: number; m: number; d: number }; // m: 1-12

/**
 * Parsea `YYYY-MM-DD` sin pasar por la zona horaria local. Si el string no tiene
 * ese formato, cae a los getters UTC de `Date` (tolera timestamps completos).
 */
function parts(iso: string): Parts {
  const m = ISO_RE.exec(iso);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    throw new RangeError(`Fecha inválida: ${iso}`);
  }
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

function toIso({ y, m, d }: Parts): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const DAY_MS = 86_400_000;

function toUtcMs({ y, m, d }: Parts): number {
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): Parts {
  const dt = new Date(ms);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** Índice de trimestre: 0 = ene-mar, 1 = abr-jun, 2 = jul-sep, 3 = oct-dic. */
export function quarterIndex(iso: string): number {
  return Math.floor((parts(iso).m - 1) / 3);
}

/** Etiqueta corta del trimestre que contiene la fecha (ej. `"jul-sep"`). */
export function quarterLabel(iso: string): string {
  return QUARTER_LABEL[quarterIndex(iso)];
}

/** Primer día del trimestre que contiene la fecha (ej. `"2026-07-01"`). */
export function quarterStart(iso: string): string {
  const { y } = parts(iso);
  return toIso({ y, m: quarterIndex(iso) * 3 + 1, d: 1 });
}

/** Último día del trimestre que contiene la fecha (ej. `"2026-09-30"`). */
export function quarterEnd(iso: string): string {
  const { y } = parts(iso);
  const end = QUARTER_END[quarterIndex(iso)];
  return toIso({ y, m: end.month, d: end.day });
}

/** Suma días a una fecha ISO, en UTC (no arrastra el offset local). */
export function addDaysIso(iso: string, days: number): string {
  return toIso(fromUtcMs(toUtcMs(parts(iso)) + days * DAY_MS));
}

/** Días calendario entre dos fechas ISO (`b - a`). Negativo si `b` es anterior. */
export function daysBetweenIso(a: string, b: string): number {
  return Math.round((toUtcMs(parts(b)) - toUtcMs(parts(a))) / DAY_MS);
}

/**
 * Fin de ciclo recortado al trimestre: `min(inicio + días, fin de trimestre)`.
 * Es el corazón de la regla — una roca que arranca el 20/08 termina el 30/09,
 * no el 18/11.
 */
export function clampToQuarterEnd(startIso: string, days = 90): string {
  const natural = addDaysIso(startIso, days);
  const limit = quarterEnd(startIso);
  return daysBetweenIso(natural, limit) < 0 ? limit : natural;
}

/** `true` si el ciclo natural (inicio + días) se pasa del trimestre y hay recorte. */
export function isClamped(startIso: string, days = 90): boolean {
  return daysBetweenIso(addDaysIso(startIso, days), quarterEnd(startIso)) < 0;
}

/**
 * Progreso dentro del trimestre calendario: `día` (1-based) sobre `total`.
 * Reemplaza al contador flotante que se anclaba a la roca activa más antigua.
 * `day` queda acotado a `[1, total]` para fechas fuera del trimestre en curso.
 */
export function quarterProgress(iso: string): {
  day: number;
  total: number;
  label: string;
} {
  const start = quarterStart(iso);
  const end = quarterEnd(iso);
  const total = daysBetweenIso(start, end) + 1;
  const raw = daysBetweenIso(start, iso) + 1;
  return {
    day: Math.min(Math.max(raw, 1), total),
    total,
    label: quarterLabel(iso),
  };
}
