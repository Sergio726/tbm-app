// DC · N1 — Navegación sugerida por el asistente ("Ir a {módulo} →").
// El modelo emite un marcador [[IR:<slug>]] al final de su respuesta; el panel lo
// convierte en un botón que navega al módulo. Read-only ⇒ sin confirmación.
// Framework-agnóstico (lo usan el route server y el panel cliente).

export type NavTarget = { path: string; label: string };

// Whitelist de destinos. Las rutas viven en el grupo (dashboard) → URL en la raíz.
const NAV_TARGETS: Record<string, NavTarget> = {
  dashboard: { path: "/dashboard", label: "Inicio" },
  equipo: { path: "/equipo", label: "Mi Equipo" },
  delegacion: { path: "/delegacion", label: "Delegación" },
  rituales: { path: "/rituales", label: "Rituales" },
  "plan-90d": { path: "/plan-90d", label: "Plan 90D" },
  feedback: { path: "/feedback", label: "Feedback S.E.C." },
  workbooks: { path: "/workbooks", label: "Workbooks" },
  multiplicador: { path: "/multiplicador", label: "Multiplicador" },
  diagnostico: { path: "/diagnostico", label: "Diagnóstico" },
  sistema: { path: "/sistema", label: "Sistema LOST" },
  creditos: { path: "/creditos", label: "Créditos" },
  cuenta: { path: "/cuenta", label: "Mi Cuenta" },
};

export const NAV_SLUGS = Object.keys(NAV_TARGETS);

export function resolveNav(slug: string | null | undefined): NavTarget | null {
  if (!slug) return null;
  return NAV_TARGETS[slug.trim().toLowerCase()] ?? null;
}

const MARKER_RE = /\[\[IR:\s*([a-z0-9-]+)\s*\]\]/gi;
// Marcador parcial al final (mientras llega por streaming): "...[[IR:dele"
const PARTIAL_TRAILING_RE = /\[\[(?:I(?:R(?::[^\]]*)?)?)?$/i;

/**
 * Quita los marcadores [[IR:slug]] (y un parcial final) del texto y devuelve el
 * primer destino válido encontrado. Si no hay marcador válido, target = null.
 */
export function parseNavMarker(text: string): { clean: string; target: NavTarget | null } {
  let target: NavTarget | null = null;
  MARKER_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MARKER_RE.exec(text)) !== null) {
    const t = resolveNav(m[1]);
    if (t && !target) target = t;
  }
  const clean = text.replace(MARKER_RE, "").replace(PARTIAL_TRAILING_RE, "").trimEnd();
  return { clean, target };
}
