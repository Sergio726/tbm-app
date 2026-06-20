"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

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

export type SendTeamInviteResult =
  | { ok: true; via: "email" }
  | { ok: true; via: "manual"; link: string }
  | { ok: false; error: string };

/** Envía invitación de equipo con magic link que funciona en cualquier dispositivo. */
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

  const { data: existingRows } = await supabase
    .from("invitations")
    .select("id")
    .eq("company_id", input.companyId)
    .eq("email", email)
    .limit(1);

  if (!existingRows?.[0]?.id) {
    const { error: invErr } = await supabase.from("invitations").insert({
      company_id: input.companyId,
      invited_by: user.id,
      email,
      role: "colaborador",
    });
    if (invErr) {
      console.error("sendTeamInvite: insert invitation", invErr);
      return { ok: false, error: "No se pudo crear la invitación." };
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Configuración del servidor incompleta." };
  }

  const nextPath = `/accept-invite?company=${input.companyId}`;
  const confirmBase = `${input.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: confirmBase },
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("sendTeamInvite: generateLink", linkErr);
    return { ok: false, error: "No se pudo generar el link de invitación." };
  }

  const tokenHash = linkData.properties.hashed_token;
  const inviteLink = `${input.origin}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&next=${encodeURIComponent(nextPath)}`;

  const emailResult = await sendEmail({
    to: email,
    subject: `Te invitaron a ${companyName} — The Business Multiplier`,
    html: buildInviteHtml({ link: inviteLink, companyName }),
  });

  if (emailResult.ok) return { ok: true, via: "email" };

  // Resend no configurado o dominio sin verificar: devolver link para compartir manualmente.
  const { error: otpErr } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${input.origin}${nextPath}` },
  });

  if (!otpErr) {
    return { ok: true, via: "email" };
  }

  console.error("sendTeamInvite: Resend y OTP fallaron", emailResult.error, otpErr);
  return {
    ok: true,
    via: "manual",
    link: inviteLink,
  };
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
