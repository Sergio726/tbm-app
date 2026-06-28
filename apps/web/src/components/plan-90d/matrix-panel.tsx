"use client";

import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import type { Rock } from "@/types/database";

interface MatrixItem {
  id: string;
  title: string;
  quadrant: "roca" | "proyecto" | "arena" | "descarte";
}

const QUADRANTS = [
  {
    key: "roca" as const,
    label: "Rocas",
    subtitle: "Alto impacto · No urgente",
    color: "#5b8aff",
    bg: "rgba(91,138,255,0.06)",
    border: "rgba(91,138,255,0.2)",
    action: "Crear Roca en Plan 90D",
  },
  {
    key: "proyecto" as const,
    label: "Proyectos",
    subtitle: "Alto impacto · Urgente",
    color: "#34d399",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.2)",
    action: null,
  },
  {
    key: "arena" as const,
    label: "Arena",
    subtitle: "Bajo impacto · Urgente",
    color: "#f87171",
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.2)",
    action: "Delegar",
  },
  {
    key: "descarte" as const,
    label: "Descarte",
    subtitle: "Bajo impacto · No urgente",
    color: "rgba(255,255,255,0.62)",
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.08)",
    action: null,
  },
] as const;

interface MatrixPanelProps {
  isPending: boolean;
  onPromoteToRock: (title: string) => void;
}

export function MatrixPanel({ isPending, onPromoteToRock }: MatrixPanelProps) {
  const [items, setItems] = useState<MatrixItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeQuadrant, setActiveQuadrant] = useState<MatrixItem["quadrant"] | null>(null);

  function addItem(quadrant: MatrixItem["quadrant"]) {
    if (!inputText.trim() || activeQuadrant !== quadrant) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: inputText.trim(), quadrant },
    ]);
    setInputText("");
    setActiveQuadrant(null);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function promoteItem(item: MatrixItem) {
    onPromoteToRock(item.title);
    removeItem(item.id);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-bold text-white" style={{ fontSize: 16 }}>
          Clasificador Rocas vs Arena
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", marginTop: 2 }}>
          Sesión de trabajo local — no se guarda en base de datos
        </p>
      </div>

      {/* Add initiative */}
      <div
        className="rounded-2xl border p-4"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p className="mb-3 text-sm font-semibold text-white">Agregar iniciativa</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nombre de la iniciativa…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && activeQuadrant) addItem(activeQuadrant);
            }}
            className="flex-1 rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
          Escribí la iniciativa y luego hacé click en el cuadrante donde pertenece
        </p>
      </div>

      {/* 2×2 matrix */}
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map((q) => {
          const qItems = items.filter((i) => i.quadrant === q.key);
          const isActive = activeQuadrant === q.key && inputText.trim().length > 0;

          return (
            <div
              key={q.key}
              className="rounded-2xl border p-4 flex flex-col gap-3 min-h-[160px]"
              style={{
                borderColor: isActive ? q.color : q.border,
                background: isActive ? `${q.bg}` : "rgba(255,255,255,0.015)",
                transition: "border-color 0.15s",
              }}
            >
              {/* Quadrant header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white" style={{ fontSize: 13 }}>
                    {q.label}
                  </p>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.62)", marginTop: 1 }}>
                    {q.subtitle}
                  </p>
                </div>
                {inputText.trim() && (
                  <button
                    onClick={() => {
                      setActiveQuadrant(q.key);
                      addItem(q.key);
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                    style={{
                      background: `${q.color}22`,
                      border: `1px solid ${q.color}44`,
                      color: q.color,
                    }}
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    Agregar
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2">
                {qItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2"
                    style={{
                      borderColor: "rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p
                      className="flex-1 min-w-0 truncate text-white"
                      style={{ fontSize: 12.5 }}
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {q.action === "Crear Roca en Plan 90D" && (
                        <button
                          onClick={() => promoteItem(item)}
                          disabled={isPending}
                          className="rounded px-1.5 py-0.5 text-xs font-semibold disabled:opacity-50"
                          style={{
                            background: "rgba(91,138,255,0.15)",
                            color: "#9fb9ff",
                          }}
                          title="Crear Roca"
                        >
                          <ArrowRight size={11} strokeWidth={2} />
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded px-1 py-0.5 text-xs"
                        style={{ color: "rgba(255,255,255,0.62)" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {qItems.length === 0 && (
                  <p
                    className="text-center"
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", paddingBlock: 8 }}
                  >
                    Vacío
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", textAlign: "center" }}>
        Las iniciativas clasificadas como Roca se pueden promover al Plan 90D con el botón →
      </p>
    </div>
  );
}
