"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import type { Rock, Profile } from "@/types/database";
import { isoDate } from "@/lib/dates";
import { quarterProgress } from "@/lib/quarters";
import { RockCard } from "./rock-card";
import { RockForm } from "./rock-form";

interface RocksPanelProps {
  rocks: Rock[];
  team: Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters">[];
  currentUserId: string;
  companyId: string;
  isPending: boolean;
  onCreateRock: (data: {
    title: string;
    owner_id: string;
    success_criteria: string;
    start_date: string;
    end_date: string;
  }) => void;
  onUpdateProgress: (rockId: string, progress: number, note: string) => void;
  onUpdateStatus: (rockId: string, status: string) => void;
}

export function RocksPanel({
  rocks,
  team,
  currentUserId,
  isPending,
  onCreateRock,
  onUpdateProgress,
  onUpdateStatus,
}: RocksPanelProps) {
  const [showForm, setShowForm] = useState(false);

  const activeRocks = rocks.filter((r) => r.status === "active");
  const otherRocks = rocks.filter((r) => r.status !== "active");
  const canAddRock = activeRocks.length < 5;

  // Contador anclado al TRIMESTRE CALENDARIO, no a la roca activa más antigua.
  // Antes flotaba con la primera roca creada, así que dos empresas podían estar
  // en "día 12" en fechas distintas. El año de sprints casa con el calendario
  // (§F1), así que el día lo define el trimestre, no los datos.
  // `isoDate()` es UTC → mismo valor en server y cliente (sin hydration mismatch).
  const quarter = quarterProgress(isoDate());

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-fg" style={{ fontSize: 16 }}>
            Rocas del trimestre
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>
            Día {quarter.day} de {quarter.total} · trimestre {quarter.label}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={!canAddRock}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "rgba(91,138,255,0.15)",
              border: "1px solid rgba(91,138,255,0.3)",
              color: "var(--accent-text)",
            }}
            title={!canAddRock ? "Máximo 5 Rocas activas" : undefined}
          >
            <Plus size={13} strokeWidth={2.5} />
            Nueva Roca
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <RockForm
          team={team}
          currentUserId={currentUserId}
          isPending={isPending}
          onSubmit={(data) => {
            onCreateRock(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Active rocks */}
      {activeRocks.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-10 text-center"
          style={{
            borderColor: "var(--border)",
            borderStyle: "dashed",
          }}
        >
          <Target size={32} style={{ color: "var(--fg-subtle)" }} />
          <div>
            <p className="font-semibold text-fg" style={{ fontSize: 14 }}>
              Sin Rocas activas
            </p>
            <p style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 4 }}>
              Las Rocas son los 1–5 resultados más importantes del trimestre.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "#5b8aff", color: "white" }}
          >
            Crear primera Roca
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {activeRocks.map((rock) => (
          <RockCard
            key={rock.id}
            rock={rock}
            team={team}
            isPending={isPending}
            onUpdateProgress={onUpdateProgress}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      {/* Completed / historical */}
      {otherRocks.length > 0 && (
        <details className="group">
          <summary
            className="cursor-pointer select-none text-xs font-semibold"
            style={{ color: "var(--fg-muted)" }}
          >
            Historial ({otherRocks.length})
          </summary>
          <div className="mt-3 flex flex-col gap-2 opacity-70">
            {otherRocks.map((rock) => (
              <RockCard
                key={rock.id}
                rock={rock}
                team={team}
                isPending={isPending}
                onUpdateProgress={onUpdateProgress}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
