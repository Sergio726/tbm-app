/**
 * ¿A esta persona le toca el despertador **en esta corrida**? (S23b)
 *
 * S23 guardó `notification_prefs.preferred_hour` pero no podía respetarlo: el cron
 * corre 1×/día. Esto cierra el círculo — y lo hace **compatible con las dos
 * frecuencias**, que es el punto delicado.
 *
 * **Por qué la compatibilidad importa:** el Schedule vive en Dokploy y lo cambia
 * una persona, no este repo. Si el filtro exigiera `horaActual === horaPreferida`,
 * al mergear con el cron todavía en `0 11 * * *` **nadie recibiría el correo**
 * (salvo quien casualmente eligiera esa hora). Sería una regresión silenciosa en
 * producción.
 *
 * **La regla, entonces:** *"si ya pasó tu hora y todavía no recibiste el de hoy,
 * va"*. Con cron horario eso da "a su hora" (la primera corrida que cruza el
 * umbral gana). Con cron diario da "en la corrida del día", que es exactamente el
 * comportamiento actual.
 *
 * La **idempotencia de S23** (marca en `notifications` por persona/día) es la que
 * evita el duplicado: corra el cron 1 o 24 veces, sale uno solo.
 *
 * Módulo puro: sin Supabase, sin red, sin `Date.now()` implícito.
 */

/** Hora local (0-23) en una zona. Mismo patrón que `localISODate` del cron. */
export function localHour(d: Date, timeZone: string): number {
  try {
    const h = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(d);
    const n = parseInt(h, 10);
    // en-GB puede devolver "24" a medianoche en algunos runtimes.
    return Number.isFinite(n) ? n % 24 : d.getUTCHours();
  } catch {
    // Zona inválida → no romper el cron por un dato mal cargado.
    return d.getUTCHours();
  }
}

/**
 * `'07:00'` / `'07:00:00'` → `7`. Devuelve `null` si no se puede interpretar.
 * El formato viene de `ritual_configs.pre_game_reminder`, que es un `time` de PG.
 */
export function parseHourColumn(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = /^(\d{1,2})/.exec(v.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : null;
}

/**
 * Hora objetivo de una persona, en cascada:
 *   1. lo que ELIGIÓ (`notification_prefs.preferred_hour`)
 *   2. la hora de su EMPRESA (`ritual_configs.pre_game_reminder`, default '07:00')
 *      — columna que existía desde el sprint 2 y que el cron ignoraba.
 *   3. `null` → sin preferencia: se manda en cualquier corrida.
 */
export function resolveTargetHour(
  personalHour: number | null | undefined,
  companyReminder: string | null | undefined
): number | null {
  if (typeof personalHour === "number" && personalHour >= 0 && personalHour <= 23) {
    return personalHour;
  }
  return parseHourColumn(companyReminder);
}

export type DueInput = {
  /** Hora local actual de la persona (0-23). */
  currentHour: number;
  /** Hora objetivo, o `null` si no tiene ninguna. */
  targetHour: number | null;
  /** ¿El cron corre varias veces al día? Ver `isHourlyCron`. */
  hourlyCron: boolean;
};

/**
 * ¿Corresponde mandar ahora?
 *
 * - **Sin hora objetivo** → sí (comportamiento histórico: se manda cuando corra).
 * - **Cron diario** → sí. Es la única corrida del día: filtrar por hora dejaría a
 *   casi todos sin correo. La hora elegida se respeta recién con cron horario.
 * - **Cron horario** → sí solo si `currentHour >= targetHour`. La primera corrida
 *   que cruza el umbral manda; la idempotencia frena las 20 siguientes.
 *
 * El `>=` (en vez de `===`) es a propósito: si una corrida falla o el contenedor
 * se reinicia justo en esa hora, la siguiente lo recupera en vez de saltear el día.
 */
export function isDigestDue({ currentHour, targetHour, hourlyCron }: DueInput): boolean {
  if (targetHour == null) return true;
  if (!hourlyCron) return true;
  return currentHour >= targetHour;
}

/**
 * ¿El cron corre varias veces al día?
 *
 * Se declara por env (`CRON_HOURLY=true`) en lugar de adivinarse, porque el
 * Schedule vive en Dokploy y este proceso no puede verlo. Default `false` = el
 * comportamiento actual, así que mergear esto sin tocar la infra no cambia nada.
 */
export function isHourlyCron(env: string | undefined): boolean {
  return ["1", "true", "yes"].includes((env ?? "").toLowerCase());
}
