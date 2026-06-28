"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Error boundary global de la app — captura errores de render no manejados
 * y los reporta a Sentry (no-op si no hay DSN). Reemplaza la página entera,
 * por eso renderiza su propio <html>/<body>.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
            Algo salió mal
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--fg-subtle)",
              lineHeight: 1.5,
              margin: "0 0 20px",
            }}
          >
            Tuvimos un problema inesperado. Ya quedó registrado y lo vamos a
            revisar. Probá recargar la página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "11px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
              color: "var(--fg)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
