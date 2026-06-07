export function daysLeft(endDate: string): number {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function daysSince(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const diff = Date.now() - start.getTime();
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

export function semaforo(
  current: number | null,
  target: number
): "verde" | "amarillo" | "rojo" {
  if (current === null || target === 0) return "rojo";
  const pct = (current / target) * 100;
  if (pct >= 100) return "verde";
  if (pct >= 90) return "amarillo";
  return "rojo";
}

export function rockProgressColor(progress: number): string {
  if (progress >= 80) return "#34d399";
  if (progress >= 50) return "#fbbf24";
  return "#f87171";
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export const SEMAFORO_COLORS = {
  verde: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
  amarillo: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
  rojo: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
} as const;
