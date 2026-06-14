"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  RotateCcw,
  Users,
  Send,
  MessageSquare,
  Target,
  BookOpen,
  Zap,
  LineChart,
  Bell,
  LogOut,
  HelpCircle,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRestartTour } from "@/hooks/use-restart-tour";

// ── Módulos TBM ──────────────────────────────────────────────
type ModuleItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

const MODULES: ModuleItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Rituales", href: "/rituales", Icon: RotateCcw },
  { label: "Mi Equipo", href: "/equipo", Icon: Users },
  { label: "Delegación", href: "/delegacion", Icon: Send },
  { label: "Feedback S.E.C.", href: "/feedback", Icon: MessageSquare },
  { label: "Plan 90D", href: "/plan-90d", Icon: Target },
  { label: "Workbooks", href: "/workbooks", Icon: BookOpen },
  { label: "Multiplicador", href: "/multiplicador", Icon: Zap },
  { label: "Diagnósticos", href: "/diagnosticos", Icon: LineChart },
];

interface SidebarProps {
  userId: string;
  companyName?: string;
  userInitials?: string;
  userStatusLabel?: string;
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  /** true si el usuario tiene empresas asignadas como coach (S9). */
  isCoach?: boolean;
}

/**
 * Sidebar TBM — Aurora V3
 * Premium / glass: gradiente vertical, halos ambientales, item activo con
 * borde tintado + sombra interior, avatar con dot de sesión y bell con
 * notificación.
 */
export function Sidebar({
  userId,
  companyName,
  userInitials,
  userStatusLabel,
  userName,
  isCoach,
  userRole,
  avatarUrl,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { restart: restartTour } = useRestartTour(userId);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full flex-col overflow-hidden text-white"
      style={{
        width: "var(--sidebar-width)",
        background:
          "linear-gradient(180deg, #101627 0%, #0a0e18 60%, #0a0e18 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Halos ambientales ─────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -80,
          left: -60,
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle, rgba(91,138,255,0.22), transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: 120,
          right: -100,
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, rgba(91,138,255,0.08), transparent 65%)",
          filter: "blur(30px)",
        }}
      />

      {/* ── Contenido sobre los halos ─────────────────── */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 px-[22px] pb-[22px] pt-6">
          <div
            className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, #5b8aff 0%, #2c5fe6 60%, #1a3ea8 100%)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
              boxShadow:
                "0 8px 24px rgba(91,138,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            TBM
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-white"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}
            >
              {companyName ?? "Mi Empresa"}
            </p>
            <p
              className="truncate"
              style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}
            >
              Business Multiplier
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          data-tour="sidebar-nav"
          className="flex flex-1 flex-col gap-[3px] overflow-y-auto px-[14px] py-1.5"
        >
          {MODULES.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                data-tour={`nav-${href.slice(1)}`}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex items-center gap-[13px] rounded-[11px] transition-colors duration-150"
                style={{
                  padding: "11px 14px",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(91,138,255,0.22) 0%, rgba(91,138,255,0.06) 100%)"
                    : "transparent",
                  border: `1px solid ${
                    isActive ? "rgba(91,138,255,0.28)" : "transparent"
                  }`,
                  boxShadow: isActive
                    ? "0 8px 22px rgba(91,138,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "none",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.62)",
                  fontSize: 13.5,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    color: isActive ? "#bcd0ff" : "rgba(255,255,255,0.55)",
                    filter: isActive
                      ? "drop-shadow(0 0 6px rgba(91,138,255,0.5))"
                      : "none",
                  }}
                >
                  <Icon size={17} strokeWidth={1.6} />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          {/* Panel Super Coach — solo visible para coaches asignados (S9) */}
          {isCoach && (
            <Link
              href="/super-coach"
              data-tour="nav-super-coach"
              aria-current={pathname.startsWith("/super-coach") ? "page" : undefined}
              className="group relative flex items-center gap-[13px] rounded-[11px] transition-colors duration-150"
              style={{
                padding: "11px 14px",
                marginTop: 8,
                background: pathname.startsWith("/super-coach")
                  ? "linear-gradient(135deg, rgba(52,211,153,0.20) 0%, rgba(52,211,153,0.05) 100%)"
                  : "rgba(52,211,153,0.05)",
                border: `1px solid ${
                  pathname.startsWith("/super-coach")
                    ? "rgba(52,211,153,0.35)"
                    : "rgba(52,211,153,0.18)"
                }`,
                color: pathname.startsWith("/super-coach") ? "#fff" : "rgba(255,255,255,0.7)",
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{ color: "#34d399" }}
              >
                <GraduationCap size={17} strokeWidth={1.6} />
              </span>
              <span className="truncate">Super Coach</span>
            </Link>
          )}
        </nav>

        {/* Footer user — glass card con dot de sesión + bell */}
        <div className="p-[14px]">
          <div
            data-tour="user-avatar"
            className="flex items-center gap-[11px] rounded-xl"
            style={{
              padding: "12px 13px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <Link
              href="/cuenta"
              title="Mi cuenta"
              className="flex min-w-0 flex-1 items-center gap-[11px] rounded-lg transition-opacity hover:opacity-90"
            >
              <div className="relative">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={userName ?? "Avatar"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg, #f87171, #b91c1c)",
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(248,113,113,0.25)",
                    }}
                  >
                    {userInitials ?? "A"}
                  </div>
                )}
                {/* Dot de sesión */}
                <div
                  className="absolute bottom-0 right-0"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#10b981",
                    border: "2px solid #0a0e18",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>
                  {userName ?? "Mi cuenta"}
                </p>
                <p className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {userRole ?? userStatusLabel ?? "En sesión"}
                </p>
              </div>
            </Link>
            <div className="flex items-center" style={{ gap: 6 }}>
              <button
                type="button"
                aria-label="Notificaciones"
                className="relative flex items-center justify-center transition-colors hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <Bell size={16} strokeWidth={1.6} />
                {/* Indicador de notificación */}
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    top: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#5b8aff",
                    border: "2px solid #0a0e18",
                  }}
                />
              </button>
              <button
                type="button"
                onClick={restartTour}
                aria-label="Ver tour de nuevo"
                title="Ver tour de nuevo"
                className="flex items-center justify-center transition-colors hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <HelpCircle size={16} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex items-center justify-center transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  padding: 4,
                  borderRadius: 6,
                  cursor: signingOut ? "not-allowed" : "pointer",
                }}
              >
                {signingOut ? (
                  <span
                    className="animate-spin"
                    aria-hidden
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid currentColor",
                      borderTopColor: "transparent",
                    }}
                  />
                ) : (
                  <LogOut size={16} strokeWidth={1.6} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
