import { SCORECARD_AREAS, type Profile, type Rock, type LeadingIndicator, type Scorecard } from "@/types/database";
import { LOS_LEVELS, normalizeLetters } from "@/lib/disc";
import type { WeeklyReportPayload } from "@/lib/rituales/weekly-report";
import {
  ExportSection,
  SCORE_EXPORT_COLORS,
  SCORE_EXPORT_LABELS,
} from "./export-shell";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── 1. Diagnóstico Organizacional ──────────────────────────────

export function ExportDiagnostico({
  baseline,
  latest,
}: {
  baseline: Scorecard | null;
  latest: Scorecard | null;
}) {
  if (!latest) {
    return <p className="text-[13px] text-slate-500">Sin diagnósticos registrados todavía.</p>;
  }
  const hasBaseline = baseline && baseline.id !== latest.id;

  return (
    <>
      <ExportSection title={`Evaluación actual · ${fmtDate(latest.created_at)}`}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase tracking-wide text-slate-400" style={{ borderColor: "#e2e8f0" }}>
              <th className="py-2 pr-3 font-semibold">Área</th>
              {hasBaseline && <th className="py-2 pr-3 font-semibold">Día 1</th>}
              <th className="py-2 pr-3 font-semibold">Hoy</th>
              <th className="py-2 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {SCORECARD_AREAS.map((area) => {
              const v1 = (latest[area.key] as number | null) ?? null;
              const v0 = hasBaseline ? ((baseline![area.key] as number | null) ?? null) : null;
              const color = v1 ? SCORE_EXPORT_COLORS[v1 - 1] : "#94a3b8";
              return (
                <tr key={area.key} className="border-b" style={{ borderColor: "#f1f5f9" }}>
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{area.label}</td>
                  {hasBaseline && (
                    <td className="py-2.5 pr-3 text-slate-500">{v0 ?? "—"}/5</td>
                  )}
                  <td className="py-2.5 pr-3 font-bold" style={{ color }}>
                    {v1 ?? "—"}/5
                  </td>
                  <td className="py-2.5" style={{ color }}>
                    {v1 ? SCORE_EXPORT_LABELS[v1 - 1] : "Sin dato"}
                    {v0 !== null && v1 !== null && v1 !== v0 && (
                      <span className="ml-2 text-[11px] text-slate-400">
                        ({v1 > v0 ? "+" : ""}{v1 - v0} vs Día 1)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ExportSection>
      {latest.notes && (
        <ExportSection title="Reflexión del Arquitecto">
          <p className="text-[13px] leading-relaxed text-slate-600">{latest.notes}</p>
        </ExportSection>
      )}
    </>
  );
}

// ── 2. Plan 90D ────────────────────────────────────────────────

export function ExportPlan90d({
  rocks,
  indicators,
  team,
}: {
  rocks: Rock[];
  indicators: LeadingIndicator[];
  team: Pick<Profile, "id" | "full_name">[];
}) {
  const ownerName = (id: string | null) =>
    team.find((t) => t.id === id)?.full_name ?? "Sin dueño";
  const active = rocks.filter((r) => r.status === "active");
  const rest = rocks.filter((r) => r.status !== "active");

  return (
    <>
      <ExportSection title={`Rocas activas (${active.length})`}>
        {active.length === 0 ? (
          <p className="text-[13px] text-slate-500">Sin Rocas activas.</p>
        ) : (
          active.map((r) => (
            <div
              key={r.id}
              className="mb-3 rounded-lg border p-3.5"
              style={{ borderColor: "#e2e8f0", breakInside: "avoid" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-bold text-slate-900">{r.title}</span>
                <span className="text-[13px] font-bold" style={{ color: "#2563EB" }}>
                  {r.progress ?? 0}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: "#f1f5f9" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${r.progress ?? 0}%`, background: "#2563EB" }}
                />
              </div>
              <div className="mt-2 text-[12px] text-slate-500">
                Dueño: <strong className="text-slate-700">{ownerName(r.owner_id)}</strong>
                {" · "}
                {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
              </div>
              {r.success_criteria && (
                <p className="mt-1.5 text-[12.5px] text-slate-600">
                  <strong>Criterio de éxito:</strong> {r.success_criteria}
                </p>
              )}
            </div>
          ))
        )}
      </ExportSection>

      {indicators.length > 0 && (
        <ExportSection title="Leading Indicators de la semana">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-slate-400" style={{ borderColor: "#e2e8f0" }}>
                <th className="py-2 pr-3 font-semibold">Indicador</th>
                <th className="py-2 pr-3 font-semibold">Dueño</th>
                <th className="py-2 pr-3 font-semibold">Meta</th>
                <th className="py-2 font-semibold">Actual</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => (
                <tr key={ind.id} className="border-b" style={{ borderColor: "#f1f5f9" }}>
                  <td className="py-2 pr-3 font-medium text-slate-800">{ind.name}</td>
                  <td className="py-2 pr-3 text-slate-500">{ownerName(ind.owner_id)}</td>
                  <td className="py-2 pr-3 text-slate-500">{ind.weekly_target}</td>
                  <td className="py-2 font-bold text-slate-800">{ind.current_value ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExportSection>
      )}

      {rest.length > 0 && (
        <ExportSection title={`Histórico (${rest.length})`}>
          {rest.map((r) => (
            <div key={r.id} className="mb-1 text-[12.5px] text-slate-500">
              · {r.title} — {r.status} ({r.progress ?? 0}%)
            </div>
          ))}
        </ExportSection>
      )}
    </>
  );
}

// ── 3. Perfil del equipo ───────────────────────────────────────

export function ExportEquipo({ team }: { team: Profile[] }) {
  return (
    <ExportSection title={`Equipo (${team.length})`}>
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-wide text-slate-400" style={{ borderColor: "#e2e8f0" }}>
            <th className="py-2 pr-3 font-semibold">Nombre</th>
            <th className="py-2 pr-3 font-semibold">Rol / Área</th>
            <th className="py-2 pr-3 font-semibold">DISC</th>
            <th className="py-2 pr-3 font-semibold">LOS</th>
            <th className="py-2 font-semibold">KPI (número único)</th>
          </tr>
        </thead>
        <tbody>
          {team.map((m) => {
            const losActual = LOS_LEVELS.find((l) => l.level === (m.los_level ?? 1));
            const losMeta = m.los_target
              ? LOS_LEVELS.find((l) => l.level === m.los_target)
              : null;
            return (
              <tr key={m.id} className="border-b align-top" style={{ borderColor: "#f1f5f9", breakInside: "avoid" }}>
                <td className="py-2.5 pr-3">
                  <div className="font-bold text-slate-900">{m.full_name ?? "Sin nombre"}</div>
                  <div className="text-[11px] text-slate-400">
                    {m.role === "arquitecto" ? "Arquitecto" : "Colaborador"}
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-slate-600">{m.cargo ?? "—"}</td>
                <td className="py-2.5 pr-3">
                  <span className="font-bold text-slate-800">
                    {normalizeLetters(m.disc_letters) || "—"}
                  </span>
                  {m.disc_name && (
                    <div className="text-[11px] text-slate-400">{m.disc_name}</div>
                  )}
                  {m.disc_state === "sombra" && (
                    <div className="text-[11px]" style={{ color: "#d97706" }}>
                      en Sombra
                    </div>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-slate-600">
                  N{m.los_level ?? 1} {losActual?.name}
                  {losMeta && (
                    <div className="text-[11px] text-slate-400">
                      meta: N{m.los_target} {losMeta.name}
                    </div>
                  )}
                </td>
                <td className="py-2.5 text-slate-600">
                  {m.kpi_name ? (
                    <>
                      {m.kpi_name}
                      {m.kpi_weekly_target != null && (
                        <span className="text-slate-400"> · meta {m.kpi_weekly_target}/sem</span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "#d97706" }}>Sin KPI ⚠</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ExportSection>
  );
}

// ── 4. Resumen semanal ─────────────────────────────────────────

export function ExportSemana({
  payload,
  weekStart,
  weekEnd,
}: {
  payload: WeeklyReportPayload;
  weekStart: string;
  weekEnd: string;
}) {
  const rc = payload.ritual_completion;
  return (
    <>
      <ExportSection title={`Semana ${fmtDate(weekStart)} → ${fmtDate(weekEnd)}`}>
        <div className="flex gap-6 text-[13px]">
          <Stat label="Pre-game (Arquitecto)" value={`${rc.pre_game_arquitecto.completed}/${rc.pre_game_arquitecto.days}`} />
          <Stat label="War Ups" value={`${rc.war_up.completed}/${rc.war_up.days}`} />
          <Stat label="Cool Downs" value={`${rc.cool_down.actual_entries}/${rc.cool_down.expected_entries}`} />
        </div>
      </ExportSection>

      <ExportSection title="Victorias de la semana">
        {payload.victories_by_user.length === 0 ? (
          <p className="text-[13px] text-slate-500">Sin victorias registradas.</p>
        ) : (
          payload.victories_by_user.map((v) => (
            <div key={v.user_id} className="mb-3" style={{ breakInside: "avoid" }}>
              <div className="text-[13px] font-bold text-slate-900">
                {v.full_name ?? "Sin nombre"}
              </div>
              <ul className="m-0 list-none p-0">
                {v.days.map((d) => (
                  <li key={d.log_date} className="py-0.5 text-[12.5px] text-slate-600">
                    <span className="mr-2 text-[11px] text-slate-400">{d.log_date.slice(5)}</span>
                    {d.victory_log}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </ExportSection>

      {payload.los_5_grandes.length > 0 && (
        <ExportSection title="Los 5 Grandes vs ejecutados">
          {payload.los_5_grandes.map((day) => (
            <div key={day.for_date} className="mb-2.5" style={{ breakInside: "avoid" }}>
              <div className="text-[12px] font-bold text-slate-700">
                {fmtDate(day.for_date)} ·{" "}
                {day.items.filter((i) => i.executed).length}/{day.items.length} ejecutadas
              </div>
              <ul className="m-0 list-none p-0">
                {day.items.map((it) => (
                  <li key={it.position} className="py-0.5 text-[12.5px]" style={{ color: it.executed ? "#059669" : "#64748b" }}>
                    {it.executed ? "✓" : "○"} {it.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ExportSection>
      )}

      {payload.reality_checks.length > 0 && (
        <ExportSection title="Reality Checks (lo que no se logró)">
          {payload.reality_checks.map((r, i) => (
            <div key={i} className="mb-2 text-[12.5px] text-slate-600">
              <span className="mr-2 text-[11px] text-slate-400">
                {r.full_name ?? "—"} · {r.log_date.slice(5)}
              </span>
              {r.reality_check}
            </div>
          ))}
        </ExportSection>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-[18px] font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
