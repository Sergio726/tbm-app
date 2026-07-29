"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, mailCanSendExternal } from "@/lib/email";
import { trustedOrigin } from "@/lib/trusted-origin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInviteHtml(opts: { link: string; companyName: string }): string {
  const company = escapeHtml(opts.companyName || "tu equipo");
  const link = escapeHtml(opts.link);
  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f4f6fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e6e9f0;">
      <div style="font-size:34px;margin-bottom:8px;">🎯</div>
      <h1 style="margin:0 0 4px;font-size:20px;color:#0f172a;">Te invitaron al equipo</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#64748b;">${company} · The Business Multiplier</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">
        Te invitaron a unirte como colaborador. Hacé clic en el botón para confirmar tu email
        y completar tu perfil en el equipo.
      </p>
      <a href="${link}"
         style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;
                text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:10px;">
        Unirme al equipo →
      </a>
      <p style="font-size:12px;color:#94a3b8;margin:22px 0 0;line-height:1.5;">
        Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>
        <a href="${link}" style="color:#2563EB;word-break:break-all;">${link}</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
      The Business Multiplier · método de Dilio Donado
    </p>
  </div>
</body>
</html>`;
}

/**
 * `link` va SIEMPRE, también cuando el email salió bien. Antes solo se devolvía
 * en el camino `manual` (envío fallido) y eso dejaba al Arquitecto sin salida
 * cuando el proveedor respondía OK pero el correo no llegaba (spam, filtro
 * corporativo, greylisting). Reportado por Dilio el 2026-07-25 — ver
 * `docs/OBSERVACIONES_DILIO_2026-07.md` §K1.
 */
export type SendTeamInviteResult =
  | { ok: true; via: "email"; link: string }
  | { ok: true; via: "manual"; link: string; reason?: string }
  | { ok: false; error: string };

/**
 * Envía invitación de equipo usando el `token` propio de la tabla `invitations`
 * (unique, 256-bit, 7 días de vida). Reemplaza al magic link OTP de Supabase, que
 * era de un solo uso / ~1h y lo quemaban los pre-fetch de email (SafeLinks,
 * antivirus, proxies de Gmail) → el invitado llegaba sin sesión y no podía aceptar.
 * El link `/accept-invite?token=…` es reusable dentro de la ventana de 7 días y no
 * depende de ninguna sesión previa. Reinvitar al mismo email refresca `expires_at`.
 */
export async function sendTeamInvite(input: {
  email: string;
  companyId: string;
  origin: string;
}): Promise<SendTeamInviteResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Ingresá un email válido." };
  }
  if (!input.companyId) {
    return { ok: false, error: "Falta la empresa." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, companies(name)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "arquitecto") {
    return { ok: false, error: "Solo el Arquitecto puede invitar colaboradores." };
  }

  const companyName =
    (profile as { companies?: { name: string } | null }).companies?.name ?? "tu equipo";

  // T2: NUNCA confiar en el origin del cliente para links con token embebido.
  const origin = trustedOrigin(input.origin);
  if (!origin) {
    return {
      ok: false,
      error: "Falta configurar NEXT_PUBLIC_APP_URL en el servidor para enviar invitaciones.",
    };
  }

  // Upsert de la invitación pendiente (unique company_id+email) y traer su token.
  const expiresAt = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
  const { data: existing } = await supabase
    .from("invitations")
    .select("id, token")
    .eq("company_id", input.companyId)
    .eq("email", email)
    .maybeSingle();

  let token: string | null = null;
  if (existing?.id) {
    const { data: upd, error: updErr } = await supabase
      .from("invitations")
      .update({ status: "pending", expires_at: expiresAt })
      .eq("id", existing.id)
      .select("token")
      .single();
    if (updErr || !upd?.token) {
      console.error("sendTeamInvite: update invitation", updErr);
      return { ok: false, error: "No se pudo actualizar la invitación." };
    }
    token = upd.token;
  } else {
    const { data: ins, error: invErr } = await supabase
      .from("invitations")
      .insert({
        company_id: input.companyId,
        invited_by: user.id,
        email,
        role: "colaborador",
        expires_at: expiresAt,
      })
      .select("token")
      .single();
    if (invErr || !ins?.token) {
      console.error("sendTeamInvite: insert invitation", invErr);
      return { ok: false, error: "No se pudo crear la invitación." };
    }
    token = ins.token;
  }

  const link = `${origin}/accept-invite?token=${encodeURIComponent(token)}`;

  // Con dominio verificado en Resend → email en español. Si no hay dominio
  // verificado o el envío falla → link manual para compartir por WhatsApp/etc.
  if (await mailCanSendExternal()) {
    const emailResult = await sendEmail({
      to: email,
      subject: `Te invitaron a ${companyName} — The Business Multiplier`,
      html: buildInviteHtml({ link, companyName }),
    });
    if (emailResult.ok) return { ok: true, via: "email", link };
    return { ok: true, via: "manual", link, reason: emailResult.error };
  }

  return {
    ok: true,
    via: "manual",
    link,
    reason:
      "Configurá el correo (dominio verificado) en el panel de admin → Correo para envío automático.",
  };
}

/**
 * Devuelve el link `/accept-invite?token=…` de una invitación pendiente ya creada,
 * para que el Arquitecto pueda compartirlo por fuera del email (WhatsApp, etc.)
 * cuando el correo no llega. Complementa a `sendTeamInvite`: acá no se envía nada
 * ni se toca `expires_at`, solo se lee el token existente.
 *
 * Seguridad: mismo guard que `cancelInvite` (solo Arquitecto) + filtro explícito
 * por su `company_id`, encima del RLS. El token NO se precarga en el listado de
 * `/equipo` a propósito: se pide on-demand para no dejar todos los tokens de la
 * empresa en el HTML de la página.
 */
export async function getInviteLink(input: {
  id: string;
  origin: string;
}): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "arquitecto" || !profile.company_id) {
    return { ok: false, error: "Solo el Arquitecto puede obtener el link." };
  }

  // T2: nunca confiar en el origin del cliente para links con token embebido.
  const origin = trustedOrigin(input.origin);
  if (!origin) {
    return {
      ok: false,
      error: "Falta configurar NEXT_PUBLIC_APP_URL en el servidor.",
    };
  }

  const { data: inv, error } = await supabase
    .from("invitations")
    .select("token")
    .eq("id", input.id)
    .eq("company_id", profile.company_id)
    .maybeSingle();
  if (error) {
    console.error("getInviteLink:", error);
    return { ok: false, error: "No se pudo obtener el link." };
  }
  if (!inv?.token) return { ok: false, error: "No se encontró la invitación." };

  return {
    ok: true,
    link: `${origin}/accept-invite?token=${encodeURIComponent(inv.token)}`,
  };
}

/**
 * Cancela (borra) una invitación pendiente. Usa el admin client filtrando por la
 * `company_id` del Arquitecto que llama, así funciona aunque la policy DELETE de
 * `invitations` no esté aplicada todavía. Borrar libera el par (company_id,email)
 * para poder reinvitar.
 */
export async function cancelInvite(input: {
  id: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "arquitecto" || !profile.company_id) {
    return { ok: false, error: "Solo el Arquitecto puede cancelar invitaciones." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Falta configuración del servidor (service role)." };
  }

  const { error } = await admin
    .from("invitations")
    .delete()
    .eq("id", input.id)
    .eq("company_id", profile.company_id);
  if (error) {
    console.error("cancelInvite:", error);
    return { ok: false, error: "No se pudo cancelar la invitación." };
  }
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(opts: { link: string; memberName: string; companyName: string }): string {
  const name = escapeHtml(opts.memberName || "Hola");
  const company = escapeHtml(opts.companyName || "tu equipo");
  const link = escapeHtml(opts.link);
  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f4f6fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e6e9f0;">
      <div style="font-size:34px;margin-bottom:8px;">🧭</div>
      <h1 style="margin:0 0 4px;font-size:20px;color:#0f172a;">Tu test DISC</h1>
      <p style="margin:0 0 18px;font-size:14px;color:#64748b;">Invitación de ${company}</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">
        ${name}, te invitaron a completar tu <strong>test DISC</strong>: un mapa de tu forma natural
        de comportarte. Son <strong>24 grupos de palabras</strong> y toma unos <strong>5 minutos</strong>.
        No hay respuestas correctas — respondé con tu primera reacción.
      </p>
      <a href="${link}"
         style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;
                text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:10px;">
        Hacer mi test DISC →
      </a>
      <p style="font-size:12px;color:#94a3b8;margin:22px 0 0;line-height:1.5;">
        Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/>
        <a href="${link}" style="color:#2563EB;word-break:break-all;">${link}</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
      The Business Multiplier · método de Dilio Donado
    </p>
  </div>
</body>
</html>`;
}

