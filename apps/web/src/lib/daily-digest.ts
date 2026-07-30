/**
 * El despertador diario (S23 · §A1) — armado del contenido, puro y testeable.
 *
 * Dilio (Meet 2026-07-25): *"sería bueno que el sistema te despierte con un
 * correo… buenos días, aquí DC, tu executive coach, recuerda hacer tu pre-game…
 * y que le sugiera a la persona **lo que él dijo que hace diariamente**"*.
 *
 * Este módulo NO hace queries ni envía nada: recibe el estado ya resuelto y
 * devuelve asunto + líneas. Así el cron queda fino y esto se puede testear sin
 * base de datos ni correo.
 *
 * Dos reglas del sprint viven acá:
 *  1. **Siempre hay contenido.** El digest viejo cortaba con
 *     `if (lines.length === 0) continue`, así que en un día tranquilo no llegaba
 *     nada. Un despertador que a veces no suena no es un despertador: cuando no
 *     hay pendientes, el correo sale en tono de refuerzo.
 *  2. **Los hábitos son los que la persona eligió**, no el catálogo entero.
 */

export type DigestHabit = {
  label: string;
  emoji: string | null;
  done: boolean;
};

export type DigestInput = {
  /** Nombre del asistente, configurable desde el admin (DC por default). */
  dcName: string;
  /** Nombre de pila del destinatario. */
  firstName: string;
  companyName: string;
  /** 0=domingo … 6=sábado, en la zona horaria de la persona. */
  weekday: number;
  preGameDone: boolean;
  habits: DigestHabit[];
  overdueTaskCount: number;
  /** Solo para el Arquitecto: el War Up del equipo todavía no arrancó. */
  warUpPending: boolean | null;
  /** Rocas activas, para el check-in de los lunes. */
  rocks: { title: string; progress: number }[];
  /** ¿Hay reporte semanal listo? (domingos) */
  weeklyReportReady: boolean;
};

export type DigestContent = {
  subject: string;
  greeting: string;
  lines: string[];
};

/** Escape mínimo: todo esto se interpola en HTML de email. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Saludo con la voz de DC. Dilio lo dictó casi textual, así que se respeta:
 * "Buenos días, {nombre}. Acá {DC}, tu executive coach."
 */
export function dcGreeting(dcName: string, firstName: string): string {
  const name = esc(firstName.trim()) || "¿cómo va?";
  return `Buenos días, ${name}. Acá <strong>${esc(dcName)}</strong>, tu executive coach.`;
}

export function buildDailyDigest(input: DigestInput): DigestContent {
  const lines: string[] = [];

  // ── 1. El Pre-game es el ancla del ritual: va primero, siempre.
  if (input.preGameDone) {
    lines.push("☀️ Tu <strong>Pre-game</strong> de hoy ya está hecho. Arrancaste bien.");
  } else {
    lines.push(
      "☀️ Todavía no hiciste tu <strong>Pre-game</strong>. Son 2 minutos y ordenan el día entero."
    );
  }

  // ── 2. Los hábitos que la persona declaró — la pieza que pidió Dilio.
  if (input.habits.length > 0) {
    const pending = input.habits.filter((h) => !h.done);
    const doneCount = input.habits.length - pending.length;

    if (pending.length === 0) {
      lines.push(
        `✅ <strong>Cerraste tus ${input.habits.length} hábitos</strong> de hoy. Eso es la Marcha de 20 Millas.`
      );
    } else {
      const list = pending
        .map((h) => `${h.emoji ? `${esc(h.emoji)} ` : ""}${esc(h.label)}`)
        .join(" · ");
      lines.push(
        doneCount > 0
          ? `🎯 Vas ${doneCount} de ${input.habits.length} hábitos. Te quedan: ${list}.`
          : `🎯 Tus hábitos de hoy: ${list}.`
      );
    }
  }

  // ── 3. Lo que aprieta.
  if (input.overdueTaskCount > 0) {
    const n = input.overdueTaskCount;
    lines.push(
      `⏰ Tenés <strong>${n} ${n === 1 ? "tarea" : "tareas"} sin movimiento</strong> hace más de 72h. Actualizá el estado o escalá con tus 3 opciones.`
    );
  }

  // ── 4. Solo Arquitecto.
  if (input.warUpPending) {
    lines.push("⚡ El <strong>War Up</strong> de hoy todavía no se inició con tu equipo.");
  }

  // Lunes: check-in de Rocas.
  if (input.weekday === 1 && input.rocks.length > 0) {
    const rocks = input.rocks
      .map((r) => `${esc(r.title)} (${r.progress}%)`)
      .join(" · ");
    lines.push(`🏔️ Lunes de check-in — tus Rocas: ${rocks}.`);
  }

  // Domingo: reporte semanal.
  if (input.weekday === 0 && input.weeklyReportReady) {
    lines.push("📊 El <strong>Reporte Semanal</strong> de tu equipo está listo para revisar.");
  }

  // ── 5. Cierre. Si no hay NADA pendiente, el correo tiene que decir algo igual
  // (regla 1). Antes acá se cortaba el envío.
  const nothingPending =
    input.preGameDone &&
    input.overdueTaskCount === 0 &&
    !input.warUpPending &&
    input.habits.every((h) => h.done);

  if (nothingPending) {
    lines.push(
      "Todo al día. Aprovechá el envión para meterle a lo importante, no a lo urgente."
    );
  }

  return {
    subject: preGameSubject(input),
    greeting: dcGreeting(input.dcName, input.firstName),
    lines,
  };
}

/** El asunto cambia según lo que importa hoy: es lo único que se ve sin abrir. */
function preGameSubject(input: DigestInput): string {
  if (!input.preGameDone) return "☀️ Tu Pre-game de hoy — TBM";
  if (input.overdueTaskCount > 0) {
    const n = input.overdueTaskCount;
    return `⏰ ${n} ${n === 1 ? "tarea" : "tareas"} sin movimiento — TBM`;
  }
  const pendingHabits = input.habits.filter((h) => !h.done).length;
  if (pendingHabits > 0) return `🎯 Te quedan ${pendingHabits} hábitos hoy — TBM`;
  return `🧭 Todo al día en ${input.companyName} — TBM`;
}
