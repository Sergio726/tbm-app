/**
 * Helpers de fechas para Rituales TBM.
 * Todo en zona "America/Bogota" por default (configurable por empresa).
 */

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().split("T")[0];
}

/**
 * Día de la semana en formato ISO (1=lunes, 7=domingo).
 */
export function isoDayOfWeek(d: Date = new Date()): number {
  const wd = d.getDay(); // 0=domingo
  return wd === 0 ? 7 : wd;
}

/**
 * Lunes (00:00) de la semana ISO que contiene la fecha dada.
 */
export function isoMonday(d: Date = new Date()): Date {
  const day = isoDayOfWeek(d);
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - (day - 1));
  return monday;
}

/**
 * Domingo (23:59:59.999) de la semana ISO.
 */
export function isoSunday(d: Date = new Date()): Date {
  const monday = isoMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Viernes (23:59:59.999) de la semana ISO.
 */
export function isoFriday(d: Date = new Date()): Date {
  const monday = isoMonday(d);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return friday;
}

/**
 * ¿Las dos fechas están en la misma semana ISO?
 */
export function inSameIsoWeek(a: Date, b: Date): boolean {
  return isoMonday(a).getTime() === isoMonday(b).getTime();
}

/**
 * Día de mañana en ISO (YYYY-MM-DD). Útil para Los 5 Grandes.
 */
export function isoTomorrow(now: Date = new Date()): string {
  const t = new Date(now);
  t.setDate(now.getDate() + 1);
  return isoDate(t);
}

/**
 * Etiqueta humana para fecha en es-AR.
 */
export function humanDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