export type SendDiscLinkResult = { ok: true } | { ok: false; error: string };

export async function sendDiscLinkEmail(input: {
  link: string;
  to: string;
  memberName: string;
}): Promise<SendDiscLinkResult> {
  const to = input.to.trim();
  if (!EMAIL_RE.test(to)) return { ok: false, error: "El email del destinatario no es válido." };
  if (!input.link) return { ok: false, error: "Falta el link del test." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa." };

  // Solo un Arquitecto puede enviar links de test.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, companies(name)")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "arquitecto") {
    return { ok: false, error: "Solo el Arquitecto puede enviar el link." };
  }
  const companyName =
    (profile as { companies?: { name: string } | null }).companies?.name ?? "tu equipo";

  const result = await sendEmail({
    to,
    subject: "Tu test DISC — The Business Multiplier",
    html: buildHtml({ link: input.link, memberName: input.memberName, companyName }),
  });

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/**
 * Genera el link de test DISC con gating de créditos (Fase 2 A3). Reemplaza el
 * INSERT client-side: el descuento del crédito + la creación del token ocurren
 * atómicamente en la RPC `generate_disc_link` (SECURITY DEFINER). Reusar un
 * pendiente no cobra; sin créditos → { ok:false, error:'sin_creditos' }.
 */
export async function generateDiscLink(
  profileId: string
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no_sesion" };

  const { data, error } = await supabase.rpc("generate_disc_link", {
    p_profile_id: profileId,
  });
  if (error) {
    console.error("generateDiscLink RPC error", error);
    return { ok: false, error: "rpc_error" };
  }
  const res = (data ?? {}) as { ok?: boolean; token?: string; error?: string };
  if (res.ok && res.token) return { ok: true, token: res.token };
  return { ok: false, error: res.error ?? "error" };
}
