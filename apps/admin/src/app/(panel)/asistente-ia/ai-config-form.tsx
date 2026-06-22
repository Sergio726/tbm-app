"use client";

import { useState, useTransition } from "react";
import { PROVIDERS, providerMeta, type ProviderId } from "@/lib/ai";
import { saveAiConfig, testAiConnection, type AiConfigView } from "./actions";

const ERRORS: Record<string, string> = {
  no_sesion: "Sesión expirada.",
  no_autorizado: "Sin permisos de plataforma.",
  sin_service_role: "Falta SUPABASE_SERVICE_ROLE_KEY.",
  vault_error: "No se pudo guardar la API key (Vault).",
  provider_no_implementado: "Ese proveedor todavía no está implementado (próximamente).",
  sin_key: "Cargá y guardá una API key antes de probar.",
  key_invalida: "La API key es inválida (401).",
  fallo_conexion: "Falló la conexión con el proveedor.",
};

function modelsFor(provider: ProviderId) {
  return PROVIDERS.find((p) => p.id === provider)?.models ?? [];
}

export function AiConfigForm({ initial }: { initial: AiConfigView }) {
  const [provider, setProvider] = useState<ProviderId>(initial.provider);
  const [model, setModel] = useState(initial.model);
  const [systemPrompt, setSystemPrompt] = useState(initial.systemPrompt);
  const [temperature, setTemperature] = useState(String(initial.temperature));
  const [enabled, setEnabled] = useState(initial.enabled);
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(initial.hasKey);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [testing, startTest] = useTransition();

  const meta = providerMeta(provider);
  // Modo "otro modelo": activo si el modelo actual no está en la lista curada del proveedor.
  const [customModel, setCustomModel] = useState(
    () => !modelsFor(initial.provider).some((m) => m.id === initial.model)
  );

  const onProvider = (id: ProviderId) => {
    setProvider(id);
    const first = modelsFor(id)[0]?.id;
    if (first) setModel(first);
    setCustomModel(false);
  };

  const CUSTOM = "__custom__";
  const onModelSelect = (value: string) => {
    if (value === CUSTOM) {
      setCustomModel(true);
      setModel("");
    } else {
      setCustomModel(false);
      setModel(value);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setTest(null);
    startSave(async () => {
      const r = await saveAiConfig({
        provider,
        model,
        systemPrompt,
        temperature: Number.parseFloat(temperature) || 0.7,
        enabled,
        apiKey: apiKey || undefined,
      });
      if (r.ok) {
        setMsg({ ok: true, text: "Configuración guardada." });
        if (apiKey) {
          setHasKey(true);
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
      const r = await testAiConnection();
      if (r.ok) setTest({ ok: true, text: `Conexión OK · respuesta: "${r.reply}"` });
      else setTest({ ok: false, text: ERRORS[r.error] ?? r.error });
    });
  };

  return (
    <form onSubmit={save} className="flex flex-col" style={{ gap: 16 }}>
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <Field label="Proveedor">
          <select className="adm-input" value={provider} onChange={(e) => onProvider(e.target.value as ProviderId)}>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.implemented} style={{ background: "#111827" }}>
                {p.label}
                {p.implemented ? "" : " · próximamente"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Modelo">
          <select
            className="adm-input"
            value={customModel ? CUSTOM : model}
            onChange={(e) => onModelSelect(e.target.value)}
          >
            {modelsFor(provider).map((m) => (
              <option key={m.id} value={m.id} style={{ background: "#111827" }}>
                {m.label}
              </option>
            ))}
            {meta?.allowCustomModel && (
              <option value={CUSTOM} style={{ background: "#111827" }}>
                ✏️ Otro modelo…
              </option>
            )}
          </select>
          {customModel && (
            <input
              className="adm-input"
              style={{ marginTop: 8 }}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="slug, ej. openai/gpt-4o"
              spellCheck={false}
              autoFocus
            />
          )}
        </Field>
      </div>
      {meta?.hint && (
        <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "-6px 0 0" }}>{meta.hint}</p>
      )}

      <Field label={hasKey ? "API key (cargada — dejá vacío para no cambiarla)" : "API key"}>
        <input
          className="adm-input"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={hasKey ? "•••• •••• (guardada en Vault)" : "sk-ant-…"}
        />
      </Field>

      <Field label="System prompt (la “voz” de JARVIS)">
        <textarea
          className="adm-input"
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          style={{ resize: "vertical", lineHeight: 1.5 }}
        />
      </Field>

      <div className="flex flex-wrap items-center" style={{ gap: 20 }}>
        <Field label="Temperatura (0–1)">
          <input
            className="adm-input"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            style={{ width: 110 }}
          />
        </Field>
        <label className="flex items-center" style={{ gap: 9, cursor: "pointer", marginTop: 18 }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span style={{ fontSize: 13.5 }}>Asistente activado</span>
        </label>
      </div>

      {msg && (
        <p style={{ fontSize: 12.5, color: msg.ok ? "#34d399" : "#fca5a5", margin: 0 }}>{msg.text}</p>
      )}

      <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 4 }}>
        <button type="submit" disabled={saving} className="adm-btn adm-btn-primary">
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={runTest} disabled={testing} className="adm-btn adm-btn-ghost">
          {testing ? "Probando…" : "Probar conexión"}
        </button>
        {test && (
          <span style={{ fontSize: 12.5, color: test.ok ? "#34d399" : "#fca5a5" }}>{test.text}</span>
        )}
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
