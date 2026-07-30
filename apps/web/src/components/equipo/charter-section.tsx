"use client";

import { useState } from "react";
import { ScrollText, Check, Wallet } from "lucide-react";
import type { RoleCharter } from "@/types/database";
import { saveRoleCharter } from "@/app/(dashboard)/equipo/actions";
import { Panel, FieldLabel, TextAreaInput, TextInput } from "./primitives";
import { LosBadge } from "./los-badge";

/**
 * Ficha de rol · "rights" (S22 · §I1).
 *
 * Dilio (Meet 2026-07-25): *"cuando creo el rol de la persona —y eso es una cosa
 * que creo que no está en la plataforma— el rol tiene que decirle a la persona
 * qué hace, cómo lo hace, las expectativas que se tienen con él, los resultados
 * que buscamos al tenerlo en el equipo, y sus derechos: tú puedes decidir hasta
 * $X.000 sin preguntarme a mí. No me preguntes, ejecuta."*
 *
 * Dos modos en un componente:
 *  · Arquitecto → edita y guarda (server action `saveRoleCharter`).
 *  · La propia persona → LECTURA. Es el punto de Dilio: que la persona la vea,
 *    no que el líder la archive.
 */

const CURRENCIES = ["ARS", "USD", "COP", "MXN", "EUR"] as const;

