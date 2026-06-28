import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Panel } from "@/components/equipo/primitives";
import { LOST_DIMENSIONS, type LostDimension } from "@/lib/lost";
import { Crown, Cog, Layers, Clock, ArrowUpRight, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const LETTER_ICON: Record<LostDimension["letter"], LucideIcon> = {
  L: Crown,
  O: Cog,
  S: Layers,
  T: Clock,
};

export default async function SistemaLostPage() {
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

  // ── "¿Dónde estás?": día del ciclo 90D desde el scorecard baseline ──
  const { data: scs } = await supabase
    .from("scorecards")
    .select("created_at, is_baseline")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: true });
  const baseline = (scs ?? []).find((s) => s.is_baseline) ?? (scs ?? [])[0] ?? null;

  let dayInCycle: number | null = null;
  let cycleNumber = 1;
  if (baseline?.created_at) {
    const start = new Date(baseline.created_at).getTime();
    const dayInProgram = Math.floor((Date.now() - start) / 86_400_000) + 1;
    if (dayInProgram >= 1) {
      dayInCycle = ((dayInProgram - 1) % 90) + 1;
      cycleNumber = Math.floor((dayInProgram - 1) / 90) + 1;
    }
  }

  return (
    <div
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        color: "var(--fg)",
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 26 }}>
        <div
          className="uppercase"
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.4,
            color: "#9bb8ff",
            background: "rgba(91,138,255,0.10)",
            border: "1px solid rgba(91,138,255,0.25)",
            borderRadius: 999,
            padding: "4px 11px",
            marginBottom: 12,
          }}
        >
          Sistema
        </div>
        <h1
          style={{ fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 800, letterSpacing: -0.6, margin: 0 }}
        >
          El Sistema LOST
        </h1>
        <p
          style={{
            fontSize: 14.5,
            color: "var(--fg-muted)",
            lineHeight: 1.6,
            maxWidth: 720,
            marginTop: 10,
          }}
        >
          LOST es el mapa para dejar de estar <em>perdido</em>: las <strong>4 dimensiones</strong>{" "}
          que multiplican tu negocio. Cada módulo del sistema vive dentro de una de ellas —
          acá ves dónde encaja cada cosa y dónde estás parado hoy.
        </p>
        {dayInCycle != null && (
          <div
            className="flex items-center"
            style={{
              gap: 8,
              marginTop: 14,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#9bb8ff",
              background: "rgba(91,138,255,0.10)",
              border: "1px solid rgba(91,138,255,0.25)",
              borderRadius: 999,
              padding: "6px 13px",
              width: "fit-content",
            }}
          >
            📅 Día {dayInCycle} de 90 · Ciclo {cycleNumber}
          </div>
        )}
      </header>

      {/* Tira LOST — banner de orientación */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 26,
        }}
      >
        {LOST_DIMENSIONS.map((d) => (
          <div
            key={d.letter}
            className="flex flex-col items-center justify-center"
            style={{
              padding: "14px 6px",
              borderRadius: 14,
              background: `${d.color}14`,
              border: `1px solid ${d.color}38`,
            }}
          >
            <span style={{ fontSize: "clamp(26px, 6vw, 38px)", fontWeight: 800, color: d.color, lineHeight: 1 }}>
              {d.letter}
            </span>
            <span
              className="uppercase"
              style={{
                fontSize: "clamp(8px, 1.8vw, 10px)",
                fontWeight: 600,
                letterSpacing: 0.6,
                color: "var(--fg-subtle)",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {d.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Las 4 dimensiones en detalle */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 16,
        }}
      >
        {LOST_DIMENSIONS.map((d) => {
          const Icon = LETTER_ICON[d.letter];
          return (
            <Panel
              key={d.letter}
              icon={<Icon size={18} strokeWidth={1.9} />}
              iconColor={d.color}
              accent={d.color}
              title={`${d.letter} · ${d.name}`}
              sub={d.essence}
            >
              <div className="flex flex-col" style={{ gap: 8, marginTop: 2 }}>
                {d.modules.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="flex items-center justify-between"
                    style={{
                      padding: "10px 13px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--fg)",
                      fontSize: 13.5,
                      fontWeight: 500,
                    }}
                  >
                    {m.label}
                    <ArrowUpRight size={15} style={{ color: d.color, flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 12.5,
          color: "var(--fg-muted)",
          marginTop: 22,
          textAlign: "center",
        }}
      >
        Tu progreso vive dentro de cada módulo — este mapa te ubica en el sistema.
      </p>
    </div>
  );
}
