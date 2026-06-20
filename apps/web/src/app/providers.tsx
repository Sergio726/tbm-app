"use client";

import { PostHogProvider } from "@/components/analytics/posthog-provider";

/**
 * Composición de providers client-side de la app (montado en el root layout).
 * Por ahora solo PostHog; deja lugar para más providers globales.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
