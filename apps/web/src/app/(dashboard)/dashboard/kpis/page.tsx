"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import type { KPI } from "@/types/database";
import { cn } from "@/lib/utils";
import { Plus, Trash2, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

function getMondayDate(): string {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return monday.toISOString().split("T")[0];
}

export default function KpisPage() {
  const supabase = createBrowserClient();
  const weekDate = getMondayDate();

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Formulario nuevo KPI
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newType, setNewType] = useState<"leading" | "lagging">("leading");
  const [saving, setSaving] = useState(false);

  const loadKpis = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) return;
    setCompanyId(profile.company_id);

    const { data } = await supabase
      .from("kpis")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("week_date", weekDate)
      .order("created_at", { ascending: true });

    setKpis(data ?? []);
    setLoading(false);
  }, [supabase, weekDate]);

  useEffect(() => {
    loadKpis();
  }, [loadKpis]);

  const handleAdd = async () => {
    if (!newName.trim() || !newTarget || !companyId || !userId) return;
    setSaving(true);

    const { data } = await supabase
      .from("kpis")
      .insert({
        company_id: companyId,
        owner_id: userId,
        name: newName.trim(),
        weekly_target: parseFloat(newTarget),
        unit: newUnit.trim() || null,
        type: newType,
        week_date: weekDate,
        current_value: 0,
        is_active: true,
      })
      .select()
      .single();

    if (data) setKpis((p) => [...p, data]);
    setNewName("");
    setNewTarget("");
    setNewUnit("");
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("kpis").update({ is_active: false }).eq("id", id);
    setKpis((p) => p.filter((k) => k.id !== id));
  };

  const handleValueUpdate = async (id: string, value: number) => {
    await supabase
      .from("kpis")
      .update({ current_value: value, entered_at: new Date().toISOString() })
      .eq("id", id);
    setKpis((p) =>
      p.map((k) => (k.id === id ? { ...k, current_value: value } : k))
    );
  };

  if (loading)
    return (
      <div className="p-6 flex items-center gap-3 text-tbm-text-muted">
        <span className="w-4 h-4 border-2 border-tbm-blue border-t-transparent rounded-full animate-spin" />
        Cargando KPIs...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-tbm-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">KPIs de la semana</h1>
          <p className="text-sm text-tbm-text-secondary mt-0.5">
            Semana del{" "}
            {new Date(weekDate + "T12:00:00").toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {kpis.length < 5 && (
          <button
            onClick={() => setShowForm(true)}
            className="tbm-btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo KPI
          </button>
        )}
      </div>

      {/* Formulario nuevo KPI */}
      {showForm && (
        <div className="tbm-card p-5 border-tbm-blue/40 space-y-4">
          <h3 className="text-sm font-semibold text-white">Nuevo KPI</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-tbm-text-muted mb-1">
                Nombre del KPI
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Llamadas realizadas, Reuniones agendadas..."
                className="tbm-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-tbm-text-muted mb-1">
                Meta semanal
              </label>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="100"
                className="tbm-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-tbm-text-muted mb-1">
                Unidad (opcional)
              </label>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="%, $, unidades..."
                className="tbm-input w-full"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-tbm-text-muted mb-2">
                Tipo
              </label>
              <div className="flex gap-2">
                {(["leading", "lagging"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm border transition-all",
                      newType === t
                        ? "border-tbm-blue bg-tbm-blue/10 text-white"
                        : "border-tbm-border text-tbm-text-muted hover:border-tbm-blue/40"
                    )}
                  >
                    {t === "leading" ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Leading
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Lagging
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-tbm-text-muted mt-1.5">
                {newType === "leading"
                  ? "Leading: indicador de causa (actividades que generan resultados)"
                  : "Lagging: indicador de resultado (ventas, ingresos, etc.)"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-tbm-text-muted hover:text-white px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !newName.trim() || !newTarget}
              className="tbm-btn-primary text-sm disabled:opacity-40"
            >
              {saving ? "Guardando..." : "Agregar KPI"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de KPIs */}
      {kpis.length === 0 && !showForm ? (
        <div className="tbm-card p-10 text-center border-dashed">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-white font-medium">Sin KPIs esta semana</p>
          <p className="text-tbm-text-secondary text-sm mt-1">
            Agregá hasta 5 indicadores para trackear el progreso de tu equipo
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="tbm-btn-primary mt-4 text-sm"
          >
            + Crear primer KPI
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {kpis.map((kpi) => {
            const pct =
              kpi.weekly_target > 0
                ? Math.round(((kpi.current_value ?? 0) / kpi.weekly_target) * 100)
                : 0;
            const semaforo =
              pct >= 100 ? "verde" : pct >= 85 ? "amarillo" : "rojo";
            const colors = {
              verde:    "text-tbm-green  bg-tbm-green/10  border-tbm-green/30",
              amarillo: "text-tbm-yellow bg-tbm-yellow/10 border-tbm-yellow/30",
              rojo:     "text-tbm-red    bg-tbm-red/10    border-tbm-red/30",
            }[semaforo];

            return (
              <div key={kpi.id} className="tbm-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium",
                          colors
                        )}
                      >
                        {pct}%
                      </span>
                      <span className="text-xs text-tbm-text-muted">
                        {kpi.type === "leading" ? "Leading" : "Lagging"}
                      </span>
                    </div>
                    <p className="font-medium text-white text-sm">{kpi.name}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(kpi.id)}
                    className="text-tbm-text-muted hover:text-tbm-red transition-colors flex-shrink-0"
                    title="Desactivar KPI"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Edición inline del valor */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-1.5 bg-tbm-border rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", {
                        "bg-tbm-green":  semaforo === "verde",
                        "bg-tbm-yellow": semaforo === "amarillo",
                        "bg-tbm-red":    semaforo === "rojo",
                      })}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-sm flex-shrink-0">
                    <input
                      type="number"
                      defaultValue={kpi.current_value ?? 0}
                      onBlur={(e) =>
                        handleValueUpdate(kpi.id, parseFloat(e.target.value))
                      }
                      className="w-16 bg-tbm-surface border border-tbm-border rounded px-2 py-1 text-white text-xs text-center focus:border-tbm-blue outline-none"
                    />
                    <span className="text-tbm-text-muted text-xs">
                      / {kpi.weekly_target}
                      {kpi.unit ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {kpis.length >= 5 && (
        <p className="text-xs text-tbm-text-muted text-center">
          Máximo 5 KPIs por semana — enfocate en lo que más mueve la aguja
        </p>
      )}
    </div>
  );
}
