"use client";

import { Award, Target, ShieldCheck } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, LOS_LEVELS, primaryLetter, systemProfile } from "@/lib/disc";
import { StatusPill } from "./primitives";
import { initials, type Draft, type ChecklistItem } from "./types";

export function MemberHero({
  member,
  draft,
  checklist,
}: {
  member: Profile;
  draft: Draft;
  checklist: ChecklistItem[];
}) {
  const primary = primaryLetter(draft.disc_letters);
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const sys = systemProfile(draft.disc_letters);

  const losCurrent = LOS_LEVELS.find((l) => l.level === draft.los_level);
  const losTarget = draft.los_target
    ? LOS_LEVELS.find((l) => l.level === draft.los_target)
    : null;

  const completedCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((completedCount / checklist.length) * 100);

  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start justify-between" style={{ gap: 16 }}>
        <div className="flex items-center" style={{ gap: 16, minWidth: 0, flex: 1 }}>
          {/* Avatar + nivel */}
          <div
            className="flex flex-col items-center flex-shrink-0"
            style={{ gap: 6 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: color,
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {initials(member.full_name)}
            </div>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.6,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(91,138,255,0.18)",
                border: "1px solid rgba(91,138,255,0.35)",
                color: "#bcd0ff",
              }}
            >
              NV {draft.los_level}
            </span>
          </div>

          {/* Nombre + perfil + email + chips */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
              <h2
                className="truncate"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.4,
                  margin: 0,
                }}
              >
                {member.full_name ?? "Sin nombre"}
              </h2>
              {sys && (
                <span
                  className="flex items-center"
                  style={{
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: `${color}1f`,
                    border: `1px solid ${color}40`,
                    color,
                  }}
                >
                  <span>{sys.icon}</span>
                  {member.disc_name || sys.name}
                </span>
              )}
            </div>

            {member.email && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 6,
                }}
              >
                ✉ {member.email}
              </div>
            )}

            <div
              className="flex"
              style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}
            >
              <HeroChip
                Icon={Award}
                label="Rango"
                value={losCurrent?.name ?? "—"}
                color="#fbbf24"
              />
              <HeroChip
                Icon={Target}
                label="Meta"
                value={losTarget?.name ?? "Sin meta"}
                color="#34d399"
                dim={!losTarget}
              />
              <HeroChip
                Icon={ShieldCheck}
                label="Rol"
                value={draft.cargo || "Sin asignar"}
                color="#a78bfa"
                dim={!draft.cargo}
              />
            </div>
          </div>
        </div>

        <StatusPill status={member.disc_status} />
      </div>

      {/* Barra de PERFIL — progreso de los 3 objetivos de la sticky bar */}
      <div style={{ marginTop: 18 }}>
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 6 }}
        >
          <span
            className="uppercase"
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 1.4,
            }}
          >
            Perfil
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: pct === 100 ? "#34d399" : "rgba(255,255,255,0.7)",
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 99,
              background:
                pct === 100
                  ? "linear-gradient(90deg, #34d399, #10b981)"
                  : "linear-gradient(90deg, #5b8aff, #34d399)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function HeroChip({
  Icon,
  label,
  value,
  color,
  dim,
}: {
  Icon: typeof Award;
  label: string;
  value: string;
  color: string;
  dim?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 9,
        padding: "8px 12px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: `${color}1f`,
          color,
        }}
      >
        <Icon size={13} strokeWidth={2} />
      </div>
      <div>
        <div
          className="uppercase"
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "#fff",
            marginTop: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
