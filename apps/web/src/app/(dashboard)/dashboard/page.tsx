import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { SCORECARD_AREAS, type Scorecard, type ScorecardKey } from "@/types/database";
import EnergySelector from "@/components/dashboard/EnergySelector";
import KpiCard from "@/components/dashboard/KpiCard";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { HeroStrip } from "@/components/dashboard/hero-strip";
import { JarvisIntro } from "@/components/dashboard/jarvis-intro";
import { greetingForHour } from "@/lib/greeting";
import {
  RotateCcw,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Shield,
  Send,
  MessageSquare,
  Workflow,
  Clock,
  CircleDollarSign,
  Heart,
  Sunrise,
  Sun,
  Sunset,
  Check,
  Play,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { DISC_COLORS, primaryLetter } from "@/lib/disc";

// =============================================================
// Helpers
// =============================================================
const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

type ScoreTone = { label: string; color: string };
function scoreTone(v: number | null): ScoreTone {
  if (!v) return { label: "Sin dato", color: "#64748b" };
  if (v <= 1) return { label: "Crítico", color: "#f87171" };
  if (v <= 2) return { label: "Bajo", color: "#fb923c" };
  if (v <= 3) return { label: "Regular", color: "#fbbf24" };
  if (v <= 4) return { label: "Bien", color: "#a3e635" };
  return { label: "Excelente", color: "#34d399" };
}

const SCORECARD_ICONS: Record<ScorecardKey, LucideIcon> = {
  score_liderazgo: Shield,
  score_equipo: Users,
  score_delegacion: Send,
  score_comunicacion: MessageSquare,
  score_procesos: Workflow,
  score_tiempo: Clock,
  score_dinero: CircleDollarSign,
  score_cultura: Heart,
};

// =============================================================
// Scorecard cards
// =============================================================
function TrendDots({ values }: { values: number[] }) {
  return (
    <div className="flex items-end" style={{ gap: 4, height: 22 }}>
      {values.map((v, i) => {
        const { color } = scoreTone(v);
        const h = 6 + (v / 5) * 16;
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 2,
              background: color,
              opacity: 0.35 + (i / values.length) * 0.65,
            }}
          />
        );
      })}
    </div>
  );
}

