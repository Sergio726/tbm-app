// Créditos del líder (pre-beta #7) — helpers de presentación del ledger.
// Modelo: 1 crédito = 1 test DISC. El saldo vive en company_credits y cada
// movimiento queda en credit_transactions (ver migration_fase2_credits.sql).

/** Correo al que el líder pide más créditos (beta: carga manual). Cambiar acá. */
export const SUPPORT_EMAIL = "tbm@stlabs.ar";

/** Etiqueta legible del tipo de movimiento del ledger. */
export const CREDIT_TYPE_LABEL: Record<string, string> = {
  grant: "Carga / regalo",
  consume: "Test DISC",
  adjust: "Ajuste",
  promo: "Promo",
  expire: "Expiración",
  purchase: "Compra",
};

export function creditTypeLabel(type: string): string {
  return CREDIT_TYPE_LABEL[type] ?? type;
}

/** Fecha corta legible (es-AR): "12 jun 2026, 14:30". */
export function formatCreditDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** mailto pre-armado para "Pedir más créditos". */
export function buildCreditRequestMailto(companyName?: string | null): string {
  const subject = "Quiero cargar créditos (The Business Multiplier)";
  const body =
    `Hola, soy el líder${companyName ? ` de "${companyName}"` : ""} y quiero sumar créditos ` +
    `para generar tests DISC.\n\n¿Cómo lo coordinamos?\n\nGracias.`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
