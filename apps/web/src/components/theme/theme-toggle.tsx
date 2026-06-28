"use client";

import { Moon, Sun, Monitor, type LucideIcon } from "lucide-react";
import { useTheme, type ThemePref } from "./theme-provider";

const OPTIONS: { value: ThemePref; label: string; Icon: LucideIcon }[] = [
  { value: "dark", label: "Oscuro", Icon: Moon },
  { value: "light", label: "Claro", Icon: Sun },
  { value: "system", label: "Sistema", Icon: Monitor },
];

/** Selector de tema (Oscuro / Claro / Sistema). Usa tokens → se ve bien en ambos temas. */
export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  return (
    <div
      className="inline-flex gap-1 rounded-xl p-1"
      style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
      role="radiogroup"
      aria-label="Tema de la interfaz"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPref(value)}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors"
            style={{
              background: active ? "var(--accent)" : "transparent",
              color: active ? "var(--accent-fg)" : "var(--fg-muted)",
            }}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
