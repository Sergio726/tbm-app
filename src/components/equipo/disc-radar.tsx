"use client";

import { DISC_COLORS, type DiscLetter } from "@/lib/disc";

export function DiscRadar({
  scores,
  primary,
  size = 188,
}: {
  scores: { D: number; I: number; S: number; C: number };
  primary: DiscLetter;
  size?: number;
}) {
  const c = size / 2;
  const R = 70;
  const order: DiscLetter[] = ["D", "I", "S", "C"];
  // D arriba (-90°), I derecha (0°), S abajo (90°), C izquierda (180°)
  const ang: Record<DiscLetter, number> = { D: -90, I: 0, S: 90, C: 180 };
  const pt = (k: DiscLetter, frac: number): [number, number] => {
    const a = (ang[k] * Math.PI) / 180;
    return [c + Math.cos(a) * R * frac, c + Math.sin(a) * R * frac];
  };
  const poly = order
    .map((k) => pt(k, scores[k] / 100))
    .map((p) => p.join(","))
    .join(" ");
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`Radar DISC — D ${scores.D}, I ${scores.I}, S ${scores.S}, C ${scores.C}`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5b8aff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#5b8aff" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {/* grid rings (diamonds) */}
      {rings.map((r, i) => (
        <polygon
          key={i}
          points={order.map((k) => pt(k, r).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      {order.map((k) => {
        const [x, y] = pt(k, 1);
        return (
          <line
            key={k}
            x1={c}
            y1={c}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />
        );
      })}
      {/* data polygon */}
      <polygon
        points={poly}
        fill="url(#radar-fill)"
        stroke="#5b8aff"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* vertices */}
      {order.map((k) => {
        const [x, y] = pt(k, scores[k] / 100);
        const col = DISC_COLORS[k];
        const isP = k === primary;
        return (
          <g key={k}>
            <circle
              cx={x}
              cy={y}
              r={isP ? 5.5 : 4}
              fill={col}
              stroke="#0a0e1a"
              strokeWidth={1.5}
            />
            {isP && (
              <circle
                cx={x}
                cy={y}
                r={9}
                fill="none"
                stroke={col}
                strokeWidth={1.5}
                opacity={0.5}
              >
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}
      {/* axis labels */}
      {order.map((k) => {
        const [x, y] = pt(k, 1.28);
        return (
          <text
            key={k}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize={13}
            fontWeight={700}
            fill={DISC_COLORS[k]}
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}
