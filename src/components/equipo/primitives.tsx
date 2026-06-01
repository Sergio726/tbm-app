"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { DISC_STATUS_LABEL } from "@/lib/disc";
import { FONT } from "./types";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  Icon,
  label,
  color,
  hint,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-center" style={{ gap: 9 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${color}1c`,
            border: `1px solid ${color}33`,
            color,
          }}
        >
          <Icon size={14} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      </div>
      {hint && (
        <p
          style={{
            fontSize: 11.5,
            color: "rgba(255,255,255,0.45)",
            marginTop: 6,
            marginLeft: 37,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        className="flex items-center justify-between"
        style={{ gap: 8 }}
      >
        <Label>{label}</Label>
        {hint && (
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)" }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

export function ToggleBtn({
  active,
  disabled,
  onClick,
  Icon,
  label,
  color,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center transition-colors"
      style={{
        flex: 1,
        gap: 8,
        padding: "9px 14px",
        borderRadius: 10,
        cursor: disabled ? "default" : "pointer",
        background: active ? `${color}1f` : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.07)"}`,
        color: active ? color : "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

export function StatusPill({ status }: { status: string | null }) {
  const key = status ?? "pendiente";
  const done = key === "completado";
  const color = done ? "#34d399" : key === "enviado" ? "#fbbf24" : "#64748b";
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        padding: "5px 11px",
        borderRadius: 99,
        background: `${color}1c`,
        border: `1px solid ${color}40`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {DISC_STATUS_LABEL[key] ?? key}
    </span>
  );
}

export function MiniBtn({
  active,
  onClick,
  label,
  color = "#bcd0ff",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: active ? `${color}28` : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.08)"}`,
        color: active ? color : "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#fff",
  fontSize: 13,
  fontFamily: FONT,
  outline: "none",
};
