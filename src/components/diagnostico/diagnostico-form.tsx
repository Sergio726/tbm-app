"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Send,
  MessageSquare,
  Workflow,
  Clock,
  CircleDollarSign,
  Heart,
  Check,
  type LucideIcon,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { SCORECARD_AREAS, type Scorecard, type ScorecardKey } from "@/types/database";

const AREA_ICONS: Record<ScorecardKey, LucideIcon> = {
  score_liderazgo: Shield,
  score_equipo: Users,
  score_delegacion: Send,
  score_comunicacion: MessageSquare,
  score_procesos: Workflow,
  score_tiempo: Clock,
  score_dinero: CircleDollarSign,
  score_cultura: Heart,
};

const SCORE_LABELS = ["Crítico", "Bajo", "Regular", "Bien", "Excelente"];
const SCORE_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399"];

export function DiagnosticoForm({
  userId,
  companyId,
  lastScorecard,
}: {
  userId: string;
  companyId: string;
  lastScorecard: Scorecard | null;
}) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<ScorecardKey, number>>(() =>
    Object.fromEntries(
      SCORECARD_AREAS.map((a) => [
        a.key,
        (lastScorecard?.[a.key] as number | null) ?? 3,
      ])
    ) as Record<ScorecardKey, number>
  );
  const [notes, setNotes] = useState("");

  const avg = (
    SCORECARD_AREAS.reduce((s, a) => s + scores[a.key], 0) / SCORECARD_AREAS.length
  ).toFixed(1);

  const save = () => {
    setError(null);
    startTransition(async () => {
      const { error: err } = await supabase.from("scorecards").insert({
        company_id: companyId,
        user_id: userId,
        ...scores,
        notes: notes.trim() || null,
        is_baseline: false,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3.5">
      {SCORECARD_AREAS.map((area) => {
        const Icon = AREA_ICONS[area.key];
        const value = scores[area.key];
        return (
          <div
            key={area.key}
            className="rounded-2xl border p-4"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                  style={{
                    background: `${SCORE_COLORS[value - 1]}1a`,
                    border: `1px solid ${SCORE_COLORS[value - 1]}38`,
                    color: SCORE_COLORS[value - 1],
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-white">
                    {area.label}
                  </div>
                  <div className="truncate text-[11.5px] text-white/45">
                    {area.descripcion}
                  </div>
                </div>
              </div>

              {/* selector 1–5 */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = value === n;
                  const color = SCORE_COLORS[n - 1];
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setScores((s) => ({ ...s, [area.key]: n }))
                      }
                      title={SCORE_LABELS[n - 1]}
                      className="flex h-9 w-9 items-center justify-center rounded-[10px] border text-[13px] font-bold transition"
                      style={{
                        background: active ? `${color}26` : "rgba(255,255,255,0.03)",
                        borderColor: active ? `${color}77` : "rgba(255,255,255,0.08)",
                        color: active ? color : "rgba(255,255,255,0.45)",
                        boxShadow: active ? `0 0 14px ${color}30` : "none",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
                <span
                  className="ml-1.5 w-[72px] text-right text-[11.5px] font-semibold"
                  style={{ color: SCORE_COLORS[value - 1] }}
                >
                  {SCORE_LABELS[value - 1]}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Notas */}
      <div
        className="rounded-2xl border p-4"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-2 text-[12px] font-semibold text-white/60">
          Reflexión libre (opcional)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="¿Qué cambió desde la última evaluación? ¿Qué explicás de los números?"
          className="w-full resize-y rounded-xl border bg-transparent p-3 text-sm leading-relaxed outline-none transition"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.09)",
            color: "rgba(255,255,255,0.85)",
          }}
        />
      </div>

      {error && (
        <div
          className="rounded-xl border px-4 py-2.5 text-[13px]"
          style={{
            background: "rgba(248,113,113,0.10)",
            borderColor: "rgba(248,113,113,0.30)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* Footer: promedio + guardar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-white/50">Promedio</span>
          <span
            className="text-[20px] font-bold text-[#9fb9ff]"
            style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace' }}
          >
            {avg}
          </span>
          <span className="text-[12px] text-white/40">/5</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border-0 px-5 py-3 text-[13.5px] font-semibold text-white transition disabled:opacity-60"
          style={{
            background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
            boxShadow: "0 6px 18px rgba(54,114,255,0.3)",
          }}
        >
          <Check size={15} strokeWidth={2.2} />
          {isPending ? "Guardando…" : "Guardar evaluación"}
        </button>
      </div>
    </div>
  );
}
