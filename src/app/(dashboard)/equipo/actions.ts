"use server";

import { createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
