import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users, Mountain, LineChart } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { SCORECARD_AREAS, type Scorecard } from "@/types/database";
import { DISC_COLORS, LOS_LEVELS, primaryLetter, normalizeLetters } from "@/lib/disc";
import { CoachingNotes } from "@/components/super-coach/coaching-notes";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ companyId: string }>;
}

/**
 * Panel Super Coach — capa 2 (deep dive por empresa) + capa 3 (notas).
 */
export default async function SuperCoachCompanyPage({ params }: Props) {
  const { companyId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Guard: el coach debe tener esta empresa asignada
  const { data: assignment } = await supabase
    .from("coach_assignments")
    .select("id")
    .eq("coach_id", user.id)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!assignment) redirect("/super-coach");

  const [
    { data: company },
    { data: scorecardRows },
    { data: team },
    { data: rocks },
    { data: notes },
  ] = await Promise.all([
    supabase.from("companies").select("id, name, sector").eq("id", companyId).single(),
    supabase
      .from("scorecards")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, cargo, role, disc_letters, los_level, los_target, kpi_name")
      .eq("company_id", companyId)
      .order("role", { ascending: true }),
    supabase
      .from("rocks")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("coaching_notes")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!company) redirect("/super-coach");

  const history = (scorecardRows ?? []) as Scorecard[];
  const latest = history.at(-1) ?? null;
  const baseline = history.find((s) => s.is_baseline) ?? history[0] ?? null;

  return (
    <div
      className="text-fg"
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth: 1000,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Link
        href="/super-coach"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-fg-muted transition hover:text-fg"
      >
        <ArrowLeft size={14} />
        Panel Super Coach
      </Link>

      <header className="mb-7">
        <h1 className="m-0 text-[26px] font-extrabold" style={{ letterSpacing: -0.5 }}>
          {company.name}
        </h1>
        <p className="mt-1 text-[13px] text-fg-muted">
          {company.sector ? `${company.sector} · ` : ""}
          {(team ?? []).length} {(team ?? []).length === 1 ? "persona" : "personas"} ·{" "}
          {history.length} {history.length === 1 ? "diagnóstico" : "diagnósticos"}
        </p>
      </header>

      {/* Diagnóstico: baseline vs hoy */}
      <Section Icon={LineChart} title="Diagnóstico Organizacional · Día 1 vs hoy" color="#5b8aff">
        {latest ? (
          <div
            className="rounded-2xl border p-4"
            style={{
              background: "var(--elevated)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex flex-col gap-2">
              {SCORECARD_AREAS.map((area) => {
                const v0 = (baseline?.[area.key] as number | null) ?? null;
                const v1 = (latest[area.key] as number | null) ?? null;
                const delta = v0 !== null && v1 !== null ? v1 - v0 : null;
                return (
                  <div key={area.key} className="flex items-center gap-3">
                    <span className="w-[150px] truncate text-[12.5px] text-fg">
                      {area.label}
                    </span>
                    <div
                      className="h-1.5 flex-1 overflow-hidden rounded-full"
                      style={{ background: "var(--elevated)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((v1 ?? 0) / 5) * 100}%`,
                          background: "linear-gradient(90deg, #34d399, #5b8aff)",
                        }}
                      />
                    </div>
                    <span
                      className="w-[90px] text-right text-[12px]"
                      style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace' }}
                    >
                      <span className="text-fg-muted">{v0 ?? "—"}</span>
                      <span className="text-fg-muted"> → </span>
                      <span className="font-bold text-fg">{v1 ?? "—"}</span>
                      {delta !== null && delta !== 0 && (
                        <span
                          className="ml-1 font-bold"
                          style={{ color: delta > 0 ? "#34d399" : "#f87171" }}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Empty>Esta empresa todavía no completó su diagnóstico inicial.</Empty>
        )}
      </Section>

      {/* Equipo */}
      <Section Icon={Users} title="Equipo" color="#fbbf24">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(team ?? []).map((m) => {
            const letter = primaryLetter(m.disc_letters);
            const color = letter ? DISC_COLORS[letter] : "#64748b";
            const los = LOS_LEVELS.find((l) => l.level === (m.los_level ?? 1));
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
                style={{
                  background: "var(--elevated)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-fg"
                  style={{ background: color }}
                >
                  {(m.full_name ?? "?").trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold">
                      {m.full_name ?? "Sin nombre"}
                    </span>
                    {m.role === "arquitecto" && (
                      <span className="rounded border border-[#5b8aff]/35 bg-[#5b8aff]/[0.14] px-1.5 py-px text-[9px] font-bold uppercase text-[#9fb9ff]">
                        Arquitecto
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11.5px] text-fg-muted">
                    {m.cargo ?? "Sin rol"} · N{m.los_level ?? 1} {los?.name ?? ""}
                    {!m.kpi_name && (
                      <span style={{ color: "var(--warn-text)" }}> · sin KPI ⚠</span>
                    )}
                  </div>
                </div>
                <span
                  className="rounded-md border px-1.5 py-0.5 text-[10.5px] font-bold"
                  style={{
                    background: `${color}1c`,
                    borderColor: `${color}3a`,
                    color,
                    fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                  }}
                >
                  {normalizeLetters(m.disc_letters) || "—"}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Rocas */}
      <Section Icon={Mountain} title="Rocas del trimestre" color="#a78bfa">
        {(rocks ?? []).length === 0 ? (
          <Empty>Sin Rocas registradas todavía.</Empty>
        ) : (
          <div className="flex flex-col gap-2.5">
            {(rocks ?? []).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border px-4 py-3"
                style={{
                  background: "var(--elevated)",
                  borderColor:
                    r.status === "active"
                      ? "rgba(167,139,250,0.25)"
                      : "rgba(255,255,255,0.06)",
                  opacity: r.status === "active" ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] font-semibold">{r.title}</span>
                  <span
                    className="text-[12px] font-bold"
                    style={{
                      fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                      color: (r.progress ?? 0) >= 70 ? "#34d399" : (r.progress ?? 0) >= 30 ? "#fbbf24" : "#f87171",
                    }}
                  >
                    {r.progress ?? 0}%
                  </span>
                </div>
                <div
                  className="mt-2 h-1 overflow-hidden rounded-full"
                  style={{ background: "var(--elevated)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.progress ?? 0}%`,
                      background: "linear-gradient(90deg, #a78bfa, #5b8aff)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Capa 3 — Notas de coaching */}
      <CoachingNotes
        companyId={companyId}
        coachId={user.id}
        initialNotes={notes ?? []}
        teamArquitectos={(team ?? [])
          .filter((m) => m.role === "arquitecto")
          .map((m) => m.id)}
      />
    </div>
  );
}

function Section({
  Icon,
  title,
  color,
  children,
}: {
  Icon: typeof Users;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} strokeWidth={1.9} style={{ color }} />
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[1.2px] text-fg-muted">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-dashed p-5 text-center text-[13px] text-fg-muted"
      style={{ borderColor: "var(--border-strong)" }}
    >
      {children}
    </div>
  );
}
