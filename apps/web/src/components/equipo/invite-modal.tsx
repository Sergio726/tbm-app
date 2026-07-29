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
  // El link viene SIEMPRE (salga o no el email) para que el alta nunca dependa
  // de que el correo llegue. `failedReason` vacío = el envío salió bien.
  const [link, setLink] = useState("");
  const [failedReason, setFailedReason] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard bloqueado (contexto no seguro) → el textarea permite copiar a mano */
    }
  }

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

      setLink(result.link);
      if (result.via === "manual") {
        setFailedReason(result.reason ?? "");
      }
      setSent(true);
      // Sin auto-cierre: aunque el email haya salido, dejamos el link a mano
      // para que el Arquitecto pueda compartirlo si no llega.
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
        className="w-full max-w-[420px] rounded-2xl border border-border bg-[var(--surface)] p-6 shadow-2xl"
      >
        <div className="mb-3.5 flex items-start justify-between">
          <div>
            <h3 id="invite-modal-title" className="m-0 text-[17px] font-bold text-fg">
              Invitar colaborador
            </h3>
            <p className="mt-1 text-[12.5px] text-fg-muted">
              Le llega un email con un link para unirse a tu equipo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-fg-muted hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="space-y-3 py-2">
            {failedReason ? (
              <>
                <p className="text-[13px] text-amber-200/90">
                  No pudimos enviar el email automáticamente. Copiá este link y
                  compartilo con {email.trim()} (WhatsApp, etc.):
                </p>
                <p className="text-[11px] leading-relaxed text-red-300/90">
                  Motivo: {failedReason}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[13.5px] text-[#34d399]">
                  <Check size={16} /> Invitación enviada a {email.trim()}.
                </div>
                <p className="text-[12px] leading-relaxed text-fg-muted">
                  ¿No le llega? A veces el correo cae en spam o lo bloquea el
                  filtro de la empresa. Compartile este link directo:
                </p>
              </>
            )}

            <textarea
              readOnly
              value={link}
              rows={3}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Link de invitación"
              className="w-full rounded-lg border border-border bg-black/20 p-2 text-[11px] text-fg"
            />
            <button
              type="button"
              onClick={copyLink}
              className="w-full rounded-[10px] border border-border px-3 py-2.5 text-[13px] font-medium text-fg hover:bg-elevated"
            >
              {copied ? "Copiado ✓" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-[10px] px-3 py-2.5 text-[13px] text-fg-muted hover:text-fg"
            >
              Listo
            </button>
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
              className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-0 px-3 py-3 text-[13.5px] font-semibold text-fg transition disabled:cursor-default"
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
