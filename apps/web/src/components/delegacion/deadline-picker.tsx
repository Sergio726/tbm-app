"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ACCENT = "#f87171"; // rojo del paso "CUÁNDO"

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toValue(d: Date, h: number, m: number) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`;
}

function parseValue(v: string): { date: Date | null; hour: number; minute: number } {
  if (!v) return { date: null, hour: 9, minute: 0 };
  const [datePart, timePart] = v.split("T");
  const [y, mo, da] = datePart.split("-").map(Number);
  const [h, mi] = (timePart ?? "09:00").split(":").map(Number);
  if (!y || !mo || !da) return { date: null, hour: h || 9, minute: mi || 0 };
  return { date: new Date(y, mo - 1, da), hour: h ?? 9, minute: mi ?? 0 };
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCells(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const TIME_PRESETS = [
  { label: "9:00", h: 9, m: 0 },
  { label: "12:00", h: 12, m: 0 },
  { label: "15:00", h: 15, m: 0 },
  { label: "18:00", h: 18, m: 0 },
];

export function DeadlinePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = useMemo(() => parseValue(value), [value]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = parsed.date ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && parsed.date) {
      setViewMonth(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
    }
  }, [open, parsed.date]);

  const cells = useMemo(() => buildCells(viewMonth), [viewMonth]);

  const commit = (date: Date, h: number, m: number) => {
    onChange(toValue(date, h, m));
  };

  const handlePickDay = (d: Date) => {
    commit(d, parsed.hour, parsed.minute);
  };

  const handleTime = (h: number, m: number) => {
    const base = parsed.date ?? today;
    commit(base, h, m);
  };

  const applyPreset = (offsetDays: number) => {
    const base = startOfDay(new Date());
    base.setDate(base.getDate() + offsetDays);
    const h = parsed.date ? parsed.hour : 18;
    const m = parsed.date ? parsed.minute : 0;
    commit(base, h, m);
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
  };

  const triggerLabel = parsed.date
    ? `${parsed.date.getDate()} de ${MONTHS[parsed.date.getMonth()]} ${parsed.date.getFullYear()} · ${pad(parsed.hour)}:${pad(parsed.minute)}`
    : "Elegí día y hora límite";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition"
        style={{
          borderColor: open ? `${ACCENT}80` : "rgba(255,255,255,0.09)",
          background: "rgba(255,255,255,0.035)",
          boxShadow: open ? `0 0 0 3px ${ACCENT}26` : "none",
          cursor: "pointer",
        }}
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `${ACCENT}1a`,
            border: `1px solid ${ACCENT}33`,
            color: ACCENT,
          }}
        >
          <CalendarIcon size={16} strokeWidth={1.8} />
        </span>
        <span
          style={{
            fontSize: 14,
            color: parsed.date ? "#fff" : "rgba(255,255,255,0.4)",
            fontWeight: parsed.date ? 600 : 400,
          }}
        >
          {triggerLabel}
        </span>
        <ChevronRight
          size={16}
          style={{
            marginLeft: "auto",
            color: "var(--fg-muted)",
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute z-50 mt-2 overflow-hidden rounded-2xl border"
          style={{
            left: 0,
            width: 340,
            maxWidth: "calc(100vw - 48px)",
            borderColor: "rgba(255,255,255,0.1)",
            background: "linear-gradient(180deg, #141a2b, #0f1422)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* Atajos rápidos */}
          <div
            className="flex flex-wrap gap-2 border-b px-4 py-3"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {[
              { label: "Hoy", off: 0 },
              { label: "Mañana", off: 1 },
              { label: "En 3 días", off: 3 },
              { label: "En 1 semana", off: 7 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.off)}
                className="rounded-lg border px-2.5 py-1.5 transition-all"
                style={{
                  fontSize: 12,
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Header de mes */}
          <div className="flex items-center justify-between px-4 pt-4">
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (v) => new Date(v.getFullYear(), v.getMonth() - 1, 1)
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "var(--fg-muted)", cursor: "pointer" }}
                aria-label="Mes anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (v) => new Date(v.getFullYear(), v.getMonth() + 1, 1)
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "var(--fg-muted)", cursor: "pointer" }}
                aria-label="Mes siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div
            className="grid px-4 pt-3"
            style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
          >
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  paddingBottom: 4,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div
            className="grid px-4 pb-1"
            style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
          >
            {cells.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} />;
              const isPast = startOfDay(cell) < today;
              const isToday = sameDay(cell, today);
              const isSelected = sameDay(cell, parsed.date);
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  disabled={isPast}
                  onClick={() => handlePickDay(cell)}
                  className="flex items-center justify-center rounded-lg transition-all"
                  style={{
                    height: 36,
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: isPast ? "not-allowed" : "pointer",
                    color: isPast
                      ? "rgba(255,255,255,0.18)"
                      : isSelected
                        ? "#fff"
                        : "rgba(255,255,255,0.8)",
                    background: isSelected
                      ? `linear-gradient(135deg, ${ACCENT}, #dc2626)`
                      : "transparent",
                    border: isToday && !isSelected
                      ? `1px solid ${ACCENT}55`
                      : "1px solid transparent",
                    boxShadow: isSelected
                      ? `0 4px 12px ${ACCENT}55`
                      : "none",
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          {/* Selector de hora */}
          <div
            className="border-t px-4 py-3.5"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Clock size={14} style={{ color: "var(--fg-subtle)" }} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  color: "var(--fg-subtle)",
                }}
              >
                Hora límite
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={`${pad(parsed.hour)}:${pad(parsed.minute)}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  if (!Number.isNaN(h) && !Number.isNaN(m)) handleTime(h, m);
                }}
                className="rounded-lg border bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-[#f87171]/50"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  colorScheme: "dark",
                }}
              />
              <div className="flex flex-1 flex-wrap gap-1.5">
                {TIME_PRESETS.map((t) => {
                  const active =
                    parsed.hour === t.h && parsed.minute === t.m;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => handleTime(t.h, t.m)}
                      className="rounded-md border px-2 py-1.5 transition-all"
                      style={{
                        fontSize: 11.5,
                        borderColor: active
                          ? `${ACCENT}66`
                          : "rgba(255,255,255,0.08)",
                        background: active
                          ? `${ACCENT}22`
                          : "rgba(255,255,255,0.03)",
                        color: active ? "#fca5a5" : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
              {parsed.date
                ? `${parsed.date.getDate()}/${pad(parsed.date.getMonth() + 1)} · ${pad(parsed.hour)}:${pad(parsed.minute)}`
                : "Sin fecha seleccionada"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={!parsed.date}
              className="rounded-lg px-4 py-1.5 text-white transition-opacity"
              style={{
                fontSize: 13,
                fontWeight: 600,
                background: parsed.date
                  ? `linear-gradient(135deg, ${ACCENT}, #dc2626)`
                  : "rgba(255,255,255,0.06)",
                color: parsed.date ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: parsed.date ? "pointer" : "not-allowed",
                boxShadow: parsed.date ? `0 4px 12px ${ACCENT}40` : "none",
              }}
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
