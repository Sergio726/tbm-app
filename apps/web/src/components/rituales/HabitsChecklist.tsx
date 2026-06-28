"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { Check, Pencil, Sparkles, ListChecks } from "lucide-react";
import HabitsPicker from "./HabitsPicker";
import { CUSTOM_HABIT_EMOJI } from "@/lib/habits";
import type { UserHabit } from "@/types/database";

interface Props {
  userId: string;
  companyId: string;
  date: string;
  /** Todos los hábitos (activos + inactivos) para el picker; se filtran activos para el checklist. */
  allHabits: UserHabit[];
  /** Ids de hábito marcados como hechos hoy. */
  doneToday: string[];
}

export default function HabitsChecklist({
  userId,
  companyId,
  date,
  allHabits,
  doneToday,
}: Props) {
  const supabase = createBrowserClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [doneSet, setDoneSet] = useState<Set<string>>(() => new Set(doneToday));
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const active = useMemo(
    () =>
      allHabits
        .filter((h) => h.is_active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allHabits]
  );

  const total = active.length;
  const done = active.filter((h) => doneSet.has(h.id)).length;
  const allDone = total > 0 && done === total;

  const toggle = async (habit: UserHabit) => {
    if (busy.has(habit.id)) return;
    const wasDone = doneSet.has(habit.id);

    // Optimista
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (wasDone) next.delete(habit.id);
      else next.add(habit.id);
      return next;
    });
    setBusy((prev) => new Set(prev).add(habit.id));

    const { error } = wasDone
      ? await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habit.id)
          .eq("log_date", date)
      : await supabase
          .from("habit_logs")
          .insert({ user_id: userId, habit_id: habit.id, log_date: date });

    setBusy((prev) => {
      const next = new Set(prev);
      next.delete(habit.id);
      return next;
    });

    if (error) {
      // Revertir
      setDoneSet((prev) => {
        const next = new Set(prev);
        if (wasDone) next.add(habit.id);
        else next.delete(habit.id);
        return next;
      });
      return;
    }
    capture("habit_toggled", { done: !wasDone, total });
  };

  return (
    <section style={{ marginTop: 28 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 14, gap: 12 }}
      >
        <div className="flex items-center" style={{ gap: 9 }}>
          <ListChecks size={17} color="#9bb8ff" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>
            Hábitos de hoy
          </h2>
        </div>
        {total > 0 && (
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 12.5,
              color: "var(--fg-muted)",
              background: "var(--elevated)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              padding: "6px 11px",
            }}
          >
            <Pencil size={12} />
            Editar
          </button>
        )}
      </div>

      {total === 0 ? (
        <EmptyState onPick={() => setPickerOpen(true)} />
      ) : (
        <div
          style={{
            padding: "clamp(16px, 4vw, 22px)",
            borderRadius: 16,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
            border: "1px solid var(--border)",
          }}
        >
          {/* Progreso */}
          <div
            className="flex items-center"
            style={{ gap: 14, marginBottom: 18 }}
          >
            <ProgressRing done={done} total={total} celebrate={allDone} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)" }}>
                {done}/{total} hechos
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: allDone ? "#34d399" : "rgba(255,255,255,0.55)",
                  marginTop: 2,
                }}
              >
                {allDone ? (
                  <span className="inline-flex items-center" style={{ gap: 5 }}>
                    <Sparkles size={13} /> Día redondo — completaste todos
                  </span>
                ) : (
                  "Tocá cada hábito cuando lo cumplas"
                )}
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="flex flex-col" style={{ gap: 9 }}>
            {active.map((h) => {
              const isDone = doneSet.has(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggle(h)}
                  className="flex items-center"
                  style={{
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: "13px 14px",
                    borderRadius: 12,
                    background: isDone
                      ? "rgba(52,211,153,0.10)"
                      : "rgba(255,255,255,0.03)",
                    border: isDone
                      ? "1px solid rgba(52,211,153,0.32)"
                      : "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <span style={{ fontSize: 21, lineHeight: 1 }}>
                    {h.emoji ?? CUSTOM_HABIT_EMOJI}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14.5,
                      fontWeight: 500,
                      color: isDone ? "#34d399" : "rgba(255,255,255,0.85)",
                      textDecoration: isDone ? "line-through" : "none",
                      textDecorationColor: "rgba(52,211,153,0.5)",
                    }}
                  >
                    {h.label}
                  </span>
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: isDone ? "#34d399" : "transparent",
                      border: isDone
                        ? "none"
                        : "1.5px solid rgba(255,255,255,0.2)",
                      color: "var(--bg)",
                    }}
                  >
                    {isDone && <Check size={16} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pickerOpen && (
        <HabitsPicker
          userId={userId}
          companyId={companyId}
          allHabits={allHabits}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </section>
  );
}

function EmptyState({ onPick }: { onPick: () => void }) {
  return (
    <div
      style={{
        padding: "clamp(22px, 6vw, 32px)",
        borderRadius: 16,
        textAlign: "center",
        background: "rgba(91,138,255,0.06)",
        border: "1px dashed rgba(91,138,255,0.30)",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>🌱</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>
        Sumá tus hábitos a la mañana
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--fg-muted)",
          lineHeight: 1.55,
          maxWidth: 420,
          margin: "0 auto 16px",
        }}
      >
        Elegí entre 5 y 10 hábitos (gym, agua, meditar, sin azúcar…) y marcalos cada
        mañana con un toque. Lo que medís, lo sostenés.
      </p>
      <button
        onClick={onPick}
        style={{
          padding: "11px 20px",
          borderRadius: 11,
          background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
          color: "var(--fg)",
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Elegí tus hábitos
      </button>
    </div>
  );
}

function ProgressRing({
  done,
  total,
  celebrate,
}: {
  done: number;
  total: number;
  celebrate: boolean;
}) {
  const size = 52;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const offset = circ * (1 - pct);
  const color = celebrate ? "#34d399" : "#5b8aff";
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="#fff"
      >
        {total > 0 ? Math.round(pct * 100) : 0}
      </text>
    </svg>
  );
}
