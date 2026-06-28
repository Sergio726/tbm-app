"use client";

import { useState } from "react";

interface Props {
  exerciseKey: string;
  items: string[];
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

export function ExerciseChecklist({ exerciseKey, items, savedResponse, onSave, isPending }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved = savedResponse.checked;
    if (Array.isArray(saved)) return items.map((_, i) => Boolean(saved[i]));
    return items.map(() => false);
  });

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const checkedCount = checked.filter(Boolean).length;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          className="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all"
          style={
            checked[i]
              ? {
                  background: "rgba(52,211,153,0.08)",
                  borderColor: "rgba(52,211,153,0.3)",
                }
              : {
                  background: "var(--elevated)",
                  borderColor: "var(--border)",
                }
          }
        >
          <div
            className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
            style={
              checked[i]
                ? { background: "rgba(52,211,153,0.2)", border: "1.5px solid #34d399" }
                : { border: "1.5px solid var(--border-strong)", background: "transparent" }
            }
          >
            {checked[i] && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            className="text-sm leading-relaxed"
            style={{ color: checked[i] ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}
          >
            {item}
          </span>
        </button>
      ))}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {checkedCount}/{items.length} completados
        </span>
        <button
          onClick={() => onSave(exerciseKey, { checked })}
          disabled={isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: "rgba(91,138,255,0.2)",
            border: "1px solid rgba(91,138,255,0.4)",
            color: "var(--accent-text)",
          }}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
