"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCoachToCompany, removeCoachFromCompany } from "../actions";

export type CoachRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  companies: { companyId: string; name: string }[];
};

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada.",
  no_autorizado: "Sin permisos.",
  email_requerido: "Ingresá un email.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY.",
  email_existe: "Ese email ya está registrado con otro rol.",
  create_user_error: "No se pudo crear el coach.",
  assign_error: "No se pudo asignar el coach.",
};

export function CoachesManager({
  coaches,
  companies,
}: {
  coaches: CoachRow[];
  companies: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [creds, setCreds] = useState<{ email: string; tempPassword: string } | null>(null);
  const [isPending, start] = useTransition();

  const assign = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setCreds(null);
    start(async () => {
      const r = await addCoachToCompany({ companyId, fullName, email });
      if (r.ok) {
        if (r.created && r.tempPassword) setCreds({ email: r.email, tempPassword: r.tempPassword });
        setFullName("");
        setEmail("");
        router.refresh();
      } else {
        setErr(ERRORS[r.error] ?? r.error);
      }
    });
  };

  const remove = (cId: string, coachId: string) => {
    if (!confirm("¿Quitar este coach de la empresa?")) return;
    start(async () => {
      const r = await removeCoachFromCompany(cId, coachId);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col" style={{ gap: 22 }}>
      {/* Asignar coach */}
      <div className="adm-card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 12px" }}>Asignar coach a una empresa</h2>
        <form onSubmit={assign} className="flex flex-wrap items-end" style={{ gap: 10 }}>
          <label className="flex flex-col" style={{ gap: 5, minWidth: 180, flex: 1 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Empresa</span>
            <select className="adm-input" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
              {companies.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#111827" }}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col" style={{ gap: 5, flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Nombre</span>
            <input className="adm-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Coach" />
          </label>
          <label className="flex flex-col" style={{ gap: 5, flex: 1.4, minWidth: 180 }}>
            <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Email *</span>
            <input className="adm-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@tbm.com" />
          </label>
          <button type="submit" disabled={isPending || !companyId} className="adm-btn adm-btn-primary">
            {isPending ? "…" : "Asignar"}
          </button>
        </form>
        {err && <p style={{ fontSize: 12, color: "#fca5a5", margin: "10px 0 0" }}>{err}</p>}
        {creds && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(52,211,153,0.4)",
              borderRadius: 10,
              background: "rgba(52,211,153,0.07)",
              padding: 12,
              fontFamily: "monospace",
              fontSize: 12.5,
            }}
          >
            <div style={{ marginBottom: 4, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              Coach creado — compartí estas credenciales (no se vuelven a mostrar):
            </div>
            <div>Email: {creds.email}</div>
            <div>Contraseña: {creds.tempPassword}</div>
          </div>
        )}
      </div>

      {/* Listado */}
      {coaches.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Todavía no hay coaches.</p>
      ) : (
        <div className="flex flex-col" style={{ gap: 12 }}>
          {coaches.map((c) => (
            <div key={c.id} className="adm-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.full_name || "Sin nombre"}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>{c.email}</div>
              {c.companies.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--faint)" }}>Sin empresas asignadas.</span>
              ) : (
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {c.companies.map((co) => (
                    <span
                      key={co.companyId}
                      className="flex items-center"
                      style={{
                        gap: 7,
                        padding: "5px 8px 5px 11px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        fontSize: 12.5,
                      }}
                    >
                      {co.name}
                      <button
                        type="button"
                        onClick={() => remove(co.companyId, c.id)}
                        disabled={isPending}
                        aria-label={`Quitar de ${co.name}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--faint)",
                          cursor: "pointer",
                          fontSize: 14,
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
