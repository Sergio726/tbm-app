"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types/database";
import { notifMeta, timeAgo } from "@/lib/notifications";

/**
 * Campana del header con badge real + panel dropdown.
 * Al abrir: trae las últimas 10 y marca como leídas las no-leídas.
 */
export function NotificationsBell({
  userId,
  initialUnread,
}: {
  userId: string;
  initialUnread: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  async function openPanel() {
    setOpen(true);
    setLoading(true);
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    setItems((data ?? []) as AppNotification[]);
    setLoading(false);

    // Marcar como leídas las que se están mostrando
    const hasUnread = (data ?? []).some((n) => !n.read_at);
    if (hasUnread) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
      setUnread(0);
    }
  }

  async function markAll() {
    const supabase = createBrowserClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    setUnread(0);
    setItems((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
    );
  }

  function goTo(n: AppNotification) {
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="relative flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: open ? "rgba(91,138,255,0.12)" : "rgba(255,255,255,0.025)",
          border: open
            ? "1px solid rgba(91,138,255,0.3)"
            : "1px solid rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute flex items-center justify-center text-[9px] font-bold text-white"
            style={{
              top: 4,
              right: 4,
              minWidth: 15,
              height: 15,
              padding: "0 4px",
              borderRadius: 99,
              background: "#f87171",
              border: "2px solid #0a0e1a",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* overlay para cerrar al click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 overflow-hidden rounded-2xl border"
            style={{
              width: 360,
              background: "#0f1525",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <span className="text-[13.5px] font-bold text-white">
                Notificaciones
              </span>
              <button
                type="button"
                onClick={markAll}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-white/50 transition hover:text-white/80"
              >
                <CheckCheck size={12} />
                Marcar todo
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading && (
                <p className="px-4 py-6 text-center text-[12.5px] text-white/65">
                  Cargando…
                </p>
              )}
              {!loading && items.length === 0 && (
                <p className="px-4 py-8 text-center text-[12.5px] text-white/65">
                  Sin notificaciones todavía.
                </p>
              )}
              {items.map((n) => {
                const meta = notifMeta(n.type);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => goTo(n)}
                    className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition hover:bg-white/[0.03]"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <span className="mt-0.5 text-[15px]">{meta.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: meta.color }}
                        >
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10.5px] text-white/65">
                          {timeAgo(n.created_at)}
                        </span>
                      </span>
                      {n.body && (
                        <span className="mt-0.5 block truncate text-[12px] text-white/55">
                          {n.body}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/notificaciones");
              }}
              className="w-full border-t px-4 py-2.5 text-center text-[12px] font-semibold text-[#9fb9ff] transition hover:bg-white/[0.03]"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              Ver todas →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
