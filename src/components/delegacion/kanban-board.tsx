"use client";

import { useState } from "react";
import { TaskCard } from "./task-card";
import type { Task, Profile, TaskStatus } from "@/types/database";

const COLUMNS: {
  status: TaskStatus;
  label: string;
  accent: string;
  emptyMsg: string;
}[] = [
  {
    status: "pending",
    label: "Pendiente",
    accent: "rgba(255,255,255,0.25)",
    emptyMsg: "Sin tareas pendientes",
  },
  {
    status: "in_progress",
    label: "En curso",
    accent: "#5b8aff",
    emptyMsg: "Nadie trabajando aún",
  },
  {
    status: "blocked",
    label: "Bloqueado",
    accent: "#f87171",
    emptyMsg: "Sin bloqueos",
  },
  {
    status: "done",
    label: "Listo",
    accent: "#34d399",
    emptyMsg: "Sin tareas completadas",
  },
];

interface KanbanBoardProps {
  initialTasks: Task[];
  team: Profile[];
  isArquitecto: boolean;
}

export function KanbanBoard({
  initialTasks,
  team,
  isArquitecto,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const profileMap = Object.fromEntries(team.map((p) => [p.id, p]));

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        alignItems: "start",
      }}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasksByStatus(col.status);
        return (
          <div key={col.status} className="flex flex-col gap-3">
            {/* Header de columna */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: col.accent }}
                />
                <span
                  className="font-semibold"
                  style={{ fontSize: 12.5, color: col.accent }}
                >
                  {col.label}
                </span>
              </div>
              {colTasks.length > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: `${col.accent}20`,
                    color: col.accent,
                    border: `1px solid ${col.accent}40`,
                  }}
                >
                  {colTasks.length}
                </span>
              )}
            </div>

            {/* Hairline */}
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg, ${col.accent}60, transparent 80%)`,
              }}
            />

            {/* Cards */}
            <div className="flex flex-col gap-2.5">
              {colTasks.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed py-8 text-center"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                    {col.emptyMsg}
                  </p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={
                      task.assigned_to ? (profileMap[task.assigned_to] ?? null) : null
                    }
                    isArquitecto={isArquitecto}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
