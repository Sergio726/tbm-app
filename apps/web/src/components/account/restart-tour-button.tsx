"use client";

import { Compass } from "lucide-react";
import { useRestartTour } from "@/hooks/use-restart-tour";

/**
 * "Ver tour de nuevo" (S11) — resetea el flag y manda al Dashboard,
 * donde el TourProvider lo auto-arranca.
 */
export function RestartTourButton({ userId }: { userId: string }) {
  const { restart, busy } = useRestartTour(userId);

  return (
    <button
      type="button"
      onClick={restart}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition hover:bg-white/[0.05] disabled:opacity-60"
      style={{
        background: "rgba(91,138,255,0.08)",
        borderColor: "rgba(91,138,255,0.28)",
        color: "var(--accent-text)",
      }}
    >
      <Compass size={15} strokeWidth={1.9} />
      {busy ? "Reiniciando…" : "Ver tour de nuevo"}
    </button>
  );
}
