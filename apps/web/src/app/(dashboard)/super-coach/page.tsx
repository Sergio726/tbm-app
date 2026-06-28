import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ArrowRight, Users, Mountain, Zap } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { SCORECARD_AREAS, type Scorecard } from "@/types/database";
import { isoDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

/**
 * Panel Super Coach — capa 1 (CHANGELOG N1).
 * Semáforo general de las empresas alumnas asignadas al coach.
 * Acceso: solo usuarios con filas en coach_assignments.
 */
export default async function SuperCoachPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Guard: sin asignaciones no hay panel
  const { data: assignments } = await supabase
    .from("coach_assignments")
    .select("company_id")
    .eq("coach_id", user.id);
  if (!assignments || assignments.length === 0) redirect("/dashboard");

  const companyIds = assignments.map((a) => a.company_id);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { data: companies },
    { data: scorecards },
    { data: warUps },
    { data: rocks },
    { data: members },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, sector").in("id", companyIds),
    supabase
      .from("scorecards")
      .select("*")
      .in("company_id", companyIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("war_ups")
      .select("company_id, status, war_up_date")
      .in("company_id", companyIds)
      .gte("war_up_date", isoDate(sevenDaysAgo)),
    supabase
      .from("rocks")
      .select("company_id, status, progress")
      .in("company_id", companyIds),
    supabase.from("profiles").select("id, company_id").in("company_id", companyIds),
  ]);

  const rows = (companies ?? []).map((c) => {
    const companyScorecards = (scorecards ?? []).filter(
      (s) => s.company_id === c.id
    ) as Scorecard[];
    const latest = companyScorecards.at(-1) ?? null;
    const vals = latest
      ? SCORECARD_AREAS.map((a) => latest[a.key]).filter(
          (v): v is number => v !== null
        )
      : [];
    const avg = vals.length
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : null;

    const warUpsClosed = (warUps ?? []).filter(
      (w) => w.company_id === c.id && w.status === "closed"
    ).length;

    const companyRocks = (rocks ?? []).filter((r) => r.company_id === c.id);
    const activeRocks = companyRocks.filter((r) => r.status === "active");
    const avgRockProgress = activeRocks.length
      ? Math.round(
          activeRocks.reduce((s, r) => s + (r.progress ?? 0), 0) /
            activeRocks.length
        )
      : null;

    const teamSize = (members ?? []).filter((m) => m.company_id === c.id).length;

    // Semáforo general: scorecard + adherencia + rocas
    const tone =
      avg === null
        ? { color: "#64748b", label: "Sin diagnóstico" }
        : avg < 2.5 || warUpsClosed === 0
          ? { color: "#f87171", label: "Atención urgente" }
          : avg < 3.5 || warUpsClosed < 3
            ? { color: "#fbbf24", label: "En desarrollo" }
            : { color: "#34d399", label: "Saludable" };

    return { company: c, avg, warUpsClosed, activeRocks: activeRocks.length, avgRockProgress, teamSize, tone };
  });

  return (
    <div
      className="text-white"
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.6px] text-[#9fb9ff]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "#5b8aff", boxShadow: "0 0 6px #5b8aff" }}
          />
          Panel Super Coach
        </div>
        <h1
          className="m-0 text-[30px] font-extrabold"
          style={{ letterSpacing: -0.6 }}
        >
          Tus empresas alumnas
        </h1>
        <p className="mt-2 max-w-[640px] text-[13.5px] text-white/55">
          {rows.length} {rows.length === 1 ? "empresa asignada" : "empresas asignadas"} ·
          semáforo general por diagnóstico, adherencia a rituales y Rocas del trimestre.
          Los rituales personales (Pre-game, Cool Down) no son visibles para el coach.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {rows.map(({ company, avg, warUpsClosed, activeRocks, avgRockProgress, teamSize, tone }) => (
          <Link
            key={company.id}
            href={`/super-coach/${company.id}`}
            className="block rounded-2xl border p-5 transition hover:bg-white/[0.03]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
              borderColor: `${tone.color}40`,
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div className="flex flex-wrap items-center gap-5">
              {/* Identidad */}
              <div className="flex min-w-[220px] flex-1 items-center gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
                  style={{
                    background: `${tone.color}1a`,
                    border: `1px solid ${tone.color}40`,
                    color: tone.color,
                  }}
                >
                  {company.name?.trim().charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15.5px] font-bold">
                    {company.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px] text-white/50">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: tone.color, boxShadow: `0 0 6px ${tone.color}` }}
                    />
                    {tone.label}
                    {company.sector && <span>· {company.sector}</span>}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <Metric
                Icon={GraduationCap}
                label="Diagnóstico"
                value={avg !== null ? `${avg.toFixed(1)}/5` : "—"}
                color={tone.color}
              />
              <Metric
                Icon={Zap}
                label="War Ups 7d"
                value={`${warUpsClosed}/5`}
                color="#5b8aff"
              />
              <Metric
                Icon={Mountain}
                label="Rocas activas"
                value={
                  activeRocks > 0
                    ? `${activeRocks} · ${avgRockProgress}%`
                    : "Sin Rocas"
                }
                color="#a78bfa"
              />
              <Metric
                Icon={Users}
                label="Equipo"
                value={`${teamSize}`}
                color="#fbbf24"
              />

              <ArrowRight size={16} className="text-white/65" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({
  Icon,
  label,
  value,
  color,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5" style={{ minWidth: 120 }}>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `${color}1a`, border: `1px solid ${color}33`, color }}
      >
        <Icon size={14} strokeWidth={1.9} />
      </div>
      <div>
        <div className="text-[9.5px] font-bold uppercase tracking-wide text-white/65">
          {label}
        </div>
        <div
          className="text-[13.5px] font-bold text-white"
          style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
