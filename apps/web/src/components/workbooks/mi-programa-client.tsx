"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Circle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { Scorecard, WorkbookProgress, WorkbookResponse } from "@/types/database";
import { SCORECARD_AREAS, type ScorecardKey } from "@/types/database";
import {
  SESSIONS,
  TOTAL_SESSIONS,
  isSessionUnlocked,
} from "@/lib/workbook-sessions";

const MONO = 'ui-monospace, "JetBrains Mono", monospace';

interface Props {
  allProgress: WorkbookProgress[];
  responses: Pick<WorkbookResponse, "session_number" | "exercise_key" | "completed_at">[];
  baseline: Scorecard | null;
  latest: Scorecard | null;
}

export function MiProgramaClient({
  allProgress,
  responses,
  baseline,
  latest,
}: Props) {
  const completedSessions = allProgress.filter((p) => p.pct_complete === 100).length;
  const totalExercises = SESSIONS.reduce((s, x) => s + x.exercises.length, 0);
  const totalAnswered = responses.length;
  const overallPct = totalExercises > 0 ? Math.round((totalAnswered / totalExercises) * 100) : 0;
  const dayInProgram = (() => {
    const first = allProgress.find((p) => p.session_number === 1);
    if (!first) return 0;
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(first.unlocked_at).getTime()) / 86_400_000)
    );
  })();

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.4px]"
            style={{ color: "rgba(159,185,255,0.85)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#5b8aff", boxShadow: "0 0 6px #5b8aff" }}
            />
            Mi Programa TBM
          </div>
          <h1
            className="m-0 text-white"
            style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6 }}
          >
            Tu transformación de 8 sesiones
          </h1>
          <p className="mt-2 max-w-[640px] text-[13.5px] text-white/55">
            El programa entero en una vista: qué cerraste, qué falta, y cómo cambió tu
            empresa desde el Día 1 vs hoy.
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="mb-7 grid gap-3 sm:grid-cols-4">
        <StatCard
          Icon={CheckCircle2}
          label="Sesiones completadas"
          value={`${completedSessions} / ${TOTAL_SESSIONS}`}
          color="#34d399"
        />
        <StatCard
          Icon={BookOpen}
          label="Ejercicios respondidos"
          value={`${totalAnswered} / ${totalExercises}`}
          color="#9fb9ff"
          hint={`${overallPct}% del programa`}
        />
        <StatCard
          Icon={Calendar}
          label="Día en el programa"
          value={dayInProgram > 0 ? `Día ${dayInProgram}` : "Pendiente"}
          color="#fbbf24"
          hint={
            dayInProgram > 0
              ? `arrancado el ${formatDate(allProgress.find((p) => p.session_number === 1)?.unlocked_at)}`
              : "completá el primer ejercicio para arrancar"
          }
        />
        <StatCard
          Icon={TrendingUp}
          label="Comparativa scorecard"
          value={baseline && latest ? buildDeltaLabel(baseline, latest) : "Sin datos"}
          color="#a78bfa"
          hint={
            baseline && latest
              ? `${formatDate(baseline.created_at)} → ${formatDate(latest.created_at)}`
              : "necesitás 2 diagnósticos para comparar"
          }
        />
      </div>

      {/* Timeline 8 sesiones */}
      <Section title="Línea de tiempo">
        <div className="flex flex-col gap-3">
          {SESSIONS.map((s) => {
            const progress = allProgress.find((p) => p.session_number === s.number);
            const exercisesAnswered = responses.filter(
              (r) => r.session_number === s.number
            ).length;
            const unlocked = isSessionUnlocked(s.number, allProgress);
            return (
              <SessionRow
                key={s.number}
                number={s.number}
                title={s.title}
                subtitle={s.subtitle}
                progress={progress}
                exercisesAnswered={exercisesAnswered}
                exercisesTotal={s.exercises.length}
                unlocked={unlocked}
              />
            );
          })}
        </div>
      </Section>

      {/* Comparativa Día 1 vs Hoy */}
      <Section title="Diagnóstico Organizacional · Día 1 vs Hoy">
        {baseline && latest && baseline.id !== latest.id ? (
          <ScoreCompare baseline={baseline} latest={latest} />
        ) : (
          <EmptyComparative hasBaseline={!!baseline} />
        )}
      </Section>
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  color,
  hint,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}1c`, border: `1px solid ${color}33`, color }}
        >
          <Icon size={14} strokeWidth={1.9} />
        </div>
        <span className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-white/50">
          {label}
        </span>
      </div>
      <div className="text-[22px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11.5px] text-white/65">{hint}</div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2
        className="mb-3 text-[11px] font-bold uppercase tracking-[1.4px] text-white/65"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SessionRow({
  number,
  title,
  subtitle,
  progress,
  exercisesAnswered,
  exercisesTotal,
  unlocked,
}: {
  number: number;
  title: string;
  subtitle: string;
  progress: WorkbookProgress | undefined;
  exercisesAnswered: number;
  exercisesTotal: number;
  unlocked: boolean;
}) {
  const pct = progress?.pct_complete ?? 0;
  const completed = pct === 100;
  const unlockedAt = progress?.unlocked_at;

  const tone = completed
    ? { color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" }
    : unlocked
      ? { color: "#9fb9ff", bg: "rgba(91,138,255,0.08)", border: "rgba(91,138,255,0.24)" }
      : { color: "var(--fg-muted)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)" };

  return (
    <Link
      href={unlocked ? `/workbooks/${number}` : "#"}
      className="block rounded-2xl border p-4 transition"
      style={{
        background: tone.bg,
        borderColor: tone.border,
        opacity: unlocked ? 1 : 0.6,
        cursor: unlocked ? "pointer" : "default",
        textDecoration: "none",
      }}
    >
      <div className="flex items-center gap-4">
        {/* circle with number */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border text-[14px] font-bold"
          style={{
            background: completed
              ? "rgba(52,211,153,0.15)"
              : unlocked
                ? "rgba(91,138,255,0.15)"
                : "rgba(255,255,255,0.05)",
            borderColor: completed
              ? "rgba(52,211,153,0.35)"
              : unlocked
                ? "rgba(91,138,255,0.30)"
                : "rgba(255,255,255,0.10)",
            color: tone.color,
            fontFamily: MONO,
          }}
        >
          {completed ? <CheckCircle2 size={18} /> : !unlocked ? <Lock size={15} /> : `S${number}`}
        </div>

        {/* info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[14.5px] font-bold text-white">{title}</span>
            {progress?.commitment_done && (
              <span className="text-[10px] font-semibold text-[#34d399]">· compromiso cumplido</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-white/50">{subtitle}</p>
        </div>

        {/* progress + stats */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1.5" style={{ minWidth: 140 }}>
          <div className="flex items-center gap-2" style={{ fontFamily: MONO }}>
            <span className="text-[11.5px] font-bold" style={{ color: tone.color }}>
              {pct}%
            </span>
            <span className="text-[11px] text-white/65">
              · {exercisesAnswered}/{exercisesTotal}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: completed ? "#34d399" : "linear-gradient(90deg,#5b8aff,#9fb9ff)",
                transition: "width .4s",
              }}
            />
          </div>
          <span className="text-[10.5px] text-white/65" style={{ fontFamily: MONO }}>
            {unlockedAt ? `desbloq. ${formatDate(unlockedAt)}` : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ScoreCompare({
  baseline,
  latest,
}: {
  baseline: Scorecard;
  latest: Scorecard;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-3 flex items-center justify-between text-[11.5px] text-white/55">
        <span>Día 1 · {formatDate(baseline.created_at)}</span>
        <span>Hoy · {formatDate(latest.created_at)}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {SCORECARD_AREAS.map((area) => (
          <ScoreCompareRow
            key={area.key}
            label={area.label}
            v0={(baseline[area.key] as number | null) ?? null}
            v1={(latest[area.key] as number | null) ?? null}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-[12px]" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-white/60">Promedio total</span>
        <ScoreCompareValues
          v0={baseline.total_score as number | null}
          v1={latest.total_score as number | null}
          bold
        />
      </div>
    </div>
  );
}

function ScoreCompareRow({
  label,
  v0,
  v1,
}: {
  label: string;
  v0: number | null;
  v1: number | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[180px] truncate text-[12.5px] text-white/75">{label}</div>
      <div className="flex flex-1 items-center gap-2.5">
        <Bar value={v0} tone="muted" />
        <Bar value={v1} tone="accent" />
      </div>
      <ScoreCompareValues v0={v0} v1={v1} />
    </div>
  );
}

function Bar({ value, tone }: { value: number | null; tone: "muted" | "accent" }) {
  const pct = value != null ? (value / 5) * 100 : 0;
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background:
            tone === "accent"
              ? "linear-gradient(90deg, #34d399, #5b8aff)"
              : "rgba(255,255,255,0.25)",
        }}
      />
    </div>
  );
}

function ScoreCompareValues({
  v0,
  v1,
  bold,
}: {
  v0: number | null;
  v1: number | null;
  bold?: boolean;
}) {
  const delta = v0 != null && v1 != null ? Number((v1 - v0).toFixed(1)) : null;
  const tone =
    delta == null
      ? "rgba(255,255,255,0.4)"
      : delta > 0
        ? "#34d399"
        : delta < 0
          ? "#f87171"
          : "rgba(255,255,255,0.5)";
  const Icon = delta == null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 130, fontFamily: MONO }}>
      <span className="text-[11px] text-white/65">{v0 ?? "—"}</span>
      <span className="text-white/65">→</span>
      <span className={`text-[12px]${bold ? " font-bold" : ""} text-white/85`}>{v1 ?? "—"}</span>
      <span
        className="ml-1 flex items-center gap-0.5 text-[11px] font-bold"
        style={{ color: tone }}
      >
        <Icon size={10} />
        {delta == null ? "" : delta > 0 ? `+${delta}` : delta}
      </span>
    </div>
  );
}

function EmptyComparative({ hasBaseline }: { hasBaseline: boolean }) {
  return (
    <div
      className="rounded-2xl border border-dashed p-5 text-center text-[13px] text-white/55"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.12)" }}
    >
      {!hasBaseline ? (
        <>
          <Circle className="mx-auto mb-2 text-white/65" size={18} />
          Todavía no hay diagnóstico inicial. Completá el primero desde{" "}
          <Link href="/onboarding" className="text-[#9fb9ff] underline">
            el onboarding
          </Link>{" "}
          o el Workbook S1.
        </>
      ) : (
        <>
          <Calendar className="mx-auto mb-2 text-white/65" size={18} />
          Para ver tu evolución, hacé un segundo diagnóstico desde el Workbook S1
          (la próxima vez que lo completes quedará registrado).
        </>
      )}
    </div>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function buildDeltaLabel(baseline: Scorecard, latest: Scorecard): string {
  const b = baseline.total_score as number | null;
  const l = latest.total_score as number | null;
  if (b == null || l == null) return "—";
  const diff = Number((l - b).toFixed(1));
  if (diff > 0) return `+${diff} pts`;
  if (diff < 0) return `${diff} pts`;
  return "Sin cambio";
}
