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
    // N2: si la carga fue positiva, resolvé los pedidos pendientes de la empresa.
    if (Math.trunc(amount) > 0) {
      await admin
        ?.from("credit_requests")
        .update({ status: "granted", resolved_at: new Date().toISOString(), resolved_by: user.id })
        .eq("company_id", companyId)
        .eq("status", "pending");
    }
  }
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);
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
    user_metadata: { full_name: fullName, must_change_password: true },
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

/**
 * Edita datos de la empresa (nombre, sector) y de su líder (nombre, cargo, email).
 * El cambio de email toca auth (`updateUserById`) → se hace primero por ser lo más
 * propenso a fallar; si falla, no se commitea nada más. Registra en audit_log.
 */
export async function updateCompanyDetails(input: {
  companyId: string;
  name: string;
  sector?: string;
  liderUserId?: string | null;
  liderFullName?: string;
  liderCargo?: string;
  liderEmail?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "nombre_requerido" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  // Estado previo (para el audit).
  const { data: before } = await admin
    .from("companies")
    .select("name, sector")
    .eq("id", input.companyId)
    .maybeSingle();

  let liderBefore: { full_name: string | null; cargo: string | null; email: string | null } | null =
    null;
  if (input.liderUserId) {
    const { data } = await admin
      .from("profiles")
      .select("full_name, cargo, email")
      .eq("id", input.liderUserId)
      .maybeSingle();
    liderBefore = data ?? null;
  }

  // 1. Email del líder (auth) — lo más frágil primero.
  const newEmail = input.liderEmail?.trim().toLowerCase();
  if (input.liderUserId && newEmail && newEmail !== liderBefore?.email) {
    const { error: emailErr } = await admin.auth.admin.updateUserById(input.liderUserId, {
      email: newEmail,
      email_confirm: true,
    });
    if (emailErr) {
      return {
        ok: false,
        error: /already|registered|exists|duplicate/i.test(emailErr.message) ? "email_existe" : "email_error",
      };
    }
  }

  // 2. Empresa.
  await admin.from("companies").update({ name, sector: input.sector?.trim() || null }).eq("id", input.companyId);

  // 3. Perfil del líder.
  if (input.liderUserId) {
    await admin
      .from("profiles")
      .update({
        full_name: input.liderFullName?.trim() || null,
        cargo: input.liderCargo?.trim() || null,
        ...(newEmail ? { email: newEmail } : {}),
      })
      .eq("id", input.liderUserId);
  }

  // 4. Audit.
  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "edit_company",
    target_type: "company",
    target_id: input.companyId,
    before: { company: before, lider: liderBefore },
    after: {
      company: { name, sector: input.sector?.trim() || null },
      lider: input.liderUserId
        ? {
            full_name: input.liderFullName?.trim() || null,
            cargo: input.liderCargo?.trim() || null,
            email: newEmail ?? liderBefore?.email ?? null,
          }
        : null,
    },
  });

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${input.companyId}`);
  return { ok: true };
}

/**
 * Suspende o reactiva una empresa. Suspendida → sus usuarios quedan bloqueados en
 * el dashboard de la web (guard del layout). Registra en audit_log.
 */
export async function setCompanyStatus(
  companyId: string,
  suspend: boolean
): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  const status = suspend ? "suspended" : "active";
  const { error } = await admin
    .from("companies")
    .update({ status, suspended_at: suspend ? new Date().toISOString() : null })
    .eq("id", companyId);
  if (error) return { ok: false, error: "update_error" };

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: suspend ? "suspend_company" : "reactivate_company",
    target_type: "company",
    target_id: companyId,
    after: { status },
  });

  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);
  return { ok: true, status };
}

/**
 * Asigna un coach a una empresa. Si ya existe un usuario con ese email, lo usa;
 * si no, crea uno nuevo (rol coach, contraseña temporal). Evita asignaciones
 * duplicadas. Registra en audit_log. Devuelve la contraseña solo si creó al usuario.
 */
export async function addCoachToCompany(input: {
  companyId: string;
  fullName: string;
  email: string;
}): Promise<
  | { ok: true; created: boolean; email: string; tempPassword?: string }
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
  if (!email) return { ok: false, error: "email_requerido" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  // ¿Ya existe un usuario con ese email? (lo buscamos por profile)
  const { data: existing } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("email", email)
    .maybeSingle();

  let coachId: string;
  let created = false;
  let tempPassword: string | undefined;

  if (existing) {
    coachId = existing.id;
  } else {
    tempPassword = `${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}Aa1!`;
    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      // must_change_password: el coach entra con clave temporal → el gate global
      // (/set-password) lo fuerza a definir una propia en el primer login.
      user_metadata: { full_name: fullName, must_change_password: true },
    });
    if (createErr || !createdUser?.user) {
      return {
        ok: false,
        error: /already|registered|exists|duplicate/i.test(createErr?.message ?? "")
          ? "email_existe"
          : "create_user_error",
      };
    }
    coachId = createdUser.user.id;
    created = true;
    // Coach: rol 'coach', sin empresa propia (coachea empresas vía coach_assignments).
    await admin
      .from("profiles")
      .update({ role: "coach", full_name: fullName || null, company_id: null })
      .eq("id", coachId);
  }

  // Evitar duplicado de asignación.
  const { data: dup } = await admin
    .from("coach_assignments")
    .select("id")
    .eq("coach_id", coachId)
    .eq("company_id", input.companyId)
    .maybeSingle();
  if (!dup) {
    const { error: assignErr } = await admin
      .from("coach_assignments")
      .insert({ coach_id: coachId, company_id: input.companyId });
    if (assignErr) return { ok: false, error: "assign_error" };
  }

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "assign_coach",
    target_type: "company",
    target_id: input.companyId,
    after: { coach_email: email, created },
  });

  revalidatePath(`/empresas/${input.companyId}`);
  return { ok: true, created, email, tempPassword };
}

/** Quita la asignación de un coach a una empresa (no borra al usuario). */
export async function removeCoachFromCompany(
  companyId: string,
  coachId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  await admin
    .from("coach_assignments")
    .delete()
    .eq("coach_id", coachId)
    .eq("company_id", companyId);

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "unassign_coach",
    target_type: "company",
    target_id: companyId,
    after: { coach_id: coachId },
  });

  revalidatePath(`/empresas/${companyId}`);
  return { ok: true };
}
