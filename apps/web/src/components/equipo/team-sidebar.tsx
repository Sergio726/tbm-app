"use client";

import { useState } from "react";
import { User, Plus, Check, Clock } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, normalizeLetters, profileByKey } from "@/lib/disc";
import { archetypeFor, initials, MONO } from "./types";

type DiscFilter = "todos" | "sin" | "ok";

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
  const [filter, setFilter] = useState<DiscFilter>("todos");

  const ok = team.filter((m) => m.disc_status === "completado").length;
  const sent = team.filter((m) => m.disc_status === "enviado").length;
  const pending = team.length - ok - sent;
  const pct = team.length ? Math.round((ok / team.length) * 100) : 0;

  const shown = team.filter((m) =>
    filter === "ok"
      ? m.disc_status === "completado"
      : filter === "sin"
        ? m.disc_status !== "completado"
        : true
  );

  return (
    <div className="sticky top-6 flex flex-col gap-2.5">
      {/* squad summary */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.3px] text-white/50">
          <User size={13} strokeWidth={2} className="text-[#9fb9ff]" />
          Tu escuadrón
        </div>
        <span
          className="text-[11px] font-semibold text-white/65"
          style={{ fontFamily: MONO }}
        >
          {team.length} {team.length === 1 ? "jugador" : "jugadores"}
        </span>
      </div>

      {/* Estado DISC del equipo */}
      {isArquitecto && team.length > 0 && (
        <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span className="font-semibold text-white/70">Estado DISC del equipo</span>
            <span className="font-bold text-[#34d399]">{pct}%</span>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }}
            />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/55">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" /> {ok} listos
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24]" /> {sent} enviados
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white/30" /> {pending} sin test
            </span>
          </div>
        </div>
      )}

      {/* Filtro */}
      {isArquitecto && team.length > 1 && (
        <div className="flex gap-1.5 rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-1">
          {(
            [
              ["todos", "Todos"],
              ["sin", "Sin DISC"],
              ["ok", "Completados"],
            ] as [DiscFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="flex-1 rounded-[9px] px-2 py-1.5 text-[11.5px] font-semibold transition-colors"
              style={{
                background: filter === key ? "rgba(91,138,255,0.22)" : "transparent",
                color: filter === key ? "#bcd0ff" : "rgba(255,255,255,0.5)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {shown.map((m) => (
        <RosterCard
          key={m.id}
          member={m}
          isYou={m.id === currentUserId}
          selected={m.id === selectedId}
          onClick={() => onSelect(m.id)}
        />
      ))}

      {shown.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-white/10 p-4 text-center text-[12px] text-white/65">
          {filter === "ok" ? "Nadie completó el test todavía." : "Todos completaron su DISC 🎉"}
        </div>
      )}

      {/* empty slot — recruit */}
      <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-white/10 p-4 text-white/50">
        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border border-dashed border-white/[0.18] text-white/65">
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
  // Nombre/ícono canónicos: el perfil calculado por el test manda; si no hay
  // (letras cargadas a mano), cae al arquetipo por letras.
  const canon = profileByKey(member.disc_profile_key);
  const displayName = canon?.name ?? arch.name;
  const displayEmoji = canon?.icon ?? arch.emoji;
  const complete = member.disc_status === "completado";
  const sent = member.disc_status === "enviado";

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
        {complete ? (
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
            style={{ background: "#34d399", borderColor: "#0a0e1a", color: "#06281c" }}
          >
            <Check size={9} strokeWidth={3.2} />
          </div>
        ) : sent ? (
          <div
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
            style={{ background: "#fbbf24", borderColor: "#0a0e1a", color: "#3a2a05" }}
            title="Test enviado, pendiente de completar"
          >
            <Clock size={9} strokeWidth={3} />
          </div>
        ) : null}
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
          {displayEmoji} {displayName}
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
          className="text-[10.5px] font-semibold text-white/65"
          style={{ fontFamily: MONO }}
        >
          N{member.los_level ?? 1}
        </span>
      </div>
    </button>
  );
}
