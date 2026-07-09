import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStripeSignature, type StripeEvent } from "@/lib/stripe";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Webhook de Stripe (auditoria.md PAY-4 / §10). Se protege con la firma (no con
 * sesión); el middleware ya excluye /api. Idempotente en dos capas:
 *   1. webhook_events.id (PK) — el mismo evento no se reprocesa.
 *   2. purchases.status='paid' dentro de apply_purchase_credits.
 *
 * Sin STRIPE_WEBHOOK_SECRET responde 503 y no hace nada (no rompe el deploy).
 * Devuelve 500 ante fallos de procesamiento para que Stripe reintente.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "stripe_no_configurado" }, { status: 503 });
  }

  // Raw body: necesario para verificar la firma (no usar req.json()).
  const rawBody = await req.text();
  const event = verifyStripeSignature(rawBody, req.headers.get("stripe-signature"), secret);
  if (!event) {
    return NextResponse.json({ ok: false, error: "firma_invalida" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "sin_service_role" }, { status: 503 });
  }

  // Idempotencia: insertar-primero. El event.id es PK → un reintento choca.
  const { error: insErr } = await admin.from("webhook_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Json,
    status: "received",
  });
  if (insErr) {
    if ((insErr as { code?: string }).code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("stripe webhook: insert event", insErr);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(admin, event);
    }
    await admin
      .from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("id", event.id);
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("stripe webhook: procesando", event.type, e);
    await admin
      .from("webhook_events")
      .update({ status: "error", error: String(e).slice(0, 500) })
      .eq("id", event.id);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  event: StripeEvent
): Promise<void> {
  const session = event.data.object as {
    payment_status?: string;
    metadata?: { purchase_id?: string; company_id?: string } | null;
  };
  // Solo acreditar sesiones efectivamente pagadas.
  if (session.payment_status && session.payment_status !== "paid") return;

  const purchaseId = session.metadata?.purchase_id;
  if (!purchaseId) {
    throw new Error("checkout.session.completed sin purchase_id en metadata");
  }

  const { data, error } = await admin.rpc("apply_purchase_credits", {
    p_purchase_id: purchaseId,
    p_event_id: event.id,
  });
  if (error) throw error;
  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    throw new Error(`apply_purchase_credits: ${result?.error ?? "desconocido"}`);
  }
}
