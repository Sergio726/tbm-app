"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { effectivePrefs } from "@/lib/notify-channels";
import type { NotificationPrefs } from "@/types/database";

/**
 * Preferencias de avisos (S23 · E1). Absorbe el módulo de configuración que
 * planteaba el S19 propuesto.
 *
 * Guarda con upsert desde el cliente: la RLS de `notification_prefs` limita a
 * `user_id = auth.uid()`, así que —a diferencia de la ficha de rol de S22— acá el
 * dueño SÍ escribe y no hace falta server action. Son sus preferencias, no una
 * evaluación de su líder.
 */

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function NotificationPrefsForm({
  userId,
  companyId,
  initial,
}: {
  userId: string;
  companyId: string | null;
  initial: NotificationPrefs | null;
}) {
  const toast = useToast();
  const base = effectivePrefs(initial);

  const [dailyDigest, setDailyDigest] = useState(base.dailyDigest);
  const [taskAlerts, setTaskAlerts] = useState(base.taskAlerts);
  const [weeklyReport, setWeeklyReport] = useState(base.weeklyReport);
  const [hour, setHour] = useState<number | null>(base.preferredHour);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from("notification_prefs").upsert(
        {
          user_id: userId,
          company_id: companyId,
          daily_digest: dailyDigest,
          task_alerts: taskAlerts,
          weekly_report: weeklyReport,
          preferred_hour: hour,
          channel_email: true, // el canal se elige cuando haya más de uno (S31)
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      toast.success("Preferencias guardadas.");
    } catch (e) {
      console.error("Error guardando preferencias:", e);
      toast.error("No se pudieron guardar las preferencias.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-[12.5px] leading-relaxed" style={{ color: "var(--fg-subtle)" }}>
        Elegí qué te avisa el sistema por correo. Si apagás todo, no vas a recibir nada
        — tampoco los recordatorios de tus rituales.
      </p>

      <div className="flex flex-col gap-2.5">
        <Toggle
          label="Despertador diario"
          desc="Cada mañana: tu Pre-game, tus hábitos del día y lo que quedó pendiente."
          checked={dailyDigest}
          onChange={setDailyDigest}
        />
        <Toggle
          label="Alertas de tareas"
          desc="Cuando una tarea tuya lleva más de 72h sin movimiento."
          checked={taskAlerts}
          onChange={setTaskAlerts}
        />
        <Toggle
          label="Reporte semanal"
          desc="El resumen del equipo, los domingos."
          checked={weeklyReport}
          onChange={setWeeklyReport}
        />
      </div>

      {/* Hora preferida (S23b). Ya se respeta, siempre que el cron corra cada hora
          (`CRON_HOURLY=true` + Schedule horario en Dokploy). Con el schedule diario
          el correo sale en la corrida del día, como antes — por eso el copy dice
          "a partir de" y no promete una hora exacta. */}
      <div className="mt-4 rounded-[11px] border border-white/[0.07] bg-white/[0.02] p-3.5">
        <label
          className="mb-1.5 block text-[12px] font-semibold"
          style={{ color: "var(--fg-muted)" }}
        >
          Hora preferida del despertador
        </label>
        <select
          value={hour ?? ""}
          onChange={(e) => setHour(e.target.value === "" ? null : Number(e.target.value))}
          disabled={!dailyDigest}
          className="w-full rounded-[10px] border border-white/[0.09] bg-white/[0.035] px-3 py-2.5 text-sm text-fg outline-none transition focus:border-[#5b8aff]/60 disabled:opacity-50"
        >
          <option value="">La que definió mi empresa</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}:00
            </option>
          ))}
        </select>
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--fg-subtle)" }}>
          ⓘ El correo sale <strong>a partir de</strong> esa hora, en tu zona horaria
          (la que tenés configurada más arriba). Nunca llega dos veces el mismo día.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(180deg, #4f86ff, #2c5fe6)" }}
        >
          {saving ? "Guardando…" : "Guardar preferencias"}
        </button>
        {saved && (
          <span
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
            style={{ color: "var(--success-text)" }}
          >
            <Check size={14} /> Guardado
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-[11px] border border-white/[0.07] bg-white/[0.02] p-3.5 text-left transition hover:bg-white/[0.04]"
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-[18px] w-[32px] flex-shrink-0 items-center rounded-full transition-colors"
        style={{
          background: checked ? "var(--accent)" : "rgba(255,255,255,0.14)",
          padding: 2,
        }}
      >
        <span
          className="h-[14px] w-[14px] rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(14px)" : "translateX(0)" }}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-fg">{label}</span>
        <span className="block text-[11.5px] leading-relaxed" style={{ color: "var(--fg-subtle)" }}>
          {desc}
        </span>
      </span>
    </button>
  );
}

/** Ícono exportado para que la sección lo reuse sin duplicar el import. */
export const NotificationPrefsIcon = Bell;
