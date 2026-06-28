"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import type { RitualConfig, RitualMode } from "@/types/database";

const MODES: { value: RitualMode; label: string; description: string }[] = [
  {
    value: "daily",
    label: "Diario",
    description: "Pre-game, War Up y Cool Down todos los días hábiles.",
  },
  {
    value: "A",
    label: "Modo A",
    description: "War Up + Cool Down diarios. Recomendado para equipos < 8 personas.",
  },
  {
    value: "B",
    label: "Modo B",
    description: "War Up lunes/miércoles/viernes. Cool Down todos los días.",
  },
  {
    value: "C",
    label: "Modo C",
    description: "Solo War Up lunes y Cool Down viernes. Mínimo viable.",
  },
];

// Lista corta de timezones útiles para LATAM
const TIMEZONES = [
  "America/Bogota",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Mexico_City",
  "America/Lima",
  "America/Sao_Paulo",
  "Europe/Madrid",
];

interface Props {
  companyId: string;
  userId: string;
  canEdit: boolean;
  initial: RitualConfig;
}

function trimSeconds(t: string): string {
  // "09:00:00" → "09:00"
  return t.slice(0, 5);
}

export default function RitualConfigForm({
  companyId,
  userId,
  canEdit,
  initial,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<RitualMode>(initial.mode as RitualMode);
  const [warUpDeadline, setWarUpDeadline] = useState(trimSeconds(initial.war_up_deadline));
  const [coolDownStart, setCoolDownStart] = useState(trimSeconds(initial.cool_down_start));
  const [preGameReminder, setPreGameReminder] = useState(
    trimSeconds(initial.pre_game_reminder)
  );
  const [los5Reminder, setLos5Reminder] = useState(
    trimSeconds(initial.los_5_grandes_reminder)
  );
  const [timezone, setTimezone] = useState(initial.timezone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const payload = {
        company_id: companyId,
        mode,
        war_up_deadline: warUpDeadline + ":00",
        cool_down_start: coolDownStart + ":00",
        pre_game_reminder: preGameReminder + ":00",
        los_5_grandes_reminder: los5Reminder + ":00",
        timezone,
        updated_by: userId,
      };

      const { error: err } = await supabase
        .from("ritual_configs")
        .upsert(payload, { onConflict: "company_id" });

      if (err) {
        setError(err.message);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div
      style={{
        padding: 28,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Modo */}
      <SectionLabel>Modo de ejecución</SectionLabel>
      <div className="flex flex-col" style={{ gap: 8, marginBottom: 24 }}>
        {MODES.map((m) => {
          const active = mode === m.value;
          return (
            <button
              type="button"
              key={m.value}
              disabled={!canEdit}
              onClick={() => setMode(m.value)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 10,
                background: active
                  ? "linear-gradient(135deg, rgba(91,138,255,0.15), rgba(91,138,255,0.04))"
                  : "rgba(255,255,255,0.025)",
                border: active
                  ? "1px solid rgba(91,138,255,0.35)"
                  : "1px solid rgba(255,255,255,0.06)",
                color: "var(--fg)",
                cursor: canEdit ? "pointer" : "default",
                opacity: !canEdit && !active ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  marginBottom: 2,
                  color: active ? "#bcd0ff" : "#fff",
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--fg-muted)",
                  lineHeight: 1.5,
                }}
              >
                {m.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Horarios */}
      <SectionLabel>Horarios</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <TimeField
          label="Recordatorio Pre-game"
          hint="Notificación matutina al Arquitecto"
          value={preGameReminder}
          onChange={setPreGameReminder}
          disabled={!canEdit}
        />
        <TimeField
          label="Deadline del War Up"
          hint="Hora límite para que el equipo ingrese su QUÉ/POR QUÉ/BLOQUEO"
          value={warUpDeadline}
          onChange={setWarUpDeadline}
          disabled={!canEdit}
        />
        <TimeField
          label="Inicio del Cool Down"
          hint="A partir de esta hora se habilita el cierre del día"
          value={coolDownStart}
          onChange={setCoolDownStart}
          disabled={!canEdit}
        />
        <TimeField
          label="Recordatorio Los 5 Grandes"
          hint="Notificación nocturna para definir las prioridades del día siguiente"
          value={los5Reminder}
          onChange={setLos5Reminder}
          disabled={!canEdit}
        />
      </div>

      {/* Timezone */}
      <SectionLabel>Zona horaria</SectionLabel>
      <select
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
        disabled={!canEdit}
        style={{
          width: "100%",
          background: canEdit ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          color: canEdit ? "#fff" : "rgba(255,255,255,0.5)",
          padding: "10px 14px",
          fontSize: 13.5,
          fontFamily: "inherit",
          outline: "none",
          marginBottom: 24,
        }}
      >
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz} style={{ background: "#0a0e18" }}>
            {tz}
          </option>
        ))}
      </select>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.30)",
            color: "#fca5a5",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {canEdit && (
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            {saved ? "Guardado." : initial.updated_at ? `Última edición · ${new Date(initial.updated_at).toLocaleString("es-AR")}` : "Sin cambios guardados"}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
              color: "var(--fg)",
              border: "none",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase"
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--fg-subtle)",
        letterSpacing: 1.3,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function TimeField({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--fg)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 11.5,
          color: "var(--fg-subtle)",
          marginBottom: 6,
          lineHeight: 1.45,
        }}
      >
        {hint}
      </p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          color: disabled ? "rgba(255,255,255,0.5)" : "#fff",
          padding: "9px 14px",
          fontSize: 13.5,
          fontFamily: "inherit",
          outline: "none",
        }}
      />
    </div>
  );
}
