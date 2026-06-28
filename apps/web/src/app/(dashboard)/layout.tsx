import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TourProvider } from "@/components/layout/tour-provider";
import { PostHogIdentify } from "@/components/analytics/posthog-identify";
import { DcLauncher } from "@/components/dashboard/dc-launcher";
import { getDcPublicPersona } from "@/lib/dc-persona";
import { redirect } from "next/navigation";

function SuspendedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tbm-bg p-6">
      <div className="max-w-md rounded-2xl border border-border bg-white/[0.03] p-8 text-center">
        <div className="mb-3 text-3xl">⏸️</div>
        <h1 className="mb-2 text-lg font-bold text-fg">Cuenta suspendida</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          El acceso de tu empresa está temporalmente suspendido. Si creés que es un error,
          contactá al equipo de The Business Multiplier para reactivarlo.
        </p>
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Datos del perfil y empresa para el sidebar
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, company_id, companies(name)")
    .eq("id", user.id)
    .single();

  // Tour guiado (S11): query separada con fallback seguro — si la columna
  // tour_completed aún no existe en la BD, solo se omite el tour.
  let tourCompleted = true;
  try {
    const { data: tourRow, error: tourErr } = await supabase
      .from("profiles")
      .select("tour_completed")
      .eq("id", user.id)
      .single();
    if (!tourErr) tourCompleted = tourRow?.tour_completed ?? false;
  } catch {
    /* columna inexistente → sin tour */
  }

  // Guard de suspensión (A2.2): si la empresa del usuario está suspendida, se
  // bloquea el acceso a la app. Query resiliente — si la columna no existe aún, no rompe.
  if (profile?.company_id) {
    try {
      const { data: comp, error: compErr } = await supabase
        .from("companies")
        .select("status")
        .eq("id", profile.company_id)
        .single();
      if (!compErr && comp?.status === "suspended") {
        return <SuspendedScreen />;
      }
    } catch {
      /* columna inexistente → sin bloqueo */
    }
  }

  // Panel Super Coach (S9): visible solo si tiene empresas asignadas.
  // Query resiliente — si la tabla coach_assignments no existe aún, no rompe.
  let isCoach = false;
  try {
    const { count, error: coachErr } = await supabase
      .from("coach_assignments")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", user.id);
    if (!coachErr) isCoach = (count ?? 0) > 0;
  } catch {
    /* tabla inexistente → sin panel */
  }

  const companyName = (profile?.companies as { name: string } | null)?.name;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  const ROLE_LABEL: Record<string, string> = {
    arquitecto: "Arquitecto",
    colaborador: "Colaborador",
    observador: "Observador",
    coach: "Coach",
  };

  // Persona de DC (DC-2): nombre/bienvenida/sugerencias configurables desde el admin.
  const dcPersona = await getDcPublicPersona();

  return (
    <div className="min-h-screen bg-tbm-bg">
      {/* Sidebar fijo */}
      <Sidebar
        userId={user.id}
        companyName={companyName}
        userInitials={initials}
        userName={profile?.full_name ?? undefined}
        userRole={ROLE_LABEL[profile?.role ?? ""] ?? profile?.role ?? undefined}
        isArquitecto={profile?.role === "arquitecto"}
        avatarUrl={profile?.avatar_url ?? undefined}
        isCoach={isCoach}
      />

      {/* Contenido principal */}
      <main
        className="min-h-screen pt-14 md:pt-0"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>

      {/* DC global (DC-1): launcher flotante del asistente en todo el layout.
          Persona configurable desde el admin (DC-2). */}
      <DcLauncher persona={dcPersona} />

      {/* Command Palette global (⌘K / Ctrl+K) */}
      <CommandPalette userRole={profile?.role ?? "colaborador"} userId={user.id} />

      {/* Tour guiado de onboarding (S11) — auto-arranca la primera vez */}
      <TourProvider
        userId={user.id}
        role={profile?.role ?? null}
        tourCompleted={tourCompleted}
      />

      {/* Analítica: identifica al usuario en PostHog (sin PII) */}
      <PostHogIdentify
        userId={user.id}
        role={profile?.role ?? null}
        companyId={profile?.company_id ?? null}
      />
    </div>
  );
}
