"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Check, Inbox, Target, Loader2 } from "lucide-react";
import type { Los5Grandes, Los5GrandesItem } from "@/types/database";

type FormItem = {
  position: number;
  title: string;
  rock_label: string;
  executed: boolean;
  execution_note: string;
  existingId?: string;
};

function emptyItems(): FormItem[] {
  return [1, 2, 3, 4, 5].map((p) => ({
    position: p,
    title: "",
    rock_label: "",
    executed: false,
    execution_note: "",
  }));
}

interface Props {
  companyId: string;
  userId: string;
  forDate: string;
  canEdit: boolean;
  canMarkExecuted: boolean;
  initialParent: Los5Grandes | null;
  initialItems: Los5GrandesItem[];
}

export default function Los5GrandesForm({
  companyId,
  userId,
  forDate,
  canEdit,
  canMarkExecuted,
  initialParent,
  initialItems,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<FormItem[]>(() => {
    const seeded = emptyItems();
    initialItems.forEach((it) => {
      const slot = seeded.find((s) => s.position === it.position);
      if (!slot) return;
      slot.title = it.title ?? "";
      slot.rock_label = it.rock_label ?? "";
      slot.executed = it.executed ?? false;
      slot.execution_note = it.execution_note ?? "";
      slot.existingId = it.id;
    });
    return seeded;
  });
  const [notes, setNotes] = useState(initialParent?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [parkBusyPos, setParkBusyPos] = useState<number | null>(null);

  const filledCount = items.filter((i) => i.title.trim().length > 0).length;
  const allFilled = filledCount === 5;
  const executedCount = items.filter((i) => i.executed).length;

  const updateItem = (pos: number, patch: Partial<FormItem>) => {
    setItems((curr) =>
      curr.map((it) => (it.position === pos ? { ...it, ...patch } : it))
    );
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      // 1) Upsert parent
      let parentId = initialParent?.id;
      if (!parentId) {
        const { data, error: err } = await supabase
          .from("los_5_grandes")
          .insert({
            company_id: companyId,
            user_id: userId,
            for_date: forDate,
            notes: notes.trim() || null,
          })
          .select()
          .single();
        if (err || !data) {
          setError(err?.message ?? "No se pudo crear Los 5 Grandes.");
          return;
        }
        parentId = data.id;
      } else {
        const { error: err } = await supabase
          .from("los_5_grandes")
          .update({ notes: notes.trim() || null })
          .eq("id", parentId);
        if (err) {
          setError(err.message);
          return;
        }
      }

      // 2) Upsert items (insert los nuevos, update los existentes)
      for (const it of items) {
        const payload = {
          title: it.title.trim(),
          rock_label: it.rock_label.trim() || null,
          executed: it.executed,
          execution_note: it.execution_note.trim() || null,
          executed_at: it.executed ? new Date().toISOString() : null,
        };

        if (!payload.title) {
          if (it.existingId) {
            await supabase
              .from("los_5_grandes_items")
              .delete()
              .eq("id", it.existingId);
          }
          continue;
        }

        if (it.existingId) {
          const { error: err } = await supabase
            .from("los_5_grandes_items")
            .update(payload)
            .eq("id", it.existingId);
          if (err) {
            setError(err.message);
            return;
          }
        } else {
          const { error: err } = await supabase
            .from("los_5_grandes_items")
            .insert({
              los_5_grandes_id: parentId!,
              position: it.position,
              ...payload,
            });
          if (err) {
            setError(err.message);
            return;
          }
        }
      }

      router.refresh();
    });
  };

  const parkItem = async (it: FormItem) => {
    if (!it.title.trim()) return;
    setParkBusyPos(it.position);
    try {
      const { error: err } = await supabase.from("parking_lot").insert({
        company_id: companyId,
        source: "5_grandes",
        source_entry_id: it.existingId ?? null,
        proposed_by: userId,
        title: it.title.trim(),
        rationale: it.rock_label.trim()
          ? `Aparcado desde Los 5 Grandes del ${forDate}. Mencionaba: "${it.rock_label.trim()}".`
          : `Aparcado desde Los 5 Grandes del ${forDate}.`,
        rock_label: it.rock_label.trim() || null,
      });
      if (err) {
        setError(err.message);
      } else {
        updateItem(it.position, {
          title: "",
          rock_label: "",
          execution_note: "",
          executed: false,
        });
        if (it.existingId) {
          await supabase
            .from("los_5_grandes_items")
            .delete()
            .eq("id", it.existingId);
        }
        router.refresh();
      }
    } finally {
      setParkBusyPos(null);
    }
  };

  return (
    <div
      style={{
        padding: 28,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 22 }}
      >
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            letterSpacing: 1.3,
          }}
        >
          {filledCount} / 5 prioridades
          {canMarkExecuted && executedCount > 0 && (
            <span style={{ marginLeft: 12, color: "var(--success-text)" }}>
              · {executedCount} ejecutadas
            </span>
          )}
        </div>
        {allFilled && (
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 11.5,
              color: "#a5b4fc",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(129,140,248,0.12)",
              border: "1px solid rgba(129,140,248,0.30)",
            }}
          >
            <Check size={12} />
            Completo
          </span>
        )}
      </div>

      <div className="flex flex-col" style={{ gap: 14 }}>
        {items.map((it) => (
          <ItemRow
            key={it.position}
            item={it}
            canEdit={canEdit}
            canMarkExecuted={canMarkExecuted}
            parkBusy={parkBusyPos === it.position}
            onChange={(patch) => updateItem(it.position, patch)}
            onPark={() => parkItem(it)}
          />
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <Label>Notas (opcional)</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          placeholder="Contexto, riesgos, dependencias del día siguiente…"
          rows={2}
          style={{
            width: "100%",
            background: canEdit ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: canEdit ? "#fff" : "rgba(255,255,255,0.55)",
            padding: "10px 14px",
            fontSize: 13.5,
            resize: "vertical",
            fontFamily: "inherit",
            marginTop: 6,
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.30)",
            color: "var(--danger-text)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {canEdit && (
        <div
          className="flex items-center justify-end"
          style={{ marginTop: 22 }}
        >
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              color: "var(--fg)",
              border: "none",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Guardando…" : "Guardar Los 5 Grandes"}
          </button>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  canEdit,
  canMarkExecuted,
  parkBusy,
  onChange,
  onPark,
}: {
  item: FormItem;
  canEdit: boolean;
  canMarkExecuted: boolean;
  parkBusy: boolean;
  onChange: (patch: Partial<FormItem>) => void;
  onPark: () => void;
}) {
  const filled = item.title.trim().length > 0;

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: item.executed
          ? "rgba(52,211,153,0.06)"
          : "rgba(255,255,255,0.025)",
        border: item.executed
          ? "1px solid rgba(52,211,153,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        opacity: !filled && !canEdit ? 0.45 : 1,
      }}
    >
      <div className="flex items-start" style={{ gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(129,140,248,0.10)",
            border: "1px solid rgba(129,140,248,0.25)",
            color: "#a5b4fc",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {item.position}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={item.title}
            onChange={(e) => onChange({ title: e.target.value })}
            disabled={!canEdit}
            placeholder="Prioridad estratégica · qué resultado concreto querés del día"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--fg)",
              fontSize: 14.5,
              fontWeight: 500,
              padding: 0,
              marginBottom: 6,
              fontFamily: "inherit",
            }}
          />
          <div
            className="flex items-center"
            style={{ gap: 8, flexWrap: "wrap" }}
          >
            <div
              className="flex items-center"
              style={{
                gap: 6,
                fontSize: 12,
                color: "var(--fg-subtle)",
                flex: 1,
                minWidth: 220,
              }}
            >
              <Target size={12} />
              <input
                value={item.rock_label}
                onChange={(e) => onChange({ rock_label: e.target.value })}
                disabled={!canEdit}
                placeholder="Roca del Plan 90D a la que aporta (texto libre por ahora)"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--fg)",
                  fontSize: 12,
                  padding: 0,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {canMarkExecuted && filled && (
              <button
                type="button"
                onClick={() => onChange({ executed: !item.executed })}
                className="flex items-center"
                style={{
                  gap: 4,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: item.executed
                    ? "rgba(52,211,153,0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: item.executed
                    ? "1px solid rgba(52,211,153,0.30)"
                    : "1px solid rgba(255,255,255,0.10)",
                  color: item.executed ? "#34d399" : "rgba(255,255,255,0.6)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Check size={11} />
                {item.executed ? "Ejecutada" : "Marcar"}
              </button>
            )}

            {canEdit && filled && !item.rock_label.trim() && (
              <button
                type="button"
                onClick={onPark}
                disabled={parkBusy}
                className="flex items-center"
                style={{
                  gap: 4,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: "rgba(148,163,184,0.12)",
                  border: "1px solid rgba(148,163,184,0.28)",
                  color: "var(--fg-muted)",
                  fontSize: 11.5,
                  cursor: parkBusy ? "not-allowed" : "pointer",
                  opacity: parkBusy ? 0.6 : 1,
                }}
              >
                {parkBusy ? <Loader2 size={11} className="animate-spin" /> : <Inbox size={11} />}
                Aparcar
              </button>
            )}
          </div>

          {item.executed && canMarkExecuted && (
            <input
              value={item.execution_note}
              onChange={(e) => onChange({ execution_note: e.target.value })}
              placeholder="Nota de ejecución (opcional)"
              style={{
                width: "100%",
                marginTop: 8,
                background: "var(--elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--fg)",
                padding: "6px 10px",
                fontSize: 12.5,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--fg)",
      }}
    >
      {children}
    </div>
  );
}
