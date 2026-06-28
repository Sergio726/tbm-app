"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { JarvisCore } from "./jarvis-core";
import type { ChatMessage } from "@/lib/ai";
import type { DcPublicPersona } from "@/lib/dc-persona";
import { parseNavMarker } from "@/lib/dc-navigation";
import {
  listConversations,
  getConversationMessages,
  type ConversationSummary,
} from "@/lib/jarvis-history";

const ERRORS: Record<string, string> = {
  no_sesion: "Tu sesión expiró. Recargá la página.",
  disabled: "El asistente todavía no está activado. Pedile al administrador que lo configure.",
  sin_config: "El asistente todavía no está configurado (falta la API key).",
  provider_no_implementado: "El proveedor configurado no está disponible.",
  key_invalida: "La API key configurada es inválida.",
  rate_limit: "Alcanzaste el límite de mensajes por ahora. Probá de nuevo en un rato.",
  fallo: "No pude responder ahora mismo. Probá de nuevo en un momento.",
};

// DC-3: propuesta de acción que el usuario confirma antes de ejecutar.
type Proposal = {
  tool: string;
  args: Record<string, unknown>;
  title: string;
  details: { label: string; value: string }[];
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
  /** Si está presente, el mensaje es una tarjeta de confirmación de acción (DC-3). */
  proposal?: Proposal;
  /** Estado de la tarjeta una vez resuelta. */
  resolved?: "confirmed" | "cancelled";
};

