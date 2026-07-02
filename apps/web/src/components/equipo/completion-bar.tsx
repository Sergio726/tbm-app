"use client";

import { Trophy, Swords, CheckCircle2, Circle, Lock } from "lucide-react";
import { MONO, type ChecklistItem } from "./types";

/**
 * SaveBar gamificado — Quest-style: el botón se desbloquea cuando los 3
 * objetivos están completos. Sticky al fondo del scroll, dentro del main.
 */
export function CompletionBar({
  checklist,
  dirty,
  saving,
  savedFlash,
  editable,
  onSave,
}: {
  checklist: ChecklistItem[];
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  editable: boolean;
  onSave: () => void;
}) {
  const doneCount = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const ready = doneCount === total;
  const canSave = editable && dirty && ready && !saving;

  return (
    <div
      className="sticky bottom-[18px] z-20 mt-1 flex flex-wrap items-center gap-[18px] rounded-2xl border px-[18px] py-3.5"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,24,40,0.92), rgba(12,16,28,0.96))",
        borderColor: ready ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.10)",
        boxShadow: "var(--shadow-panel)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* progress orb */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border"
          style={{
            background: ready
              ? "rgba(52,211,153,0.16)"
              : "rgba(91,138,255,0.14)",
            borderColor: ready
              ? "rgba(52,211,153,0.4)"
              : "rgba(91,138,255,0.34)",
            color: ready ? "#34d399" : "#9fb9ff",
          }}
        >
          {ready ? <Trophy size={20} strokeWidth={1.9} /> : <Swords size={20} strokeWidth={1.9} />}
        </div>
        <div>
          <div className="text-[13.5px] font-bold text-fg">
            {savedFlash
              ? "¡Ficha guardada!"
              : ready
                ? "Misión lista para guardar"
                : "Completá la ficha del jugador"}
          </div>
          <div
            className="mt-0.5 text-[11.5px] text-fg-muted"
            style={{ fontFamily: MONO }}
          >
            {doneCount}/{total} objetivos
          </div>
        </div>
      </div>

      {/* objectives chips */}
      <div className="flex flex-1 flex-wrap justify-center gap-2">
        {checklist.map((o) => (
          <span
            key={o.key}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
            style={{
              background: o.done
                ? "rgba(52,211,153,0.1)"
                : "rgba(255,255,255,0.03)",
              borderColor: o.done
                ? "rgba(52,211,153,0.3)"
                : "rgba(255,255,255,0.08)",
              color: o.done ? "#34d399" : "rgba(255,255,255,0.5)",
            }}
          >
            {o.done ? (
              <CheckCircle2 size={14} strokeWidth={2} />
            ) : (
              <Circle size={14} strokeWidth={2} className="opacity-50" />
            )}
            {o.label}
          </span>
        ))}
      </div>

      {/* save button */}
      <button
        type="button"
        onClick={canSave ? onSave : undefined}
        disabled={!canSave}
        className="inline-flex items-center gap-2.5 rounded-xl px-[22px] py-3 text-sm font-bold tracking-wide transition disabled:cursor-not-allowed"
        style={{
          background: canSave
            ? "linear-gradient(135deg, #34d399, #10b981)"
            : "rgba(255,255,255,0.05)",
          border: canSave ? "none" : "1px solid rgba(255,255,255,0.1)",
          color: canSave ? "var(--success-text)" : "var(--fg-faint)",
          boxShadow: canSave ? "0 8px 24px rgba(52,211,153,0.35)" : "none",
        }}
        title={
          !editable
            ? "Solo el Arquitecto puede guardar"
            : !ready
              ? "Completá los 3 objetivos"
              : !dirty
                ? "No hay cambios para guardar"
                : undefined
        }
      >
        {canSave ? (
          <CheckCircle2 size={16} strokeWidth={2.2} />
        ) : (
          <Lock size={15} strokeWidth={2} />
        )}
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
