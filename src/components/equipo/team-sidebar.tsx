"use client";

import { Mail } from "lucide-react";
import type { Profile } from "@/types/database";
import {
  DISC_COLORS,
  primaryLetter,
  normalizeLetters,
  systemProfile,
  ALIGNMENT_ACTION,
  type AlignmentValue,
} from "@/lib/disc";
import { initials } from "./types";

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
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div
        className="flex items-center justify-between"
        style={{ padding: "0 4px", marginBottom: 2 }}
      >
        <span
          className="uppercase"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: 1.4,
          }}
        >
          Tu escuadrón
        </span>
        <span
          style={{
            fontSize: 10.5,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {team.length} {team.length === 1 ? "jugador" : "jugadores"}
        </span>
      </div>

      {team.map((m) => (
        <TeamRow
          key={m.id}
          member={m}
          isYou={m.id === currentUserId}
          active={m.id === selectedId}
          onClick={() => onSelect(m.id)}
        />
      ))}

      <div
        className="flex items-center"
        style={{
          gap: 10,
          marginTop: 6,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1.5px dashed rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        <Mail size={15} strokeWidth={1.8} />
        {isArquitecto ? (
          <span>
            Usá <strong style={{ color: "rgba(255,255,255,0.75)" }}>“Invitar colaborador”</strong>{" "}
            para sumar jugadores al escuadrón.
          </span>
        ) : (
          <span>Los nuevos colaboradores aparecen cuando aceptan la invitación.</span>
        )}
      </div>
    </div>
  );
}

function TeamRow({
  member,
  isYou,
  active,
  onClick,
}: {
  member: Profile;
  isYou: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const primary = primaryLetter(member.disc_letters);
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const sys = systemProfile(member.disc_letters);
  const align = member.alignment as AlignmentValue | null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center text-left transition-colors"
      style={{
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        width: "100%",
        cursor: "pointer",
        background: active
          ? "linear-gradient(135deg, rgba(91,138,255,0.18) 0%, rgba(91,138,255,0.05) 100%)"
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${active ? "rgba(91,138,255,0.30)" : "rgba(255,255,255,0.06)"}`,
        color: "#fff",
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: color,
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {initials(member.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>
            {member.full_name ?? "Sin nombre"}
          </span>
          {isYou && (
            <span
              style={{
                fontSize: 9.5,
                color: "#9fb9ff",
                fontWeight: 700,
                letterSpacing: 0.4,
                padding: "1px 6px",
                borderRadius: 4,
                background: "rgba(91,138,255,0.16)",
              }}
            >
              TÚ
            </span>
          )}
        </div>
        <div
          className="truncate"
          style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 1 }}
        >
          {sys ? `${sys.icon} ${sys.name}` : member.role ?? "colaborador"}
        </div>
      </div>
      <div className="flex flex-col items-end" style={{ gap: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.6,
            padding: "2px 7px",
            borderRadius: 6,
            background: `${color}22`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {normalizeLetters(member.disc_letters) || "—"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          N{member.los_level ?? 1}
          {align && (
            <span style={{ color: ALIGNMENT_ACTION[align].color }}> ●</span>
          )}
        </span>
      </div>
    </button>
  );
}
