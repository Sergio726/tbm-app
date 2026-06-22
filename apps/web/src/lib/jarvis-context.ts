// Contexto TBM rico para JARVIS (S18.3). Server-only. Usa la sesión del usuario
// (RLS → solo datos de su empresa). Devuelve un bloque de texto compacto para el system.

import { createClient } from "@/lib/supabase/server";
import { detectPairCrossings, primaryLetter, DISC_DIMENSIONS, type DiscLetter } from "@/lib/disc";
import { TBM_DISC_CANON, type DiscCanonLetter } from "@/lib/tbm-disc-context";
import { SCORECARD_AREAS, type Scorecard } from "@/types/database";

const isCanon = (l: string): l is DiscCanonLetter =>
  l === "D" || l === "I" || l === "S" || l === "C";

export async function buildJarvisContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company_id")
    .eq("id", userId)
    .single();

  if (!profile?.company_id) {
    return `Usuario: ${(profile?.full_name ?? "").trim() || "—"}. Todavía no tiene empresa asociada.`;
  }
  const companyId = profile.company_id;

  const [{ data: company }, { data: team }, { count: tasksDueCount }, { data: scorecardRows }] =
    await Promise.all([
      supabase.from("companies").select("name, sector").eq("id", companyId).maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name, role, cargo, disc_letters, disc_state")
        .eq("company_id", companyId),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", userId)
        .neq("status", "done"),
      supabase
        .from("scorecards")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: true }),
    ]);

  const roster = team ?? [];
  const lines: string[] = [];

  lines.push(
    `Empresa: ${company?.name ?? "—"}${company?.sector ? ` (${company.sector})` : ""}.`,
    `Usuario actual: ${(profile.full_name ?? "").trim() || "—"} · rol ${profile.role ?? "—"}.`
  );

  if (roster.length) {
    lines.push("", "Equipo y su DISC:");
    for (const m of roster) {
      const p = primaryLetter(m.disc_letters);
      const arche =
        p && isCanon(p)
          ? TBM_DISC_CANON[p].arquetipo
          : p
            ? DISC_DIMENSIONS[p as DiscLetter].name
            : "DISC sin cargar";
      const estado = m.disc_state ? ` · ${m.disc_state}` : "";
      lines.push(`- ${m.full_name ?? "—"}${m.cargo ? ` (${m.cargo})` : ""}: ${p ?? "?"} ${arche}${estado}`);
    }

    const crosses = detectPairCrossings(roster);
    if (crosses.length) {
      lines.push("", "Cruces de temperamento en el equipo (requieren acordar cómo comunicarse):");
      for (const c of crosses) lines.push(`- ${c.pairLabel}: ${c.names}`);
    }
  } else {
    lines.push("", "El equipo todavía no tiene perfiles DISC cargados.");
  }

  const latest = (scorecardRows ?? []).at(-1) as Scorecard | undefined;
  if (latest) {
    const criticas = SCORECARD_AREAS.filter((a) => {
      const v = latest[a.key];
      return v !== null && v !== undefined && v <= 2;
    }).map((a) => a.label);
    if (criticas.length) {
      lines.push("", `Áreas críticas del negocio (scorecard ≤ 2): ${criticas.join(", ")}.`);
    }
  }

  if ((tasksDueCount ?? 0) > 0) {
    lines.push("", `El usuario tiene ${tasksDueCount} tarea(s) sin terminar asignadas.`);
  }

  return lines.join("\n");
}
