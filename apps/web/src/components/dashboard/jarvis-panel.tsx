"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { JarvisCore } from "./jarvis-core";
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
  "¿Qué es el sistema LOST?",
];

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export function JarvisPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false); // esperando el primer token
  const [streaming, setStreaming] = useState(false); // recibiendo tokens
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const autosize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
    setStreaming(false);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setTimeout(autosize, 0);
    setPending(true);

    const history: ChatMessage[] = next.map((m) => ({ role: m.role, content: m.content }));
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: ERRORS[j.error ?? ""] ?? "No pude responder.", error: true },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let started = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!started) {
          started = true;
          setPending(false);
          setStreaming(true);
          setMessages((prev) => [...prev, { role: "assistant", content: acc }]);
        } else {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      }
      if (!started) {
        setMessages((prev) => [...prev, { role: "assistant", content: "(sin respuesta)" }]);
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No pude responder ahora mismo. Probá de nuevo.", error: true },
        ]);
      }
    } finally {
      setPending(false);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    });
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80 }}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Asistente JARVIS"
        className="jarvis-panel-in flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          background: "#0b1220",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          zIndex: 81,
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
          // Reset de herencia (el orbe vive dentro de un <h1> bold): texto normal.
          fontWeight: 400,
          fontSize: 14,
          letterSpacing: "normal",
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.92)",
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
          <div className="flex items-center" style={{ gap: 4 }}>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  stop();
                  setMessages([]);
                }}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                style={iconBtn}
              >
                ＋
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Cerrar" style={{ ...iconBtn, fontSize: 20 }}>
              ×
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1" style={{ overflowY: "auto", padding: 16 }}>
          {messages.length === 0 ? (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Soy tu asistente del método TBM. Preguntame sobre tu equipo, delegación, DISC o cómo
                multiplicar tu negocio.
              </p>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} style={chip}>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 14 }}>
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const isUser = m.role === "user";
                const showCursor = streaming && isLast && m.role === "assistant";
                const bubbleStyle: React.CSSProperties = isUser
                  ? {
                      maxWidth: "85%",
                      padding: "9px 13px",
                      borderRadius: 14,
                      fontSize: 14,
                      lineHeight: 1.55,
                      background: "rgba(91,138,255,0.18)",
                      border: "1px solid rgba(91,138,255,0.32)",
                      color: "rgba(255,255,255,0.95)",
                      whiteSpace: "pre-wrap",
                    }
                  : m.error
                    ? {
                        maxWidth: "94%",
                        padding: "9px 13px",
                        borderRadius: 12,
                        fontSize: 14,
                        lineHeight: 1.55,
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.28)",
                        color: "#fca5a5",
                        whiteSpace: "pre-wrap",
                      }
                    : {
                        // Asistente: estilo "documento" (sin burbuja) para leer cómodo.
                        maxWidth: "100%",
                        padding: 0,
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.9)",
                      };
                return (
                  <div
                    key={i}
                    className="jarvis-msg group flex flex-col"
                    style={{ alignItems: isUser ? "flex-end" : "flex-start", gap: 4, width: "100%" }}
                  >
                    <div style={bubbleStyle}>
                      {m.role === "assistant" && !m.error ? (
                        <MarkdownLite text={m.content} />
                      ) : (
                        <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                      )}
                      {showCursor && <span className="jarvis-cursor">▍</span>}
                    </div>
                    {m.role === "assistant" && !m.error && m.content && !showCursor && (
                      <button
                        type="button"
                        onClick={() => copy(m.content, i)}
                        className="jarvis-copy"
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "0 4px",
                        }}
                      >
                        {copied === i ? "✓ copiado" : "copiar"}
                      </button>
                    )}
                  </div>
                );
              })}
              {pending && (
                <div style={{ alignSelf: "flex-start", fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
                  <span className="jarvis-cursor">▍</span> JARVIS está pensando…
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
              onChange={(e) => {
                setInput(e.target.value);
                autosize();
              }}
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
                lineHeight: 1.4,
                maxHeight: 120,
                outline: "none",
              }}
            />
            {streaming || pending ? (
              <button type="button" onClick={stop} style={{ ...sendBtn, background: "rgba(248,113,113,0.18)", border: "1px solid rgba(248,113,113,0.4)", color: "#fca5a5" }}>
                Parar
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} style={{ ...sendBtn, opacity: input.trim() ? 1 : 0.5, cursor: input.trim() ? "pointer" : "not-allowed" }}>
                Enviar
              </button>
            )}
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 6, textAlign: "center" }}>
            JARVIS puede equivocarse. Verificá lo importante. · Enter envía · Shift+Enter salto de línea
          </div>
        </form>
      </aside>
    </>,
    document.body
  );
}

// ── Markdown liviano (sin dependencias) — bold, italic, code, listas, headings ──
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${blocks.length}`} style={{ margin: "6px 0", paddingLeft: 18 }}>
        {list.items.map((it, j) => (
          <li key={j} style={{ margin: "3px 0", lineHeight: 1.55 }}>
            {inline(it)}
          </li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,4}\s+(.*)$/);

    if (bullet) {
      if (!list || list.ordered) flushList();
      list = list ?? { ordered: false, items: [] };
      list.items.push(bullet[1]);
    } else if (ordered) {
      if (!list || !list.ordered) flushList();
      list = list ?? { ordered: true, items: [] };
      list.items.push(ordered[1]);
    } else if (heading) {
      flushList();
      blocks.push(
        <div key={`h${blocks.length}`} style={{ fontWeight: 600, fontSize: 15, margin: "10px 0 2px", color: "#fff" }}>
          {inline(heading[1])}
        </div>
      );
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`p${blocks.length}`} style={{ margin: "0 0 8px" }}>
          {inline(line)}
        </p>
      );
    }
  }
  flushList();
  return <div>{blocks}</div>;
}

// Inline: **bold**, *italic*/_italic_, `code`.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      out.push(
        <strong key={k++} style={{ fontWeight: 600, color: "#fff" }}>
          {tok.slice(2, -2)}
        </strong>
      );
    else if (tok.startsWith("`"))
      out.push(
        <code key={k++} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px", fontSize: 12.5 }}>
          {tok.slice(1, -1)}
        </code>
      );
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.55)",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: "4px 8px",
  borderRadius: 8,
};
const chip: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.8)",
  fontSize: 13,
  cursor: "pointer",
};
const sendBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(91,138,255,0.22)",
  border: "1px solid rgba(91,138,255,0.4)",
  color: "#9bb8ff",
  fontSize: 13.5,
  fontWeight: 700,
};
