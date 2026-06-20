"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { Check, Sparkles } from "lucide-react";
import type { CoolDown } from "@/types/database";
import { maybeGenerateWeeklyReport } from "@/lib/rituales/weekly-report";

interface Props {
  userId: string;
  companyId: string;
  date: string;
  isFriday: boolean;
  initial: CoolDown | null;
}

export default function CoolDownForm({
  userId,
  companyId,
  date,
  isFriday,
  initial,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();

  const [victory, setVictory] = useState(initial?.victory_log ?? "");
  const [reality, setReality] = useState(initial?.reality_check ?? "");
  const [nextDay, setNextDay] = useState(initial?.next_day ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(
    initial?.updated_at ?? initial?.created_at ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const victoryFilled = victory.trim().length > 0;

  const save = () => {
    if (!victoryFilled) {
      setError(
        "Encontrá UNA victoria, aunque el día haya sido caos. El Victory Log no puede quedar vacío."
      );
      return;
    }
    setError(null);
    setReportGenerated(false);

    startTransition(async () => {
      const { data, error: upsertError } = await supabase
        .from("cool_downs")
        .upsert(
          {
            user_id: userId,
            company_id: companyId,
            log_date: date,
            victory_log: victory.trim(),
            reality_check: reality.trim() || null,
            next_day: nextDay.trim() || null,
          },
          { onConflict: "user_id,log_date" }
        )
        .select()
        .single();

      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      setSavedAt(data?.updated_at ?? new Date().toISOString());
      capture("cool_down_saved", {
        is_friday: isFriday,
        has_reality_check: !!reality.trim(),
        has_next_day: !!nextDay.trim(),
      });

      if (isFriday) {
        const { generated, error: reportError } = await maybeGenerateWeeklyReport(
          supabase,
          companyId,
          userId,
          date
        );
        if (reportError) {
          setError(
            `Cool Down guardado, pero el reporte semanal falló: ${reportError}`
          );
        } else if (generated) {
          setReportGenerated(true);
          capture("weekly_report_generated");
        }
      }

      router.refresh();
    });
  };

  const completed = !!savedAt && victoryFilled;

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
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 22 }}
      >
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: 1.3,
          }}
        >
          {completed ? "Cool Down completo" : "Cool Down pendiente"}
        </div>
        {completed && (
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 11.5,
              color: "#fb923c",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(251,146,60,0.10)",
              border: "1px solid rgba(251,146,60,0.25)",
            }}
          >
            <Check size={12} />
            Hecho
          </span>
        )}
      </div>

      <Field
        label="Victory Log"
        required
        hint="¿Cuál fue tu victoria de hoy? Encontrá UNA, aunque haya sido un caos."
      >
        <textarea
          value={victory}
          onChange={(e) => setVictory(e.target.value)}
          placeholder="Una victoria concreta del día. No 'trabajé mucho' — una cosa que efectivamente avanzó."
          rows={2}
          style={TEXTAREA_STYLE}
        />
      </Field>

      <Field
        label="Reality Check"
        hint="¿Qué NO se logró y por qué? Hechos, no excusas."
      >
        <textarea
          value={reality}
          onChange={(e) => setReality(e.target.value)}
          placeholder="Lo que quedó sin hacer y la razón concreta (no autocrítica)."
          rows={2}
          style={TEXTAREA_STYLE}
        />
      </Field>

      <Field
        label="Cierre de ciclos"
        hint="¿Qué queda agendado para mañana?"
      >
        <textarea
          value={nextDay}
          onChange={(e) => setNextDay(e.target.value)}
          placeholder="Las próximas acciones — links a personas o tareas pendientes."
          rows={2}
          style={TEXTAREA_STYLE}
        />
      </Field>

      {error && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.30)",
            color: "#fca5a5",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {reportGenerated && (
        <div
          className="flex items-center"
          style={{
            gap: 8,
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(52,211,153,0.10)",
            border: "1px solid rgba(52,211,153,0.30)",
            color: "#6ee7b7",
            fontSize: 13,
          }}
        >
          <Sparkles size={14} />
          Reporte Semanal generado automáticamente.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          {savedAt
            ? "Guardado · " +
              new Date(savedAt).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sin guardar"}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending || !victoryFilled}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: victoryFilled
              ? "linear-gradient(135deg, #fb923c, #ea580c)"
              : "rgba(255,255,255,0.06)",
            color: victoryFilled ? "#fff" : "rgba(255,255,255,0.5)",
            border: "none",
            fontSize: 13.5,
            fontWeight: 600,
            cursor:
              isPending || !victoryFilled ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending
            ? "Guardando…"
            : completed
              ? "Actualizar Cool Down"
              : isFriday
                ? "Cerrar día + generar Reporte"
                : "Cerrar Cool Down"}
        </button>
      </div>
    </div>
  );
}

const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "#fff",
  padding: "10px 14px",
  fontSize: 13.5,
  resize: "vertical",
  fontFamily: "inherit",
  marginTop: 6,
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "#fff",
          marginBottom: 2,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#fb923c", marginLeft: 6 }}>·obligatorio</span>
        )}
      </div>
      <p
        style={{
          fontSize: 12.5,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 4,
          lineHeight: 1.5,
        }}
      >
        {hint}
      </p>
      {children}
    </div>
  );
}
