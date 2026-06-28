"use client";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

/**
 * Composición de providers client-side de la app (montado en el root layout).
 * ThemeProvider (paleta + modo claro) + PostHog.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </ThemeProvider>
  );
}
