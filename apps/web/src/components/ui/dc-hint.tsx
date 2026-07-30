"use client";

import { Sparkles, X, Check } from "lucide-react";
import type { ReviewResult } from "@/lib/dc-review";

/**
 * Tarjeta de intervención de DC proactivo (S24 · E1).
 *
 * Una sola pieza visual para todos los casos (delegación, workbooks, y lo que
 * sumen S25/S27). Va **debajo** del campo, sin robar el foco ni empujar el
 * contenido de golpe.
 *
 * Tono deliberado: sugiere, no reprocha. Dilio quiere que el sistema enseñe a
 * delegar bien, y alguien a quien el software regaña deja de usarlo.
 */
export function DcHint({
  result,
  dcName = "DC",
  onAccept,
  onDismiss,
}: {
  result: ReviewResult | null;
  dcName?: string;
  /** Recibe la reescritura para volcarla al campo. Ausente = sin botón de aceptar. */
  onAccept?: (suggestion: string) => void;
  onDismiss: () => void;
}) {
  if (!result || result.verdict === "ok") return null;

  // `poor` = falta lo esencial · `weak` = está pero es ambiguo. El color acompaña
  // sin alarmar: es una sugerencia, no un error de validación.
  const isPoor = result.verdict === "poor";
  const accent = isPoor ? "#fbbf24" : "#5b8aff";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-2 rounded-[12px] border p-3.5"
      style={{
        borderColor: `${accent}44`,
        background: `${accent}0f`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
          style={{ background: `${accent}26`, color: accent }}
        >
          <Sparkles size={12} strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] leading-relaxed text-fg">
            <span className="font-semibold" style={{ color: accent }}>
              {dcName}:
            </span>{" "}
            {result.message}
          </p>

          {result.suggestion && (
            <div
              className="mt-2.5 rounded-[9px] border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.18)" }}
            >
              <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-fg">
                {result.suggestion}
              </p>
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-2">
            {result.suggestion && onAccept && (
              <button
                type="button"
                onClick={() => onAccept(result.suggestion!)}
                className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-semibold text-white transition hover:opacity-90"
                style={{ background: accent }}
              >
                <Check size={12} strokeWidth={2.4} /> Usar esta versión
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-[8px] px-2.5 py-1.5 text-[11.5px] font-medium text-fg-muted transition hover:text-fg"
            >
              Dejar como está
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar sugerencia"
          className="flex-shrink-0 text-fg-subtle transition hover:text-fg"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
