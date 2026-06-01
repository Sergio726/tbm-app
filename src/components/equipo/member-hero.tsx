"use client";

import { Mail, Compass, Target, Shield, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, LOS_LEVELS, normalizeLetters } from "@/lib/disc";
import { archetypeFor, initials, MONO, type ChecklistItem, type Draft } from "./types";

/**
 * CharacterCard — Hero gamificado: avatar XL con halo,
 * badge "NV X", chips Rango/Meta/Rol, barra Perfil %.
 */
export function MemberHero({
  member,
  draft,
  checklist,
}: {
  member: Profile;
  draft: Draft;
  checklist: ChecklistItem[];
}) {
  const code = normalizeLetters(draft.disc_letters);
  const arch = archetypeFor(code);
  const rarity = DISC_COLORS[arch.primary] ?? "#5b8aff";
  const ring = rarity;
  const losActual = LOS_LEVELS.find((l) => l.level === draft.los_level) ?? LOS_LEVELS[0];
  const losMeta = draft.los_target
    ? LOS_LEVELS.find((l) => l.level === draft.los_target)
    : null;

  const complete = member.disc_status === "completado";
  const completedCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((completedCount / Math.max(1, checklist.length)) * 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-[22px]"
      style={{
        background: `linear-gradient(135deg, ${rarity}1f 0%, rgba(255,255,255,0.02) 42%, rgba(255,255,255,0.01) 100%)`,
        border: `1px solid ${rarity}3a`,
        boxShadow: `0 16px 40px ${rarity}18`,
      }}
    >
      {/* corner glow */}
      <div
        className="pointer-events-none absolute -left-10 -top-[70px] h-[240px] w-[240px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${rarity}33, transparent 70%)`,
        }}
      />
      {/* shine sweep */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 48%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "tbm-shine 6s linear infinite",
        }}
      />

      <div className="relative flex flex-wrap items-center gap-5">
        {/* avatar + level badge */}
        <div className="relative flex-shrink-0">
          <div
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full text-[30px] font-extrabold text-white"
            style={{
              background: `linear-gradient(135deg, ${ring}, ${ring}99)`,
              boxShadow: `0 0 0 3px #0a0e1a, 0 0 0 5px ${ring}77, 0 0 26px ${ring}55, inset 0 2px 0 rgba(255,255,255,0.25)`,
            }}
          >
            {initials(member.full_name)}
          </div>
          <div
            className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border-2 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white"
            style={{
              background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
              borderColor: "#0a0e1a",
              boxShadow: "0 4px 12px rgba(91,138,255,0.4)",
              fontFamily: MONO,
            }}
          >
            NV {draft.los_level}
          </div>
        </div>

        {/* name block */}
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="m-0 text-[26px] font-extrabold text-white"
              style={{ letterSpacing: -0.5 }}
            >
              {member.full_name ?? "Sin nombre"}
            </h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-bold"
              style={{
                background: `${rarity}1f`,
                borderColor: `${rarity}55`,
                color: rarity,
              }}
            >
              <span className="text-[14px]">{arch.emoji}</span>
              {member.disc_name || arch.name}
            </span>
          </div>
          {member.email && (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-white/55">
              <Mail size={14} strokeWidth={1.7} className="text-white/40" />
              {member.email}
            </div>
          )}
          <div className="mt-[14px] flex flex-wrap gap-[9px]">
            <StatChip
              Icon={Compass}
              label="Rango"
              value={losActual.name}
              color={rarity}
            />
            <StatChip
              Icon={Target}
              label="Meta"
              value={losMeta?.name ?? "—"}
              color="#9fb9ff"
            />
            <StatChip
              Icon={Shield}
              label="Rol"
              value={draft.cargo || "—"}
              color="#a78bfa"
            />
          </div>
        </div>

        {/* report completeness — XP gauge */}
        <div className="flex min-w-[190px] flex-shrink-0 flex-col justify-center gap-2.5 self-stretch">
          <div
            className="inline-flex items-center gap-1.5 self-end rounded-full border px-3 py-1.5 text-[12.5px] font-bold"
            style={{
              background: complete ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
              borderColor: complete ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)",
              color: complete ? "#34d399" : "rgba(255,255,255,0.6)",
            }}
          >
            <Trophy size={15} strokeWidth={1.9} />
            {complete ? "Informe completo" : "Informe pendiente"}
          </div>
          <div>
            <div
              className="mb-1.5 flex justify-between text-[10.5px] text-white/50"
              style={{ fontFamily: MONO }}
            >
              <span>PERFIL</span>
              <span>{pct}%</span>
            </div>
            <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #34d399, #5b8aff)",
                  boxShadow: "0 0 12px rgba(52,211,153,0.5)",
                  transformOrigin: "left",
                  transition: "width .8s cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  Icon,
  label,
  value,
  color,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-3 py-1.5">
      <span style={{ color }}>
        <Icon size={15} strokeWidth={1.9} />
      </span>
      <div className="leading-[1.15]">
        <div className="text-[9.5px] font-bold uppercase tracking-[0.8px] text-white/40">
          {label}
        </div>
        <div className="text-[13px] font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}
