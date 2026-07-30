import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type NotificationType =
  | "task_blocked"
  | "task_overdue"
  | "task_done"
  | "task_assigned"
  | "war_up_started"
  | "scorecard_updated"
  | "coaching_note"
  | "cycle_reminder"
  | "los_level_up"
  | "daily_digest";

export const NOTIF_META: Record<
  NotificationType,
  { icon: string; color: string }
> = {
  task_blocked: { icon: "🚨", color: "var(--danger-text)" },
  task_overdue: { icon: "⏰", color: "var(--warn-text)" },
  task_done: { icon: "✅", color: "var(--success-text)" },
  task_assigned: { icon: "📥", color: "var(--warn-text)" },
  war_up_started: { icon: "⚡", color: "var(--accent-text)" },
  scorecard_updated: { icon: "📊", color: "#a78bfa" },
  coaching_note: { icon: "🎓", color: "var(--success-text)" },
  cycle_reminder: { icon: "🗓️", color: "#8b5cf6" },
  // S22 · §J1 — "si sube de rango porque lo hace bien, que aparezca que subió".
  los_level_up: { icon: "🎖️", color: "var(--success-text)" },
  // S23 · §A1 — marca de idempotencia del despertador diario. Se inserta ya
  // leída (`read_at`), así que no aparece como pendiente en la campana: su
  // función es evitar que una segunda corrida del cron duplique el correo.
  daily_digest: { icon: "☀️", color: "var(--warn-text)" },
};

export function notifMeta(type: string) {
  return (
    NOTIF_META[type as NotificationType] ?? { icon: "🔔", color: "var(--fg-muted)" }
  );
}

/** "hace 5m" / "hace 2h" / "ayer" / "hace 3 días" */
export function timeAgo(date: string | null): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  return `hace ${d} días`;
}

/**
 * Inserta una notificación. Fire-and-forget: nunca rompe el flujo del
 * evento que la genera (un fallo acá no debe frenar la acción principal).
 * No notifica si el destinatario es quien ejecutó la acción.
 */
export async function notify(
  supabase: SupabaseClient<Database>,
  params: {
    companyId: string;
    userId: string; // destinatario
    actorId?: string; // quien ejecuta la acción (para evitar auto-notificarse)
    type: NotificationType;
    title: string;
    body?: string;
    href?: string;
  }
): Promise<void> {
  if (params.actorId && params.actorId === params.userId) return;
  try {
    await supabase.from("notifications").insert({
      company_id: params.companyId,
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      href: params.href ?? null,
    });
  } catch (e) {
    console.error("notify() falló (no bloqueante):", e);
  }
}
