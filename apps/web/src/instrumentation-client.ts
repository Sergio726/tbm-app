import * as Sentry from "@sentry/nextjs";

// Gateado por env: sin DSN no inicializa (no-op). Runtime browser.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Session Replay desactivado (v1): la app tiene data sensible.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    enabled: process.env.NODE_ENV === "production",
  });
}

// Instrumenta las transiciones de ruta del App Router para tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
