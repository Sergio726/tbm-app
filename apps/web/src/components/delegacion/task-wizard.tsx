"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  HelpCircle,
  Settings,
  Calendar,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { LOS_LEVELS } from "@/lib/disc";
import { notify } from "@/lib/notifications";
import { DeadlinePicker } from "./deadline-picker";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TeamMember = {
  id: string;
  full_name: string | null;
  cargo: string | null;
  los_level: number | null;
  disc_letters: string | null;
};

interface TaskWizardProps {
  userId: string;
  companyId: string;
  team: TeamMember[];
}

type WizardData = {
  what_dod: string;
  why_context: string;
  how_constraints: string;
  when_deadline: string;
  check_loop: string;
  assigned_to: string;
  los_required: string;
};

// ── Definición de pasos ───────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    key: "what_dod" as keyof WizardData,
    icon: CheckSquare,
    iconColor: "#34d399",
    label: "QUÉ",
    title: "Definition of Done",
    description:
      "¿Qué tiene que estar hecho exactamente para que esta tarea esté completa? Sé específico — describí el entregable, no la actividad.",
    placeholder:
      'Ej: "El reporte de ventas de mayo subido en Google Drive con los datos de los 3 vendedores, en formato PDF, antes del viernes 6pm."',
    type: "textarea" as const,
  },
  {
    number: 2,
    key: "why_context" as keyof WizardData,
    icon: HelpCircle,
    iconColor: "#fbbf24",
    label: "POR QUÉ",
    title: "Contexto e impacto",
    description:
      "¿Por qué esta tarea importa? ¿Qué pasa si no se hace? Dale el contexto para que entienda la magnitud.",
    placeholder:
      'Ej: "El cliente necesita este dato para tomar la decisión de renovar contrato. Sin el reporte, perdemos la reunión del lunes."',
    type: "textarea" as const,
  },
  {
    number: 3,
    key: "how_constraints" as keyof WizardData,
    icon: Settings,
    iconColor: "#5b8aff",
    label: "CÓMO",
    title: "Restricciones y límites",
    description:
      "¿Con qué recursos? ¿Qué herramientas usar? ¿Qué NO tocar? ¿Cuál es el presupuesto máximo?",
    placeholder:
      'Ej: "Usá el template existente en Drive. No contactés al cliente directamente. Presupuesto: $0."',
    type: "textarea" as const,
  },
  {
    number: 4,
    key: "when_deadline" as keyof WizardData,
    icon: Calendar,
    iconColor: "#f87171",
    label: "CUÁNDO",
    title: "Fecha y hora límite",
    description:
      "La deadline exacta. No 'esta semana', no 'lo antes posible'. Día y hora.",
    placeholder: "",
    type: "datetime" as const,
  },
  {
    number: 5,
    key: "check_loop" as keyof WizardData,
    icon: RefreshCw,
    iconColor: "#a78bfa",
    label: "CHEQUEO",
    title: "Loop de revisión",
    description:
      "¿Cuándo y cómo se hace el check-in del avance? No esperés al día de la entrega.",
    placeholder:
      'Ej: "Martes a las 10am me mostrás el borrador. Si hay desvíos, lo corregimos ahí."',
    type: "textarea" as const,
  },
];

// ── Componente principal ──────────────────────────────────────────────────────

