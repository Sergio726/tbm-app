"use client";

// Diagrama "Conexiones y fricciones DISC" (B6 · canónico §4 / Sesión 2).
// Rombo D arriba · I derecha · S abajo · C izquierda (misma geometría que disc-radar).
// Perímetro = conexión natural (sólida) · Diagonales = cruzado, requiere trabajo (punteada).

import { DISC_COLORS, pairKey, type DiscLetter } from "@/lib/disc";

const NATURAL = "#34d399";
const CRUZADO = "#fbbf24";

type Edge = { a: DiscLetter; b: DiscLetter; kind: "natural" | "cruzado" };

// 4 aristas del perímetro (naturales) + 2 diagonales (cruzados).
const EDGES: Edge[] = [
  { a: "D", b: "I", kind: "natural" },
  { a: "I", b: "S", kind: "natural" },
  { a: "S", b: "C", kind: "natural" },
  { a: "C", b: "D", kind: "natural" },
  { a: "D", b: "S", kind: "cruzado" },
  { a: "I", b: "C", kind: "cruzado" },
];

export function DiscConnectionsDiagram({
  presentPairs,
  size = 200,
}: {
  presentPairs?: Set<string>;
  size?: number;
}) {
  const c = size / 2;
  const R = 66;
  const order: DiscLetter[] = ["D", "I", "S", "C"];
  const ang: Record<DiscLetter, number> = { D: -90, I: 0, S: 90, C: 180 };
  const pt = (k: DiscLetter, frac = 1): [number, number] => {
    const a = (ang[k] * Math.PI) / 180;
    return [c + Math.cos(a) * R * frac, c + Math.sin(a) * R * frac];
  };

  return (
    <div>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label="Mapa de conexiones y fricciones DISC: perímetro = conexión natural, diagonales = temperamentos cruzados"
        style={{ display: "block", margin: "0 auto", overflow: "visible" }}
      >
        {EDGES.map((e) => {
          const [x1, y1] = pt(e.a);
          const [x2, y2] = pt(e.b);
          // Modo referencia (sin equipo): todas las aristas visibles parejas.
          // Modo equipo: resalta las parejas presentes y atenúa el resto.
          const present = presentPairs?.has(pairKey(e.a, e.b)) ?? false;
          const color = e.kind === "natural" ? NATURAL : CRUZADO;
          return (
            <line
              key={`${e.a}${e.b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={presentPairs ? (present ? 2.5 : 1.5) : 2}
              strokeOpacity={presentPairs ? (present ? 0.95 : 0.3) : 0.8}
              strokeDasharray={e.kind === "cruzado" ? "5 4" : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* vértices: letra con su color */}
        {order.map((k) => {
          const [x, y] = pt(k);
          const col = DISC_COLORS[k];
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={13} fill="var(--bg)" stroke={col} strokeWidth={1.5} />
              <text
                x={x}
                y={y + 4.5}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize={13}
                fontWeight={700}
                fill={col}
              >
                {k}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-white/55">
        <span className="flex items-center gap-1.5">
          <svg width="22" height="6" aria-hidden>
            <line x1="0" y1="3" x2="22" y2="3" stroke={NATURAL} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Conexión natural
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="22" height="6" aria-hidden>
            <line x1="0" y1="3" x2="22" y2="3" stroke={CRUZADO} strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
          </svg>
          Requiere trabajo
        </span>
      </div>
    </div>
  );
}
