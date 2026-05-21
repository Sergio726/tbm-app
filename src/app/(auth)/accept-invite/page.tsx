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

  const [fullName, setFullName] = useState("");
  const [cargo, setCargo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (companyId) {
      supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single()
        .then(({ data }: { data: { name: string } | null }) => {
          if (data) setCompanyName(data.name);
        });
    }
  }, [companyId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Ingresá tu nombre completo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No hay sesión activa. Revisá el link del email.");

      // Actualizar perfil con datos personales + vincular empresa
      await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          company_id: companyId!,
          role: "colaborador",
          onboarding_completed: true,
        })
        .eq("id", user.id);

      // Marcar la invitación como aceptada
      await supabase
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("company_id", companyId!)
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

        <button
          type="submit"
          disabled={loading}
          className="tbm-btn-primary w-full"
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
