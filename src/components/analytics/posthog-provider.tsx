"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Provider de PostHog (analítica de producto).
 * - Gateado por env: sin NEXT_PUBLIC_POSTHOG_KEY no inicializa nada (no-op).
 * - Session recording OFF (v1) — la app tiene data sensible.
 * - person_profiles "identified_only": no crea perfiles para anónimos.
 * - Pageviews manuales (App Router no auto-trackea navegación SPA).
 * - api_host "/ingest" = reverse proxy (ver rewrites en next.config) para esquivar ad-blockers.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;
    posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: HOST,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });
  }, []);

  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/** Captura $pageview en cada cambio de ruta (incluye query string). */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
