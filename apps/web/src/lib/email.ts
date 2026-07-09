// =============================================================
// Envío de emails transaccionales vía Resend (server-only)
// Config: se lee de la tabla email_config (panel admin, F1) y, si no está
// configurada/activa, cae a las env vars RESEND_API_KEY + RESEND_FROM. Sin
// ninguna de las dos, devuelve un error claro y no rompe el resto de la app.
// Doc: https://resend.com/docs/api-reference/emails/send-email
// =============================================================

import { createAdminClient } from "@/lib/supabase/admin";

const API_URL = "https://api.resend.com/emails";

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

type MailRuntime = { apiKey?: string; from?: string; replyTo?: string };

/**
 * Resuelve la config efectiva: email_config (si está `enabled`) pisa a las env
 * vars. Tolerante a fallos: si la DB no responde, sigue con env.
 */
async function resolveMail(): Promise<MailRuntime> {
  let apiKey = process.env.RESEND_API_KEY;
  let from = process.env.RESEND_FROM;
  let replyTo: string | undefined;

  try {
    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin
        .from("email_config")
        .select("from_name, from_email, reply_to, enabled, api_key_ref")
        .eq("scope", "platform")
        .maybeSingle();
      if (data?.enabled) {
        if (data.from_email) {
          from = data.from_name ? `${data.from_name} <${data.from_email}>` : data.from_email;
        }
        if (data.reply_to) replyTo = data.reply_to;
        if (data.api_key_ref) {
          const { data: key } = await admin.rpc("email_get_secret");
          if (key) apiKey = key as string;
        }
      }
    }
  } catch {
    /* config DB no disponible → seguimos con env */
  }

  return { apiKey, from, replyTo };
}

/** Hay API key y remitente configurados (env). Gate sync usado por /equipo. */
export function hasResendConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

/** Resend en modo prueba (@resend.dev) solo entrega al dueño de la cuenta. */
export function canSendExternalEmail(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "";
  return !!apiKey && !!from && !from.includes("@resend.dev");
}

/**
 * Versiones async que consideran la config del admin (email_config) además de
 * las env vars. Úsalas en server actions (ej. invitar colaborador) para que la
 * config del panel mande, sin depender de env vars en Vercel.
 */
export async function mailConfigured(): Promise<boolean> {
  const { apiKey, from } = await resolveMail();
  return !!apiKey && !!from;
}

export async function mailCanSendExternal(): Promise<boolean> {
  const { apiKey, from } = await resolveMail();
  return !!apiKey && !!from && !from.includes("@resend.dev");
}

/** Casilla de soporte/contacto configurada en el admin (F1), o null. */
export async function getSupportEmail(): Promise<string | null> {
  try {
    const admin = createAdminClient();
    if (!admin) return null;
    const { data } = await admin
      .from("email_config")
      .select("support_email")
      .eq("scope", "platform")
      .maybeSingle();
    return data?.support_email?.trim() || null;
  } catch {
    return null;
  }
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const { apiKey, from, replyTo } = await resolveMail();

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        "El envío de emails no está configurado (configurá el correo en el admin o cargá RESEND_API_KEY / RESEND_FROM).",
    };
  }

  const payload = JSON.stringify({
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  });

  // CRON-5: Resend limita a ~2 req/s. En ráfaga (cron) el 429 es esperable →
  // reintentar con backoff respetando `retry-after` en vez de perder el email.
  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: payload,
        signal: controller.signal,
      });

      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const waitMs = retryAfter > 0 ? retryAfter * 1000 : 500 * attempt;
        await sleep(waitMs);
        continue;
      }

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("email: Resend respondió", res.status, detail);
        try {
          const parsed = JSON.parse(detail) as { message?: string };
          if (parsed.message) {
            return { ok: false, error: parsed.message };
          }
        } catch {
          // respuesta no JSON
        }
        return { ok: false, error: "No se pudo enviar el email. Revisá la configuración de Resend." };
      }

      const data = (await res.json()) as { id?: string };
      return { ok: true, id: data.id };
    } catch (e) {
      if (attempt >= MAX_ATTEMPTS) {
        console.error("email: error enviando", e);
        return { ok: false, error: "No se pudo enviar el email (error de red o timeout)." };
      }
      await sleep(300 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, error: "No se pudo enviar el email (reintentos agotados)." };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
