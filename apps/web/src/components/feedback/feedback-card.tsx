"use client";

import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import type { Feedback, FeedbackType } from "@/types/database";
import { SEC_CONFIG } from "@/lib/feedback";
import { humanDate } from "@/lib/dates";

interface FeedbackCardProps {
  feedback: Feedback;
  onDeliver?: (id: string) => void;
  delivering?: boolean;
}

export function FeedbackCard({ feedback, onDeliver, delivering }: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEC_CONFIG[feedback.type as FeedbackType];
  const preview = feedback.content.slice(0, 130);
  const hasMore = feedback.content.length > 130;

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${cfg.color}`,
      }}
    >
      {/* Header row */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-xs font-black"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {feedback.type}
        </span>
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}>
          {cfg.label}
        </span>

        {feedback.is_draft ? (
          <span
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{
              background: "rgba(251,191,36,0.1)",
              color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.25)",
            }}
          >
            <Clock size={10} strokeWidth={2} />
            Borrador
          </span>
        ) : (
          <span
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{
              background: "rgba(52,211,153,0.1)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.25)",
            }}
          >
            <CheckCircle size={10} strokeWidth={2} />
            Entregado
          </span>
        )}
      </div>

      {/* Date */}
      <p className="mb-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        {feedback.is_draft
          ? `Borrador — ${humanDate(feedback.created_at)}`
          : feedback.delivered_at
            ? `Entregado el ${humanDate(feedback.delivered_at)}`
            : humanDate(feedback.created_at)}
      </p>

      {/* Content */}
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
        {expanded ? feedback.content : preview}
        {hasMore && !expanded && "…"}
      </p>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs"
          style={{ color: "rgba(91,138,255,0.7)" }}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}

      {/* Deliver button (only for drafts) */}
      {feedback.is_draft && onDeliver && (
        <button
          onClick={() => onDeliver(feedback.id)}
          disabled={delivering}
          className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "rgba(52,211,153,0.12)",
            color: "#34d399",
            border: "1px solid rgba(52,211,153,0.3)",
          }}
        >
          <CheckCircle size={12} strokeWidth={2} />
          {delivering ? "Guardando…" : "Marcar como entregado"}
        </button>
      )}
    </div>
  );
}
