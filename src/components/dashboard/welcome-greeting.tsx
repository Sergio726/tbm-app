"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const FRESH_LOGIN_KEY = "tbm:just-logged-in";
const GREETING_OFF_KEY = "tbm:greeting-off";
const AUTO_DISMISS_MS = 7000;

/**
 * Saludo de bienvenida estilo "JARVIS" (S17.A).
 * Solo aparece en un login fresco (flag en localStorage que setea el login),
 * nunca en navegación interna. Descartable y apagable de forma persistente.
 * Reusa los datos que el dashboard ya calcula — no hace fetch propio.
 */
export function WelcomeGreeting({
  greeting,
  firstName,
  tasksDueCount,
  nextRitualLabel,
  areasCriticasCount,
  unreadCount,
}: {
  greeting: string;
  firstName: string;
  tasksDueCount: number;
  nextRitualLabel: string | null;
  areasCriticasCount: number;
  unreadCount: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fresh = window.localStorage.getItem(FRESH_LOGIN_KEY) === "1";
    const off = window.localStorage.getItem(GREETING_OFF_KEY) === "1";
    // Consumimos el flag de login fresco siempre, para que no reaparezca al navegar.
    if (fresh) window.localStorage.removeItem(FRESH_LOGIN_KEY);
    if (fresh && !off) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  // 1–3 frases contextuales a partir de datos reales.
  const parts: string[] = [];
  if (tasksDueCount > 0) {
    parts.push(
      `tenés ${tasksDueCount} ${tasksDueCount === 1 ? "tarea por vencer" : "tareas por vencer"}`
    );
  }
  if (nextRitualLabel) parts.push(nextRitualLabel);
  if (areasCriticasCount > 0) {
    parts.push(
      `${areasCriticasCount} ${areasCriticasCount === 1 ? "área en rojo" : "áreas en rojo"} esperan tu atención`
    );
  }
  if (parts.length === 0 && unreadCount > 0) {
    parts.push(`tenés ${unreadCount} ${unreadCount === 1 ? "novedad" : "novedades"} sin leer`);
  }

  const contextual =
    parts.length > 0
      ? capitalize(joinNatural(parts)) + "."
      : "Todo en orden por aquí. Es un buen día para multiplicar.";

  const dismiss = () => setVisible(false);
  const turnOff = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(GREETING_OFF_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      className="tbm-slide-right relative mb-5 flex items-start gap-3.5 rounded-2xl border p-4"
      style={{
        background: "linear-gradient(135deg, rgba(91,138,255,0.12), rgba(91,138,255,0.03))",
        borderColor: "rgba(91,138,255,0.28)",
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(91,138,255,0.18)",
          border: "1px solid rgba(91,138,255,0.3)",
          color: "#9fb9ff",
        }}
      >
        <Sparkles size={17} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold text-white">
          {greeting} de nuevo, {firstName}.
        </div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-white/65">{contextual}</div>
        <button
          type="button"
          onClick={turnOff}
          className="mt-1.5 text-[11.5px] text-white/35 underline-offset-2 transition hover:text-white/60 hover:underline"
        >
          No volver a mostrar
        </button>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar saludo"
        className="flex-shrink-0 rounded-md p-1 text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinNatural(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
