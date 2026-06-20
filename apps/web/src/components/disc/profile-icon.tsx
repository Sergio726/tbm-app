"use client";

import { useEffect, useState } from "react";

// Mapa perfil → codepoint Unicode del emoji (para el WebP animado de Noto).
// Algunos llevan el selector de variación fe0f; si Noto no tiene ese asset,
// el onError de la <img> cae al emoji animado por CSS.
const NOTO_CODEPOINT: Record<string, string> = {
  Realizador: "26a1",
  Perfeccionista: "1f52c",
  Creativo: "1f4a1",
  Objetivo: "1f3af",
  Persuasivo: "1f91d",
  Promotor: "1f4e3",
  Consejero: "1f4ac",
  Agente: "1f33f",
  Evaluador: "1f4ca",
  Resolutivo: "1f525",
  Orientado: "1f3c6",
  Especialista: "1f6e0_fe0f",
  Investigador: "1f52d",
  Profesional: "1f396_fe0f",
  Alentador: "2728",
  Desconcertante: "1f300",
};

function notoUrl(cp: string): string {
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${cp}/512.webp`;
}

export function ProfileIcon({
  profileKey,
  emoji,
  color,
  size = 104,
}: {
  profileKey: string;
  emoji: string;
  color: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const cp = NOTO_CODEPOINT[profileKey];
  const useNoto = !!cp && !failed && !reduced;
  // Animación del emoji de respaldo: la llama "titila", el resto "flota".
  const fallbackAnim = reduced ? "" : emoji === "🔥" ? "tbm-flicker" : "tbm-float";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Halo de glow del color del perfil */}
      {!reduced && (
        <span
          aria-hidden
          className="tbm-glow-pulse absolute rounded-full"
          style={{
            width: size * 1.3,
            height: size * 1.3,
            background: `radial-gradient(circle, ${color}55 0%, ${color}00 68%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {useNoto ? (
        <img
          src={notoUrl(cp)}
          alt={profileKey}
          width={size}
          height={size}
          className={reduced ? "relative" : "relative tbm-pop"}
          onError={() => setFailed(true)}
          style={{ display: "block" }}
        />
      ) : (
        <span
          className={`relative ${reduced ? "" : "tbm-pop"}`}
          style={{ fontSize: size * 0.66, lineHeight: 1 }}
        >
          <span className={fallbackAnim} style={{ display: "inline-block" }}>
            {emoji}
          </span>
        </span>
      )}
    </div>
  );
}
