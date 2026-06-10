"use client";

import { useEffect, useState } from "react";

export const OPEN_PALETTE_EVENT = "tbm:open-command-palette";

/** Dispara la apertura del palette desde cualquier componente (ej. el search del header). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

/**
 * Estado del Command Palette: ⌘K / Ctrl+K lo togglea, Esc lo cierra,
 * y escucha el CustomEvent para abrirse desde triggers externos.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpenEvent = () => setOpen(true);

    document.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  return { open, setOpen };
}
