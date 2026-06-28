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
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        minWidth: 220,
        cursor: "pointer",
      }}
    >
      <Search size={14} />
      <span style={{ flex: 1, textAlign: "left" }}>Buscar</span>
      <span
        className="flex"
        style={{ gap: 3, fontSize: 10, color: "rgba(255,255,255,0.62)" }}
      >
        <kbd
          style={{
            padding: "1px 5px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          ⌘
        </kbd>
        <kbd
          style={{
            padding: "1px 5px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          K
        </kbd>
      </span>
    </button>
  );
}
