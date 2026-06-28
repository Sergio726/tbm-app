"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Play,
  Check,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notifications";
import type { Task, Profile, TaskStatus } from "@/types/database";

const STATUS_DISPLAY: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string; accent: string }
> = {
  pending: {
    label: "Pendiente",
    color: "var(--fg-muted)",
    bg: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.12)",
    accent: "rgba(255,255,255,0.3)",
  },
  in_progress: {
    label: "En curso",
    color: "#5b8aff",
    bg: "rgba(91,138,255,0.1)",
    border: "rgba(91,138,255,0.25)",
    accent: "#5b8aff",
  },
  blocked: {
    label: "Bloqueado",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
    accent: "#f87171",
  },
  done: {
    label: "Listo",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.25)",
    accent: "#34d399",
  },
};

const PUNTOS: { key: keyof Task; label: string }[] = [
  { key: "what_dod", label: "QUÉ (DoD)" },
  { key: "why_context", label: "POR QUÉ" },
  { key: "how_constraints", label: "CÓMO (restricciones)" },
  { key: "when_deadline", label: "CUÁNDO" },
  { key: "check_loop", label: "CHEQUEO" },
];

interface MisTareasClientProps {
  tasks: Task[];
  team: Profile[];
  currentUserId: string;
}

export function MisTareasClient({ tasks: initialTasks, currentUserId }: MisTareasClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setPendingTaskId(taskId);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      if (!error) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
        // Al completar: notificar al creador de la tarea (no bloqueante)
        if (newStatus === "done") {
          const task = tasks.find((t) => t.id === taskId);
          if (task) {
            await notify(supabase, {
              companyId: task.company_id,
              userId: task.created_by,
              actorId: currentUserId,
              type: "task_done",
              title: "Tarea completada",
              body: `"${task.what_dod.slice(0, 60)}" fue marcada como lista.`,
              href: "/delegacion",
            });
          }
        }
      }
      setPendingTaskId(null);
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, var(--bg) 0%, var(--bg) 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 transition-colors hover:text-white"
          style={{ fontSize: 13, color: "var(--fg-muted)" }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "#9fb9ff",
            }}
          >
            <ClipboardList size={18} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              className="text-white"
              style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}
            >
              Mis tareas
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--fg-muted)", marginTop: 1 }}>
              Tus tareas asignadas con los 5 puntos obligatorios
            </p>
          </div>
        </div>
      </div>

      {/* Lista */}
      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3" style={{ maxWidth: 820 }}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isExpanded={expandedId === task.id}
              isLoading={isPending && pendingTaskId === task.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === task.id ? null : task.id))
              }
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  isExpanded: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskRow({
  task,
  isExpanded,
  isLoading,
  onToggle,
  onStatusChange,
}: TaskRowProps) {
  const status = STATUS_DISPLAY[task.status as TaskStatus] ?? STATUS_DISPLAY.pending;

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

  const isDone = task.status === "done";
  const isBlocked = task.status === "blocked";
  const isPending = task.status === "pending";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      className="relative overflow-hidden rounded-xl border transition-all"
      style={{
        borderColor: isExpanded
          ? "rgba(91,138,255,0.2)"
          : "rgba(255,255,255,0.07)",
        background: isExpanded
          ? "linear-gradient(180deg, rgba(91,138,255,0.05), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 0.15s, border-color 0.15s, background 0.15s",
      }}
    >
      {/* Borde lateral de estado */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: status.accent }}
      />

      {/* Fila colapsada — siempre visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 py-3.5 pl-5 pr-4 text-left"
      >
        {/* Status pill */}
        <span
          className="flex-shrink-0 rounded-md px-2 py-0.5"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: status.color,
            background: status.bg,
            border: `1px solid ${status.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </span>

        {/* QUÉ */}
        <span
          className="flex-1 text-white"
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.what_dod}
        </span>

        {/* Deadline */}
        <span
          className="flex flex-shrink-0 items-center gap-1"
          style={{
            fontSize: 11.5,
            color: deadlineColor,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {isOverdue ? (
            <AlertTriangle size={10} strokeWidth={2} />
          ) : (
            <Clock size={10} strokeWidth={2} />
          )}
          {deadline.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
        </span>

        {/* Chevron */}
        {isExpanded ? (
          <ChevronUp size={15} strokeWidth={2} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={15} strokeWidth={2} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
        )}
      </button>

      {/* Acciones — siempre visibles (excepto si está completada) */}
      {!isDone && (
        <div
          className="flex flex-wrap items-center gap-2.5 pb-3.5 pl-5 pr-4"
          style={{ marginTop: isExpanded ? 0 : -4 }}
        >
          {isPending && (
            <ActionButton
              onClick={() => onStatusChange(task.id, "in_progress")}
              disabled={isLoading}
              icon={Play}
              label={isLoading ? "Guardando…" : "Iniciar"}
              grad="linear-gradient(135deg, #5b8aff, #2c5fe6)"
              shadow="rgba(91,138,255,0.3)"
            />
          )}

          {isInProgress && (
            <ActionButton
              onClick={() => onStatusChange(task.id, "done")}
              disabled={isLoading}
              icon={Check}
              label={isLoading ? "Guardando…" : "Marcar completado"}
              grad="linear-gradient(135deg, #34d399, #059669)"
              shadow="rgba(52,211,153,0.3)"
            />
          )}

          {!isBlocked && (
            <Link
              href={`/delegacion/bloqueado/${task.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 transition-colors hover:border-red-400/40 hover:text-red-300"
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "rgba(248,113,113,0.7)",
                borderColor: "rgba(248,113,113,0.2)",
                background: "rgba(248,113,113,0.04)",
              }}
            >
              <ShieldAlert size={13} strokeWidth={2} />
              Estoy bloqueado
            </Link>
          )}

          {isBlocked && (
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 12.5,
                color: "rgba(248,113,113,0.65)",
                fontStyle: "italic",
              }}
            >
              <ShieldAlert size={13} strokeWidth={2} />
              Escalado al líder — esperá respuesta
            </span>
          )}
        </div>
      )}

      {/* Contenido expandido: los 5 puntos */}
      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "18px 18px 18px 21px",
          }}
        >
          <div className="flex flex-col gap-3.5">
            {PUNTOS.map((p) => {
              let value = task[p.key] as string;
              if (p.key === "when_deadline") {
                value = new Date(value).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
              return (
                <div key={p.key}>
                  <p
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      color: "var(--fg-muted)",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {p.label}
                  </p>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--fg)",
                      lineHeight: 1.55,
                    }}
                  >
                    {value || "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isDone && (
        <p
          className="pb-3.5 pl-5 pr-4"
          style={{ fontSize: 13, color: "#34d399", fontWeight: 500, marginTop: -4 }}
        >
          ✓ Tarea completada
        </p>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  grad,
  shadow,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: typeof Play;
  label: string;
  grad: string;
  shadow: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        background: grad,
        boxShadow: `0 4px 12px ${shadow}`,
      }}
    >
      <Icon size={13} strokeWidth={2} />
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        maxWidth: 820,
      }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(91,138,255,0.1)",
          border: "1px solid rgba(91,138,255,0.2)",
        }}
      >
        <ClipboardList
          size={28}
          strokeWidth={1.4}
          style={{ color: "#5b8aff" }}
        />
      </div>
      <h2 className="mb-2 text-white" style={{ fontSize: 18, fontWeight: 600 }}>
        Sin tareas asignadas
      </h2>
      <p
        style={{
          fontSize: 13.5,
          color: "var(--fg-muted)",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Tu líder no te ha asignado tareas todavía.
      </p>
    </div>
  );
}
