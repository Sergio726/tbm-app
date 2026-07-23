"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Send, X, MailWarning } from "lucide-react";
import { sendTeamInvite, cancelInvite } from "@/app/(dashboard)/equipo/actions";

export type PendingInvite = {
  id: string;
  email: string;
  created_at: string | null;
  expires_at: string | null;
};

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const ms = Date.parse(expiresAt) - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.ceil(ms / 86_400_000);
}

export function PendingInvites({
  companyId,
  invites,
}: {
  companyId: string;
  invites: PendingInvite[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null); // id en proceso
  const [flash, setFlash] = useState<{ id: string; kind: "resent" | "error"; msg?: string } | null>(
    null
  );

  if (invites.length === 0) return null;

  async function resend(inv: PendingInvite) {
    if (busy) return;
    setBusy(inv.id);
    setFlash(null);
    try {
      const res = await sendTeamInvite({
        email: inv.email,
        companyId,
        origin: window.location.origin,
      });
      if (res.ok) {
        setFlash({ id: inv.id, kind: "resent" });
        router.refresh();
      } else {
        setFlash({ id: inv.id, kind: "error", msg: res.error });
      }
    } catch {
      setFlash({ id: inv.id, kind: "error", msg: "No se pudo reenviar." });
    } finally {
      setBusy(null);
    }
  }

  async function cancel(inv: PendingInvite) {
    if (busy) return;
    setBusy(inv.id);
    setFlash(null);
    try {
      const res = await cancelInvite({ id: inv.id });
      if (res.ok) {
        router.refresh();
      } else {
        setFlash({ id: inv.id, kind: "error", msg: res.error });
      }
    } catch {
      setFlash({ id: inv.id, kind: "error", msg: "No se pudo cancelar." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.3px] text-fg-muted">
        <MailWarning size={13} strokeWidth={2} className="text-[#fbbf24]" />
        Invitaciones pendientes
        <span className="ml-auto font-semibold text-fg-muted">{invites.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {invites.map((inv) => {
          const left = daysLeft(inv.expires_at);
          const expired = left !== null && left <= 0;
          const working = busy === inv.id;
          const f = flash?.id === inv.id ? flash : null;
          return (
            <div
              key={inv.id}
              className="rounded-[11px] border border-white/[0.06] bg-white/[0.015] p-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fbbf24]/[0.14] text-[#fbbf24]">
                  <Clock size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-fg" title={inv.email}>
                    {inv.email}
                  </div>
                  <div className="text-[10.5px] text-fg-muted">
                    {expired
                      ? "Venció — reenviá para renovar"
                      : left !== null
                        ? `Vence en ${left} ${left === 1 ? "día" : "días"}`
                        : "Pendiente de aceptar"}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => resend(inv)}
                  disabled={working}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-[#5b8aff]/30 bg-[#5b8aff]/[0.12] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#bcd0ff] transition hover:bg-[#5b8aff]/[0.2] disabled:opacity-50"
                >
                  <Send size={12} /> {working ? "…" : "Reenviar"}
                </button>
                <button
                  type="button"
                  onClick={() => cancel(inv)}
                  disabled={working}
                  aria-label={`Cancelar invitación de ${inv.email}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.08] px-2.5 py-1.5 text-[11.5px] font-semibold text-fg-muted transition hover:border-[#f87171]/40 hover:text-[#fca5a5] disabled:opacity-50"
                >
                  <X size={12} /> Cancelar
                </button>
              </div>

              {f?.kind === "resent" && (
                <div className="mt-1.5 text-[10.5px] font-medium text-[#34d399]">
                  Invitación reenviada.
                </div>
              )}
              {f?.kind === "error" && (
                <div className="mt-1.5 text-[10.5px] font-medium text-[#fca5a5]">
                  {f.msg ?? "Algo falló."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
