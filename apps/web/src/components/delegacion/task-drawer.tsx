"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  X,
  User,
  Clock,
  Play,
  Check,
  ShieldAlert,
  AlertTriangle,
  CheckSquare,
  HelpCircle,
  Settings,
  Calendar,
  RefreshCw,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { LOS_LEVELS } from "@/lib/disc";
import type { Task, Profile, TaskStatus } from "@/types/database";

const PUNTOS: {
  key: keyof Task;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { key: "what_dod", label: "QUÉ · Definition of Done", icon: CheckSquare, color: "var(--success-text)" },
  { key: "why_context", label: "POR QUÉ · Contexto", icon: HelpCircle, color: "var(--warn-text)" },
  { key: "how_constraints", label: "CÓMO · Restricciones", icon: Settings, color: "var(--accent-text)" },
  { key: "when_deadline", label: "CUÁNDO · Deadline", icon: Calendar, color: "var(--danger-text)" },
  { key: "check_loop", label: "CHEQUEO · Loop de revisión", icon: RefreshCw, color: "#a78bfa" },
];

const STATUS_ACTIONS: {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
  color: string;
  grad: string;
}[] = [
  {
    value: "in_progress",
    label: "En curso",
    icon: Play,
    color: "var(--accent-text)",
    grad: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
  },
  {
    value: "done",
    label: "Listo",
    icon: Check,
    color: "var(--success-text)",
    grad: "linear-gradient(135deg, #34d399, #059669)",
  },
  {
    value: "blocked",
    label: "Bloqueado",
    icon: ShieldAlert,
    color: "var(--danger-text)",
    grad: "linear-gradient(135deg, #f87171, #dc2626)",
  },
];

type BoomerangContent = {
  option1: string;
  option2: string;
  option3: string;
  recommended: 1 | 2 | 3 | null;
  justification: string;
};

function getDiscColor(discLetters: string | null): string {
  if (!discLetters) return "#5b8aff";
  const map: Record<string, string> = {
    D: "#f87171",
    I: "#fbbf24",
    S: "#34d399",
    C: "#5b8aff",
  };
  return map[discLetters[0]?.toUpperCase()] ?? "#5b8aff";
}

interface TaskDrawerProps {
  task: Task;
  assignee: Profile | null;
  team: Profile[];
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAssigneeChange: (taskId: string, newAssigneeId: string | null) => void;
}

