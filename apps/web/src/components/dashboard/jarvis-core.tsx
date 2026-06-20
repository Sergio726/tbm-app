"use client";

import { motion } from "motion/react";

/**
 * Núcleo visual del orbe JARVIS (S17.D). Sin texto — solo el orbe.
 * Lleva `layoutId="jarvis-core"` para que Motion anime el "vuelo" entre el
 * overlay de bienvenida (grande, centrado) y el header (chico, junto al nombre).
 *
 * ⚠️ Nunca debe haber dos <JarvisCore> montados a la vez: la coordinación la
 * maneja `jarvis-store` (overlay en "playing", header en "idle").
 */
export function JarvisCore({ size = 28 }: { size?: number }) {
  return (
    <motion.span
      layoutId="jarvis-core"
      aria-hidden
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      transition={{ type: "spring", stiffness: 210, damping: 26 }}
    >
      {/* Halo de glow (respira) */}
      <span
        className="jarvis-breathe absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(96,165,250,0.85), rgba(37,99,235,0.32) 55%, transparent 72%)",
          filter: "blur(1.5px)",
        }}
      />
      {/* Núcleo */}
      <span
        className="absolute rounded-full"
        style={{
          inset: "20%",
          background:
            "radial-gradient(circle at 34% 28%, #eff6ff, #3b82f6 55%, #1d4ed8)",
          boxShadow:
            "0 0 14px rgba(59,130,246,0.75), inset 0 0 6px rgba(255,255,255,0.55)",
        }}
      />
    </motion.span>
  );
}
