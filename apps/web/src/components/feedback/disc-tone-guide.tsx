"use client";

import { AlertTriangle } from "lucide-react";
import type { FeedbackType } from "@/types/database";
import type { DiscLetter } from "@/lib/disc";
import { DISC_COLORS } from "@/lib/disc";
import { getToneGuide, SEC_CONFIG } from "@/lib/feedback";

interface DiscToneGuideProps {
  feedbackType: FeedbackType | null;
  discLetter: DiscLetter | null;
}

export function DiscToneGuide({ feedbackType, discLetter }: DiscToneGuideProps) {
  const guide = getToneGuide(feedbackType, discLetter);

  if (!feedbackType || !discLetter) {
    return (
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <p
          className="text-center text-xs"
          style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}
        >
          Seleccioná un colaborador y el tipo de feedback para ver la guía de tono DISC.
        </p>
      </div>
    );
  }

  const typeColor = SEC_CONFIG[feedbackType].color;
  const discColor = DISC_COLORS[discLetter];

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-xs font-black"
          style={{
            background: `${typeColor}22`,
            color: typeColor,
            border: `1px solid ${typeColor}44`,
          }}
        >
          {feedbackType}
        </span>
        <span
          className="rounded-md px-2 py-0.5 text-xs font-bold"
          style={{
            background: `${discColor}22`,
            color: discColor,
            border: `1px solid ${discColor}44`,
          }}
        >
          {discLetter}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--fg-muted)" }}
        >
          Guía de tono
        </span>
      </div>

      {guide ? (
        <>
          <p
            className="mb-3 font-semibold"
            style={{ fontSize: 12.5, color: "var(--fg-muted)" }}
          >
            {guide.title}
          </p>
          <ul className="flex flex-col gap-2">
            {guide.tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-2"
                style={{ fontSize: 12, color: "var(--fg-subtle)", lineHeight: 1.5 }}
              >
                <span style={{ color: typeColor, marginTop: 1 }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
          {guide.warning && (
            <div
              className="mt-3 flex gap-2 rounded-lg p-3"
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              <AlertTriangle
                size={13}
                strokeWidth={2}
                className="shrink-0"
                style={{ color: "#fbbf24", marginTop: 1 }}
              />
              <p style={{ fontSize: 11.5, color: "#fbbf24", lineHeight: 1.5 }}>
                {guide.warning}
              </p>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          No hay guía para esta combinación.
        </p>
      )}
    </div>
  );
}
