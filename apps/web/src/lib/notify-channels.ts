/**
 * Capa de canal de notificaciones salientes (S23 · §A1).
 *
 * Una sola indirección, a propósito chica: la lógica de negocio (qué avisar y a
 * quién) no debe saber CÓMO se entrega. Hoy solo hay email; cuando lleguen las
 * credenciales de WhatsApp (§A2 → S31) se agrega un `case` acá y un adapter, sin
 * tocar el cron ni las preferencias.
 *
 * No es un framework de notificaciones: es el punto único donde se decide el
 * transporte. Si algún día hace falta reintentos o colas, este es el lugar.
 */

import { sendEmail } from "@/lib/email";
import type { NotificationPrefs } from "@/types/database";

export type Channel = "email" | "whatsapp";

export type DeliverResult = { ok: true; channel: Channel } | { ok: false; error: string };

export type DeliverInput = {
  channel: Channel;
  /** Email o teléfono según el canal. */
  to: string;
  subject: string;
  html: string;
};

export async function deliver(input: DeliverInput): Promise<DeliverResult> {
  switch (input.channel) {
    case "email": {
      const r = await sendEmail({ to: input.to, subject: input.subject, html: input.html });
      return r.ok ? { ok: true, channel: "email" } : { ok: false, error: r.error };
    }
    case "whatsapp":
      // S31. La API ya está contratada (confirmado con Dilio el 25/07, la tiene
      // Juanjo); falta credenciales + plantillas aprobadas por Meta.
      return { ok: false, error: "El canal WhatsApp todavía no está disponible." };
    default: {
      // Exhaustividad: si se agrega un canal al tipo y no se maneja acá, TS avisa.
      const never: never = input.channel;
      return { ok: false, error: `Canal desconocido: ${String(never)}` };
    }
  }
}

// ── Preferencias ────────────────────────────────────────────────────────────

/**
 * Defaults cuando el usuario NO tiene fila en `notification_prefs`.
 *
 * Regla del sprint: **sin fila = todo activado**. Es el caso de todos los
 * usuarios que ya existen (no se hizo backfill a propósito), así que estos
 * defaults son el comportamiento real de la mayoría. Si fueran `false`, el
 * despertador no le llegaría a nadie hasta que entrara a configurarlo.
 */
export const PREFS_DEFAULTS = {
  daily_digest: true,
  task_alerts: true,
  weekly_report: true,
  channel_email: true,
  preferred_hour: null as number | null,
} as const;

export type EffectivePrefs = {
  dailyDigest: boolean;
  taskAlerts: boolean;
  weeklyReport: boolean;
  channelEmail: boolean;
  preferredHour: number | null;
};

/** Aplica los defaults sobre una fila que puede no existir. */
export function effectivePrefs(row: Partial<NotificationPrefs> | null | undefined): EffectivePrefs {
  return {
    dailyDigest: row?.daily_digest ?? PREFS_DEFAULTS.daily_digest,
    taskAlerts: row?.task_alerts ?? PREFS_DEFAULTS.task_alerts,
    weeklyReport: row?.weekly_report ?? PREFS_DEFAULTS.weekly_report,
    channelEmail: row?.channel_email ?? PREFS_DEFAULTS.channel_email,
    preferredHour: row?.preferred_hour ?? PREFS_DEFAULTS.preferred_hour,
  };
}

/** Canales activos para este usuario, en orden de preferencia. */
export function activeChannels(prefs: EffectivePrefs): Channel[] {
  const out: Channel[] = [];
  if (prefs.channelEmail) out.push("email");
  return out;
}
