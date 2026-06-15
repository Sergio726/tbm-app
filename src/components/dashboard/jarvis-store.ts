"use client";

import { useSyncExternalStore } from "react";

/**
 * Store externo mínimo (sin dependencias) para coordinar el orbe JARVIS entre el
 * overlay de bienvenida (jarvis-intro) y la instancia persistente del header
 * (jarvis-header-orb). S17.D.
 *
 * Razón: el "vuelo" del orbe usa `layoutId="jarvis-core"` de Motion, y NO puede
 * haber dos elementos con el mismo layoutId montados+visibles a la vez. Este store
 * dice quién "posee" el orbe en cada momento:
 *  - "playing": lo posee el overlay → el header muestra un placeholder invisible.
 *  - "idle":    lo posee el header  → el overlay ya no monta su orbe.
 *
 * Por defecto arranca en "idle": en navegación normal (sin película) el orbe del
 * header aparece directo. El overlay sube a "playing" solo en login fresco.
 */

export type JarvisPhase = "pending" | "playing" | "idle";

// Arranca en "pending": el header no muestra el orbe hasta que el intro decide
// (evita un flash del orbe en la esquina antes del "vuelo" en login fresco).
let phase: JarvisPhase = "pending";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setJarvisPhase(next: JarvisPhase) {
  if (phase === next) return;
  phase = next;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): JarvisPhase {
  return phase;
}

// En SSR "pending" (igual que el snapshot inicial del cliente) → sin mismatch de
// hidratación; el orbe del header aparece recién cuando el intro define la fase.
function getServerSnapshot(): JarvisPhase {
  return "pending";
}

export function useJarvisPhase(): JarvisPhase {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
