"use client";

import { useState } from "react";

interface Props {
  exerciseKey: string;
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
  integration?: "pre_games";
  placeholder?: string;
}

export function ExerciseText({
  exerciseKey,
  savedResponse,
  onSave,
  isPending,
  integration,
  placeholder = "Escribí tu respuesta aquí...",
}: Props) {
  const [text, setText] = useState<string>(() =>
    typeof savedResponse.text === "string" ? savedResponse.text : ""
  );

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border bg-transparent p-4 text-sm leading-relaxed outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.1)",
          color: "var(--fg)",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "rgba(91,138,255,0.4)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
        }
      />

      {integration === "pre_games" && (
        <div
          className="rounded-xl border p-3 text-xs"
          style={{
            background: "rgba(91,138,255,0.06)",
            borderColor: "rgba(91,138,255,0.2)",
            color: "var(--fg-subtle)",
          }}
        >
          Esta respuesta también se guardará en tu Pre-Game de hoy.
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {text.length > 0 ? `${text.length} caracteres` : ""}
        </span>
        <button
          onClick={() => onSave(exerciseKey, { text })}
          disabled={!text.trim() || isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: text.trim() ? "rgba(91,138,255,0.2)" : "rgba(255,255,255,0.04)",
            border: text.trim()
              ? "1px solid rgba(91,138,255,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            color: text.trim() ? "#9fb9ff" : "rgba(255,255,255,0.3)",
          }}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
