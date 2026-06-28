"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export type AuthorityMatrixRow = {
  n1_amount: number | null;
  n2_min: number | null;
  n2_max: number | null;
  n3_threshold: number | null;
  currency: string | null;
};

function toNum(s: string): number | null {
  const cleaned = s.replace(/[^\d.]/g, "");
  // Colapsar múltiples puntos a uno solo ("1.2.3" → "1.23").
  const parts = cleaned.split(".");
  const normalized =
    parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  if (normalized === "" || normalized === ".") return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function AuthorityMatrixPanel({
  companyId,
  initial,
  editable,
}: {
  companyId: string;
  initial: AuthorityMatrixRow | null;
  editable: boolean;
}) {
  const router = useRouter();
  const [n1, setN1] = useState(initial?.n1_amount?.toString() ?? "");
  const [n2min, setN2min] = useState(initial?.n2_min?.toString() ?? "");
  const [n2max, setN2max] = useState(initial?.n2_max?.toString() ?? "");
  const [n3, setN3] = useState(initial?.n3_threshold?.toString() ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "ARS");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const fmt = (s: string) => {
    const n = toNum(s);
    return n != null ? `${currency} ${n.toLocaleString("es-AR")}` : "—";
  };

  async function save() {
    if (saving) return;
    const vN1 = toNum(n1);
    const vN2min = toNum(n2min);
    const vN2max = toNum(n2max);
    const vN3 = toNum(n3);

    // Validación de coherencia global: N1 ≤ N2(min..max) ≤ N3, sin negativos.
    if ([vN1, vN2min, vN2max, vN3].some((v) => v != null && v < 0)) {
      setErr("Los montos no pueden ser negativos.");
      return;
    }
    if (vN2min != null && vN2max != null && vN2min > vN2max) {
      setErr("El mínimo de N2 no puede ser mayor que el máximo.");
      return;
    }
    if (vN1 != null && vN2min != null && vN1 > vN2min) {
      setErr("N1 (autonomía total) no puede superar el inicio de N2.");
      return;
    }
    if (vN2max != null && vN3 != null && vN2max > vN3) {
      setErr("El máximo de N2 no puede superar el umbral de N3.");
      return;
    }

    setSaving(true);
    setErr("");
    try {
      const supabase = createBrowserClient();
      // onConflict explícito: company_id es PK, así que esto actualiza la fila
      // existente en vez de intentar insertar un duplicado.
      const { error } = await supabase.from("authority_matrix").upsert(
        {
          company_id: companyId,
          n1_amount: vN1,
          n2_min: vN2min,
          n2_max: vN2max,
          n3_threshold: vN3,
          currency,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id" }
      );
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      router.refresh();
    } catch (e) {
      console.error("Error guardando matriz:", e);
      setErr("No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Scale size={15} className="text-[#9fb9ff]" />
        <h3 className="text-[13.5px] font-semibold text-fg">Matriz de Autoridad</h3>
      </div>
      <p className="mb-3 text-[12px] text-fg-muted">¿Cuánto puede gastar/decidir cada uno sin preguntar?</p>

      {/* Niveles */}
      <div className="space-y-2">
        <Level
          color="#34d399"
          label="N1 · Autonomía total"
          desc={
            toNum(n1) != null
              ? `Hasta ${fmt(n1)} → decide solo, sin avisar.`
              : "Sin definir — configurá el monto abajo."
          }
        />
        <Level
          color="#fbbf24"
          label="N2 · Táctica"
          desc={
            toNum(n2min) != null || toNum(n2max) != null
              ? `${fmt(n2min)} a ${fmt(n2max)} → ejecuta e informa.`
              : "Sin definir — configurá el rango abajo."
          }
        />
        <Level
          color="#f87171"
          label="N3 · Requiere aprobación"
          desc={
            toNum(n3) != null
              ? `Más de ${fmt(n3)} → pide tu OK antes.`
              : "Sin definir — configurá el umbral abajo."
          }
        />
      </div>

      {/* Edición (Arquitecto) */}
      {editable && (
        <div className="mt-3.5 border-t border-white/[0.07] pt-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <NumField label="N1 — hasta" value={n1} onChange={setN1} />
            <NumField label="Moneda" value={currency} onChange={setCurrency} text />
            <NumField label="N2 — desde" value={n2min} onChange={setN2min} />
            <NumField label="N2 — hasta" value={n2max} onChange={setN2max} />
            <NumField label="N3 — umbral" value={n3} onChange={setN3} />
          </div>
          {err && <p className="mt-2 text-[12px] text-[#f87171]">{err}</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-[9px] border border-[#5b8aff]/40 bg-[#5b8aff]/20 px-3.5 py-2 text-[12.5px] font-bold text-[#bcd0ff] transition hover:bg-[#5b8aff]/30 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar matriz"}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#34d399]">
                <Check size={14} /> Guardado
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Level({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      <div>
        <span className="text-[12.5px] font-semibold" style={{ color }}>
          {label}
        </span>
        <span className="text-[12.5px] text-fg-muted"> — {desc}</span>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  text,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  text?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-fg-muted">{label}</label>
      <input
        inputMode={text ? "text" : "decimal"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[9px] border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-[13px] text-fg outline-none transition focus:border-[#5b8aff]/60"
      />
    </div>
  );
}
