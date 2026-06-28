"use client";

import { useState } from "react";
import { Plus, Lightbulb, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { IdeaParking, Profile } from "@/types/database";
import { IdeaForm } from "./idea-form";

interface IdeasPanelProps {
  ideas: IdeaParking[];
  team: Pick<Profile, "id" | "full_name">[];
  isPending: boolean;
  onCreateIdea: (data: { idea: string; rationale: string; review_at: string }) => void;
  onPromoteIdea: (id: string) => void;
  onDiscardIdea: (id: string) => void;
}

export function IdeasPanel({
  ideas,
  team,
  isPending,
  onCreateIdea,
  onPromoteIdea,
  onDiscardIdea,
}: IdeasPanelProps) {
  const [showForm, setShowForm] = useState(false);

  const parked = ideas.filter((i) => i.status === "parked");
  const resolved = ideas.filter((i) => i.status !== "parked");
  const now = Date.now();

  function daysUntilReview(reviewAt: string): number {
    const diff = new Date(reviewAt).getTime() - now;
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }

  function getProposer(id: string | null) {
    const m = team.find((t) => t.id === id);
    return m?.full_name ?? "Anónimo";
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-fg" style={{ fontSize: 16 }}>
            Parqueadero de Ideas
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>
            Las ideas se liberan automáticamente al Día 91
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{
              background: "rgba(91,138,255,0.15)",
              border: "1px solid rgba(91,138,255,0.3)",
              color: "var(--accent-text)",
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Parkear idea
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <IdeaForm
          isPending={isPending}
          onSubmit={(data) => {
            onCreateIdea(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Context note */}
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "rgba(251,191,36,0.2)",
          background: "rgba(251,191,36,0.05)",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(251,191,36,0.7)", lineHeight: 1.6 }}>
          Las ideas parkeadas no se discuten ni distraen al equipo hasta el Día 91. Si al liberarse siguen siendo buenas, promovelas a Roca.
        </p>
      </div>

      {/* Empty state */}
      {parked.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-10 text-center"
          style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
        >
          <Lightbulb size={28} style={{ color: "var(--fg-subtle)" }} />
          <p style={{ fontSize: 13.5, color: "var(--fg-muted)" }}>
            Sin ideas parkeadas
          </p>
        </div>
      )}

      {/* Parked ideas */}
      {parked.length > 0 && (
        <div className="flex flex-col gap-3">
          {parked.map((idea) => {
            const daysLeft = daysUntilReview(idea.review_at);
            const isReady = daysLeft === 0;

            return (
              <div
                key={idea.id}
                className="rounded-2xl border p-4 flex flex-col gap-3"
                style={{
                  borderColor: isReady
                    ? "rgba(52,211,153,0.25)"
                    : "rgba(255,255,255,0.08)",
                  background: isReady
                    ? "rgba(52,211,153,0.04)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 font-semibold text-fg" style={{ fontSize: 14, lineHeight: 1.4 }}>
                    {idea.idea}
                  </p>
                  <span
                    className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                    style={
                      isReady
                        ? {
                            background: "rgba(52,211,153,0.12)",
                            border: "1px solid rgba(52,211,153,0.25)",
                            color: "var(--success-text)",
                          }
                        : {
                            background: "var(--elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--fg-subtle)",
                          }
                    }
                  >
                    <Clock size={11} strokeWidth={2} />
                    {isReady ? "Lista para evaluar" : `Día 91 en ${daysLeft}d`}
                  </span>
                </div>

                {idea.rationale && (
                  <p style={{ fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                    {idea.rationale}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>
                    por {getProposer(idea.proposed_by)}
                  </span>
                  {isReady && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDiscardIdea(idea.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                        style={{
                          background: "rgba(248,113,113,0.1)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          color: "var(--danger-text)",
                        }}
                      >
                        <XCircle size={11} strokeWidth={2} />
                        Descartar
                      </button>
                      <button
                        onClick={() => onPromoteIdea(idea.id)}
                        disabled={isPending}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
                        style={{
                          background: "rgba(52,211,153,0.12)",
                          border: "1px solid rgba(52,211,153,0.25)",
                          color: "var(--success-text)",
                        }}
                      >
                        <CheckCircle2 size={11} strokeWidth={2} />
                        Promover a Roca
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved ideas */}
      {resolved.length > 0 && (
        <details>
          <summary
            className="cursor-pointer select-none text-xs font-semibold"
            style={{ color: "var(--fg-muted)" }}
          >
            Resueltas ({resolved.length})
          </summary>
          <div className="mt-3 flex flex-col gap-2 opacity-60">
            {resolved.map((idea) => (
              <div
                key={idea.id}
                className="flex items-center gap-3 rounded-xl border px-3 py-2"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--elevated)",
                }}
              >
                {idea.status === "promoted" ? (
                  <CheckCircle2 size={12} style={{ color: "var(--success-text)" }} />
                ) : (
                  <XCircle size={12} style={{ color: "var(--danger-text)" }} />
                )}
                <p className="flex-1 text-xs text-fg">{idea.idea}</p>
                <span
                  className="text-xs"
                  style={{ color: idea.status === "promoted" ? "#34d399" : "#f87171" }}
                >
                  {idea.status === "promoted" ? "Promovida" : "Descartada"}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
