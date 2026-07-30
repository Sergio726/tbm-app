/**
 * DC proactivo — patrón de intervención sobre formularios (S24 · §G1/§B1).
 *
 * Sebas lo diagnosticó en la Meet del 25/07 y Dilio lo confirmó: *"—hoy la IA es
 * pasiva, cuando yo la invoco recién me contesta. —Clave, clave, porque así la
 * gente va teniendo el ejercicio más profesional"*.
 *
 * **Este módulo es el pivote del bloque jul-2026.** El contrato de acá lo van a
 * consumir S25 (sugerir KPIs) y S27 (narrar alertas del coach). Agregar un caso
 * nuevo = agregar un prompt a `REVIEW_KINDS`, NO escribir otro asistente.
 *
 * Es **puro**: no hace red, no toca Supabase, no lee env vars. Decide *si vale la
 * pena evaluar*, arma el prompt y parsea la respuesta. El endpoint
 * (`app/api/dc/review/route.ts`) se encarga de la infra. Así esto se testea sin
 * nada montado — que importa porque es código que se va a heredar.
 */

// ── Contrato ────────────────────────────────────────────────────────────────

/** Qué se está evaluando. Cada kind trae su propio criterio. */
export type ReviewKind = "delegation_dod" | "delegation_why" | "workbook_answer";

export type ReviewVerdict = "ok" | "weak" | "poor";

export type ReviewResult = {
  verdict: ReviewVerdict;
  /** Qué le falta, en una frase y en segunda persona. Vacío si `ok`. */
  message: string;
  /** Reescritura propuesta, aceptable de un clic. Ausente si `ok`. */
  suggestion?: string;
};

export type ReviewRequest = {
  kind: ReviewKind;
  value: string;
  /** Contexto opcional del formulario (ej. a quién se delega). */
  context?: Record<string, string>;
};

// ── Umbral: cuándo NO vale la pena llamar al modelo ─────────────────────────

/**
 * Mínimo de caracteres para que valga una evaluación.
 *
 * No es una optimización prematura: cada llamada cuesta plata y el usuario
 * escribe de a poco. Debajo de esto no hay nada que juzgar todavía — el campo
 * está a medio escribir, no mal escrito.
 */
export const MIN_LENGTH = 15;

/** Techo defensivo: recorta antes de mandar, para que el prompt no se dispare. */
export const MAX_LENGTH = 1200;

/**
 * ¿Vale la pena evaluar este texto? Se chequea en cliente Y en servidor: en
 * cliente para no gastar la llamada, en servidor porque el cliente no es
 * confiable.
 */
export function shouldReview(value: string): boolean {
  return value.trim().length >= MIN_LENGTH;
}

/**
 * Clave de cache: si el texto no cambió, no se vuelve a evaluar. Es un hash
 * barato (djb2) — no necesita ser criptográfico, solo estable y corto.
 */
export function reviewCacheKey(kind: ReviewKind, value: string): string {
  const s = `${kind}:${value.trim()}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${kind}:${(h >>> 0).toString(36)}`;
}

// ── Prompts por kind ────────────────────────────────────────────────────────

type KindSpec = {
  /** Qué se le pide al modelo, en el lenguaje del método TBM. */
  criteria: string;
  /** Ejemplo de algo mal escrito y su versión buena — ancla el juicio. */
  example: { bad: string; good: string };
};

