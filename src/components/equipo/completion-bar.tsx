"use client";

import { Check, Circle, Lock, Save, ClipboardCheck, AlertTriangle } from "lucide-react";
import type { ChecklistItem } from "./types";

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
  const completed = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const allDone = completed === total;
  const canSave = editable && dirty && allDone && !saving;

  return (
    <div
      className="fixed"
      style={{
        bottom: 0,
        left: "var(--sidebar-width, 0px)",
        right: 0,
        zIndex: 30,
        padding: "12px 24px",
        background: "rgba(8,12,22,0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: 16,
          maxWidth: 1600,
          margin: "0 auto",
          flexWrap: "wrap",
        }}
      >
        <div className="flex items-center" style={{ gap: 11, minWidth: 0 }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: allDone
                ? "rgba(52,211,153,0.15)"
                : "rgba(91,138,255,0.15)",
              border: allDone
                ? "1px solid rgba(52,211,153,0.35)"
                : "1px solid rgba(91,138,255,0.32)",
              color: allDone ? "#34d399" : "#bcd0ff",
            }}
          >
            <ClipboardCheck size={17} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>
              {allDone ? "Ficha completa" : "Completá la ficha del jugador"}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.55)",
                marginTop: 1,
                fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              }}
            >
              {completed}/{total} objetivos
            </div>
          </div>
        </div>

        {/* Chips de los objetivos */}
        <div
          className="flex items-center"
          style={{ gap: 8, flex: 1, flexWrap: "wrap", minWidth: 0 }}
        >
          {checklist.map((item) => (
            <ChecklistChip key={item.key} item={item} />
          ))}
        </div>

        {/* Status + Save */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {savedFlash && (
            <span
              className="flex items-center"
              style={{ gap: 6, fontSize: 12.5, color: "#34d399" }}
            >
              <Check size={14} /> Guardado
            </span>
          )}
          {dirty && !allDone && !savedFlash && (
            <span
              className="flex items-center"
              style={{ gap: 6, fontSize: 11.5, color: "#fbbf24" }}
            >
              <AlertTriangle size={12} />
              <span className="hidden sm:inline">Completá los objetivos para guardar</span>
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="flex items-center transition-all"
            title={
              !editable
                ? "Solo el Arquitecto puede guardar"
                : !allDone
                  ? "Completá los 3 objetivos para guardar"
                  : !dirty
                    ? "No hay cambios para guardar"
                    : undefined
            }
            style={{
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: canSave
                ? "linear-gradient(180deg, #4f86ff, #2c5fe6)"
                : "rgba(255,255,255,0.06)",
              color: canSave ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: canSave ? "pointer" : "not-allowed",
              boxShadow: canSave ? "0 6px 18px rgba(54,114,255,0.3)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {canSave ? <Save size={14} /> : <Lock size={13} />}
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistChip({ item }: { item: ChecklistItem }) {
  return (
    <span
      className="flex items-center"
      style={{
        gap: 6,
        fontSize: 11.5,
        fontWeight: 500,
        padding: "5px 11px",
        borderRadius: 999,
        background: item.done
          ? "rgba(52,211,153,0.10)"
          : "rgba(255,255,255,0.03)",
        border: item.done
          ? "1px solid rgba(52,211,153,0.30)"
          : "1px solid rgba(255,255,255,0.08)",
        color: item.done ? "#34d399" : "rgba(255,255,255,0.5)",
      }}
    >
      {item.done ? <Check size={11} /> : <Circle size={11} />}
      {item.label}
    </span>
  );
}
