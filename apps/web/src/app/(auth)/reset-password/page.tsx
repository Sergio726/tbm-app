"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) {
        setHasSession(!!user);
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(
          updErr.message?.toLowerCase().includes("password")
            ? "Esa contraseña es muy débil o ya fue usada. Probá con otra."
            : "No pudimos actualizar la contraseña. Probá de nuevo."
        );
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No pudimos actualizar la contraseña. Probá de nuevo.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthCard>
        <div className="p-8 text-center text-tbm-text-secondary">Verificando el link…</div>
      </AuthCard>
    );
  }

  if (!hasSession) {
    return (
      <AuthCard>
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tbm-red/40 bg-tbm-red/10 text-2xl">
            ⏳
          </div>
          <h2 className="text-xl font-bold text-fg">El link expiró o ya se usó</h2>
          <p className="text-sm text-tbm-text-secondary">
            Los links de recuperación sirven una sola vez. Pedí uno nuevo para crear tu contraseña.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm font-medium text-tbm-blue hover:underline"
          >
            Pedir un link nuevo
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-fg">Creá tu nueva contraseña</h2>
          <p className="mt-1 text-sm text-tbm-text-secondary">
            La vas a usar para entrar a la app de ahora en más.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-tbm-text-secondary">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="tbm-input w-full pr-16"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tbm-text-secondary hover:text-fg"
              >
                {showPwd ? "ocultar" : "ver"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-tbm-text-secondary">
              Repetí la contraseña
            </label>
            <input
              type={showPwd ? "text" : "password"}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repetí tu contraseña"
              className="tbm-input w-full"
              autoComplete="new-password"
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
            {loading ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
