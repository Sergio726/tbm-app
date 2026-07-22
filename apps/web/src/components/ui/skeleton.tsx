import type { CSSProperties } from "react";

/**
 * Primitivas de skeleton para estados de carga (pulido pre-beta).
 * Server-safe. El barrido vive en `.tbm-skeleton` de `globals.css`
 * (respeta `prefers-reduced-motion`). Usa tokens del design system.
 */
export function Skeleton({
  width,
  height = 14,
  radius = 8,
  className = "",
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`tbm-skeleton block ${className}`}
      style={{
        width: width ?? "100%",
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

/**
 * Card genérica de carga: título + un par de líneas. Imita la altura
 * aproximada de las cards reales para evitar salto de layout.
 */
export function SkeletonCard({
  lines = 3,
  className = "",
  style,
}: {
  lines?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        padding: 18,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        ...style,
      }}
    >
      <Skeleton width="55%" height={16} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "70%" : "100%"} height={11} />
      ))}
    </div>
  );
}

/**
 * Esqueleto de página completa para los `loading.tsx` de rutas pesadas.
 * Replica el wrapper padded común (`clamp` + maxWidth) + un encabezado y una
 * grilla de cards, para que la transición no salte el layout.
 */
export function PageSkeleton({
  cards = 4,
  lines = 3,
  minColWidth = 220,
  maxWidth = 1500,
}: {
  cards?: number;
  lines?: number;
  minColWidth?: number;
  maxWidth?: number;
}) {
  return (
    <div
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        <Skeleton width={220} height={24} />
        <Skeleton width={320} height={13} />
      </div>
      <SkeletonGrid count={cards} lines={lines} minColWidth={minColWidth} />
    </div>
  );
}

/** Fila de carga (para listas / tablas). */
export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: 12, padding: "12px 0" }}
    >
      <Skeleton width={38} height={38} radius={10} />
      <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="65%" height={10} />
      </div>
    </div>
  );
}

/**
 * Grilla de cards de carga — el patrón más común (dashboard, workbooks,
 * plan-90d). `count` cards en una grilla responsive.
 */
export function SkeletonGrid({
  count = 4,
  minColWidth = 220,
  lines = 3,
}: {
  count?: number;
  minColWidth?: number;
  lines?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${minColWidth}px, 100%), 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}
