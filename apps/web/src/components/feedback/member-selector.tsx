"use client";

import type { Profile } from "@/types/database";
import { primaryLetter, systemProfile, DISC_COLORS } from "@/lib/disc";

interface MemberSelectorProps {
  team: Profile[];
  selected: Profile | null;
  onSelect: (m: Profile) => void;
}

export function MemberSelector({ team, selected, onSelect }: MemberSelectorProps) {
  if (team.length === 0) {
    return (
      <div
        className="rounded-xl border py-8 text-center"
        style={{
          borderColor: "var(--border)",
          background: "var(--elevated)",
        }}
      >
        <p style={{ fontSize: 13.5, color: "var(--fg-muted)" }}>
          No hay colaboradores en tu empresa aún.
          <br />
          Invitá miembros desde Mi Equipo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {team.map((member) => {
        const isSelected = selected?.id === member.id;
        const letter = primaryLetter(member.disc_letters);
        const profile = systemProfile(member.disc_letters);
        const initials = (member.full_name ?? "?")
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
            style={{
              background: isSelected
                ? "rgba(91,138,255,0.1)"
                : "rgba(255,255,255,0.025)",
              borderColor: isSelected
                ? "rgba(91,138,255,0.4)"
                : "rgba(255,255,255,0.07)",
              cursor: "pointer",
            }}
          >
            {/* Avatar */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "rgba(91,138,255,0.2)", color: "var(--accent-text)" }}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-medium text-fg"
                style={{ fontSize: 13.5 }}
              >
                {member.full_name ?? "Sin nombre"}
              </p>
              <p
                className="truncate"
                style={{ fontSize: 12, color: "var(--fg-muted)" }}
              >
                {member.cargo ?? "Sin cargo"}
              </p>
            </div>

            {/* DISC badge */}
            {letter && (
              <div
                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-bold"
                style={{
                  background: `${DISC_COLORS[letter]}22`,
                  color: DISC_COLORS[letter],
                  border: `1px solid ${DISC_COLORS[letter]}44`,
                }}
              >
                {profile?.icon} {member.disc_letters ?? letter}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
