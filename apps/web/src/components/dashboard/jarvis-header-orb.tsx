"use client";

import { useState } from "react";
import { useJarvisPhase } from "./jarvis-store";
import { JarvisCore } from "./jarvis-core";

const SIZE = 26;

/**
 * Instancia persistente del orbe JARVIS en el header del dashboard (S17.D).
 * Reemplaza el ✨ amarillo que estaba junto al nombre.
 *
 * Mientras la película de bienvenida corre (phase === "playing") muestra un
 * placeholder invisible del mismo tamaño (reserva el espacio, SIN layoutId), para
 * que el orbe del overlay sea el único con `layoutId`. Cuando termina (phase
 * "idle") monta el orbe real → Motion ejecuta el "vuelo" hasta acá.
 *
 * En navegación normal (sin login fresco) el store arranca en "idle", así que el
 * orbe aparece directo sin película.
 */
export function JarvisHeaderOrb() {
  const phase = useJarvisPhase();
  const [tip, setTip] = useState(false);

  // Solo muestra el orbe en "idle" (intro terminado o no aplica). En "pending"/
  // "playing" reserva el espacio con un placeholder invisible (sin layoutId).
  if (phase !== "idle") {
    return (
      <span
        aria-hidden
        style={{ display: "inline-block", width: SIZE, height: SIZE }}
      />
    );
  }

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <JarvisCore size={SIZE} />
      {tip && (
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
          Tu asistente · próximamente
        </span>
      )}
    </span>
  );
}
