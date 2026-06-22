"use client";

import { useState, useTransition } from "react";
import { addCoachToCompany, removeCoachFromCompany } from "../../actions";

type Coach = { id: string; full_name: string | null; email: string | null };

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada.",
  no_autorizado: "Sin permisos.",
  email_requerido: "Ingresá un email.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY.",
  email_existe: "Ese email ya está registrado con otro rol.",
  create_user_error: "No se pudo crear el coach.",
  assign_error: "No se pudo asignar el coach.",
};

export function CoachesPanel({
  companyId,
  initialCoaches,
}: {
  companyId: string;
  initialCoaches: Coach[];
}) {
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [creds, setCreds] = useState<{ email: string; tempPassword: string } | null>(null);
  const [isPending, start] = useTransition();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setCreds(null);
    start(async () => {
      const r = await addCoachToCompany({ companyId, fullName, email });
      if (r.ok) {
        setCoaches((prev) =>
          prev.some((c) => c.email === r.email)
            ? prev
            : [...prev, { id: `tmp-${r.email}`, full_name: fullName || null, email: r.email }]
        );
        if (r.created && r.tempPassword) setCreds({ email: r.email, tempPassword: r.tempPassword });
        setFullName("");
        setEmail("");
      } else {
        setErr(ERRORS[r.error] ?? r.error);
      }
    });
  };

  const remove = (coachId: string) => {
    if (!confirm("¿Quitar este coach de la empresa?")) return;
    start(async () => {
      const r = await removeCoachFromCompany(companyId, coachId);
      if (r.ok) setCoaches((prev) => prev.filter((c) => c.id !== coachId));
    });
  };

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {coaches.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin coaches asignados.</p>
      ) : (
        <ul className="flex flex-col" style={{ gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
          {coaches.map((c) => (
            <li key={c.id} className="flex items-center justify-between" style={{ gap: 12, fontSize: 13.5 }}>
              <span>
                <strong>{c.full_name || "Sin nombre"}</strong>
                <span style={{ color: "var(--muted)" }}> · {c.email}</span>
              </span>
              {!c.id.startsWith("tmp-") && (
                <button type="button" onClick={() => remove(c.id)} disabled={isPending} style={btnGhost}>
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {creds && (
        <div
          style={{
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

      <form onSubmit={add} className="flex items-end" style={{ gap: 8 }}>
        <label className="flex flex-col" style={{ gap: 5, flex: 1 }}>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Nombre</span>
          <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Coach" />
        </label>
        <label className="flex flex-col" style={{ gap: 5, flex: 1.4 }}>
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>Email *</span>
          <input style={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@tbm.com" />
        </label>
        <button type="submit" disabled={isPending} style={{ ...btnPrimary, opacity: isPending ? 0.6 : 1 }}>
          {isPending ? "…" : "Asignar coach"}
        </button>
      </form>
      {err && <p style={{ fontSize: 12, color: "#fca5a5", margin: 0 }}>{err}</p>}
    </div>
  );
}

const input: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  color: "#fff",
  padding: "8px 11px",
  fontSize: 13,
  width: "100%",
};
const btnPrimary: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: 9,
  background: "rgba(91,138,255,0.2)",
  border: "1px solid rgba(91,138,255,0.4)",
  color: "#9bb8ff",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const btnGhost: React.CSSProperties = {
  padding: "5px 11px",
  borderRadius: 8,
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
