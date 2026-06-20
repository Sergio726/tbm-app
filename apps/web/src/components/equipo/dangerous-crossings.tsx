"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { Profile } from "@/types/database";
import { detectDangerousCrossings } from "@/lib/disc";

export function DangerousCrossings({ team }: { team: Profile[] }) {
  const crossings = detectDangerousCrossings(team);
  const withDisc = team.filter((m) => m.disc_letters).length;

  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <ShieldAlert size={15} className="text-[#fbbf24]" />
        <h3 className="text-[13.5px] font-semibold text-white">Cruces peligrosos del equipo</h3>
      </div>

      {withDisc < 2 ? (
        <p className="text-[12.5px] text-white/45">
          Cargá el DISC de al menos 2 miembros para detectar combinaciones de riesgo.
        </p>
      ) : crossings.length === 0 ? (
        <div className="flex items-center gap-2 text-[12.5px] text-[#34d399]">
          <ShieldCheck size={15} /> Sin cruces peligrosos detectados. El equipo está balanceado.
        </div>
      ) : (
        <div className="space-y-2.5">
          {crossings.map((c, i) => {
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
  );
}
