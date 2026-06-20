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
  | "cycle_reminder";

export const NOTIF_META: Record<
  NotificationType,
  { icon: string; color: string }
> = {
  task_blocked: { icon: "🚨", color: "#f87171" },
  task_overdue: { icon: "⏰", color: "#fb923c" },
  task_done: { icon: "✅", color: "#34d399" },
  task_assigned: { icon: "📥", color: "#fbbf24" },
  war_up_started: { icon: "⚡", color: "#5b8aff" },
  scorecard_updated: { icon: "📊", color: "#a78bfa" },
  coaching_note: { icon: "🎓", color: "#34d399" },
  cycle_reminder: { icon: "🗓️", color: "#8b5cf6" },
};

export function notifMeta(type: string) {
  return (
    NOTIF_META[type as NotificationType] ?? { icon: "🔔", color: "#94a3b8" }
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
