import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Host de PostHog (us/eu). El proxy /ingest evita ad-blockers.
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fijar el root del workspace a este proyecto: hay un package-lock.json en la
  // carpeta padre que hace que Turbopack infiera mal la raíz (warning en build).
  turbopack: { root: __dirname },

  // Reverse-proxy de PostHog (la ingesta sale por el mismo dominio).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      { source: "/ingest/:path*", destination: `${POSTHOG_HOST}/:path*` },
    ];
  },
};

// Sentry: sube source maps en build si hay SENTRY_AUTH_TOKEN (Vercel). Sin token
// igual funciona (stacks minificados). Sin DSN, los SDK no inicializan (no-op).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
