"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";
import { getInviteInfo, acceptTeamInvite } from "./actions";

export default function AcceptInvitePage() {
  return (
    <AuthCard>
      <Suspense
        fallback={
          <div className="text-center text-tbm-text-secondary p-8">Cargando...</div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </AuthCard>
  );
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [fullName, setFullName] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validación de la invitación al montar (arregla el mensaje engañoso previo).
  const [checking, setChecking] = useState(true);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [fatal, setFatal] = useState(false); // link inválido/expirado/usado → sin form

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!token) {
        if (!cancelled) {
          setError("Falta el token de invitación. Abrí el link completo que te llegó por email.");
          setFatal(true);
          setChecking(false);
        }
        return;
      }
      const info = await getInviteInfo(token);
      if (cancelled) return;
      if (info.ok) {
        setInviteEmail(info.email);
        setCompanyName(info.companyName);
      } else {
        setError(info.error);
        setFatal(true);
      }
      setChecking(false);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!fullName.trim()) {
      setError("Ingresá tu nombre completo");
      return;
    }
    if (password.length < 8) {
      setError("Creá una contraseña de al menos 8 caracteres para poder volver a entrar.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await acceptTeamInvite({
        token,
        fullName: fullName.trim(),
        cargo: cargo.trim(),
        password,
      });

      if (!result.ok) {
        setError(result.error);
        // Links que ya no sirven → ocultar el form.
        if (result.code === "invalid" || result.code === "expired" || result.code === "used") {
          setFatal(true);
        }
        setLoading(false);
        return;
      }

      // Crear la sesión en el browser con la misma contraseña que se acaba de
      // fijar server-side. Navegación DURA (no router.push): Safari/ITP no adjunta
      // las cookies recién escritas a un fetch RSC soft → el middleware no vería
      // la sesión (mismo patrón que login-form).
      const supabase = createBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: result.email,
        password,
      });
      if (signInErr) {
        // La cuenta quedó creada y vinculada; solo falló el auto-login.
        setError(
          "Tu cuenta quedó lista, pero no pudimos iniciar sesión automáticamente. Entrá desde /login con tu email y contraseña."
        );
        setLoading(false);
        return;
      }
      window.location.assign("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al completar el perfil.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center text-tbm-text-secondary p-8">
        Verificando tu invitación…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-tbm-blue/20 border border-tbm-blue/40 flex items-center justify-center mx-auto mb-4 text-2xl">
          🎯
        </div>
        <h2 className="text-xl font-bold text-fg">Te invitaron al equipo</h2>
        {companyName && !fatal && (
          <p className="text-tbm-text-secondary text-sm mt-1">
            Vas a unirte a{" "}
            <span className="text-fg font-medium">{companyName}</span> en The
            Business Multiplier
          </p>
        )}
        {inviteEmail && !fatal && (
          <p className="text-tbm-text-secondary text-xs mt-1">
            Como <span className="text-fg font-medium">{inviteEmail}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-tbm-red/10 border border-tbm-red/30 text-tbm-red text-sm">
          {error}
        </div>
      )}

      {fatal ? (
        <a
          href="/login"
          className="tbm-btn-primary w-full inline-flex items-center justify-center"
        >
          Ir a iniciar sesión
        </a>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
              Tu nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan García"
              className="tbm-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
              Tu cargo o rol
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Gerente de Operaciones"
              className="tbm-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
              Creá tu contraseña
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
            <p className="mt-1.5 text-xs text-tbm-text-secondary">
              La vas a usar para entrar a la app cada vez que vuelvas.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
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

          <button
            type="submit"
            disabled={loading}
            className="tbm-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                Completando perfil...
              </span>
            ) : (
              "Unirme al equipo →"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
