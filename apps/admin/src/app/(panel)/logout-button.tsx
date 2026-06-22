"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      className="flex items-center"
      style={{
        gap: 7,
        padding: "6px 12px",
        borderRadius: 9,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: signingOut ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {signingOut ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
