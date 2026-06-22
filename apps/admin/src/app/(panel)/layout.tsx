import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Guard de plataforma: solo platform_admins entran al panel.
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            textAlign: "center",
            background: "var(--panel)",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>
            Acceso denegado
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
            Tu cuenta no es administradora de la plataforma. Si creés que es un
            error, contactá al equipo.
          </p>
          <form action="/login" style={{ marginTop: 16 }}>
            <Link
              href="/login"
              style={{ fontSize: 13, color: "var(--accent)" }}
            >
              Volver al login
            </Link>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <AdminSidebar userEmail={user.email ?? null} />
      <main className="md:ml-[var(--sidebar-w)] pt-[72px] md:pt-10 px-5 md:px-12 pb-16">
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
