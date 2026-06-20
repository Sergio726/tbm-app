"use client";

import { useEffect, useState } from "react";
import { Send, X, Check } from "lucide-react";
import { sendTeamInvite } from "@/app/(dashboard)/equipo/actions";
import { TextInput } from "./primitives";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteModal({
  companyId,
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
  const [manualLink, setManualLink] = useState("");

  // Cerrar con Escape (accesibilidad de modal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send() {
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError("Ingresá un email válido.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const result = await sendTeamInvite({
        email: value,
        companyId,
        origin: window.location.origin,
      });
      if (!result.ok) throw new Error(result.error);

      if (result.via === "manual") {
        setManualLink(result.link);
      }
      setSent(true);
      if (result.via === "email") {
        setTimeout(onDone, 1200);
      }
    } catch (e) {
      console.error("Error invitando:", e);
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo enviar la invitación. Revisá el email e intentá de nuevo."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(5,10,20,0.7)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0F1B2D] p-6 shadow-2xl"
      >
        <div className="mb-3.5 flex items-start justify-between">
          <div>
            <h3 id="invite-modal-title" className="m-0 text-[17px] font-bold text-white">
              Invitar colaborador
            </h3>
            <p className="mt-1 text-[12.5px] text-white/50">
              Le llega un email con un link para unirse a tu equipo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          manualLink ? (
            <div className="space-y-3 py-2">
              <p className="text-[13px] text-amber-200/90">
                No pudimos enviar el email automáticamente. Copiá este link y
                compartilo con {email.trim()} (WhatsApp, etc.):
              </p>
              <textarea
                readOnly
                value={manualLink}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/20 p-2 text-[11px] text-white/80"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(manualLink)}
                className="w-full rounded-[10px] border border-white/15 px-3 py-2.5 text-[13px] font-medium text-white hover:bg-white/5"
              >
                Copiar link
              </button>
              <button
                type="button"
                onClick={onDone}
                className="w-full rounded-[10px] px-3 py-2.5 text-[13px] text-white/50 hover:text-white"
              >
                Listo
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2 text-[13.5px] text-[#34d399]">
              <Check size={16} /> Invitación enviada a {email.trim()}.
            </div>
          )
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
