"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target,
  Flame,
  Zap,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { TileTooltip, TooltipRow } from "./tile-tooltip";

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

export type TeamEnergyMember = {
  id: string;
  name: string;
  initial: string;
  color: string;
  energyToday: number | null;
};

export interface HeroStripProps {
  // Tile 1 — Ciclo 90D
  dayInCycle: number | null;
  cycleNumber: number;
  cycleStartLabel: string | null;
  // Tile 2 — Racha
  streak: number;
  bestStreak: number;
  last7Days: { label: string; done: boolean }[];
  preGameDoneToday: boolean;
  // Tile 3 — Multiplicador (proxy fase A)
  multiplicadorPct: number | null;
  delegacionScore: number | null; // 1-5
  boomerangCount: number;
  tasksDoneByTeam: number;
  // Tile 4 — Equipo hoy
  teamWithEnergy: TeamEnergyMember[];
}

type TileKey = "ciclo" | "racha" | "multiplicador" | "equipo";

export function HeroStrip(props: HeroStripProps) {
  const [hovered, setHovered] = useState<TileKey | null>(null);

  return (
    <div className="flex" style={{ gap: 12, marginBottom: 32 }}>
      <CicloTile {...props} hovered={hovered} setHovered={setHovered} />
      <RachaTile {...props} hovered={hovered} setHovered={setHovered} />
      <MultiplicadorTile {...props} hovered={hovered} setHovered={setHovered} />
      <EquipoTile {...props} hovered={hovered} setHovered={setHovered} />
    </div>
  );
}

// ─── Tile base interactivo ─────────────────────────────────────

function HeroTile({
  tileKey,
  href,
  Icon,
  label,
  value,
  sub,
  accent,
  tone,
  hovered,
  setHovered,
  tooltip,
  children,
}: {
  tileKey: TileKey;
  href: string;
  Icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  tone?: "accent";
  hovered: TileKey | null;
  setHovered: (k: TileKey | null) => void;
  tooltip: ReactNode;
  children?: ReactNode;
}) {
  const isHovered = hovered === tileKey;
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(tileKey)}
      onMouseLeave={() => setHovered(null)}
      className="relative"
      style={{
        flex: 1,
        padding: "18px 20px",
        borderRadius: 14,
        textDecoration: "none",
        cursor: "pointer",
        display: "block",
        background:
          tone === "accent"
            ? "linear-gradient(135deg, rgba(91,138,255,0.16) 0%, rgba(91,138,255,0.04) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: isHovered
          ? `1px solid ${accent}66`
          : tone === "accent"
            ? "1px solid rgba(91,138,255,0.28)"
            : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isHovered
          ? `0 8px 24px ${accent}30`
          : tone === "accent"
            ? "0 8px 24px rgba(91,138,255,0.16)"
            : "none",
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${accent}1f`,
            border: `1px solid ${accent}33`,
            color: accent,
          }}
        >
          <Icon size={14} strokeWidth={1.9} />
        </div>
        <span
          className="uppercase"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: -0.4,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
      {children}

      {isHovered && <TileTooltip>{tooltip}</TileTooltip>}
    </Link>
  );
}

// ─── Tile 1 — Ciclo 90D ────────────────────────────────────────

function CicloTile({
  dayInCycle,
  cycleNumber,
  cycleStartLabel,
  hovered,
  setHovered,
}: HeroStripProps & { hovered: TileKey | null; setHovered: (k: TileKey | null) => void }) {
  const pctCycle = dayInCycle ? Math.round((dayInCycle / 90) * 100) : 0;
  const active = dayInCycle !== null;

  return (
    <HeroTile
      tileKey="ciclo"
      href={active ? "/plan-90d" : "/diagnostico"}
      Icon={Target}
      label="Ciclo 90D"
      value={active ? `Día ${dayInCycle}/90` : "Sin iniciar"}
      accent="#5b8aff"
      tone="accent"
      hovered={hovered}
      setHovered={setHovered}
      tooltip={
        active ? (
          <>
            <TooltipRow icon="📅">Inicio del ciclo: {cycleStartLabel}</TooltipRow>
            <TooltipRow icon="🔄">Ciclo {cycleNumber} del programa</TooltipRow>
            <TooltipRow icon="⏳">{90 - (dayInCycle ?? 0)} días restantes</TooltipRow>
          </>
        ) : (
          <TooltipRow icon="📊">
            Completá tu diagnóstico para activar el ciclo →
          </TooltipRow>
        )
      }
    >
      <div
        style={{
          height: 4,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 99,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pctCycle}%`,
            height: "100%",
            background: "linear-gradient(90deg, #5b8aff, #34d399)",
            borderRadius: 99,
          }}
        />
      </div>
      <div
        className="flex justify-between"
        style={{
          ...MONO,
          marginTop: 6,
          fontSize: 10.5,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span>
          {active ? `Ciclo ${cycleNumber}` : "completá el diagnóstico →"}
        </span>
        <span>{pctCycle}%</span>
      </div>
    </HeroTile>
  );
}

// ─── Tile 2 — Racha activa ─────────────────────────────────────

