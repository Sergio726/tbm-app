"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Library,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle2,
  PencilLine,
} from "lucide-react";
import type { ProcessAsset, Profile } from "@/types/database";
import { ActivoForm, type ActivoFormData } from "./activo-form";

export const ASSET_CATEGORIES = [
  { key: "operaciones", label: "Operaciones", color: "#5b8aff" },
  { key: "ventas", label: "Ventas", color: "#34d399" },
  { key: "finanzas", label: "Finanzas", color: "#fbbf24" },
  { key: "rrhh", label: "RRHH", color: "#a78bfa" },
  { key: "tecnologia", label: "Tecnología", color: "#06b6d4" },
  { key: "otro", label: "Otro", color: "#94a3b8" },
] as const;

const STATUS_META: Record<
  string,
  { label: string; color: string; Icon: typeof CheckCircle2 }
> = {
  borrador: { label: "Borrador", color: "#94a3b8", Icon: PencilLine },
  activo: { label: "Activo", color: "#34d399", Icon: CheckCircle2 },
  desactualizado: { label: "Desactualizado", color: "#fbbf24", Icon: AlertTriangle },
};

export function ActivosPanel({
  assets,
  team,
  isArquitecto,
  isPending,
  onCreate,
  onSetStatus,
}: {
  assets: ProcessAsset[];
  team: Pick<Profile, "id" | "full_name">[];
  isArquitecto: boolean;
  isPending: boolean;
  onCreate: (data: ActivoFormData) => void;
  onSetStatus: (id: string, status: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  const filtered = useMemo(
    () => (filterCat === "all" ? assets : assets.filter((a) => a.category === filterCat)),
    [assets, filterCat]
  );

  const ownerName = (id: string | null) =>
    team.find((t) => t.id === id)?.full_name ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: 16 }}>
            Activos del Sistema
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>
            Procesos documentados que permiten operar sin el Arquitecto
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
            Documentar proceso
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ActivoForm
          team={team}
          isPending={isPending}
          onSubmit={(data) => {
            onCreate(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Context note */}
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: "rgba(91,138,255,0.2)",
          background: "rgba(91,138,255,0.05)",
        }}
      >
        <p style={{ fontSize: 12, color: "rgba(159,185,255,0.8)", lineHeight: 1.6 }}>
          Cada proceso crítico que vive solo en tu cabeza es un punto único de falla.
          Grabá un Loom de 10 minutos o escribí el SOP — el activo queda acá, con
          dueño y estado.
        </p>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          active={filterCat === "all"}
          color="#9fb9ff"
          label={`Todos (${assets.length})`}
          onClick={() => setFilterCat("all")}
        />
        {ASSET_CATEGORIES.map((c) => {
          const count = assets.filter((a) => a.category === c.key).length;
          if (count === 0) return null;
          return (
            <FilterChip
              key={c.key}
              active={filterCat === c.key}
              color={c.color}
              label={`${c.label} (${count})`}
              onClick={() => setFilterCat(c.key)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-10 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", borderStyle: "dashed" }}
        >
          <Library size={28} style={{ color: "var(--fg-subtle)" }} />
          <p style={{ fontSize: 13.5, color: "var(--fg-muted)" }}>
            {assets.length === 0
              ? "Todavía no documentaste ningún proceso"
              : "Sin activos en esta categoría"}
          </p>
        </div>
      )}

      {/* Lista */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((asset) => {
            const cat =
              ASSET_CATEGORIES.find((c) => c.key === asset.category) ??
              ASSET_CATEGORIES[ASSET_CATEGORIES.length - 1];
            const st = STATUS_META[asset.status] ?? STATUS_META.activo;
            const owner = ownerName(asset.owner_id);

            return (
              <div
                key={asset.id}
                className="flex flex-col gap-3 rounded-2xl border p-4"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          background: `${cat.color}1a`,
                          borderColor: `${cat.color}40`,
                          color: cat.color,
                        }}
                      >
                        {cat.label}
                      </span>
                      <p
                        className="font-semibold text-white"
                        style={{ fontSize: 14, lineHeight: 1.4 }}
                      >
                        {asset.title}
                      </p>
                    </div>
                    {asset.description && (
                      <p
                        className="mt-1.5"
                        style={{
                          fontSize: 12.5,
                          color: "var(--fg-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {asset.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                    style={{
                      background: `${st.color}14`,
                      border: `1px solid ${st.color}33`,
                      color: st.color,
                    }}
                  >
                    <st.Icon size={11} strokeWidth={2} />
                    {st.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {asset.video_url && (
                      <AssetLink href={asset.video_url} Icon={Video} label="Ver video" />
                    )}
                    {asset.doc_url && (
                      <AssetLink href={asset.doc_url} Icon={FileText} label="Ver documento" />
                    )}
                    {!asset.video_url && !asset.doc_url && (
                      <span style={{ fontSize: 11.5, color: "rgba(251,191,36,0.7)" }}>
                        ⚠ Sin material adjunto — el proceso no está realmente documentado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {owner && (
                      <span style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>
                        mantiene {owner}
                      </span>
                    )}
                    {isArquitecto && (
                      <StatusCycler
                        current={asset.status}
                        isPending={isPending}
                        onSetStatus={(s) => onSetStatus(asset.id, s)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition"
      style={{
        background: active ? `${color}1f` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${color}55` : "rgba(255,255,255,0.08)",
        color: active ? color : "rgba(255,255,255,0.55)",
      }}
    >
      {label}
    </button>
  );
}

function AssetLink({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: typeof Video;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:bg-white/[0.06]"
      style={{
        borderColor: "rgba(91,138,255,0.3)",
        background: "rgba(91,138,255,0.08)",
        color: "#9fb9ff",
      }}
    >
      <Icon size={11} strokeWidth={2} />
      {label}
    </a>
  );
}

// Botones para mover el activo entre estados (borrador → activo → desactualizado)
function StatusCycler({
  current,
  isPending,
  onSetStatus,
}: {
  current: string;
  isPending: boolean;
  onSetStatus: (status: string) => void;
}) {
  const options = Object.entries(STATUS_META).filter(([key]) => key !== current);
  return (
    <div className="flex items-center gap-1.5">
      {options.map(([key, meta]) => (
        <button
          key={key}
          type="button"
          disabled={isPending}
          onClick={() => onSetStatus(key)}
          title={`Marcar como ${meta.label.toLowerCase()}`}
          className="rounded-md border px-2 py-0.5 text-[10.5px] font-semibold transition disabled:opacity-50"
          style={{
            borderColor: `${meta.color}35`,
            background: "transparent",
            color: `${meta.color}cc`,
          }}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}
