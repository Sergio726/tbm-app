"use client";

// Theming · base para evolución de interfaz (paleta + modo claro).
// El tema efectivo se aplica como data-theme="dark|light" en <html>. La preferencia
// del usuario ("dark" | "light" | "system") vive en localStorage; "system" sigue al
// SO en vivo. El no-FOUC lo resuelve el script inline del layout (corre antes del paint).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LIGHT_THEME_READY } from "@/lib/theme-flags";

export type ThemePref = "dark" | "light" | "system";
const STORAGE_KEY = "tbm-theme";

type Ctx = {
  /** Preferencia elegida por el usuario. */
  pref: ThemePref;
  /** Tema realmente aplicado (resuelve "system"). */
  resolved: "dark" | "light";
  setPref: (p: ThemePref) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function systemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readPref(): ThemePref {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "dark";
}

/** Aplica el tema resuelto al <html>. Centraliza el efecto (mismo cálculo que el script inline). */
function apply(pref: ThemePref): "dark" | "light" {
  // Mientras el claro no esté listo, la app fuerza oscuro (ver theme-flags).
  const resolved = !LIGHT_THEME_READY ? "dark" : pref === "system" ? systemTheme() : pref;
  document.documentElement.dataset.theme = resolved;
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  // Montaje: sincronizar el estado de React con lo que el script inline ya aplicó.
  useEffect(() => {
    const p = readPref();
    setPrefState(p);
    setResolved(apply(p));
  }, []);

  // Si la preferencia es "system", seguir los cambios del SO en vivo.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(apply("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    window.localStorage.setItem(STORAGE_KEY, p);
    setPrefState(p);
    setResolved(apply(p));
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

/**
 * Script que corre ANTES del primer paint (se inyecta en <head> del layout) para
 * evitar el flash de tema. Lee la misma key que el provider. Mantener en sync.
 */
export const THEME_INIT_SCRIPT = LIGHT_THEME_READY
  ? `(function(){try{var p=localStorage.getItem('${STORAGE_KEY}');var t=(p==='light'||p==='dark')?p:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`
  : `document.documentElement.dataset.theme='dark';`;
