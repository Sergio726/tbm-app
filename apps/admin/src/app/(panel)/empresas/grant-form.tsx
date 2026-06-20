"use client";

import { useState, useTransition } from "react";
import { grantCredits } from "../actions";

export function GrantForm({ companyId }: { companyId: string }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number.parseInt(amount, 10);
    if (!Number.isFinite(n) || n === 0) return;
    setMsg(null);
    start(async () => {
      const r = await grantCredits(companyId, n, reason);
      if (r.ok) {
        setMsg({ ok: true, text: `Saldo: ${r.balance}` });
        setAmount("");
        setReason("");
      } else {
        setMsg({ ok: false, text: r.error });
      }
    });
  };

  const input: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "#fff",
    padding: "6px 9px",
    fontSize: 12.5,
  };

  return (
    <form onSubmit={submit} className="flex items-center" style={{ gap: 6 }}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="±N"
        style={{ ...input, width: 64 }}
        aria-label="Cantidad de créditos"
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="motivo"
        maxLength={60}
        style={{ ...input, width: 120 }}
        aria-label="Motivo"
      />
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(91,138,255,0.18)",
          border: "1px solid rgba(91,138,255,0.35)",
          color: "#9bb8ff",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {isPending ? "…" : "Cargar"}
      </button>
      {msg && (
        <span style={{ fontSize: 11.5, color: msg.ok ? "#34d399" : "#fca5a5" }}>
          {msg.text}
        </span>
      )}
    </form>
  );
}
