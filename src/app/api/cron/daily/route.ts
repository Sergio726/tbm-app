import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
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
  const stats = { companies: 0, overdueNotifs: 0, emails: 0 };

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .limit(100);

  for (const company of companies ?? []) {
    stats.companies++;

    const [{ data: profiles }, { data: config }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("company_id", company.id),
      supabase
        .from("ritual_configs")
        .select("timezone")
        .eq("company_id", company.id)
        .maybeSingle(),
    ]);

    const tz = config?.timezone ?? "America/Bogota";
    const todayLocal = localISODate(now, tz);
    const weekdayLocal = localWeekday(now, tz); // 0=domingo … 6=sábado
    const arquitectos = (profiles ?? []).filter((p) => p.role === "arquitecto");
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

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

      // Email al colaborador asignado
      const assignee = (profiles ?? []).find((p) => p.id === task.assigned_to);
      if (assignee?.email) {
        const r = await sendEmail({
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

    // ── B. Digest matinal al Arquitecto ─────────────────────────
    const [{ data: preGamesHoy }, { data: warUpHoy }, { data: rocks }, { data: weeklyReport }] =
      await Promise.all([
        supabase
          .from("pre_games")
          .select("user_id")
          .eq("company_id", company.id)
          .eq("log_date", todayLocal),
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
      ]);

    for (const arq of arquitectos) {
      if (!arq.email) continue;

      const preGameDone = (preGamesHoy ?? []).some((p) => p.user_id === arq.id);
      const warUpStarted = !!warUpHoy;
      const overdueCount = (overdueTasks ?? []).length;
      const lines: string[] = [];

      if (!preGameDone) lines.push("☀️ Tu <strong>Pre-game de hoy</strong> está pendiente.");
      if (!warUpStarted) lines.push("⚡ El <strong>War Up</strong> de hoy todavía no se inició.");
      if (overdueCount > 0)
        lines.push(
          `⏰ Hay <strong>${overdueCount} ${overdueCount === 1 ? "tarea" : "tareas"} sin movimiento</strong> hace más de 72h.`
        );
      if (weekdayLocal === 1 && (rocks ?? []).length > 0) {
        lines.push(
          `🏔️ Lunes de check-in: ${(rocks ?? [])
            .map((r) => `${escapeHtml(r.title)} (${r.progress ?? 0}%)`)
            .join(" · ")}.`
        );
      }
      if (weekdayLocal === 0 && weeklyReport) {
        lines.push("📊 El <strong>Reporte Semanal</strong> de tu equipo está listo.");
      }

      if (lines.length === 0) continue; // todo en orden — sin spam

      const r = await sendEmail({
        to: arq.email,
        subject: `🧭 TBM hoy — ${company.name}`,
        html: simpleEmail({
          title: `Buen día, ${arq.full_name?.split(" ")[0] ?? "Arquitecto"}`,
          lines,
          cta: { label: "Abrir mi Dashboard", path: "/dashboard" },
        }),
      });
      if (r.ok) stats.emails++;

      // Dedup futura: nada que guardar — el digest se arma on the fly,
      // y el cron corre una sola vez al día.
      void nameById;
    }
  }

  return NextResponse.json({ ok: true, ...stats });
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
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tbm-app.vercel.app";
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
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">
      The Business Multiplier · método de Dilio Donado
    </p>
  </div>
</body>
</html>`;
}
