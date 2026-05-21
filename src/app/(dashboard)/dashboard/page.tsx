import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { SCORECARD_AREAS } from "@/types/database";
import { cn } from "@/lib/utils";
import EnergySelector from "@/components/dashboard/EnergySelector";
import KpiCard from "@/components/dashboard/KpiCard";

// ── Helper: semáforo por score 1–5 ─────────────────────────────────────────
function semaforoScore(score: number | null): {
  colorClass: string;
  dotColor: string;
  label: string;
} {
  if (!score)
    return { colorClass: "", dotColor: "bg-tbm-border", label: "Sin dato" };
  if (score >= 4)
    return {
      colorClass: "bg-tbm-green/10 border-tbm-green/30",
      dotColor: "bg-tbm-green",
      label: "Bien",
    };
  if (score === 3)
    return {
      colorClass: "bg-tbm-yellow/10 border-tbm-yellow/30",
      dotColor: "bg-tbm-yellow",
      label: "Regular",
    };
  return {
    colorClass: "bg-tbm-red/10 border-tbm-red/30",
    dotColor: "bg-tbm-red",
    label: "Crítico",
  };
}

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cargar perfil + empresa
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Redirigir al onboarding si no lo completó
  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const company = (profile as any).companies;
  const firstName = profile.full_name?.split(" ")[0] ?? "Arquitecto";

  // Cargar scorecard más reciente
  const { data: latestScorecard } = await supabase
    .from("scorecards")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Cargar KPIs de la semana actual
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // lunes
  const weekDate = monday.toISOString().split("T")[0];

  const { data: kpis } = await supabase
    .from("kpis")
    .select("*")
    .eq("company_id", profile.company_id!)
    .eq("week_date", weekDate)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(5);

  // Cargar energía de hoy
  const todayStr = today.toISOString().split("T")[0];
  const { data: energyToday } = await supabase
    .from("energy_logs")
    .select("level")
    .eq("user_id", user.id)
    .eq("log_date", todayStr)
    .single();

  // Detectar áreas críticas (score <= 2)
  const areasCriticas = latestScorecard
    ? SCORECARD_AREAS.filter(
        (a) =>
          (latestScorecard as any)[a.key] !== null &&
          (latestScorecard as any)[a.key] <= 2
      )
    : [];

  const hora = today.getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* ── Bienvenida ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {saludo}, {firstName} 👋
          </h1>
          <p className="text-tbm-text-secondary text-sm mt-0.5">
            {company?.name ?? "Tu empresa"} ·{" "}
            {today.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Energía del líder — componente client */}
        <EnergySelector
          userId={user.id}
          companyId={profile.company_id!}
          currentLevel={energyToday?.level ?? null}
          date={todayStr}
        />
      </div>

      {/* ── Alerta roja si hay áreas críticas ──────────────────────── */}
      {areasCriticas.length > 0 && (
        <div className="p-4 rounded-xl bg-tbm-red/10 border border-tbm-red/40 flex items-start gap-3">
          <span className="text-xl">🔴</span>
          <div>
            <p className="text-white font-semibold text-sm">
              {areasCriticas.length === 1
                ? "Hay un área crítica que necesita atención inmediata"
                : `Hay ${areasCriticas.length} áreas críticas que necesitan atención`}
            </p>
            <p className="text-tbm-text-secondary text-xs mt-0.5">
              {areasCriticas.map((a) => a.label).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* ── Semáforo de 8 Áreas ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-tbm-text-secondary uppercase tracking-wider">
            Team Performance Scorecard
          </h2>
          {latestScorecard && (
            <span className="text-xs text-tbm-text-muted">
              Promedio:{" "}
              <span className="text-white font-medium">
                {latestScorecard.total_score}/5
              </span>
            </span>
          )}
        </div>

        {latestScorecard ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCORECARD_AREAS.map((area) => {
              const score = (latestScorecard as any)[area.key] as
                | number
                | null;
              const sem = semaforoScore(score);
              return (
                <div
                  key={area.key}
                  className={cn("tbm-card p-4 border", sem.colorClass)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-tbm-text-secondary uppercase tracking-wide">
                      {area.label}
                    </span>
                    <span
                      className={cn("w-2 h-2 rounded-full", sem.dotColor)}
                    />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {score ?? "–"}
                    <span className="text-sm text-tbm-text-muted font-normal">
                      /5
                    </span>
                  </p>
                  <p className="text-xs text-tbm-text-muted mt-1">
                    {sem.label}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tbm-card p-8 text-center border-dashed">
            <p className="text-tbm-text-secondary text-sm">
              Completá el diagnóstico inicial para ver tus semáforos
            </p>
            <a
              href="/onboarding"
              className="inline-block mt-3 text-tbm-blue text-sm hover:underline"
            >
              Ir al diagnóstico →
            </a>
          </div>
        )}
      </section>

      {/* ── KPIs de la semana ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-tbm-text-secondary uppercase tracking-wider">
            KPIs de la semana
          </h2>
          <a
            href="/dashboard/kpis"
            className="text-xs text-tbm-blue hover:underline"
          >
            Gestionar →
          </a>
        </div>

        {kpis && kpis.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        ) : (
          <div className="tbm-card p-6 text-center border-dashed">
            <p className="text-tbm-text-secondary text-sm">
              Todavía no configuraste los KPIs de esta semana
            </p>
            <a
              href="/dashboard/kpis"
              className="inline-block mt-2 text-tbm-blue text-sm hover:underline"
            >
              Configurar KPIs →
            </a>
          </div>
        )}
      </section>

      {/* ── Estado de rituales ──────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-tbm-text-secondary uppercase tracking-wider mb-3">
          Rituales de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Pre-game",
              href: "/rituales/pregame",
              desc: "Rutina matutina personal",
            },
            {
              label: "Warm Up",
              href: "/rituales/warmup",
              desc: "Inicio del día con el equipo",
            },
            {
              label: "Cool Down",
              href: "/rituales/cooldown",
              desc: "Cierre y Victory Log",
            },
          ].map((r) => (
            <div
              key={r.label}
              className="tbm-card p-4 opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm">
                  {r.label}
                </span>
                <span className="text-xs bg-tbm-border text-tbm-text-muted px-2 py-0.5 rounded-full">
                  Sprint 2
                </span>
              </div>
              <p className="text-xs text-tbm-text-muted">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
