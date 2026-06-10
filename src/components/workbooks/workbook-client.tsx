"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen, Zap } from "lucide-react";
import type { Json, Profile, WorkbookResponse, WorkbookProgress } from "@/types/database";
import { SCORECARD_AREAS } from "@/types/database";
import type { SessionDef } from "@/lib/workbook-sessions";
import { canRequestEarlyUnlock } from "@/lib/workbook-sessions";
import { createBrowserClient } from "@/lib/supabase/client";
import { isoDate } from "@/lib/dates";
import { normalizeLetters } from "@/lib/disc";
import { ExerciseDiagnostic } from "./exercises/exercise-diagnostic";
import { ExerciseChecklist } from "./exercises/exercise-checklist";
import { ExerciseText } from "./exercises/exercise-text";
import { ExerciseTextGroup } from "./exercises/exercise-text-group";
import { ExerciseDiscMap } from "./exercises/exercise-disc-map";
import { ExerciseShadows } from "./exercises/exercise-shadows";
import { ExerciseSliderGroup } from "./exercises/exercise-slider-group";
import { ExerciseCounterTracker } from "./exercises/exercise-counter-tracker";

type TeamMember = Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters" | "disc_state" | "disc_temor">;

interface WorkbookClientProps {
  session: SessionDef;
  responses: WorkbookResponse[];
  allProgress: WorkbookProgress[];
  team: TeamMember[];
  currentProfile: Profile;
}

