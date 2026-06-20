/**
 * Lógica de saludo + briefing compartida entre el header (server component) y
 * la bienvenida cinemática JARVIS (client component, S17.D).
 * Centralizado acá para no duplicar y para que el typewriter del overlay use
 * exactamente el mismo briefing que el resto del dashboard.
 */

export function greetingForHour(h: number): string {
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export type BriefingData = {
  tasksDueCount: number;
  nextRitualLabel: string | null;
  areasCriticasCount: number;
  unreadCount: number;
};

/**
 * Construye el briefing contextual del día a partir de datos reales (1–3 frases).
 * Si no hay nada urgente, devuelve un fallback motivacional.
 */
export function buildBriefing({
  tasksDueCount,
  nextRitualLabel,
  areasCriticasCount,
  unreadCount,
}: BriefingData): string {
  const parts: string[] = [];

  if (tasksDueCount > 0) {
    parts.push(
      `tenés ${tasksDueCount} ${tasksDueCount === 1 ? "tarea por vencer" : "tareas por vencer"}`
    );
  }
  if (nextRitualLabel) parts.push(nextRitualLabel);
  if (areasCriticasCount > 0) {
    parts.push(
      `${areasCriticasCount} ${areasCriticasCount === 1 ? "área en rojo" : "áreas en rojo"} esperan tu atención`
    );
  }
  if (parts.length === 0 && unreadCount > 0) {
    parts.push(`tenés ${unreadCount} ${unreadCount === 1 ? "novedad" : "novedades"} sin leer`);
  }

  return parts.length > 0
    ? capitalize(joinNatural(parts)) + "."
    : "Todo en orden por aquí. Es un buen día para multiplicar.";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinNatural(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
