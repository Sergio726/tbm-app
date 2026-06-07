"use client";

import { useState } from "react";
import { Plus, BarChart3 } from "lucide-react";
import type { LeadingIndicator, Profile } from "@/types/database";
import { IndicatorCard } from "./indicator-card";
import { IndicatorForm } from "./indicator-form";

interface BosPanelProps {
  indicators: LeadingIndicator[];
  team: Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters">[];
  currentUserId: string;
  weekDate: string;
  isPending: boolean;
  onCreateIndicator: (data: { name: string; owner_id: string; weekly_target: number }) => void;
  onUpdateValue: (id: string, value: number) => void;
}

export function BosPanel({
  indicators,
  team,
  currentUserId,
  weekDate,
  isPending,
  onCreateIndicator,
  onUpdateValue,
}: BosPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const canAdd = indicators.length < 5;

  const weekLabel = new Date(weekDate + "T00:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: 16 }}>
            BOS Dashboard
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Semana del {weekLabel}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={!canAdd}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "rgba(91,138,255,0.15)",
              border: "1px solid rgba(91,138,255,0.3)",
              color: "#9fb9ff",
            }}
            title={!canAdd ? "Máximo 5 indicadores" : undefined}
          >
            <Plus size={13} strokeWidth={2.5} />
            Agregar indicador
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <IndicatorForm
          team={team}
          currentUserId={currentUserId}
          isPending={isPending}
          onSubmit={(data) => {
            onCreateIndicator(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Empty state */}
      {indicators.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-10 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", borderStyle: "dashed" }}
        >
          <BarChart3 size={32} style={{ color: "rgba(255,255,255,0.15)" }} />
          <div>
            <p className="font-semibold text-white" style={{ fontSize: 14 }}>
              Sin indicadores de actividad
            </p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", marginTop: 4, maxWidth: 280 }}>
              Los Leading Indicators miden las acciones que generan resultados, no los resultados en sí.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "#5b8aff", color: "white" }}
          >
            Agregar primer indicador
          </button>
        </div>
      )}

      {/* Grid */}
      {indicators.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {indicators.map((ind) => (
            <IndicatorCard
              key={ind.id}
              indicator={ind}
              team={team}
              currentUserId={currentUserId}
              isPending={isPending}
              onUpdateValue={onUpdateValue}
            />
          ))}
        </div>
      )}

      {/* BOS context note */}
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          <strong style={{ color: "rgba(255,255,255,0.5)" }}>BOS —</strong> Los indicadores líderes predicen el resultado.
          Si la actividad está en verde esta semana, el resultado llegará. Si está en rojo, actuá ahora.
        </p>
      </div>
    </div>
  );
}
