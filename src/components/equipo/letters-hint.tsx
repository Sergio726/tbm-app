"use client";

import { AlertTriangle } from "lucide-react";
import {
  DISC_COLORS,
  DISC_DIMENSIONS,
  normalizeLetters,
  primaryLetter,
  systemProfile,
} from "@/lib/disc";

export function LettersHint({ raw }: { raw: string }) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const norm = normalizeLetters(raw);

  if (!norm) {
    return (
      <div
        className="flex items-start"
        style={{ gap: 7, marginTop: 8, fontSize: 11.5, color: "#f87171", lineHeight: 1.4 }}
      >
        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          No reconocí letras DISC. Usá solo <strong>D</strong>, <strong>I</strong>,{" "}
          <strong>S</strong> o <strong>C</strong> — por ejemplo <strong>SC</strong> o{" "}
          <strong>DI</strong>.
        </span>
      </div>
    );
  }

  const primary = primaryLetter(norm);
  const sys = systemProfile(norm);
  const dim = primary ? DISC_DIMENSIONS[primary] : null;
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const dropped = norm !== trimmed.toUpperCase().replace(/\s/g, "");

  return (
    <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5 }}>
      <div className="flex items-center" style={{ gap: 7, flexWrap: "wrap" }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Se interpreta como</span>
        <span
          style={{
            fontWeight: 700,
            letterSpacing: 0.6,
            padding: "1px 7px",
            borderRadius: 6,
            background: `${color}22`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {norm}
        </span>
        {sys && (
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            {sys.icon} {sys.name}
          </span>
        )}
      </div>
      {dim && (
        <div style={{ color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
          Dominante: <span style={{ color }}>{dim.name}</span> — {dim.plain}
        </div>
      )}
      {dropped && (
        <div style={{ color: "#fbbf24", marginTop: 3 }}>
          Se usan solo las 2 primeras letras DISC válidas; el resto se ignora.
        </div>
      )}
    </div>
  );
}
