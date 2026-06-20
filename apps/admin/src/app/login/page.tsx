import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
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
          width: "100%",
          maxWidth: 380,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: "var(--accent)" }}>
          TBM · GOD MODE
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 4px" }}>
          Panel de plataforma
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>
          Acceso restringido a administradores de la plataforma.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
