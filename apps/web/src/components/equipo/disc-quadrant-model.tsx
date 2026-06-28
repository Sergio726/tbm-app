"use client";

import { Target, Megaphone, Search, HeartHandshake, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DISC_COLORS,
  DISC_DIMENSIONS,
  DISC_ATTRS,
  normalizeLetters,
  type DiscLetter,
} from "@/lib/disc";

const ICONS: Record<DiscLetter, LucideIcon> = {
  D: Target,
  I: Megaphone,
  S: HeartHandshake,
  C: Search,
};

// Posición en el cuadrante (igual a la imagen de referencia):
//   D arriba-izq · I arriba-der · C abajo-izq · S abajo-der
const GRID_ORDER: DiscLetter[] = ["D", "I", "C", "S"];

/**
 * Modelo DISC de 4 cuadrantes (reemplaza el radar "Atributos base", N5).
 * Resalta el estilo primario del miembro y marca suave el secundario.
 * Naming canónico de la app (D Dominante · I Influyente · S Seguro · C Pensador).
 */
export function DiscQuadrantModel({
  primary,
  code,
}: {
  primary: DiscLetter;
  code?: string;
}) {
  const norm = normalizeLetters(code);
  const secondary = (norm[1] as DiscLetter | undefined) ?? null;

  return (
    <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.015] p-3.5">
      <div className="mb-3 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[1.4px] text-white/45">
          Modelo DISC
        </div>
        <div className="text-[11px] text-white/35">Los 4 estilos de comportamiento</div>
      </div>

      {/* Eje vertical · arriba */}
      <AxisLabel>Extrovertido · Activo</AxisLabel>

      <div className="flex items-stretch gap-1.5">
        {/* Eje horizontal · izquierda */}
        <SideAxis>Orientado a tareas</SideAxis>

        <div className="grid flex-1 grid-cols-2 gap-2">
          {GRID_ORDER.map((k) => (
            <QuadrantCard
              key={k}
              letter={k}
              state={k === primary ? "primary" : k === secondary ? "secondary" : "dim"}
            />
          ))}
        </div>

        {/* Eje horizontal · derecha */}
        <SideAxis>Orientado a personas</SideAxis>
      </div>

      {/* Eje vertical · abajo */}
      <AxisLabel>Introvertido · Reflexivo</AxisLabel>
    </div>
  );
}

function QuadrantCard({
  letter,
  state,
}: {
  letter: DiscLetter;
  state: "primary" | "secondary" | "dim";
}) {
  const color = DISC_COLORS[letter];
  const Icon = ICONS[letter];
  const name = DISC_DIMENSIONS[letter].name;
  const { attrs } = DISC_ATTRS[letter];

  const isPrimary = state === "primary";
  const isSecondary = state === "secondary";
  const active = isPrimary || isSecondary;

  return (
    <div
      className="relative flex flex-col rounded-xl border p-2.5 transition"
      style={{
        background: active ? `${color}14` : "rgba(255,255,255,0.02)",
        borderColor: isPrimary ? `${color}cc` : isSecondary ? `${color}66` : "rgba(255,255,255,0.06)",
        boxShadow: isPrimary ? `0 0 20px ${color}33` : "none",
        opacity: state === "dim" ? 0.5 : 1,
      }}
    >
      {isPrimary && (
        <span
          className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-white"
          style={{ background: color }}
        >
          Su estilo
        </span>
      )}
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={15} strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <span className="text-[16px] font-extrabold" style={{ color }}>
            {letter}
          </span>{" "}
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/70">
            {name}
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {attrs.map((a) => (
          <li key={a} className="flex items-start gap-1.5 text-[11px] leading-snug text-white/65">
            <Check size={11} strokeWidth={2.6} className="mt-[2px] flex-shrink-0" style={{ color }} />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1 text-center text-[9.5px] font-semibold uppercase tracking-[1.2px] text-white/35">
      {children}
    </div>
  );
}

function SideAxis({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="hidden items-center justify-center text-[9px] font-semibold uppercase tracking-[1px] text-white/30 sm:flex"
      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
    >
      {children}
    </div>
  );
}
