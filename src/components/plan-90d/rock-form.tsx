"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Profile } from "@/types/database";
import { isoDate } from "@/lib/dates";
import { addDays } from "@/lib/plan90d";

interface RockFormProps {
  team: Pick<Profile, "id" | "full_name" | "cargo">[];
  currentUserId: string;
  isPending: boolean;
  onSubmit: (data: {
    title: string;
    owner_id: string;
    success_criteria: string;
    start_date: string;
    end_date: string;
  }) => void;
  onCancel: () => void;
  prefillTitle?: string;
}

export function RockForm({
  team,
  currentUserId,
  isPending,
  onSubmit,
  onCancel,
  prefillTitle = "",
}: RockFormProps) {
  const today = isoDate();
  const [title, setTitle] = useState(prefillTitle);
  const [ownerId, setOwnerId] = useState(currentUserId);
  const [criteria, setCriteria] = useState("");
  const [startDate, setStartDate] = useState(today);

  const endDate = isoDate(addDays(new Date(startDate), 90));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !ownerId) return;
    onSubmit({
      title: title.trim(),
      owner_id: ownerId,
      success_criteria: criteria.trim(),
      start_date: startDate,
      end_date: endDate,
    });
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
          Nueva Roca
        </p>
        <button
          type="button"
          onClick={onCancel}
          style={{ color: "rgba(255,255,255,0.4)" }}
          className="hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Resultado a lograr *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej. Implementar sistema de ventas B2B"
            required
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Responsable *
          </label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
            style={{
              background: "#0d1120",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} {m.id === currentUserId ? "(yo)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Criterio de éxito
          </label>
          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="¿Cómo sabés que se logró la Roca?"
            rows={2}
            className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none resize-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm text-white outline-none"
              style={{
                background: "#0d1120",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              Fin (auto +90d)
            </label>
            <input
              type="text"
              value={endDate}
              readOnly
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.4)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl py-2 text-sm font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="flex-1 rounded-xl py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "#5b8aff", color: "white" }}
          >
            {isPending ? "Guardando…" : "Crear Roca"}
          </button>
        </div>
      </div>
    </form>
  );
}

