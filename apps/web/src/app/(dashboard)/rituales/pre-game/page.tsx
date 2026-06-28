import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, isoMonday, inSameIsoWeek, humanDate } from "@/lib/dates";
import { ArrowLeft, Sunrise } from "lucide-react";
import PreGameForm from "@/components/rituales/PreGameForm";
import HabitsChecklist from "@/components/rituales/HabitsChecklist";

export default async function PreGamePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");

  const today = isoDate();

  // Pre-game de hoy (si existe)
  const { data: todayPreGame } = await supabase
    .from("pre_games")
    .select("*")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  // Último twenty_mile_march registrado (para evaluar si está bloqueado por la regla 1x/semana)
  const { data: lastMarch } = await supabase
    .from("pre_games")
    .select("twenty_mile_march, log_date")
    .eq("user_id", user.id)
    .not("twenty_mile_march", "is", null)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const marchLockedThisWeek =
    !!lastMarch &&
    inSameIsoWeek(new Date(lastMarch.log_date), new Date(today)) &&
    lastMarch.log_date !== today; // se puede editar el mismo día en que se ingresó

  const currentMarch =
    todayPreGame?.twenty_mile_march ?? lastMarch?.twenty_mile_march ?? "";

  // Últimos 30 días para el calendario de completados
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const { data: history } = await supabase
    .from("pre_games")
    .select("log_date")
    .eq("user_id", user.id)
    .gte("log_date", isoDate(since))
    .order("log_date", { ascending: true });

  const completedDates = new Set((history ?? []).map((h) => h.log_date));

  // Hábitos del Pre-game (A3.1): todos (activos + inactivos para el picker) + los hechos hoy
  const { data: allHabits } = await supabase
    .from("user_habits")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const { data: habitLogsToday } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("log_date", today);

  const doneToday = (habitLogsToday ?? []).map((l) => l.habit_id);

  // Generar la grilla de 30 días (most recent first)
  const days: { date: string; done: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = isoDate(d);
    days.push({
      date: iso,
      done: completedDates.has(iso),
      isToday: iso === today,
    });
  }

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "var(--fg)", maxWidth: 880 }}>
      <Link
        href="/rituales"
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontSize: 13,
          color: "var(--fg-subtle)",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Rituales
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div
          className="flex items-center"
          style={{ gap: 12, marginBottom: 10 }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.28)",
              color: "var(--warn-text)",
            }}
          >
            <Sunrise size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Pre-game
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--fg-subtle)",
              }}
            >
              {humanDate(today)} · Ritual matutino · Solo vos lo ves
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-muted)",
            lineHeight: 1.55,
            maxWidth: 680,
          }}
        >
          Tu rutina personal del Arquitecto. Tres Big Wins personales (no del negocio),
          tu Marcha de 20 Millas (la acción diaria constante) y activación física.
          Es el gate del War Up: tu equipo no puede empezar hasta que vos cerraste el tuyo.
        </p>
      </header>

      <PreGameForm
        userId={user.id}
        companyId={profile.company_id}
        date={today}
        initial={
          todayPreGame ?? {
            id: "",
            user_id: user.id,
            company_id: profile.company_id,
            log_date: today,
            big_win_1: null,
            big_win_2: null,
            big_win_3: null,
            twenty_mile_march: currentMarch || null,
            physical_activation: false,
            notes: null,
            created_at: null,
            updated_at: null,
          }
        }
        marchLockedThisWeek={marchLockedThisWeek}
        marchValue={currentMarch}
      />

      <HabitsChecklist
        userId={user.id}
        companyId={profile.company_id}
        date={today}
        allHabits={allHabits ?? []}
        doneToday={doneToday}
      />

      <section style={{ marginTop: 36 }}>
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            letterSpacing: 1.4,
            marginBottom: 12,
          }}
        >
          Últimos 30 días
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 6,
          }}
        >
          {days
            .slice()
            .reverse()
            .map((d) => (
              <div
                key={d.date}
                title={`${d.date}${d.done ? " · completado" : ""}`}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 6,
                  background: d.done
                    ? "rgba(52,211,153,0.55)"
                    : "rgba(255,255,255,0.04)",
                  border: d.isToday
                    ? "1.5px solid rgba(91,138,255,0.6)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              />
            ))}
        </div>
        <div
          className="flex items-center"
          style={{
            gap: 18,
            marginTop: 12,
            fontSize: 11.5,
            color: "var(--fg-subtle)",
          }}
        >
          <span className="flex items-center" style={{ gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: "rgba(52,211,153,0.55)",
                display: "inline-block",
              }}
            />
            Completado
          </span>
          <span className="flex items-center" style={{ gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                display: "inline-block",
              }}
            />
            Sin registro
          </span>
          <span className="flex items-center" style={{ gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                border: "1.5px solid rgba(91,138,255,0.6)",
                display: "inline-block",
              }}
            />
            Hoy
          </span>
        </div>
      </section>
    </div>
  );
}
