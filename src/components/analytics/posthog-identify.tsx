"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Identifica al usuario logueado en PostHog (montado en el layout del dashboard).
 * Sin PII: solo user.id (UUID), role y company_id. Nunca email ni nombre.
 */
export function PostHogIdentify({
  userId,
  role,
  companyId,
}: {
  userId: string;
  role: string | null;
  companyId: string | null;
}) {
  useEffect(() => {
    if (!posthog.__loaded) return;
    posthog.identify(userId, {
      role: role ?? undefined,
      company_id: companyId ?? undefined,
    });
    if (companyId) posthog.group("company", companyId);
  }, [userId, role, companyId]);

  return null;
}
