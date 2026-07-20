"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useRestartTour } from "@/hooks/use-restart-tour";

type PaletteItem = {
  label: string;
  href?: string;
  action?: string; // id de acción especial (ej. "restart-tour")
  icon: string;
  keywords?: string[];
  role?: "arquitecto" | "colaborador";
};

const MODULES: PaletteItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠", keywords: ["inicio", "home"] },
  { label: "Rituales", href: "/rituales", icon: "📋", keywords: ["pregame", "warup", "cooldown", "5 grandes"] },
  { label: "Mi Equipo", href: "/equipo", icon: "👥", keywords: ["disc", "delegacion", "equipo", "matriz", "perfil"] },
  { label: "Delegación", href: "/delegacion", icon: "📤", keywords: ["tareas", "pase", "estafeta", "kanban"] },
  { label: "Feedback S.E.C.", href: "/feedback", icon: "💬", keywords: ["sostener", "elevar", "corregir"] },
  { label: "Plan 90D", href: "/plan-90d", icon: "🎯", keywords: ["rocas", "bos", "ideas", "activos"] },
  { label: "Workbooks", href: "/workbooks", icon: "📚", keywords: ["sesiones", "programa", "ejercicios"] },
  { label: "Multiplicador", href: "/multiplicador", icon: "⚡", keywords: ["disminuidor", "pecados", "liderazgo", "roi", "talento"] },
  { label: "Diagnóstico", href: "/diagnostico", icon: "📊", keywords: ["scorecard", "areas", "evaluacion"] },
  { label: "Mi cuenta", href: "/cuenta", icon: "⚙️", keywords: ["perfil", "configuracion"] },
];

const QUICK_ACTIONS: PaletteItem[] = [
  { label: "Nueva tarea delegada", href: "/delegacion/nueva", icon: "➕", role: "arquitecto", keywords: ["crear", "delegar"] },
  { label: "Completar Pre-game de hoy", href: "/rituales/pre-game", icon: "📝", keywords: ["big wins", "ritual"] },
  { label: "Iniciar / unirme al War Up", href: "/rituales/war-up", icon: "⚡", keywords: ["standup", "ritual"] },
  { label: "Actualizar diagnóstico", href: "/diagnostico", icon: "📈", role: "arquitecto", keywords: ["scorecard"] },
  { label: "Diagnóstico Multiplicador", href: "/multiplicador", icon: "⚡", role: "arquitecto", keywords: ["disminuidor", "pecados", "roi"] },
  { label: "Mis tareas asignadas", href: "/delegacion/mis-tareas", icon: "✅", role: "colaborador", keywords: ["pendientes"] },
  { label: "Mi Programa (8 sesiones)", href: "/workbooks/mi-programa", icon: "🗺️", role: "arquitecto", keywords: ["progreso"] },
  { label: "Ver tour de nuevo", action: "restart-tour", icon: "🧭", keywords: ["tour", "ayuda", "onboarding", "guia", "help"] },
  { label: "Exportar diagnóstico (PDF)", href: "/export/diagnostico", icon: "🖨️", role: "arquitecto", keywords: ["pdf", "imprimir", "exportar"] },
  { label: "Exportar Plan 90D (PDF)", href: "/export/plan-90d", icon: "🖨️", role: "arquitecto", keywords: ["pdf", "rocas", "exportar"] },
  { label: "Exportar perfil del equipo (PDF)", href: "/export/equipo", icon: "🖨️", role: "arquitecto", keywords: ["pdf", "disc", "exportar"] },
  { label: "Exportar reporte semanal (PDF)", href: "/export/semana", icon: "🖨️", role: "arquitecto", keywords: ["pdf", "resumen", "exportar"] },
];

function matches(item: PaletteItem, q: string): boolean {
  if (!q) return true;
  const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word));
}

