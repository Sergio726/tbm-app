// =============================================================
// Envío de emails transaccionales vía Resend (server-only)
// Gateado por RESEND_API_KEY + RESEND_FROM. Sin configurar, devuelve
// un error claro y no rompe el resto de la app.
// Doc: https://resend.com/docs/api-reference/emails/send-email
// =============================================================

const API_URL = "https://api.resend.com/emails";

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        "El envío de emails no está configurado (faltan RESEND_API_KEY / RESEND_FROM en el entorno).",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("email: Resend respondió", res.status, detail);
      // Mensajes típicos: dominio sin verificar, destinatario no permitido en modo test.
      return { ok: false, error: "No se pudo enviar el email. Revisá la configuración de Resend." };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    console.error("email: error enviando", e);
    return { ok: false, error: "No se pudo enviar el email (error de red o timeout)." };
  } finally {
    clearTimeout(timeout);
  }
}
