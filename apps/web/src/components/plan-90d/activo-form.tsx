"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Profile } from "@/types/database";
import { ASSET_CATEGORIES } from "./activos-panel";

export type ActivoFormData = {
  title: string;
  description: string;
  category: string;
  video_url: string;
  doc_url: string;
  owner_id: string | null;
};

export function ActivoForm({
  team,
  isPending,
  onSubmit,
  onCancel,
}: {
  team: Pick<Profile, "id" | "full_name">[];
  isPending: boolean;
  onSubmit: (data: ActivoFormData) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("operaciones");
  const [videoUrl, setVideoUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [ownerId, setOwnerId] = useState<string>("");

  const canSubmit = title.trim().length > 0 && !isPending;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(91,138,255,0.25)",
        background: "rgba(91,138,255,0.04)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Nuevo activo del sistema</h3>
        <button
          type="button"
          onClick={onCancel}
          style={{ color: "rgba(255,255,255,0.62)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre del proceso · ej. Onboarding de un cliente nuevo"
          className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.09)",
          }}
          autoFocus
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué cubre este proceso? ¿Cuándo se usa?"
          rows={2}
          className="w-full resize-y rounded-xl border bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.09)",
          }}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.09)",
              }}
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key} style={{ background: "#0F1B2D" }}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-white/50">
              Responsable de mantenerlo
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.09)",
              }}
            >
              <option value="" style={{ background: "#0F1B2D" }}>
                Sin asignar
              </option>
              {team.map((m) => (
                <option key={m.id} value={m.id} style={{ background: "#0F1B2D" }}>
                  {m.full_name ?? "Sin nombre"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Link al video (Loom, YouTube…)"
            className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.09)",
            }}
          />
          <input
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="Link al documento (Notion, Drive…)"
            className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.09)",
            }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-3.5 py-2 text-xs font-semibold"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                description: description.trim(),
                category,
                video_url: videoUrl.trim(),
                doc_url: docUrl.trim(),
                owner_id: ownerId || null,
              })
            }
            className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, #4f86ff, #2c5fe6)" }}
          >
            {isPending ? "Guardando…" : "Guardar activo"}
          </button>
        </div>
      </div>
    </div>
  );
}
