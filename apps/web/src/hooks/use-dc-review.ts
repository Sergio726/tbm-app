"use client";

import { useCallback, useRef, useState } from "react";
import {
  reviewCacheKey,
  shouldReview,
  type ReviewKind,
  type ReviewResult,
} from "@/lib/dc-review";

/**
 * Hook cliente de DC proactivo (S24 · E1).
 *
 * Se dispara **on-blur**, no por tecla: interrumpir a alguien mientras escribe es
 * exactamente lo que no queremos. Además cachea por hash del texto, así que
 * volver a un campo sin editarlo no gasta otra llamada.
 *
 * Nunca propaga errores: si el endpoint falla o tarda, el resultado queda en
 * `null` y el formulario sigue como si el patrón no existiera.
 */
export function useDcReview(kind: ReviewKind) {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Cache por hash: mismo texto → no se vuelve a preguntar (ni al server ni al modelo).
  const cache = useRef(new Map<string, ReviewResult | null>());
  // Descarta respuestas viejas si el usuario siguió escribiendo.
  const lastKey = useRef<string>("");

  const review = useCallback(
    async (value: string, context?: Record<string, string>) => {
      setDismissed(false);

      if (!shouldReview(value)) {
        setResult(null);
        return;
      }

      const key = reviewCacheKey(kind, value);
      lastKey.current = key;

      if (cache.current.has(key)) {
        setResult(cache.current.get(key) ?? null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/dc/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, value, context }),
        });
        // El endpoint responde 200 con `result: null` cuando no hay nada que
        // mostrar (flag off, sin key, rate limit). No es un error.
        const data = (await res.json().catch(() => ({}))) as { result?: ReviewResult | null };
        const r = data.result ?? null;
        cache.current.set(key, r);
        // Solo aplicar si sigue siendo la última evaluación pedida.
        if (lastKey.current === key) setResult(r);
      } catch {
        // Red caída / navegación: silencio. El formulario no se entera.
        if (lastKey.current === key) setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [kind]
  );

  /** El usuario cerró el hint: no volver a mostrarlo para este texto. */
  const dismiss = useCallback(() => setDismissed(true), []);

  /** Tras aceptar una sugerencia, limpiar (el texto nuevo se evalúa solo si sale del campo). */
  const clear = useCallback(() => {
    setResult(null);
    setDismissed(false);
  }, []);

  // "ok" no se muestra: si está bien escrito, no molestamos.
  const visible = !dismissed && !!result && result.verdict !== "ok";

  return { result: visible ? result : null, loading, review, dismiss, clear };
}
