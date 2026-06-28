"use client";

import { Gauge, Check, Lock, Flag, Zap } from "lucide-react";
import { LOS_LEVELS } from "@/lib/disc";
import { Panel } from "./primitives";
import { MONO, type Draft } from "./types";

type LevelState = "done" | "actual" | "path" | "meta" | "locked";

export function LosSection({
  draft,
  patch,
  editable,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
}) {
  const actual = draft.los_level;
  const meta = draft.los_target ?? actual;
  const jump = Math.max(0, meta - actual);

  return (
    <Panel
      icon={<Gauge size={18} strokeWidth={1.9} />}
      iconColor="#5b8aff"
      accent="#5b8aff"
      title="Nivel de Delegación · ruta de autonomía"
      sub="Cuánta autonomía maneja hoy (N1 ejecuta → N5 socio) y la meta a la que querés llevarlo."
      badge={
        jump > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/[0.14] px-2.5 py-1 text-[11px] font-bold text-[#fbbf24]">
            <Zap size={11} strokeWidth={2} />
            subir {jump} {jump === 1 ? "nivel" : "niveles"}
          </span>
        ) : null
      }
    >
      <LevelPath actual={actual} meta={meta} />

      <div className="mt-3.5 flex flex-col gap-2">
        {LOS_LEVELS.map((lvl) => (
          <LevelRow
            key={lvl.level}
            level={lvl.level}
            name={lvl.name}
            desc={lvl.desc}
            actual={actual}
            meta={meta}
            editable={editable}
            onSetActual={() =>
              patch({
                los_level: lvl.level,
                los_target: Math.max(lvl.level, draft.los_target ?? lvl.level),
              })
            }
            onSetMeta={() =>
              patch({
                los_target: lvl.level,
                los_level: Math.min(lvl.level, draft.los_level),
              })
            }
          />
        ))}
      </div>
    </Panel>
  );
}

function LevelPath({ actual, meta }: { actual: number; meta: number }) {
  const total = LOS_LEVELS.length;
  const pct = (i: number) => (i / (total - 1)) * 100;
  const actualPct = pct(actual - 1);
  const metaPct = pct(meta - 1);

  return (
    <div className="relative mb-1.5 px-6 pb-2 pt-[26px]">
      {/* base rail */}
      <div className="absolute left-[50px] right-[50px] top-[51px] h-1 rounded-full bg-white/[0.07]" />
      {/* done fill: 0 → actual */}
      <div
        className="absolute left-[50px] top-[51px] h-1 rounded-full"
        style={{
          width: `calc((100% - 100px) * ${actualPct / 100})`,
          background: "linear-gradient(90deg, #34d399, #5b8aff)",
        }}
      />
      {/* quest segment: actual → meta */}
      {meta > actual && (
        <div
          className="absolute top-[51px] h-1 rounded-full opacity-80"
          style={{
            left: `calc(50px + (100% - 100px) * ${actualPct / 100})`,
            width: `calc((100% - 100px) * ${(metaPct - actualPct) / 100})`,
            background:
              "repeating-linear-gradient(90deg, #fbbf24 0 6px, transparent 6px 12px)",
          }}
        />
      )}
      <div className="flex justify-between">
        {LOS_LEVELS.map((l) => (
          <LevelNode
            key={l.level}
            label={`N${l.level}`}
            name={l.name}
            state={stateFor(l.level, actual, meta)}
          />
        ))}
      </div>
    </div>
  );
}

function stateFor(n: number, actual: number, meta: number): LevelState {
  if (n < actual) return "done";
  if (n === actual) return "actual";
  if (n === meta && meta > actual) return "meta";
  if (n > actual && n < meta) return "path";
  return "locked";
}

