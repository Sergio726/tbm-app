"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  MULTIPLICADOR_SINS,
  MULTIPLICADOR_SCALE,
  type MultiplicadorDiagnostic,
  type MultiplicadorQuestionKey,
} from "@/types/database";
import { MultiplicadorResult } from "./multiplicador-result";

const CAPACITY_RANGES = [
  { value: 40, label: "0–50%", desc: "Solo ejecutan órdenes, yo decido todo" },
  { value: 65, label: "51–80%", desc: "Aportan ideas, pero yo tengo la última palabra siempre" },
  { value: 90, label: "81–100%", desc: "Toman decisiones complejas sin mí y me sorprenden" },
];

type Answers = Partial<Record<MultiplicadorQuestionKey, number>>;

export function MultiplicadorClient({
  userId,
  companyId,
  history,
}: {
  userId: string;
  companyId: string;
  history: MultiplicadorDiagnostic[];
}) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const latest = history[0] ?? null;
  // Si ya hay un diagnóstico, arrancamos mostrando el resultado; si no, el form.
  const [view, setView] = useState<"form" | "result">(latest ? "result" : "form");
  const [saved, setSaved] = useState<MultiplicadorDiagnostic | null>(latest);

  const [capacity, setCapacity] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answers>({});

  const allQuestions = useMemo(
    () => MULTIPLICADOR_SINS.flatMap((s) => s.questions.map((q) => q.key)),
    []
  );
  const answeredCount = allQuestions.filter((k) => answers[k] != null).length;
  const complete = capacity != null && answeredCount === allQuestions.length;

  const save = () => {
    if (!complete) return;
    setError(null);
    startTransition(async () => {
      const { data, error: err } = await supabase
        .from("multiplicador_diagnostics")
        .insert({
          company_id: companyId,
          user_id: userId,
          team_capacity_pct: capacity,
          ...answers,
        })
        .select("*")
        .single();
      if (err) {
        setError(err.message);
        return;
      }
      setSaved(data as MultiplicadorDiagnostic);
      setView("result");
      router.refresh();
    });
  };

  const restart = () => {
    setCapacity(null);
    setAnswers({});
    setError(null);
    setView("form");
  };

  if (view === "result" && saved) {
    return (
      <MultiplicadorResult
        diagnostic={saved}
        history={history}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Pregunta de entrada — capacidad del equipo */}
      <section
        className="rounded-2xl border p-5"
        style={{
          background: "rgba(251,191,36,0.05)",
          borderColor: "rgba(251,191,36,0.18)",
        }}
      >
        <div className="mb-1 text-[14.5px] font-semibold text-fg">
          ¿Cuánto de la capacidad mental y creativa de tu equipo estás usando hoy?
        </div>
        <p className="mb-3.5 text-[12px] text-fg-muted">
          Si marcás menos del 80%, estás perdiendo dinero en cada nómina.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {CAPACITY_RANGES.map((r) => {
            const active = capacity === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setCapacity(r.value)}
                className="flex-1 rounded-xl border p-3 text-left transition"
                style={{
                  background: active ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.03)",
                  borderColor: active ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="text-[14px] font-bold"
                  style={{ color: active ? "#fcd34d" : "rgba(255,255,255,0.8)" }}
                >
                  {r.label}
                </div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-fg-muted">
                  {r.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Los 3 Pecados — 9 preguntas escala 1–4 */}
      {MULTIPLICADOR_SINS.map((sin) => (
        <section
          key={sin.key}
          className="rounded-2xl border p-5"
          style={{
            background: "var(--elevated)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-3.5">
            <div className="text-[15px] font-semibold text-fg">
              {sin.emoji} {sin.label}
            </div>
            <div className="text-[12px] text-fg-muted">
              {sin.descripcion} · <span className="italic">{sin.sintoma}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {sin.questions.map((q) => {
              const value = answers[q.key];
              return (
                <div key={q.key} className="flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 text-[13.5px] text-fg">
                    {q.text}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((n) => {
                      const active = value === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          title={MULTIPLICADOR_SCALE[n - 1]}
                          onClick={() => setAnswers((a) => ({ ...a, [q.key]: n }))}
                          className="flex h-9 w-9 items-center justify-center rounded-[10px] border text-[13px] font-bold transition"
                          style={{
                            background: active ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.03)",
                            borderColor: active ? "rgba(251,191,36,0.6)" : "rgba(255,255,255,0.08)",
                            color: active ? "#fcd34d" : "rgba(255,255,255,0.45)",
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-[11.5px] text-fg-muted">
        Escala: 1 = {MULTIPLICADOR_SCALE[0]} · 2 = {MULTIPLICADOR_SCALE[1]} · 3 ={" "}
        {MULTIPLICADOR_SCALE[2]} · 4 = {MULTIPLICADOR_SCALE[3]}
      </p>

      {error && (
        <div
          className="rounded-xl border px-4 py-2.5 text-[13px]"
          style={{
            background: "rgba(248,113,113,0.10)",
            borderColor: "rgba(248,113,113,0.30)",
            color: "var(--danger-text)",
          }}
        >
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[12.5px] text-fg-muted">
          {answeredCount}/{allQuestions.length} respondidas
          {capacity == null && " · falta la pregunta de capacidad"}
        </div>
        <div className="flex items-center gap-2">
          {latest && (
            <button
              type="button"
              onClick={() => setView("result")}
              className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-3 text-[13px] font-semibold text-fg transition hover:text-fg"
              style={{ borderColor: "var(--border-strong)" }}
            >
              <RotateCcw size={14} />
              Ver último resultado
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={isPending || !complete}
            className="inline-flex items-center gap-2 rounded-xl border-0 px-5 py-3 text-[13.5px] font-semibold text-fg transition disabled:opacity-50"
            style={{
              background: "linear-gradient(180deg, #f0b429, #d99708)",
              boxShadow: "0 6px 18px rgba(217,151,8,0.3)",
            }}
          >
            <Check size={15} strokeWidth={2.2} />
            {isPending ? "Calculando…" : "Ver mi resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}