export function TaskDrawer({
  task,
  assignee,
  team,
  onClose,
  onStatusChange,
  onAssigneeChange,
}: TaskDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [boomerang, setBoomerang] = useState<BoomerangContent | null>(null);
  const [loadingBoomerang, setLoadingBoomerang] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);

  const deadline = new Date(task.when_deadline);
  const now = new Date();
  const isOverdue = deadline < now && task.status !== "done";
  const isSoon =
    !isOverdue &&
    deadline < new Date(now.getTime() + 24 * 60 * 60 * 1000) &&
    task.status !== "done";

  const losName = task.los_required
    ? LOS_LEVELS.find((l) => l.level === task.los_required)?.name
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (task.status !== "blocked") {
      setBoomerang(null);
      return;
    }
    setLoadingBoomerang(true);
    const supabase = createClient();
    supabase
      .from("task_updates")
      .select("content, created_at")
      .eq("task_id", task.id)
      .eq("type", "boomerang_attempt")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) {
          try {
            setBoomerang(JSON.parse(data.content) as BoomerangContent);
          } catch {
            setBoomerang(null);
          }
        }
        setLoadingBoomerang(false);
      });
  }, [task.id, task.status]);

  const handleStatusChange = (newStatus: TaskStatus) => {
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

  const handleAssign = (newAssigneeId: string | null) => {
    setAssigneeMenuOpen(false);
    if ((task.assigned_to ?? null) === newAssigneeId) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ assigned_to: newAssigneeId })
        .eq("id", task.id);
      if (!error) onAssigneeChange(task.id, newAssigneeId);
    });
  };

  const initials = assignee ? getInitials(assignee.full_name) : null;
  const discColor = getDiscColor(assignee?.disc_letters ?? null);

  return (
    <div className="fixed inset-0 z-50" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div
        className="tbm-drawer-in absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col"
        style={{
          background: "linear-gradient(180deg, #121826, var(--bg))",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="min-w-0 flex-1">
            <p
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: "var(--fg-muted)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Detalle de tarea
            </p>
            <h2
              className="text-fg"
              style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}
            >
              {task.what_dod || "Sin descripción"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-elevated"
            style={{ color: "var(--fg-subtle)", cursor: "pointer" }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Banner de urgencia */}
          {(isOverdue || isSoon) && (
            <div
              className="mb-5 flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{
                background: isOverdue
                  ? "rgba(248,113,113,0.1)"
                  : "rgba(251,191,36,0.1)",
                border: `1px solid ${isOverdue ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`,
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: isOverdue ? "#f87171" : "#fbbf24" }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: isOverdue ? "#fca5a5" : "#fcd34d",
                }}
              >
                {isOverdue ? "Tarea vencida" : "Vence en menos de 24h"}
              </span>
            </div>
          )}

          {/* Assignee + LOS */}
          <div className="relative mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAssigneeMenuOpen((o) => !o)}
                disabled={isPending}
                className="flex flex-1 items-center gap-3 rounded-xl border p-3.5 text-left transition-colors hover:border-border"
                style={{
                  borderColor: assigneeMenuOpen
                    ? "rgba(91,138,255,0.5)"
                    : "rgba(255,255,255,0.07)",
                  background: "var(--elevated)",
                  cursor: isPending ? "default" : "pointer",
                }}
              >
                {assignee ? (
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-fg"
                    style={{
                      background: `linear-gradient(135deg, ${discColor}, ${discColor}88)`,
                      fontSize: 13,
                      fontWeight: 700,
                      boxShadow: `0 2px 8px ${discColor}44`,
                    }}
                  >
                    {initials}
                  </div>
                ) : (
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "var(--elevated)",
                      border: "1px dashed var(--border-strong)",
                    }}
                  >
                    <User size={16} style={{ color: "var(--fg-muted)" }} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-fg"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {assignee?.full_name ?? "Sin asignar"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                    {assignee?.cargo ?? "Tocá para asignar"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    color: "var(--fg-muted)",
                    flexShrink: 0,
                    transform: assigneeMenuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {task.los_required && (
                <span
                  className="flex-shrink-0 rounded-lg px-2.5 py-1"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#c4b5fd",
                    background: "rgba(167,139,250,0.14)",
                    border: "1px solid rgba(167,139,250,0.28)",
                  }}
                  title={losName ?? undefined}
                >
                  N{task.los_required}
                  {losName ? ` · ${losName}` : ""}
                </span>
              )}
            </div>

            {/* Popover de asignación */}
            {assigneeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setAssigneeMenuOpen(false)}
                />
                <div
                  className="absolute left-0 right-0 z-20 mt-1.5 max-h-72 overflow-y-auto rounded-xl border p-1.5"
                  style={{
                    background: "#161d2e",
                    borderColor: "var(--border)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* Sin asignar */}
                  <AssigneeOption
                    selected={!task.assigned_to}
                    onClick={() => handleAssign(null)}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "var(--elevated)",
                        border: "1px dashed var(--border-strong)",
                      }}
                    >
                      <User size={13} style={{ color: "var(--fg-muted)" }} />
                    </div>
                    <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                      Sin asignar
                    </span>
                  </AssigneeOption>

                  {team.map((member) => {
                    const mColor = getDiscColor(member.disc_letters ?? null);
                    const selected = task.assigned_to === member.id;
                    return (
                      <AssigneeOption
                        key={member.id}
                        selected={selected}
                        onClick={() => handleAssign(member.id)}
                      >
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-fg"
                          style={{
                            background: `linear-gradient(135deg, ${mColor}, ${mColor}88)`,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(member.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-fg"
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {member.full_name ?? "Colaborador"}
                          </p>
                          {member.cargo && (
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--fg-muted)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {member.cargo}
                            </p>
                          )}
                        </div>
                      </AssigneeOption>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 5 puntos */}
          <div className="flex flex-col gap-4">
            {PUNTOS.map((p) => {
              let value = (task[p.key] as string) ?? "";
              if (p.key === "when_deadline" && value) {
                value = new Date(value).toLocaleString("es-AR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
              const Icon = p.icon;
              return (
                <div key={String(p.key)}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Icon size={13} style={{ color: p.color }} />
                    <p
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: "var(--fg-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.label}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--fg)",
                      lineHeight: 1.55,
                      paddingLeft: 21,
                    }}
                  >
                    {value || "—"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Anti-Boomerang (si bloqueada) */}
          {task.status === "blocked" && (
            <div
              className="mt-6 rounded-xl border p-4"
              style={{
                borderColor: "rgba(248,113,113,0.2)",
                background: "rgba(248,113,113,0.05)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert size={15} style={{ color: "var(--danger-text)" }} />
                <p
                  className="text-fg"
                  style={{ fontSize: 13.5, fontWeight: 600 }}
                >
                  Escalado Anti-Boomerang
                </p>
              </div>

              {loadingBoomerang ? (
                <p style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
                  Cargando opciones…
                </p>
              ) : boomerang ? (
                <div className="flex flex-col gap-2.5">
                  {[boomerang.option1, boomerang.option2, boomerang.option3].map(
                    (opt, i) => {
                      const isRecommended = boomerang.recommended === i + 1;
                      return (
                        <div
                          key={i}
                          className="rounded-lg border p-3"
                          style={{
                            borderColor: isRecommended
                              ? "rgba(52,211,153,0.4)"
                              : "rgba(255,255,255,0.08)",
                            background: isRecommended
                              ? "rgba(52,211,153,0.08)"
                              : "rgba(255,255,255,0.025)",
                          }}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: isRecommended
                                  ? "#34d399"
                                  : "rgba(255,255,255,0.45)",
                              }}
                            >
                              Opción {i + 1}
                            </span>
                            {isRecommended && (
                              <span
                                className="rounded px-1.5 py-0.5"
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: "var(--success-text)",
                                  background: "rgba(52,211,153,0.15)",
                                }}
                              >
                                RECOMENDADA
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 12.5,
                              color: "var(--fg-muted)",
                              lineHeight: 1.5,
                            }}
                          >
                            {opt}
                          </p>
                        </div>
                      );
                    }
                  )}
                  {boomerang.justification && (
                    <div className="mt-1">
                      <p
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          color: "var(--fg-muted)",
                          textTransform: "uppercase",
                          marginBottom: 3,
                        }}
                      >
                        Justificación
                      </p>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: "var(--fg-muted)",
                          lineHeight: 1.5,
                          fontStyle: "italic",
                        }}
                      >
                        {boomerang.justification}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
                  El colaborador marcó esta tarea como bloqueada sin registrar opciones.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer: cambio de estado */}
        <div
          className="px-6 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <Clock size={13} style={{ color: "var(--fg-muted)" }} />
            <span style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>
              Cambiar estado
            </span>
          </div>
          <div className="flex gap-2">
            {STATUS_ACTIONS.map((action) => {
              const active = task.status === action.value;
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => handleStatusChange(action.value)}
                  disabled={active || isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 transition-all disabled:cursor-default"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: active ? "#fff" : action.color,
                    background: active ? action.grad : `${action.color}14`,
                    border: `1px solid ${active ? "transparent" : `${action.color}33`}`,
                    boxShadow: active ? `0 4px 14px ${action.color}40` : "none",
                    cursor: active || isPending ? "default" : "pointer",
                  }}
                >
                  <Icon size={14} strokeWidth={2} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssigneeOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
      style={{
        background: selected ? "rgba(91,138,255,0.12)" : "transparent",
        cursor: "pointer",
      }}
    >
      {children}
      {selected && (
        <Check
          size={15}
          strokeWidth={2.5}
          style={{ color: "var(--accent-text)", flexShrink: 0, marginLeft: "auto" }}
        />
      )}
    </button>
  );
}
