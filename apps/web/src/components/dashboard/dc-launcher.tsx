"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useJarvisPhase, setJarvisPhase } from "./jarvis-store";
import { JarvisCore } from "./jarvis-core";
import { JarvisPanel } from "./jarvis-panel";
import type { DcPublicPersona } from "@/lib/dc-persona";

const SIZE = 30;
const HINT_KEY = "tbm:jarvis-hint-seen";

/**
 * DC-1 · Launcher global de DC.
 *
 * Reemplaza al orbe que vivía solo en el header del dashboard: ahora el orbe es
 * un botón flotante fijo (abajo a la derecha) disponible en TODO el layout
 * `(dashboard)`, así se puede hablar con DC desde cualquier pantalla.
 *
 * - Es el "hogar persistente" del orbe con `layoutId`: la bienvenida cinemática
 *   (`jarvis-intro`) hace volar el orbe hasta acá al terminar. Por eso, mientras
 *   la película corre (phase !== "idle") NO montamos el orbe con layoutId (lo
 *   posee el overlay) → evita el doble layoutId / parpadeo.
 * - Context-aware: deriva la pantalla actual de la ruta y se la pasa al panel,
 *   que la manda al endpoint para que DC ajuste sugerencias.
 */
export function DcLauncher({ persona }: { persona: DcPublicPersona }) {
  const phase = useJarvisPhase();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const [hint, setHint] = useState(false);
  // El sidebar bloquea el scroll del body (overflow:hidden) cuando el drawer
  // mobile está abierto. Usamos eso como señal para ocultar el orbe y no taparlo.
  // (Decoupled: sirve para cualquier overlay que bloquee el scroll.)
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const check = () => setScrollLocked(document.body.style.overflow === "hidden");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => obs.disconnect();
  }, []);

  // El store arranca en "pending" y solo la bienvenida cinemática (que vive en el
  // dashboard) lo resuelve. En el resto de las pantallas nadie la resuelve → si
  // sigue "pending" tras un instante, la tomamos nosotros para mostrar el orbe.
  // (Si la película arranca, setea "playing"/"idle" antes de los 120ms y este
  // efecto se reejecuta sin tocar nada.)
  useEffect(() => {
    if (phase !== "pending") return;
    const t = setTimeout(() => setJarvisPhase("idle"), 120);
    return () => clearTimeout(t);
  }, [phase]);

  // Hint de primera vez (una sola vez por navegador), cuando el orbe queda idle.
  useEffect(() => {
    if (phase !== "idle" || open) return;
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {
      return;
    }
    const t1 = setTimeout(() => setHint(true), 2000);
    const t2 = setTimeout(() => setHint(false), 11000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, open]);

  const openPanel = () => {
    setOpen(true);
    setHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Durante la película el overlay posee el orbe (layoutId) → no montamos el nuestro.
  // Con el drawer mobile abierto (scroll bloqueado) lo ocultamos para no flotar encima.
  if (phase !== "idle" || scrollLocked) return null;

  const moduleLabel = moduleFromPath(pathname);

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: "clamp(16px, 4vw, 28px)",
          // En mobile sumamos el safe-area (home indicator de iOS) para que no quede
          // pegado al borde inferior tapando contenido.
          bottom: "calc(clamp(16px, 4vw, 24px) + env(safe-area-inset-bottom, 0px))",
          // Debajo de modales/panel de chat/paleta (70/80/100), encima del contenido.
          zIndex: 60,
        }}
        className="flex flex-col items-end"
      >
        {(tip || hint) && !open && (
          <span
            role="tooltip"
            className="pointer-events-none mb-2 rounded-lg px-3 py-1.5 text-[12px] font-medium"
            style={{
              background: "rgba(15,27,45,0.97)",
              border: "1px solid rgba(91,138,255,0.35)",
              color: "#cfe0ff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
              maxWidth: hint ? 250 : "auto",
              whiteSpace: hint ? "normal" : "nowrap",
              lineHeight: 1.4,
            }}
          >
            {hint
              ? `👋 Soy ${persona.name}, tu asistente del método. Tocame desde cualquier pantalla para preguntarme sobre tu equipo o tu negocio.`
              : `Asistente ${persona.name}`}
          </span>
        )}

        <span className="relative inline-flex items-center justify-center">
          {!open && <span className="jarvis-attention" aria-hidden />}
          <button
            type="button"
            onClick={openPanel}
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
            aria-label={`Abrir asistente ${persona.name}`}
            data-tour="dc-launcher"
            className="relative inline-flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              background: "rgba(6,10,20,0.9)",
              border: "1px solid rgba(91,138,255,0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 22px rgba(37,99,235,0.35)",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
          >
            <JarvisCore size={SIZE} />
          </button>
        </span>
      </div>

      <JarvisPanel
        open={open}
        onClose={() => setOpen(false)}
        moduleLabel={moduleLabel}
        persona={persona}
      />
    </>
  );
}

/** Mapea la ruta a una etiqueta legible de la pantalla actual (DC-1). */
function moduleFromPath(pathname: string | null): string {
  if (!pathname) return "";
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  const MAP: Record<string, string> = {
    dashboard: "Inicio (dashboard)",
    equipo: "Mi Equipo (DISC)",
    delegacion: "Delegación (Pase de Estafeta)",
    rituales: "Rituales (Pre-game, War Up, Cool Down)",
    "plan-90d": "Plan 90D (Rocas)",
    feedback: "Feedback S.E.C.",
    workbooks: "Workbooks (programa TBM)",
    multiplicador: "Multiplicador (ROI de Talento)",
    diagnostico: "Diagnóstico Organizacional",
    diagnosticos: "Diagnósticos",
    sistema: "Sistema LOST",
    "super-coach": "Panel Super Coach",
    notificaciones: "Notificaciones",
    cuenta: "Mi Cuenta",
  };
  return MAP[seg] ?? "";
}
