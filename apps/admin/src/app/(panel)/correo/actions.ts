"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RESEND_URL = "https://api.resend.com/emails";

export type EmailConfigView = {
  provider: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  supportEmail: string;
  enabled: boolean;
  hasSecret: boolean;
};

const EMPTY: EmailConfigView = {
  provider: "resend",
  fromName: "The Business Multiplier",
  fromEmail: "",
  replyTo: "",
  supportEmail: "",
  enabled: false,
  hasSecret: false,
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  return { user, isAdmin: !!isAdmin };
}

export async function getEmailConfig(): Promise<EmailConfigView | null> {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) return null;
  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("email_config")
    .select("provider, from_name, from_email, reply_to, support_email, enabled, api_key_ref")
    .eq("scope", "platform")
    .maybeSingle();

  if (!data) return EMPTY;
  return {
    provider: data.provider ?? "resend",
    fromName: data.from_name ?? EMPTY.fromName,
    fromEmail: data.from_email ?? "",
    replyTo: data.reply_to ?? "",
    supportEmail: data.support_email ?? "",
    enabled: data.enabled,
    hasSecret: !!data.api_key_ref,
  };
}

export async function saveEmailConfig(input: {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  supportEmail: string;
  enabled: boolean;
  apiKey?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return { ok: false, error: "no_sesion" };
  if (!isAdmin) return { ok: false, error: "no_autorizado" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  // Guardar el secreto (key de Resend) en Vault si vino uno nuevo.
  let apiKeyRef: string | undefined;
  if (input.apiKey && input.apiKey.trim()) {
    const { data: ref, error: keyErr } = await admin.rpc("email_set_secret", {
      p_secret: input.apiKey.trim(),
    });
    if (keyErr || !ref) return { ok: false, error: "vault_error" };
    apiKeyRef = ref;
  }

  const row = {
    provider: "resend",
    from_name: input.fromName.trim() || null,
    from_email: input.fromEmail.trim() || null,
    reply_to: input.replyTo.trim() || null,
    support_email: input.supportEmail.trim() || null,
    enabled: input.enabled,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
    ...(apiKeyRef ? { api_key_ref: apiKeyRef } : {}),
  };

  const { data: existing } = await admin
    .from("email_config")
    .select("id")
    .eq("scope", "platform")
    .maybeSingle();

  if (existing) {
    await admin.from("email_config").update(row).eq("id", existing.id);
  } else {
    await admin.from("email_config").insert({ scope: "platform", ...row });
  }

  await admin.from("audit_log").insert({
    actor_id: user.id,
    action: "edit_email_config",
    target_type: "email_config",
    target_id: "platform",
    after: {
      from_email: row.from_email,
      reply_to: row.reply_to,
      support_email: row.support_email,
      enabled: input.enabled,
      key_updated: !!apiKeyRef,
    },
  });

  revalidatePath("/correo");
  return { ok: true };
}

/** Envía un email de prueba con la config guardada (key del Vault). */
export async function testEmailConnection(
  to: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user, isAdmin } = await requireAdmin();
  if (!user) return { ok: false, error: "no_sesion" };
  if (!isAdmin) return { ok: false, error: "no_autorizado" };
  if (!to.trim() || !to.includes("@")) return { ok: false, error: "destino_invalido" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "sin_service_role" };

  const { data: cfg } = await admin
    .from("email_config")
    .select("from_name, from_email, reply_to")
    .eq("scope", "platform")
    .maybeSingle();

  if (!cfg?.from_email) return { ok: false, error: "sin_remitente" };

  const { data: key } = await admin.rpc("email_get_secret");
  if (!key) return { ok: false, error: "sin_key" };

  const from = cfg.from_name ? `${cfg.from_name} <${cfg.from_email}>` : cfg.from_email;

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to: [to.trim()],
        subject: "Prueba de correo · The Business Multiplier",
        html: "<p>✅ Si recibiste este email, la configuración de correo funciona.</p>",
        ...(cfg.reply_to ? { reply_to: cfg.reply_to } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let message = "";
      try {
        message = (JSON.parse(detail) as { message?: string }).message ?? "";
      } catch {
        /* respuesta no JSON */
      }
      // Solo 401 es problema de API key. El resto (403 dominio no verificado,
      // 422, etc.) es de configuración → mostramos el mensaje real de Resend
      // en vez de "key inválida" (que confunde).
      if (res.status === 401) return { ok: false, error: message || "key_invalida" };
      return { ok: false, error: message || "fallo_envio" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "fallo_conexion" };
  }
}
