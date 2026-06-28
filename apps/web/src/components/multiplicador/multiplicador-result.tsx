"use client";

import { RotateCcw } from "lucide-react";
import {
  MULTIPLICADOR_SINS,
  MULTIPLICADOR_TOOLS,
  scoreBandForTotal,
  type MultiplicadorDiagnostic,
} from "@/types/database";

function sinScore(d: MultiplicadorDiagnostic, keys: readonly { key: string }[]): number {
  return keys.reduce(
    (sum, q) => sum + ((d[q.key as keyof MultiplicadorDiagnostic] as number | null) ?? 0),
    0
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MultiplicadorResult({
  diagnostic,
  history,
  onRestart,
}: {
  diagnostic: MultiplicadorDiagnostic;
  history: MultiplicadorDiagnostic[];
  onRestart: () => void;
}) {
  const total = diagnostic.total_score ?? 0;
  const band = scoreBandForTotal(total);
  const previous = history.filter((h) => h.id !== diagnostic.id);

  return (
    <div className="flex flex-col gap-5">
      {/* Banda + score */}
      <section
        className="rounded-2xl border p-6 text-center"
        style={{
          background: `${band.color}12`,
          borderColor: `${band.color}40`,
        }}
      >
        <div className="text-[40px] leading-none">{band.emoji}</div>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span
            className="text-[38px] font-bold leading-none"
            style={{ color: band.color, fontFamily: 'ui-monospace, "JetBrains Mono", monospace' }}
          >
            {total}
          </span>
          <span className="text-[15px] text-fg-muted">/36</span>
        </div>
        <div className="mt-2 text-[17px] font-bold text-fg">{band.label}</div>
        <p className="mx-auto mt-1.5 max-w-[460px] text-[13px] leading-relaxed text-fg-muted">
          {band.resumen}
        </p>
        {diagnostic.team_capacity_pct != null && (
          <p className="mt-2 text-[11.5px] text-fg-muted">
            Capacidad del equipo en uso (tu percepción):{" "}
            <strong className="text-fg">{diagnostic.team_capacity_pct}%</strong>
          </p>
        )}
      </section>

      {/* Desglose por pecado */}
      <section
        className="rounded-2xl border p-5"
        style={{ background: "var(--elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 text-[12px] font-bold uppercase tracking-[1px] text-fg-muted">
          Tu desglose por pecado
        </div>
        <div className="flex flex-col gap-3">
          {MULTIPLICADOR_SINS.map((sin) => {
            const score = sinScore(diagnostic, sin.questions);
            const pct = (score / 12) * 100;
            // El color escala con el peso del pecado (más alto = peor).
            const color = score <= 5 ? "#34d399" : score <= 8 ? "#fbbf24" : "#f87171";
            return (
              <div key={sin.key}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="text-fg">
                    {sin.emoji} {sin.label}
                  </span>
                  <span className="font-semibold" style={{ color }}>
                    {score}/12
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--elevated)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Las 3 Herramientas del Multiplicador */}
      <section
        className="rounded-2xl border p-5"
        style={{ background: "var(--elevated)", borderColor: "var(--border)" }}
      >
        <div className="mb-1 text-[14px] font-semibold text-fg">
          Tus herramientas para multiplicar
        </div>
        <p className="mb-3.5 text-[12px] text-fg-muted">
          Aplicá una esta semana. El cambio es de hábito, no de personalidad.
        </p>
        <div className="flex flex-col gap-3">
          {MULTIPLICADOR_TOOLS.map((tool) => (
            <div
              key={tool.label}
              className="rounded-xl border p-3.5"
              style={{ background: "var(--elevated)", borderColor: "var(--border)" }}
            >
              <div className="text-[13.5px] font-semibold text-fg">
                {tool.emoji} {tool.label}
              </div>
              <div className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                {tool.mecanica}
              </div>
              <div
                className="mt-2 inline-block rounded-md px-2 py-1 text-[11.5px] font-medium"
                style={{ background: "rgba(91,138,255,0.12)", color: "var(--accent-text)" }}
              >
                Reto: {tool.reto}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historial / evolución */}
      {previous.length > 0 && (
        <section
          className="rounded-2xl border p-5"
          style={{ background: "var(--elevated)", borderColor: "var(--border)" }}
        >
          <div className="mb-3 text-[12px] font-bold uppercase tracking-[1px] text-fg-muted">
            Tu evolución
          </div>
          <div className="flex flex-col gap-2">
            {previous.map((h) => {
              const b = scoreBandForTotal(h.total_score ?? 0);
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px]"
                  style={{ background: "var(--elevated)" }}
                >
                  <span className="text-fg-muted">{fmtDate(h.created_at)}</span>
                  <span className="flex items-center gap-2">
                    <span style={{ color: b.color }} className="font-semibold">
                      {b.emoji} {h.total_score}/36
                    </span>
                    <span className="text-fg-muted">{b.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Repetir */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-[13.5px] font-semibold text-fg transition hover:bg-white/[0.05]"
          style={{ background: "rgba(91,138,255,0.08)", borderColor: "rgba(91,138,255,0.28)", color: "var(--accent-text)" }}
        >
          <RotateCcw size={15} strokeWidth={2} />
          Repetir diagnóstico
        </button>
      </div>
    </div>
  );
}
