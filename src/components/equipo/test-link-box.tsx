"use client";

import { useState } from "react";
import { Link2, Copy, Check, Sparkles } from "lucide-react";
import { inputStyle } from "./primitives";

export function TestLinkBox({
  token,
  status,
  generating,
  onGenerate,
}: {
  token: string | null;
  status: string | null;
  generating: boolean;
  onGenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const completed = status === "completado";
  const url =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/disc/${token}`
      : token
        ? `/disc/${token}`
        : "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 10,
        background: completed
          ? "rgba(52,211,153,0.08)"
          : "rgba(91,138,255,0.08)",
        border: completed
          ? "1px solid rgba(52,211,153,0.25)"
          : "1px solid rgba(91,138,255,0.22)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ gap: 8, marginBottom: completed ? 6 : 8 }}
      >
        <div className="flex items-center" style={{ gap: 7 }}>
          {completed ? (
            <Check size={13} style={{ color: "#34d399" }} />
          ) : (
            <Link2 size={13} style={{ color: "#9fb9ff" }} />
          )}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: completed ? "#34d399" : "#9fb9ff",
            }}
          >
            {completed
              ? "Test DISC completado"
              : token
                ? "Link de test DISC"
                : "Evaluación DISC en la app"}
          </span>
        </div>
        {completed && (
          <span
            className="flex items-center"
            style={{
              gap: 4,
              fontSize: 10.5,
              fontWeight: 600,
              color: "#34d399",
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid rgba(52,211,153,0.35)",
              background: "rgba(52,211,153,0.12)",
            }}
          >
            <Sparkles size={10} /> +1 logro
          </span>
        )}
      </div>

      {completed ? (
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
          La persona ya completó el test; su perfil se calculó y cargó automáticamente.
        </p>
      ) : token ? (
        <>
          <div className="flex items-center" style={{ gap: 8 }}>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              style={{ ...inputStyle, fontSize: 11.5 }}
            />
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                gap: 5,
                padding: "9px 12px",
                borderRadius: 9,
                cursor: "pointer",
                background: "rgba(91,138,255,0.2)",
                border: "1px solid rgba(91,138,255,0.4)",
                color: "#bcd0ff",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}{" "}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              background: "none",
              border: "none",
              cursor: generating ? "default" : "pointer",
              padding: 0,
            }}
          >
            {generating ? "Generando…" : "↻ Regenerar link (invalida el anterior)"}
          </button>
        </>
      ) : (
        <>
          <p
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,0.55)",
              margin: "0 0 8px",
            }}
          >
            Generá un enlace para que la persona responda el test DISC. El perfil se
            calcula solo.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center"
            style={{
              gap: 7,
              padding: "8px 14px",
              borderRadius: 9,
              cursor: generating ? "default" : "pointer",
              background: "rgba(91,138,255,0.2)",
              border: "1px solid rgba(91,138,255,0.4)",
              color: "#bcd0ff",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Link2 size={14} /> {generating ? "Generando…" : "Generar link de test"}
          </button>
        </>
      )}
    </div>
  );
}
