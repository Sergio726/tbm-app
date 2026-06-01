"use client";

import { DISC_COLORS, type DiscLetter } from "@/lib/disc";
import type { DiscScoresShape } from "./types";
import { scoresToPct } from "./types";

// Diamante simple D-I-S-C que sirve como "atributos base".
// Usa scores reales si existen; si no, dibuja el shape sintético del primario.
export function DiscRadar({
  letters,
  scores,
  size = 130,
}: {
  letters: string;
  scores: DiscScoresShape;
  size?: number;
}) {
  const real = scoresToPct(scores);
  const primary = letters[0] as DiscLetter | undefined;
  const secondary = letters[1] as DiscLetter | undefined;

  const value = (l: DiscLetter) => {
    if (real) return real[l] / 100;
    if (l === primary) return 1;
    if (l === secondary) return 0.62;
    return 0.22;
  };

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;

  // D arriba, I derecha, S abajo, C izquierda.
  const point = (l: DiscLetter): [number, number] => {
    const v = value(l);
    if (l === "D") return [cx, cy - r * v];
    if (l === "I") return [cx + r * v, cy];
    if (l === "S") return [cx, cy + r * v];
    return [cx - r * v, cy]; // C
  };

  const labelPoint = (l: DiscLetter): [number, number] => {
    if (l === "D") return [cx, cy - r - 4];
    if (l === "I") return [cx + r + 8, cy + 3];
    if (l === "S") return [cx, cy + r + 12];
    return [cx - r - 8, cy + 3];
  };

  const polyPoints = (["D", "I", "S", "C"] as DiscLetter[])
    .map((l) => point(l).join(","))
    .join(" ");

  const axisPoints = (["D", "I", "S", "C"] as DiscLetter[]).map((l) => {
    if (l === "D") return [cx, cy - r];
    if (l === "I") return [cx + r, cy];
    if (l === "S") return [cx, cy + r];
    return [cx - r, cy];
  });

  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <div
        className="uppercase"
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: 1.4,
        }}
      >
        Atributos base
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grilla externa */}
        <polygon
          points={axisPoints.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
        {/* Grilla 50% */}
        <polygon
          points={axisPoints
            .map(([x, y]) => [cx + (x - cx) * 0.5, cy + (y - cy) * 0.5].join(","))
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
        {/* Ejes */}
        {axisPoints.map(([x, y], i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}
        {/* Forma */}
        <polygon
          points={polyPoints}
          fill="rgba(91,138,255,0.18)"
          stroke="rgba(91,138,255,0.7)"
          strokeWidth={1.5}
        />
        {/* Puntos por letra */}
        {(["D", "I", "S", "C"] as DiscLetter[]).map((l) => {
          const [x, y] = point(l);
          return (
            <circle
              key={l}
              cx={x}
              cy={y}
              r={3.5}
              fill={DISC_COLORS[l]}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={0.5}
            />
          );
        })}
        {/* Etiquetas */}
        {(["D", "I", "S", "C"] as DiscLetter[]).map((l) => {
          const [x, y] = labelPoint(l);
          return (
            <text
              key={l}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={DISC_COLORS[l]}
            >
              {l}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
