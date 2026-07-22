"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, Info, X } from "lucide-react";

/**
 * Sistema de toasts compartido (pulido pre-beta).
 *
 * Reemplaza el toast ad-hoc que vivía atrapado en `account-form.tsx`. Se monta
 * una sola vez (`ToastProvider` + `Toaster` en el layout `(dashboard)`) y
 * cualquier client component pide feedback con `useToast()`:
 *
 *   const toast = useToast();
 *   toast.success("Guardado");  toast.error("No se pudo guardar");
 *
 * Estilo tomado del toast previo (tipos success/error/info, tokens del design
 * system, auto-dismiss). La animación de entrada vive en `.tbm-toast-in`
 * (globals.css, con fallback de prefers-reduced-motion).
 */

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => dismiss(id), DEFAULT_DURATION);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show("success", m),
      error: (m) => show("error", m),
      info: (m) => show("info", m),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Hook de acceso. Si no hay provider montado devuelve un no-op silencioso
 * (evita que un componente reusado fuera del dashboard rompa).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return ctx ?? NOOP;
}

const NOOP: ToastApi = {
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  dismiss: () => {},
};

// ── Presentación ──────────────────────────────────────────────────────────────

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <Check size={14} strokeWidth={2.5} />,
  error: <AlertCircle size={14} />,
  info: <Info size={14} />,
};

const COLORS: Record<ToastType, { border: string; icon: string }> = {
  success: { border: "rgba(16,185,129,0.3)", icon: "var(--semaforo-verde)" },
  error: { border: "rgba(239,68,68,0.3)", icon: "var(--semaforo-rojo)" },
  info: { border: "rgba(59,130,246,0.3)", icon: "var(--accent-light)" },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const c = COLORS[toast.type];
  return (
    <div
      className="tbm-toast-in pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg"
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${c.border}`,
        minWidth: 280,
        maxWidth: 380,
      }}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <span className="mt-0.5 shrink-0" style={{ color: c.icon }}>
        {ICONS[toast.type]}
      </span>
      <span className="text-sm leading-snug text-fg flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 mt-0.5 text-fg-muted transition-colors hover:text-fg"
      >
        <X size={14} />
      </button>
    </div>
  );
}
