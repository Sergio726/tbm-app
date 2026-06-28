"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Ingresá un email válido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // El email de recovery vuelve por /auth/confirm (type=recovery) → /reset-password.
      await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      });
      // Éxito genérico: no revelamos si la cuenta existe (anti enumeración).
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {sent ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tbm-blue/40 bg-tbm-blue/20 text-2xl">
            ✉️
          </div>
          <h2 className="text-xl font-bold text-fg">Revisá tu email</h2>
          <p className="text-sm text-tbm-text-secondary">
            Si <span className="text-fg">{email.trim().toLowerCase()}</span> tiene una cuenta, te
            enviamos un link para crear una nueva contraseña. Revisá también spam.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-tbm-blue hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-fg">¿Olvidaste tu contraseña?</h2>
            <p className="mt-1 text-sm text-tbm-text-secondary">
              Ingresá tu email y te mandamos un link para crear una nueva.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-tbm-text-secondary">
                Tu email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="tbm-input w-full"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-tbm-red/30 bg-tbm-red/10 p-3 text-sm text-tbm-red">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="tbm-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar link de recuperación"}
            </button>
          </form>

          <p className="text-center text-sm text-tbm-text-secondary">
            <Link href="/login" className="font-medium text-tbm-blue hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      )}
    </AuthCard>
  );
}
