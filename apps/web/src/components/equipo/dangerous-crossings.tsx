"use client";

import { Network, ShieldCheck } from "lucide-react";
import type { Profile } from "@/types/database";
import { detectDangerousCrossings, detectPairCrossings, presentPairKeys } from "@/lib/disc";
import { DiscConnectionsDiagram } from "./disc-connections-diagram";

// B6 — Mapa de Conexiones y Fricciones DISC. Tres lecturas, de canónica a secundaria:
//  1) diagrama del rombo, 2) cruces de temperamento PAR-A-PAR entre miembros,
//  3) señales de COMPOSICIÓN del equipo (heurísticas existentes, secundarias).
export function DangerousCrossings({ team }: { team: Profile[] }) {
  const withDisc = team.filter((m) => m.disc_letters).length;
  const pairCrossings = detectPairCrossings(team);
  const composition = detectDangerousCrossings(team);
  const present = presentPairKeys(team);

  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Network size={15} className="text-[#9fb9ff]" />
        <h3 className="text-[13.5px] font-semibold text-white">Conexiones y fricciones DISC</h3>
      </div>

      {withDisc < 2 ? (
        <p className="text-[12.5px] text-white/65">
          Cargá el DISC de al menos 2 miembros para ver el mapa de conexiones del equipo.
        </p>
      ) : (
        <div className="space-y-3.5">
          <DiscConnectionsDiagram presentPairs={present} />

          {/* Cruces de temperamento entre personas (canónico) */}
          {pairCrossings.length === 0 ? (
            <div className="flex items-center gap-2 text-[12.5px] text-[#34d399]">
              <ShieldCheck size={15} /> Sin cruces de temperamento entre miembros.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pairCrossings.map((c, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-3"
                  style={{ borderColor: "#fbbf2433", background: "#fbbf240e" }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: "#fbbf2422", color: "#fbbf24" }}
                    >
                      Cruce {c.pairLabel}
                    </span>
                    <span className="text-[13px] font-semibold text-white">{c.names}</span>
                  </div>
                  <p className="text-[12.5px] leading-snug text-white/65">{c.detalle}</p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-[#fbbf24]">→ {c.sugerencia}</p>
                </div>
              ))}
            </div>
          )}

          {/* Composición del equipo (señales secundarias) */}
          {composition.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/65">
                Composición del equipo
              </p>
              {composition.map((c, i) => {
                const tone = c.severity === "alta" ? "#f87171" : "#fbbf24";
                return (
                  <div
                    key={i}
                    className="rounded-xl border p-3"
                    style={{ borderColor: `${tone}33`, background: `${tone}0e` }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: `${tone}22`, color: tone }}
                      >
                        {c.severity}
                      </span>
                      <span className="text-[13px] font-semibold text-white">{c.titulo}</span>
                    </div>
                    <p className="text-[12.5px] leading-snug text-white/65">{c.detalle}</p>
                    <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: tone }}>
                      → {c.sugerencia}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
