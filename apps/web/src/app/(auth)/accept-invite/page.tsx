"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const companyId = searchParams.get("company");
  const linkError = searchParams.get("error");

  const [fullName, setFullName] = useState("");
  const [cargo, setCargo] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState(
    linkError === "invalid_link"
      ? "Este link de invitación expiró o ya se usó (sirve una sola vez y solo el más reciente). Pedile al Arquitecto que te reenvíe la invitación y abrí el último email que te llegue."
      : ""
  );
  const [companyName, setCompanyName] = useState("");
  const [signOutNeeded, setSignOutNeeded] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    if (companyId) {
      supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .maybeSingle()
        .then(({ data }: { data: { name: string } | null }) => {
          if (data) setCompanyName(data.name);
        });
    }
  }, [companyId, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) {
        setHasSession(!!user);
        setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Ingresá tu nombre completo");
      return;
    }

    if (!companyId) {
      setError("Link de invitación inválido (falta la empresa).");
      return;
    }

    setLoading(true);
    setError("");
    setSignOutNeeded(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "No hay sesión activa. Abrí el link del email en este mismo dispositivo y navegador."
        );
      }

      // 1. No degradar a un Arquitecto / dueño de empresa que abrió el link
      //    en su propia sesión (caso clásico: el invitante clickea el link).
      const { data: me } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", user.id)
        .single();

      const { data: ownedCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (me?.role === "arquitecto" || ownedCompany) {
        setSignOutNeeded(true);
        throw new Error(
          "Esta sesión es de una cuenta de Arquitecto. Cerrá sesión y abrí la invitación con el email al que te invitaron."
        );
      }

      // 2. Verificar que exista una invitación pendiente para ESTE email + empresa.
      const { data: invite } = await supabase
        .from("invitations")
        .select("id, status")
        .eq("company_id", companyId)
        .eq("email", user.email!)
        .maybeSingle();

      if (!invite) {
        throw new Error(
          "No encontramos una invitación para tu email en esta empresa. Pedile al Arquitecto que te reinvite."
        );
      }

      // 3. Vincular perfil → empresa como colaborador (chequeando el error).
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          cargo: cargo.trim() || null,
          company_id: companyId,
          role: "colaborador",
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profErr) throw profErr;

      // 4. Marcar la invitación como aceptada.
      await supabase
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("company_id", companyId)
        .eq("email", user.email!);

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al completar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
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
        <h2 className="text-xl font-bold text-white">Te invitaron al equipo</h2>
        {companyName && (
          <p className="text-tbm-text-secondary text-sm mt-1">
            Vas a unirte a{" "}
            <span className="text-white font-medium">{companyName}</span> en The
            Business Multiplier
          </p>
        )}
      </div>

      {!hasSession && !error && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
          Para continuar, abrí el link que te llegó por email. Si ya lo abriste
          y ves este mensaje, pedile al Arquitecto que te reenvíe la invitación.
        </div>
      )}

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

        {error && (
          <div className="p-3 rounded-lg bg-tbm-red/10 border border-tbm-red/30 text-tbm-red text-sm">
            {error}
          </div>
        )}

        {signOutNeeded && (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-lg border border-tbm-border px-4 py-2 text-sm font-medium text-tbm-text-secondary transition-colors hover:bg-tbm-elevated hover:text-white"
          >
            Cerrar sesión y volver a /login
          </button>
        )}

        <button
          type="submit"
          disabled={loading || signOutNeeded || !hasSession}
          className="tbm-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Completando perfil...
            </span>
          ) : (
            "Unirme al equipo →"
          )}
        </button>
      </form>
    </div>
  );
}
