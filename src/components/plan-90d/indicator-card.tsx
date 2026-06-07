"use client";

import { useState, useCallback } from "react";
import type { LeadingIndicator, Profile } from "@/types/database";
import { semaforo, SEMAFORO_COLORS } from "@/lib/plan90d";
import { SilenceOverlay } from "./silence-overlay";

interface IndicatorCardProps {
  indicator: LeadingIndicator;
  team: Pick<Profile, "id" | "full_name">[];
  currentUserId: string;
  isPending: boolean;
  onUpdateValue: (id: string, value: number) => void;
}

export function IndicatorCard({
  indicator,
  team,
  currentUserId,
  isPending,
  onUpdateValue,
}: IndicatorCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showSilence, setShowSilence] = useState(false);

  const estado = semaforo(indicator.current_value, indicator.weekly_target);
  const colors = SEMAFORO_COLORS[estado];
  const owner = team.find((m) => m.id === indicator.owner_id);
  const ownerInitials = owner?.full_name
    ? owner.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const pct =
    indicator.weekly_target > 0 && indicator.current_value !== null
      ? Math.min(100, Math.round((indicator.current_value / indicator.weekly_target) * 100))
      : 0;

  const isOwner = indicator.owner_id === currentUserId;

  const handleEnterValue = () => {
    if (estado === "rojo") {
      setShowSilence(true);
    } else {
      setShowInput(true);
    }
  };

  const handleSilenceDone = useCallback(() => {
    setShowSilence(false);
    setShowInput(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(inputValue);
    if (isNaN(v) || v < 0) return;
    onUpdateValue(indicator.id, v);
    setInputValue("");
    setShowInput(false);
  };

  const estadoLabel: Record<typeof estado, string> = {
    verde: "En meta",
    amarillo: "Cerca",
    rojo: "Bajo meta",
  };

  return (
    <div
      className="relative rounded-2xl border p-4 flex flex-col gap-3"
      style={{
        borderColor: colors.border,
        background: `rgba(255,255,255,0.02)`,
      }}
    >
      {showSilence && <SilenceOverlay onDone={handleSilenceDone} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 11.5, color: colors.text }}
          >
            {indicator.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="rounded-md px-2 py-0.5 text-xs font-semibold"
            style={{
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {estadoLabel[estado]}
          </span>
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "rgba(91,138,255,0.15)",
              color: "#9fb9ff",
            }}
            title={owner?.full_name ?? "Sin dueño"}
          >
            {ownerInitials}
          </div>
        </div>
      </div>

      {/* Value display */}
      <div className="flex items-end gap-1">
        <span
          className="font-black tabular-nums"
          style={{ fontSize: 28, color: "white", lineHeight: 1 }}
        >
          {indicator.current_value !== null ? indicator.current_value : "—"}
        </span>
        <span
          className="mb-0.5"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}
        >
          / {indicator.weekly_target}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: colors.text }}
        />
      </div>

      {/* Action */}
      {isOwner && !showInput && (
        <button
          onClick={handleEnterValue}
          className="rounded-xl py-2 text-xs font-semibold transition-colors"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Ingresar valor
        </button>
      )}

      {showInput && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Meta: ${indicator.weekly_target}`}
            min={0}
            autoFocus
            className="flex-1 rounded-xl border px-3 py-2 text-sm text-white outline-none tabular-nums"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
          <button
            type="submit"
            disabled={isPending || !inputValue}
            className="rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50"
            style={{ background: "#5b8aff", color: "white" }}
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="rounded-xl px-2 py-2 text-xs"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
