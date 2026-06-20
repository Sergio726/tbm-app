"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Carga (regalo/ajuste) de créditos a una empresa. La RPC `grant_credits` valida
 * `is_platform_admin()` internamente; igual revalidamos el guard antes por defensa.
 */
export async function grantCredits(
  companyId: string,
  amount: number,
  reason: string
): Promise<{ ok: true; balance: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return { ok: false, error: "no_autorizado" };
  if (!companyId || !Number.isFinite(amount) || Math.trunc(amount) === 0) {
    return { ok: false, error: "monto_invalido" };
  }

  const { data, error } = await supabase.rpc("grant_credits", {
    p_company_id: companyId,
    p_amount: Math.trunc(amount),
    p_reason: reason.trim() || null,
    p_type: "grant",
  });
  if (error) {
    console.error("grant_credits RPC error", error);
    return { ok: false, error: "rpc_error" };
  }
  const res = (data ?? {}) as { ok?: boolean; balance?: number; error?: string };
  revalidatePath("/empresas");
  return res.ok
    ? { ok: true, balance: res.balance ?? 0 }
    : { ok: false, error: res.error ?? "error" };
}
