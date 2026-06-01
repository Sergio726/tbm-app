"use client";

import { useState } from "react";
import { Send, X, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { inputStyle } from "./primitives";

export function InviteModal({
  companyId,
  invitedBy,
  onClose,
  onDone,
}: {
  companyId: string;
  invitedBy: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function send() {
    if (!email.trim()) {
      setError("Ingresá un email.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const supabase = createBrowserClient();
      const { error: invErr } = await supabase.from("invitations").insert({
        company_id: companyId,
        invited_by: invitedBy,
        email: email.trim(),
        role: "colaborador",
      });
      if (invErr) throw invErr;

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/accept-invite?company=${companyId}`,
        },
      });
      if (otpErr) throw otpErr;

      setSent(true);
      setTimeout(onDone, 1200);
    } catch (e) {
      console.error("Error invitando:", e);
      setError("No se pudo enviar la invitación. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,10,20,0.7)",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "24px 24px 22px",
          borderRadius: 16,
          background: "#0F1B2D",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>
              Invitar colaborador
            </h3>
            <p
              style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 4 }}
            >
              Le llega un email con un link mágico para unirse a tu equipo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div
            className="flex items-center"
            style={{
              gap: 8,
              fontSize: 13.5,
              color: "#34d399",
              padding: "8px 0",
            }}
          >
            <Check size={16} /> Invitación enviada a {email.trim()}.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@empresa.com"
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && send()}
              autoFocus
            />
            {error && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="flex items-center justify-center"
              style={{
                width: "100%",
                marginTop: 14,
                gap: 8,
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: sending ? "default" : "pointer",
              }}
            >
              <Send size={15} /> {sending ? "Enviando…" : "Enviar invitación"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