function ScoreCard({
  Icon,
  label,
  score,
  trend,
}: {
  Icon: LucideIcon;
  label: string;
  score: number | null;
  trend: number[];
}) {
  const { color, label: toneLabel } = scoreTone(score);
  const isHigh = (score ?? 0) >= 4;
  return (
    <div
      className="relative overflow-hidden transition-all"
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: isHigh
          ? "linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0.02) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: isHigh
          ? "1px solid rgba(52,211,153,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isHigh ? "0 6px 18px rgba(52,211,153,0.10)" : "none",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 14 }}
      >
        <div className="flex items-center" style={{ gap: 9 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: `${color}1c`,
              border: `1px solid ${color}33`,
              color,
            }}
          >
            <Icon size={13} strokeWidth={2} />
          </div>
          <div
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 1.2,
            }}
          >
            {label}
          </div>
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}aa`,
          }}
        />
      </div>

      {/* Score + trend */}
      <div
        className="flex items-end justify-between"
        style={{ marginBottom: 12 }}
      >
        <div className="flex items-baseline" style={{ gap: 2 }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            {score ?? "–"}
          </span>
          <span
            style={{
              ...MONO,
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            /5
          </span>
        </div>
        <TrendDots values={trend} />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ fontSize: 12, color, fontWeight: 600 }}>{toneLabel}</div>
        <div
          style={{
            ...MONO,
            fontSize: 10.5,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          5 sem
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Rituales — 3 cards con estado real (S12). El array se construye
// en la página con los datos del día; acá viven los tipos y helpers.
// =============================================================
type RitualStatus = "done" | "live" | "upcoming";
type RitualDef = {
  id: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  time: string;
  sprint: string;
  status: RitualStatus;
  statusLabel: string;
  href: string;
  duration?: string;
  solo?: boolean;
  participants?: number;
  total?: number;
};

// Últimas 5 evaluaciones de un área, paddeadas a la izquierda con 0
function buildTrend(history: Scorecard[], key: ScorecardKey): number[] {
  const values = history
    .map((s) => s[key])
    .filter((v): v is number => v !== null)
    .slice(-5);
  const padded = Array(5).fill(0);
  values.forEach((v, i) => {
    padded[i + (5 - values.length)] = v;
  });
  return padded;
}

const STATUS_STYLES: Record<RitualStatus, { color: string; cta: string; CTAIcon: LucideIcon }> = {
  done: { color: "#34d399", cta: "Ver resumen", CTAIcon: ArrowRight },
  live: { color: "#5b8aff", cta: "Unirme ahora", CTAIcon: Play },
  upcoming: { color: "#fbbf24", cta: "Preparar", CTAIcon: ChevronRight },
};

function Avatars({ count, total }: { count: number; total: number }) {
  const names = ["A", "L", "M", "C", "P", "R", "S", "D"];
  const colors = [
    "#f87171",
    "#5b8aff",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f472b6",
    "#06b6d4",
    "#fb923c",
  ];
  const shown = Math.min(count, 4);
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <div className="flex">
        {names.slice(0, shown).map((n, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-white"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: colors[i],
              border: "2px solid #0a0e1a",
              marginLeft: i === 0 ? 0 : -6,
              fontSize: 10,
              fontWeight: 600,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {n}
          </div>
        ))}
        {count > shown && (
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "2px solid #0a0e1a",
              marginLeft: -6,
              fontSize: 9.5,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            +{count - shown}
          </div>
        )}
      </div>
      <span
        style={{
          ...MONO,
          fontSize: 11.5,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {count}/{total}
      </span>
    </div>
  );
}

function RitualCard({ ritual }: { ritual: RitualDef }) {
  const isLive = ritual.status === "live";
  const isDone = ritual.status === "done";
  const s = STATUS_STYLES[ritual.status];
  const { Icon, CTAIcon } = { Icon: ritual.Icon, CTAIcon: s.CTAIcon };
  return (
    <div
      className="relative overflow-hidden"
      style={{
        padding: "20px 22px",
        borderRadius: 14,
        background: isLive
          ? "linear-gradient(135deg, rgba(91,138,255,0.16) 0%, rgba(91,138,255,0.04) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: isLive ? "1px solid rgba(91,138,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isLive ? "0 10px 30px rgba(91,138,255,0.18)" : "none",
      }}
    >
      {/* Live pulse strip */}
      {isLive && (
        <div
          className="tbm-live-strip absolute left-0 right-0"
          style={{
            top: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #5b8aff, transparent)",
          }}
        />
      )}

      <div
        className="flex items-start justify-between"
        style={{ marginBottom: 14 }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: `${s.color}1c`,
              border: `1px solid ${s.color}40`,
              color: s.color,
            }}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div
              className="flex items-center"
              style={{ fontSize: 15.5, fontWeight: 600, color: "#fff", gap: 8 }}
            >
              {ritual.title}
              {isDone && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#34d399",
                    color: "#0a0e1a",
                  }}
                >
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
                marginTop: 2,
              }}
            >
              {ritual.desc}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            fontSize: 10.5,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 0.4,
          }}
        >
          {ritual.sprint}
        </div>
      </div>

      {/* Meta */}
      <div
        className="flex items-center"
        style={{
          gap: 14,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="flex items-center"
          style={{
            ...MONO,
            gap: 6,
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
          }}
        >
          <Clock size={12} />
          {ritual.time}
        </div>
        {ritual.solo ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>· Personal</div>
        ) : (
          <Avatars count={ritual.participants ?? 0} total={ritual.total ?? 0} />
        )}
      </div>

      {/* Status + CTA */}
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 14 }}
      >
        <div
          className="flex items-center"
          style={{
            gap: 7,
            fontSize: 12,
            color: s.color,
            fontWeight: 600,
          }}
        >
          <span
            className={isLive ? "tbm-pulse-dot" : ""}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 8px ${s.color}`,
            }}
          />
          {ritual.statusLabel}
          {isDone && ritual.duration && (
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
              · {ritual.duration}
            </span>
          )}
        </div>
        <a
          href={ritual.href}
          className="flex items-center transition-all"
          style={{
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            border: isLive ? "none" : "1px solid rgba(255,255,255,0.08)",
            background: isLive
              ? "linear-gradient(180deg, #4f86ff, #2c5fe6)"
              : "transparent",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: isLive
              ? "0 4px 12px rgba(54,114,255,0.32), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "none",
          }}
        >
          {s.cta}
          <CTAIcon size={12} strokeWidth={2.2} />
        </a>
      </div>
    </div>
  );
}

