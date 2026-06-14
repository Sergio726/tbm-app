"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { createBrowserClient } from "@/lib/supabase/client";
import { tourStepsForRole } from "@/lib/tour-steps";

export const START_TOUR_EVENT = "tbm:start-tour";

/** Dispara el tour manualmente (ej. desde "Ver tour de nuevo" en Mi cuenta). */
export function startTour() {
  window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
}

/**
 * TourProvider (S11) — montado en el layout del dashboard.
 * Auto-arranca el tour la primera vez que el usuario entra
 * (tour_completed=false) y lo marca completado al cerrar/terminar.
 */
export function TourProvider({
  userId,
  role,
  tourCompleted,
}: {
  userId: string;
  role: string | null;
  tourCompleted: boolean;
}) {
  const driverRef = useRef<Driver | null>(null);
  const completedRef = useRef(tourCompleted);

  useEffect(() => {
    const markCompleted = async () => {
      if (completedRef.current) return;
      completedRef.current = true;
      try {
        const supabase = createBrowserClient();
        await supabase
          .from("profiles")
          .update({ tour_completed: true })
          .eq("id", userId);
      } catch (e) {
        console.error("No se pudo marcar el tour como completado:", e);
      }
    };

    const buildDriver = () =>
      driver({
        steps: tourStepsForRole(role),
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente →",
        prevBtnText: "← Atrás",
        doneBtnText: "Empezar",
        // Overlay más claro + spotlight con padding/radio para que la
        // sección enfocada se entienda sin oscurecer de más el fondo (S12).
        overlayColor: "#0A0E17",
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 12,
        disableActiveInteraction: true,
        // Cerrar (X, Esc, click en overlay o terminar) = tour visto
        onDestroyed: () => {
          void markCompleted();
        },
      });

    const run = () => {
      driverRef.current?.destroy();
      driverRef.current = buildDriver();
      driverRef.current.drive();
    };

    // Auto-trigger en el primer ingreso (pequeño delay para que el DOM asiente)
    let autoTimer: ReturnType<typeof setTimeout> | undefined;
    if (!tourCompleted) {
      autoTimer = setTimeout(run, 900);
    }

    // Re-disparo manual desde "Ver tour de nuevo"
    const onStartEvent = () => {
      completedRef.current = true; // el re-run manual no vuelve a escribir el flag
      run();
    };
    window.addEventListener(START_TOUR_EVENT, onStartEvent);

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener(START_TOUR_EVENT, onStartEvent);
      driverRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role, tourCompleted]);

  return null;
}