function RachaTile({
  streak,
  bestStreak,
  last7Days,
  preGameDoneToday,
  hovered,
  setHovered,
}: HeroStripProps & { hovered: TileKey | null; setHovered: (k: TileKey | null) => void }) {
  const value =
    streak === 0
      ? "¡Empezá hoy!"
      : streak >= 30
        ? `${streak} días 🏆`
        : streak >= 7
          ? `${streak} días 🔥`
          : `${streak} ${streak === 1 ? "día" : "días"}`;
  const sub =
    streak === 0
      ? "tu Pre-game te espera"
      : streak === 1
        ? "1 día · ¡seguí así!"
        : "racha de Pre-game";

  return (
    <HeroTile
      tileKey="racha"
      href={preGameDoneToday ? "/rituales" : "/rituales/pre-game"}
      Icon={Flame}
      label="Racha activa"
      value={value}
      sub={sub}
      accent="#fb923c"
      hovered={hovered}
      setHovered={setHovered}
      tooltip={
        <>
          <div
            className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Últimos 7 días
          </div>
          <div className="flex gap-2 pb-1">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: d.done ? "#34d399" : "rgba(255,255,255,0.15)",
                    boxShadow: d.done ? "0 0 6px rgba(52,211,153,0.6)" : "none",
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-1 border-t pt-1.5 text-[11.5px]"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Mejor racha: <strong className="text-white">{bestStreak} días</strong>
          </div>
        </>
      }
    />
  );
}

// ─── Tile 3 — Multiplicador (proxy fase A) ─────────────────────

function MultiplicadorTile({
  multiplicadorPct,
  delegacionScore,
  boomerangCount,
  tasksDoneByTeam,
  hovered,
  setHovered,
}: HeroStripProps & { hovered: TileKey | null; setHovered: (k: TileKey | null) => void }) {
  const pct = multiplicadorPct;
  const badge =
    pct === null
      ? null
      : pct >= 85
        ? { label: "Multiplicador", color: "#34d399" }
        : pct >= 65
          ? { label: "Disminuidor Accidental", color: "#fbbf24" }
          : { label: "Disminuidor Activo", color: "#f87171" };

  return (
    <HeroTile
      tileKey="multiplicador"
      href="/equipo"
      Icon={Zap}
      label="Multiplicador"
      value={pct !== null ? `${pct}%` : "—"}
      sub={pct !== null ? "capacidad de equipo utilizada" : "hacé tu diagnóstico primero"}
      accent="#fbbf24"
      hovered={hovered}
      setHovered={setHovered}
      tooltip={
        pct !== null ? (
          <>
            <TooltipRow icon="📤">
              Delegación efectiva:{" "}
              <strong className="text-white">
                {delegacionScore?.toFixed(1) ?? "—"}/5
              </strong>
            </TooltipRow>
            <TooltipRow icon="✅">
              {tasksDoneByTeam} tarea{tasksDoneByTeam === 1 ? "" : "s"} completada
              {tasksDoneByTeam === 1 ? "" : "s"} por el equipo (30d)
            </TooltipRow>
            <TooltipRow icon="🪃">
              {boomerangCount} escalación{boomerangCount === 1 ? "" : "es"} Anti-Boomerang
            </TooltipRow>
            <div
              className="mt-1 border-t pt-1.5 text-[10.5px]"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Proxy: delegación 40% · autonomía 40% · base 20%
            </div>
          </>
        ) : (
          <TooltipRow icon="📊">
            El Multiplicador se calcula con tu diagnóstico y la actividad de
            delegación.
          </TooltipRow>
        )
      }
    >
      {badge && (
        <span
          className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: `${badge.color}1a`,
            borderColor: `${badge.color}45`,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
      )}
    </HeroTile>
  );
}

// ─── Tile 4 — Equipo hoy ───────────────────────────────────────

function EquipoTile({
  teamWithEnergy,
  hovered,
  setHovered,
}: HeroStripProps & { hovered: TileKey | null; setHovered: (k: TileKey | null) => void }) {
  const total = teamWithEnergy.length;
  const activos = teamWithEnergy.filter((m) => m.energyToday !== null).length;
  const sinRegistrar = total - activos;
  const shown = teamWithEnergy.slice(0, 5);

  return (
    <HeroTile
      tileKey="equipo"
      href="/equipo"
      Icon={Users}
      label="Equipo hoy"
      value={`${activos} / ${total}`}
      sub="registraron energía hoy"
      accent="#a78bfa"
      hovered={hovered}
      setHovered={setHovered}
      tooltip={
        <>
          {teamWithEnergy.slice(0, 8).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 py-0.5 text-[11.5px]"
            >
              <span
                className="truncate"
                style={{ color: "rgba(255,255,255,0.75)", width: 110 }}
              >
                {m.name}
              </span>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        m.energyToday !== null && n <= m.energyToday
                          ? "#34d399"
                          : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </span>
              <span
                className="ml-auto whitespace-nowrap text-[10.5px]"
                style={{
                  color:
                    m.energyToday !== null
                      ? "rgba(255,255,255,0.5)"
                      : "#fbbf24",
                }}
              >
                {m.energyToday !== null ? `Energía ${m.energyToday}` : "Sin registrar ⚠"}
              </span>
            </div>
          ))}
          {sinRegistrar > 0 && (
            <div
              className="mt-1 border-t pt-1.5 text-[11px]"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {sinRegistrar} sin registrar hoy
            </div>
          )}
        </>
      }
    >
      <div className="flex" style={{ marginTop: 8 }}>
        {shown.map((a, idx) => (
          <div
            key={a.id}
            className="flex items-center justify-center text-white"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: a.color,
              border: "2px solid #0a0e1a",
              marginLeft: idx === 0 ? 0 : -6,
              fontSize: 10,
              fontWeight: 600,
              opacity: a.energyToday !== null ? 1 : 0.45,
            }}
          >
            {a.initial}
          </div>
        ))}
        {total > shown.length && (
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "2px solid #0a0e1a",
              marginLeft: shown.length === 0 ? 0 : -6,
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            +{total - shown.length}
          </div>
        )}
      </div>
    </HeroTile>
  );
}
