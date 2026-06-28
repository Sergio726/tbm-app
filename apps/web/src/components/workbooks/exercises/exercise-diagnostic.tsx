"use client";

import { useState } from "react";
import { SCORECARD_AREAS } from "@/types/database";

const SCORE_LABELS: Record<number, string> = {
  1: "Crítico",
  2: "Bajo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

function scoreColor(s: number): string {
  if (s <= 2) return "#f87171";
  if (s === 3) return "#fbbf24";
  return "#34d399";
}

type DiagnosticData = Partial<Record<string, number>>;

interface Props {
  exerciseKey: string;
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

export function ExerciseDiagnostic({ exerciseKey, savedResponse, onSave, isPending }: Props) {
  const [scores, setScores] = useState<DiagnosticData>(() => {
    const s: DiagnosticData = {};
    for (const area of SCORECARD_AREAS) {
      const v = savedResponse[area.key];
      if (typeof v === "number") s[area.key] = v;
    }
    return s;
  });

  const allFilled = SCORECARD_AREAS.every((a) => typeof scores[a.key] === "number");

  const handleSave = () => {
    if (!allFilled) return;
    onSave(exerciseKey, scores as Record<string, unknown>);
  };

  return (
    <div className="space-y-4">
      {SCORECARD_AREAS.map((area) => {
        const val = scores[area.key];
        return (
          <div key={area.key}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{area.label}</span>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
                  {area.descripcion}
                </p>
              </div>
              {val !== undefined && (
                <span className="ml-3 text-xs font-bold" style={{ color: scoreColor(val), minWidth: 60, textAlign: "right" }}>
                  {SCORE_LABELS[val]}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScores((prev) => ({ ...prev, [area.key]: n }))}
                  className="flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-bold transition-all"
                  style={
                    val === n
                      ? {
                          background: `${scoreColor(n)}22`,
                          border: `1.5px solid ${scoreColor(n)}`,
                          color: scoreColor(n),
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.5)",
                        }
                  }
                >
                  {n}
                </button>
              ))}
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
        Este diagnóstico también actualiza los semáforos del Dashboard de tu empresa.
      </div>

      <button
        onClick={handleSave}
        disabled={!allFilled || isPending}
        className="w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-40"
        style={{
          background: allFilled ? "rgba(91,138,255,0.2)" : "rgba(255,255,255,0.04)",
          border: allFilled ? "1px solid rgba(91,138,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
          color: allFilled ? "#9fb9ff" : "rgba(255,255,255,0.3)",
        }}
      >
        {isPending ? "Guardando..." : "Guardar Diagnóstico"}
      </button>
    </div>
  );
}
