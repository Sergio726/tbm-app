"use server";

// N2 · Pedir créditos DESDE la app (reemplaza el mailto).
// Registra el pedido (RLS: arquitecto de su empresa) y le avisa al admin por email.
// La carga sigue siendo manual desde el admin (beta).

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, getSupportEmail } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/credits";

export type RequestCreditsResult = { ok: true } | { ok: false; error: string };

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
    await sendEmail({
      to,
      subject: `Pedido de créditos · ${companyName}`,
      html: `
        <h2>Nuevo pedido de créditos</h2>
        <p><strong>Empresa:</strong> ${companyName}</p>
        <p><strong>Solicita:</strong> ${who}${profile.email ? ` (${profile.email})` : ""}</p>
        <p><strong>Cantidad pedida:</strong> ${amount ?? "sin especificar"}</p>
        <p><strong>Nota:</strong> ${note ?? "—"}</p>
        <p>Cargá los créditos desde el panel admin (Empresas → ${companyName}).</p>
      `,
    });
  } catch (e) {
    console.error("requestCredits email:", e);
  }

  revalidatePath("/creditos");
  return { ok: true };
}