export function TaskWizard({ userId, companyId, team }: TaskWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    what_dod: "",
    why_context: "",
    how_constraints: "",
    when_deadline: "",
    check_loop: "",
    assigned_to: "",
    los_required: "",
  });

  const currentStep = STEPS[step - 1];
  const currentValue = data[currentStep.key];
  const canAdvance = currentValue.trim().length > 0;
  const isLastStep = step === STEPS.length;
  const allFilled = STEPS.every((s) => data[s.key].trim().length > 0);

  const patch = (key: keyof WizardData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!allFilled) return;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();

      const { error: insertError } = await supabase.from("tasks").insert({
        company_id: companyId,
        created_by: userId,
        assigned_to: data.assigned_to || null,
        what_dod: data.what_dod.trim(),
        why_context: data.why_context.trim(),
        how_constraints: data.how_constraints.trim(),
        when_deadline: data.when_deadline,
        check_loop: data.check_loop.trim(),
        los_required: data.los_required ? parseInt(data.los_required) : null,
        status: "pending",
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      capture("task_delegated", {
        has_assignee: !!data.assigned_to,
        los_required: data.los_required ? parseInt(data.los_required) : null,
      });

      // Notificar al colaborador asignado (no bloqueante)
      if (data.assigned_to) {
        await notify(supabase, {
          companyId,
          userId: data.assigned_to,
          actorId: userId,
          type: "task_assigned",
          title: "Te asignaron una tarea",
          body: `"${data.what_dod.trim().slice(0, 60)}" — revisá los 5 puntos.`,
          href: "/delegacion/mis-tareas",
        });
      }

      router.push("/delegacion");
    });
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Barra de progreso */}
      <ProgressBar current={step} total={STEPS.length} steps={STEPS} completedData={data} />

      {/* Card del paso actual */}
      <StepCard
        step={currentStep}
        value={currentValue}
        onChange={(v) => patch(currentStep.key, v)}
      />

      {/* Selector de asignado + nivel de delegación (solo en paso 5) */}
      {step === 5 && (
        <AssigneeSelector
          team={team}
          assignedTo={data.assigned_to}
          losRequired={data.los_required}
          onAssign={(id) => patch("assigned_to", id)}
          onLos={(l) => patch("los_required", l)}
        />
      )}

      {/* Error */}
      {error && (
        <div
          className="mb-4 rounded-xl border px-4 py-3"
          style={{
            borderColor: "rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.08)",
            fontSize: 13,
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-opacity disabled:opacity-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13.5,
            cursor: step === 1 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={!allFilled || isPending}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-white transition-opacity"
            style={{
              background:
                allFilled && !isPending
                  ? "linear-gradient(135deg, #34d399, #059669)"
                  : "rgba(255,255,255,0.06)",
              border: "none",
              fontSize: 13.5,
              fontWeight: 600,
              color:
                allFilled && !isPending
                  ? "#fff"
                  : "rgba(255,255,255,0.3)",
              cursor:
                allFilled && !isPending ? "pointer" : "not-allowed",
              boxShadow:
                allFilled && !isPending
                  ? "0 4px 16px rgba(52,211,153,0.3)"
                  : "none",
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            {isPending ? "Guardando…" : "Crear tarea"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!canAdvance) return;
              setStep((s) => Math.min(STEPS.length, s + 1));
            }}
            disabled={!canAdvance}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-white transition-opacity"
            style={{
              background: canAdvance
                ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
                : "rgba(255,255,255,0.06)",
              border: "none",
              fontSize: 13.5,
              fontWeight: 600,
              color: canAdvance ? "#fff" : "rgba(255,255,255,0.3)",
              cursor: canAdvance ? "pointer" : "not-allowed",
              boxShadow: canAdvance
                ? "0 4px 16px rgba(91,138,255,0.35)"
                : "none",
            }}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Hint cuando el campo está vacío y se intenta avanzar */}
      {!canAdvance && (
        <p
          className="mt-3 text-center"
          style={{ fontSize: 12, color: "rgba(248,113,113,0.8)" }}
        >
          Este punto es obligatorio.
        </p>
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  steps,
  completedData,
}: {
  current: number;
  total: number;
  steps: typeof STEPS;
  completedData: WizardData;
}) {
  return (
    <div className="mb-8">
      {/* Dots */}
      <div className="mb-4 flex items-center gap-2">
        {steps.map((s, i) => {
          const isDone = completedData[s.key].trim().length > 0;
          const isCurrent = current === s.number;

          return (
            <div key={s.number} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
                style={{
                  background: isDone
                    ? "rgba(52,211,153,0.2)"
                    : isCurrent
                      ? "rgba(91,138,255,0.2)"
                      : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${
                    isDone
                      ? "rgba(52,211,153,0.5)"
                      : isCurrent
                        ? "rgba(91,138,255,0.5)"
                        : "rgba(255,255,255,0.1)"
                  }`,
                  color: isDone
                    ? "#34d399"
                    : isCurrent
                      ? "#5b8aff"
                      : "rgba(255,255,255,0.3)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {isDone ? <Check size={13} strokeWidth={2.5} /> : s.number}
              </div>
              {i < total - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: isDone
                      ? "rgba(52,211,153,0.4)"
                      : "rgba(255,255,255,0.08)",
                    minWidth: 32,
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Label del paso actual */}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
        Paso {current} de {total} —{" "}
        <span style={{ color: "rgba(255,255,255,0.65)" }}>
          {steps[current - 1].label}: {steps[current - 1].title}
        </span>
      </p>
    </div>
  );
}

function StepCard({
  step,
  value,
  onChange,
}: {
  step: (typeof STEPS)[0];
  value: string;
  onChange: (v: string) => void;
}) {
  const Icon = step.icon;

  const isDatetime = step.type === "datetime";

  return (
    <div
      className={`relative mb-6 rounded-2xl border ${isDatetime ? "overflow-visible" : "overflow-hidden"}`}
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))",
        padding: "28px 28px 24px",
      }}
    >
      {/* Hairline de acento */}
      <div
        className="pointer-events-none absolute left-4 right-4 top-0 h-0.5 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${step.iconColor}88, transparent 60%)`,
        }}
      />

      {/* Header del paso */}
      <div className="mb-5 flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${step.iconColor}18`,
            border: `1px solid ${step.iconColor}38`,
            color: step.iconColor,
          }}
        >
          <Icon size={18} strokeWidth={1.6} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: step.iconColor,
                textTransform: "uppercase",
              }}
            >
              {step.label}
            </span>
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: -0.2,
              marginTop: 2,
            }}
          >
            {step.title}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.55,
              marginTop: 6,
              maxWidth: 580,
            }}
          >
            {step.description}
          </p>
        </div>
      </div>

      {/* Campo */}
      {step.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder}
          rows={4}
          autoFocus
          className="w-full resize-y rounded-xl border bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/25 focus:border-[#5b8aff]/50 focus:ring-2 focus:ring-[#5b8aff]/15"
          style={{ borderColor: "rgba(255,255,255,0.09)" }}
        />
      ) : (
        <DeadlinePicker value={value} onChange={onChange} />
      )}
    </div>
  );
}