export function JarvisPanel({
  open,
  onClose,
  moduleLabel,
  persona,
}: {
  open: boolean;
  onClose: () => void;
  /** Pantalla/módulo actual del usuario (DC-1: context-aware). */
  moduleLabel?: string;
  /** Persona configurable de DC (DC-2): nombre/bienvenida/sugerencias. */
  persona: DcPublicPersona;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false); // esperando el primer token
  const [streaming, setStreaming] = useState(false); // recibiendo tokens
  const [copied, setCopied] = useState<number | null>(null);
  // DC-6: historial persistente
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus-trap (a11y): el Tab no debe escaparse al contenido de atrás.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
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

  // DC-6: capturar el id de conversación que devuelve el server (header).
  const captureConvId = (res: Response) => {
    const cid = res.headers.get("x-conversation-id");
    if (cid) setConversationId(cid);
  };

  // DC-6: abrir el historial y traer las conversaciones del usuario.
  const openHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      setConversations(await listConversations());
    } finally {
      setLoadingHistory(false);
    }
  };

  // DC-6: retomar una conversación (carga sus mensajes al panel).
  const loadConversation = async (id: string) => {
    setShowHistory(false);
    setPending(true);
    try {
      const msgs = await getConversationMessages(id);
      setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
      setConversationId(id);
    } finally {
      setPending(false);
    }
  };

  const newConversation = () => {
    stop();
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  };

  // Solo el historial conversacional real (sin tarjetas de acción ni errores).
  const chatHistory = (msgs: Msg[]): ChatMessage[] =>
    msgs.filter((m) => !m.proposal && !m.error).map((m) => ({ role: m.role, content: m.content }));

  // Lee un stream text/plain y lo va volcando como mensaje del asistente.
  const consumeStream = async (res: Response) => {
    const reader = res.body!.getReader();
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
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setTimeout(autosize, 0);
    setPending(true);

    const history = chatHistory(next);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          module: moduleLabel,
          origin: window.location.origin,
          conversationId,
        }),
        signal: ctrl.signal,
      });
      captureConvId(res);

      // DC-3: respuesta JSON = error (no-200) o propuesta de acción.
      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok || ct.includes("application/json")) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          type?: string;
          proposal?: Proposal;
          conversationId?: string;
        };
        setPending(false);
        if (res.ok && j.type === "proposal" && j.proposal) {
          if (j.conversationId) setConversationId(j.conversationId);
          setMessages((prev) => [...prev, { role: "assistant", content: "", proposal: j.proposal }]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: ERRORS[j.error ?? ""] ?? "No pude responder.", error: true },
          ]);
        }
        return;
      }

      if (!res.body) {
        setPending(false);
        setMessages((prev) => [...prev, { role: "assistant", content: "No pude responder.", error: true }]);
        return;
      }

      await consumeStream(res);
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

  // DC-3: el usuario confirma la acción propuesta → ejecutar en el servidor.
  const confirmProposal = async (proposal: Proposal, idx: number) => {
    if (pending || streaming) return;
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, resolved: "confirmed" } : m)));
    setPending(true);
    const history = chatHistory(messages);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          confirm: { tool: proposal.tool, args: proposal.args },
          messages: history,
          module: moduleLabel,
          origin: window.location.origin,
          conversationId,
        }),
        signal: ctrl.signal,
      });
      captureConvId(res);
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: ERRORS[j.error ?? ""] ?? "No pude ejecutar la acción.", error: true },
        ]);
        return;
      }
      await consumeStream(res);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No pude ejecutar la acción. Probá de nuevo.", error: true },
        ]);
      }
    } finally {
      setPending(false);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const cancelProposal = (idx: number) => {
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, resolved: "cancelled" } : m)));
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Asistente ${persona.name}`}
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
              {/* Orbe plano (sin layoutId): el orbe "vivo" lo posee el launcher. */}
              <JarvisCore size={24} plain />
            </span>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{persona.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Asistente · beta</div>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 4 }}>
            <button
              type="button"
              onClick={() => (showHistory ? setShowHistory(false) : openHistory())}
              aria-label="Historial"
              title="Historial"
              style={iconBtn}
            >
              🕘
            </button>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={newConversation}
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
          {showHistory ? (
            <div className="flex flex-col" style={{ gap: 6 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "2px 0 8px" }}>
                Conversaciones anteriores
              </div>
              {loadingHistory ? (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Cargando…</div>
              ) : conversations.length === 0 ? (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                  Todavía no hay conversaciones guardadas.
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => loadConversation(c.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background:
                        c.id === conversationId ? "rgba(91,138,255,0.12)" : "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13.5, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title || "Conversación"}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {new Date(c.updated_at).toLocaleString("es-AR")}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                {persona.welcome}
              </p>
              {persona.suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} style={chip}>
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 14 }}>
              {messages.map((m, i) => {
                // DC-3: tarjeta de confirmación de acción.
                if (m.proposal) {
                  return (
                    <ProposalCard
                      key={i}
                      proposal={m.proposal}
                      resolved={m.resolved}
                      busy={pending || streaming}
                      onConfirm={() => confirmProposal(m.proposal!, i)}
                      onCancel={() => cancelProposal(i)}
                    />
                  );
                }
                const isLast = i === messages.length - 1;
                const isUser = m.role === "user";
                const showCursor = streaming && isLast && m.role === "assistant";
                // N1: extraer [[IR:slug]] → texto limpio + destino para el botón "Ir a X →".
                const nav = m.role === "assistant" && !m.error ? parseNavMarker(m.content) : null;
                const displayText = nav ? nav.clean : m.content;
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
                        <MarkdownLite text={displayText} />
                      ) : (
                        <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                      )}
                      {showCursor && <span className="jarvis-cursor">▍</span>}
                    </div>
                    {/* N1: botón de navegación sugerido por DC (read-only, sin confirmación). */}
                    {nav?.target && !showCursor && (
                      <button
                        type="button"
                        onClick={() => {
                          router.push(nav.target!.path);
                          onClose();
                        }}
                        style={{
                          marginTop: 2,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 13px",
                          borderRadius: 10,
                          background: "rgba(91,138,255,0.16)",
                          border: "1px solid rgba(91,138,255,0.38)",
                          color: "#9bb8ff",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Ir a {nav.target.label} →
                      </button>
                    )}
                    {m.role === "assistant" && !m.error && displayText && !showCursor && (
                      <button
                        type="button"
                        onClick={() => copy(displayText, i)}
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
                  <span className="jarvis-cursor">▍</span> {persona.name} está pensando…
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
            {persona.name} puede equivocarse. Verificá lo importante. · Enter envía · Shift+Enter salto de línea
          </div>
        </form>
      </aside>
    </>,
    document.body
  );
}

// ── DC-3: tarjeta de confirmación de acción ──────────────────────────────────
function ProposalCard({
  proposal,
  resolved,
  busy,
  onConfirm,
  onCancel,
}: {
  proposal: Proposal;
  resolved?: "confirmed" | "cancelled";
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 14,
        background: "rgba(91,138,255,0.06)",
        border: "1px solid rgba(91,138,255,0.28)",
        padding: 14,
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15 }}>⚡</span>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{proposal.title}</div>
      </div>
      <div className="flex flex-col" style={{ gap: 6, marginBottom: 12 }}>
        {proposal.details.map((d, j) => (
          <div key={j} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.45 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", minWidth: 78, flexShrink: 0 }}>{d.label}</span>
            <span style={{ color: "rgba(255,255,255,0.9)", wordBreak: "break-word" }}>{d.value}</span>
          </div>
        ))}
      </div>
      {resolved === "confirmed" ? (
        <div style={{ fontSize: 12.5, color: "#34d399" }}>✓ Confirmado</div>
      ) : resolved === "cancelled" ? (
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>Cancelado</div>
      ) : (
        <div className="flex" style={{ gap: 8 }}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(52,211,153,0.18)",
              border: "1px solid rgba(52,211,153,0.4)",
              color: "#6ee7b7",
              fontSize: 13,
              fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
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
