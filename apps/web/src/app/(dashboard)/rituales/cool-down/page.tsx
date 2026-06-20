import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, isoMonday, isoFriday, humanDate } from "@/lib/dates";
import { ArrowLeft, Sunset, FileText } from "lucide-react";
import CoolDownForm from "@/components/rituales/CoolDownForm";

export default async function CoolDownPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");

  const today = isoDate();
  const now = new Date();
  const isFriday = now.getDay() === 5;
  const isAfter5pm = now.getHours() >= 17;

  // Cool Down de hoy (si existe)
  const { data: todayCoolDown } = await supabase
    .from("cool_downs")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  // Reporte semanal de esta semana (si ya existe)
  const weekStart = isoDate(isoMonday(now));
  const { data: weeklyReport } = await supabase
    .from("weekly_reports")
    .select("id, generated_at, week_start, week_end")
    .eq("company_id", profile.company_id)
    .eq("week_start", weekStart)
    .maybeSingle();

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "#fff", maxWidth: 880 }}>
      <Link
        href="/rituales"
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Rituales
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(251,146,60,0.12)",
              border: "1px solid rgba(251,146,60,0.28)",
              color: "#fb923c",
            }}
          >
            <Sunset size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Cool Down
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {humanDate(today)} · Cierre del día
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            maxWidth: 680,
          }}
        >
          Victory Log obligatorio, Reality Check (hechos, no excusas) y qué queda
          agendado para mañana. {isFriday && (
            <span style={{ color: "#fb923c" }}>
              Hoy es viernes: al cerrar tu Cool Down se genera el Reporte Semanal del equipo.
            </span>
          )}
        </p>
      </header>

      {!isAfter5pm && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(251,146,60,0.06)",
            border: "1px solid rgba(251,146,60,0.20)",
            color: "rgba(252,211,170,0.95)",
            fontSize: 12.5,
            marginBottom: 18,
          }}
        >
          El Cool Down se recomienda al final del día (desde las 17:00). Si querés cerrarlo
          ahora podés hacerlo igual — pero asegurate de tener los hechos del día completos.
        </div>
      )}

      <CoolDownForm
        userId={user.id}
        companyId={profile.company_id}
        date={today}
        isFriday={isFriday}
        initial={todayCoolDown ?? null}
      />

      <section style={{ marginTop: 36 }}>
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 1.4,
            marginBottom: 12,
          }}
        >
          Reporte de esta semana
        </div>

        {weeklyReport ? (
          <Link
            href="/rituales/cool-down/reporte"
            className="flex items-center justify-between"
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(251,146,60,0.04))",
              border: "1px solid rgba(251,146,60,0.28)",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <FileText size={18} color="#fb923c" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  Reporte Semanal · {humanDate(weeklyReport.week_start)} →{" "}
                  {humanDate(weeklyReport.week_end)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  Generado{" "}
                  {weeklyReport.generated_at
                    ? new Date(weeklyReport.generated_at).toLocaleString("es-AR", {
                        weekday: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
              Ver →
            </div>
          </Link>
        ) : (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
            }}
          >
            Todavía no se generó. Se crea automáticamente cuando alguien del equipo
            completa el Cool Down del viernes ({isoDate(isoFriday(now))}).
          </div>
        )}
      </section>
    </div>
  );
}
