"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { sendTeamInvite } from "@/app/(dashboard)/equipo/actions";
import { SCORECARD_AREAS, type ScorecardKey } from "@/types/database";
import {
  Sparkles,
  Check,
  ChevronLeft,
  ArrowRight,
  Building2,
  BarChart3,
  Repeat,
  Mail,
  Flame,
  Leaf,
  Moon,
  Plus,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

// =============================================================
// Tipos & constantes
// =============================================================

type StepDef = { id: number; label: string; Icon: LucideIcon };

const STEPS: StepDef[] = [
  { id: 1, label: "Tu empresa", Icon: Building2 },
  { id: 2, label: "Diagnóstico", Icon: BarChart3 },
  { id: 3, label: "Rituales", Icon: Repeat },
  { id: 4, label: "Tu equipo", Icon: Mail },
];

const SECTORES = [
  "Tecnología / Software",
  "Consultoría / Servicios profesionales",
  "Retail / Comercio",
  "Manufactura / Producción",
  "Salud / Bienestar",
  "Educación / Formación",
  "Construcción / Inmobiliario",
  "Marketing / Agencias",
  "Alimentación / Restaurantes",
  "Otro",
];

const SIZES = ["1–3", "4–8", "9–15", "16–30", "31–50", "50+"];

type ScoreEntry = { label: string; color: string };
const scoreLabel = (v: number): ScoreEntry => {
  if (v <= 1) return { label: "Crítico", color: "#f87171" };
  if (v <= 2) return { label: "Bajo", color: "#fb923c" };
  if (v <= 3) return { label: "Regular", color: "#fbbf24" };
  if (v <= 4) return { label: "Bueno", color: "#a3e635" };
  return { label: "Excelente", color: "#34d399" };
};

type DayPlan = { wu?: boolean; cd?: boolean };
type RitualMode = {
  id: string;
  title: string;
  desc: string;
  status: { label: string; color: string; Icon: LucideIcon };
  days: DayPlan[];
};

const DAY_LABELS = ["L", "M", "M", "J", "V"];

const RITUAL_MODES: RitualMode[] = [
  {
    id: "diario",
    title: "Diario",
    desc: "Warm Up y Cool Down todos los días.",
    status: { label: "Situación crítica", color: "#f87171", Icon: Flame },
    days: [
      { wu: true, cd: true },
      { wu: true, cd: true },
      { wu: true, cd: true },
      { wu: true, cd: true },
      { wu: true, cd: true },
    ],
  },
  {
    id: "mode_a",
    title: "Modo A",
    desc: "Warm Up lunes · Cool Down viernes. La cadencia recomendada.",
    status: { label: "Equipo productivo", color: "#34d399", Icon: Leaf },
    days: [
      { wu: true },
      {},
      {},
      {},
      { cd: true },
    ],
  },
  {
    id: "mode_b",
    title: "Modo B",
    desc: "Warm Up lunes · Cool Down martes. Para semanas cortas.",
    status: { label: "Equipo poco productivo", color: "#fbbf24", Icon: Moon },
    days: [
      { wu: true },
      { cd: true },
      {},
      {},
      {},
    ],
  },
  {
    id: "mode_c",
    title: "Modo C",
    desc: "Warm Up y Cool Down el mismo día.",
    status: { label: "Situación de alerta", color: "#fb923c", Icon: Flame },
    days: [
      { wu: true, cd: true },
      {},
      {},
      {},
      {},
    ],
  },
];

const AVATAR_COLORS: [string, string][] = [
  ["#f87171", "#b91c1c"],
  ["#5b8aff", "#1d4dd6"],
  ["#34d399", "#047857"],
  ["#fbbf24", "#b45309"],
  ["#a78bfa", "#6d28d9"],
  ["#f472b6", "#9d174d"],
];

const avatarFor = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  const [a, b] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return {
    initial: (email[0] || "?").toUpperCase(),
    grad: `linear-gradient(135deg, ${a}, ${b})`,
  };
};

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