/** "1.234.567" → 1234567. Tolera separadores y símbolos pegados. */
function parseAmount(s: string): number | null {
  const cleaned = s.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(/,/g, ".");
  if (cleaned === "" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatAmount(n: number | null, currency: string): string {
  if (n == null) return "—";
  return `${currency} ${n.toLocaleString("es-AR")}`;
}

export function CharterSection({
  profileId,
  memberName,
  losLevel,
  charter,
  editable,
}: {
  profileId: string;
  memberName: string | null;
  losLevel: number | null;
  charter: RoleCharter | null;
  editable: boolean;
}) {
  const [mission, setMission] = useState(charter?.mission ?? "");
  const [how, setHow] = useState(charter?.how ?? "");
  const [expectations, setExpectations] = useState(charter?.expectations ?? "");
  const [outcomes, setOutcomes] = useState(charter?.outcomes ?? "");
  const [rights, setRights] = useState(charter?.rights ?? "");
  const [amount, setAmount] = useState(
    charter?.decision_limit_amount != null ? String(charter.decision_limit_amount) : ""
  );
  const [currency, setCurrency] = useState(charter?.decision_limit_currency ?? "ARS");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // No hace falta re-sincronizar el estado al cambiar de miembro: el padre monta
  // este componente con `key={member.id}`, así que React lo remonta y los
  // `useState` vuelven a inicializarse desde la ficha nueva.

  const parsedAmount = amount.trim() === "" ? null : parseAmount(amount);
  const amountInvalid = amount.trim() !== "" && parsedAmount == null;
  const firstName = memberName?.split(" ")[0] ?? "esta persona";

  async function save() {
    if (saving || amountInvalid) return;
    setSaving(true);
    setError("");
    try {
      const res = await saveRoleCharter({
        profileId,
        mission,
        how,
        expectations,
        outcomes,
        rights,
        decisionLimitAmount: parsedAmount,
        decisionLimitCurrency: currency,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch {
      setError("No se pudo guardar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const empty =
    !mission && !how && !expectations && !outcomes && !rights && parsedAmount == null;

  // Vista de la persona sobre su propia ficha, sin nada cargado: no tiene sentido
  // mostrarle un formulario vacío que no puede completar.
  if (!editable && empty) {
    return (
      <Panel
        icon={<ScrollText size={18} strokeWidth={1.9} />}
        iconColor="#f0abfc"
        accent="#f0abfc"
        title="Mi ficha de rol"
        sub="Qué se espera de mí y hasta dónde puedo decidir solo."
      >
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Tu líder todavía no cargó tu ficha de rol. Cuando lo haga vas a ver acá qué
          hacés, cómo, qué se espera de vos y hasta qué monto podés decidir sin
          consultar.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      icon={<ScrollText size={18} strokeWidth={1.9} />}
      iconColor="#f0abfc"
      accent="#f0abfc"
      title={editable ? "Ficha de rol · derechos" : "Mi ficha de rol"}
      sub={
        editable
          ? "Qué hace, cómo, qué esperás de él y hasta cuánto puede decidir sin preguntarte."
          : "Qué se espera de mí y hasta dónde puedo decidir solo."
      }
      badge={losLevel ? <LosBadge level={losLevel} /> : null}
    >
      {/* El derecho concreto va PRIMERO: es el dato accionable, no un campo más. */}
      <div
        className="mb-4 rounded-[13px] border px-4 py-3.5"
        style={{
          borderColor: "rgba(52,211,153,0.28)",
          background: "rgba(52,211,153,0.07)",
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Wallet size={15} strokeWidth={2} style={{ color: "var(--success-text)" }} />
          <span className="text-[11.5px] font-bold uppercase tracking-[1.1px] text-fg-muted">
            Tope de decisión
          </span>
        </div>

        {editable ? (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ej. 50000"
                  inputMode="decimal"
                  aria-label="Monto del tope de decisión"
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Moneda"
                className="rounded-[11px] border border-white/[0.09] bg-white/[0.035] px-3 text-sm text-fg outline-none transition focus:border-[#5b8aff]/60"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {amountInvalid ? (
              <p className="mt-2 text-[11.5px]" style={{ color: "var(--danger-text)" }}>
                Ese monto no es válido. Escribí solo números.
              </p>
            ) : (
              <p className="mt-2 text-[11.5px] leading-relaxed text-fg-muted">
                {parsedAmount != null ? (
                  <>
                    {firstName} puede decidir hasta{" "}
                    <strong style={{ color: "var(--success-text)" }}>
                      {formatAmount(parsedAmount, currency)}
                    </strong>{" "}
                    sin consultarte. Arriba de eso, te pregunta.
                  </>
                ) : (
                  "Sin tope definido: hoy tiene que consultarte cualquier monto."
                )}
              </p>
            )}
          </>
        ) : (
          <p className="text-[15px] font-bold" style={{ color: "var(--success-text)" }}>
            {parsedAmount != null ? (
              <>
                {formatAmount(parsedAmount, currency)}
                <span className="ml-1.5 text-[12px] font-medium text-fg-muted">
                  sin consultar
                </span>
              </>
            ) : (
              <span className="text-[13px] font-medium text-fg-muted">
                Todavía no tenés un tope definido — consultá cualquier monto.
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <Field
          label="Qué hace"
          hint="la misión del rol"
          value={mission}
          onChange={setMission}
          editable={editable}
          placeholder="ej. Sostener la operación comercial de punta a punta: prospección, propuestas y cierre."
        />
        <Field
          label="Cómo lo hace"
          hint="el método, no la tarea"
          value={how}
          onChange={setHow}
          editable={editable}
          placeholder="ej. Con el CRM al día, seguimiento a 48h y reporte semanal en el War Up."
        />
        <Field
          label="Qué se espera de él"
          value={expectations}
          onChange={setExpectations}
          editable={editable}
          placeholder="ej. Que no se le caiga ningún lead por falta de seguimiento."
        />
        <Field
          label="Resultados que buscamos"
          hint="por qué está en el equipo"
          value={outcomes}
          onChange={setOutcomes}
          editable={editable}
          placeholder="ej. 3 clientes nuevos por mes y una tasa de cierre arriba del 25%."
        />
        <Field
          label="Sus derechos"
          hint="además del tope"
          value={rights}
          onChange={setRights}
          editable={editable}
          placeholder="ej. Decide descuentos hasta 10% sin pedir permiso. Elige sus herramientas de trabajo."
        />
      </div>

      {editable && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving || amountInvalid}
            className="inline-flex items-center gap-2 rounded-[11px] px-4 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, #c084fc, #a855f7)" }}
          >
            {saving ? "Guardando…" : "Guardar ficha"}
          </button>
          {saved && (
            <span
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
              style={{ color: "var(--success-text)" }}
            >
              <Check size={14} /> Ficha guardada
            </span>
          )}
          {error && (
            <span className="text-[12.5px]" style={{ color: "var(--danger-text)" }}>
              {error}
            </span>
          )}
        </div>
      )}
    </Panel>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  editable,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  placeholder: string;
}) {
  // En lectura, un campo vacío se omite: no se le muestra a la persona un hueco
  // con el placeholder de ejemplo como si fuera su contenido.
  if (!editable && !value.trim()) return null;

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {editable ? (
        <TextAreaInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
        />
      ) : (
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-fg">{value}</p>
      )}
    </div>
  );
}
