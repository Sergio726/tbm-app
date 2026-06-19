import posthog from "posthog-js";

/**
 * Helper único para capturar eventos de producto en PostHog desde client components.
 * No-opea de forma segura si PostHog no está cargado (sin key, SSR, o ad-blocker).
 *
 * REGLA DE PRIVACIDAD: pasar solo metadata (booleans, counts, ids, role).
 * NUNCA texto libre (victory_log, feedback, respuestas DISC) ni emails/nombres.
 */
export function capture(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    if (!posthog.__loaded) return;
    posthog.capture(event, props);
  } catch {
    /* no-op */
  }
}

/** Limpia la identidad al cerrar sesión (llamar antes de signOut). */
export function resetAnalytics() {
  try {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    posthog.reset();
  } catch {
    /* no-op */
  }
}
