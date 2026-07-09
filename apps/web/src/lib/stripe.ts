// Integración con Stripe SIN SDK (raw fetch + node:crypto), consistente con el
// resto de adapters del repo (OpenRouter/Anthropic/Resend). Server-only.
// Depende del schema de billing (migration_fase4_billing_schema.sql + _rpc.sql).

import { createHmac, timingSafeEqual } from "node:crypto";

const CHECKOUT_URL = "https://api.stripe.com/v1/checkout/sessions";
const SIGNATURE_TOLERANCE_SEC = 300; // ±5 min de skew de reloj (recomendado por Stripe)

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export function stripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Verifica la firma del webhook (header `stripe-signature`) contra el signing
 * secret, en tiempo constante y con tolerancia de reloj. Devuelve el evento
 * parseado, o null si la firma es inválida/expirada. Equivale a
 * stripe.webhooks.constructEvent sin depender del SDK.
 */
export function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string
): StripeEvent | null {
  if (!sigHeader) return null;

  let t = "";
  const v1s: string[] = [];
  for (const part of sigHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === "t") t = v;
    else if (k === "v1") v1s.push(v);
  }
  if (!t || v1s.length === 0) return null;

  // Tolerancia de reloj (evita replays viejos).
  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > SIGNATURE_TOLERANCE_SEC) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const expBuf = Buffer.from(expected);
  const matches = v1s.some((v1) => {
    const b = Buffer.from(v1);
    return b.length === expBuf.length && timingSafeEqual(b, expBuf);
  });
  if (!matches) return null;

  try {
    return JSON.parse(rawBody) as StripeEvent;
  } catch {
    return null;
  }
}

/**
 * Crea una Checkout Session de pago único. Devuelve { id, url } o null si falla.
 * El `metadata` viaja de vuelta en el webhook (company_id, purchase_id, …).
 */
export async function createCheckoutSession(params: {
  priceId: string;
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}): Promise<{ id: string; url: string } | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", params.successUrl);
  form.set("cancel_url", params.cancelUrl);
  form.set("line_items[0][price]", params.priceId);
  form.set("line_items[0][quantity]", String(params.quantity ?? 1));
  if (params.customerEmail) form.set("customer_email", params.customerEmail);
  for (const [k, v] of Object.entries(params.metadata)) {
    form.set(`metadata[${k}]`, v);
  }

  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!res.ok) {
    console.error("stripe: checkout session", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as { id?: string; url?: string };
  if (!data.id || !data.url) return null;
  return { id: data.id, url: data.url };
}
