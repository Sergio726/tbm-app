import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import {
  Sunrise,
  Moon,
  Zap,
  Sunset,
  Inbox,
  Settings,
  ArrowRight,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { isoDate } from "@/lib/dates";

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

type RitualCard = {
  href: string;
  label: string;
  description: string;
  timeHint: string;
  Icon: LucideIcon;
  accent: string;
};

const RITUAL_CARDS: RitualCard[] = [
  {
    href: "/rituales/pre-game",
    label: "Pre-game",
    description:
      "Ritual matutino personal. 3 Big Wins propios + Marcha de 20 Millas. Gate del War Up.",
    timeHint: "Mañana — privado",
    Icon: Sunrise,
    accent: "#fbbf24",
  },
  {
    href: "/rituales/5-grandes",
    label: "Los 5 Grandes",
    description:
      "Ritual nocturno del negocio. Definí las 5 prioridades del día siguiente alineadas a tus Rocas.",
    timeHint: "Noche — Arquitecto",
    Icon: Moon,
    accent: "#818cf8",
  },
  {
    href: "/rituales/war-up",
    label: "War Up",
    description:
      "Stand-up digital en vivo. Cada colaborador su QUÉ / POR QUÉ / BLOQUEO. Validás en tiempo real.",
    timeHint: "9:00 — sala en vivo",
    Icon: Zap,
    accent: "#5b8aff",
  },
  {
    href: "/rituales/cool-down",
    label: "Cool Down",
    description:
      "Cierre del día. Victory Log (obligatorio), Reality Check y Cierre de ciclos. El viernes genera el Reporte Semanal.",
    timeHint: "Desde 17:00",
    Icon: Sunset,
    accent: "#fb923c",
  },
  {
    href: "/rituales/parking-lot",
    label: "Parking Lot",
    description:
      "Ítems del War Up o Los 5 Grandes que no están alineados a una Roca. Se aparcan acá, no se pierden.",
    timeHint: "Backlog",
    Icon: Inbox,
    accent: "#94a3b8",
  },
  {
    href: "/rituales/config",
    label: "Configuración",
    description:
      "Modo de rituales (A/B/C/Diario), horarios, recordatorios y zona horaria de la empresa.",
    timeHint: "Solo Arquitecto",
    Icon: Settings,
    accent: "#64748b",
  },
];

export default async function RitualesHubPage() {
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

  // Últimos War Up cerrados — para alerta de 3+ días sin ritual
  const sinceLookup = new Date();
  sinceLookup.setDate(sinceLookup.getDate() - 14);
  const { data: recentWarUps } = await supabase
    .from("war_ups")
    .select("war_up_date, status")
    .eq("company_id", profile.company_id)
    .eq("status", "closed")
    .gte("war_up_date", isoDate(sinceLookup))
    .order("war_up_date", { ascending: false })
    .limit(1);

  const lastWarUpDate = recentWarUps?.[0]?.war_up_date ?? null;
  const daysSinceLastWarUp = lastWarUpDate
    ? Math.floor(
        (new Date(today).getTime() - new Date(lastWarUpDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  const warUpAlert = !lastWarUpDate || (daysSinceLastWarUp ?? 0) >= 3;

  // Estado del día — para badges "hecho hoy"
  const [preGameRes, warUpRes, coolDownRes, los5Res] = await Promise.all([
    supabase
      .from("pre_games")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("war_ups")
      .select("id, status")
      .eq("company_id", profile.company_id)
      .eq("war_up_date", today)
      .maybeSingle(),
    supabase
      .from("cool_downs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("los_5_grandes")
      .select("id")
      .eq("company_id", profile.company_id)
      .eq("for_date", today)
      .maybeSingle(),
  ]);

  const status: Record<string, "done" | "active" | null> = {
    "/rituales/pre-game": preGameRes.data ? "done" : null,
    "/rituales/5-grandes": los5Res.data ? "done" : null,
    "/rituales/war-up":
      warUpRes.data?.status === "active"
        ? "active"
        : warUpRes.data
          ? "done"
          : null,
    "/rituales/cool-down": coolDownRes.data ? "done" : null,
  };

  return (
    <div style={{ padding: "32px 40px", color: "#fff" }}>
      <header style={{ marginBottom: 32 }}>
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 1.4,
            marginBottom: 6,
          }}
        >
          Sprint 2 · Rituales
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          Tu ritmo diario, sin improvisar
        </h1>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", maxWidth: 720 }}>
          El ciclo TBM completo: Pre-game matutino personal → War Up en vivo con el equipo
          → Cool Down al cierre → Los 5 Grandes para preparar mañana. Lo que no encaja
          en una Roca se aparca, no se pierde.
        </p>
      </header>

      {warUpAlert && (
        <div
          className="flex items-center"
          style={{
            gap: 12,
            padding: "14px 18px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(248,113,113,0.04))",
            border: "1px solid rgba(248,113,113,0.32)",
            marginBottom: 22,
          }}
        >
          <AlertTriangle size={18} color="#f87171" />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fca5a5" }}>
              {lastWarUpDate
                ? `Hace ${daysSinceLastWarUp} día${daysSinceLastWarUp === 1 ? "" : "s"} sin War Up`
                : "No hay War Ups registrados en las últimas 2 semanas"}
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
              El ritual diario es lo que hace que el método funcione. Volvé a arrancarlo desde la card del War Up.
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {RITUAL_CARDS.map((card) => {
          const state = status[card.href];
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group"
              style={{
                display: "block",
                padding: "20px 22px",
                borderRadius: 14,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.15s",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 14 }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${card.accent}1f`,
                    border: `1px solid ${card.accent}33`,
                    color: card.accent,
                  }}
                >
                  <card.Icon size={18} strokeWidth={1.6} />
                </div>
                {state === "done" && (
                  <span
                    style={{
                      ...MONO,
                      fontSize: 10.5,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "rgba(52,211,153,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.25)",
                      letterSpacing: 0.5,
                    }}
                  >
                    HECHO HOY
                  </span>
                )}
                {state === "active" && (
                  <span
                    style={{
                      ...MONO,
                      fontSize: 10.5,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "rgba(91,138,255,0.15)",
                      color: "#bcd0ff",
                      border: "1px solid rgba(91,138,255,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    EN VIVO
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: -0.3,
                  marginBottom: 4,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: card.accent,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                {card.timeHint}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {card.description}
              </p>
              <div
                className="flex items-center"
                style={{
                  gap: 6,
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Abrir
                <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