export const REVIEW_KINDS: Record<ReviewKind, KindSpec> = {
  // El caso que pidió Dilio. El error clásico: describir la ACTIVIDAD en vez del
  // ENTREGABLE. "Hacer el reporte" no dice cuándo está hecho; el DoD sí.
  delegation_dod: {
    criteria: [
      "Estás revisando el 'Definition of Done' de una tarea delegada, según el método TBM (Pase de Estafeta).",
      "Un DoD bueno describe el ENTREGABLE terminado, no la actividad: se tiene que poder responder 'sí' o 'no' a «¿está hecho?» sin discutir.",
      "Tiene que ser verificable: qué cosa concreta existe cuando termina, con formato/lugar/cantidad si aplica.",
      "Marcá 'poor' si describe una actividad ('hacer', 'revisar', 'trabajar en') sin entregable.",
      "Marcá 'weak' si hay entregable pero es ambiguo (falta formato, cantidad, destino o criterio de aceptación).",
      "Marcá 'ok' si ya es verificable. NO sugieras mejoras cosméticas: si está bien, no molestes.",
    ].join(" "),
    example: {
      bad: "hacer el reporte de ventas",
      good:
        "El reporte de ventas de mayo subido a Google Drive en PDF, con los datos de los 3 vendedores, antes del viernes 18hs.",
    },
  },

  delegation_why: {
    criteria: [
      "Estás revisando el 'POR QUÉ' de una tarea delegada en el método TBM: el contexto e impacto.",
      "Un buen POR QUÉ explica qué se desbloquea o qué cambia si esto se hace, para que la persona pueda tomar decisiones sola.",
      "Marcá 'poor' si solo repite la tarea con otras palabras.",
      "Marcá 'weak' si menciona un motivo pero sin consecuencia concreta.",
      "Marcá 'ok' si la persona entendería por qué importa sin preguntar.",
    ].join(" "),
    example: {
      bad: "porque hay que tenerlo",
      good:
        "Sin ese reporte no podemos decidir si sostenemos la inversión en el canal B2B, y la decisión es el lunes.",
    },
  },

  workbook_answer: {
    criteria: [
      "Estás revisando la respuesta de un empresario a un ejercicio del programa TBM.",
      "Una buena respuesta es específica y comprometida: nombra situaciones, personas o números reales de SU negocio.",
      "Marcá 'poor' si es un lugar común que serviría para cualquier empresa.",
      "Marcá 'weak' si va en la dirección correcta pero le falta concreción.",
      "Marcá 'ok' si ya es específica. Este es un ejercicio de reflexión: sé generoso, no corrijas estilo.",
    ].join(" "),
    example: {
      bad: "mejorar la comunicación del equipo",
      good:
        "En las reuniones de los lunes, Ana y Pablo no dicen lo que piensan hasta que yo salgo de la sala.",
    },
  },
};

/** Prompt de sistema: pide JSON estricto y en español rioplatense. */
export function buildSystemPrompt(kind: ReviewKind): string {
  const spec = REVIEW_KINDS[kind];
  return [
    "Sos DC, el coach ejecutivo digital del método The Business Multiplier.",
    spec.criteria,
    `Ejemplo de texto flojo: "${spec.example.bad}" → mejor: "${spec.example.good}"`,
    "",
    "Respondé SOLO con un objeto JSON válido, sin markdown, sin explicaciones fuera del JSON:",
    '{"verdict":"ok"|"weak"|"poor","message":"...","suggestion":"..."}',
    "",
    '- "message": una sola frase, en segunda persona (voseo), diciendo qué falta. Vacío si verdict es "ok".',
    '- "suggestion": la reescritura completa lista para usar, en las palabras del usuario. Omitila si verdict es "ok".',
    "- No inventes datos que el usuario no dio: si falta un dato, deja un hueco claro como [fecha] o [responsable].",
    "- Sé breve. El usuario está escribiendo un formulario, no leyendo un informe.",
  ].join("\n");
}

export function buildUserPrompt(req: ReviewRequest): string {
  const ctx = Object.entries(req.context ?? {})
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v.trim()}`)
    .join("\n");
  const value = req.value.trim().slice(0, MAX_LENGTH);
  return ctx ? `Contexto:\n${ctx}\n\nTexto a revisar:\n${value}` : `Texto a revisar:\n${value}`;
}

// ── Parseo defensivo ────────────────────────────────────────────────────────

/**
 * Parsea la respuesta del modelo. **Nunca lanza**: si el modelo devuelve basura
 * (JSON inválido, markdown alrededor, campos faltantes, verdict inventado),
 * devuelve `null` y la UI no muestra nada.
 *
 * Degradar a silencio es deliberado: un error visible en el módulo central de la
 * app es peor que no ayudar.
 */
export function parseReviewResponse(raw: string): ReviewResult | null {
  if (!raw?.trim()) return null;

  // Los modelos suelen envolver el JSON en ```json … ``` aunque se les pida que no.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // Si quedó texto alrededor, tomar el primer objeto balanceado.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as Record<string, unknown>;

  const verdict = typeof o.verdict === "string" ? o.verdict.toLowerCase().trim() : "";
  if (verdict !== "ok" && verdict !== "weak" && verdict !== "poor") return null;

  // "ok" = no molestar. Se normaliza a mensaje vacío y sin sugerencia.
  if (verdict === "ok") return { verdict: "ok", message: "" };

  const message = typeof o.message === "string" ? o.message.trim() : "";
  const suggestion = typeof o.suggestion === "string" ? o.suggestion.trim() : "";

  // weak/poor sin mensaje no sirve de nada → se trata como "sin veredicto".
  if (!message && !suggestion) return null;

  return {
    verdict,
    message,
    ...(suggestion ? { suggestion } : {}),
  };
}
