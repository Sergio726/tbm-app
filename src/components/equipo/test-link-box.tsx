"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Trophy,
  Link2,
  Copy,
  Check,
  RotateCcw,
  Mail,
  Send,
} from "lucide-react";
import { TextInput } from "./primitives";
import { sendDiscLinkEmail } from "@/app/(dashboard)/equipo/actions";

/**
 * Test DISC: callout cuando está completado y generador/copia/envío de link cuando no.
 */
export function TestLinkBox({
  token,
  status,
  generating,
  onGenerate,
  defaultEmail,
  memberName,
}: {
  token: string | null;
  status: string | null;
  generating: boolean;
  onGenerate: () => void;
  defaultEmail?: string;
  memberName?: string;
}) {
  const completed = status === "completado";
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");
  const [sendErr, setSendErr] = useState("");

  // Mantener el email precargado en sync al cambiar de miembro.
  useEffect(() => {
    setEmail(defaultEmail ?? "");
    setSendMsg("");
    setSendErr("");
  }, [defaultEmail, token]);

  const url =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/disc/${token}`
      : token
        ? `/disc/${token}`
        : "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function sendByEmail() {
    if (!url || sending) return;
    setSending(true);
    setSendErr("");
    setSendMsg("");
    const res = await sendDiscLinkEmail({
      link: url,
      to: email.trim(),
      memberName: memberName ?? "",
    });
    setSending(false);
    if (res.ok) {
      setSendMsg(`Enviado a ${email.trim()} ✓`);
    } else {
      setSendErr(res.error);
    }
  }

  if (completed) {
    return (
      <div className="mb-5 rounded-xl border border-[#5b8aff]/[0.28] bg-[#5b8aff]/[0.08] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-[#5b8aff]/20 text-[#9fb9ff]">
            <CheckCircle2 size={17} strokeWidth={1.9} />
          </div>
          <div>
            <div className="mb-0.5 text-[13px] font-bold text-[#9fb9ff]">
              Test DISC completado
            </div>
            <div className="text-[12px] text-white/60">
              La persona ya completó el test; su perfil se calculó y cargó automáticamente.
            </div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#34d399]/35 bg-[#34d399]/[0.14] px-2.5 py-1 text-[11px] font-bold text-[#34d399]">
            <Trophy size={12} strokeWidth={2} />
            +1 logro
          </span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="mt-3 inline-flex items-center gap-1.5 rounded-[9px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-default disabled:opacity-60"
        >
          <RotateCcw size={13} />
          {generating ? "Generando…" : "Generar nuevo link · re-hacer test"}
        </button>
        <p className="mt-1.5 text-[11px] text-white/40">
          Genera un link nuevo y deja el perfil en blanco para volver a evaluarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-xl border border-[#5b8aff]/[0.28] bg-[#5b8aff]/[0.08] px-4 py-3.5">
      <div className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[#9fb9ff]">
        <Link2 size={14} strokeWidth={1.9} />
        {token ? "Link de test DISC" : "Evaluación DISC en la app"}
      </div>

      {token ? (
        <>
          <div className="flex items-center gap-2">
            <TextInput
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="text-[11.5px]"
            />
            <button
              type="button"
              onClick={copy}
              className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[#5b8aff]/40 bg-[#5b8aff]/20 px-3 py-2.5 text-[12px] font-bold text-[#bcd0ff] transition hover:bg-[#5b8aff]/30"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          {/* Enviar por email */}
          <div className="mt-3 border-t border-white/[0.07] pt-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-white/70">
              <Mail size={12.5} /> Enviar por email
            </div>
            <div className="flex items-center gap-2">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="text-[12px]"
              />
              <button
                type="button"
                onClick={sendByEmail}
                disabled={sending || !email.trim()}
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[#34d399]/40 bg-[#34d399]/15 px-3 py-2.5 text-[12px] font-bold text-[#6ee7b7] transition hover:bg-[#34d399]/25 disabled:cursor-default disabled:opacity-50"
              >
                <Send size={13} /> {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
            {sendMsg && <p className="mt-1.5 text-[11.5px] text-[#34d399]">{sendMsg}</p>}
            {sendErr && <p className="mt-1.5 text-[11.5px] text-[#f87171]">{sendErr}</p>}
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white/70"
          >
            <RotateCcw size={11} />
            {generating ? "Generando…" : "Regenerar link (invalida el anterior)"}
          </button>
        </>
      ) : (
        <>
          <p className="mb-2 text-[12px] text-white/60">
            Generá un enlace para que la persona responda el test DISC. El perfil se
            calcula solo.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#5b8aff]/40 bg-[#5b8aff]/20 px-3.5 py-2 text-[12.5px] font-bold text-[#bcd0ff] transition hover:bg-[#5b8aff]/30"
          >
            <Link2 size={14} /> {generating ? "Generando…" : "Generar link de test"}
          </button>
        </>
      )}
    </div>
  );
}
