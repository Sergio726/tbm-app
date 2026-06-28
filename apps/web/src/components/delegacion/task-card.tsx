"use client";

import { User, Clock, AlertTriangle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Task, Profile, TaskStatus } from "@/types/database";

const LOS_LABELS: Record<number, string> = {
  1: "N1",
  2: "N2",
  3: "N3",
  4: "N4",
  5: "N5",
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  pending: "rgba(255,255,255,0.3)",
  in_progress: "#5b8aff",
  blocked: "#f87171",
  done: "#34d399",
};

interface TaskCardProps {
  task: Task;
  assignee: Profile | null;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, assignee, onOpen }: TaskCardProps) {
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

  const accent = STATUS_ACCENT[task.status as TaskStatus] ?? STATUS_ACCENT.pending;
  const initials = assignee ? getInitials(assignee.full_name) : null;
  const discColor = getDiscColor(assignee?.disc_letters ?? null);

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="relative w-full overflow-hidden rounded-xl border text-left transition-all hover:border-white/20"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        cursor: "pointer",
      }}
    >
      {/* Borde lateral de estado */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: accent }}
      />

      <div style={{ padding: "13px 14px 13px 17px" }}>
        {/* Banner de urgencia */}
        {(isOverdue || isSoon) && (
          <div
            className="mb-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
            style={{
              background: isOverdue
                ? "rgba(248,113,113,0.14)"
                : "rgba(251,191,36,0.14)",
              border: `1px solid ${isOverdue ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`,
            }}
          >
            <AlertTriangle
              size={9}
              strokeWidth={2.5}
              style={{ color: isOverdue ? "#f87171" : "#fbbf24" }}
            />
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.3,
                color: isOverdue ? "#fca5a5" : "#fcd34d",
                textTransform: "uppercase",
              }}
            >
              {isOverdue ? "Vencida" : "Hoy"}
            </span>
          </div>
        )}

        {/* QUÉ */}
        <p
          className="mb-2.5 text-white"
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
                <User size={11} style={{ color: "var(--fg-muted)" }} />
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
        </div>
      </div>
    </button>
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
