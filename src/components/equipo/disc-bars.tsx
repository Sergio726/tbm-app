"use client";

import { DISC_COLORS, DISC_FACTORS, type DiscLetter } from "@/lib/disc";
import type { DiscScoresShape } from "./types";
import { scoresToPct } from "./types";

const ORDER: DiscLetter[] = ["D", "I", "S", "C"];

export function DiscBars({
  letters,
  scores,
}: {
  letters: string;
  scores: DiscScoresShape;
}) {
  const primary = letters[0] as DiscLetter | undefined;
  const secondary = letters[1] as DiscLetter | undefined;
  const real = scoresToPct(scores);

  return (
    <div className="flex flex-col" style={{ gap: 10, marginTop: 14 }}>
      {ORDER.map((l) => {
        // Si tenemos scores reales del test, los usamos. Si no, fallback a
        // énfasis sintético según primario/secundario.
        const pct = real
          ? real[l]
          : l === primary
            ? 100
            : l === secondary
              ? 62
              : 22;
        const f = DISC_FACTORS[l];
        const c = DISC_COLORS[l];
        const isPrimary = l === primary;
        const dim = !real && l !== primary && l !== secondary;

        return (
          <div
            key={l}
            className="flex items-center"
            style={{ gap: 12, opacity: dim ? 0.45 : 1 }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: `${c}22`,
                border: `1px solid ${c}45`,
                color: c,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {l}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 4 }}
              >
                <span
                  className="flex items-center"
                  style={{ gap: 6, fontSize: 12.5, color: "#fff", fontWeight: 500 }}
                >
                  {f.shortName.replace(/^El\s/, "")}
                  {isPrimary && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: `${c}28`,
                        border: `1px solid ${c}50`,
                        color: c,
                        textTransform: "uppercase",
                      }}
                    >
                      Principal
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: c,
                    fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  }}
                >
                  {pct}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 99,
                    background: c,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
