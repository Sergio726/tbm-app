"use client";

import { Users } from "lucide-react";

export function EmptyDetail() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        padding: "60px 20px",
        borderRadius: 16,
        border: "1px dashed rgba(255,255,255,0.12)",
        color: "var(--fg-subtle)",
        minHeight: 320,
      }}
    >
      <Users size={32} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.6 }} />
      <p style={{ fontSize: 14 }}>Tu equipo todavía no tiene miembros.</p>
      <p style={{ fontSize: 12.5, marginTop: 6, maxWidth: 360 }}>
        Usá &quot;Invitar colaborador&quot;. Cuando acepten, vas a poder mapear su perfil
        DISC y nivel de delegación aquí.
      </p>
    </div>
  );
}
