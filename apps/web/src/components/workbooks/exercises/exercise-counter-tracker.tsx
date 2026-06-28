"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, BarChart3 } from "lucide-react";

interface Props {
  exerciseKey: string;
  days: number;
  counterLabel: string;
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

/**
 * Counter tracker — N días, un contador por día (típicamente "Auditoría
 * de Interrupciones 3 días"). Suma + promedio al pie.
 */
export function ExerciseCounterTracker({
  exerciseKey,
  days,
  counterLabel,
  savedResponse,
  onSave,
  isPending,
}: Props) {
  const initialCounts: number[] = useMemo(() => {
    const saved = savedResponse.counts;
    if (Array.isArray(saved)) {
      return Array.from({ length: days }, (_, i) =>
        typeof saved[i] === "number" ? Math.max(0, Number(saved[i])) : 0
      );
    }
    return Array.from({ length: days }, () => 0);
  }, [savedResponse.counts, days]);

  const initialNotes: string[] = useMemo(() => {
    const saved = savedResponse.notes;
    if (Array.isArray(saved)) {
      return Array.from({ length: days }, (_, i) =>
        typeof saved[i] === "string" ? (saved[i] as string) : ""
      );
    }
    return Array.from({ length: days }, () => "");
  }, [savedResponse.notes, days]);

  const [counts, setCounts] = useState<number[]>(initialCounts);
  const [notes, setNotes] = useState<string[]>(initialNotes);

  const total = counts.reduce((a, b) => a + b, 0);
  const avg = days > 0 ? Math.round((total / days) * 10) / 10 : 0;

  const bump = (i: number, delta: number) => {
    setCounts((prev) =>
      prev.map((v, idx) => (idx === i ? Math.max(0, v + delta) : v))
    );
  };

  const setCount = (i: number, raw: string) => {
    const n = parseInt(raw, 10);
    setCounts((prev) =>
      prev.map((v, idx) => (idx === i ? (isNaN(n) ? 0 : Math.max(0, n)) : v))
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {counts.map((value, i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="mb-3 text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--fg-muted)" }}
            >
              Día {i + 1}
            </div>

            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => bump(i, -1)}
                disabled={value <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "var(--fg-muted)",
                }}
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setCount(i, e.target.value)}
                className="flex-1 rounded-lg border bg-transparent text-center text-xl font-bold outline-none"
                style={{
                  background: "rgba(91,138,255,0.06)",
                  borderColor: "rgba(91,138,255,0.20)",
                  color: "var(--fg)",
                  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  padding: "6px 4px",
                }}
              />
              <button
                type="button"
                onClick={() => bump(i, 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition"
                style={{
                  background: "rgba(91,138,255,0.12)",
                  borderColor: "rgba(91,138,255,0.30)",
                  color: "#bcd0ff",
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <input
              type="text"
              value={notes[i]}
              onChange={(e) =>
                setNotes((prev) =>
                  prev.map((v, idx) => (idx === i ? e.target.value : v))
                )
              }
              placeholder="Nota (opcional)"
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-xs outline-none transition"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "var(--fg-muted)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div
        className="flex items-center justify-between gap-3 rounded-xl border p-3 text-xs"
        style={{
          background: "rgba(91,138,255,0.06)",
          borderColor: "rgba(91,138,255,0.18)",
          color: "var(--fg-muted)",
        }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-[#9fb9ff]" />
          <span>
            <strong className="text-white">{total}</strong> {counterLabel} en {days}{" "}
            día{days === 1 ? "" : "s"} · promedio{" "}
            <strong className="text-white">{avg}</strong>/día
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSave(exerciseKey, { counts, notes, total, avg })}
          disabled={isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(91,138,255,0.2)",
            border: "1px solid rgba(91,138,255,0.4)",
            color: "#9fb9ff",
          }}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
