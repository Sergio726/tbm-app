"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Re-acceso al tour guiado (S11 / S17.B).
 * Resetea `tour_completed=false` y manda al Dashboard, donde el TourProvider
 * lo auto-arranca apuntando a los elementos correctos (que solo existen ahí).
 * Compartido por RestartTourButton (Mi cuenta), el Command Palette y el sidebar.
 */
export function useRestartTour(userId: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const restart = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createBrowserClient();
      await supabase.from("profiles").update({ tour_completed: false }).eq("id", userId);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [busy, router, userId]);

  return { restart, busy };
}
