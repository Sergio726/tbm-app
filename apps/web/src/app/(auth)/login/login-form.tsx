"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Quote,
  Target,
  Activity,
  Zap,
  Leaf,
  type LucideIcon,
} from "lucide-react";

const MONO: CSSProperties = {
  fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
};

const REMEMBER_KEY = "tbm:remember-me";

// =============================================================
// Marcas SSO (color, no stroke) — Google + Microsoft
// =============================================================
const GoogleMark = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

const MicrosoftMark = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 23 23"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path fill="#f25022" d="M1 1h10v10H1z" />
    <path fill="#7fba00" d="M12 1h10v10H12z" />
    <path fill="#00a4ef" d="M1 12h10v10H1z" />
    <path fill="#ffb900" d="M12 12h10v10H12z" />
  </svg>
);

// =============================================================
// Panel izquierdo — brand + product preview + testimonial
// =============================================================
function LeftPanel() {
  return (
    <div
      className="relative hidden flex-col text-white md:flex"
      style={{
        flex: "1 1 50%",
        minWidth: 0,
        background:
          "linear-gradient(180deg, #0c1322 0%, #0a0f1c 60%, #080c17 100%)",
        overflow: "hidden",
        padding: "40px 56px",
      }}
    >
      {/* Halos ambientales */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -100,
          left: -120,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,138,255,0.22), transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: -160,
          right: -120,
          width: 460,
          height: 460,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.10), transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      {/* Grain dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
        }}
      />

      {/* Brand mark */}
      <div className="relative flex items-center" style={{ gap: 12 }}>
        <div
          className="flex items-center justify-center text-white"
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background:
              "linear-gradient(135deg, #5b8aff 0%, #2c5fe6 60%, #1a3ea8 100%)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
            boxShadow:
              "0 8px 24px rgba(91,138,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          TBM
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>
            The Business Multiplier
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Sistema operativo de tu negocio
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative flex flex-col"
        style={{
          flex: 1,
          justifyContent: "center",
          maxWidth: 520,
          paddingTop: 40,
          paddingBottom: 40,
        }}
      >
        <div
          className="inline-flex items-center uppercase"
          style={{
            gap: 7,
            padding: "5px 12px",
            background: "rgba(91,138,255,0.10)",
            border: "1px solid rgba(91,138,255,0.22)",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.4,
            color: "#9fb9ff",
            width: "fit-content",
            marginBottom: 22,
          }}
        >
          <Sparkles size={11} strokeWidth={2.2} />
          Versión 2026.1
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.1,
            margin: "0 0 18px",
            letterSpacing: -1.2,
          }}
        >
          Liderá con visión.
          <br />
          Delegá con confianza.
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #5b8aff, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Ejecutá con claridad.
          </span>
        </h1>
        <div
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.55,
            marginBottom: 36,
          }}
        >
          Rituales, diagnósticos y planes de 90 días en un solo sistema. Hecho para
          founders que dejaron de improvisar.
        </div>

        {/* Product preview */}
        <ProductPreview />
      </div>

      {/* Testimonial */}
      <div
        className="relative flex"
        style={{
          gap: 14,
          maxWidth: 520,
          paddingTop: 22,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ color: "#5b8aff", flexShrink: 0, marginTop: 2 }}>
          <Quote size={20} strokeWidth={1.6} />
        </div>
        <div>
          <div
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            “Pasamos de improvisar todos los días a tener un sistema. Los rituales
            solos cambiaron la calidad de mis lunes.”
          </div>
          <div
            className="flex items-center"
            style={{ gap: 10, marginTop: 10 }}
          >
            <div
              className="flex items-center justify-center text-white"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              JP
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              <span style={{ color: "#fff", fontWeight: 500 }}>
                Joaquín Pérez
              </span>{" "}
              · CEO en Acme
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: 10,
        borderRadius: 9,
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 6, color: tone, marginBottom: 4 }}
      >
        <Icon size={11} strokeWidth={2} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ ...MONO, fontSize: 16, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ProductPreview() {
  const items = [
    { d: "Revisar prioridades de la semana", done: true },
    { d: "1:1 con Ana sobre Q1", done: true },
    { d: "Sincronizar con producto", done: false },
  ];
  return (
    <div
      className="relative"
      style={{
        padding: 18,
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        maxWidth: 460,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 14 }}
      >
        <div>
          <div
            className="uppercase"
            style={{
              ...MONO,
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 1.2,
            }}
          >
            Hoy · Lunes
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>
            Warm Up
          </div>
        </div>
        <div
          className="flex items-center"
          style={{
            gap: 6,
            padding: "4px 10px",
            borderRadius: 99,
            background: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.3)",
            fontSize: 11,
            fontWeight: 600,
            color: "#34d399",
          }}
        >
          <Leaf size={11} strokeWidth={2} />
          En racha · 6 sem
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 6 }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center"
            style={{
              gap: 12,
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                background: item.done ? "#34d399" : "transparent",
                border: item.done
                  ? "1px solid #34d399"
                  : "1.5px solid rgba(255,255,255,0.2)",
                color: "#0a0e1a",
              }}
            >
              {item.done && <Check size={10} strokeWidth={3} />}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 12.5,
                color: item.done ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.85)",
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              {item.d}
            </div>
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: 8, marginTop: 14 }}>
        <MiniMetric Icon={Target} label="Plan 90D" value="73d" tone="#5b8aff" />
        <MiniMetric
          Icon={Activity}
          label="Diagnóstico"
          value="4.1/5"
          tone="#34d399"
        />
        <MiniMetric Icon={Zap} label="Multiplicador" value="2.3×" tone="#fbbf24" />
      </div>
    </div>
  );
}

