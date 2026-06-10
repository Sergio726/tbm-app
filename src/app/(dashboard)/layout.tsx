import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TourProvider } from "@/components/layout/tour-provider";
import { redirect } from "next/navigation";

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
  };

  return (
    <div className="min-h-screen bg-tbm-bg">
      {/* Sidebar fijo */}
      <Sidebar
        companyName={companyName}
        userInitials={initials}
        userName={profile?.full_name ?? undefined}
        userRole={ROLE_LABEL[profile?.role ?? ""] ?? profile?.role ?? undefined}
        avatarUrl={profile?.avatar_url ?? undefined}
      />

      {/* Contenido principal */}
      <main
        className="min-h-screen"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>

      {/* Command Palette global (⌘K / Ctrl+K) */}
      <CommandPalette userRole={profile?.role ?? "colaborador"} />

      {/* Tour guiado de onboarding (S11) — auto-arranca la primera vez */}
      <TourProvider
        userId={user.id}
        role={profile?.role ?? null}
        tourCompleted={tourCompleted}
      />
    </div>
  );
}
