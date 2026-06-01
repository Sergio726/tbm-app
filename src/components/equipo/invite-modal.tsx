"use client";

import { useState } from "react";
import { Send, X, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { TextInput } from "./primitives";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(5,10,20,0.7)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0F1B2D] p-6 shadow-2xl"
      >
        <div className="mb-3.5 flex items-start justify-between">
          <div>
            <h3 className="m-0 text-[17px] font-bold text-white">
              Invitar colaborador
            </h3>
            <p className="mt-1 text-[12.5px] text-white/50">
              Le llega un email con un link mágico para unirse a tu equipo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="flex items-center gap-2 py-2 text-[13.5px] text-[#34d399]">
            <Check size={16} /> Invitación enviada a {email.trim()}.
          </div>
        ) : (
          <>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@empresa.com"
              onKeyDown={(e) => e.key === "Enter" && send()}
              autoFocus
            />
            {error && (
              <div className="mt-2 text-xs text-red-400">{error}</div>
            )}
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-0 px-3 py-3 text-[13.5px] font-semibold text-white transition disabled:cursor-default"
              style={{
                background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
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
