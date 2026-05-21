import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura (shadcn/ui utility)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como porcentaje con semáforo TBM
 */
export function formatPct(actual: number, meta: number): string {
  if (meta === 0) return "–";
  return `${Math.round((actual / meta) * 100)}%`;
}

/**
 * Retorna la clase CSS del semáforo según el % de la meta
 */
export function semaforoClass(actual: number, meta: number): string {
  if (meta === 0) return "text-tbm-text-muted";
  const pct = (actual / meta) * 100;
  if (pct >= 100) return "text-tbm-green";
  if (pct >= 85) return "text-tbm-yellow";
  return "text-tbm-red";
}

/**
 * Retorna el emoji del semáforo
 */
export function semaforoEmoji(actual: number, meta: number): string {
  if (meta === 0) return "–";
  const pct = (actual / meta) * 100;
  if (pct >= 100) return "🟢";
  if (pct >= 85) return "🟡";
  return "🔴";
}

/**
 * Initials desde full name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
