"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { rockProgressColor } from "@/lib/plan90d";

interface ProgressModalProps {
  rockTitle: string;
  currentProgress: number;
  isPending: boolean;
  onSubmit: (progress: number, note: string) => void;
  onClose: () => void;
}

export function ProgressModal({
  rockTitle,
  currentProgress,
  isPending,
  onSubmit,
  onClose,
}: ProgressModalProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(progress, note.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          background: "#0d1120",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="font-semibold text-white" style={{ fontSize: 15 }}>
              Actualizar avance
            </p>
            <p
              className="mt-0.5 line-clamp-1"
              style={{ fontSize: 12.5, color: "rgba(255,255,255,0.62)" }}
            >
              {rockTitle}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.62)" }} className="hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                % de avance
              </label>
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: rockProgressColor(progress) }}
              >
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#5b8aff]"
            />
            <div
              className="mt-1 h-2 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: rockProgressColor(progress),
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Nota del check-in (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="¿Qué avanzaste esta semana? ¿Algún obstáculo?"
              rows={3}
              className="w-full resize-none rounded-xl border px-3 py-2 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "#5b8aff", color: "white" }}
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
