import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/types/database";
import { notifMeta, timeAgo } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const notifications = (data ?? []) as AppNotification[];

  // Al visitar el historial, todo queda leído
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <div
      className="text-white"
      style={{
        padding: "32px 40px 60px",
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-white/55 transition hover:text-white/80"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <header className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "rgba(91,138,255,0.12)",
            border: "1px solid rgba(91,138,255,0.25)",
            color: "#9fb9ff",
          }}
        >
          <Bell size={18} strokeWidth={1.7} />
        </div>
        <div>
          <h1 className="m-0 text-[22px] font-bold tracking-tight">
            Notificaciones
          </h1>
          <p className="mt-0.5 text-[12.5px] text-white/55">
            Historial completo · últimas {notifications.length}
          </p>
        </div>
      </header>

      {notifications.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-10 text-center text-[13.5px] text-white/45"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          Sin notificaciones todavía. Acá van a aparecer las tareas asignadas,
          escaladas, completadas y los War Ups iniciados.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const meta = notifMeta(n.type);
            const inner = (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 transition hover:bg-white/[0.03]"
                style={{
                  borderColor: n.read_at
                    ? "rgba(255,255,255,0.06)"
                    : `${meta.color}40`,
                  background: n.read_at
                    ? "rgba(255,255,255,0.015)"
                    : `${meta.color}0a`,
                }}
              >
                <span className="mt-0.5 text-[16px]">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[13.5px] font-semibold"
                      style={{ color: meta.color }}
                    >
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-white/35">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-0.5 text-[12.5px] leading-snug text-white/60">
                      {n.body}
                    </p>
                  )}
                </div>
              </div>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
