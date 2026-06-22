// Kit de UI del panel admin. Componentes server-safe (sin estado).
import type { CSSProperties, ReactNode } from "react";

const TONES = {
  ok: { color: "var(--ok)", bg: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.35)" },
  warn: { color: "var(--warn)", bg: "rgba(251,191,36,0.14)", border: "rgba(251,191,36,0.35)" },
  bad: { color: "var(--bad)", bg: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.35)" },
  accent: { color: "#9bb8ff", bg: "var(--accent-soft)", border: "rgba(91,138,255,0.4)" },
  muted: { color: "var(--muted)", bg: "rgba(255,255,255,0.05)", border: "var(--border)" },
} as const;

export type Tone = keyof typeof TONES;

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      {back}
      <div className="flex items-center justify-between" style={{ gap: 16, marginTop: back ? 10 : 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{title}</h1>
          {subtitle ? (
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center" style={{ gap: 10 }}>{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`adm-card ${className ?? ""}`} style={{ padding: 18, ...style }}>
      {children}
    </div>
  );
}

export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        padding: "3px 9px",
        borderRadius: 999,
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "accent",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="adm-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--muted)" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: TONES[tone].color }}>{value}</div>
      {hint ? <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>{hint}</div> : null}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "#9bb8ff",
        marginBottom: 10,
      }}
    >
      {children}
    </h2>
  );
}
