"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { Check, Lock, Activity } from "lucide-react";
import type { PreGame } from "@/types/database";

interface Props {
  userId: string;
  companyId: string;
  date: string;
  initial: PreGame;
  marchLockedThisWeek: boolean;
  marchValue: string;
}

export default function PreGameForm({
  userId,
  companyId,
  date,
  initial,
  marchLockedThisWeek,
  marchValue,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();

  const [big1, setBig1] = useState(initial.big_win_1 ?? "");
  const [big2, setBig2] = useState(initial.big_win_2 ?? "");
  const [big3, setBig3] = useState(initial.big_win_3 ?? "");
  const [march, setMarch] = useState(marchValue);
  const [physical, setPhysical] = useState(initial.physical_activation ?? false);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(
    initial.updated_at ?? initial.created_at ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const allBigWinsFilled = big1.trim() && big2.trim() && big3.trim();
  const completed = !!savedAt && allBigWinsFilled;

  const save = () => {
    setError(null);
    startTransition(async () => {
      const { error: upsertError, data } = await supabase
        .from("pre_games")
        .upsert(
          {
            user_id: userId,
            company_id: companyId,
            log_date: date,
            big_win_1: big1.trim() || null,
            big_win_2: big2.trim() || null,
            big_win_3: big3.trim() || null,
            twenty_mile_march: march.trim() || null,
            physical_activation: physical,
            notes: notes.trim() || null,
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
      capture("pre_game_completed", { physical_activation: physical });
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
      {/* Header status */}
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
          {completed ? "Pre-game completo" : "Pre-game pendiente"}
        </div>
        {completed && (
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 11.5,
              color: "#34d399",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(52,211,153,0.10)",
              border: "1px solid rgba(52,211,153,0.25)",
            }}
          >
            <Check size={12} />
            Hecho
          </span>
        )}
      </div>

      {/* 3 Big Wins */}
      <div style={{ marginBottom: 20 }}>
        <Label>3 Big Wins personales (no del negocio)</Label>
        <p
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Tres cosas concretas que vas a lograr HOY para vos. No tareas del trabajo —
          lo que define que tuviste un buen día como persona.
        </p>
        <div className="flex flex-col" style={{ gap: 10 }}>
          <BigWinInput n={1} value={big1} onChange={setBig1} />
          <BigWinInput n={2} value={big2} onChange={setBig2} />
          <BigWinInput n={3} value={big3} onChange={setBig3} />
        </div>
      </div>

      {/* Marcha de 20 Millas */}
      <div style={{ marginBottom: 20 }}>
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 4 }}
        >
          <Label>Mi Marcha de 20 Millas</Label>
          {marchLockedThisWeek && (
            <span
              className="flex items-center"
              style={{
                gap: 6,
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                padding: "3px 9px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Lock size={11} />
              Editable la próxima semana
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          La acción diaria constante que sostenés sin importar el clima. Solo se cambia
          una vez por semana.
        </p>
        <textarea
          value={march}
          onChange={(e) => setMarch(e.target.value)}
          disabled={marchLockedThisWeek}
          placeholder="Ej: 90 min de trabajo profundo sin notificaciones, todos los días."
          rows={2}
          style={{
            width: "100%",
            background: marchLockedThisWeek
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: marchLockedThisWeek ? "rgba(255,255,255,0.55)" : "#fff",
            padding: "10px 14px",
            fontSize: 13.5,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Activación física */}
      <div style={{ marginBottom: 20 }}>
        <Label>Activación física</Label>
        <button
          type="button"
          onClick={() => setPhysical((p) => !p)}
          className="flex items-center"
          style={{
            gap: 10,
            marginTop: 8,
            padding: "11px 16px",
            borderRadius: 10,
            background: physical
              ? "rgba(52,211,153,0.10)"
              : "rgba(255,255,255,0.03)",
            border: physical
              ? "1px solid rgba(52,211,153,0.30)"
              : "1px solid rgba(255,255,255,0.08)",
            color: physical ? "#34d399" : "rgba(255,255,255,0.7)",
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          <Activity size={15} />
          {physical
            ? "Sí — hice activación física hoy"
            : "No · marcar cuando la hagas"}
        </button>
      </div>

      {/* Notas opcionales */}
      <div style={{ marginBottom: 24 }}>
        <Label>Notas (opcional)</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cualquier reflexión libre, energía, foco del día..."
          rows={2}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#fff",
            padding: "10px 14px",
            fontSize: 13.5,
            resize: "vertical",
            fontFamily: "inherit",
            marginTop: 8,
          }}
        />
      </div>

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

      <div className="flex items-center justify-between">
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          {savedAt
            ? "Guardado · " + new Date(savedAt).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Sin guardar"}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={isPending || !allBigWinsFilled}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: allBigWinsFilled
              ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
              : "rgba(255,255,255,0.06)",
            color: allBigWinsFilled ? "#fff" : "rgba(255,255,255,0.5)",
            border: "none",
            fontSize: 13.5,
            fontWeight: 600,
            cursor:
              isPending || !allBigWinsFilled ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending
            ? "Guardando…"
            : completed
              ? "Actualizar Pre-game"
              : "Cerrar Pre-game"}
        </button>
      </div>

      {!allBigWinsFilled && (
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.62)",
            marginTop: 10,
            textAlign: "right",
          }}
        >
          Los 3 Big Wins son obligatorios para cerrar el Pre-game.
        </p>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: "#fff",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function BigWinInput({
  n,
  value,
  onChange,
}: {
  n: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "0 14px",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(251,191,36,0.85)",
          minWidth: 14,
        }}
      >
        {n}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Big Win ${n} · qué define que el día valió la pena para vos`}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          padding: "11px 0",
          fontSize: 13.5,
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
