"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth/auth-card";
import { checkPendingInvite } from "@/app/(auth)/accept-invite/actions";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    // Si el email ya tiene una invitación de equipo pendiente, mandarlo a
    // aceptarla (unirse como colaborador) en vez de crear una empresa nueva.
    // Evita invitaciones huérfanas y que el invitado nazca como Arquitecto.
    const pendingInvite = await checkPendingInvite(form.email);
    if (pendingInvite) {
      router.push(`/accept-invite?token=${encodeURIComponent(pendingInvite.token)}`);
      return;
    }

    const supabase = createClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
      },
    });

    if (authError || !authData.user) {
      setError(
        authError?.message === "User already registered"
          ? "Ya existe una cuenta con ese email."
          : "Error al crear la cuenta. Intenta de nuevo."
      );
      setLoading(false);
      return;
    }

    // 2. Crear la empresa
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: form.companyName,
        owner_id: authData.user.id,
      })
      .select()
      .single();

    if (companyError || !company) {
      setError("Error al crear la empresa. Contactá soporte.");
      setLoading(false);
      return;
    }

    // 3. Vincular profile → empresa (el trigger ya creó el profile)
    await supabase
      .from("profiles")
      .update({
        company_id: company.id,
        full_name: form.fullName,
        role: "arquitecto",
      })
      .eq("id", authData.user.id);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard>
    <div className="tbm-card p-8 animate-fade-in">
      <h1 className="text-xl font-semibold text-tbm-text-primary mb-1">
        Crear cuenta
      </h1>
      <p className="text-tbm-text-secondary text-sm mb-6">
        Configurá tu Sistema Operativo de Negocios
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
              Tu nombre
            </label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Juan García"
              required
              className="tbm-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
              Nombre de tu empresa
            </label>
            <input
              name="companyName"
              type="text"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Mi Empresa S.A."
              required
              className="tbm-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
            required
            className="tbm-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">
            Contraseña{" "}
            <span className="text-tbm-text-muted font-normal">(mín. 8 caracteres)</span>
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="tbm-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tbm-text-muted hover:text-tbm-text-secondary transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-semaforo-rojo-bg border border-tbm-red/30 text-tbm-red text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tbm-btn-primary w-full mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creando cuenta...
            </span>
          ) : (
            "Crear cuenta gratis"
          )}
        </button>
      </form>

      <p className="text-center text-tbm-text-muted text-sm mt-6">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-tbm-blue-light hover:underline font-medium">
          Iniciar sesión
        </Link>
      </p>
    </div>
    </AuthCard>
  );
}
