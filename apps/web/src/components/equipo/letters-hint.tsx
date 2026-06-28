"use client";

import { AlertTriangle } from "lucide-react";
import { DISC_COLORS, normalizeLetters } from "@/lib/disc";
import { archetypeFor, MONO } from "./types";

/**
 * Caja "Se interpreta como…" con la lectura semántica del input.
 * Mostrada al lado del input de letras (no debajo).
 */
export function LettersHintBox({ raw }: { raw: string }) {
  const trimmed = raw.trim();
  const norm = normalizeLetters(raw);

  if (trimmed && !norm) {
    return (
      <div className="flex h-full items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3 text-[12px] leading-snug text-red-300">
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          No reconocí letras DISC. Usá solo <strong>D</strong>, <strong>I</strong>,{" "}
          <strong>S</strong> o <strong>C</strong> — por ejemplo <strong>SC</strong> o{" "}
          <strong>DI</strong>.
        </span>
      </div>
    );
  }

  const arch = archetypeFor(norm);
  const color = DISC_COLORS[arch.primary] ?? "#f87171";

  return (
    <div className="flex h-full flex-col justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
        <span className="text-[12px] text-fg-muted">Se interpreta como</span>
        <span
          className="rounded-md border px-1.5 py-0.5 text-[12px] font-bold"
          style={{
            background: `${color}1c`,
            borderColor: `${color}3a`,
            color,
            fontFamily: MONO,
          }}
        >
          {norm || "—"}
        </span>
        <span className="text-[13.5px] font-bold text-fg">
          {arch.emoji} {arch.name}
        </span>
      </div>
      <div className="text-[12.5px] leading-snug text-fg-muted">{arch.desc}</div>
    </div>
  );
}
