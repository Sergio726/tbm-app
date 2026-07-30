import { LOS_LEVELS } from "@/lib/disc";

/**
 * Insignia del nivel de delegación (S22 · §J1).
 *
 * Dilio: *"que él pueda entrar y tener la insignia de cadete, de investigador"*.
 * Antes el nivel solo existía dentro de `/equipo`, "al final del método" — la
 * persona no sabía en qué nivel estaba sin ir a buscarlo.
 *
 * Los nombres salen de `LOS_LEVELS` (`lib/disc.ts`), fuente única:
 * N1 Cadete · N2 Investigador · N3 Recomendador · N4 Ejecutor · N5 Socio.
 * No hardcodear etiquetas acá.
 */

/** Frío (recién delega) → cálido (autónomo). Índice = nivel - 1. */
const LEVEL_COLOR = ["#94a3b8", "#5b8aff", "#a78bfa", "#fbbf24", "#34d399"] as const;

export function losLevelName(level: number | null | undefined): string | null {
  const def = LOS_LEVELS.find((l) => l.level === level);
  return def?.name ?? null;
}

export function losLevelColor(level: number | null | undefined): string {
  const i = (level ?? 1) - 1;
  return LEVEL_COLOR[i] ?? LEVEL_COLOR[0];
}

export function LosBadge({
  level,
  size = "md",
  showLevelNumber = true,
  className = "",
}: {
  level: number | null | undefined;
  size?: "sm" | "md";
  /** `false` muestra solo el nombre (útil donde el espacio es mínimo). */
  showLevelNumber?: boolean;
  className?: string;
}) {
  const name = losLevelName(level);
  if (!name) return null; // sin nivel cargado → no inventamos "Cadete"

  const color = losLevelColor(level);
  const sm = size === "sm";

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full font-semibold ${className}`}
      style={{
        padding: sm ? "1px 6px" : "2px 8px",
        fontSize: sm ? 9.5 : 10.5,
        lineHeight: 1.5,
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 32%, transparent)`,
      }}
      title={`Nivel de delegación ${level} · ${name}`}
    >
      {showLevelNumber && <span style={{ opacity: 0.75 }}>N{level}</span>}
      {name}
    </span>
  );
}
