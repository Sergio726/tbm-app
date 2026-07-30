import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { deliver, effectivePrefs, activeChannels } from "@/lib/notify-channels";
import { buildDailyDigest } from "@/lib/daily-digest";
import { DC_DEFAULTS } from "@/lib/dc-persona";
import {
  localHour,
  resolveTargetHour,
  isDigestDue,
  isHourlyCron,
} from "@/lib/digest-schedule";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * S23b · Avisa a un servicio de monitoreo que la corrida terminó bien
 * (Healthchecks.io, Better Stack, Cronitor: todos aceptan un GET a una URL).
 * El servicio alerta cuando el ping **deja de llegar**.
 *
 * Nunca puede tumbar el cron: si el monitoreo está caído o la URL es inválida, se
 * traga el error. Sin `CRON_HEARTBEAT_URL` configurada, no hace nada — mismo
 * criterio de degradación que el resto del sistema.
 */
async function pingHeartbeat(): Promise<void> {
  const url = process.env.CRON_HEARTBEAT_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "GET",
      // Un monitoreo lento no puede retrasar el cron.
      signal: AbortSignal.timeout(5_000),
    });
  } catch (e) {
    console.error("cron: heartbeat falló (no bloqueante)", e);
  }
}

/** CRON-14: comparación de secreto en tiempo constante. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Cron diario (S9 — emails transaccionales + alerta 72h de S4 E7).
 * Vercel Cron lo invoca una vez al día (ver vercel.json). Protegido por
 * CRON_SECRET (Vercel agrega "Authorization: Bearer <CRON_SECRET>" solo).
 *
 * Por empresa:
 *  - task_overdue: tareas sin movimiento en 72h → notificación in-app
 *    (asignado + creador, dedup 72h) + email al asignado
 *  - Digest matinal al Arquitecto: Pre-game pendiente · War Up sin
 *    iniciar · tareas vencidas · (lunes) check-in de Rocas ·
 *    (domingo) link al Reporte Semanal
 *
 * Sin CRON_SECRET o SUPABASE_SERVICE_ROLE_KEY configurados, responde 503
 * y no hace nada — el deploy no se rompe.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET no configurado" },
      { status: 503 }
    );
  }
  if (!safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY no configurado" },
      { status: 503 }
    );
  }

  const now = new Date();
  const cutoff72h = new Date(now.getTime() - 72 * 3_600_000).toISOString();
  // S23b · ¿el Schedule corre cada hora? Se DECLARA por env porque vive en
  // Dokploy y este proceso no puede verlo. Default false = comportamiento actual,
  // así que desplegar esto sin tocar la infra no cambia a quién le llega el correo.
  const hourlyCron = isHourlyCron(process.env.CRON_HOURLY);
  const stats = { companies: 0, overdueNotifs: 0, emails: 0, cycleReminders: 0, errors: 0 };

  // Expirar invitaciones vencidas (pending → expired). Barrido global, una vez.
  // Mantiene limpio el panel de "Invitaciones pendientes" del Arquitecto.
  await supabase
    .from("invitations")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now.toISOString());

  // CRON-1: sin límite (procesa TODAS las empresas). El .limit(100) previo dejaba
  // la empresa 101+ sin procesar en silencio. A gran escala este loop secuencial
  // excede los 60s y hay que pasar al patrón dispatcher+worker (T6 en auditoria.md);
  // en beta el volumen entra holgado.
  const { data: companies, error: companiesErr } = await supabase
    .from("companies")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (companiesErr) {
    return NextResponse.json(
      { ok: false, error: "companies_query", detail: companiesErr.message },
      { status: 500 }
    );
  }

  for (const company of companies ?? []) {
    stats.companies++;
    // CRON-4: aislar el fallo de una empresa para que no tumbe a las demás.
    try {

    const [{ data: profiles }, { data: config }, { data: prefsRows }] = await Promise.all([
      supabase
        // S23 · E3: `timezone` viaja para resolver el "hoy" POR PERSONA. Antes se
        // usaba solo la zona de la empresa, así que a un miembro en otro huso el
        // día podía estar corrido → el Pre-game se marcaba pendiente cuando ya
        // estaba hecho (o al revés). Es un bug, no una preparación.
        .from("profiles")
        .select("id, full_name, email, role, timezone")
        .eq("company_id", company.id),
      supabase
        // S23b: `pre_game_reminder` existe desde el sprint 2 con default '07:00' y
        // el cron la ignoraba. Ahora es el fallback de la hora del despertador.
        .from("ritual_configs")
        .select("timezone, pre_game_reminder")
        .eq("company_id", company.id)
        .maybeSingle(),
      // S23 · E1: preferencias. "Sin fila" = todo activado (ver PREFS_DEFAULTS).
      // Resiliente por diseño: si la migración todavía no se aplicó, el select
      // devuelve `data: null` (supabase-js no lanza) → mapa vacío → defaults →
      // todos reciben. Verificado: el cron no se cae por falta de la tabla.
      supabase
        .from("notification_prefs")
        .select("user_id, daily_digest, task_alerts, weekly_report, channel_email, preferred_hour")
        .eq("company_id", company.id),
    ]);

    const companyTz = config?.timezone ?? "America/Bogota";
    // "Hoy" de la EMPRESA — se sigue usando para lo que es del equipo (War Up).
    const todayLocal = localISODate(now, companyTz);
    const weekdayLocal = localWeekday(now, companyTz); // 0=domingo … 6=sábado
    const arquitectos = (profiles ?? []).filter((p) => p.role === "arquitecto");
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
    const prefsByUser = new Map((prefsRows ?? []).map((p) => [p.user_id, p]));

    /** Zona de la persona, con fallback a la de la empresa. */
    const tzOf = (p: { timezone?: string | null }) => p.timezone?.trim() || companyTz;

    // ── A. Tareas sin movimiento en 72h ─────────────────────────
    const { data: overdueTasks } = await supabase
      .from("tasks")
      .select("id, what_dod, assigned_to, created_by")
      .eq("company_id", company.id)
      .in("status", ["pending", "in_progress"])
      .lt("updated_at", cutoff72h);

    for (const task of overdueTasks ?? []) {
      const href = `/delegacion?overdue=${task.id}`;

      // Dedup: si ya se notificó esta tarea en las últimas 72h, saltar
      const { count: already } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("type", "task_overdue")
        .eq("href", href)
        .gte("created_at", cutoff72h);
      if ((already ?? 0) > 0) continue;

      const recipients = Array.from(
        new Set([task.assigned_to, task.created_by].filter((v): v is string => !!v))
      );
      if (recipients.length > 0) {
        await supabase.from("notifications").insert(
          recipients.map((userId) => ({
            company_id: company.id,
            user_id: userId,
            type: "task_overdue",
            title: "Tarea sin movimiento hace 72h",
            body: `"${task.what_dod.slice(0, 60)}" no se actualiza desde hace 3 días.`,
            href,
          }))
        );
        stats.overdueNotifs += recipients.length;
      }

      // Email al colaborador asignado — respeta `task_alerts` (S23 · E1).
      // La notificación in-app de arriba se manda igual: es pasiva, no interrumpe.
      const assignee = (profiles ?? []).find((p) => p.id === task.assigned_to);
      const assigneePrefs = effectivePrefs(prefsByUser.get(task.assigned_to ?? ""));
      if (assignee?.email && assigneePrefs.taskAlerts && assigneePrefs.channelEmail) {
        const r = await deliver({
          channel: "email",
          to: assignee.email,
          subject: "⏰ Tarea sin movimiento hace 72h — TBM",
          html: simpleEmail({
            title: "Tarea sin movimiento",
            lines: [
              `Hola ${assignee.full_name ?? ""},`,
              `La tarea <strong>"${escapeHtml(task.what_dod.slice(0, 80))}"</strong> no registra avances desde hace 3 días.`,
              `Actualizá su estado o escalá con tus 3 opciones (Escudo Anti-Boomerang).`,
            ],
            cta: { label: "Ver mis tareas", path: "/delegacion/mis-tareas" },
          }),
        });
        if (r.ok) stats.emails++;
      }
    }

    // ── B. Despertador diario a TODO el equipo (S23 · §A1) ──────
    //
    // Dilio: "sería bueno que el sistema te despierte con un correo… buenos días,
    // aquí DC, tu executive coach, recuerda hacer tu pre-game… y que le sugiera a
    // la persona lo que él dijo que hace diariamente".
    //
    // Cambios respecto del digest viejo:
    //  1. Iba solo al Arquitecto → va a TODOS los miembros con email.
    //  2. Era condicional (`if (lines.length === 0) continue`) → ahora sale
    //     siempre; en un día tranquilo el copy es de refuerzo. Un despertador que
    //     a veces no suena no es un despertador.
    //  3. Copy genérico → voz de DC (nombre configurable desde el admin).
    //  4. No usaba los hábitos declarados → ahora los lista (user_habits).
    const [
      { data: preGamesHoy },
      { data: warUpHoy },
      { data: rocks },
      { data: weeklyReport },
      { data: habits },
      { data: habitLogsHoy },
    ] = await Promise.all([
        supabase
          .from("pre_games")
          .select("user_id, log_date")
          .eq("company_id", company.id)
          // Se traen 3 días y se filtra por persona más abajo: cada miembro puede
          // estar en otro huso, así que "hoy" no es el mismo para todos.
          .gte("log_date", localISODate(new Date(now.getTime() - 36 * 3_600_000), companyTz)),
        supabase
          .from("war_ups")
          .select("id, status")
          .eq("company_id", company.id)
          .eq("war_up_date", todayLocal)
          .maybeSingle(),
        supabase
          .from("rocks")
          .select("title, progress")
          .eq("company_id", company.id)
          .eq("status", "active"),
        supabase
          .from("weekly_reports")
          .select("id, week_start")
          .eq("company_id", company.id)
          .order("week_start", { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Hábitos que cada persona ELIGIÓ (A3.1 de jun-2026). Es la pieza que
        // Dilio pidió explícitamente y que el digest viejo ignoraba.
        supabase
          .from("user_habits")
          .select("id, user_id, label, emoji, sort_order")
          .eq("company_id", company.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("habit_id, user_id, log_date")
          .gte("log_date", localISODate(new Date(now.getTime() - 36 * 3_600_000), companyTz)),
      ]);

    const dcName = await getDcName();

    for (const person of profiles ?? []) {
      if (!person.email) continue;

      // E1: respeta las preferencias. Sin fila = todo activado.
      const prefs = effectivePrefs(prefsByUser.get(person.id));
      if (!prefs.dailyDigest) continue;
      if (!activeChannels(prefs).includes("email")) continue;

      // E3: el "hoy" de ESTA persona, en SU huso.
      const personTz = tzOf(person);
      const personToday = localISODate(now, personTz);
      const personWeekday = localWeekday(now, personTz);

      // S23b · ¿le toca en ESTA corrida? Con cron diario manda siempre (igual que
      // antes); con cron horario, solo a partir de su hora local. La idempotencia
      // de abajo evita que las corridas siguientes dupliquen.
      const targetHour = resolveTargetHour(prefs.preferredHour, config?.pre_game_reminder);
      if (!isDigestDue({ currentHour: localHour(now, personTz), targetHour, hourlyCron })) {
        continue;
      }

      // E3 · idempotencia: si ya se le mandó el despertador hoy, no repetir.
      // Cubre reintentos del cron y deploys que lo redisparen.
      const { count: alreadySent } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", person.id)
        .eq("type", "daily_digest")
        .eq("href", `/dashboard?digest=${personToday}`);
      if ((alreadySent ?? 0) > 0) continue;

      const isArquitecto = person.role === "arquitecto";
      const myHabits = (habits ?? []).filter((h) => h.user_id === person.id);
      const doneHabitIds = new Set(
        (habitLogsHoy ?? [])
          .filter((l) => l.user_id === person.id && l.log_date === personToday)
          .map((l) => l.habit_id)
      );

      const content = buildDailyDigest({
        dcName,
        firstName: person.full_name?.split(" ")[0] ?? "",
        companyName: company.name,
        weekday: personWeekday,
        preGameDone: (preGamesHoy ?? []).some(
          (p) => p.user_id === person.id && p.log_date === personToday
        ),
        habits: myHabits.map((h) => ({
          label: h.label,
          emoji: h.emoji,
          done: doneHabitIds.has(h.id),
        })),
        // Solo las tareas de esta persona, no el total de la empresa (el digest
        // viejo mandaba el conteo global al Arquitecto).
        overdueTaskCount: (overdueTasks ?? []).filter((t) => t.assigned_to === person.id).length,
        // El War Up es del equipo: solo le corresponde al Arquitecto.
        warUpPending: isArquitecto ? !warUpHoy : null,
        rocks: isArquitecto
          ? (rocks ?? []).map((r) => ({ title: r.title, progress: r.progress ?? 0 }))
          : [],
        weeklyReportReady: prefs.weeklyReport && !!weeklyReport,
      });

      const r = await deliver({
        channel: "email",
        to: person.email,
        subject: content.subject,
        html: simpleEmail({
          title: content.greeting,
          lines: content.lines,
          cta: { label: "Abrir mi Dashboard", path: "/dashboard" },
          // S19 (absorbido): link para gestionar qué se recibe.
          footerNote: "Podés elegir qué avisos recibir desde Mi cuenta.",
        }),
      });
      if (r.ok) {
        stats.emails++;
        // Marca de idempotencia (no es una notificación para la campana: el href
        // lleva la fecha justamente para que el count de arriba la encuentre).
        await supabase.from("notifications").insert({
          company_id: company.id,
          user_id: person.id,
          type: "daily_digest",
          title: content.subject,
          href: `/dashboard?digest=${personToday}`,
          read_at: new Date().toISOString(),
        });
      }

      void nameById;
    }

    // ── C. "Armá el próximo ciclo" — 30 días antes del fin del ciclo 90D ──
    // El ciclo es a nivel empresa, anclado al created_at del scorecard baseline
    // (misma fórmula que el Hero Strip del dashboard). Avisa una vez por ciclo
    // cuando quedan ≤30 días. Solo al/los Arquitecto(s).
    if (arquitectos.length > 0) {
      const { data: scs } = await supabase
        .from("scorecards")
        .select("created_at, is_baseline")
        .eq("company_id", company.id)
        .order("created_at", { ascending: true });
      const baseline =
        (scs ?? []).find((s) => s.is_baseline) ?? (scs ?? [])[0] ?? null;

      if (baseline?.created_at) {
        const baselineDate = baseline.created_at.split("T")[0]; // YYYY-MM-DD
        const daysSinceStart = Math.floor(
          (Date.parse(`${todayLocal}T00:00:00Z`) -
            Date.parse(`${baselineDate}T00:00:00Z`)) /
            86_400_000
        );

        if (daysSinceStart >= 0) {
          const dayInProgram = daysSinceStart + 1;
          const dayInCycle = ((dayInProgram - 1) % 90) + 1;
          const daysRemaining = 90 - dayInCycle;

          if (daysRemaining <= 30) {
            // Dedup: una sola vez por ciclo (ventana de 60 días — el próximo
            // día-60 cae 90 días después, así que no sangra al ciclo siguiente).
            const sixtyDaysAgo = new Date(
              now.getTime() - 60 * 86_400_000
            ).toISOString();
            const { count: alreadyCycle } = await supabase
              .from("notifications")
              .select("id", { count: "exact", head: true })
              .eq("company_id", company.id)
              .eq("type", "cycle_reminder")
              .gte("created_at", sixtyDaysAgo);

            if ((alreadyCycle ?? 0) === 0) {
              const title = "Tu ciclo de 90 días termina pronto";
              const body = `Quedan ${daysRemaining} días (Día ${dayInCycle}/90). Empezá a armar las Rocas del próximo ciclo.`;

              await supabase.from("notifications").insert(
                arquitectos.map((arq) => ({
                  company_id: company.id,
                  user_id: arq.id,
                  type: "cycle_reminder",
                  title,
                  body,
                  href: "/plan-90d",
                }))
              );
              stats.cycleReminders += arquitectos.length;

              for (const arq of arquitectos) {
                if (!arq.email) continue;
                const r = await sendEmail({
                  to: arq.email,
                  subject: `🗓️ Armá tu próximo ciclo de 90 días — ${company.name}`,
                  html: simpleEmail({
                    title: `Faltan ${daysRemaining} días para cerrar tu ciclo`,
                    lines: [
                      `Hola ${arq.full_name?.split(" ")[0] ?? "Arquitecto"},`,
                      `Estás en el <strong>Día ${dayInCycle} de 90</strong> de tu ciclo actual.`,
                      `Es momento de empezar a <strong>armar las Rocas del próximo ciclo</strong> para no perder ritmo cuando este termine.`,
                    ],
                    cta: { label: "Planear el próximo ciclo", path: "/plan-90d" },
                  }),
                });
                if (r.ok) stats.emails++;
              }
            }
          }
        }
      }
    }
    } catch (e) {
      stats.errors++;
      console.error(`[cron] empresa ${company.id} falló:`, e);
    }
  }

  // CRON-4: si hubo errores, devolver ok:false para que el monitor de cron lo marque.
  // S23b · dead man's switch. Si el cron deja de correr (contenedor caído, Schedule
  // borrado), hoy no se entera nadie hasta que alguien nota que no llegan los
  // correos. Con esto, el servicio de monitoreo avisa por la AUSENCIA del ping.
  // Solo se pinguea si la corrida terminó sin errores: un fallo tiene que verse
  // como fallo, no como "todo bien".
  if (stats.errors === 0) await pingHeartbeat();

  return NextResponse.json({ ok: stats.errors === 0, ...stats });
}

