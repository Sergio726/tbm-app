"use client";

import { useState } from "react";
import { primaryLetter, DISC_COLORS, DISC_FACTORS } from "@/lib/disc";
import type { Profile } from "@/types/database";

type TeamMember = Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters" | "disc_state" | "disc_temor">;

interface MemberDraft {
  userId: string;
  disc_state: string;
  disc_temor: string;
}

interface Props {
  exerciseKey: string;
  team: TeamMember[];
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

export function ExerciseShadows({ exerciseKey, team, savedResponse, onSave, isPending }: Props) {
  const [members, setMembers] = useState<MemberDraft[]>(() => {
    const savedMembers = savedResponse.members as MemberDraft[] | undefined;
    return team.map((m) => {
      const saved = savedMembers?.find((s) => s.userId === m.id);
      return {
        userId: m.id,
        disc_state: saved?.disc_state ?? m.disc_state ?? "luz",
        disc_temor: saved?.disc_temor ?? m.disc_temor ?? "",
      };
    });
  });

  const update = (userId: string, field: keyof MemberDraft, value: string) =>
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, [field]: value } : m))
    );

  return (
    <div className="space-y-3">
      {team.length === 0 && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.62)" }}>
          No hay miembros del equipo registrados.
        </p>
      )}

      {team.map((member, i) => {
        const draft = members[i];
        const letter = primaryLetter(member.disc_letters);
        const letterColor = letter ? DISC_COLORS[letter] : "#5b8aff";
        const canonicalTemor = letter ? DISC_FACTORS[letter].temor : null;

        return (
          <div
            key={member.id}
            className="rounded-xl border p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{member.full_name}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
                  {member.cargo ?? "Sin cargo"}
                  {letter && (
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 text-xs font-bold"
                      style={{ background: `${letterColor}22`, color: letterColor }}
                    >
                      {letter}
                    </span>
                  )}
                </p>
              </div>

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
                        : { background: "transparent", color: "rgba(255,255,255,0.62)" }
                    }
                  >
                    {state === "luz" ? "☀️ Luz" : "🌑 Sombra"}
                  </button>
                ))}
              </div>
            </div>

            {canonicalTemor && draft.disc_state === "sombra" && (
              <div
                className="mb-3 rounded-lg border px-3 py-2 text-xs"
                style={{
                  background: "rgba(107,114,128,0.1)",
                  borderColor: "rgba(107,114,128,0.2)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <span className="font-semibold text-gray-400">Temor típico {letter}:</span>{" "}
                {canonicalTemor}
              </div>
            )}

            <div>
              <label
                className="mb-1 block text-xs"
                style={{ color: "rgba(255,255,255,0.62)" }}
              >
                Temor activo identificado
              </label>
              <textarea
                value={draft.disc_temor}
                onChange={(e) => update(member.id, "disc_temor", e.target.value)}
                rows={2}
                placeholder="¿Qué temor específico está activando la sombra de esta persona?"
                className="w-full resize-none rounded-lg border bg-transparent px-3 py-2 text-sm leading-relaxed outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91,138,255,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>
        );
      })}

      <div
        className="rounded-xl border p-3 text-xs"
        style={{
          background: "rgba(91,138,255,0.06)",
          borderColor: "rgba(91,138,255,0.2)",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Al guardar, el estado Luz/Sombra y el temor activo se actualizan en los perfiles del equipo.
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
