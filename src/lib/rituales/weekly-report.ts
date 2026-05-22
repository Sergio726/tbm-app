import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { isoDate, isoMonday, isoFriday } from "@/lib/dates";

/**
 * Estructura del payload de un Reporte Semanal.
 * Se genera automáticamente cuando algún colaborador completa
 * su Cool Down de un viernes.
 */
export type WeeklyReportPayload = {
  victories_by_user: {
    user_id: string;
    full_name: string | null;
    days: { log_date: string; victory_log: string }[];
  }[];
  ritual_completion: {
    war_up: { days: 5; completed: number };
    cool_down: { expected_entries: number; actual_entries: number };
    pre_game_arquitecto: { days: 5; completed: number };
  };
  los_5_grandes: {
    for_date: string;
    items: {
      position: number;
      title: string;
      rock_label: string | null;
      executed: boolean;
    }[];
  }[];
  reality_checks: {
    user_id: string;
    full_name: string | null;
    log_date: string;
    reality_check: string;
  }[];
};

export type WeeklyReportResult = {
  payload: WeeklyReportPayload;
  weekStart: string;
  weekEnd: string;
};

/**
 * Calcula el payload del Reporte Semanal para una empresa y semana ISO.
 * No persiste — devuelve el payload listo para `upsertWeeklyReport`.
 */
export async function buildWeeklyReportPayload(
  supabase: SupabaseClient<Database>,
  companyId: string,
  referenceDate: Date = new Date()
): Promise<WeeklyReportResult> {
  const weekStart = isoDate(isoMonday(referenceDate));
  const weekEnd = isoDate(isoFriday(referenceDate));

  // Profiles de la empresa (para resolver nombres)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("company_id", companyId);
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? null])
  );
  const teamSize = (profiles ?? []).length;
  const arquitectoIds = (profiles ?? [])
    .filter((p) => p.role === "arquitecto")
    .map((p) => p.id);

  // Cool downs de la semana
  const { data: coolDowns } = await supabase
    .from("cool_downs")
    .select("user_id, log_date, victory_log, reality_check")
    .eq("company_id", companyId)
    .gte("log_date", weekStart)
    .lte("log_date", weekEnd)
    .order("log_date", { ascending: true });

  // Victorias agrupadas por usuario
  const victoriesMap = new Map<string, { log_date: string; victory_log: string }[]>();
  for (const cd of coolDowns ?? []) {
    if (!cd.victory_log) continue;
    const arr = victoriesMap.get(cd.user_id) ?? [];
    arr.push({ log_date: cd.log_date, victory_log: cd.victory_log });
    victoriesMap.set(cd.user_id, arr);
  }
  const victories_by_user = Array.from(victoriesMap.entries()).map(
    ([user_id, days]) => ({
      user_id,
      full_name: nameById.get(user_id) ?? null,
      days,
    })
  );

  // Reality checks (no vacíos)
  const reality_checks = (coolDowns ?? [])
    .filter((cd) => cd.reality_check && cd.reality_check.trim().length > 0)
    .map((cd) => ({
      user_id: cd.user_id,
      full_name: nameById.get(cd.user_id) ?? null,
      log_date: cd.log_date,
      reality_check: cd.reality_check as string,
    }));

  // War ups de la semana (lunes a viernes)
  const { data: warUps } = await supabase
    .from("war_ups")
    .select("id, war_up_date, status")
    .eq("company_id", companyId)
    .gte("war_up_date", weekStart)
    .lte("war_up_date", weekEnd);
  const warUpDays = (warUps ?? []).filter((w) => w.status === "closed").length;

  // Cool downs esperados: 5 días * teamSize
  const expectedCoolDowns = 5 * Math.max(1, teamSize);

  // Pre-games del Arquitecto (uso el primero como referencia si hay varios)
  let preGameCompleted = 0;
  if (arquitectoIds.length > 0) {
    const { data: pgs } = await supabase
      .from("pre_games")
      .select("log_date")
      .in("user_id", arquitectoIds)
      .gte("log_date", weekStart)
      .lte("log_date", weekEnd);
    preGameCompleted = (pgs ?? []).length;
  }

  // Los 5 Grandes de la semana
  const { data: l5g } = await supabase
    .from("los_5_grandes")
    .select("id, for_date")
    .eq("company_id", companyId)
    .gte("for_date", weekStart)
    .lte("for_date", weekEnd)
    .order("for_date", { ascending: true });

  const los_5_grandes: WeeklyReportPayload["los_5_grandes"] = [];
  for (const parent of l5g ?? []) {
    const { data: items } = await supabase
      .from("los_5_grandes_items")
      .select("position, title, rock_label, executed")
      .eq("los_5_grandes_id", parent.id)
      .order("position", { ascending: true });
    los_5_grandes.push({
      for_date: parent.for_date,
      items: (items ?? []).map((it) => ({
        position: it.position,
        title: it.title,
        rock_label: it.rock_label,
        executed: it.executed ?? false,
      })),
    });
  }

  const payload: WeeklyReportPayload = {
    victories_by_user,
    ritual_completion: {
      war_up: { days: 5, completed: warUpDays },
      cool_down: {
        expected_entries: expectedCoolDowns,
        actual_entries: (coolDowns ?? []).length,
      },
      pre_game_arquitecto: { days: 5, completed: preGameCompleted },
    },
    los_5_grandes,
    reality_checks,
  };

  return { payload, weekStart, weekEnd };
}

/**
 * Upserts the weekly_reports row. Idempotente por (company_id, week_start).
 */
export async function upsertWeeklyReport(
  supabase: SupabaseClient<Database>,
  companyId: string,
  userId: string,
  result: WeeklyReportResult
): Promise<{ error: string | null }> {
  // Hay que checar primero si existe; supabase no soporta onConflict + select() bien en todos los casos
  const { data: existing } = await supabase
    .from("weekly_reports")
    .select("id")
    .eq("company_id", companyId)
    .eq("week_start", result.weekStart)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("weekly_reports")
      .update({
        week_end: result.weekEnd,
        generated_at: new Date().toISOString(),
        generated_by: userId,
        payload: result.payload as unknown as Database["public"]["Tables"]["weekly_reports"]["Row"]["payload"],
      })
      .eq("id", existing.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("weekly_reports").insert({
    company_id: companyId,
    week_start: result.weekStart,
    week_end: result.weekEnd,
    generated_at: new Date().toISOString(),
    generated_by: userId,
    payload: result.payload as unknown as Database["public"]["Tables"]["weekly_reports"]["Row"]["payload"],
  });
  return { error: error?.message ?? null };
}

/**
 * Si la fecha es viernes, regenera (upsert) el reporte semanal de esa semana.
 * Se llama desde el Cool Down después de un save exitoso.
 */
export async function maybeGenerateWeeklyReport(
  supabase: SupabaseClient<Database>,
  companyId: string,
  userId: string,
  coolDownDate: string
): Promise<{ generated: boolean; error: string | null }> {
  const d = new Date(coolDownDate + "T12:00:00");
  const isFriday = d.getDay() === 5;
  if (!isFriday) return { generated: false, error: null };

  const result = await buildWeeklyReportPayload(supabase, companyId, d);
  const { error } = await upsertWeeklyReport(supabase, companyId, userId, result);
  return { generated: !error, error };
}
