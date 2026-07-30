"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Network, Plus, Trash2, Target, Check, ChevronDown } from "lucide-react";
import type { Profile, Rock, RockContribution, ContributionActivity } from "@/types/database";
import { isoDate } from "@/lib/dates";
import { quarterLabel } from "@/lib/quarters";
import {
  checkSplit,
  splitMessage,
  derivePace,
  computeProgress,
  fmt,
  PACE_LABEL,
  PACE_COLOR,
} from "@/lib/kpi-cascade";
import {
  setRockTarget,
  upsertContribution,
  removeContribution,
  upsertActivity,
  removeActivity,
} from "@/app/(dashboard)/plan-90d/cascade-actions";

/**
 * Cascada de KPIs de una Roca (S25 · §E1/§E2/§E5).
 *
 * El ejemplo de Dilio, que es lo que esta pantalla tiene que poder cargar:
 *   15 clientes en Q1 ($75.000) → Sebastián 9 · Dilio 6 → llamadas y propuestas.
 *
 * Tres decisiones de diseño que vienen del método, no del gusto:
 *
 * 1. **Las metas son del TRIMESTRE.** El "5 por mes" que dice Dilio se muestra
 *    como ritmo derivado, no se pide como dato. Guardar la cuota mensual invitaría
 *    a evaluar mes por mes.
 * 2. **No hay semáforo mensual.** Se muestra acumulado + el ritmo que hace falta
 *    de acá en adelante: *"puede que el primer mes no llegue… pero debe saber qué
 *    está haciendo o no está haciendo para lograr el objetivo"*.
 * 3. **Autogestión:** el colaborador edita su propio aporte y sus actividades.
 *    Quitar un responsable es del Arquitecto (si no, la cascada se vacía sola).
 */
