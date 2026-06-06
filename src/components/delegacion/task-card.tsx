"use client";

import { useState, useTransition } from "react";
import { ChevronDown, User, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { Task, Profile, TaskStatus } from "@/types/database";

const LOS_LABELS: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
};

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pendiente", color: "rgba(255,255,255,0.4)" },
  { value: "in_progress", label: "En curso", color: "#5b8aff" },
  { value: "blocked", label: "Bloqueado", color: "#f87171" },
  { value: "done", label: "Listo", color: "#34d399" },
];

interface TaskCardProps {
  task: Task;
  assignee: Profile | null;
  isArquitecto: boolean;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskCard({
  task,
  assignee,
  isArquitecto,
  onStatusChange,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deadline = new Date(task.when_deadline);
  const now = new Date();
  const isOverdue = deadline < now && task.status !== "done";
  const isSoon =
    !isOverdue &&
    deadline < new Date(now.getTime() + 24 * 60 * 60 * 1000) &&
    task.status !== "done";

  const deadlineColor = isOverdue
    ? "#f87171"
    : isSoon
      ? "#fbbf24"
      : "rgba(255,255,255,0.35)";

  const handleStatusChange = (newStatus: TaskStatus) => {
    setShowMenu(false);
    if (newStatus === task.status) return;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);
      if (!error) onStatusChange(task.id, newStatus);
    });
  };

  const initials = assignee ? getInitials(assignee.full_name) : null;
  const discColor = getDiscColor(assignee?.disc_letters ?? null);

  return (
    <div
      className="relative rounded-xl border"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        padding: "14px 16px",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* QUÉ */}
      <p
        className="mb-2 text-white"
        style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.45,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {task.what_dod || "Sin descripción"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Assignee + LOS */}
        <div className="flex items-center gap-2">
          {assignee ? (
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white"
              style={{
                background: `linear-gradient(135deg, ${discColor}, ${discColor}88)`,
                fontSize: 9,
                fontWeight: 700,
                boxShadow: `0 2px 6px ${discColor}44`,
              }}
              title={assignee.full_name ?? ""}
            >
              {initials}
            </div>
          ) : (
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px dashed rgba(255,255,255,0.2)",
              }}
            >
              <User size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          )}

          {task.los_required && (
            <span
              className="rounded-md px-1.5 py-0.5"
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a78bfa",
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              {LOS_LABELS[task.los_required] ?? `N${task.los_required}`}
            </span>
          )}
        </div>

        {/* Deadline + cambio de estado */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1"
            style={{
              fontSize: 11,
              color: deadlineColor,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            <Clock size={10} strokeWidth={2} />
            {deadline.toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
            })}
          </span>

          {isArquitecto && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center gap-0.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/10"
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
                title="Cambiar estado"
              >
                <ArrowRight size={11} strokeWidth={2} />
                <ChevronDown size={10} strokeWidth={2} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-20 mt-1 min-w-[130px] overflow-hidden rounded-xl border"
                    style={{
                      background: "#111827",
                      borderColor: "rgba(255,255,255,0.1)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    {STATUS_OPTIONS.filter(
                      (o) => o.value !== task.status
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleStatusChange(opt.value)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                        style={{ fontSize: 12.5 }}
                      >
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: opt.color }}
                        />
                        <span style={{ color: opt.color }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getDiscColor(discLetters: string | null): string {
  if (!discLetters) return "#5b8aff";
  const first = discLetters[0]?.toUpperCase();
  const map: Record<string, string> = {
    D: "#f87171",
    I: "#fbbf24",
    S: "#34d399",
    C: "#5b8aff",
  };
  return map[first] ?? "#5b8aff";
}
