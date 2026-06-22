"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2 } from "lucide-react";
import { LogoutButton } from "@/app/(panel)/logout-button";

const NAV = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/empresas", label: "Empresas", icon: Building2, exact: false },
];

export function AdminSidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col"
      style={{
        position: "fixed",
        inset: "0 auto 0 0",
        width: "var(--sidebar-w)",
        background: "var(--bg-elev)",
        borderRight: "1px solid var(--border)",
        padding: "18px 14px",
        zIndex: 20,
      }}
    >
      {/* Marca */}
      <div className="flex items-center" style={{ gap: 9, padding: "4px 8px 18px" }}>
        <span
          className="flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
            fontSize: 14,
            fontWeight: 900,
            color: "#fff",
          }}
        >
          T
        </span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>TBM Admin</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "var(--accent)" }}>
            GOD MODE
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col" style={{ gap: 3 }}>
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center"
              style={{
                gap: 10,
                padding: "9px 11px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                color: active ? "#fff" : "var(--muted)",
                background: active ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${active ? "rgba(91,138,255,0.3)" : "transparent"}`,
              }}
            >
              <Icon size={16} strokeWidth={1.9} color={active ? "var(--accent)" : "currentColor"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer usuario */}
      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center" style={{ gap: 9, padding: "0 6px 12px" }}>
          <span
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--accent-soft)",
              border: "1px solid rgba(91,138,255,0.35)",
              color: "#9bb8ff",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {(userEmail ?? "?").charAt(0)}
          </span>
          <span
            style={{
              fontSize: 11.5,
              color: "var(--muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={userEmail ?? undefined}
          >
            {userEmail}
          </span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
