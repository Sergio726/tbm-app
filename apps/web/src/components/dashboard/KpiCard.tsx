"use client";

import { useState, type CSSProperties } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { KPI } from "@/types/database";
import { Pencil, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

interface Props {
  kpi: KPI;
}

/**
 * KPI card — estilo Aurora: gradiente sutil, delta badge, big number,
 * progress bar tintada por semáforo.
 */
export default function KpiCard({ kpi }: Props) {
  const supabase = createBrowserClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(kpi.current_value ?? 0));
  const [saving, setSaving] = useState(false);
  const [currentValue, setCurrentValue] = useState(kpi.current_value ?? 0);

  const pct =
    kpi.weekly_target > 0
      ? Math.min(Math.round((currentValue / kpi.weekly_target) * 100), 999)
      : 0;

  const semaforo: "verde" | "amarillo" | "rojo" =
    pct >= 100 ? "verde" : pct >= 85 ? "amarillo" : "rojo";

  const TONE = {
    verde: "#34d399",
    amarillo: "#fbbf24",
    rojo: "#f87171",
  }[semaforo];

  const DeltaIcon =
    pct >= 100 ? TrendingUp : pct >= 85 ? Minus : TrendingDown;

  const handleSave = async () => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setSaving(true);

    await supabase
      .from("kpis")
      .update({ current_value: num, entered_at: new Date().toISOString() })
      .eq("id", kpi.id);

    setCurrentValue(num);
    setEditing(false);
    setSaving(false);
  };

  return (
    <div
      className="relative transition-all hover:border-border"
      style={{
        padding: "18px 20px",
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header: label + delta badge */}
      <div
        className="flex items-baseline justify-between"
        style={{ marginBottom: 14 }}
      >
        <div
          className="uppercase truncate"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--fg-muted)",
            letterSpacing: 1,
            maxWidth: "70%",
          }}
        >
          {kpi.name}
        </div>
        <div
          className="flex items-center"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: TONE,
            gap: 4,
            padding: "2px 8px",
            borderRadius: 99,
            background: `${TONE}14`,
            border: `1px solid ${TONE}30`,
          }}
        >
          <DeltaIcon size={10} strokeWidth={2.4} />
          {pct}%
        </div>
      </div>

      {/* Big number + target */}
      <div
        className="flex items-end justify-between"
        style={{ gap: 16, marginBottom: 14 }}
      >
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="tbm-input"
                style={{ width: 100, padding: "4px 8px", fontSize: 20, fontWeight: 700 }}
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs hover:underline"
                style={{ color: "var(--accent-text)" }}
              >
                {saving ? "..." : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setValue(String(currentValue));
                  setEditing(false);
                }}
                className="text-xs hover:text-fg"
                style={{ color: "var(--fg-subtle)" }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="group flex items-baseline transition-opacity hover:opacity-80"
              style={{ gap: 6 }}
              title="Actualizar valor"
            >
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: "var(--fg)",
                  letterSpacing: -0.6,
                  lineHeight: 1,
                }}
              >
                {currentValue}
                {kpi.unit && (
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--fg-subtle)",
                      marginLeft: 2,
                      fontWeight: 400,
                    }}
                  >
                    {kpi.unit}
                  </span>
                )}
              </span>
              <span
                style={{
                  ...MONO,
                  fontSize: 13,
                  color: "var(--fg-muted)",
                }}
              >
                / {kpi.weekly_target}
                {kpi.unit ?? ""}
              </span>
              <span
                className="opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--accent-text)" }}
              >
                <Pencil size={12} />
              </span>
            </button>
          )}
          <div
            style={{
              fontSize: 11.5,
              color: "var(--fg-muted)",
              marginTop: 4,
            }}
          >
            {kpi.type === "leading" ? "Leading" : "Lagging"}
            {kpi.entered_at && " · actualizado"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            height: 4,
            background: "var(--elevated)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            className="transition-all duration-500"
            style={{
              width: `${Math.min(pct, 100)}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${TONE}88, ${TONE})`,
              borderRadius: 99,
            }}
          />
        </div>
        <div
          className="flex justify-between"
          style={{
            ...MONO,
            marginTop: 5,
            fontSize: 10.5,
            color: "var(--fg-muted)",
          }}
        >
          <span>{pct}% del objetivo</span>
          <span>semana actual</span>
        </div>
      </div>
    </div>
  );
}