export function CascadePanel({
  rock,
  team,
  currentUserId,
  isArquitecto,
  contributions,
  activities,
}: {
  rock: Rock;
  team: Pick<Profile, "id" | "full_name">[];
  currentUserId: string;
  isArquitecto: boolean;
  contributions: RockContribution[];
  activities: ContributionActivity[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const mine = contributions.filter((c) => c.rock_id === rock.id);
  const split = checkSplit(rock.target_value, mine.map((c) => ({
    ownerId: c.owner_id,
    targetValue: Number(c.target_value),
  })));
  const warning = splitMessage(split, rock.target_unit);
  const trimestre = quarterLabel(rock.start_date);

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError("");
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="mt-3 rounded-[13px] border border-white/[0.07] bg-white/[0.015]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <Network size={14} style={{ color: "#a78bfa" }} />
        <span className="text-[12.5px] font-semibold text-fg">Cascada de indicadores</span>
        {mine.length > 0 && (
          <span className="text-[11px] text-fg-muted">
            {mine.length} {mine.length === 1 ? "responsable" : "responsables"}
          </span>
        )}
        {/* El aviso de reparto incompleto se ve SIN abrir: es el "obligar" de Dilio. */}
        {warning && (
          <span
            className="ml-auto truncate text-[11px] font-medium"
            style={{ color: "var(--warn-text)" }}
          >
            {warning}
          </span>
        )}
        <ChevronDown
          size={14}
          className="ml-auto flex-shrink-0 transition-transform"
          style={{
            color: "var(--fg-muted)",
            transform: open ? "rotate(180deg)" : "none",
            marginLeft: warning ? 6 : "auto",
          }}
        />
      </button>

      {open && (
        <div className="border-t border-white/[0.06] p-3.5">
          <TargetRow
            rock={rock}
            trimestre={trimestre}
            editable={isArquitecto}
            isPending={isPending}
            onSave={(v) => run(() => setRockTarget({ rockId: rock.id, ...v }))}
          />

          {rock.target_value != null && rock.target_value > 0 && (
            <>
              <div className="mt-3.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[1.1px] text-fg-muted">
                  Reparto por responsable
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color:
                      split.status === "exact" ? "var(--success-text)" : "var(--warn-text)",
                  }}
                >
                  {fmt(split.assigned)} / {fmt(split.target)}
                  {split.status === "exact" && " ✓"}
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {mine.map((c) => (
                  <ContributionRow
                    key={c.id}
                    contribution={c}
                    rock={rock}
                    activities={activities.filter((a) => a.contribution_id === c.id)}
                    memberName={team.find((m) => m.id === c.owner_id)?.full_name ?? "—"}
                    canEdit={isArquitecto || c.owner_id === currentUserId}
                    canRemove={isArquitecto}
                    isPending={isPending}
                    onRemove={() => run(() => removeContribution({ id: c.id }))}
                    onSaveActivity={(a) =>
                      run(() =>
                        upsertActivity({
                          ...a,
                          contributionId: c.id,
                          ownerId: c.owner_id,
                        })
                      )
                    }
                    onRemoveActivity={(id) => run(() => removeActivity({ id }))}
                  />
                ))}
              </div>

              <AddContribution
                team={team.filter((m) => !mine.some((c) => c.owner_id === m.id))}
                suggested={split.status === "under" ? split.gap : 0}
                unit={rock.target_unit}
                isPending={isPending}
                onAdd={(ownerId, targetValue) =>
                  run(() =>
                    upsertContribution({
                      rockId: rock.id,
                      ownerId,
                      targetValue,
                      targetMoney: null,
                      notes: "",
                    })
                  )
                }
              />
            </>
          )}

          {error && (
            <p className="mt-2.5 text-[11.5px]" style={{ color: "var(--danger-text)" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── La meta de la Roca ──────────────────────────────────────────────────────

function TargetRow({
  rock,
  trimestre,
  editable,
  isPending,
  onSave,
}: {
  rock: Rock;
  trimestre: string;
  editable: boolean;
  isPending: boolean;
  onSave: (v: { targetValue: number | null; targetUnit: string; targetMoney: number | null }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(rock.target_value?.toString() ?? "");
  const [unit, setUnit] = useState(rock.target_unit ?? "");
  const [money, setMoney] = useState(rock.target_money?.toString() ?? "");

  const pace = rock.target_value ? derivePace(Number(rock.target_value)) : null;
  const progress = rock.target_value
    ? computeProgress(Number(rock.target_value), 0, isoDate())
    : null;

  if (!editing) {
    return (
      <div
        className="rounded-[11px] border px-3.5 py-3"
        style={{ borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.07)" }}
      >
        <div className="flex items-start gap-2.5">
          <Target size={14} className="mt-0.5" style={{ color: "#a78bfa" }} />
          <div className="min-w-0 flex-1">
            {rock.target_value != null && rock.target_value > 0 ? (
              <>
                <p className="text-[13px] font-bold text-fg">
                  {fmt(Number(rock.target_value))} {rock.target_unit ?? ""}
                  {rock.target_money != null && (
                    <span className="font-medium text-fg-muted"> · ${fmt(Number(rock.target_money))}</span>
                  )}
                  <span className="ml-1 text-[11px] font-medium text-fg-subtle">
                    en el trimestre {trimestre}
                  </span>
                </p>
                {/* El ritmo se DERIVA — es como Dilio lo enuncia, no un dato guardado. */}
                {pace && (
                  <p className="mt-0.5 text-[11px] text-fg-muted">
                    ≈ {fmt(pace.perMonth)} por mes · {fmt(pace.perWeek)} por semana
                    {progress && progress.status !== "done" && (
                      <span style={{ color: PACE_COLOR[progress.status] }}>
                        {" "}
                        · {PACE_LABEL[progress.status]}
                      </span>
                    )}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[12.5px] text-fg-muted">
                Esta Roca todavía no tiene una meta medible. Sin número no se puede repartir
                entre responsables.
              </p>
            )}
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-shrink-0 text-[11.5px] font-semibold"
              style={{ color: "#a78bfa" }}
            >
              {rock.target_value ? "Editar" : "Definir"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[11px] border border-white/[0.09] bg-white/[0.03] p-3.5">
      <p className="mb-2.5 text-[11.5px] leading-relaxed text-fg-muted">
        La meta es del <strong>trimestre completo</strong>. Si querés 5 clientes por mes,
        poné <strong>15</strong> — el ritmo mensual se calcula solo.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <NumField label="Cantidad" value={value} onChange={setValue} placeholder="15" />
        <TextField label="Unidad" value={unit} onChange={setUnit} placeholder="clientes" />
        <NumField label="Monto total ($)" value={money} onChange={setMoney} placeholder="75000" />
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            onSave({
              targetValue: value.trim() === "" ? null : Number(value.replace(/[^\d.]/g, "")),
              targetUnit: unit,
              targetMoney: money.trim() === "" ? null : Number(money.replace(/[^\d.]/g, "")),
            });
            setEditing(false);
          }}
          className="rounded-[9px] px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50"
          style={{ background: "#8b5cf6" }}
        >
          {isPending ? "Guardando…" : "Guardar meta"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-[9px] px-3 py-1.5 text-[11.5px] text-fg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Un responsable y sus actividades ────────────────────────────────────────

function ContributionRow({
  contribution,
  rock,
  activities,
  memberName,
  canEdit,
  canRemove,
  isPending,
  onRemove,
  onSaveActivity,
  onRemoveActivity,
}: {
  contribution: RockContribution;
  rock: Rock;
  activities: ContributionActivity[];
  memberName: string;
  canEdit: boolean;
  canRemove: boolean;
  isPending: boolean;
  onRemove: () => void;
  onSaveActivity: (a: { name: string; unit: string; weeklyTarget: number }) => void;
  onRemoveActivity: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [weekly, setWeekly] = useState("");

  const pace = derivePace(Number(contribution.target_value));

  return (
    <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-fg">
          {memberName}
        </span>
        <span className="flex-shrink-0 text-[11.5px] text-fg-muted">
          {fmt(Number(contribution.target_value))} {rock.target_unit ?? ""}
          <span className="text-fg-subtle"> · ≈{fmt(pace.perMonth)}/mes</span>
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isPending}
            aria-label={`Quitar a ${memberName}`}
            className="flex-shrink-0 text-fg-subtle transition hover:text-[#fca5a5] disabled:opacity-50"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Las actividades: lo único que la persona controla. S26 las pregunta a diario. */}
      {activities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activities.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-fg-muted"
            >
              {a.name}
              <strong className="text-fg">{fmt(Number(a.weekly_target))}</strong>
              /sem
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onRemoveActivity(a.id)}
                  disabled={isPending}
                  aria-label={`Quitar ${a.name}`}
                  className="text-fg-subtle hover:text-[#fca5a5]"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-2">
          {adding ? (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[130px] flex-1">
                <TextField label="Actividad" value={name} onChange={setName} placeholder="llamadas" />
              </div>
              <div className="w-[92px]">
                <NumField label="Por semana" value={weekly} onChange={setWeekly} placeholder="20" />
              </div>
              <button
                type="button"
                disabled={isPending || !name.trim()}
                onClick={() => {
                  onSaveActivity({
                    name,
                    unit: "",
                    weeklyTarget: Number(weekly.replace(/[^\d.]/g, "")) || 0,
                  });
                  setName("");
                  setWeekly("");
                  setAdding(false);
                }}
                className="rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                style={{ background: "#8b5cf6" }}
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-fg-muted transition hover:text-fg"
            >
              <Plus size={11} /> Actividad
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sumar responsable ───────────────────────────────────────────────────────

function AddContribution({
  team,
  suggested,
  unit,
  isPending,
  onAdd,
}: {
  team: Pick<Profile, "id" | "full_name">[];
  suggested: number;
  unit: string | null;
  isPending: boolean;
  onAdd: (ownerId: string, targetValue: number) => void;
}) {
  const [ownerId, setOwnerId] = useState("");
  const [value, setValue] = useState("");

  if (team.length === 0) return null;

  return (
    <div className="mt-2.5 flex flex-wrap items-end gap-2 border-t border-white/[0.06] pt-2.5">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-[10.5px] font-semibold text-fg-muted">Responsable</label>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className="w-full rounded-[9px] border border-white/[0.09] bg-white/[0.035] px-2.5 py-1.5 text-[12px] text-fg outline-none"
        >
          <option value="">Elegí…</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[110px]">
        <NumField
          label={`Aporte${unit ? ` (${unit})` : ""}`}
          value={value}
          onChange={setValue}
          // Sugiere lo que falta para cerrar el reparto: menos fricción y menos error.
          placeholder={suggested > 0 ? fmt(suggested) : "0"}
        />
      </div>
      <button
        type="button"
        disabled={isPending || !ownerId}
        onClick={() => {
          const v = Number(value.replace(/[^\d.]/g, "")) || suggested || 0;
          onAdd(ownerId, v);
          setOwnerId("");
          setValue("");
        }}
        className="rounded-[9px] px-3 py-1.5 text-[11.5px] font-semibold disabled:opacity-40"
        style={{ background: "rgba(167,139,250,0.18)", color: "#ddd6fe" }}
      >
        <Plus size={12} className="inline" /> Asignar
      </button>
    </div>
  );
}

// ── Campos ──────────────────────────────────────────────────────────────────

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10.5px] font-semibold text-fg-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[9px] border border-white/[0.09] bg-white/[0.035] px-2.5 py-1.5 text-[12px] text-fg outline-none transition focus:border-[#a78bfa]/60"
      />
    </div>
  );
}

function NumField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return <TextField {...props} />;
}
