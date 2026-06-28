"use client";

import { Target, CheckCircle2, Swords, Sparkles, Info } from "lucide-react";
import {
  ALIGNMENT_ACTION,
  computeAlignment,
  type AlignmentValue,
} from "@/lib/disc";
import { Panel, FieldLabel, TextInput } from "./primitives";
import { MONO, type Draft } from "./types";

const OPTS: { key: AlignmentValue; bars: number }[] = [
  { key: "alta", bars: 3 },
  { key: "media", bars: 2 },
  { key: "baja", bars: 1 },
];

export function AlignmentSection({
  draft,
  patch,
  editable,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
}) {
  const align = draft.alignment as AlignmentValue | null;
  const suggested = computeAlignment(draft.cargo, draft.disc_letters);
  const hasKpi = draft.kpi_name.trim().length > 0;

  return (
    <Panel
      icon={<Target size={18} strokeWidth={1.9} />}
      iconColor="#34d399"
      accent="#34d399"
      title="Alineación rol ↔ perfil & KPI"
      sub="Si su perfil natural encaja con el rol (Mantener / Desarrollar / Reubicar) y su número clave a medir."
    >
      <FieldLabel hint="alimenta la alineación">Área / función del rol</FieldLabel>
      <TextInput
        value={draft.cargo}
        disabled={!editable}
        onChange={(e) => patch({ cargo: e.target.value })}
        placeholder="Ej. Operaciones, Ventas, Finanzas"
        className="mb-[18px]"
      />

      <FieldLabel>Alineación · ¿el perfil natural calza con el rol?</FieldLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {OPTS.map((o) => (
          <AlignGaugeButton
            key={o.key}
            value={o.key}
            bars={o.bars}
            active={align === o.key}
            disabled={!editable}
            onSelect={() =>
              patch({ alignment: align === o.key ? null : o.key })
            }
          />
        ))}
      </div>

      {suggested && (
        <div className="mt-3 flex items-center gap-1.5 text-[12px]" style={{ color: "var(--warn-text)" }}>
          <Sparkles size={14} strokeWidth={1.9} />
          <span className="text-fg">
            Sugerido por perfil + área:{" "}
            <b style={{ color: ALIGNMENT_ACTION[suggested].color }}>
              {ALIGNMENT_ACTION[suggested].label} → {ALIGNMENT_ACTION[suggested].action}
            </b>
          </span>
          {editable && align !== suggested && (
            <button
              type="button"
              onClick={() => patch({ alignment: suggested })}
              className="ml-1 rounded border border-[#5b8aff]/35 bg-[#5b8aff]/[0.18] px-2 py-0.5 text-[10.5px] font-bold text-[#bcd0ff]"
            >
              Aplicar
            </button>
          )}
        </div>
      )}

      {/* KPI — Boss objective */}
      <div
        className="mt-[22px] rounded-[14px] border p-[18px] transition"
        style={{
          background: hasKpi ? "rgba(52,211,153,0.06)" : "rgba(251,191,36,0.05)",
          borderColor: hasKpi ? "rgba(52,211,153,0.25)" : "rgba(251,191,36,0.28)",
        }}
      >
        <div
          className="mb-3.5 flex items-center gap-2 text-[13px] font-bold"
          style={{ color: hasKpi ? "#34d399" : "#fbbf24" }}
        >
          {hasKpi ? (
            <CheckCircle2 size={16} strokeWidth={1.9} />
          ) : (
            <Swords size={16} strokeWidth={1.9} />
          )}
          {hasKpi ? "Objetivo definido" : "Objetivo clave del rol"}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3">
          <div>
            <FieldLabel>KPI principal del rol (número único)</FieldLabel>
            <TextInput
              value={draft.kpi_name}
              disabled={!editable}
              onChange={(e) => patch({ kpi_name: e.target.value })}
              placeholder="Ej. Propuestas enviadas"
            />
          </div>
          <div>
            <FieldLabel>Meta semanal</FieldLabel>
            <TextInput
              type="number"
              min={1}
              step={1}
              value={draft.kpi_weekly_target ?? ""}
              disabled={!editable}
              onChange={(e) => {
                if (e.target.value === "") {
                  patch({ kpi_weekly_target: null });
                  return;
                }
                // No persistir negativos: una meta semanal no puede ser < 0.
                const n = Number(e.target.value);
                patch({ kpi_weekly_target: Number.isFinite(n) ? Math.max(0, n) : null });
              }}
              placeholder="10"
              className="text-center font-bold"
              style={{ fontFamily: MONO, fontSize: 16 }}
            />
          </div>
        </div>

        {!hasKpi && (
          <div className="mt-3 flex gap-2 text-[12px] leading-snug text-fg-muted">
            <Info
              size={14}
              strokeWidth={1.9}
              className="mt-[1px] flex-shrink-0 text-[#fbbf24]"
            />
            <span>
              <b className="text-[#fbbf24]">Requerido para guardar:</b> definí el KPI
              principal. Si no se puede medir, el cargo es ambiguo (Ley de Pearson, S7).
            </span>
          </div>
        )}
      </div>
    </Panel>
  );
}

function AlignGaugeButton({
  value,
  bars,
  active,
  disabled,
  onSelect,
}: {
  value: AlignmentValue;
  bars: number;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const a = ALIGNMENT_ACTION[value];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="relative overflow-hidden rounded-[14px] border px-3 py-4 text-center transition disabled:cursor-default"
      style={{
        background: active
          ? `linear-gradient(180deg, ${a.color}22, ${a.color}08)`
          : "rgba(255,255,255,0.025)",
        borderColor: active ? `${a.color}77` : "rgba(255,255,255,0.08)",
        boxShadow: active ? `0 0 22px ${a.color}26` : "none",
      }}
    >
      {/* segmented meter dots */}
      <div className="mb-2.5 flex justify-center gap-1">
        {[0, 1, 2].map((i) => {
          const lit = i < bars;
          return (
            <div
              key={i}
              className="h-[5px] w-[18px] rounded-full"
              style={{
                background: active && lit
                  ? a.color
                  : lit
                    ? `${a.color}55`
                    : "rgba(255,255,255,0.1)",
              }}
            />
          );
        })}
      </div>
      <div
        className="text-[15px] font-bold"
        style={{ color: active ? a.color : "rgba(255,255,255,0.7)" }}
      >
        {a.label}
      </div>
      <div
        className="mt-0.5 text-[12px]"
        style={{ color: active ? a.color : "rgba(255,255,255,0.45)" }}
      >
        → {a.action}
      </div>
    </button>
  );
}