// ── helpers ──────────────────────────────────────────────────────

function localISODate(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d); // en-CA → YYYY-MM-DD
  } catch {
    return d.toISOString().split("T")[0];
  }
}

function localWeekday(d: Date, timeZone: string): number {
  try {
    const name = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(d);
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
  } catch {
    return d.getDay();
  }
}

/**
 * Nombre del asistente para el saludo. El admin puede renombrarlo (DC-2), así que
 * se lee de `ai_config`; si no está configurado o falla, cae al default "DC".
 * Se resuelve UNA vez por corrida del cron, no por persona.
 */
async function getDcName(): Promise<string> {
  try {
    const admin = createAdminClient();
    if (!admin) return DC_DEFAULTS.name;
    const { data } = await admin.from("ai_config").select("persona_name").maybeSingle();
    return data?.persona_name?.trim() || DC_DEFAULTS.name;
  } catch {
    return DC_DEFAULTS.name;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simpleEmail(opts: {
  title: string;
  lines: string[];
  cta?: { label: string; path: string };
  /** Nota al pie + link a preferencias (S19 absorbido por S23). */
  footerNote?: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tbm-app.vercel.app";
  const footerHtml = opts.footerNote
    ? `<p style="font-size:11.5px;line-height:1.5;color:#94a3b8;margin:20px 0 0;border-top:1px solid #e6e9f0;padding-top:14px;">
         ${opts.footerNote}
         <a href="${appUrl}/cuenta" style="color:#2563EB;">Gestionar avisos</a>.
       </p>`
    : "";
  const ctaHtml = opts.cta
    ? `<a href="${appUrl}${opts.cta.path}"
         style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;
                text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:10px;margin-top:6px;">
         ${opts.cta.label} →
       </a>`
    : "";
  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f4f6fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e6e9f0;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${opts.title}</h1>
      ${opts.lines
        .map(
          (l) =>
            `<p style="font-size:14.5px;line-height:1.6;margin:0 0 12px;color:#334155;">${l}</p>`
        )
        .join("")}
      ${ctaHtml}
      ${footerHtml}
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
      The Business Multiplier · método de Dilio Donado
    </p>
  </div>
</body>
</html>`;
}
