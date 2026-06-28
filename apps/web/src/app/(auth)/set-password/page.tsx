"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";

/**
 * Gate global de contraseña temporal. Cualquier usuario con
 * user_metadata.must_change_password === true es redirigido acá por el middleware
 * (arquitecto creado desde el admin, coach, etc.) y no puede usar la app hasta
 * definir su propia contraseña. Reemplaza al gate que vivía solo en /onboarding.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

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
      const { error: pwdErr } = await supabase.auth.updateUser({ password });
      if (pwdErr) {
        setError(
          pwdErr.message?.toLowerCase().includes("password")
            ? "Esa contraseña es muy débil o ya fue usada. Probá con otra."
            : "No pudimos guardar la contraseña. Probá de nuevo."
        );
        setLoading(false);
        return;
      }
      // Limpiar el flag → el middleware deja de redirigir acá.
      await supabase.auth.updateUser({ data: { must_change_password: false } });
      // El middleware/layout rutea según rol (arquitecto→onboarding, coach→super-coach, etc.).
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("No pudimos guardar la contraseña. Probá de nuevo.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthCard>
        <div className="p-8 text-center text-tbm-text-secondary">Un momento…</div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-tbm-blue/40 bg-tbm-blue/20 text-2xl">
            🔐
          </div>
          <h2 className="text-xl font-bold text-fg">Creá tu contraseña</h2>
          <p className="mt-1 text-sm text-tbm-text-secondary">
            Entraste con una contraseña temporal. Definí una propia para asegurar tu cuenta.
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
            {loading ? "Guardando…" : "Guardar y continuar"}
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
