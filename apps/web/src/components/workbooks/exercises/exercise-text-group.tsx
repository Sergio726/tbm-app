"use client";

import { useState } from "react";

interface Props {
  exerciseKey: string;
  questions: string[];
  savedResponse: Record<string, unknown>;
  onSave: (key: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

export function ExerciseTextGroup({ exerciseKey, questions, savedResponse, onSave, isPending }: Props) {
  const [answers, setAnswers] = useState<string[]>(() => {
    const saved = savedResponse.answers;
    if (Array.isArray(saved)) return questions.map((_, i) => (typeof saved[i] === "string" ? saved[i] : ""));
    return questions.map(() => "");
  });

  const setAnswer = (i: number, val: string) =>
    setAnswers((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const allFilled = answers.every((a) => a.trim().length > 0);

  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <div key={i}>
          <label
            className="mb-2 block text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {i + 1}. {q}
          </label>
          <textarea
            value={answers[i]}
            onChange={(e) => setAnswer(i, e.target.value)}
            rows={3}
            placeholder="Tu respuesta..."
            className="w-full resize-none rounded-xl border bg-transparent p-3 text-sm leading-relaxed outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91,138,255,0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={() => onSave(exerciseKey, { answers })}
          disabled={!allFilled || isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: allFilled ? "rgba(91,138,255,0.2)" : "rgba(255,255,255,0.04)",
            border: allFilled
              ? "1px solid rgba(91,138,255,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            color: allFilled ? "#9fb9ff" : "rgba(255,255,255,0.3)",
          }}
        >
          {isPending ? "Guardando..." : "Guardar Respuestas"}
        </button>
      </div>
    </div>
  );
}
