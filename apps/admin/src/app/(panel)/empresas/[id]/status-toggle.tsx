"use client";

import { useState, useTransition } from "react";
import { setCompanyStatus } from "../../actions";

export function StatusToggle({
  companyId,
  initialStatus,
}: {
  companyId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [err, setErr] = useState<string | null>(null);
  const [isPending, start] = useTransition();
  const suspended = status === "suspended";

  const toggle = () => {
    if (!suspended && !confirm("¿Suspender esta empresa? Sus usuarios no podrán usar la app.")) {
      return;
    }
    setErr(null);
    start(async () => {
      const r = await setCompanyStatus(companyId, !suspended);
      if (r.ok) setStatus(r.status);
      else setErr(r.error);
    });
  };

  return (
    <div className="flex items-center" style={{ gap: 10 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          padding: "3px 9px",
          borderRadius: 999,
          color: suspended ? "#fca5a5" : "#34d399",
          background: suspended ? "rgba(248,113,113,0.14)" : "rgba(52,211,153,0.14)",
          border: `1px solid ${suspended ? "rgba(248,113,113,0.35)" : "rgba(52,211,153,0.35)"}`,
        }}
      >
        {suspended ? "Suspendida" : "Activa"}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        style={{
          padding: "6px 12px",
          borderRadius: 9,
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "…" : suspended ? "Reactivar" : "Suspender"}
      </button>
      {err && <span style={{ fontSize: 11.5, color: "#fca5a5" }}>{err}</span>}
    </div>
  );
}
