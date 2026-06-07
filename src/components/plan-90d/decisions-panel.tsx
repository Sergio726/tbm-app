"use client";

import { useState } from "react";
import { Plus, Zap, CheckCircle2, Users } from "lucide-react";
import type { Decision } from "@/types/database";
import { DecisionForm } from "./decision-form";

interface DecisionsPanelProps {
  decisions: Decision[];
  isPending: boolean;
  onCreateDecision: (data: {
    decision_text: string;
    info_available: number;
    applied_70_rule: boolean;
    disagree_and_commit: boolean;
    disagree_with: string;
  }) => void;
}

export function DecisionsPanel({
  decisions,
  isPending,
  onCreateDecision,
}: DecisionsPanelProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: 16 }}>
            Decisiones — Filtro del 70%
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Registrá cada decisión importante y cómo la tomaste
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{
              background: "rgba(91,138,255,0.15)",
              border: "1px solid rgba(91,138,255,0.3)",
              color: "#9fb9ff",
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Registrar decisión
          </button>
        )}
      </div>

      {/* Regla */}
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "rgba(91,138,255,0.2)",
          background: "rgba(91,138,255,0.05)",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(159,185,255,0.8)", lineHeight: 1.6 }}>
          <strong>Regla del 70%:</strong> Si tenés ≥70% de la información necesaria, decidí.
          Esperar el 100% es parálisis por análisis. Las grandes decisiones se toman con datos incompletos.
        </p>
      </div>

      {/* Form */}
      {showForm && (
        <DecisionForm
          isPending={isPending}
          onSubmit={(data) => {
            onCreateDecision(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Empty state */}
      {decisions.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-10 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", borderStyle: "dashed" }}
        >
          <Zap size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)" }}>
            Sin decisiones registradas
          </p>
        </div>
      )}

      {/* Decision list */}
      <div className="flex flex-col gap-3">
        {decisions.map((d) => (
          <DecisionCard key={d.id} decision={d} />
        ))}
      </div>
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  const [expanded, setExpanded] = useState(false);

  const infoColor =
    (decision.info_available ?? 0) >= 70
      ? "#34d399"
      : (decision.info_available ?? 0) >= 50
      ? "#fbbf24"
      : "#f87171";

  const date = new Date(decision.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Main text */}
      <div
        className="cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <p
          className={`font-semibold text-white ${!expanded ? "line-clamp-2" : ""}`}
          style={{ fontSize: 14, lineHeight: 1.5 }}
        >
          {decision.decision_text}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {decision.info_available !== null && (
          <span
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold"
            style={{
              background: `${infoColor}18`,
              border: `1px solid ${infoColor}30`,
              color: infoColor,
            }}
          >
            {decision.info_available}% info
          </span>
        )}
        {decision.applied_70_rule && (
          <span
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold"
            style={{
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34d399",
            }}
          >
            <CheckCircle2 size={10} strokeWidth={2.5} />
            Regla 70%
          </span>
        )}
        {decision.disagree_and_commit && (
          <span
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold"
            style={{
              background: "rgba(251,191,36,0.1)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "#fbbf24",
            }}
          >
            <Users size={10} strokeWidth={2.5} />
            D&C
            {decision.disagree_with && ` — ${decision.disagree_with}`}
          </span>
        )}
        <span
          className="ml-auto text-xs"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {date}
        </span>
      </div>
    </div>
  );
}