export function WorkbookClient({
  session,
  responses,
  allProgress: initialAllProgress,
  team,
  currentProfile,
}: WorkbookClientProps) {
  const companyId = currentProfile.company_id!;
  const userId = currentProfile.id;

  const [localResponses, setLocalResponses] = useState<Record<string, Record<string, unknown>>>(() =>
    Object.fromEntries(
      responses.map((r) => [r.exercise_key, r.response as Record<string, unknown>])
    )
  );
  const [allProgress, setAllProgress] = useState<WorkbookProgress[]>(initialAllProgress);
  const [openKey, setOpenKey] = useState<string | null>(session.exercises[0]?.key ?? null);
  const [commitment, setCommitment] = useState<string>(() => {
    const prog = initialAllProgress.find((p) => p.session_number === session.number);
    return prog?.weekly_commitment ?? "";
  });

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(successTimerRef.current);
      clearTimeout(errorTimerRef.current);
    },
    []
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg(null);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 4000);
  };

  const completedCount = session.exercises.filter((e) => e.key in localResponses).length;
  const totalExercises = session.exercises.length;
  const pctComplete = Math.round((completedCount / totalExercises) * 100);

  const currentProgress = allProgress.find((p) => p.session_number === session.number);
  const dayInSession = currentProgress?.unlocked_at
    ? Math.min(7, Math.floor((Date.now() - new Date(currentProgress.unlocked_at).getTime()) / 86_400_000) + 1)
    : 1;

  const updateAllProgress = (newPct: number) => {
    setAllProgress((prev) => {
      const existing = prev.find((p) => p.session_number === session.number);
      if (existing) {
        return prev.map((p) =>
          p.session_number === session.number ? { ...p, pct_complete: newPct } : p
        );
      }
      return [
        ...prev,
        {
          id: "",
          company_id: companyId,
          user_id: userId,
          session_number: session.number,
          pct_complete: newPct,
          weekly_commitment: null,
          commitment_done: false,
          unlocked_at: new Date().toISOString(),
        },
      ];
    });
  };

  // Side effect: scorecards
  const runScorecardsIntegration = async (
    supabase: ReturnType<typeof createBrowserClient>,
    data: Record<string, unknown>
  ) => {
    const scores = data as Record<string, number>;
    const total = SCORECARD_AREAS.reduce((sum, a) => sum + (scores[a.key] ?? 0), 0);
    await supabase.from("scorecards").insert({
      company_id: companyId,
      user_id: userId,
      is_baseline: false,
      completed_at: new Date().toISOString(),
      total_score: total,
      ...Object.fromEntries(SCORECARD_AREAS.map((a) => [a.key, scores[a.key] ?? null])),
    });
  };

  // Side effect: profiles disc
  const runProfilesDiscIntegration = async (
    supabase: ReturnType<typeof createBrowserClient>,
    data: Record<string, unknown>
  ) => {
    const members = (data.members as { userId: string; disc_letters: string; disc_state: string }[]) ?? [];
    await Promise.all(
      members.map((m) =>
        supabase
          .from("profiles")
          .update({
            disc_letters: normalizeLetters(m.disc_letters) || null,
            disc_state: m.disc_state,
          })
          .eq("id", m.userId)
      )
    );
  };

  // Side effect: profiles state + temor
  const runProfilesStateIntegration = async (
    supabase: ReturnType<typeof createBrowserClient>,
    data: Record<string, unknown>
  ) => {
    const members = (data.members as { userId: string; disc_state: string; disc_temor: string }[]) ?? [];
    await Promise.all(
      members.map((m) =>
        supabase
          .from("profiles")
          .update({ disc_state: m.disc_state, disc_temor: m.disc_temor || null })
          .eq("id", m.userId)
      )
    );
  };

  // Side effect: pre_games twenty_mile_march
  const runPreGamesIntegration = async (
    supabase: ReturnType<typeof createBrowserClient>,
    data: Record<string, unknown>
  ) => {
    const text = typeof data.text === "string" ? data.text : "";
    const today = isoDate();
    const { data: existing } = await supabase
      .from("pre_games")
      .select("id")
      .eq("user_id", userId)
      .eq("log_date", today)
      .single();
    if (existing) {
      await supabase.from("pre_games").update({ twenty_mile_march: text }).eq("id", existing.id);
    } else {
      await supabase
        .from("pre_games")
        .insert({ company_id: companyId, user_id: userId, log_date: today, twenty_mile_march: text });
    }
  };

  const handleSaveExercise = (key: string, data: Record<string, unknown>) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();

        // 1. Upsert response
        const { error } = await supabase.from("workbook_responses").upsert(
          {
            company_id: companyId,
            user_id: userId,
            session_number: session.number,
            exercise_key: key,
            response: data as unknown as Json,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,session_number,exercise_key" }
        );
        if (error) {
          showError("Error al guardar el ejercicio.");
          return;
        }

        // 2. Side effects (best effort — no bloquea el progreso si falla)
        try {
          const exercise = session.exercises.find((e) => e.key === key);
          if (exercise?.integration === "scorecards") {
            await runScorecardsIntegration(supabase, data);
          } else if (exercise?.integration === "profiles_disc") {
            await runProfilesDiscIntegration(supabase, data);
          } else if (exercise?.integration === "profiles_state") {
            await runProfilesStateIntegration(supabase, data);
          } else if (exercise?.integration === "pre_games") {
            await runPreGamesIntegration(supabase, data);
          }
        } catch {
          // integration error no bloquea el workbook
        }

        // 3. Actualizar respuestas locales
        const newResponses = { ...localResponses, [key]: data };
        setLocalResponses(newResponses);

        // 4. Recalcular progreso
        const newCompleted = session.exercises.filter((e) => e.key in newResponses).length;
        const newPct = Math.round((newCompleted / totalExercises) * 100);

        // 5. Upsert workbook_progress
        await supabase.from("workbook_progress").upsert(
          {
            company_id: companyId,
            user_id: userId,
            session_number: session.number,
            pct_complete: newPct,
          },
          { onConflict: "user_id,session_number" }
        );
        updateAllProgress(newPct);

        showSuccess("Guardado correctamente");

        // Auto-abrir siguiente ejercicio
        const currentIdx = session.exercises.findIndex((e) => e.key === key);
        const nextExercise = session.exercises[currentIdx + 1];
        if (nextExercise && !(nextExercise.key in newResponses)) {
          setOpenKey(nextExercise.key);
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleSaveCommitment = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        await supabase.from("workbook_progress").upsert(
          {
            company_id: companyId,
            user_id: userId,
            session_number: session.number,
            weekly_commitment: commitment,
          },
          { onConflict: "user_id,session_number" }
        );
        setAllProgress((prev) =>
          prev.map((p) =>
            p.session_number === session.number ? { ...p, weekly_commitment: commitment } : p
          )
        );
        showSuccess("Compromiso guardado");
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleEarlyUnlock = () => {
    if (isSubmittingRef.current) return;
    const nextNum = session.number + 1;
    if (nextNum > 4) return;
    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const now = new Date().toISOString();
        await supabase.from("workbook_progress").upsert(
          {
            company_id: companyId,
            user_id: userId,
            session_number: nextNum,
            pct_complete: 0,
            unlocked_at: now,
          },
          { onConflict: "user_id,session_number" }
        );
        setAllProgress((prev) => {
          const exists = prev.some((p) => p.session_number === nextNum);
          if (exists) return prev.map((p) => (p.session_number === nextNum ? { ...p, unlocked_at: now } : p));
          return [
            ...prev,
            {
              id: "",
              company_id: companyId,
              user_id: userId,
              session_number: nextNum,
              pct_complete: 0,
              weekly_commitment: null,
              commitment_done: false,
              unlocked_at: now,
            },
          ];
        });
        showSuccess(`Sesión ${nextNum} desbloqueada`);
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const earlyUnlockAvailable = canRequestEarlyUnlock(session.number, allProgress);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "32px 36px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "#9fb9ff",
            }}
          >
            <BookOpen size={18} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
              Sesión {session.number}
            </p>
            <h1 className="text-white" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>
              {session.title}
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginLeft: 52 }}>
          {session.subtitle}
        </p>
      </div>

      {/* Progress bar global */}
      <div
        className="mb-6 rounded-2xl border p-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-white">
            {completedCount}/{totalExercises} ejercicios
          </span>
          <div className="flex items-center gap-3">
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              Día {dayInSession}/7 de esta sesión
            </span>
            <span
              className="font-bold"
              style={{ color: pctComplete === 100 ? "#34d399" : "#9fb9ff" }}
            >
              {pctComplete}%
            </span>
          </div>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pctComplete}%`,
              background:
                pctComplete === 100
                  ? "#34d399"
                  : "linear-gradient(90deg, #5b8aff, #9fb9ff)",
            }}
          />
        </div>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(52,211,153,0.1)",
            borderColor: "rgba(52,211,153,0.3)",
            color: "#34d399",
          }}
        >
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(248,113,113,0.1)",
            borderColor: "rgba(248,113,113,0.3)",
            color: "#f87171",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Ejercicios accordion */}
      <div className="mb-6 space-y-3">
        {session.exercises.map((exercise, idx) => {
          const isCompleted = exercise.key in localResponses;
          const isOpen = openKey === exercise.key;
          const savedResp = localResponses[exercise.key] ?? {};

          return (
            <div
              key={exercise.key}
              className="overflow-hidden rounded-2xl border transition-all"
              style={{
                borderColor: isCompleted
                  ? "rgba(52,211,153,0.25)"
                  : isOpen
                  ? "rgba(91,138,255,0.3)"
                  : "rgba(255,255,255,0.07)",
                background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
              }}
            >
              {/* Accordion header */}
              <button
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                onClick={() => setOpenKey(isOpen ? null : exercise.key)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle size={18} color="#34d399" />
                    ) : (
                      <Circle
                        size={18}
                        color={isOpen ? "#9fb9ff" : "rgba(255,255,255,0.25)"}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isCompleted ? "#34d399" : "rgba(255,255,255,0.85)" }}
                    >
                      {idx + 1}. {exercise.title}
                    </p>
                    {!isOpen && (
                      <p
                        className="truncate text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronUp size={16} color="rgba(255,255,255,0.4)" />
                  ) : (
                    <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
                  )}
                </div>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p
                    className="mb-4 text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {exercise.description}
                  </p>

                  {exercise.type === "diagnostic" && (
                    <ExerciseDiagnostic
                      exerciseKey={exercise.key}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "checklist" && (
                    <ExerciseChecklist
                      exerciseKey={exercise.key}
                      items={exercise.data?.items ?? []}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "text" && (
                    <ExerciseText
                      exerciseKey={exercise.key}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                      integration={exercise.integration === "pre_games" ? "pre_games" : undefined}
                    />
                  )}
                  {exercise.type === "text_group" && (
                    <ExerciseTextGroup
                      exerciseKey={exercise.key}
                      questions={exercise.data?.questions ?? []}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "disc_map" && (
                    <ExerciseDiscMap
                      exerciseKey={exercise.key}
                      team={team}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "shadows" && (
                    <ExerciseShadows
                      exerciseKey={exercise.key}
                      team={team}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "slider_group" && (
                    <ExerciseSliderGroup
                      exerciseKey={exercise.key}
                      sliders={exercise.data?.sliders ?? []}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                  {exercise.type === "counter_tracker" && (
                    <ExerciseCounterTracker
                      exerciseKey={exercise.key}
                      days={exercise.data?.days ?? 3}
                      counterLabel={exercise.data?.counterLabel ?? "eventos"}
                      savedResponse={savedResp}
                      onSave={handleSaveExercise}
                      isPending={isPending}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compromiso semanal */}
      <div
        className="mb-6 rounded-2xl border p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <h3 className="mb-1 text-sm font-bold text-white">Mi compromiso de esta semana</h3>
        <p className="mb-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          ¿Cuál es la acción concreta que vas a ejecutar esta semana con lo que aprendiste en esta sesión?
        </p>
        <textarea
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          rows={3}
          placeholder="Escribí tu compromiso aquí..."
          className="mb-3 w-full resize-none rounded-xl border bg-transparent p-3 text-sm leading-relaxed outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.85)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(91,138,255,0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={handleSaveCommitment}
          disabled={!commitment.trim() || isPending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
          style={{
            background: commitment.trim() ? "rgba(91,138,255,0.2)" : "rgba(255,255,255,0.04)",
            border: commitment.trim()
              ? "1px solid rgba(91,138,255,0.4)"
              : "1px solid rgba(255,255,255,0.1)",
            color: commitment.trim() ? "#9fb9ff" : "rgba(255,255,255,0.3)",
          }}
        >
          {isPending ? "Guardando..." : "Guardar compromiso"}
        </button>
      </div>

      {/* Avance anticipado */}
      {earlyUnlockAvailable && (
        <div
          className="rounded-2xl border p-5"
          style={{
            background: "rgba(251,191,36,0.06)",
            borderColor: "rgba(251,191,36,0.25)",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap size={16} color="#fbbf24" />
            <h3 className="text-sm font-bold" style={{ color: "#fbbf24" }}>
              Completaste la sesión antes de tiempo
            </h3>
          </div>
          <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Terminaste todos los ejercicios. Normalmente la siguiente sesión se desbloquea al completar 7 días
            de práctica, pero podés solicitar avance anticipado ahora.
          </p>
          <button
            onClick={handleEarlyUnlock}
            disabled={isPending}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: "rgba(251,191,36,0.2)",
              border: "1px solid rgba(251,191,36,0.4)",
              color: "#fbbf24",
            }}
          >
            {isPending ? "Desbloqueando..." : `Solicitar avance anticipado → Sesión ${session.number + 1}`}
          </button>
        </div>
      )}
    </div>
  );
}
