"use client";

import Link from "next/link";
import { Plus, Send, ClipboardList } from "lucide-react";
import type { Task, Profile } from "@/types/database";

interface DelegacionClientProps {
  tasks: Task[];
  team: Profile[];
  currentUserId: string;
  companyId: string;
  isArquitecto: boolean;
}

export function DelegacionClient({
  tasks,
  team,
  currentUserId,
  companyId,
  isArquitecto,
}: DelegacionClientProps) {
  const myTasks = isArquitecto
    ? tasks
    : tasks.filter((t) => t.assigned_to === currentUserId);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "32px 36px",
      }}
    >
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
                border: "1px solid rgba(91,138,255,0.25)",
                color: "#9fb9ff",
              }}
            >
              <Send size={18} strokeWidth={1.6} />
            </div>
            <h1
              className="text-white"
              style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}
            >
              Delegación
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 52 }}>
            Pase de Estafeta — 5 puntos obligatorios por tarea
          </p>
        </div>

        {isArquitecto && (
          <Link
            href="/delegacion/nueva"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
              fontSize: 13.5,
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(91,138,255,0.35)",
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Nueva tarea
          </Link>
        )}
      </div>

      {/* Contenido */}
      {myTasks.length === 0 ? (
        <EmptyState isArquitecto={isArquitecto} />
      ) : (
        <TaskList tasks={myTasks} team={team} isArquitecto={isArquitecto} />
      )}

      {/* Vista colaborador: link a mis tareas */}
      {!isArquitecto && (
        <div className="mt-6">
          <Link
            href="/delegacion/mis-tareas"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-white/70 transition-colors hover:text-white"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              fontSize: 13.5,
            }}
          >
            <ClipboardList size={15} strokeWidth={1.6} />
            Ver mis tareas asignadas
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyState({ isArquitecto }: { isArquitecto: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
      }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(91,138,255,0.1)",
          border: "1px solid rgba(91,138,255,0.2)",
        }}
      >
        <Send size={28} strokeWidth={1.4} style={{ color: "#5b8aff" }} />
      </div>
      <h2
        className="mb-2 text-white"
        style={{ fontSize: 18, fontWeight: 600 }}
      >
        Sin tareas delegadas aún
      </h2>
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.45)",
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        {isArquitecto
          ? "Creá tu primera tarea con los 5 puntos del Pase de Estafeta. Sin los 5 puntos, el error es tuyo."
          : "Tu líder no te ha asignado tareas todavía."}
      </p>
      {isArquitecto && (
        <Link
          href="/delegacion/nueva"
          className="mt-6 flex items-center gap-2 rounded-xl px-5 py-3 text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(91,138,255,0.3)",
          }}
        >
          <Plus size={16} strokeWidth={2} />
          Crear primera tarea
        </Link>
      )}
    </div>
  );
}

// ── TaskList provisional (se reemplaza por KanbanBoard en E3) ─────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  blocked: "Bloqueado",
  done: "Listo",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "rgba(255,255,255,0.3)",
  in_progress: "#5b8aff",
  blocked: "#f87171",
  done: "#34d399",
};

function TaskList({
  tasks,
  team,
  isArquitecto,
}: {
  tasks: Task[];
  team: Profile[];
  isArquitecto: boolean;
}) {
  const profileMap = Object.fromEntries(team.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const assignee = task.assigned_to ? profileMap[task.assigned_to] : null;
        const deadline = new Date(task.when_deadline);
        const isOverdue = deadline < new Date() && task.status !== "done";
        const isSoon =
          !isOverdue &&
          deadline < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
          task.status !== "done";

        return (
          <div
            key={task.id}
            className="rounded-2xl border px-5 py-4"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.006))",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className="mb-1 truncate text-white"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  {task.what_dod || "Sin descripción"}
                </p>
                {assignee && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    → {assignee.full_name ?? assignee.email ?? "Colaborador"}
                  </p>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {/* Deadline */}
                <span
                  style={{
                    fontSize: 11.5,
                    color: isOverdue
                      ? "#f87171"
                      : isSoon
                        ? "#fbbf24"
                        : "rgba(255,255,255,0.4)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {deadline.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                {/* Badge status */}
                <span
                  className="rounded-full px-2.5 py-0.5"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: STATUS_COLORS[task.status] ?? "rgba(255,255,255,0.4)",
                    background: `${STATUS_COLORS[task.status] ?? "rgba(255,255,255,0.15)"}18`,
                    border: `1px solid ${STATUS_COLORS[task.status] ?? "rgba(255,255,255,0.15)"}40`,
                  }}
                >
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
