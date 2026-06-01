"use client";

import { User, Plus, Check } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, normalizeLetters } from "@/lib/disc";
import { archetypeFor, initials, MONO } from "./types";

export function TeamSidebar({
  team,
  currentUserId,
  selectedId,
  onSelect,
  isArquitecto,
}: {
  team: Profile[];
  currentUserId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isArquitecto: boolean;
}) {
  return (
    <div className="sticky top-6 flex flex-col gap-2.5">
      {/* squad summary */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.3px] text-white/50">
          <User size={13} strokeWidth={2} className="text-[#9fb9ff]" />
          Tu escuadrón
        </div>
        <span
          className="text-[11px] font-semibold text-white/45"
          style={{ fontFamily: MONO }}
        >
          {team.length} {team.length === 1 ? "jugador" : "jugadores"}
        </span>
      </div>

      {team.map((m) => (
        <RosterCard
          key={m.id}
          member={m}
          isYou={m.id === currentUserId}
          selected={m.id === selectedId}
          onClick={() => onSelect(m.id)}
        />
      ))}

      {/* empty slot — recruit */}
      <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-white/10 p-4 text-white/50">
        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border border-dashed border-white/[0.18] text-white/40">
          <Plus size={18} strokeWidth={2} />
        </div>
        <div className="text-[12px] leading-snug">
          {isArquitecto ? (
            <>
              Usá{" "}
              <b className="text-white/70">&quot;Invitar colaborador&quot;</b>{" "}
              para sumar jugadores al escuadrón.
            </>
          ) : (
            <>Los nuevos colaboradores aparecen cuando aceptan la invitación.</>
          )}
        </div>
      </div>
    </div>
  );
}

function RosterCard({
  member,
  isYou,
  selected,
  onClick,
}: {
  member: Profile;
  isYou: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const code = normalizeLetters(member.disc_letters);
  const arch = archetypeFor(code);
  const ring = DISC_COLORS[arch.primary] ?? "#5b8aff";
  const complete = member.disc_status === "completado";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-[14px] border p-3.5 text-left transition-all"
      style={{
        background: selected
          ? "linear-gradient(135deg, rgba(91,138,255,0.16) 0%, rgba(91,138,255,0.03) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        borderColor: selected ? "rgba(91,138,255,0.40)" : "rgba(255,255,255,0.06)",
        boxShadow: selected ? "0 8px 22px rgba(91,138,255,0.14)" : "none",
      }}
    >
      {/* avatar with class ring */}
      <div className="relative flex-shrink-0">
        <div
          className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-base font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${ring}, ${ring}88)`,
            boxShadow: `0 0 0 2px #0a0e1a, 0 0 0 3.5px ${ring}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          {initials(member.full_name)}
        </div>
        {complete && (
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
            style={{ background: "#34d399", borderColor: "#0a0e1a", color: "#06281c" }}
          >
            <Check size={9} strokeWidth={3.2} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14.5px] font-semibold text-white">
            {member.full_name ?? "Sin nombre"}
          </span>
          {isYou && (
            <span className="rounded-[5px] border border-[#5b8aff]/30 bg-[#5b8aff]/[0.16] px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-[#9fb9ff]">
              Tú
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-white/55">
          {arch.emoji} {arch.name}
        </div>
      </div>

      {/* code + level stacked */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span
          className="rounded-md border px-1.5 py-0.5 text-[11px] font-bold tracking-wider"
          style={{
            background: `${ring}1c`,
            borderColor: `${ring}3a`,
            color: ring,
            fontFamily: MONO,
          }}
        >
          {code || "—"}
        </span>
        <span
          className="text-[10.5px] font-semibold text-white/45"
          style={{ fontFamily: MONO }}
        >
          N{member.los_level ?? 1}
        </span>
      </div>
    </button>
  );
}
