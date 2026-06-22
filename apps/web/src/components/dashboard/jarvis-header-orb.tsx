"use client";

import { useState } from "react";
import { useJarvisPhase } from "./jarvis-store";
import { JarvisCore } from "./jarvis-core";
import { JarvisPanel } from "./jarvis-panel";

const SIZE = 26;

/**
 * Orbe JARVIS en el header del dashboard (S17.D → S18.2).
 * En "idle" es un botón accesible que abre el panel de chat. Durante la película
 * de bienvenida ("pending"/"playing") reserva el espacio con un placeholder.
 */
export function JarvisHeaderOrb() {
  const phase = useJarvisPhase();
  const [tip, setTip] = useState(false);
  const [open, setOpen] = useState(false);

  if (phase !== "idle") {
    return <span aria-hidden style={{ display: "inline-block", width: SIZE, height: SIZE }} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        aria-label="Abrir asistente JARVIS"
        className="relative inline-flex items-center"
        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
      >
        <JarvisCore size={SIZE} />
        {tip && !open && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: "rgba(15,27,45,0.96)",
              border: "1px solid rgba(91,138,255,0.3)",
              color: "#cfe0ff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            Asistente JARVIS
          </span>
        )}
      </button>
      <JarvisPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