function AssigneeSelector({
  team,
  assignedTo,
  losRequired,
  onAssign,
  onLos,
}: {
  team: TeamMember[];
  assignedTo: string;
  losRequired: string;
  onAssign: (id: string) => void;
  onLos: (l: string) => void;
}) {
  return (
    <div
      className="mb-6 rounded-2xl border p-6"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.8)",
          marginBottom: 16,
        }}
      >
        Asignación (opcional)
      </h3>

      {/* Selector de colaborador */}
      <div className="mb-4">
        <label
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 0.2,
            display: "block",
            marginBottom: 8,
          }}
        >
          Asignar a
        </label>

        {team.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.62)" }}>
            No hay colaboradores en tu equipo aún.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAssign("")}
              className="rounded-xl border px-3.5 py-2 transition-all"
              style={{
                fontSize: 13,
                border: `1px solid ${!assignedTo ? "rgba(91,138,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                background: !assignedTo
                  ? "rgba(91,138,255,0.15)"
                  : "rgba(255,255,255,0.03)",
                color: !assignedTo ? "#9fb9ff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              Sin asignar
            </button>
            {team.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onAssign(m.id)}
                className="rounded-xl border px-3.5 py-2 transition-all"
                style={{
                  fontSize: 13,
                  border: `1px solid ${assignedTo === m.id ? "rgba(91,138,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background:
                    assignedTo === m.id
                      ? "rgba(91,138,255,0.15)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    assignedTo === m.id
                      ? "#9fb9ff"
                      : "rgba(255,255,255,0.65)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {m.full_name ?? "Colaborador"}
                </span>
                {m.cargo && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.62)",
                      marginLeft: 6,
                    }}
                  >
                    · {m.cargo}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nivel de Delegación requerido */}
      <div>
        <div className="mb-3">
          <label
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: 0.2,
              display: "block",
              marginBottom: 4,
            }}
          >
            Nivel de delegación mínimo requerido
          </label>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
            Elegí la autonomía mínima que necesita la persona para completar esta tarea.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {LOS_LEVELS.map((level) => {
            const active = losRequired === String(level.level);

            return (
              <button
                key={level.level}
                type="button"
                onClick={() =>
                  onLos(active ? "" : String(level.level))
                }
                className="rounded-xl border p-3 text-left transition-all"
                style={{
                  border: `1px solid ${active ? "rgba(167,139,250,0.65)" : "rgba(255,255,255,0.08)"}`,
                  background: active
                    ? "linear-gradient(180deg, rgba(167,139,250,0.18), rgba(167,139,250,0.08))"
                    : "rgba(255,255,255,0.025)",
                  color: active ? "#ddd6fe" : "rgba(255,255,255,0.62)",
                  cursor: "pointer",
                  boxShadow: active ? "0 8px 22px rgba(167,139,250,0.16)" : "none",
                  minHeight: 116,
                }}
              >
                <span
                  className="mb-2 inline-flex rounded-md px-2 py-0.5"
                  style={{
                    background: active
                      ? "rgba(167,139,250,0.22)"
                      : "rgba(255,255,255,0.04)",
                    color: active ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  N{level.level}
                </span>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: active ? "#fff" : "rgba(255,255,255,0.72)",
                    marginBottom: 6,
                  }}
                >
                  {level.name}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.35,
                    color: active ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.38)",
                  }}
                >
                  {level.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
