"use server";

// N2 · Pedir créditos DESDE la app (reemplaza el mailto).
// Registra el pedido (RLS: arquitecto de su empresa) y le avisa al admin por email.
// La carga sigue siendo manual desde el admin (beta).

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, getSupportEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/credits";
import { createCheckoutSession, stripeConfigured } from "@/lib/stripe";
import { trustedOrigin } from "@/lib/trusted-origin";

export type RequestCreditsResult = { ok: true } | { ok: false; error: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function requestCredits(input: {
  amount?: number | null;
  note?: string | null;
}): Promise<RequestCreditsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Recargá la página." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, full_name, email, companies(name)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "arquitecto" || !profile.company_id) {
    return { ok: false, error: "Solo el Arquitecto puede pedir créditos." };
  }

  const companyName = (profile.companies as { name: string } | null)?.name ?? "—";
  const amount =
    typeof input.amount === "number" && input.amount > 0 ? Math.floor(input.amount) : null;
  const note = input.note?.trim() ? input.note.trim().slice(0, 500) : null;

  // Evitar pedidos duplicados: si ya hay uno pendiente para la empresa, no apilar.
  const { count: pendingCount } = await supabase
    .from("credit_requests")
    .select("id", { count: "exact", head: true })
    .eq("company_id", profile.company_id)
    .eq("status", "pending");
  if ((pendingCount ?? 0) > 0) {
    return { ok: false, error: "Ya tenés un pedido pendiente. Te avisamos cuando lo carguemos." };
  }

  const { error: insErr } = await supabase.from("credit_requests").insert({
    company_id: profile.company_id,
    requested_by: user.id,
    amount,
    note,
  });
  if (insErr) {
    console.error("requestCredits insert:", insErr.message);
    return { ok: false, error: "No pude registrar el pedido. Probá de nuevo." };
  }

  // Aviso al admin (best-effort: si el email falla, el pedido igual quedó registrado).
  try {
    const to = (await getSupportEmail()) ?? SUPPORT_EMAIL;
    const who = profile.full_name?.trim() || profile.email || "Un arquitecto";
    // SEC-B2: escapar todo lo que viene del usuario (companyName, who, email,
    // note) para no inyectar HTML/markup en el correo que lee el admin.
    const safeCompany = escapeHtml(companyName);
    const safeWho = escapeHtml(who);
    const safeEmail = profile.email ? escapeHtml(profile.email) : "";
    const safeNote = note ? escapeHtml(note) : "—";
    await sendEmail({
      to,
      subject: `Pedido de créditos · ${companyName}`,
      html: `
        <h2>Nuevo pedido de créditos</h2>
        <p><strong>Empresa:</strong> ${safeCompany}</p>
        <p><strong>Solicita:</strong> ${safeWho}${safeEmail ? ` (${safeEmail})` : ""}</p>
        <p><strong>Cantidad pedida:</strong> ${amount ?? "sin especificar"}</p>
        <p><strong>Nota:</strong> ${safeNote}</p>
        <p>Cargá los créditos desde el panel admin (Empresas → ${safeCompany}).</p>
      `,
    });
  } catch (e) {
    console.error("requestCredits email:", e);
  }

  revalidatePath("/creditos");
  return { ok: true };
}

export type StartCheckoutResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Inicia la compra de un paquete de créditos: crea un `purchase` pendiente y una
 * Checkout Session de Stripe, y devuelve la URL para redirigir. La acreditación
 * la hace el webhook (PAY-4/§10), no acá.
 */
export async function startCheckout(packageId: string): Promise<StartCheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Recargá la página." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, email")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "arquitecto" || !profile.company_id) {
    return { ok: false, error: "Solo el Arquitecto puede comprar créditos." };
  }
  const companyId = profile.company_id;

  if (!stripeConfigured()) {
    return { ok: false, error: "Los pagos todavía no están configurados." };
  }
  const origin = trustedOrigin(undefined);
  if (!origin) {
    return { ok: false, error: "Falta configurar NEXT_PUBLIC_APP_URL en el servidor." };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Falta configuración del servidor (service role)." };

  const { data: pkg } = await admin
    .from("credit_packages")
    .select("id, stripe_price_id, credits, amount_cents, currency, active")
    .eq("id", packageId)
    .maybeSingle();
  if (!pkg || !pkg.active) {
    return { ok: false, error: "Ese paquete no está disponible." };
  }

  const { data: purchase, error: purErr } = await admin
    .from("purchases")
    .insert({
      company_id: companyId,
      package_id: pkg.id,
      credits: pkg.credits,
      amount_cents: pkg.amount_cents,
      currency: pkg.currency,
      status: "pending",
    })
    .select("id")
    .single();
  if (purErr || !purchase) {
    console.error("startCheckout: purchase insert", purErr);
    return { ok: false, error: "No se pudo iniciar la compra." };
  }

  const session = await createCheckoutSession({
    priceId: pkg.stripe_price_id,
    successUrl: `${origin}/creditos?compra=ok`,
    cancelUrl: `${origin}/creditos?compra=cancelada`,
    customerEmail: profile.email ?? undefined,
    metadata: { purchase_id: purchase.id, company_id: companyId },
  });
  if (!session) {
    await admin.from("purchases").update({ status: "failed" }).eq("id", purchase.id);
    return { ok: false, error: "No se pudo crear el checkout. Probá de nuevo." };
  }

  await admin.from("purchases").update({ stripe_session_id: session.id }).eq("id", purchase.id);
  return { ok: true, url: session.url };
}
