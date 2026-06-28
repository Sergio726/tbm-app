"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import { X, Plus, Check } from "lucide-react";
import {
  HABIT_CATALOG,
  HABIT_CATEGORIES,
  HABIT_CATEGORY_META,
  MAX_HABITS,
  CUSTOM_HABIT_EMOJI,
  type HabitCategory,
} from "@/lib/habits";
import type { UserHabit } from "@/types/database";

interface Props {
  userId: string;
  companyId: string;
  /** Todos los hábitos del usuario (activos + inactivos) para diff correcto. */
  allHabits: UserHabit[];
  onClose: () => void;
}

export default function HabitsPicker({
  userId,
  companyId,
  allHabits,
  onClose,
}: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activeCustoms = useMemo(
    () => allHabits.filter((h) => h.is_active && !h.catalog_key),
    [allHabits]
  );

  // Selección inicial = lo que hoy está activo.
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () =>
      new Set(
        allHabits
          .filter((h) => h.is_active && h.catalog_key)
          .map((h) => h.catalog_key as string)
      )
  );
  const [keptCustomIds, setKeptCustomIds] = useState<Set<string>>(
    () => new Set(activeCustoms.map((h) => h.id))
  );
  const [newCustoms, setNewCustoms] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState("");

  const total =
    selectedKeys.size + keptCustomIds.size + newCustoms.length;
  const atMax = total >= MAX_HABITS;

  const toggleCatalog = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (!atMax) next.add(key);
      return next;
    });
  };

  const toggleCustom = (id: string) => {
    setKeptCustomIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (!atMax) next.add(id);
      return next;
    });
  };

  const addCustom = () => {
    const label = customDraft.trim();
    if (!label || atMax) return;
    if (newCustoms.length >= 2) return; // 1–2 propios por pasada
    setNewCustoms((prev) => [...prev, label]);
    setCustomDraft("");
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        // 1. Desactivar lo que estaba activo y ya no se quiere.
        const toDeactivate = allHabits
          .filter(
            (h) =>
              h.is_active &&
              ((h.catalog_key && !selectedKeys.has(h.catalog_key)) ||
                (!h.catalog_key && !keptCustomIds.has(h.id)))
          )
          .map((h) => h.id);
        if (toDeactivate.length) {
          const { error: e } = await supabase
            .from("user_habits")
            .update({ is_active: false })
            .in("id", toDeactivate);
          if (e) throw e;
        }

        // 2. Reactivar items de catálogo re-elegidos que ya existían inactivos.
        const existingByKey = new Map(
          allHabits.filter((h) => h.catalog_key).map((h) => [h.catalog_key, h])
        );
        const toReactivate = Array.from(selectedKeys)
          .map((k) => existingByKey.get(k))
          .filter((h): h is UserHabit => !!h && !h.is_active)
          .map((h) => h.id);
        if (toReactivate.length) {
          const { error: e } = await supabase
            .from("user_habits")
            .update({ is_active: true })
            .in("id", toReactivate);
          if (e) throw e;
        }

        // 3. Insertar catálogo nuevo (sin fila previa) + customs nuevos.
        const inserts: {
          user_id: string;
          company_id: string;
          label: string;
          emoji: string | null;
          category: string;
          catalog_key: string | null;
          sort_order: number;
        }[] = [];
        let order = allHabits.length;
        for (const key of selectedKeys) {
          if (existingByKey.has(key)) continue;
          const item = HABIT_CATALOG.find((c) => c.key === key);
          if (!item) continue;
          inserts.push({
            user_id: userId,
            company_id: companyId,
            label: item.label,
            emoji: item.emoji,
            category: item.category,
            catalog_key: item.key,
            sort_order: order++,
          });
        }
        for (const label of newCustoms) {
          inserts.push({
            user_id: userId,
            company_id: companyId,
            label,
            emoji: CUSTOM_HABIT_EMOJI,
            category: "custom",
            catalog_key: null,
            sort_order: order++,
          });
        }
        if (inserts.length) {
          const { error: e } = await supabase.from("user_habits").insert(inserts);
          if (e) throw e;
        }

        capture("habits_configured", { count: total });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(5,10,20,0.72)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "clamp(0px, 4vw, 40px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>
              Tus hábitos del Pre-game
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: total >= MAX_HABITS ? "#fbbf24" : "rgba(255,255,255,0.5)",
                marginTop: 2,
              }}
            >
              {total}/{MAX_HABITS} elegidos · tocá para sumar o quitar
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--elevated)",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
            }}
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>

        {/* Catálogo scrolleable */}
        <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
          {HABIT_CATEGORIES.map((cat) => (
            <CategoryBlock
              key={cat}
              category={cat}
              selectedKeys={selectedKeys}
              onToggle={toggleCatalog}
              disabledAdd={atMax}
            />
          ))}

          {/* Customs existentes */}
          {activeCustoms.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <SectionLabel>Tuyos</SectionLabel>
              <div className="flex" style={{ flexWrap: "wrap", gap: 8 }}>
                {activeCustoms.map((h) => (
                  <Chip
                    key={h.id}
                    emoji={h.emoji ?? CUSTOM_HABIT_EMOJI}
                    label={h.label}
                    selected={keptCustomIds.has(h.id)}
                    onClick={() => toggleCustom(h.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nuevos customs en esta pasada */}
          {newCustoms.length > 0 && (
            <div className="flex" style={{ flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {newCustoms.map((label, i) => (
                <Chip
                  key={`new-${i}`}
                  emoji={CUSTOM_HABIT_EMOJI}
                  label={label}
                  selected
                  onClick={() =>
                    setNewCustoms((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          )}

          {/* Agregar propio */}
          <div style={{ marginTop: 18 }}>
            <SectionLabel>Agregá el tuyo</SectionLabel>
            <div className="flex items-center" style={{ gap: 8 }}>
              <input
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="Ej: 10 min de inglés"
                maxLength={40}
                disabled={atMax || newCustoms.length >= 2}
                style={{
                  flex: 1,
                  background: "var(--elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--fg)",
                  padding: "11px 14px",
                  fontSize: 16, // evita zoom de iOS
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={addCustom}
                disabled={!customDraft.trim() || atMax || newCustoms.length >= 2}
                className="flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: customDraft.trim() && !atMax
                    ? "rgba(91,138,255,0.16)"
                    : "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  color: customDraft.trim() && !atMax ? "#9bb8ff" : "rgba(255,255,255,0.4)",
                }}
                aria-label="Agregar hábito"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 12.5,
                color: "var(--danger-text)",
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={save}
            disabled={isPending}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 11,
              background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
              color: "var(--fg)",
              border: "none",
              fontSize: 14.5,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Guardando…" : "Guardar mis hábitos"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryBlock({
  category,
  selectedKeys,
  onToggle,
  disabledAdd,
}: {
  category: HabitCategory;
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  disabledAdd: boolean;
}) {
  const meta = HABIT_CATEGORY_META[category];
  const items = HABIT_CATALOG.filter((h) => h.category === category);
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>
        {meta.emoji} {meta.label}
      </SectionLabel>
      <div className="flex" style={{ flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => {
          const selected = selectedKeys.has(item.key);
          return (
            <Chip
              key={item.key}
              emoji={item.emoji}
              label={item.label}
              selected={selected}
              disabled={!selected && disabledAdd}
              onClick={() => onToggle(item.key)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase"
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--fg-subtle)",
        letterSpacing: 1.1,
        marginBottom: 9,
      }}
    >
      {children}
    </div>
  );
}

function Chip({
  emoji,
  label,
  selected,
  disabled,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center"
      style={{
        gap: 7,
        padding: "9px 13px",
        borderRadius: 999,
        background: selected
          ? "rgba(52,211,153,0.12)"
          : "rgba(255,255,255,0.04)",
        border: selected
          ? "1px solid rgba(52,211,153,0.40)"
          : "1px solid rgba(255,255,255,0.09)",
        color: selected ? "#34d399" : "rgba(255,255,255,0.78)",
        fontSize: 13.5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{ fontSize: 15 }}>{emoji}</span>
      {label}
      {selected && <Check size={13} />}
    </button>
  );
}
