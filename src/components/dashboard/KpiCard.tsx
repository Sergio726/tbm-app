"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { KPI } from "@/types/database";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  kpi: KPI;
}

export default function KpiCard({ kpi }: Props) {
  const supabase = createBrowserClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(kpi.current_value ?? 0));
  const [saving, setSaving] = useState(false);
  const [currentValue, setCurrentValue] = useState(kpi.current_value ?? 0);

  const pct =
    kpi.weekly_target > 0
      ? Math.round((currentValue / kpi.weekly_target) * 100)
      : 0;

  const semaforo =
    pct >= 100 ? "verde" : pct >= 85 ? "amarillo" : "rojo";

  const colorMap = {
    verde:    { bar: "bg-tbm-green",  text: "text-tbm-green",  border: "border-tbm-green/30"  },
    amarillo: { bar: "bg-tbm-yellow", text: "text-tbm-yellow", border: "border-tbm-yellow/30" },
    rojo:     { bar: "bg-tbm-red",    text: "text-tbm-red",    border: "border-tbm-red/30"    },
  };
  const colors = colorMap[semaforo];

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

  const Icon =
    pct >= 100 ? TrendingUp : pct >= 85 ? Minus : TrendingDown;

  return (
    <div className={cn("tbm-card p-4 border", colors.border)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-tbm-text-muted uppercase tracking-wide truncate">
            {kpi.type === "leading" ? "Leading" : "Lagging"}
          </p>
          <p className="text-sm font-medium text-white truncate">{kpi.name}</p>
        </div>
        <Icon className={cn("w-4 h-4 flex-shrink-0 ml-2 mt-0.5", colors.text)} />
      </div>

      {/* Valor actual vs meta */}
      <div className="flex items-end gap-1 mb-2">
        {editing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="tbm-input text-lg font-bold w-24 py-1"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs text-tbm-blue hover:underline"
            >
              {saving ? "..." : "Guardar"}
            </button>
            <button
              onClick={() => {
                setValue(String(currentValue));
                setEditing(false);
              }}
              className="text-xs text-tbm-text-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group flex items-end gap-1 hover:opacity-80 transition-opacity"
            title="Actualizar valor"
          >
            <span className={cn("text-2xl font-bold", colors.text)}>
              {currentValue}
              {kpi.unit ? (
                <span className="text-sm font-normal text-tbm-text-muted ml-0.5">
                  {kpi.unit}
                </span>
              ) : null}
            </span>
            <span className="text-tbm-text-muted text-sm mb-0.5">
              / {kpi.weekly_target}
              {kpi.unit ?? ""}
            </span>
            <span className="text-xs text-tbm-blue opacity-0 group-hover:opacity-100 ml-1 mb-0.5 transition-opacity">
              ✏️
            </span>
          </button>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-tbm-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className={cn("text-xs mt-1 font-medium", colors.text)}>{pct}%</p>
    </div>
  );
}
