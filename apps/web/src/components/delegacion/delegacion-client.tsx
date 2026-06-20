"use client";

import Link from "next/link";
import { Plus, Send } from "lucide-react";
import type { Task, Profile } from "@/types/database";
import { KanbanBoard } from "./kanban-board";

interface DelegacionClientProps {
  tasks: Task[];
  team: Profile[];
  currentUserId: string;
  isArquitecto: boolean;
}

export function DelegacionClient({
  tasks,
  team,
  currentUserId,
  isArquitecto,
}: DelegacionClientProps) {
  const visibleTasks = isArquitecto
    ? tasks
    : tasks.filter((t) => t.assigned_to === currentUserId);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
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
      {visibleTasks.length === 0 ? (
        <EmptyState isArquitecto={isArquitecto} />
      ) : (
        <KanbanBoard
          initialTasks={visibleTasks}
          team={team}
          isArquitecto={isArquitecto}
          currentUserId={currentUserId}
        />
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
