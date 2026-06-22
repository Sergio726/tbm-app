"use client";

import { useState, useTransition } from "react";
import { updateCompanyDetails } from "../../actions";

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada.",
  no_autorizado: "Sin permisos.",
  nombre_requerido: "El nombre de la empresa es obligatorio.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY.",
  email_existe: "Ya existe un usuario con ese email.",
  email_error: "No se pudo cambiar el email.",
};

export function EditCompanyForm({
  companyId,
  initial,
}: {
  companyId: string;
  initial: {
    name: string;
    sector: string;
    liderUserId: string | null;
    liderFullName: string;
    liderCargo: string;
    liderEmail: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial.name);
  const [sector, setSector] = useState(initial.sector);
  const [liderFullName, setLiderFullName] = useState(initial.liderFullName);
  const [liderCargo, setLiderCargo] = useState(initial.liderCargo);
  const [liderEmail, setLiderEmail] = useState(initial.liderEmail);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, start] = useTransition();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={btnGhost}>
        Editar datos
      </button>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await updateCompanyDetails({
        companyId,
        name,
        sector,
        liderUserId: initial.liderUserId,
        liderFullName,
        liderCargo,
        liderEmail,
      });
      if (r.ok) {
        setMsg({ ok: true, text: "Guardado." });
        setOpen(false);
      } else {
        setMsg({ ok: false, text: ERRORS[r.error] ?? r.error });
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: 12 }}>
      <div className="flex" style={{ gap: 12 }}>
        <Field label="Empresa">
          <input style={input} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Sector">
          <input style={input} value={sector} onChange={(e) => setSector(e.target.value)} />
        </Field>
      </div>
      {initial.liderUserId && (
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex" style={{ gap: 12 }}>
            <Field label="Líder">
              <input style={input} value={liderFullName} onChange={(e) => setLiderFullName(e.target.value)} />
            </Field>
            <Field label="Cargo">
              <input style={input} value={liderCargo} onChange={(e) => setLiderCargo(e.target.value)} />
            </Field>
          </div>
          <Field label="Email del líder">
            <input style={input} type="email" value={liderEmail} onChange={(e) => setLiderEmail(e.target.value)} />
          </Field>
        </div>
      )}
      {msg && (
        <p style={{ fontSize: 12, color: msg.ok ? "#34d399" : "#fca5a5", margin: 0 }}>{msg.text}</p>
      )}
      <div className="flex items-center" style={{ gap: 10 }}>
        <button type="submit" disabled={isPending} style={{ ...btnPrimary, opacity: isPending ? 0.6 : 1 }}>
          {isPending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 6, flex: 1 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  color: "#fff",
  padding: "8px 11px",
  fontSize: 13.5,
  width: "100%",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 9,
  background: "rgba(91,138,255,0.2)",
  border: "1px solid rgba(91,138,255,0.4)",
  color: "#9bb8ff",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 9,
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
