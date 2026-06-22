"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createLiderAndCompany } from "../../actions";

type Creds = { email: string; tempPassword: string; companyId: string };

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada. Volvé a entrar.",
  no_autorizado: "No tenés permisos de plataforma.",
  datos_incompletos: "Completá nombre, email y empresa.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.",
  email_existe: "Ya existe un usuario con ese email.",
  create_user_error: "No se pudo crear el usuario.",
  company_error: "No se pudo crear la empresa.",
};

export function CrearLiderForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cargo, setCargo] = useState("");
  const [credits, setCredits] = useState("25");
  const [err, setErr] = useState<string | null>(null);
  const [creds, setCreds] = useState<Creds | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const initialCredits = Number.parseInt(credits, 10);
    start(async () => {
      const r = await createLiderAndCompany({
        fullName,
        email,
        companyName,
        cargo: cargo || undefined,
        initialCredits: Number.isFinite(initialCredits) ? initialCredits : 0,
      });
      if (r.ok) {
        setCreds({ email: r.email, tempPassword: r.tempPassword, companyId: r.companyId });
      } else {
        setErr(ERRORS[r.error] ?? r.error);
      }
    });
  };

  if (creds) {
    const block = `Email: ${creds.email}\nContraseña temporal: ${creds.tempPassword}`;
    return (
      <div
        style={{
          border: "1px solid rgba(52,211,153,0.4)",
          borderRadius: 14,
          background: "rgba(52,211,153,0.07)",
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>✓ Empresa creada</h2>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 16px" }}>
          Compartí estas credenciales de forma segura con el piloto. <strong>No se vuelven a
          mostrar.</strong> El líder entra a la web y cambia la contraseña en Mi Cuenta.
        </p>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.7,
            wordBreak: "break-all",
          }}
        >
          <div>
            <span style={{ color: "var(--muted)" }}>Email: </span>
            {creds.email}
          </div>
          <div>
            <span style={{ color: "var(--muted)" }}>Contraseña: </span>
            {creds.tempPassword}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(block).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            style={btnPrimary}
          >
            {copied ? "✓ Copiado" : "Copiar credenciales"}
          </button>
          <Link href="/empresas" style={{ ...btnGhost, textDecoration: "none" }}>
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: 14 }}>
      <Field label="Nombre del líder *">
        <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ej: Ana Pérez" />
      </Field>
      <Field label="Email *">
        <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ana@empresa.com" />
      </Field>
      <Field label="Nombre de la empresa *">
        <input style={input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Ej: Acme S.A." />
      </Field>
      <div className="flex" style={{ gap: 14 }}>
        <Field label="Cargo (opcional)">
          <input style={input} value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ej: CEO" />
        </Field>
        <Field label="Créditos iniciales">
          <input style={{ ...input, width: 110 }} type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} />
        </Field>
      </div>

      {err && <p style={{ fontSize: 12.5, color: "#fca5a5", margin: 0 }}>{err}</p>}

      <div style={{ marginTop: 6 }}>
        <button type="submit" disabled={isPending} style={{ ...btnPrimary, opacity: isPending ? 0.6 : 1 }}>
          {isPending ? "Creando…" : "Crear líder + empresa"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 6, flex: 1 }}>
      <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  color: "#fff",
  padding: "9px 12px",
  fontSize: 13.5,
  width: "100%",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "rgba(91,138,255,0.2)",
  border: "1px solid rgba(91,138,255,0.4)",
  color: "#9bb8ff",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  fontSize: 13.5,
  fontWeight: 600,
};
