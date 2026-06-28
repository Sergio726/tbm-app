"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { requestCredits } from "./actions";

const BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 12,
  background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
  boxShadow: "0 8px 22px rgba(91,138,255,0.34), inset 0 1px 0 rgba(255,255,255,0.2)",
  padding: "11px 18px",
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--fg)",
  border: "none",
  cursor: "pointer",
};

const FIELD: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "var(--fg)",
  padding: "9px 11px",
  fontSize: 13,
  outline: "none",
};

export function RequestCreditsButton({ hasPending }: { hasPending: boolean }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(hasPending);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}
      >
        <Check size={15} strokeWidth={2.2} style={{ color: "#34d399" }} />
        <span style={{ fontSize: 12.5, color: "#6ee7b7", lineHeight: 1.45 }}>
          Pedido enviado. Te avisamos cuando carguemos los créditos.
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={BTN}>
        <Mail size={15} strokeWidth={1.9} /> Pedir más créditos
      </button>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const parsed = amount.trim() ? Number(amount) : null;
    const res = await requestCredits({
      amount: parsed != null && Number.isFinite(parsed) ? parsed : null,
      note,
    });
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <label style={{ fontSize: 12, color: "var(--fg-subtle)", display: "block", marginBottom: 5 }}>
          ¿Cuántos créditos? (opcional)
        </label>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ej. 10"
          style={FIELD}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--fg-subtle)", display: "block", marginBottom: 5 }}>
          Nota (opcional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contanos para qué los necesitás…"
          rows={2}
          style={{ ...FIELD, resize: "none" }}
        />
      </div>
      {error && (
        <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.45 }}>{error}</div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={submit} disabled={submitting} style={{ ...BTN, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} strokeWidth={1.9} />}
          Enviar pedido
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "var(--fg-muted)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
