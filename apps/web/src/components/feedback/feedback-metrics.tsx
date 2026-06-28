"use client";

import { AlertTriangle } from "lucide-react";
import type { Feedback, FeedbackType } from "@/types/database";
import { SEC_CONFIG } from "@/lib/feedback";

interface FeedbackMetricsProps {
  feedbacks: Feedback[];
}

export function FeedbackMetrics({ feedbacks: allFeedbacks }: FeedbackMetricsProps) {
  const delivered = allFeedbacks.filter((f) => !f.is_draft);

  const counts: Record<FeedbackType, number> = { S: 0, E: 0, C: 0 };
  for (const f of delivered) {
    const t = f.type as FeedbackType;
    if (t in counts) counts[t]++;
  }

  const total = counts.S + counts.E + counts.C;

  // Alerta: más de 14 días sin feedback entregado
  const lastDelivered = delivered
    .map((f) => f.delivered_at)
    .filter(Boolean)
    .map((d) => new Date(d!).getTime())
    .sort((a, b) => b - a)[0];

  const daysSinceLastFeedback = lastDelivered
    ? Math.floor((Date.now() - lastDelivered) / 86_400_000)
    : null;

  const alertNoDays = daysSinceLastFeedback !== null && daysSinceLastFeedback >= 14;

  // Alerta: últimos 5 feedbacks entregados son todos tipo C
  // Ordenar por delivered_at DESC antes de cortar para garantizar los más recientes
  const last5 = [...delivered]
    .sort(
      (a, b) =>
        new Date(b.delivered_at ?? b.created_at).getTime() -
        new Date(a.delivered_at ?? a.created_at).getTime()
    )
    .slice(0, 5);
  const alertAllC = last5.length >= 3 && last5.every((f) => f.type === "C");

  return (
    <div className="flex flex-col gap-3">
      {/* Conteo S/E/C */}
      <div className="flex gap-2">
        {(["S", "E", "C"] as FeedbackType[]).map((type) => {
          const cfg = SEC_CONFIG[type];
          return (
            <div
              key={type}
              className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
              style={{
                background: counts[type] > 0 ? cfg.bg : "rgba(255,255,255,0.02)",
                borderColor: counts[type] > 0 ? cfg.border : "rgba(255,255,255,0.07)",
              }}
            >
              <span
                className="text-xs font-black"
                style={{ color: counts[type] > 0 ? cfg.color : "rgba(255,255,255,0.3)" }}
              >
                {type}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: counts[type] > 0 ? cfg.color : "rgba(255,255,255,0.3)" }}
              >
                {counts[type]}
              </span>
            </div>
          );
        })}
        <div
          className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
            Total
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: total > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
          >
            {total}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {alertNoDays && (
        <div
          className="flex items-start gap-2 rounded-lg border p-3"
          style={{
            background: "rgba(251,191,36,0.07)",
            borderColor: "rgba(251,191,36,0.25)",
          }}
        >
          <AlertTriangle size={14} strokeWidth={2} style={{ color: "#fbbf24", marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
            Sin feedback entregado hace {daysSinceLastFeedback} días. El feedback frecuente construye equipo.
          </p>
        </div>
      )}

      {alertAllC && (
        <div
          className="flex items-start gap-2 rounded-lg border p-3"
          style={{
            background: "rgba(248,113,113,0.07)",
            borderColor: "rgba(248,113,113,0.25)",
          }}
        >
          <AlertTriangle size={14} strokeWidth={2} style={{ color: "#f87171", marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>
            Los últimos feedbacks fueron todos tipo C (Corregir). ¿Cuándo fue la última vez que reforzaste algo positivo?
          </p>
        </div>
      )}
    </div>
  );
}
