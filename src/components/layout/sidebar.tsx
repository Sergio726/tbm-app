"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Módulos TBM ──────────────────────────────────────────────
const MODULES = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⬡",
    description: "Vista central del negocio",
  },
  {
    label: "Rituales",
    href: "/rituales",
    icon: "🔄",
    description: "Pre-game · Warm Up · Cool Down",
  },
  {
    label: "Mi Equipo",
    href: "/equipo",
    icon: "👥",
    description: "DISC · LOS · Mapa de roles",
  },
  {
    label: "Delegación",
    href: "/delegacion",
    icon: "📋",
    description: "Pase de Estafeta",
  },
  {
    label: "Feedback S.E.C.",
    href: "/feedback",
    icon: "💬",
    description: "Sostener · Elevar · Corregir",
  },
  {
    label: "Plan 90D",
    href: "/plan-90d",
    icon: "🪨",
    description: "Rocas · Arena · Parqueadero",
  },
  {
    label: "Workbooks",
    href: "/workbooks",
    icon: "📖",
    description: "Sesiones S1–S8",
  },
  {
    label: "Multiplicador",
    href: "/multiplicador",
    icon: "⚡",
    description: "ROI de talento",
  },
  {
    label: "Diagnósticos",
    href: "/diagnosticos",
    icon: "📊",
    description: "Scorecards · Histórico",
  },
];

interface SidebarProps {
  companyName?: string;
  userInitials?: string;
}

export function Sidebar({ companyName, userInitials }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full z-40 flex flex-col"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* ── Logo / Empresa ───────────────────────────── */}
      <div className="px-4 py-5 border-b border-tbm-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-gradient flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            TBM
          </div>
          <div className="min-w-0">
            <p className="text-tbm-text-primary text-sm font-semibold truncate">
              {companyName ?? "Mi Empresa"}
            </p>
            <p className="text-tbm-text-muted text-xs">Business Multiplier</p>
          </div>
        </div>
      </div>

      {/* ── Navegación ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {MODULES.map((mod) => {
            const isActive =
              pathname === mod.href ||
              (mod.href !== "/dashboard" && pathname.startsWith(mod.href));

            return (
              <li key={mod.href}>
                <Link
                  href={mod.href}
                  className={cn(
                    "sidebar-item",
                    isActive && "active"
                  )}
                >
                  <span className="text-base w-5 text-center flex-shrink-0 leading-none">
                    {mod.icon}
                  </span>
                  <span className="truncate">{mod.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Usuario / Cuenta ─────────────────────────── */}
      <div className="p-3 border-t border-tbm-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-tbm-elevated cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-tbm-blue-muted flex items-center justify-center text-tbm-blue-light text-xs font-semibold flex-shrink-0">
            {userInitials ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-tbm-text-primary text-xs font-medium truncate">
              Arquitecto
            </p>
            <p className="text-tbm-text-muted text-2xs truncate">
              Ver perfil
            </p>
          </div>
          <span className="text-tbm-text-muted text-xs">↗</span>
        </div>
      </div>
    </aside>
  );
}
