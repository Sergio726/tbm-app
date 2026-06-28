"use client";

import { Search } from "lucide-react";
import { openCommandPalette } from "@/hooks/use-command-palette";

/** Botón de búsqueda del header — abre el Command Palette (⌘K). */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="hidden items-center lg:flex"
      style={{
        gap: 8,
        padding: "8px 12px",
        borderRadius: 10,
        background: "var(--elevated)",
        border: "1px solid var(--border)",
        color: "var(--fg-subtle)",
        fontSize: 13,
        minWidth: 220,
        cursor: "pointer",
      }}
    >
      <Search size={14} />
      <span style={{ flex: 1, textAlign: "left" }}>Buscar</span>
      <span
        className="flex"
        style={{ gap: 3, fontSize: 10, color: "var(--fg-muted)" }}
      >
        <kbd
          style={{
            padding: "1px 5px",
            borderRadius: 4,
            background: "var(--elevated)",
          }}
        >
          ⌘
        </kbd>
        <kbd
          style={{
            padding: "1px 5px",
            borderRadius: 4,
            background: "var(--elevated)",
          }}
        >
          K
        </kbd>
      </span>
    </button>
  );
}
