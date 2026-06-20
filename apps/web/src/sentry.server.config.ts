import * as Sentry from "@sentry/nextjs";

// Gateado por env: sin DSN no inicializa (no-op). Runtime Node.js (server).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}
