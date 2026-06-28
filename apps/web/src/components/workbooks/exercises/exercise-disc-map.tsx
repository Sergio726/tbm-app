"use client";

import { useState } from "react";
import { normalizeLetters, DISC_COLORS, presentPairKeys } from "@/lib/disc";
import type { Profile } from "@/types/database";
import { DiscConnectionsDiagram } from "@/components/equipo/disc-connections-diagram";

type TeamMember = Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters" | "disc_state">;

interface MemberDraft {
  userId: string;
  disc_letters: string;
  disc_state: string;
}

interface Props {
  exerciseKey: string;
  team: TeamMember[];
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

export function ExerciseDiscMap({ exerciseKey, team, savedResponse, onSave, isPending }: Props) {
  const [members, setMembers] = useState<MemberDraft[]>(() => {
    const savedMembers = savedResponse.members as MemberDraft[] | undefined;
    return team.map((m) => {
      const saved = savedMembers?.find((s) => s.userId === m.id);
      return {
        userId: m.id,
        disc_letters: saved?.disc_letters ?? m.disc_letters ?? "",
        disc_state: saved?.disc_state ?? m.disc_state ?? "luz",
      };
    });
  });

  const update = (userId: string, field: keyof MemberDraft, value: string) =>
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, [field]: value } : m))
    );

  const getLetterColor = (letters: string) => {
    const norm = normalizeLetters(letters);
    if (!norm) return "#5b8aff";
    const first = norm[0] as keyof typeof DISC_COLORS;
    return DISC_COLORS[first] ?? "#5b8aff";
  };

  const presentPairs = presentPairKeys(members);

  return (
    <div className="space-y-3">
      {/* Referencia: conexiones y fricciones DISC (canónico §4 / Sesión 2). */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <p className="mb-1 text-sm font-semibold text-white">Conexiones y fricciones del equipo</p>
        <p className="mb-3 text-xs" style={{ color: "var(--fg-subtle)" }}>
          Primero el quién, luego el qué. El perímetro une perfiles que conectan naturalmente; las
          diagonales punteadas (D↔S · I↔C) son temperamentos cruzados que requieren acordar cómo
          comunicarse. A medida que cargás las letras, se resaltan las parejas presentes.
        </p>
        <DiscConnectionsDiagram presentPairs={presentPairs} size={188} />
      </div>

      {team.length === 0 && (
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          No hay miembros del equipo registrados.
        </p>
      )}

      {team.map((member, i) => {
        const draft = members[i];
        const normLetters = normalizeLetters(draft.disc_letters);
        const letterColor = getLetterColor(draft.disc_letters);

        return (
          <div
            key={member.id}
            className="rounded-xl border p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{member.full_name}</p>
                <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  {member.cargo ?? "Sin cargo"}
                </p>
              </div>
              {normLetters && (
                <span
                  className="rounded-lg px-2 py-1 text-xs font-bold"
                  style={{ background: `${letterColor}22`, color: letterColor }}
                >
                  {normLetters}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label
                  className="mb-1 block text-xs"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Letras DISC
                </label>
                <input
                  type="text"
                  value={draft.disc_letters}
                  onChange={(e) => update(member.id, "disc_letters", e.target.value)}
                  maxLength={4}
                  placeholder="ej. DI"
                  className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm uppercase tracking-widest outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91,138,255,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-xs"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Estado
                </label>
                <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  {(["luz", "sombra"] as const).map((state) => (
                    <button
                      key={state}
                      onClick={() => update(member.id, "disc_state", state)}
                      className="px-3 py-2 text-xs font-semibold transition-all"
                      style={
                        draft.disc_state === state
                          ? state === "luz"
                            ? { background: "rgba(251,191,36,0.2)", color: "#fbbf24" }
                            : { background: "rgba(107,114,128,0.3)", color: "#9ca3af" }
                          : { background: "transparent", color: "var(--fg-muted)" }
                      }
                    >
                      {state === "luz" ? "☀️ Luz" : "🌑 Sombra"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div
        className="rounded-xl border p-3 text-xs"
        style={{
          background: "rgba(91,138,255,0.06)",
          borderColor: "rgba(91,138,255,0.2)",
          color: "var(--fg-subtle)",
        }}
      >
        Al guardar, los perfiles DISC del equipo se actualizan directamente en la sección Mi Equipo.
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(exerciseKey, { members })}
          disabled={isPending || team.length === 0}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(91,138,255,0.2)",
            border: "1px solid rgba(91,138,255,0.4)",
            color: "#9fb9ff",
          }}
        >
          {isPending ? "Guardando..." : "Guardar y Actualizar Perfiles"}
        </button>
      </div>
    </div>
  );
}
