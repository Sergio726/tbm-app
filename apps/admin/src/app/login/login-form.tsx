"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        setError("Credenciales inválidas.");
        return;
      }
      // El gate de is_platform_admin vive en el panel; si no sos admin, te saca.
      router.replace("/empresas");
      router.refresh();
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "#fff",
    padding: "11px 13px",
    fontSize: 16,
    marginTop: 6,
  };

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: 14 }}>
      <label style={{ fontSize: 13, color: "var(--muted)" }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
        />
      </label>
      <label style={{ fontSize: 13, color: "var(--muted)" }}>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>
      {error && (
        <div style={{ fontSize: 12.5, color: "#fca5a5" }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={isPending}
        style={{
          marginTop: 4,
          padding: "12px",
          borderRadius: 11,
          background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
          color: "#fff",
          border: "none",
          fontSize: 14.5,
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
