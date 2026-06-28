import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Estado vacío con guía de "primera acción" (pulido pre-beta #2).
 * Server-safe. Pasá `cta` (link) y/o `action` (un nodo propio, ej. botón client).
 */
export function EmptyState({
  icon,
  title,
  hint,
  cta,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: ReactNode;
  cta?: { label: string; href: string };
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ gap: 10, padding: "44px 24px" }}
    >
      {icon ? <div style={{ color: "var(--fg-subtle)", marginBottom: 2 }}>{icon}</div> : null}
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg)" }}>{title}</div>
      {hint ? (
        <div style={{ fontSize: 13.5, color: "var(--fg-subtle)", maxWidth: 420, lineHeight: 1.55 }}>
          {hint}
        </div>
      ) : null}
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center transition-all"
          style={{
            marginTop: 8,
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(180deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "0 6px 18px rgba(54,114,255,0.3)",
          }}
        >
          {cta.label}
        </Link>
      ) : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
