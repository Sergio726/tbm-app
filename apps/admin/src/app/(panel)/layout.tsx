import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
      <header
        className="flex items-center justify-between"
        style={{
          padding: "14px clamp(16px, 4vw, 40px)",
          borderBottom: "1px solid var(--border)",
          gap: 16,
        }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: "var(--accent)" }}>
            TBM · GOD MODE
          </span>
          <nav className="flex items-center" style={{ gap: 14, fontSize: 13.5 }}>
            <Link href="/empresas" style={{ color: "var(--text)" }}>
              Empresas
            </Link>
          </nav>
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{user.email}</span>
      </header>
      <main style={{ padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) 60px", maxWidth: 1200, margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
