import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, humanDate } from "@/lib/dates";
import { ArrowLeft, Zap } from "lucide-react";
import WarUpRoom from "@/components/rituales/WarUpRoom";
import type { WarUpEntry } from "@/types/database";

export default async function WarUpPage() {
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
  const isArquitecto = profile.role === "arquitecto";

  // Sesión de hoy (si existe)
  const { data: warUp } = await supabase
    .from("war_ups")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("war_up_date", today)
    .maybeSingle();

  // Entries existentes
  let initialEntries: WarUpEntry[] = [];
  if (warUp) {
    const { data } = await supabase
      .from("war_up_entries")
      .select("*")
      .eq("war_up_id", warUp.id)
      .order("created_at", { ascending: true });
    initialEntries = data ?? [];
  }

  // Profiles del equipo (para mapear user_id → full_name)
  const { data: teamProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("company_id", profile.company_id);

  // Pre-game del Arquitecto (gate del War Up)
  let arquitectoPreGameToday = true;
  if (isArquitecto) {
    const { data: pg } = await supabase
      .from("pre_games")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();
    arquitectoPreGameToday = !!pg;
  } else {
    // Verificar si ALGÚN arquitecto de la empresa hizo Pre-game hoy
    const arquitectoIds = (teamProfiles ?? [])
      .filter((p) => p.role === "arquitecto")
      .map((p) => p.id);
    if (arquitectoIds.length > 0) {
      const { data: anyPG } = await supabase
        .from("pre_games")
        .select("id")
        .in("user_id", arquitectoIds)
        .eq("log_date", today)
        .limit(1);
      arquitectoPreGameToday = (anyPG?.length ?? 0) > 0;
    } else {
      arquitectoPreGameToday = true; // sin arquitecto, no bloqueamos
    }
  }

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "#fff", maxWidth: 980 }}>
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
              background: "rgba(91,138,255,0.12)",
              border: "1px solid rgba(91,138,255,0.28)",
              color: "#5b8aff",
            }}
          >
            <Zap size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              War Up
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {humanDate(today)} · Stand-up digital en vivo
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          Cada colaborador ingresa su QUÉ / POR QUÉ / BLOQUEO. El Arquitecto valida con
          criterio o pide reformular en tiempo real. Lo que no encaja en una Roca va al
          Parking Lot con un click. 15 min como referencia, no es bloqueante.
        </p>
      </header>

      <WarUpRoom
        companyId={profile.company_id}
        userId={user.id}
        isArquitecto={isArquitecto}
        userFullName={profile.full_name}
        today={today}
        initialWarUp={warUp ?? null}
        initialEntries={initialEntries}
        teamProfiles={(teamProfiles ?? []).map((p) => ({
          id: p.id,
          full_name: p.full_name,
          role: p.role,
        }))}
        arquitectoPreGameDone={arquitectoPreGameToday}
      />
    </div>
  );
}
