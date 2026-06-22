"use client";

import { useEffect, useRef, useState } from "react";
import { JarvisCore } from "./jarvis-core";
import { sendJarvisMessage } from "@/app/(dashboard)/jarvis/actions";
import type { ChatMessage } from "@/lib/ai";

const ERRORS: Record<string, string> = {
  no_sesion: "Tu sesión expiró. Recargá la página.",
  disabled: "El asistente todavía no está activado. Pedile al administrador que lo configure.",
  sin_config: "El asistente todavía no está configurado (falta la API key).",
  provider_no_implementado: "El proveedor configurado no está disponible.",
  key_invalida: "La API key configurada es inválida.",
  fallo: "No pude responder ahora mismo. Probá de nuevo en un momento.",
};

const SUGGESTIONS = [
  "¿A quién debería delegar según el DISC de mi equipo?",
  "Resumime en qué enfocarme esta semana.",
  "¿Cómo lidero mejor a un perfil Dominante?",
];

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export function JarvisPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending) return;
    const userMsg: Msg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);

    const history: ChatMessage[] = next.map((m) => ({ role: m.role, content: m.content }));
    const r = await sendJarvisMessage(history);
    setPending(false);
    if (r.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: r.reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: ERRORS[r.error] ?? "No pude responder.", error: true },
      ]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80 }}
        aria-hidden
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Asistente JARVIS"
        className="jarvis-panel-in flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "#0b1220",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          zIndex: 81,
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 12 }}
        >
          <div className="flex items-center" style={{ gap: 10 }}>
            <span style={{ position: "relative", width: 24, height: 24 }}>
              <JarvisCore size={24} />
            </span>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>JARVIS</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Asistente · beta</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1" style={{ overflowY: "auto", padding: 16 }}>
          {messages.length === 0 ? (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Soy tu asistente del método TBM. Preguntame sobre tu equipo, delegación o cómo
                multiplicar tu negocio.
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 12 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "10px 13px",
                    borderRadius: 14,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    background:
                      m.role === "user"
                        ? "rgba(91,138,255,0.2)"
                        : m.error
                          ? "rgba(248,113,113,0.12)"
                          : "rgba(255,255,255,0.05)",
                    border: `1px solid ${
                      m.role === "user"
                        ? "rgba(91,138,255,0.35)"
                        : m.error
                          ? "rgba(248,113,113,0.3)"
                          : "rgba(255,255,255,0.08)"
                    }`,
                    color: m.error ? "#fca5a5" : "rgba(255,255,255,0.92)",
                  }}
                >
                  {m.content}
                </div>
              ))}
              {pending && (
                <div style={{ alignSelf: "flex-start", fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
                  JARVIS está pensando…
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-end" style={{ gap: 8 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Escribí tu pregunta…"
              style={{
                flex: 1,
                resize: "none",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                padding: "10px 12px",
                fontSize: 13.5,
                maxHeight: 120,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(91,138,255,0.22)",
                border: "1px solid rgba(91,138,255,0.4)",
                color: "#9bb8ff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: pending || !input.trim() ? "not-allowed" : "pointer",
                opacity: pending || !input.trim() ? 0.5 : 1,
              }}
            >
              Enviar
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
