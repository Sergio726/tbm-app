import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
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
    .select("full_name, company_id, companies(name)")
    .eq("id", user.id)
    .single();

  const companyName = (profile?.companies as { name: string } | null)?.name;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  return (
    <div className="min-h-screen bg-tbm-bg">
      {/* Sidebar fijo */}
      <Sidebar
        companyName={companyName}
        userInitials={initials}
      />

      {/* Contenido principal */}
      <main
        className="min-h-screen"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
    </div>
  );
}
