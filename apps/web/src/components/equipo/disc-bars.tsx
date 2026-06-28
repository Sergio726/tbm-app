"use client";

import { DISC_COLORS, DISC_FACTORS, type DiscLetter } from "@/lib/disc";
import { MONO } from "./types";

const ATTRS: { key: DiscLetter; name: string }[] = [
  { key: "D", name: "Dominante" },
  { key: "I", name: "Influyente" },
  { key: "S", name: "Seguro" },
  { key: "C", name: "Pensador" },
];

export function DiscBars({
  scores,
  primary,
}: {
  scores: { D: number; I: number; S: number; C: number };
  primary: DiscLetter;
}) {
  return (
    <div className="flex flex-col gap-1">
      {ATTRS.map((a) => (
        <StatBar
          key={a.key}
          letter={a.key}
          name={a.name}
          value={scores[a.key]}
          isPrimary={a.key === primary}
        />
      ))}
    </div>
  );
}

function StatBar({
  letter,
  name,
  value,
  isPrimary,
}: {
  letter: DiscLetter;
  name: string;
  value: number;
  isPrimary: boolean;
}) {
  const color = DISC_COLORS[letter];
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3 py-2"
      style={{
        background: isPrimary ? `${color}12` : "transparent",
        borderColor: isPrimary ? `${color}33` : "transparent",
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] border-[1.5px] text-[15px] font-bold"
        style={{
          background: `${color}22`,
          borderColor: color,
          color,
          fontFamily: MONO,
          boxShadow: isPrimary ? `0 0 14px ${color}55` : "none",
        }}
      >
        {letter}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-fg">{name}</span>
          {isPrimary && (
            <span
              className="rounded-[4px] border px-1.5 py-px text-[8.5px] font-extrabold uppercase tracking-wider"
              style={{
                background: `${color}24`,
                borderColor: `${color}55`,
                color,
              }}
            >
              Principal
            </span>
          )}
          <span
            className="ml-auto text-[12.5px] font-bold"
            style={{ color, fontFamily: MONO }}
          >
            {value}
          </span>
        </div>
        <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${value}%`,
              background: `linear-gradient(90deg, ${color}99, ${color})`,
              boxShadow: `0 0 10px ${color}66`,
              transformOrigin: "left",
              transition: "width .7s cubic-bezier(.2,.8,.2,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Detalle Luz/Sombra del primary letter (re-export para disc-section)
export function discFactorDetail(primary: DiscLetter) {
  return DISC_FACTORS[primary];
}
