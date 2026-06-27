"use client";

import { useState, useTransition } from "react";
import { saveEmailConfig, testEmailConnection, type EmailConfigView } from "./actions";

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada.",
  no_autorizado: "Sin permisos de plataforma.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY.",
  vault_error: "No se pudo guardar la API key (Vault).",
  sin_remitente: "Falta el email del remitente.",
  sin_key: "Cargá y guardá una API key de Resend antes de probar.",
  key_invalida: "La API key es inválida (401).",
  destino_invalido: "Email de destino inválido.",
  fallo_envio: "No se pudo enviar el email de prueba.",
  fallo_conexion: "Falló la conexión con Resend.",
};

export function EmailConfigForm({ initial }: { initial: EmailConfigView }) {
  const [fromName, setFromName] = useState(initial.fromName);
  const [fromEmail, setFromEmail] = useState(initial.fromEmail);
  const [replyTo, setReplyTo] = useState(initial.replyTo);
  const [supportEmail, setSupportEmail] = useState(initial.supportEmail);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [apiKey, setApiKey] = useState("");
  const [hasSecret, setHasSecret] = useState(initial.hasSecret);
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [testing, startTest] = useTransition();

  // No se puede activar sin remitente + key (cargada o tipeada ahora).
  const willHaveKey = hasSecret || apiKey.trim().length > 0;
  const canEnable = willHaveKey && fromEmail.trim().length > 0;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setTest(null);
    if (enabled && !canEnable) {
      setMsg({ ok: false, text: "Para activar necesitás un email de remitente y una API key." });
      return;
    }
    startSave(async () => {
      const r = await saveEmailConfig({
        fromName,
        fromEmail,
        replyTo,
        supportEmail,
        enabled,
        apiKey: apiKey || undefined,
      });
      if (r.ok) {
        setMsg({ ok: true, text: "Configuración guardada." });
        if (apiKey) {
          setHasSecret(true);
          setApiKey("");
        }
      } else {
        setMsg({ ok: false, text: ERRORS[r.error] ?? r.error });
      }
    });
  };

  const runTest = () => {
    setTest(null);
    startTest(async () => {
      const r = await testEmailConnection(testTo);
      if (r.ok) setTest({ ok: true, text: `Email de prueba enviado a ${testTo}.` });
      else setTest({ ok: false, text: ERRORS[r.error] ?? r.error });
    });
  };

  return (
    <form onSubmit={save} className="flex flex-col" style={{ gap: 16 }}>
      <Field label="Proveedor">
        <input className="adm-input" value="Resend (recomendado)" disabled />
        <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "6px 0 0" }}>
          SMTP propio · próximamente.
        </p>
      </Field>

      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <Field label="Nombre del remitente">
          <input
            className="adm-input"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="The Business Multiplier"
          />
        </Field>
        <Field label="Email del remitente (dominio verificado)">
          <input
            className="adm-input"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="noreply@tudominio.com"
            spellCheck={false}
          />
        </Field>
      </div>

      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <Field label="Reply-To (a dónde responden)">
          <input
            className="adm-input"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="hola@tudominio.com"
            spellCheck={false}
          />
        </Field>
        <Field label="Email de soporte (contacto / pedir créditos)">
          <input
            className="adm-input"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="hola@tudominio.com"
            spellCheck={false}
          />
        </Field>
      </div>

      <Field label={hasSecret ? "API key de Resend (cargada — dejá vacío para no cambiarla)" : "API key de Resend"}>
        <input
          className="adm-input"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={hasSecret ? "•••• •••• (guardada en Vault)" : "re_…"}
        />
      </Field>

      <label
        className="flex items-center"
        style={{ gap: 9, cursor: canEnable ? "pointer" : "not-allowed", opacity: canEnable ? 1 : 0.55 }}
        title={canEnable ? undefined : "Cargá email de remitente y API key para activar"}
      >
        <input
          type="checkbox"
          checked={enabled}
          disabled={!canEnable}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span style={{ fontSize: 13.5 }}>
          Usar esta configuración
          {!canEnable && (
            <span style={{ color: "var(--faint)", fontWeight: 400 }}> · requiere remitente + key</span>
          )}
        </span>
      </label>

      {msg && (
        <p style={{ fontSize: 12.5, color: msg.ok ? "#34d399" : "#fca5a5", margin: 0 }}>{msg.text}</p>
      )}

      <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 4 }}>
        <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {/* Enviar email de prueba */}
      <div style={{ borderTop: "1px solid var(--border, rgba(255,255,255,0.1))", paddingTop: 16, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Enviar email de prueba</span>
        <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 8 }}>
          <input
            className="adm-input"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="tu@email.com"
            style={{ flex: 1, minWidth: 220 }}
            spellCheck={false}
          />
          <button
            type="button"
            onClick={runTest}
            disabled={testing || !testTo.trim()}
            className="adm-btn adm-btn-ghost"
          >
            {testing ? "Enviando…" : "Enviar prueba"}
          </button>
        </div>
        {test && (
          <p style={{ fontSize: 12.5, color: test.ok ? "#34d399" : "#fca5a5", margin: "8px 0 0" }}>
            {test.text}
          </p>
        )}
        <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "8px 0 0" }}>
          Usa la config guardada. Guardá primero si cambiaste la key.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col" style={{ gap: 6, flex: 1, minWidth: 220 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
