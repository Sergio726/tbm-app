"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  if (res.ok) {
    const admin = createAdminClient();
    await admin?.from("audit_log").insert({
      actor_id: user.id,
      action: "grant_credits",
      target_type: "company",
      target_id: companyId,
      after: { amount: Math.trunc(amount), balance: res.balance ?? null, reason: reason.trim() || null },
    });
  }
  revalidatePath("/empresas");
  return res.ok
    ? { ok: true, balance: res.balance ?? 0 }
    : { ok: false, error: res.error ?? "error" };
}

/**
 * Crea un líder (arquitecto) + su empresa desde el panel (alta de pilotos). Acceso por
 * contraseña temporal (email en modo test). Devuelve email + contraseña una sola vez.
 */
export async function createLiderAndCompany(input: {
  fullName: string;
  email: string;
  companyName: string;
  cargo?: string;
  initialCredits?: number;
}): Promise<
  | { ok: true; email: string; tempPassword: string; companyId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const companyName = input.companyName.trim();
  if (!fullName || !email || !companyName) return { ok: false, error: "datos_incompletos" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  const tempPassword = `${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}Aa1!`;

  // 1. Crear usuario auth (el trigger handle_new_user crea el profile colaborador).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? "";
    return {
      ok: false,
      error: /already|registered|exists|duplicate/i.test(msg) ? "email_existe" : "create_user_error",
    };
  }
  const userId = created.user.id;

  // 2. Crear la empresa.
  const { data: company, error: compErr } = await admin
    .from("companies")
    .insert({ name: companyName, owner_id: userId })
    .select("id")
    .single();
  if (compErr || !company) {
    await admin.auth.admin.deleteUser(userId); // rollback: no dejar usuario huérfano
    return { ok: false, error: "company_error" };
  }
  const companyId = company.id;

  // 3. Promover el profile a arquitecto + vincular empresa.
  await admin
    .from("profiles")
    .update({
      role: "arquitecto",
      company_id: companyId,
      full_name: fullName,
      cargo: input.cargo?.trim() || null,
      onboarding_completed: false,
    })
    .eq("id", userId);

  // 4. Audit.
  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "create_lider",
    target_type: "company",
    target_id: companyId,
    after: { email, companyName },
  });

  // 5. Créditos iniciales (opcional) — vía RPC (auth.uid = admin → pasa is_platform_admin).
  const initial = Math.trunc(input.initialCredits ?? 0);
  if (initial > 0) {
    await supabase.rpc("grant_credits", {
      p_company_id: companyId,
      p_amount: initial,
      p_reason: "alta beta",
      p_type: "grant",
    });
  }

  revalidatePath("/empresas");
  return { ok: true, email, tempPassword, companyId };
}