// =============================================================
// Field — input con icono + focus state azul
// =============================================================
function Field({
  id,
  type,
  value,
  onChange,
  Icon,
  trailing,
  placeholder,
  autoComplete,
  required,
  header,
  label,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  Icon: LucideIcon;
  trailing?: ReactNode;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  header?: ReactNode;
  label?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {header ? (
        header
      ) : (
        <label
          htmlFor={id}
          className="block transition-colors"
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: focused ? "#9fb9ff" : "rgba(255,255,255,0.65)",
            marginBottom: 7,
          }}
        >
          {label}
        </label>
      )}
      <div
        className="flex items-center transition-all"
        style={{
          padding: "0 14px",
          borderRadius: 10,
          border: `1px solid ${focused ? "rgba(91,138,255,0.55)" : "rgba(255,255,255,0.08)"}`,
          background: focused ? "rgba(91,138,255,0.04)" : "rgba(255,255,255,0.02)",
          boxShadow: focused ? "0 0 0 4px rgba(91,138,255,0.10)" : "none",
        }}
      >
        <span
          className="transition-colors"
          style={{
            color: focused ? "#9fb9ff" : "rgba(255,255,255,0.4)",
            marginRight: 10,
          }}
        >
          <Icon size={16} strokeWidth={1.7} />
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="flex-1"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "13px 0",
            color: "#fff",
            fontSize: 14,
          }}
        />
        {trailing}
      </div>
    </div>
  );
}

