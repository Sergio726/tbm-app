"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Profile } from "@/types/database";

interface IndicatorFormProps {
  team: Pick<Profile, "id" | "full_name">[];
  currentUserId: string;
  isPending: boolean;
  onSubmit: (data: { name: string; owner_id: string; weekly_target: number }) => void;
  onCancel: () => void;
}

export function IndicatorForm({
  team,
  currentUserId,
  isPending,
  onSubmit,
  onCancel,
}: IndicatorFormProps) {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState(currentUserId);
  const [target, setTarget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = Number(target);
    if (!name.trim() || isNaN(t) || t <= 0) return;
    onSubmit({ name: name.trim(), owner_id: ownerId, weekly_target: t });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5"
      style={{
        borderColor: "rgba(91,138,255,0.25)",
        background: "rgba(91,138,255,0.04)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-white" style={{ fontSize: 14 }}>
          Nuevo Indicador
        </p>
        <button type="button" onClick={onCancel} style={{ color: "rgba(255,255,255,0.62)" }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Nombre del indicador *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Llamadas de prospección"
            required
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Meta semanal *
          </label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="ej. 20"
            min={1}
            required
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Responsable
          </label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#0d1120", borderColor: "rgba(255,255,255,0.12)" }}
          >
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} {m.id === currentUserId ? "(yo)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl py-2 text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim() || !target}
            className="flex-1 rounded-xl py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: "#5b8aff", color: "white" }}
          >
            {isPending ? "Guardando…" : "Crear"}
          </button>
        </div>
      </div>
    </form>
  );
}
