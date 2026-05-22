import Link from "next/link";
import { ArrowLeft, Zap, Wrench } from "lucide-react";

export default function WarUpPlaceholderPage() {
  return (
    <div style={{ padding: "32px 40px", color: "#fff", maxWidth: 720 }}>
      <Link
        href="/rituales"
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Rituales
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(91,138,255,0.12)",
              border: "1px solid rgba(91,138,255,0.28)",
              color: "#5b8aff",
            }}
          >
            <Zap size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              War Up
            </h1>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
              Stand-up digital en vivo · Supabase Realtime
            </div>
          </div>
        </div>
      </header>

      <div
        style={{
          padding: "24px 26px",
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(91,138,255,0.10), rgba(91,138,255,0.02))",
          border: "1px solid rgba(91,138,255,0.25)",
        }}
      >
        <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
          <Wrench size={16} color="#bcd0ff" />
          <div
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#bcd0ff",
              letterSpacing: 1.3,
            }}
          >
            En construcción · Sprint 2
          </div>
        </div>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 8,
            letterSpacing: -0.3,
          }}
        >
          El stand-up en vivo se activa con la migración del Sprint 2 aplicada
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.55,
            marginBottom: 14,
          }}
        >
          La sala en tiempo real necesita las tablas <code>war_ups</code> y{" "}
          <code>war_up_entries</code> con Realtime publicado (ya están en{" "}
          <code>supabase/migration_sprint2.sql</code>). El Arquitecto inicia la sala,
          cada colaborador ingresa QUÉ / POR QUÉ / BLOQUEO y la validación llega al
          Arquitecto en vivo. Los ítems sin Roca asociada se mandan al{" "}
          <Link
            href="/rituales/parking-lot"
            style={{ color: "#bcd0ff", textDecoration: "underline" }}
          >
            Parking Lot
          </Link>{" "}
          con un click.
        </p>
        <p
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.55,
          }}
        >
          Una vez aplicada la migración en Supabase, se construye la UI completa
          (canal Realtime, timer de 15 min, validación inline).
        </p>
      </div>
    </div>
  );
}
