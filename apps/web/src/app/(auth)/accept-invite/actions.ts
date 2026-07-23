"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server actions de aceptación de invitación por `token` propio de la tabla
 * `invitations` (no depende de sesión previa ni del OTP de Supabase). Corren con
 * el service_role (admin client), que bypassa RLS y el trigger
 * `enforce_profile_role_company`. El email SIEMPRE sale de la fila `invitations`,
 * nunca de input del usuario → no se puede crear una cuenta para otro email.
 */

type InviteErrCode = "invalid" | "expired" | "used" | "already_linked" | "weak_password";

export type InviteInfoResult =
  | { ok: true; email: string; companyName: string }
  | { ok: false; error: string; code: InviteErrCode };

export type AcceptInviteResult =
  | { ok: true; email: string }
  | { ok: false; error: string; code?: InviteErrCode };

const EXPIRED_MSG =
  "Este link de invitación expiró. Pedile al Arquitecto que te reenvíe la invitación.";
const USED_MSG =
  "Esta invitación ya fue aceptada. Iniciá sesión con tu email y contraseña.";
const INVALID_MSG = "Este link de invitación no es válido.";
const ALREADY_LINKED_MSG =
  "Ese email ya pertenece a una empresa. Si es tuyo, iniciá sesión; si no, pedile al Arquitecto que te invite con otro email.";

function isExpired(status: string | null, expiresAt: string | null): boolean {
  return status !== "pending" || (!!expiresAt && Date.parse(expiresAt) < Date.now());
}

/** Lee la invitación por token para mostrar empresa + email al montar la página. */
export async function getInviteInfo(token: string): Promise<InviteInfoResult> {
  if (!token) return { ok: false, error: INVALID_MSG, code: "invalid" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Falta configuración del servidor.", code: "invalid" };

  const { data: invite } = await admin
    .from("invitations")
    .select("id, email, status, expires_at, companies(name)")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { ok: false, error: INVALID_MSG, code: "invalid" };
  if (invite.status === "accepted") return { ok: false, error: USED_MSG, code: "used" };
  if (isExpired(invite.status, invite.expires_at)) {
    return { ok: false, error: EXPIRED_MSG, code: "expired" };
  }

  const companyName =
    (invite as { companies?: { name: string } | null }).companies?.name ?? "tu equipo";
  return { ok: true, email: invite.email, companyName };
}

/**
 * Acepta la invitación: crea (o actualiza) el usuario con la contraseña elegida,
 * vincula el perfil a la empresa como colaborador y marca la invitación aceptada.
 * La sesión NO se crea acá — el browser hace signInWithPassword con la misma
 * contraseña tras un `ok`.
 */
export async function acceptTeamInvite(input: {
  token: string;
  fullName: string;
  cargo?: string;
  password: string;
}): Promise<AcceptInviteResult> {
  const fullName = input.fullName?.trim() ?? "";
  const cargo = input.cargo?.trim() || null;
  const password = input.password ?? "";

  if (!fullName) return { ok: false, error: "Ingresá tu nombre completo." };
  if (password.length < 8) {
    return {
      ok: false,
      error: "Creá una contraseña de al menos 8 caracteres para poder volver a entrar.",
      code: "weak_password",
    };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Falta configuración del servidor." };

  const { data: invite } = await admin
    .from("invitations")
    .select("id, email, status, expires_at, company_id")
    .eq("token", input.token)
    .maybeSingle();

  if (!invite) return { ok: false, error: INVALID_MSG, code: "invalid" };
  if (invite.status === "accepted") return { ok: false, error: USED_MSG, code: "used" };
  if (isExpired(invite.status, invite.expires_at)) {
    // best-effort: dejar registrado que venció.
    await admin.from("invitations").update({ status: "expired" }).eq("id", invite.id);
    return { ok: false, error: EXPIRED_MSG, code: "expired" };
  }

  const email = invite.email.toLowerCase();

  // ¿Ya hay un perfil para ese email? (usuario preexistente o reinvitado).
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, company_id")
    .ilike("email", email)
    .maybeSingle();

  let userId: string;

  if (existingProfile) {
    if (existingProfile.company_id) {
      return { ok: false, error: ALREADY_LINKED_MSG, code: "already_linked" };
    }
    // Cuenta existente sin empresa → setear la contraseña que eligió ahora.
    userId = existingProfile.id;
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { full_name: fullName },
    });
    if (updErr) {
      console.error("acceptTeamInvite: updateUserById", updErr);
      return {
        ok: false,
        error: "No pudimos guardar tu contraseña. Probá con otra.",
        code: "weak_password",
      };
    }
  } else {
    // Alta nueva: el trigger handle_new_user crea el profile base.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "";
      if (/already|registered|exists|duplicate/i.test(msg)) {
        return { ok: false, error: ALREADY_LINKED_MSG, code: "already_linked" };
      }
      console.error("acceptTeamInvite: createUser", createErr);
      return {
        ok: false,
        error: /password/i.test(msg)
          ? "Esa contraseña es muy débil. Probá con otra."
          : "No pudimos crear tu cuenta. Probá de nuevo.",
        code: "weak_password",
      };
    }
    userId = created.user.id;
  }

  // Vincular el perfil a la empresa como colaborador (admin bypassa el trigger).
  const { data: linked, error: profErr } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      cargo,
      company_id: invite.company_id,
      role: "colaborador",
      onboarding_completed: true,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (profErr || !linked) {
    console.error("acceptTeamInvite: link profile", profErr);
    return { ok: false, error: "No pudimos vincular tu perfil al equipo. Probá de nuevo." };
  }

  await admin
    .from("invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return { ok: true, email };
}

/** Guard de auto-registro: ¿este email tiene una invitación pendiente vigente? */
export async function checkPendingInvite(
  email: string
): Promise<{ token: string } | null> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const { data: invite } = await admin
    .from("invitations")
    .select("token, status, expires_at")
    .ilike("email", normalized)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invite?.token) return null;
  if (isExpired(invite.status, invite.expires_at)) return null;
  return { token: invite.token };
}
