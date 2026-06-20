"use client";

import type { ReactNode } from "react";

/** Tooltip glassmorphism de los tiles del Hero Strip. No bloquea el click. */
export function TileTooltip({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        minWidth: 230,
        padding: "12px 14px",
        borderRadius: 12,
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

export function TooltipRow({
  icon,
  children,
}: {
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 py-1 text-[12px]"
      style={{ color: "rgba(255,255,255,0.75)" }}
    >
      {icon && <span className="text-[12px]">{icon}</span>}
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
