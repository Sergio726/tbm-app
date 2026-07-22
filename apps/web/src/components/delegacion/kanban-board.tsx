"use client";

import { useMemo, useState } from "react";
import { TaskCard } from "./task-card";
import { TaskDrawer } from "./task-drawer";
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

type FilterKey = "all" | "urgent" | "blocked" | "unassigned";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "urgent", label: "Urgentes" },
  { key: "blocked", label: "Bloqueadas" },
  { key: "unassigned", label: "Sin asignar" },
];

interface KanbanBoardProps {
  initialTasks: Task[];
  team: Profile[];
  isArquitecto: boolean;
  currentUserId: string;
}

export function KanbanBoard({ initialTasks, team }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null);

  const profileMap = useMemo(
    () => Object.fromEntries(team.map((p) => [p.id, p])),
    [team]
  );

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleAssigneeChange = (taskId: string, newAssigneeId: string | null) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigned_to: newAssigneeId } : t))
    );
  };

  const filteredTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((t) => {
      if (filter === "urgent") {
        return (
          t.status !== "done" && new Date(t.when_deadline).getTime() < now + 24 * 60 * 60 * 1000
        );
      }
      if (filter === "blocked") return t.status === "blocked";
      if (filter === "unassigned") return !t.assigned_to;
      return true;
    });
  }, [tasks, filter]);

  const filterCount = (key: FilterKey) => {
    const now = Date.now();
    if (key === "all") return tasks.length;
    if (key === "urgent")
      return tasks.filter(
        (t) =>
          t.status !== "done" &&
          new Date(t.when_deadline).getTime() < now + 24 * 60 * 60 * 1000
      ).length;
    if (key === "blocked") return tasks.filter((t) => t.status === "blocked").length;
    return tasks.filter((t) => !t.assigned_to).length;
  };

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const drawerTask = drawerTaskId
    ? tasks.find((t) => t.id === drawerTaskId) ?? null
    : null;

  return (
    <>
      {/* Filtros rápidos */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = filterCount(f.key);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all"
              style={{
                fontSize: 12.5,
                fontWeight: active ? 600 : 500,
                borderColor: active
                  ? "rgba(91,138,255,0.5)"
                  : "rgba(255,255,255,0.08)",
                background: active
                  ? "rgba(91,138,255,0.15)"
                  : "rgba(255,255,255,0.025)",
                color: active ? "#9fb9ff" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
              }}
            >
              {f.label}
              <span
                className="rounded px-1"
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: active ? "#9fb9ff" : "rgba(255,255,255,0.4)",
                  background: active
                    ? "rgba(91,138,255,0.2)"
                    : "rgba(255,255,255,0.06)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tablero — responsive: 1 columna en mobile, 2 en tablet, 4 en desktop
          (antes eran 4 columnas fijas que se comprimían ilegibles en celular). */}
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p style={{ fontSize: 12, color: "var(--fg-subtle)" }}>
                      {col.emptyMsg}
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={
                        task.assigned_to
                          ? (profileMap[task.assigned_to] ?? null)
                          : null
                      }
                      onOpen={(t) => setDrawerTaskId(t.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer de detalle */}
      {drawerTask && (
        <TaskDrawer
          task={drawerTask}
          assignee={
            drawerTask.assigned_to
              ? (profileMap[drawerTask.assigned_to] ?? null)
              : null
          }
          team={team}
          onClose={() => setDrawerTaskId(null)}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
        />
      )}
    </>
  );
}