// =============================================================
// Panel derecho — form de login
// =============================================================
function RightPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<"google" | "azure" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recuperar preferencia "recordarme"
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_KEY);
      if (stored !== null) setRemember(stored === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const persistRemember = (v: boolean) => {
    setRemember(v);
    try {
      localStorage.setItem(REMEMBER_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });

    if (authErr) {
      setError(
        authErr.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : "Ocurrió un error. Intentá de nuevo."
      );
      setLoading(false);
      return;
    }

    capture("login_succeeded", { method: "email" });

    // Marca de login fresco → el dashboard muestra el saludo JARVIS una sola vez (S17.A)
    try {
      localStorage.setItem("tbm:just-logged-in", "1");
    } catch {
      /* ignore */
    }
    router.push("/dashboard");
    router.refresh();
  };

  const handleSSO = async (provider: "google" | "azure") => {
    setSsoLoading(provider);
    setError(null);
    try {
      // Marca de login fresco (persiste el redirect de OAuth) → saludo JARVIS (S17.A)
      try {
        localStorage.setItem("tbm:just-logged-in", "1");
      } catch {
        /* ignore */
      }
      capture("login_sso_started", { provider });
      const supabase = createClient();
      const { error: ssoErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (ssoErr) throw ssoErr;
      // signInWithOAuth redirects fuera del SPA, no llegamos acá normalmente
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión con el proveedor."
      );
      setSsoLoading(null);
    }
  };

  return (
    <div
      className="relative flex flex-col"
      style={{
        flex: "1 1 50%",
        minWidth: 0,
        background: "#0a0e1a",
        padding: "40px 56px",
      }}
    >
      {/* Brand compacto — solo móvil (el LeftPanel está oculto en < md) */}
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <div
          className="flex flex-shrink-0 items-center justify-center text-white"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, #5b8aff 0%, #2c5fe6 60%, #1a3ea8 100%)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            boxShadow:
              "0 8px 24px rgba(91,138,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          TBM
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>
            The Business Multiplier
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>
            Sistema operativo de tu negocio
          </div>
        </div>
      </div>

      {/* Alta solo por invitación: el registro público está cerrado. */}

      <div
        className="flex flex-col"
        style={{
          flex: 1,
          justifyContent: "center",
          maxWidth: 420,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 8px",
              letterSpacing: -0.5,
              color: "#fff",
            }}
          >
            Bienvenido de vuelta
          </h2>
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
            }}
          >
            Continuá donde lo dejaste. Tu Plan 90D te está esperando.
          </div>
        </div>

        {/* SSO */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => handleSSO("google")}
            disabled={ssoLoading !== null || loading}
            className="flex items-center justify-center transition-all hover:bg-white/[0.05]"
            style={{
              gap: 9,
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 500,
              cursor: ssoLoading || loading ? "not-allowed" : "pointer",
              opacity: ssoLoading && ssoLoading !== "google" ? 0.5 : 1,
            }}
          >
            {ssoLoading === "google" ? (
              <span
                className="animate-spin"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                }}
              />
            ) : (
              <GoogleMark size={16} />
            )}
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSSO("azure")}
            disabled={ssoLoading !== null || loading}
            className="flex items-center justify-center transition-all hover:bg-white/[0.05]"
            style={{
              gap: 9,
              padding: "11px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 500,
              cursor: ssoLoading || loading ? "not-allowed" : "pointer",
              opacity: ssoLoading && ssoLoading !== "azure" ? 0.5 : 1,
            }}
          >
            {ssoLoading === "azure" ? (
              <span
                className="animate-spin"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                }}
              />
            ) : (
              <MicrosoftMark size={16} />
            )}
            Microsoft
          </button>
        </div>

        {/* Divider */}
        <div
          className="flex items-center"
          style={{ gap: 14, margin: "4px 0 22px" }}
        >
          <div
            style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}
          />
          <div
            style={{
              ...MONO,
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 1,
            }}
          >
            O CONTINUAR CON EMAIL
          </div>
          <div
            style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ gap: 16 }}
        >
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            Icon={Mail}
            placeholder="tu@empresa.com"
            autoComplete="email"
            required
          />

          <Field
            id="pwd"
            type={showPwd ? "text" : "password"}
            value={pwd}
            onChange={setPwd}
            Icon={Lock}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            header={
              <div
                className="flex items-baseline justify-between"
                style={{ marginBottom: 7 }}
              >
                <label
                  htmlFor="pwd"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Contraseña
                </label>
                <a
                  href="#"
                  className="hover:opacity-80"
                  style={{
                    fontSize: 12,
                    color: "#9fb9ff",
                    textDecoration: "none",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            }
            trailing={
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="flex"
                aria-label={
                  showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  padding: 6,
                  marginLeft: 4,
                  borderRadius: 6,
                }}
              >
                {showPwd ? (
                  <EyeOff size={16} strokeWidth={1.7} />
                ) : (
                  <Eye size={16} strokeWidth={1.7} />
                )}
              </button>
            }
          />

          {/* Remember me */}
          <label
            className="flex items-center select-none cursor-pointer"
            style={{ gap: 10, marginTop: -4 }}
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => persistRemember(e.target.checked)}
              className="sr-only"
            />
            <span
              className="flex items-center justify-center transition-all"
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: remember
                  ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
                  : "transparent",
                border: remember ? "1px solid #5b8aff" : "1.5px solid rgba(255,255,255,0.2)",
                color: "#fff",
                boxShadow: remember ? "0 4px 12px rgba(91,138,255,0.32)" : "none",
              }}
            >
              {remember && <Check size={11} strokeWidth={3} />}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              Recordarme en este dispositivo
            </span>
          </label>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || ssoLoading !== null}
            className="flex items-center justify-center transition-all"
            style={{
              gap: 9,
              padding: "14px 22px",
              borderRadius: 11,
              border: "none",
              background:
                loading || ssoLoading
                  ? "linear-gradient(180deg, #3a6ad3 0%, #1e4ec0 100%)"
                  : "linear-gradient(180deg, #4f86ff 0%, #2c5fe6 100%)",
              color: "#fff",
              fontSize: 14.5,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              boxShadow:
                "0 10px 24px rgba(54,114,255,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
              marginTop: 6,
              opacity: loading || ssoLoading ? 0.85 : 1,
            }}
          >
            {loading ? (
              <>
                <span
                  className="animate-spin"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                  }}
                />
                Iniciando sesión…
              </>
            ) : (
              <>
                Iniciar sesión
                <ArrowRight size={15} strokeWidth={2.2} />
              </>
            )}
          </button>

          {/* Security note */}
          <div
            className="flex items-center justify-center"
            style={{
              ...MONO,
              gap: 8,
              fontSize: 11.5,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            <Shield size={11} strokeWidth={1.8} />
            Conexión cifrada · SSO disponible
          </div>
        </form>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{
          ...MONO,
          fontSize: 11.5,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        <div>© 2026 STLabs · TBM</div>
        <div className="flex" style={{ gap: 18 }}>
          <a
            href="#"
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            Privacidad
          </a>
          <a
            href="#"
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            Términos
          </a>
          <a
            href="#"
            style={{ color: "inherit", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            Soporte
          </a>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// LoginForm — wrapper split-screen
// =============================================================
export function LoginForm() {
  return (
    <div
      className="login-split flex min-h-screen text-white"
      style={{
        background: "#0a0e1a",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
