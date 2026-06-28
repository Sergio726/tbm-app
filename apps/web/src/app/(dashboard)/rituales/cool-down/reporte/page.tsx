import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, isoMonday, humanDate } from "@/lib/dates";
import { ArrowLeft, Trophy, Zap, Sunrise, Sunset, Target, AlertCircle } from "lucide-react";
import type { WeeklyReportPayload } from "@/lib/rituales/weekly-report";
import type { CSSProperties } from "react";

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

export default async function ReporteSemanalPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");

  const weekStart = isoDate(isoMonday(new Date()));
  const { data: report } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!report) {
    return (
      <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "var(--fg)", maxWidth: 880 }}>
        <Link
          href="/rituales/cool-down"
          className="inline-flex items-center"
          style={{
            gap: 6,
            fontSize: 13,
            color: "var(--fg-subtle)",
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} />
          Cool Down
        </Link>
        <div
          style={{
            padding: 28,
            borderRadius: 14,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--fg-muted)",
            fontSize: 14,
          }}
        >
          El reporte semanal de esta semana todavía no se generó. Se crea automáticamente
          cuando alguien completa el Cool Down del viernes.
        </div>
      </div>
    );
  }

  const payload = report.payload as unknown as WeeklyReportPayload;
  const ritualPct = (n: number, total: number) =>
    total > 0 ? Math.round((n / total) * 100) : 0;

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "var(--fg)", maxWidth: 880 }}>
      <Link
        href="/rituales/cool-down"
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontSize: 13,
          color: "var(--fg-subtle)",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Cool Down
      </Link>

      <header
        className="flex flex-wrap items-end justify-between gap-3"
        style={{ marginBottom: 28 }}
      >
        <div>
          <div
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--fg-subtle)",
              letterSpacing: 1.4,
              marginBottom: 6,
            }}
          >
            Reporte Semanal · Generado automáticamente
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {humanDate(report.week_start)} → {humanDate(report.week_end)}
          </h1>
        </div>
        <Link
          href="/export/semana"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition hover:bg-white/[0.05]"
          style={{
            background: "rgba(91,138,255,0.10)",
            borderColor: "rgba(91,138,255,0.30)",
            color: "#bcd0ff",
            textDecoration: "none",
          }}
        >
          🖨️ Exportar PDF
        </Link>
      </header>

      {/* Ritual completion */}
      <Section title="Adherencia a rituales" icon={<Zap size={16} color="#5b8aff" />}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 12,
          }}
        >
          <RitualStat
            label="Pre-game (Arquitecto)"
            Icon={Sunrise}
            color="#fbbf24"
            value={payload.ritual_completion.pre_game_arquitecto.completed}
            total={payload.ritual_completion.pre_game_arquitecto.days}
            pct={ritualPct(
              payload.ritual_completion.pre_game_arquitecto.completed,
              payload.ritual_completion.pre_game_arquitecto.days
            )}
          />
          <RitualStat
            label="War Up"
            Icon={Zap}
            color="#5b8aff"
            value={payload.ritual_completion.war_up.completed}
            total={payload.ritual_completion.war_up.days}
            pct={ritualPct(
              payload.ritual_completion.war_up.completed,
              payload.ritual_completion.war_up.days
            )}
          />
          <RitualStat
            label="Cool Down"
            Icon={Sunset}
            color="#fb923c"
            value={payload.ritual_completion.cool_down.actual_entries}
            total={payload.ritual_completion.cool_down.expected_entries}
            pct={ritualPct(
              payload.ritual_completion.cool_down.actual_entries,
              payload.ritual_completion.cool_down.expected_entries
            )}
            unit="entradas"
          />
        </div>
      </Section>

      {/* Victories */}
      <Section
        title="Victorias de la semana"
        icon={<Trophy size={16} color="#34d399" />}
      >
        {payload.victories_by_user.length === 0 && (
          <Empty>Nadie registró victorias esta semana.</Empty>
        )}
        <div className="flex flex-col" style={{ gap: 12 }}>
          {payload.victories_by_user.map((v) => (
            <div
              key={v.user_id}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(52,211,153,0.04)",
                border: "1px solid rgba(52,211,153,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#a7f3d0",
                  marginBottom: 8,
                }}
              >
                {v.full_name ?? "Sin nombre"}{" "}
                <span
                  style={{
                    ...MONO,
                    fontWeight: 400,
                    color: "var(--fg-muted)",
                    fontSize: 11,
                    marginLeft: 6,
                  }}
                >
                  {v.days.length} día{v.days.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: "none",
                  fontSize: 13,
                  color: "var(--fg-muted)",
                  lineHeight: 1.55,
                }}
              >
                {v.days.map((d) => (
                  <li
                    key={d.log_date}
                    style={{
                      padding: "4px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        ...MONO,
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginRight: 10,
                      }}
                    >
                      {d.log_date.slice(5)}
                    </span>
                    {d.victory_log}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Los 5 Grandes */}
      <Section
        title="Los 5 Grandes vs. ejecutados"
        icon={<Target size={16} color="#818cf8" />}
      >
        {payload.los_5_grandes.length === 0 && (
          <Empty>No se definieron Los 5 Grandes esta semana.</Empty>
        )}
        <div className="flex flex-col" style={{ gap: 12 }}>
          {payload.los_5_grandes.map((day) => {
            const executedCount = day.items.filter((i) => i.executed).length;
            return (
              <div
                key={day.for_date}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(129,140,248,0.04)",
                  border: "1px solid rgba(129,140,248,0.18)",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: 8 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#c7d2fe",
                    }}
                  >
                    {humanDate(day.for_date)}
                  </div>
                  <div
                    style={{
                      ...MONO,
                      fontSize: 11,
                      color: "rgba(199,210,254,0.7)",
                    }}
                  >
                    {executedCount}/{day.items.length} ejecutadas
                  </div>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 0,
                    listStyle: "none",
                  }}
                >
                  {day.items.map((it) => (
                    <li
                      key={it.position}
                      style={{
                        fontSize: 12.5,
                        padding: "3px 0",
                        color: it.executed ? "#34d399" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <span style={{ ...MONO, marginRight: 8, color: "var(--fg-muted)" }}>
                        {it.position}.
                      </span>
                      {it.executed && "✓ "}
                      {it.title}
                      {it.rock_label && (
                        <span style={{ color: "var(--fg-muted)" }}> · {it.rock_label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Reality checks */}
      <Section
        title="Reality Checks (lo que NO se logró)"
        icon={<AlertCircle size={16} color="#fb923c" />}
      >
        {payload.reality_checks.length === 0 && (
          <Empty>Ningún Reality Check registrado esta semana.</Empty>
        )}
        <div className="flex flex-col" style={{ gap: 8 }}>
          {payload.reality_checks.map((r, i) => (
            <div
              key={`${r.user_id}-${r.log_date}-${i}`}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(251,146,60,0.04)",
                border: "1px solid rgba(251,146,60,0.18)",
                fontSize: 13,
                color: "var(--fg-muted)",
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  ...MONO,
                  color: "var(--fg-muted)",
                  marginBottom: 4,
                }}
              >
                {r.full_name ?? "—"} · {r.log_date.slice(5)}
              </div>
              {r.reality_check}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 30 }}>
      <div
        className="flex items-center"
        style={{ gap: 8, marginBottom: 14 }}
      >
        {icon}
        <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>
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
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.08)",
        color: "var(--fg-subtle)",
        fontSize: 12.5,
      }}
    >
      {children}
    </div>
  );
}

function RitualStat({
  label,
  Icon,
  color,
  value,
  total,
  pct,
  unit,
}: {
  label: string;
  Icon: React.ElementType;
  color: string;
  value: number;
  total: number;
  pct: number;
  unit?: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
        <Icon size={14} color={color} />
        <div style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>{label}</div>
      </div>
      <div
        className="flex items-baseline"
        style={{ gap: 6, marginBottom: 6 }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--fg)" }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--fg-muted)",
          }}
        >
          / {total} {unit ?? "días"}
        </div>
        <div
          style={{
            marginLeft: "auto",
            ...MONO,
            fontSize: 12,
            color,
          }}
        >
          {pct}%
        </div>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
