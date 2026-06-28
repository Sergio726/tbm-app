import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft, Settings, ShieldAlert } from "lucide-react";
import RitualConfigForm from "@/components/rituales/RitualConfigForm";

export default async function RitualConfigPage() {
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

  const isArquitecto = profile.role === "arquitecto";

  const { data: existing } = await supabase
    .from("ritual_configs")
    .select("*")
    .eq("company_id", profile.company_id)
    .maybeSingle();

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "var(--fg)", maxWidth: 760 }}>
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
        <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(100,116,139,0.12)",
              border: "1px solid rgba(100,116,139,0.28)",
              color: "#cbd5e1",
            }}
          >
            <Settings size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Configuración de rituales
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--fg-subtle)",
              }}
            >
              Modo de ejecución, horarios y zona horaria de la empresa
            </div>
          </div>
        </div>
      </header>

      {!isArquitecto && (
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
            color: "#fcd34d",
            fontSize: 13.5,
            marginBottom: 18,
          }}
        >
          <ShieldAlert size={16} />
          Modo lectura. Solo el Arquitecto puede modificar la configuración.
        </div>
      )}

      <RitualConfigForm
        companyId={profile.company_id}
        userId={user.id}
        canEdit={isArquitecto}
        initial={
          existing ?? {
            company_id: profile.company_id,
            mode: "daily",
            war_up_deadline: "09:00:00",
            cool_down_start: "17:00:00",
            pre_game_reminder: "07:00:00",
            los_5_grandes_reminder: "20:00:00",
            timezone: "America/Bogota",
            updated_by: null,
            created_at: null,
            updated_at: null,
          }
        }
      />
    </div>
  );
}
