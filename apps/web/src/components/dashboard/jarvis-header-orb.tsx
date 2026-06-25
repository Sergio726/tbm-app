"use client";

import { useEffect, useState } from "react";
import { useJarvisPhase } from "./jarvis-store";
import { JarvisCore } from "./jarvis-core";
import { JarvisPanel } from "./jarvis-panel";

const SIZE = 26;
const HINT_KEY = "tbm:jarvis-hint-seen";

/**
 * Orbe JARVIS en el header del dashboard. En "idle" es un botón accesible que abre
 * el chat. Para que el usuario lo descubra: un anillo de atención que pulsa cada
 * cierto tiempo (mientras el chat está cerrado) + un hint de bienvenida la 1ª vez.
 */
export function JarvisHeaderOrb() {
  const phase = useJarvisPhase();
  const [tip, setTip] = useState(false);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);

  // Hint de primera vez (una sola vez por navegador), cuando el orbe queda idle.
  useEffect(() => {
    if (phase !== "idle") return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {
      return;
    }
    const t1 = setTimeout(() => setHint(true), 1800);
    const t2 = setTimeout(() => setHint(false), 10000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const openPanel = () => {
    setOpen(true);
    setHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (phase !== "idle") {
    return <span aria-hidden style={{ display: "inline-block", width: SIZE, height: SIZE }} />;
  }

  return (
    <>
      <span className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
        {!open && <span className="jarvis-attention" aria-hidden />}
        <button
          type="button"
          onClick={openPanel}
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
          aria-label="Abrir asistente JARVIS"
          className="relative inline-flex items-center"
          style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
        >
          <JarvisCore size={SIZE} />
        </button>
        {(tip || hint) && !open && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-[12px] font-medium"
            style={{
              background: "rgba(15,27,45,0.97)",
              border: "1px solid rgba(91,138,255,0.35)",
              color: "#cfe0ff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              width: hint ? 230 : "auto",
              whiteSpace: hint ? "normal" : "nowrap",
              lineHeight: 1.4,
            }}
          >
            {hint
              ? "👋 Soy JARVIS, tu asistente del método. Tocame para hacerme una pregunta sobre tu equipo o tu negocio."
              : "Asistente JARVIS"}
          </span>
        )}
      </span>
      <JarvisPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
