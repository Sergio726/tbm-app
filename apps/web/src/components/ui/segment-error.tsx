"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Error boundary de sección (pulido pre-beta). A diferencia de
 * `app/global-error.tsx` (reemplaza la página entera), este se renderiza
 * DENTRO del layout del dashboard: el sidebar y el resto de la app siguen
 * vivos, y `reset()` reintenta solo el segmento que falló.
 *
 * Se usa desde los `error.tsx` de cada segmento, pasándole una etiqueta.
 */
export function SegmentError({
  error,
  reset,
  label = "esta sección",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  label?: string;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(20px, 5vw, 40px)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          padding: "32px 28px",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--fg)" }}>
          No pudimos cargar {label}
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--fg-subtle)",
            lineHeight: 1.55,
            margin: "0 0 22px",
          }}
        >
          Tuvimos un problema inesperado. Ya quedó registrado y lo vamos a revisar.
          Podés reintentar sin salir de la app.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(180deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(54,114,255,0.3)",
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