function LevelNode({
  label,
  name,
  state,
}: {
  label: string;
  name: string;
  state: LevelState;
}) {
  const cfg: Record<
    LevelState,
    { bg: string; border: string; text: string; glow: boolean; pulse?: boolean }
  > = {
    done: {
      bg: "rgba(52,211,153,0.18)",
      border: "#34d399",
      text: "#34d399",
      glow: false,
    },
    actual: {
      bg: "linear-gradient(135deg,#5b8aff,#2c5fe6)",
      border: "#5b8aff",
      text: "#fff",
      glow: true,
      pulse: true,
    },
    path: {
      bg: "rgba(91,138,255,0.08)",
      border: "rgba(91,138,255,0.4)",
      text: "#9fb9ff",
      glow: false,
    },
    meta: {
      bg: "rgba(251,191,36,0.14)",
      border: "#fbbf24",
      text: "#fbbf24",
      glow: true,
    },
    locked: {
      bg: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.12)",
      text: "rgba(255,255,255,0.35)",
      glow: false,
    },
  };
  const c = cfg[state];

  return (
    <div className="relative z-[2] flex flex-col items-center gap-2">
      {state === "actual" && (
        <span
          className="absolute -top-[22px] whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
          style={{
            background: "rgba(91,138,255,0.18)",
            borderColor: "rgba(91,138,255,0.45)",
            color: "#9fb9ff",
          }}
        >
          Estás acá
        </span>
      )}
      {state === "meta" && (
        <span
          className="absolute -top-[22px] inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
          style={{
            background: "rgba(251,191,36,0.16)",
            borderColor: "rgba(251,191,36,0.5)",
            color: "#fbbf24",
          }}
        >
          <Flag size={9} strokeWidth={2.4} />
          Meta
        </span>
      )}
      <div
        className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 text-base font-bold transition"
        style={{
          background: c.bg,
          borderColor: c.border,
          color: c.text,
          boxShadow: c.glow ? `0 0 0 4px ${c.border}22, 0 0 22px ${c.border}66` : "none",
          fontFamily: MONO,
          animation: c.pulse ? "tbm-float 3s ease-in-out infinite" : undefined,
        }}
      >
        {state === "done" ? (
          <Check size={20} strokeWidth={3} />
        ) : state === "locked" ? (
          <Lock size={18} strokeWidth={2} />
        ) : (
          label
        )}
      </div>
      <span
        className="whitespace-nowrap text-[11px] font-semibold"
        style={{ color: c.text === "#fff" ? "#fff" : c.text }}
      >
        {name}
      </span>
    </div>
  );
}

function LevelRow({
  level,
  name,
  desc,
  actual,
  meta,
  editable,
  onSetActual,
  onSetMeta,
}: {
  level: number;
  name: string;
  desc: string;
  actual: number;
  meta: number;
  editable: boolean;
  onSetActual: () => void;
  onSetMeta: () => void;
}) {
  const isActual = level === actual;
  const isMeta = level === meta && meta > actual;
  const done = level < actual;
  const locked = level > meta;

  return (
    <div
      className="flex items-center gap-3.5 rounded-xl border px-3.5 py-3 transition"
      style={{
        background: isActual
          ? "linear-gradient(135deg, rgba(91,138,255,0.14), rgba(91,138,255,0.02))"
          : isMeta
            ? "rgba(251,191,36,0.06)"
            : "rgba(255,255,255,0.018)",
        borderColor: isActual
          ? "rgba(91,138,255,0.4)"
          : isMeta
            ? "rgba(251,191,36,0.32)"
            : "rgba(255,255,255,0.05)",
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] border text-[13px] font-bold"
        style={{
          background: isActual
            ? "linear-gradient(135deg,#5b8aff,#2c5fe6)"
            : done
              ? "rgba(52,211,153,0.15)"
              : "rgba(255,255,255,0.05)",
          borderColor: isActual
            ? "transparent"
            : done
              ? "rgba(52,211,153,0.4)"
              : "rgba(255,255,255,0.1)",
          color: isActual ? "#fff" : done ? "#34d399" : "rgba(255,255,255,0.6)",
          boxShadow: isActual ? "0 0 16px rgba(91,138,255,0.5)" : "none",
          fontFamily: MONO,
        }}
      >
        {done ? <Check size={15} strokeWidth={3} /> : `N${level}`}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-bold text-white">{name}</span>
          {locked && <Lock size={12} strokeWidth={2} className="text-white/65" />}
        </div>
        <div className="mt-0.5 text-[12px] text-white/50">{desc}</div>
      </div>
      {editable && (
        <div className="flex flex-shrink-0 gap-1.5">
          <PathPill
            active={isActual}
            color="#5b8aff"
            label="Actual"
            onClick={onSetActual}
          />
          <PathPill
            active={isMeta}
            color="#fbbf24"
            label="Meta"
            onClick={onSetMeta}
          />
        </div>
      )}
    </div>
  );
}

function PathPill({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border px-3 py-1 text-[11.5px] font-bold tracking-wide transition"
      style={{
        background: active ? `${color}22` : "rgba(255,255,255,0.03)",
        borderColor: active ? color : "rgba(255,255,255,0.1)",
        color: active ? color : "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}