export function CommandPalette({
  userRole,
  userId,
  hasCompany = true,
  isCoach = false,
}: {
  userRole: string;
  userId: string;
  hasCompany?: boolean;
  isCoach?: boolean;
}) {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const { restart } = useRestartTour(userId);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const byRole = (item: PaletteItem) => !item.role || item.role === userRole;
  // Coach dedicado (sin empresa): los módulos de empresa rebotan sus guardas, así
  // que solo se listan los ítems que no dependen de una empresa (Mi cuenta +
  // acciones sin href). Su navegación real vive en el panel Super Coach.
  const byCompany = (item: PaletteItem) =>
    hasCompany || !item.href || item.href === "/cuenta";
  // El colaborador ve "/equipo" como su propia ficha → "Mi Perfil".
  const relabel = (item: PaletteItem): PaletteItem =>
    item.href === "/equipo" && userRole !== "arquitecto"
      ? { ...item, label: "Mi Perfil" }
      : item;

  const sections = useMemo(() => {
    const base = isCoach
      ? [
          { label: "Super Coach", href: "/super-coach", icon: "🎓", keywords: ["empresas", "alumnos", "coach", "panel"] },
          ...MODULES,
        ]
      : MODULES;
    const mods = base
      .filter(byRole)
      .filter(byCompany)
      .filter((m) => matches(m, query))
      .map(relabel);
    const actions = QUICK_ACTIONS.filter(byRole)
      .filter(byCompany)
      .filter((a) => matches(a, query));
    return { mods, actions, flat: [...mods, ...actions] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, userRole, hasCompany, isCoach]);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // focus después del render del modal
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  const go = (item: PaletteItem) => {
    setOpen(false);
    if (item.action === "restart-tour") {
      void restart();
      return;
    }
    if (item.href) router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, sections.flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = sections.flat[activeIdx];
      if (item) go(item);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, 90vw)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: "var(--border)" }}
        >
          <Search size={16} className="text-fg-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar o ir a…"
            className="flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-muted"
          />
          <kbd
            className="rounded px-1.5 py-0.5 text-[10px] text-fg-muted"
            style={{ background: "var(--elevated)" }}
          >
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[380px] overflow-y-auto py-2">
          {sections.flat.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-fg-muted">
              Sin resultados para &quot;{query}&quot;
            </p>
          )}

          {sections.mods.length > 0 && (
            <PaletteSection
              title="Módulos"
              items={sections.mods}
              offset={0}
              activeIdx={activeIdx}
              onHover={setActiveIdx}
              onSelect={go}
            />
          )}
          {sections.actions.length > 0 && (
            <PaletteSection
              title="Acciones rápidas"
              items={sections.actions}
              offset={sections.mods.length}
              activeIdx={activeIdx}
              onHover={setActiveIdx}
              onSelect={go}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 border-t px-4 py-2.5 text-[10.5px] text-fg-muted"
          style={{ borderColor: "var(--border)" }}
        >
          <span>↑↓ navegar</span>
          <span>↵ ir</span>
          <span>Esc cerrar</span>
          <span className="ml-auto">⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}

function PaletteSection({
  title,
  items,
  offset,
  activeIdx,
  onHover,
  onSelect,
}: {
  title: string;
  items: PaletteItem[];
  offset: number;
  activeIdx: number;
  onHover: (idx: number) => void;
  onSelect: (item: PaletteItem) => void;
}) {
  return (
    <div className="mb-1">
      <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[1.2px] text-fg-muted">
        {title}
      </div>
      {items.map((item, i) => {
        const idx = offset + i;
        const active = idx === activeIdx;
        return (
          <button
            key={(item.href ?? item.action ?? "") + item.label}
            type="button"
            onMouseEnter={() => onHover(idx)}
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
            style={{
              background: active ? "rgba(91,138,255,0.12)" : "transparent",
              borderLeft: active
                ? "2px solid #5b8aff"
                : "2px solid transparent",
            }}
          >
            <span className="text-[15px]">{item.icon}</span>
            <span
              className="flex-1 text-[13.5px]"
              style={{ color: active ? "#fff" : "rgba(255,255,255,0.75)" }}
            >
              {item.label}
            </span>
            {active && (
              <span className="text-[11px] text-fg-muted">↵</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
