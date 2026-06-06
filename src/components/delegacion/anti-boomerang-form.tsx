"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/database";

interface AntiBoomerangFormProps {
  task: Task;
  currentUserId: string;
}

export function AntiBoomerangForm({ task, currentUserId }: AntiBoomerangFormProps) {
  const router = useRouter();
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [recommended, setRecommended] = useState<1 | 2 | 3 | null>(null);
  const [justification, setJustification] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canEscalate =
    option1.trim().length > 0 &&
    option2.trim().length > 0 &&
    option3.trim().length > 0 &&
    recommended !== null &&
    justification.trim().length > 0;

  const deadline = new Date(task.when_deadline);
  const isOverdue = deadline < new Date() && task.status !== "done";

  const handleEscalate = () => {
    if (!canEscalate) return;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const content = JSON.stringify({
        option1: option1.trim(),
        option2: option2.trim(),
        option3: option3.trim(),
        recommended,
        justification: justification.trim(),
      });

      const { error: updateErr } = await supabase.from("task_updates").insert({
        task_id: task.id,
        user_id: currentUserId,
        type: "boomerang_attempt",
        content,
      });
      if (updateErr) {
        setError(updateErr.message);
        return;
      }

      const { error: taskErr } = await supabase
        .from("tasks")
        .update({ status: "blocked" })
        .eq("id", task.id);
      if (taskErr) {
        setError(taskErr.message);
        return;
      }

      setDone(true);
      router.push("/delegacion/mis-tareas");
    });
  };

  if (done) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={48} style={{ color: "#34d399" }} />
          <h2 className="text-white" style={{ fontSize: 22, fontWeight: 700 }}>
            Escalado al líder
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            El Arquitecto verá tus 3 opciones y tomará una decisión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "32px 36px",
      }}
    >
      <div style={{ maxWidth: 620 }}>
        {/* Back link */}
        <Link
          href="/delegacion/mis-tareas"
          className="mb-6 inline-flex items-center gap-1.5 transition-colors hover:text-white"
          style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          Mis tareas
        </Link>

        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(248,113,113,0.05))",
              border: "1px solid rgba(248,113,113,0.25)",
              color: "#f87171",
            }}
          >
            <Shield size={18} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              className="text-white"
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}
            >
              Escudo Anti-Boomerang
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Antes de escalar, presentá tus 3 opciones al líder
            </p>
          </div>
        </div>

        {/* Contexto de la tarea */}
        <div
          className="mb-7 rounded-xl border p-4"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <p
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Tarea bloqueada
          </p>
          <p
            className="text-white"
            style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, marginBottom: 8 }}
          >
            {task.what_dod}
          </p>
          <div className="flex items-center gap-1.5">
            <Clock size={11} strokeWidth={2} style={{ color: isOverdue ? "#f87171" : "rgba(255,255,255,0.35)" }} />
            <span
              style={{
                fontSize: 11.5,
                color: isOverdue ? "#f87171" : "rgba(255,255,255,0.4)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {deadline.toLocaleString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Separador */}
        <div
          className="mb-7 rounded-xl border p-5"
          style={{
            borderColor: "rgba(248,113,113,0.15)",
            background: "rgba(248,113,113,0.04)",
          }}
        >
          <p
            className="mb-5 text-white"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            ¿Cuáles son tus 3 opciones de solución?
          </p>

          {/* Opciones */}
          {(
            [
              { label: "Opción 1", value: option1, onChange: setOption1 },
              { label: "Opción 2", value: option2, onChange: setOption2 },
              { label: "Opción 3", value: option3, onChange: setOption3 },
            ] as const
          ).map((item, idx) => (
            <div key={idx} className="mb-4">
              <label
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {item.label}
              </label>
              <textarea
                value={item.value}
                onChange={(e) => item.onChange(e.target.value)}
                placeholder={`Describí la opción ${idx + 1}…`}
                rows={2}
                className="w-full resize-none rounded-xl border bg-transparent text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/20"
                style={{
                  fontSize: 13.5,
                  padding: "10px 14px",
                  borderColor: "rgba(255,255,255,0.1)",
                  lineHeight: 1.5,
                }}
              />
            </div>
          ))}
        </div>

        {/* Recomendación */}
        <div className="mb-6">
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              marginBottom: 10,
            }}
          >
            ¿Cuál recomendás?
          </p>
          <div className="mb-4 flex gap-2.5">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRecommended(n)}
                className="rounded-xl border px-5 py-2.5 text-white transition-all"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  borderColor:
                    recommended === n
                      ? "rgba(248,113,113,0.6)"
                      : "rgba(255,255,255,0.1)",
                  background:
                    recommended === n
                      ? "rgba(248,113,113,0.15)"
                      : "rgba(255,255,255,0.04)",
                  color: recommended === n ? "#f87171" : "rgba(255,255,255,0.6)",
                }}
              >
                Opción {n}
              </button>
            ))}
          </div>

          <label
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              display: "block",
              marginBottom: 6,
            }}
          >
            ¿Por qué la recomendás?
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Justificá tu recomendación…"
            rows={3}
            className="w-full resize-none rounded-xl border bg-transparent text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/20"
            style={{
              fontSize: 13.5,
              padding: "10px 14px",
              borderColor: "rgba(255,255,255,0.1)",
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            className="mb-4 rounded-xl border px-4 py-3"
            style={{
              fontSize: 13,
              color: "#f87171",
              borderColor: "rgba(248,113,113,0.2)",
              background: "rgba(248,113,113,0.06)",
            }}
          >
            {error}
          </p>
        )}

        {/* Botón Escalar */}
        <button
          type="button"
          onClick={handleEscalate}
          disabled={!canEscalate || isPending}
          className="rounded-xl px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            fontSize: 14,
            fontWeight: 600,
            background: canEscalate
              ? "linear-gradient(135deg, #f87171, #dc2626)"
              : "rgba(255,255,255,0.08)",
            boxShadow: canEscalate ? "0 4px 16px rgba(248,113,113,0.3)" : "none",
          }}
        >
          {isPending ? "Escalando…" : "Escalar al líder"}
        </button>

        {!canEscalate && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
            Completá las 3 opciones, elegí una y justificá tu recomendación
          </p>
        )}
      </div>
    </div>
  );
}
