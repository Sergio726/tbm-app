"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";

interface DecisionFormProps {
  isPending: boolean;
  onSubmit: (data: {
    decision_text: string;
    info_available: number;
    applied_70_rule: boolean;
    disagree_and_commit: boolean;
    disagree_with: string;
  }) => void;
  onCancel: () => void;
}

export function DecisionForm({ isPending, onSubmit, onCancel }: DecisionFormProps) {
  const [text, setText] = useState("");
  const [infoLevel, setInfoLevel] = useState(50);
  const [applied70, setApplied70] = useState(false);
  const [disagree, setDisagree] = useState(false);
  const [disagreeWith, setDisagreeWith] = useState("");

  const suggest70 = infoLevel >= 70 && !applied70;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({
      decision_text: text.trim(),
      info_available: infoLevel,
      applied_70_rule: applied70,
      disagree_and_commit: disagree,
      disagree_with: disagreeWith.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5"
      style={{
        borderColor: "rgba(91,138,255,0.25)",
        background: "rgba(91,138,255,0.04)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-white" style={{ fontSize: 14 }}>
          Registrar decisión
        </p>
        <button type="button" onClick={onCancel} style={{ color: "var(--fg-muted)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
            ¿Qué decisión tomaste? *
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describí la decisión con claridad…"
            rows={3}
            required
            className="w-full resize-none rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
              % de información que tenías al decidir
            </label>
            <span
              className="font-bold tabular-nums"
              style={{
                fontSize: 15,
                color: infoLevel >= 70 ? "#34d399" : infoLevel >= 50 ? "#fbbf24" : "#f87171",
              }}
            >
              {infoLevel}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={infoLevel}
            onChange={(e) => setInfoLevel(Number(e.target.value))}
            className="w-full accent-[#5b8aff]"
          />
        </div>

        {/* Sugerencia regla 70% */}
        {suggest70 && (
          <div
            className="flex items-start gap-2 rounded-xl border p-3"
            style={{
              background: "rgba(52,211,153,0.07)",
              borderColor: "rgba(52,211,153,0.2)",
            }}
          >
            <Info size={13} style={{ color: "#34d399", marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#34d399", lineHeight: 1.5 }}>
              Tenés ≥70% de la información. Aplicá la Regla del 70%: decidí ahora, no esperes el 100%.
            </p>
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={applied70}
            onChange={(e) => setApplied70(e.target.checked)}
            className="mt-0.5 accent-[#5b8aff]"
          />
          <div>
            <p className="text-sm font-medium text-white">Apliqué la Regla del 70%</p>
            <p style={{ fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.4 }}>
              Decidí con ≥70% de la info, sin esperar certeza total
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={disagree}
            onChange={(e) => setDisagree(e.target.checked)}
            className="mt-0.5 accent-[#5b8aff]"
          />
          <div>
            <p className="text-sm font-medium text-white">Disagree & Commit</p>
            <p style={{ fontSize: 11.5, color: "var(--fg-muted)", lineHeight: 1.4 }}>
              Alguien no estuvo de acuerdo pero igual se ejecutó
            </p>
          </div>
        </label>

        {disagree && (
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
              ¿Quién no estuvo de acuerdo?
            </label>
            <input
              type="text"
              value={disagreeWith}
              onChange={(e) => setDisagreeWith(e.target.value)}
              placeholder="Nombre del colaborador"
              className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl py-2 text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-muted)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: "#5b8aff", color: "white" }}
          >
            {isPending ? "Guardando…" : "Registrar"}
          </button>
        </div>
      </div>
    </form>
  );
}