// =============================================================
// Sub-componentes visuales
// =============================================================

function Stepper({ current }: { current: number }) {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: 680 }}>
      <div className="relative flex items-center justify-between">
        {/* Connector base */}
        <div
          className="absolute"
          style={{
            top: 18,
            left: 18,
            right: 18,
            height: 2,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 99,
            zIndex: 0,
          }}
        />
        {/* Connector progress */}
        <div
          className="absolute"
          style={{
            top: 18,
            left: 18,
            width: `calc(${((current - 1) / (STEPS.length - 1)) * 100}% - 0px)`,
            height: 2,
            background: "linear-gradient(90deg, #34d399, #5b8aff)",
            borderRadius: 99,
            zIndex: 0,
            transition: "width .5s cubic-bezier(.4,0,.2,1)",
          }}
        />

        {STEPS.map((step) => {
          const completed = step.id < current;
          const active = step.id === current;
          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center"
              style={{ zIndex: 1, gap: 10, flex: "0 0 auto" }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 36,
                  height: 36,
                  background: completed
                    ? "#34d399"
                    : active
                    ? "rgba(91,138,255,0.16)"
                    : "var(--bg)",
                  border: completed
                    ? "1px solid #34d399"
                    : active
                    ? "1px solid #5b8aff"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: completed ? "var(--bg)" : active ? "#5b8aff" : "rgba(255,255,255,0.45)",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: active
                    ? "0 0 0 5px rgba(91,138,255,0.12), 0 6px 18px rgba(91,138,255,0.25)"
                    : "none",
                  transition: "all .3s ease",
                }}
              >
                {completed ? <Check size={16} strokeWidth={2.4} /> : <span>{step.id}</span>}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "#fff"
                    : completed
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.4)",
                  letterSpacing: 0.1,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepHeader({
  Icon,
  title,
  subtitle,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="flex items-center" style={{ gap: 14, marginBottom: 10 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(91,138,255,0.22), rgba(91,138,255,0.08))",
            border: "1px solid rgba(91,138,255,0.32)",
            color: "#5b8aff",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--fg)", letterSpacing: -0.3 }}>
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--fg-subtle)",
          lineHeight: 1.5,
          maxWidth: 560,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

// ── Slider con gradiente rojo→ámbar→verde + thumb tintado ───
function ScoreSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - 1) / 4) * 100;
  const { color } = scoreLabel(value);
  return (
    <div className="relative flex items-center" style={{ height: 24 }}>
      {/* Track */}
      <div
        className="absolute left-0 right-0 overflow-hidden"
        style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, #f87171, #fbbf24 50%, ${color})`,
            borderRadius: 99,
            transition: "width .2s ease, background .2s ease",
          }}
        />
      </div>
      {/* Tick marks */}
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="pointer-events-none absolute"
          style={{
            left: `${((n - 1) / 4) * 100}%`,
            transform: "translateX(-50%)",
            width: 2,
            height: 2,
            borderRadius: 99,
            background: n <= value ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.18)",
          }}
        />
      ))}
      {/* Native range */}
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tbm-range absolute left-0 right-0 w-full"
        style={{ height: 24, margin: 0, background: "transparent" }}
      />
      {/* Thumb visual */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${pct}%`,
          transform: "translateX(-50%)",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "var(--bg)",
          border: `2.5px solid ${color}`,
          boxShadow: `0 0 0 4px rgba(255,255,255,0.04), 0 4px 12px ${color}55`,
          transition: "left .15s ease, border-color .2s ease, box-shadow .2s ease",
        }}
      />
    </div>
  );
}

// =============================================================
// Paso 1 — Empresa
// =============================================================
function Step1Empresa({
  data,
  onChange,
}: {
  data: { sector: string; team_size: string };
  onChange: (k: "sector" | "team_size", v: string) => void;
}) {
  return (
    <div>
      <StepHeader
        Icon={Building2}
        title="Tu empresa"
        subtitle="Contanos algunas cosas básicas para que el sistema se adapte a tu contexto. Podés cambiar esto luego."
      />

      <div style={{ marginBottom: 28 }}>
        <div
          className="uppercase"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            letterSpacing: 1.2,
            marginBottom: 12,
          }}
        >
          Sector de tu empresa
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {SECTORES.map((s) => {
            const isActive = data.sector === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange("sector", s)}
                className="relative text-left transition-all"
                style={{
                  padding: "13px 16px",
                  paddingRight: 38,
                  borderRadius: 10,
                  border: isActive
                    ? "1px solid #5b8aff"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(91,138,255,0.18), rgba(91,138,255,0.04))"
                    : "rgba(255,255,255,0.015)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                  boxShadow: isActive ? "0 4px 14px rgba(91,138,255,0.18)" : "none",
                  cursor: "pointer",
                }}
              >
                {s}
                {isActive && (
                  <span
                    className="absolute flex items-center justify-center"
                    style={{
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#5b8aff",
                      color: "var(--fg)",
                    }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div
          className="uppercase"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            letterSpacing: 1.2,
            marginBottom: 12,
          }}
        >
          ¿Cuántas personas hay en tu equipo directo?
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {SIZES.map((s) => {
            const isActive = data.team_size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange("team_size", s)}
                className="text-center transition-all"
                style={{
                  padding: "12px 0",
                  borderRadius: 10,
                  border: isActive
                    ? "1px solid #5b8aff"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(91,138,255,0.2), rgba(91,138,255,0.05))"
                    : "rgba(255,255,255,0.015)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  boxShadow: isActive ? "0 4px 14px rgba(91,138,255,0.18)" : "none",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Paso 2 — Diagnóstico (sliders)
// =============================================================
function Step2Diagnostico({
  scores,
  onChange,
}: {
  scores: Record<string, number>;
  onChange: (key: ScorecardKey, value: number) => void;
}) {
  return (
    <div>
      <StepHeader
        Icon={BarChart3}
        title="Diagnóstico"
        subtitle="Evaluá tu empresa hoy, sin filtros. Este diagnóstico es solo tuyo y nos ayuda a calibrar las recomendaciones."
      />
      <div className="flex flex-col" style={{ gap: 14 }}>
        {SCORECARD_AREAS.map((area) => {
          const v = scores[area.key] ?? 3;
          const s = scoreLabel(v);
          return (
            <div
              key={area.key}
              style={{
                padding: "18px 20px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex items-baseline justify-between"
                style={{ marginBottom: 4 }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>
                  {area.label}
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: 6, fontSize: 12.5, fontWeight: 600, color: s.color }}
                >
                  <span
                    style={{
                      ...MONO,
                      color: "var(--fg)",
                      background: "rgba(255,255,255,0.04)",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 11.5,
                    }}
                  >
                    {v}/5
                  </span>
                  {s.label}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--fg-subtle)",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
                {area.descripcion}
              </div>
              <ScoreSlider value={v} onChange={(nv) => onChange(area.key, nv)} />
              <div
                className="flex justify-between"
                style={{
                  marginTop: 8,
                  fontSize: 10.5,
                  color: "var(--fg-muted)",
                  ...MONO,
                }}
              >
                <span>1 · Crítico</span>
                <span>5 · Excelente</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Paso 3 — Rituales
// =============================================================
function RitualCard({
  mode,
  selected,
  onSelect,
}: {
  mode: RitualMode;
  selected: boolean;
  onSelect: () => void;
}) {
  const { Icon: StatusIcon } = mode.status;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center text-left transition-all"
      style={{
        padding: "18px 20px",
        borderRadius: 12,
        border: selected ? "1px solid #5b8aff" : "1px solid rgba(255,255,255,0.07)",
        background: selected
          ? "linear-gradient(135deg, rgba(91,138,255,0.16), rgba(91,138,255,0.04))"
          : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        boxShadow: selected ? "0 8px 24px rgba(91,138,255,0.18)" : "none",
        gap: 18,
      }}
    >
      {/* Radio dot */}
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: selected
            ? "5px solid #5b8aff"
            : "1.5px solid rgba(255,255,255,0.2)",
          background: selected ? "#fff" : "transparent",
          flexShrink: 0,
          transition: "all .15s ease",
          boxShadow: selected ? "0 0 0 4px rgba(91,138,255,0.12)" : "none",
        }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center" style={{ gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>
            {mode.title}
          </div>
          <div
            className="inline-flex items-center"
            style={{
              gap: 5,
              padding: "2px 8px",
              borderRadius: 99,
              fontSize: 10.5,
              fontWeight: 600,
              color: mode.status.color,
              background: mode.status.color + "18",
              border: `1px solid ${mode.status.color}30`,
            }}
          >
            <StatusIcon size={10} strokeWidth={2} />
            {mode.status.label}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          {mode.desc}
        </div>
      </div>

      {/* Week visualization */}
      <div className="flex" style={{ gap: 6, flexShrink: 0 }}>
        {mode.days.map((d, i) => {
          const has = !!(d.wu || d.cd);
          return (
            <div key={i} className="flex flex-col items-center" style={{ gap: 4 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: has
                    ? selected
                      ? "rgba(91,138,255,0.16)"
                      : "rgba(255,255,255,0.04)"
                    : "transparent",
                  border: has
                    ? selected
                      ? "1px solid rgba(91,138,255,0.35)"
                      : "1px solid rgba(255,255,255,0.08)"
                    : "1px dashed rgba(255,255,255,0.08)",
                  gap: 2,
                }}
              >
                {d.wu && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#fbbf24",
                      boxShadow: "0 0 5px #fbbf2499",
                    }}
                  />
                )}
                {d.cd && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#5b8aff",
                      boxShadow: "0 0 5px #5b8aff99",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  ...MONO,
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  letterSpacing: 0.4,
                }}
              >
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

function Step3Rituales({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <StepHeader
        Icon={Repeat}
        title="Rituales"
        subtitle="Elegí la cadencia de Warm Up y Cool Down para tu equipo. Podés cambiarlo en cualquier momento desde la configuración."
      />

      {/* Legend */}
      <div
        className="flex"
        style={{
          gap: 18,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          marginBottom: 16,
          fontSize: 12,
          color: "var(--fg-muted)",
        }}
      >
        <div className="flex items-center" style={{ gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#fbbf24",
              boxShadow: "0 0 5px #fbbf2499",
            }}
          />
          Warm Up
        </div>
        <div className="flex items-center" style={{ gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#5b8aff",
              boxShadow: "0 0 5px #5b8aff99",
            }}
          />
          Cool Down
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 10 }}>
        {RITUAL_MODES.map((m) => (
          <RitualCard
            key={m.id}
            mode={m}
            selected={selected === m.id}
            onSelect={() => onSelect(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Paso 4 — Equipo (chip input)
// =============================================================
function Step4Equipo({
  emails,
  onAdd,
  onRemove,
}: {
  emails: string[];
  onAdd: (e: string) => void;
  onRemove: (e: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft);

  const add = () => {
    if (!valid) {
      setError("Email inválido");
      return;
    }
    const email = draft.trim().toLowerCase();
    if (emails.includes(email)) {
      setError("Ya agregaste ese email");
      return;
    }
    onAdd(email);
    setDraft("");
    setError("");
    inputRef.current?.focus();
  };

  return (
    <div>
      <StepHeader
        Icon={Mail}
        title="Tu equipo"
        subtitle="Invitá a tu equipo ahora o hacelo más tarde desde Mi Equipo. Cada colaborador recibirá un email para crear su cuenta."
      />

      {/* Email input */}
      <div className="flex" style={{ gap: 8, marginBottom: 16 }}>
        <div
          className="flex flex-1 items-center"
          style={{
            padding: "0 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span style={{ color: "var(--fg-muted)", marginRight: 10 }}>
            <Mail size={16} strokeWidth={1.6} />
          </span>
          <input
            ref={inputRef}
            type="email"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="colaborador@empresa.com"
            className="flex-1"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "13px 0",
              color: "var(--fg)",
              fontSize: 14,
            }}
          />
          {draft && (
            <span
              style={{
                ...MONO,
                fontSize: 10.5,
                color: valid ? "#34d399" : "rgba(255,255,255,0.35)",
                padding: "2px 7px",
                borderRadius: 5,
                background: valid ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                marginRight: 4,
              }}
            >
              {valid ? "✓ válido" : "..."}
            </span>
          )}
          <span style={{ ...MONO, fontSize: 10, color: "var(--fg-muted)" }}>
            <kbd
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ↵
            </kbd>
          </span>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!valid}
          className="flex items-center"
          style={{
            padding: "0 22px",
            borderRadius: 10,
            border: "none",
            background: valid ? "#3672ff" : "rgba(255,255,255,0.05)",
            color: valid ? "#fff" : "rgba(255,255,255,0.35)",
            fontSize: 14,
            fontWeight: 600,
            cursor: valid ? "pointer" : "not-allowed",
            gap: 7,
            boxShadow: valid ? "0 6px 18px rgba(54,114,255,0.3)" : "none",
            transition: "all .15s ease",
          }}
        >
          <Plus size={15} strokeWidth={2.4} />
          Agregar
        </button>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{error}</p>
      )}

      {/* Invites list */}
      <div
        style={{
          padding: emails.length ? "8px" : "36px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 14,
          minHeight: 80,
        }}
      >
        {emails.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--fg-muted)",
              fontSize: 13,
            }}
          >
            Aún no invitaste a nadie. Podés sumar colaboradores más tarde.
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 2 }}>
            <div
              className="uppercase"
              style={{
                ...MONO,
                padding: "6px 12px",
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--fg-muted)",
                letterSpacing: 1.2,
              }}
            >
              {emails.length} {emails.length === 1 ? "invitación" : "invitaciones"}
            </div>
            {emails.map((email) => {
              const av = avatarFor(email);
              return (
                <div
                  key={email}
                  className="flex items-center transition-colors hover:bg-white/[0.03]"
                  style={{
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                  }}
                >
                  <div
                    className="flex items-center justify-center text-white"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: av.grad,
                      fontSize: 12,
                      fontWeight: 600,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}
                  >
                    {av.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div style={{ fontSize: 13.5, color: "var(--fg)" }}>{email}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                      Pendiente — invitación al guardar
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 99,
                      background: "rgba(251,191,36,0.12)",
                      border: "1px solid rgba(251,191,36,0.3)",
                      color: "#fbbf24",
                      letterSpacing: 0.4,
                    }}
                  >
                    PENDIENTE
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(email)}
                    aria-label={`Quitar ${email}`}
                    className="flex transition-colors hover:bg-red-400/10 hover:text-red-400"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--fg-muted)",
                      cursor: "pointer",
                      padding: 6,
                      borderRadius: 6,
                    }}
                  >
                    <X size={14} strokeWidth={2.2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div
        className="flex"
        style={{
          gap: 12,
          padding: "14px 16px",
          borderRadius: 10,
          background: "rgba(91,138,255,0.07)",
          border: "1px solid rgba(91,138,255,0.2)",
          fontSize: 12.5,
          color: "var(--fg-muted)",
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: "#5b8aff", flexShrink: 0, marginTop: 1 }}>
          <Info size={16} />
        </span>
        <div>
          <span style={{ color: "#9fb9ff", fontWeight: 600 }}>Cada colaborador</span>{" "}
          recibirá un email para crear su cuenta y completar su perfil al aceptar la
          invitación.
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Gate de contraseña (primer acceso del líder creado desde el admin)
// =============================================================
function SetPasswordGate({
  supabase,
  onDone,
}: {
  supabase: ReturnType<typeof createBrowserClient>;
  onDone: () => void;
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pw !== pw2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setErr("No se pudo actualizar la contraseña. Probá de nuevo.");
      setLoading(false);
      return;
    }
    await supabase.auth.updateUser({ data: { must_change_password: false } });
    setLoading(false);
    onDone();
  };

  const input: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "var(--fg)",
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center text-white"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(91,138,255,0.06), transparent 50%), var(--bg)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "40px 24px",
      }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 420,
          background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "32px 32px 28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center" style={{ gap: 10, marginBottom: 6 }}>
          <Sparkles size={18} strokeWidth={2} color="#5b8aff" />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.4, color: "#5b8aff" }}>
            BIENVENIDO/A
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 6px", letterSpacing: -0.3 }}>
          Creá tu contraseña
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--fg-subtle)", lineHeight: 1.5, marginBottom: 22 }}>
          Entraste con una contraseña temporal. Definí una propia para asegurar tu cuenta.
        </p>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Nueva contraseña (mín. 8)"
            autoComplete="new-password"
            style={input}
          />
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
            style={input}
          />
          {err && <p style={{ color: "#fca5a5", fontSize: 12.5, margin: 0 }}>{err}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "12px",
              borderRadius: 11,
              background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(180deg, #4f86ff, #2c5fe6)",
              color: "var(--fg)",
              border: "none",
              fontSize: 14.5,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Guardando…" : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================================
// Página
// =============================================================
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  // Gate de contraseña: el líder creado desde el admin entra con una temporal y
  // user_metadata.must_change_password=true → primero crea su contraseña real.
  const [needsPassword, setNeedsPassword] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setNeedsPassword(user?.user_metadata?.must_change_password === true);
    });
  }, [supabase]);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado del wizard
  const [empresa, setEmpresa] = useState({ sector: "", team_size: "" });
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SCORECARD_AREAS.map((a) => [a.key, 3]))
  );
  const [ritualMode, setRitualMode] = useState("mode_a");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);

  const canAdvance = () => {
    if (step === 1) return empresa.sector !== "" && empresa.team_size !== "";
    if (step === 2)
      return SCORECARD_AREAS.every(
        (a) => scores[a.key] >= 1 && scores[a.key] <= 5
      );
    return true;
  };

  const go = (n: number) => {
    if (n < 1 || n > STEPS.length) return;
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const handleNext = async () => {
    if (step < STEPS.length) {
      // Guardar progreso intermedio
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_step: step })
          .eq("id", user.id);
      }
      go(step + 1);
      return;
    }
    await handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("No se encontró la empresa");
      const companyId = profile.company_id;

      // 1. Actualizar empresa
      const teamSizeNum = empresa.team_size
        ? parseInt(empresa.team_size.split("–")[0]) || parseInt(empresa.team_size)
        : null;

      await supabase
        .from("companies")
        .update({
          sector: empresa.sector,
          team_size: teamSizeNum,
          settings: { ritual_frequency: ritualMode, timezone: "America/Bogota" },
        })
        .eq("id", companyId);

      // 2. Guardar scorecard baseline
      await supabase.from("scorecards").insert({
        company_id: companyId,
        user_id: user.id,
        ...scores,
        is_baseline: true,
      });

      // 3. Enviar invitaciones
      for (const email of inviteEmails) {
        const result = await sendTeamInvite({
          email,
          companyId,
          origin: window.location.origin,
        });
        if (!result.ok) {
          throw new Error(result.error);
        }
      }

      // 4. Marcar onboarding completado
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, onboarding_step: 4 })
        .eq("id", user.id);

      capture("onboarding_completed");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar. Intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const isLast = step === STEPS.length;
  const current = STEPS.find((s) => s.id === step)!;

  // Mientras resolvemos el flag, no parpadear; si necesita contraseña, el gate primero.
  if (needsPassword === null) return null;
  if (needsPassword) {
    return <SetPasswordGate supabase={supabase} onDone={() => setNeedsPassword(false)} />;
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center text-white"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(91,138,255,0.06), transparent 50%), radial-gradient(circle at 90% 100%, rgba(91,138,255,0.04), transparent 50%), var(--bg)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "40px 24px 80px",
      }}
    >
      {/* Brand pill */}
      <div className="text-center" style={{ marginBottom: 8 }}>
        <div
          className="inline-flex items-center uppercase"
          style={{
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1.6,
            color: "#5b8aff",
            padding: "5px 12px",
            borderRadius: 99,
            background: "rgba(91,138,255,0.08)",
            border: "1px solid rgba(91,138,255,0.18)",
          }}
        >
          <Sparkles size={12} strokeWidth={2} />
          The Business Multiplier
        </div>
      </div>

      <h1
        className="text-center"
        style={{
          fontSize: 32,
          fontWeight: 700,
          margin: "14px 0 6px",
          letterSpacing: -0.6,
        }}
      >
        Configurá tu sistema
      </h1>
      <div style={{ fontSize: 14, color: "var(--fg-subtle)", marginBottom: 36 }}>
        <span style={MONO}>
          Paso {step} de {STEPS.length}
        </span>
        {" · "}
        <span style={{ color: "var(--fg-muted)" }}>{current.label}</span>
      </div>

      {/* Stepper */}
      <div className="w-full" style={{ marginBottom: 44 }}>
        <Stepper current={step} />
      </div>

      {/* Card */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: 720,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "36px 40px",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Subtle aurora at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 200,
            background:
              "radial-gradient(ellipse, rgba(91,138,255,0.12), transparent 60%)",
            filter: "blur(20px)",
          }}
        />

        {/* Step body */}
        <div
          key={step}
          className={`relative ${dir > 0 ? "tbm-slide-right" : "tbm-slide-left"}`}
        >
          {step === 1 && (
            <Step1Empresa
              data={empresa}
              onChange={(k, v) => setEmpresa((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 2 && (
            <Step2Diagnostico
              scores={scores}
              onChange={(k, v) => setScores((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 3 && (
            <Step3Rituales selected={ritualMode} onSelect={setRitualMode} />
          )}
          {step === 4 && (
            <Step4Equipo
              emails={inviteEmails}
              onAdd={(e) => setInviteEmails((p) => [...p, e])}
              onRemove={(e) =>
                setInviteEmails((p) => p.filter((x) => x !== e))
              }
            />
          )}
        </div>

        {/* Error inline */}
        {error && (
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Nav buttons */}
        <div
          className="relative flex items-center justify-between"
          style={{
            marginTop: 36,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 1 || loading}
            className="flex items-center transition-colors"
            style={{
              gap: 6,
              padding: "10px 14px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: step === 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
              fontSize: 13.5,
              fontWeight: 500,
              cursor: step === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={15} strokeWidth={1.8} />
            Atrás
          </button>

          <div className="flex items-center" style={{ gap: 14 }}>
            {isLast && (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--fg-subtle)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "10px 4px",
                }}
              >
                Invitar después →
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || loading}
              className="flex items-center transition-all"
              style={{
                gap: 8,
                padding: "12px 22px",
                borderRadius: 10,
                border: "none",
                background:
                  !canAdvance() || loading
                    ? "rgba(255,255,255,0.06)"
                    : "linear-gradient(180deg, #4f86ff 0%, #2c5fe6 100%)",
                color: !canAdvance() || loading ? "rgba(255,255,255,0.35)" : "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: !canAdvance() || loading ? "not-allowed" : "pointer",
                boxShadow:
                  !canAdvance() || loading
                    ? "none"
                    : "0 8px 20px rgba(54,114,255,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}
            >
              {loading ? (
                <span
                  className="animate-spin"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "transparent",
                  }}
                />
              ) : isLast ? (
                <>
                  <Check size={15} strokeWidth={2.4} />
                  Ir al Dashboard
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight size={15} strokeWidth={2.2} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div
        style={{
          ...MONO,
          marginTop: 24,
          fontSize: 11.5,
          color: "var(--fg-muted)",
          letterSpacing: 0.4,
        }}
      >
        Podés cerrar y volver más tarde — guardamos tu progreso automáticamente.
      </div>
    </div>
  );
}