// =============================================================
// Página
// =============================================================
export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Perfil + empresa
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  if (!profile.onboarding_completed) {
    // Coach dedicado (asignado, sin empresa propia): no hace el onboarding de empresa
    // ni tiene un dashboard de empresa → lo mandamos directo a su panel Super Coach.
    if (!profile.company_id) {
      const { count } = await supabase
        .from("coach_assignments")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", user.id);
      if ((count ?? 0) > 0) redirect("/super-coach");
    }
    redirect("/onboarding");
  }

  const company = (profile as { companies?: { name: string } | null }).companies ?? null;
  const firstName = profile.full_name?.split(" ")[0] ?? "Arquitecto";

  // Historial completo de scorecards (ascendente) — alimenta semáforos,
  // tendencia por área y Hero Strip (baseline, promedio, delta)
  const { data: scorecardRows } = await supabase
    .from("scorecards")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: true });
  const scorecardHistory = (scorecardRows ?? []) as Scorecard[];
  const latestScorecard = scorecardHistory.at(-1) ?? null;

  // KPIs de la semana
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekDate = monday.toISOString().split("T")[0];

  const { data: kpis } = await supabase
    .from("kpis")
    .select("*")
    .eq("company_id", profile.company_id!)
    .eq("week_date", weekDate)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(5);

  // Energía de hoy
  const todayStr = today.toISOString().split("T")[0];
  const { data: energyToday } = await supabase
    .from("energy_logs")
    .select("level")
    .eq("user_id", user.id)
    .eq("log_date", todayStr)
    .single();

  // ── S12/S13: datos reales para Hero Strip + Rituales de hoy ──
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0];

  const [
    { data: warUpHoy },
    { data: coolDownsHoyRows },
    { data: recentPreGames },
    { data: teamProfiles },
    { data: energyLogsHoy },
    { data: ritualConfig },
    { data: recentTasks },
  ] = await Promise.all([
    supabase
      .from("war_ups")
      .select("id, started_at, status")
      .eq("company_id", profile.company_id!)
      .eq("war_up_date", todayStr)
      .maybeSingle(),
    supabase
      .from("cool_downs")
      .select("user_id")
      .eq("company_id", profile.company_id!)
      .eq("log_date", todayStr),
    supabase
      .from("pre_games")
      .select("log_date")
      .eq("user_id", user.id)
      .gte("log_date", ninetyDaysAgoStr)
      .order("log_date", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, disc_letters")
      .eq("company_id", profile.company_id!),
    supabase
      .from("energy_logs")
      .select("user_id, level")
      .eq("company_id", profile.company_id!)
      .eq("log_date", todayStr),
    supabase
      .from("ritual_configs")
      .select("mode, war_up_deadline, cool_down_start")
      .eq("company_id", profile.company_id!)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, status, assigned_to, created_by")
      .eq("company_id", profile.company_id!)
      .gte("updated_at", thirtyDaysAgoStr),
  ]);

  // Escalaciones Anti-Boomerang sobre las tareas recientes (proxy Multiplicador)
  const recentTaskIds = (recentTasks ?? []).map((t) => t.id);
  let boomerangCount = 0;
  if (recentTaskIds.length > 0) {
    const { count } = await supabase
      .from("task_updates")
      .select("id", { count: "exact", head: true })
      .eq("type", "boomerang_attempt")
      .in("task_id", recentTaskIds);
    boomerangCount = count ?? 0;
  }

  // Participantes del War Up de hoy (solo si la sala existe)
  let warUpParticipants = 0;
  if (warUpHoy) {
    const { count } = await supabase
      .from("war_up_entries")
      .select("id", { count: "exact", head: true })
      .eq("war_up_id", warUpHoy.id);
    warUpParticipants = count ?? 0;
  }

  // Estados de los 3 rituales de hoy
  const preGameDates = new Set((recentPreGames ?? []).map((p) => p.log_date));
  const preGameStatus: RitualStatus = preGameDates.has(todayStr) ? "done" : "upcoming";
  const warUpStatus: RitualStatus =
    warUpHoy?.status === "closed" ? "done" : warUpHoy?.status === "active" ? "live" : "upcoming";
  const myCoolDownDone = (coolDownsHoyRows ?? []).some((c) => c.user_id === user.id);
  const coolDownStatus: RitualStatus = myCoolDownDone ? "done" : "upcoming";

  // Racha de Pre-game: días consecutivos desde hoy hacia atrás
  let preGameStreak = 0;
  const checkDate = new Date(today);
  while (preGameDates.has(checkDate.toISOString().split("T")[0])) {
    preGameStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Mejor racha histórica (90 días de datos): secuencias consecutivas
  const sortedDates = Array.from(preGameDates).sort();
  let bestStreak = 0;
  let run = 0;
  let prevTime = 0;
  for (const d of sortedDates) {
    const t = new Date(d + "T12:00:00").getTime();
    run = prevTime && t - prevTime === 86_400_000 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prevTime = t;
  }
  bestStreak = Math.max(bestStreak, preGameStreak);

  // Historial visual de los últimos 7 días (label es-AR + done)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split("T")[0];
    return {
      label: d
        .toLocaleDateString("es-AR", { weekday: "short" })
        .replace(".", "")
        .slice(0, 3),
      done: preGameDates.has(iso),
    };
  });

  // Ciclo 90D: día actual desde el scorecard baseline
  const baseline = scorecardHistory.find((s) => s.is_baseline) ?? scorecardHistory[0] ?? null;
  const cycleStart = baseline?.created_at ? new Date(baseline.created_at) : null;
  const dayInProgram = cycleStart
    ? Math.floor((today.getTime() - cycleStart.getTime()) / 86_400_000) + 1
    : null;
  const dayInCycle = dayInProgram ? ((dayInProgram - 1) % 90) + 1 : null;
  const cycleNumber = dayInProgram ? Math.floor((dayInProgram - 1) / 90) + 1 : 1;
  const cycleStartLabel = cycleStart
    ? cycleStart.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  // Multiplicador (proxy fase A): delegación 40% + autonomía 40% + base 20%
  const delegacionScore = latestScorecard?.score_delegacion ?? null;
  const totalRecentTasks = recentTasks?.length ?? 0;
  const boomerangRate =
    totalRecentTasks > 0
      ? 1 - Math.min(1, boomerangCount / totalRecentTasks)
      : 0.5;
  const tasksDoneByTeam = (recentTasks ?? []).filter(
    (t) => t.status === "done" && t.assigned_to && t.assigned_to !== t.created_by
  ).length;
  const multiplicadorPct =
    delegacionScore !== null
      ? Math.round(((delegacionScore / 5) * 0.4 + boomerangRate * 0.4 + 0.5 * 0.2) * 100)
      : null;

  // Equipo con su energía de hoy (tooltip del tile 4)
  const energyByUser = new Map((energyLogsHoy ?? []).map((e) => [e.user_id, e.level]));
  const teamWithEnergy = (teamProfiles ?? []).map((p) => {
    const letter = primaryLetter(p.disc_letters);
    return {
      id: p.id,
      name: p.full_name ?? "Sin nombre",
      initial: (p.full_name ?? "?").trim().charAt(0).toUpperCase() || "?",
      color: letter ? DISC_COLORS[letter] : "#5b8aff",
      energyToday: energyByUser.get(p.id) ?? null,
    };
  });
  const teamTotal = teamWithEnergy.length;

  // Notificaciones no leídas (badge de la campana)
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  // Tareas asignadas a mí por vencer (hoy o vencidas) sin completar — para el saludo JARVIS
  const endOfTodayStr = `${todayStr}T23:59:59`;
  const { count: tasksDueCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assigned_to", user.id)
    .neq("status", "done")
    .lte("when_deadline", endOfTodayStr);

  // Horarios y modo desde ritual_configs
  const fmtTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : null);
  const warUpDeadline = fmtTime(ritualConfig?.war_up_deadline) ?? "09:00";
  const coolDownStart = fmtTime(ritualConfig?.cool_down_start) ?? "17:00";
  const modeBadge =
    !ritualConfig || ritualConfig.mode === "daily" ? "Diario" : `Modo ${ritualConfig.mode}`;

  // Áreas críticas
  const areasCriticas = latestScorecard
    ? SCORECARD_AREAS.filter((a) => {
        const v = (latestScorecard as Scorecard)[a.key];
        return v !== null && v <= 2;
      })
    : [];

  const greeting = greetingForHour(today.getHours());
  const dateStr = today.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Promedio del scorecard
  const sc = latestScorecard as Scorecard | null;
  const scoreValues = sc
    ? SCORECARD_AREAS.map((a) => sc[a.key]).filter((v): v is number => v !== null)
    : [];
  const avg =
    scoreValues.length > 0
      ? (scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length).toFixed(1)
      : "–";

  // Rituales de hoy — construidos con el estado real del día
  const rituals: RitualDef[] = [
    {
      id: "pregame",
      title: "Pre-game",
      desc: "Rutina matutina personal",
      Icon: Sunrise,
      time: `antes de ${warUpDeadline}`,
      sprint: modeBadge,
      status: preGameStatus,
      statusLabel: preGameStatus === "done" ? "Completado" : "Pendiente",
      href: "/rituales/pre-game",
      solo: true,
    },
    {
      id: "warup",
      title: "War Up",
      desc: "Stand-up en vivo con el equipo",
      Icon: Sun,
      time: `hasta ${warUpDeadline}`,
      sprint: modeBadge,
      status: warUpStatus,
      statusLabel:
        warUpStatus === "done"
          ? "Cerrado"
          : warUpStatus === "live"
            ? "En vivo"
            : "Sin iniciar",
      href: "/rituales/war-up",
      participants: warUpParticipants,
      total: teamTotal,
    },
    {
      id: "cooldown",
      title: "Cool Down",
      desc: "Cierre y Victory Log",
      Icon: Sunset,
      time: `desde ${coolDownStart}`,
      sprint: modeBadge,
      status: coolDownStatus,
      statusLabel: coolDownStatus === "done" ? "Completado" : "Programado",
      href: "/rituales/cool-down",
      participants: coolDownsHoyRows?.length ?? 0,
      total: teamTotal,
    },
  ];
  const ritualsProgramados = rituals.length;
  const ritualesCompletados = rituals.filter((r) => r.status === "done").length;
  const ritualesEnVivo = rituals.filter((r) => r.status === "live").length;
  const ritualesPendientes = rituals.filter((r) => r.status === "upcoming").length;

  // Próximo ritual pendiente (para el saludo JARVIS) — null si ya están todos hechos
  const nextRitualLabel: string | null =
    preGameStatus !== "done"
      ? "tu Pre-game te espera"
      : warUpStatus === "live"
        ? "el War Up está en vivo ahora"
        : warUpStatus !== "done"
          ? `el War Up cierra a las ${warUpDeadline}`
          : coolDownStatus !== "done"
            ? `el Cool Down abre desde ${coolDownStart}`
            : null;

  return (
    <div
      className="text-white"
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-start justify-between"
        style={{ gap: 24, marginBottom: 32 }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center"
            style={{
              ...MONO,
              gap: 10,
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            <span
              className="inline-flex items-center uppercase"
              style={{
                gap: 6,
                padding: "3px 9px",
                borderRadius: 99,
                background: "rgba(91,138,255,0.10)",
                border: "1px solid rgba(91,138,255,0.22)",
                color: "#9fb9ff",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#5b8aff",
                  boxShadow: "0 0 6px #5b8aff",
                }}
              />
              {company?.name ?? "Mi Empresa"}
            </span>
            <span style={{ textTransform: "capitalize" }}>{dateStr}</span>
          </div>
          <h1
            className="flex items-center"
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              letterSpacing: -0.6,
              color: "#fff",
              gap: 12,
            }}
          >
            {greeting}, {firstName}
          </h1>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              marginTop: 6,
            }}
          >
            {areasCriticas.length > 0 ? (
              <>
                Atención:{" "}
                <span style={{ color: "#f87171", fontWeight: 500 }}>
                  {areasCriticas.length}{" "}
                  {areasCriticas.length === 1 ? "área crítica" : "áreas críticas"}
                </span>{" "}
                · {ritualsProgramados} rituales programados para hoy.
              </>
            ) : (
              <>
                Tu Plan 90D avanza fuerte. Tenés{" "}
                <span style={{ color: "#9fb9ff", fontWeight: 500 }}>
                  {ritualsProgramados} rituales
                </span>{" "}
                programados para hoy.
              </>
            )}
          </div>
        </div>

        <div
          className="flex items-center"
          style={{ gap: 16, flexShrink: 0 }}
        >
          {/* Search — abre el Command Palette (⌘K) */}
          <SearchTrigger />

          {/* Notifications — badge real de no-leídas */}
          <NotificationsBell userId={user.id} initialUnread={unreadCount ?? 0} />

          {/* Energía — selector ACTUAL (mantenido por requerimiento) */}
          <EnergySelector
            userId={user.id}
            companyId={profile.company_id!}
            currentLevel={energyToday?.level ?? null}
            date={todayStr}
          />
        </div>
      </div>

      {/* ── Bienvenida cinemática JARVIS — solo en login fresco (S17.D) ── */}
      <JarvisIntro
        greeting={greeting}
        firstName={firstName}
        tasksDueCount={tasksDueCount ?? 0}
        nextRitualLabel={nextRitualLabel}
        areasCriticasCount={areasCriticas.length}
        unreadCount={unreadCount ?? 0}
      />

      {/* ── Hero strip — interactivo con datos reales (S12+S13) ── */}
      <HeroStrip
        dayInCycle={dayInCycle}
        cycleNumber={cycleNumber}
        cycleStartLabel={cycleStartLabel}
        streak={preGameStreak}
        bestStreak={bestStreak}
        last7Days={last7Days}
        preGameDoneToday={preGameStatus === "done"}
        multiplicadorPct={multiplicadorPct}
        delegacionScore={delegacionScore}
        boomerangCount={boomerangCount}
        tasksDoneByTeam={tasksDoneByTeam}
        teamWithEnergy={teamWithEnergy}
      />

      {/* ── Alerta áreas críticas ──────────────────────────── */}
      {areasCriticas.length > 0 && (
        <div
          className="flex items-start"
          style={{
            gap: 12,
            padding: "14px 16px",
            borderRadius: 12,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.3)",
            marginBottom: 28,
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#f87171",
              color: "#0a0e1a",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            <TrendingUp size={12} strokeWidth={2.6} style={{ transform: "rotate(180deg)" }} />
          </span>
          <div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>
              {areasCriticas.length === 1
                ? "Hay un área crítica que necesita atención inmediata"
                : `Hay ${areasCriticas.length} áreas críticas que necesitan atención`}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {areasCriticas.map((a) => a.label).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* ── Diagnóstico Organizacional TBM ─────────────────────── */}
      <section data-tour="semaforos" style={{ marginBottom: 36 }}>
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: 14 }}
        >
          <div>
            <div
              className="uppercase"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1.4,
                marginBottom: 4,
              }}
            >
              Diagnóstico Organizacional TBM
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {latestScorecard
                ? "Última actualización · " +
                  new Date(latestScorecard.created_at ?? today).toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Completá tu diagnóstico inicial para ver los semáforos"}
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Promedio
            </div>
            <div
              className="flex items-baseline"
              style={{
                gap: 2,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(91,138,255,0.10)",
                border: "1px solid rgba(91,138,255,0.25)",
              }}
            >
              <span
                style={{
                  ...MONO,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#9fb9ff",
                }}
              >
                {avg}
              </span>
              <span
                style={{
                  ...MONO,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                /5
              </span>
            </div>
            <a
              href="/diagnostico"
              className="flex items-center transition-colors hover:text-white"
              style={{
                gap: 6,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "7px 12px",
                borderRadius: 8,
                color: "rgba(255,255,255,0.7)",
                fontSize: 12.5,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Actualizar
              <RotateCcw size={13} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        {latestScorecard ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            style={{ gap: 12 }}
          >
            {SCORECARD_AREAS.map((area) => {
              const score = (latestScorecard as Scorecard)[area.key];
              const trend = buildTrend(scorecardHistory, area.key);
              return (
                <ScoreCard
                  key={area.key}
                  Icon={SCORECARD_ICONS[area.key]}
                  label={area.label}
                  score={score}
                  trend={trend}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="text-center"
            style={{
              padding: "32px 20px",
              borderRadius: 14,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
              border: "1px dashed rgba(255,255,255,0.10)",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              Completá el diagnóstico inicial para ver tus semáforos
            </p>
            <a
              href="/diagnostico"
              className="inline-block hover:underline"
              style={{
                marginTop: 12,
                color: "#9fb9ff",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Ir al diagnóstico →
            </a>
          </div>
        )}
      </section>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: 14 }}
        >
          <div>
            <div
              className="uppercase"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1.4,
                marginBottom: 4,
              }}
            >
              KPIs de la semana
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {kpis && kpis.length > 0
                ? `${kpis.length} indicadores activos`
                : "Todavía no configuraste KPIs para esta semana"}
            </div>
          </div>
          <a
            href="/dashboard/kpis"
            className="flex items-center transition-opacity hover:opacity-80"
            style={{
              gap: 6,
              color: "#9fb9ff",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Gestionar
            <ArrowRight size={13} strokeWidth={2} />
          </a>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 12 }}
        >
          {kpis && kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}

          {/* Add slot */}
          <a
            href="/dashboard/kpis"
            className="flex flex-col items-center justify-center transition-all"
            style={{
              padding: 20,
              borderRadius: 14,
              background: "transparent",
              border: "1.5px dashed rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.5)",
              gap: 10,
              minHeight: 168,
              textDecoration: "none",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1.5px dashed currentColor",
              }}
            >
              <Plus size={18} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Agregar KPI</div>
            <div
              className="text-center"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                maxWidth: 140,
              }}
            >
              Trackeá un nuevo indicador esta semana
            </div>
          </a>
        </div>
      </section>

      {/* ── Rituales ───────────────────────────────────────── */}
      <section>
        <div
          className="flex items-baseline justify-between"
          style={{ marginBottom: 14 }}
        >
          <div>
            <div
              className="uppercase"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1.4,
                marginBottom: 4,
              }}
            >
              Rituales de hoy
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {ritualesCompletados} completado{ritualesCompletados === 1 ? "" : "s"} ·{" "}
              {ritualesEnVivo} en vivo · {ritualesPendientes} programado
              {ritualesPendientes === 1 ? "" : "s"}
            </div>
          </div>
          <a
            href="/rituales"
            className="flex items-center transition-opacity hover:opacity-80"
            style={{
              gap: 6,
              color: "#9fb9ff",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Ver semana
            <ArrowRight size={13} strokeWidth={2} />
          </a>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: 12 }}
        >
          {rituals.map((r) => (
            <RitualCard key={r.id} ritual={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
