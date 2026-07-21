"use client";

import { motion } from "motion/react";

/**
 * Núcleo visual del orbe JARVIS (S17.D). Sin texto — solo el orbe.
 * Por defecto lleva `layoutId="jarvis-core"` para que Motion anime el "vuelo"
 * entre el overlay de bienvenida (grande, centrado) y su hogar persistente
 * (el launcher flotante). La coordinación la maneja `jarvis-store` (overlay en
 * "playing", launcher en "idle").
 *
 * ⚠️ Nunca debe haber dos <JarvisCore> con `layoutId` montados a la vez → Motion
 * confunde el layout y el orbe parpadea. Para orbes decorativos secundarios (ej.
 * el header del panel de chat) usar `plain` → renderiza un `<span>` SIN layoutId.
 */
export function JarvisCore({ size = 28, plain = false }: { size?: number; plain?: boolean }) {
  // Esfera de energía neón (S17.E). Un wrapper respira (scale) y adentro el
  // anillo gira (rotate) → se evita el choque de `transform`. El `fontSize`
  // habilita el escalado del box-shadow expresado en `em` dentro de la keyframe.
  const inner = (
    <span className="jarvis-breathe absolute inset-0">
      <span
        aria-hidden
        className="jarvis-orb-ring absolute inset-0 rounded-full"
        style={{ fontSize: size }}
      />
    </span>
  );

  if (plain) {
    return (
      <span
        aria-hidden
        className="relative inline-flex flex-shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        {inner}
      </span>
    );
  }

  return (
    <motion.span
      layoutId="jarvis-core"
      aria-hidden
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      transition={{ type: "spring", stiffness: 210, damping: 26 }}
    >
      {inner}
    </motion.span>
  );
}
