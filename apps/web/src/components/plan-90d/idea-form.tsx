"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface IdeaFormProps {
  isPending: boolean;
  onSubmit: (data: { idea: string; rationale: string; review_at: string }) => void;
  onCancel: () => void;
}

export function IdeaForm({ isPending, onSubmit, onCancel }: IdeaFormProps) {
  const [idea, setIdea] = useState("");
  const [rationale, setRationale] = useState("");

  // Fecha de liberación automática: 91 días a partir de hoy
  const reviewAt = new Date();
  reviewAt.setDate(reviewAt.getDate() + 91);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim()) return;
    onSubmit({
      idea: idea.trim(),
      rationale: rationale.trim(),
      review_at: reviewAt.toISOString(),
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
        <div>
          <p className="font-semibold text-white" style={{ fontSize: 14 }}>
            Parkear idea
          </p>
          <p style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 2 }}>
            Revisión automática en 91 días
          </p>
        </div>
        <button type="button" onClick={onCancel} style={{ color: "var(--fg-muted)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
            La idea *
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describí brevemente la idea…"
            rows={2}
            required
            className="w-full resize-none rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
            ¿Para qué sirve? (opcional)
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Contexto, hipótesis, potencial impacto…"
            rows={2}
            className="w-full resize-none rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

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
            disabled={isPending || !idea.trim()}
            className="flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: "#5b8aff", color: "white" }}
          >
            {isPending ? "Guardando…" : "Parkear"}
          </button>
        </div>
      </div>
    </form>
  );
}
