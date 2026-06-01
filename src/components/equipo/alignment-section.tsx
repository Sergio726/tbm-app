"use client";

import { Target, Sparkles, AlertTriangle } from "lucide-react";
import { ALIGNMENT_ACTION, computeAlignment, type AlignmentValue } from "@/lib/disc";
import { Card, SectionTitle, Field, Label, inputStyle } from "./primitives";
import type { Draft } from "./types";

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
  const kpiMissing = draft.kpi_name.trim() === "";

  return (
    <Card>
      <SectionTitle
        Icon={Target}
        label="Alineación rol ↔ perfil & KPI"
        color="#34d399"
        hint="Si su perfil natural encaja con el rol (Mantener / Desarrollar / Reubicar) y su número clave a medir."
      />

      <Field
        label="Área / función del rol"
        hint="alimenta la alineación"
      >
        <input
          value={draft.cargo}
          disabled={!editable}
          onChange={(e) => patch({ cargo: e.target.value })}
          placeholder="Ej. Operaciones, Ventas, Finanzas"
          style={inputStyle}
        />
      </Field>

      <div style={{ marginTop: 16 }}>
        <Label>Alineación · ¿el perfil natural calza con el rol?</Label>
      </div>
      <div className="flex" style={{ gap: 8, marginTop: 8 }}>
        {(Object.keys(ALIGNMENT_ACTION) as AlignmentValue[]).map((key) => (
          <AlignmentOption
            key={key}
            value={key}
            active={align === key}
            disabled={!editable}
            onSelect={() => patch({ alignment: align === key ? null : key })}
          />
        ))}
      </div>

      {suggested && (
        <div
          className="flex items-center"
          style={{
            gap: 8,
            marginTop: 12,
            fontSize: 11.5,
            color: "rgba(255,255,255,0.6)",
            flexWrap: "wrap",
          }}
        >
          <Sparkles size={13} style={{ color: ALIGNMENT_ACTION[suggested].color }} />
          <span>
            Sugerido por perfil + área:{" "}
            <span
              style={{
                color: ALIGNMENT_ACTION[suggested].color,
                fontWeight: 600,
              }}
            >
              {ALIGNMENT_ACTION[suggested].label} →{" "}
              {ALIGNMENT_ACTION[suggested].action}
            </span>
          </span>
          {editable && align !== suggested && (
            <button
              type="button"
              onClick={() => patch({ alignment: suggested })}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 5,
                cursor: "pointer",
                background: "rgba(91,138,255,0.18)",
                border: "1px solid rgba(91,138,255,0.35)",
                color: "#bcd0ff",
              }}
            >
              Aplicar
            </button>
          )}
        </div>
      )}

      {/* KPI box destacado */}
      <div
        style={{
          marginTop: 18,
          padding: "14px 16px",
          borderRadius: 12,
          background: kpiMissing
            ? "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.02))"
            : "rgba(255,255,255,0.025)",
          border: kpiMissing
            ? "1px solid rgba(251,191,36,0.35)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="flex items-center"
          style={{ gap: 7, marginBottom: 10 }}
        >
          <Target size={13} style={{ color: kpiMissing ? "#fbbf24" : "#34d399" }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: kpiMissing ? "#fbbf24" : "#34d399",
            }}
          >
            Objetivo clave del rol
          </span>
        </div>
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 130px", gap: 12 }}
        >
          <Field label="KPI principal del rol (número único)">
            <input
              value={draft.kpi_name}
              disabled={!editable}
              onChange={(e) => patch({ kpi_name: e.target.value })}
              placeholder="Ej. Propuestas enviadas"
              style={inputStyle}
            />
          </Field>
          <Field label="Meta semanal">
            <input
              type="number"
              value={draft.kpi_weekly_target ?? ""}
              disabled={!editable}
              onChange={(e) =>
                patch({
                  kpi_weekly_target:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="10"
              style={{ ...inputStyle, textAlign: "right" }}
            />
          </Field>
        </div>
        {kpiMissing && (
          <div
            className="flex items-start"
            style={{ gap: 7, marginTop: 10, fontSize: 11.5, color: "#fbbf24" }}
          >
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              <strong>Requerido para guardar:</strong> definí el KPI principal. Si no se
              puede medir, el cargo es ambiguo (Ley de Pearson, S7).
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function AlignmentOption({
  value,
  active,
  disabled,
  onSelect,
}: {
  value: AlignmentValue;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const a = ALIGNMENT_ACTION[value];
  // Cuántas barras "encendidas" muestra la card según el nivel.
  const bars = value === "alta" ? 3 : value === "media" ? 2 : 1;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="flex-1 text-center transition-colors"
      style={{
        padding: "12px 8px",
        borderRadius: 10,
        cursor: disabled ? "default" : "pointer",
        background: active
          ? `linear-gradient(180deg, ${a.color}24, ${a.color}08)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? `${a.color}66` : "rgba(255,255,255,0.07)"}`,
        color: active ? a.color : "rgba(255,255,255,0.65)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ gap: 4, marginBottom: 8 }}
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 3,
              borderRadius: 2,
              background:
                i <= bars
                  ? a.color
                  : active
                    ? `${a.color}33`
                    : "rgba(255,255,255,0.10)",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{a.label}</div>
      <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>
        → {a.action}
      </div>
    </button>
  );
}
