"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { capture } from "@/lib/analytics";
import {
  Play,
  Square,
  Check,
  X,
  Inbox,
  Loader2,
  Clock,
  Lock,
  Circle,
} from "lucide-react";
import type { WarUp, WarUpEntry, ValidationStatus } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TeamMember = {
  id: string;
  full_name: string | null;
  role: string | null;
};

interface Props {
  companyId: string;
  userId: string;
  isArquitecto: boolean;
  userFullName: string | null;
  today: string;
  initialWarUp: WarUp | null;
  initialEntries: WarUpEntry[];
  teamProfiles: TeamMember[];
  arquitectoPreGameDone: boolean;
}

export default function WarUpRoom({
  companyId,
  userId,
  isArquitecto,
  userFullName,
  today,
  initialWarUp,
  initialEntries,
  teamProfiles,
  arquitectoPreGameDone,
}: Props) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [warUp, setWarUp] = useState<WarUp | null>(initialWarUp);
  const [entries, setEntries] = useState<WarUpEntry[]>(initialEntries);
  const [error, setError] = useState<string | null>(null);

  // ── Suscripción Realtime ─────────────────────────────────────
  useEffect(() => {
    if (!warUp) return;
    const warUpId = warUp.id;

    const channel: RealtimeChannel = supabase
      .channel(`war-up-${warUpId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "war_up_entries",
          filter: `war_up_id=eq.${warUpId}`,
        },
        (payload) => {
          setEntries((curr) => {
            if (payload.eventType === "INSERT") {
              const e = payload.new as WarUpEntry;
              if (curr.some((x) => x.id === e.id)) return curr;
              return [...curr, e].sort((a, b) =>
                (a.created_at ?? "").localeCompare(b.created_at ?? "")
              );
            }
            if (payload.eventType === "UPDATE") {
              const e = payload.new as WarUpEntry;
              return curr.map((x) => (x.id === e.id ? e : x));
            }
            if (payload.eventType === "DELETE") {
              const id = (payload.old as { id?: string }).id;
              return curr.filter((x) => x.id !== id);
            }
            return curr;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "war_ups",
          filter: `id=eq.${warUpId}`,
        },
        (payload) => {
          setWarUp(payload.new as WarUp);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [warUp?.id, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Acciones del Arquitecto ──────────────────────────────────
  const startWarUp = () => {
    setError(null);
    startTransition(async () => {
      const { data, error: err } = await supabase
        .from("war_ups")
        .insert({
          company_id: companyId,
          war_up_date: today,
          started_by: userId,
          started_at: new Date().toISOString(),
          status: "active",
        })
        .select()
        .single();
      if (err || !data) {
        setError(err?.message ?? "No se pudo iniciar el War Up.");
        return;
      }
      setWarUp(data);
      setEntries([]);
      capture("war_up_started");

      // Notificar a todo el equipo que la sala está abierta (no bloqueante)
      const recipients = teamProfiles.filter((p) => p.id !== userId);
      if (recipients.length > 0) {
        try {
          await supabase.from("notifications").insert(
            recipients.map((p) => ({
              company_id: companyId,
              user_id: p.id,
              type: "war_up_started",
              title: "War Up iniciado",
              body: "La sala está abierta — entrá con tu QUÉ / POR QUÉ / BLOQUEO.",
              href: "/rituales/war-up",
            }))
          );
        } catch (e) {
          console.error("Notificación war_up_started falló (no bloqueante):", e);
        }
      }

      router.refresh();
    });
  };

  const closeWarUp = () => {
    if (!warUp) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await supabase
        .from("war_ups")
        .update({
          status: "closed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", warUp.id);
      if (err) {
        setError(err.message);
      } else {
        capture("war_up_closed", { entries_count: entries.length });
        setWarUp((curr) => (curr ? { ...curr, status: "closed", ended_at: new Date().toISOString() } : curr));
        router.refresh();
      }
    });
  };

  // ── Validación de entries (Arquitecto) ───────────────────────
  const validate = async (entryId: string, status: ValidationStatus | null) => {
    setError(null);
    const { error: err } = await supabase
      .from("war_up_entries")
      .update({
        validation_status: status,
        validated_by: status ? userId : null,
        validated_at: status ? new Date().toISOString() : null,
      })
      .eq("id", entryId);
    if (err) setError(err.message);
  };

  // ── Aparcar entry sin Roca ───────────────────────────────────
  const [parkBusyEntryId, setParkBusyEntryId] = useState<string | null>(null);
  const parkEntry = async (entry: WarUpEntry) => {
    if (!entry.what_today?.trim()) return;
    setParkBusyEntryId(entry.id);
    try {
      const { error: err } = await supabase.from("parking_lot").insert({
        company_id: companyId,
        source: "war_up",
        source_entry_id: entry.id,
        proposed_by: entry.user_id,
        title: entry.what_today.trim(),
        rationale: entry.why_today
          ? `Aparcado desde War Up del ${today}. Por qué: "${entry.why_today.trim()}".`
          : `Aparcado desde War Up del ${today}.`,
        rock_label: entry.rock_label,
      });
      if (err) {
        setError(err.message);
      }
    } finally {
      setParkBusyEntryId(null);
    }
  };

  // ── Estado UI derivado ───────────────────────────────────────
  const isActive = warUp?.status === "active";
  const isClosed = warUp?.status === "closed";
  const nameById = useMemo(
    () => new Map(teamProfiles.map((p) => [p.id, p.full_name ?? "Sin nombre"])),
    [teamProfiles]
  );
  const myEntry = useMemo(
    () => entries.find((e) => e.user_id === userId) ?? null,
    [entries, userId]
  );
  const elapsedMin = useMemo(() => {
    if (!warUp?.started_at) return 0;
    const ms = Date.now() - new Date(warUp.started_at).getTime();
    return Math.floor(ms / 60000);
  }, [warUp?.started_at]);

  // ── Render: sin War Up todavía ───────────────────────────────
  if (!warUp) {
    return (
      <div>
        {isArquitecto && !arquitectoPreGameDone && (
          <PreGameLockBanner />
        )}
        <EmptyState
          title="Todavía no se inició el War Up de hoy"
          body={
            isArquitecto
              ? "Como Arquitecto, vos abrís la sala. Cada colaborador podrá ingresar su QUÉ / POR QUÉ / BLOQUEO en cuanto la inicies."
              : "Esperando que el Arquitecto inicie la sala. Cuando arranque, vas a poder ingresar tu QUÉ / POR QUÉ / BLOQUEO."
          }
          action={
            isArquitecto && (
              <button
                type="button"
                onClick={startWarUp}
                disabled={isPending || !arquitectoPreGameDone}
                className="flex items-center"
                style={{
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: 11,
                  background:
                    arquitectoPreGameDone && !isPending
                      ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
                      : "rgba(255,255,255,0.05)",
                  color:
                    arquitectoPreGameDone && !isPending
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    isPending || !arquitectoPreGameDone
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <Play size={16} />
                {isPending ? "Iniciando…" : "Iniciar War Up"}
              </button>
            )
          }
        />
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </div>
    );
  }

  // ── Render: sala activa o cerrada ────────────────────────────
  return (
    <div>
      {/* Header: status + timer + close */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: isActive
            ? "linear-gradient(135deg, rgba(91,138,255,0.10), rgba(91,138,255,0.02))"
            : "rgba(255,255,255,0.025)",
          border: isActive
            ? "1px solid rgba(91,138,255,0.30)"
            : "1px solid rgba(255,255,255,0.06)",
          marginBottom: 20,
        }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: isActive ? "#34d399" : "rgba(255,255,255,0.3)",
              boxShadow: isActive ? "0 0 8px rgba(52,211,153,0.7)" : "none",
            }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
              {isActive
                ? "Sala en vivo"
                : isClosed
                  ? "War Up cerrado"
                  : "Pendiente"}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {entries.length} entrada{entries.length === 1 ? "" : "s"} ·{" "}
              {entries.filter((e) => e.validation_status === "with_criteria").length}{" "}
              validada
              {entries.filter((e) => e.validation_status === "with_criteria").length === 1
                ? ""
                : "s"}
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 12 }}>
          {isActive && (
            <div
              className="flex items-center"
              style={{
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                fontSize: 11.5,
                color:
                  elapsedMin > (warUp.timer_duration_min ?? 15)
                    ? "#fbbf24"
                    : "rgba(255,255,255,0.7)",
                fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              }}
            >
              <Clock size={11} />
              {elapsedMin} / {warUp.timer_duration_min ?? 15} min
            </div>
          )}
          {isActive && isArquitecto && (
            <button
              type="button"
              onClick={closeWarUp}
              disabled={isPending}
              className="flex items-center"
              style={{
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(248,113,113,0.10)",
                border: "1px solid rgba(248,113,113,0.30)",
                color: "#fca5a5",
                fontSize: 12,
                fontWeight: 500,
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              <Square size={11} />
              {isPending ? "Cerrando…" : "Cerrar War Up"}
            </button>
          )}
        </div>
      </div>

      {/* Form propio (si no soy Arquitecto y sala activa) */}
      {!isArquitecto && isActive && (
        <MyEntryForm
          warUpId={warUp.id}
          userId={userId}
          fullName={userFullName}
          existing={myEntry}
          supabase={supabase}
        />
      )}

      {/* Lista de entries */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle>Entradas del equipo</SectionTitle>
        {entries.length === 0 ? (
          <EmptyState
            title="Sin entradas todavía"
            body={
              isArquitecto
                ? "Cuando el equipo ingrese su QUÉ / POR QUÉ / BLOQUEO vas a verlo acá en tiempo real."
                : "Sé el primero en ingresar tu entrada arriba."
            }
          />
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {entries.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                name={nameById.get(e.user_id) ?? "Sin nombre"}
                isMine={e.user_id === userId}
                canValidate={isArquitecto && isActive}
                canPark={isArquitecto && isActive && !e.rock_label}
                onValidate={validate}
                onPark={parkEntry}
                parkBusy={parkBusyEntryId === e.id}
              />
            ))}
          </div>
        )}
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}
    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────

function PreGameLockBanner() {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: "12px 16px",
        borderRadius: 12,
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.30)",
        color: "#fde68a",
        fontSize: 13,
        marginBottom: 18,
        lineHeight: 1.5,
      }}
    >
      <Lock size={15} />
      <div>
        Tu Pre-game de hoy todavía no está cerrado. Es el gate del War Up — completalo
        antes de iniciar la sala.{" "}
        <Link
          href="/rituales/pre-game"
          style={{ color: "#fcd34d", textDecoration: "underline" }}
        >
          Ir al Pre-game
        </Link>
      </div>
    </div>
  );
}

function MyEntryForm({
  warUpId,
  userId,
  fullName,
  existing,
  supabase,
}: {
  warUpId: string;
  userId: string;
  fullName: string | null;
  existing: WarUpEntry | null;
  supabase: ReturnType<typeof createBrowserClient>;
}) {
  const [what, setWhat] = useState(existing?.what_today ?? "");
  const [why, setWhy] = useState(existing?.why_today ?? "");
  const [blocker, setBlocker] = useState(existing?.blocker ?? "");
  const [rock, setRock] = useState(existing?.rock_label ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const filled = what.trim() && why.trim() && blocker.trim();

  const save = useCallback(async () => {
    setSaving(true);
    setLocalError(null);
    setSaved(false);
    const payload = {
      war_up_id: warUpId,
      user_id: userId,
      what_today: what.trim() || null,
      why_today: why.trim() || null,
      blocker: blocker.trim() || null,
      rock_label: rock.trim() || null,
    };
    const { error: err } = await supabase
      .from("war_up_entries")
      .upsert(payload, { onConflict: "war_up_id,user_id" });
    if (err) {
      setLocalError(err.message);
    } else {
      setSaved(true);
    }
    setSaving(false);
  }, [warUpId, userId, what, why, blocker, rock, supabase]);

  return (
    <div
      style={{
        padding: 22,
        borderRadius: 14,
        background:
          "linear-gradient(180deg, rgba(91,138,255,0.06), rgba(91,138,255,0.01))",
        border: "1px solid rgba(91,138,255,0.25)",
      }}
    >
      <div
        className="uppercase"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#bcd0ff",
          letterSpacing: 1.3,
          marginBottom: 14,
        }}
      >
        Tu entrada · {fullName ?? "vos"}
      </div>

      <EntryField
        label="QUÉ"
        hint="¿Qué vas a lograr hoy? No digas 'trabajar' — decí el entregable exacto."
        value={what}
        onChange={setWhat}
        rows={2}
      />
      <EntryField
        label="POR QUÉ"
        hint="¿Por qué es lo más rentable hoy? Conectalo con el negocio."
        value={why}
        onChange={setWhy}
        rows={2}
      />
      <EntryField
        label="BLOQUEO"
        hint="¿Qué necesitás del líder para lograrlo? Si nada, decilo igual."
        value={blocker}
        onChange={setBlocker}
        rows={2}
      />
      <EntryField
        label="Roca del Plan 90D (opcional)"
        hint="A qué Roca aporta. Si no aporta a ninguna, el Arquitecto puede aparcarlo."
        value={rock}
        onChange={setRock}
        rows={1}
      />

      {localError && (
        <ErrorBanner inline>{localError}</ErrorBanner>
      )}

      <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          {saved
            ? "Guardado en vivo ✓"
            : existing
              ? "Editando tu entrada"
              : "Sin enviar aún"}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || !filled}
          style={{
            padding: "9px 16px",
            borderRadius: 10,
            background: filled
              ? "linear-gradient(135deg, #5b8aff, #2c5fe6)"
              : "rgba(255,255,255,0.06)",
            color: filled ? "#fff" : "rgba(255,255,255,0.5)",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: saving || !filled ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Enviando…" : existing ? "Actualizar" : "Enviar entrada"}
        </button>
      </div>
    </div>
  );
}

function EntryField({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#bcd0ff",
          marginBottom: 2,
          letterSpacing: 0.6,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 11.5,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 6,
          lineHeight: 1.45,
        }}
      >
        {hint}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          color: "#fff",
          padding: "9px 14px",
          fontSize: 13,
          resize: "vertical",
          fontFamily: "inherit",
          outline: "none",
        }}
      />
    </div>
  );
}

function EntryCard({
  entry,
  name,
  isMine,
  canValidate,
  canPark,
  onValidate,
  onPark,
  parkBusy,
}: {
  entry: WarUpEntry;
  name: string;
  isMine: boolean;
  canValidate: boolean;
  canPark: boolean;
  onValidate: (id: string, status: ValidationStatus | null) => void;
  onPark: (entry: WarUpEntry) => void;
  parkBusy: boolean;
}) {
  const status = entry.validation_status as ValidationStatus | null;
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background:
          status === "with_criteria"
            ? "rgba(52,211,153,0.05)"
            : status === "without_criteria"
              ? "rgba(248,113,113,0.04)"
              : "rgba(255,255,255,0.025)",
        border:
          status === "with_criteria"
            ? "1px solid rgba(52,211,153,0.22)"
            : status === "without_criteria"
              ? "1px solid rgba(248,113,113,0.22)"
              : "1px solid rgba(255,255,255,0.06)",
        opacity: status === "without_criteria" ? 0.7 : 1,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8 }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <Circle size={7} fill={isMine ? "#5b8aff" : "rgba(255,255,255,0.3)"} stroke="none" />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {name}
            {isMine && (
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  marginLeft: 6,
                }}
              >
                (vos)
              </span>
            )}
          </div>
        </div>
        {status && (
          <span
            style={{
              fontSize: 10.5,
              padding: "2px 8px",
              borderRadius: 999,
              background:
                status === "with_criteria"
                  ? "rgba(52,211,153,0.12)"
                  : "rgba(248,113,113,0.10)",
              color: status === "with_criteria" ? "#34d399" : "#fca5a5",
              border:
                status === "with_criteria"
                  ? "1px solid rgba(52,211,153,0.30)"
                  : "1px solid rgba(248,113,113,0.30)",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {status === "with_criteria" ? "✓ Con criterio" : "✗ Sin criterio"}
          </span>
        )}
      </div>

      <Cell label="QUÉ" value={entry.what_today} />
      <Cell label="POR QUÉ" value={entry.why_today} />
      <Cell label="BLOQUEO" value={entry.blocker} />
      {entry.rock_label && (
        <div
          style={{
            fontSize: 11.5,
            color: "rgba(165,180,252,0.85)",
            marginTop: 4,
          }}
        >
          Roca: {entry.rock_label}
        </div>
      )}

      {(canValidate || canPark) && (
        <div
          className="flex items-center"
          style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}
        >
          {canValidate && (
            <>
              <ActionButton
                onClick={() => onValidate(entry.id, "with_criteria")}
                active={status === "with_criteria"}
                color="#34d399"
              >
                <Check size={12} />
                Con criterio
              </ActionButton>
              <ActionButton
                onClick={() => onValidate(entry.id, "without_criteria")}
                active={status === "without_criteria"}
                color="#f87171"
              >
                <X size={12} />
                Sin criterio
              </ActionButton>
              {status && (
                <ActionButton
                  onClick={() => onValidate(entry.id, null)}
                  active={false}
                  color="#94a3b8"
                >
                  Limpiar
                </ActionButton>
              )}
            </>
          )}
          {canPark && entry.what_today?.trim() && (
            <button
              type="button"
              onClick={() => onPark(entry)}
              disabled={parkBusy}
              className="flex items-center"
              style={{
                gap: 5,
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(148,163,184,0.12)",
                border: "1px solid rgba(148,163,184,0.28)",
                color: "#cbd5e1",
                fontSize: 11.5,
                cursor: parkBusy ? "not-allowed" : "pointer",
                opacity: parkBusy ? 0.6 : 1,
              }}
            >
              {parkBusy ? <Loader2 size={11} className="animate-spin" /> : <Inbox size={11} />}
              Aparcar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: "rgba(188,208,255,0.7)",
          letterSpacing: 0.6,
          marginRight: 8,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  onClick,
  active,
  color,
  children,
}: {
  onClick: () => void;
  active: boolean;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center"
      style={{
        gap: 5,
        padding: "5px 11px",
        borderRadius: 999,
        background: active ? `${color}28` : `${color}10`,
        border: active ? `1px solid ${color}60` : `1px solid ${color}30`,
        color,
        fontSize: 11.5,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase"
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,0.55)",
        letterSpacing: 1.3,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "26px 28px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.025)",
        border: "1px dashed rgba(255,255,255,0.10)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
        {title}
      </div>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.55,
          marginBottom: action ? 16 : 0,
        }}
      >
        {body}
      </p>
      {action}
    </div>
  );
}

function ErrorBanner({
  children,
  inline,
}: {
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: "rgba(248,113,113,0.10)",
        border: "1px solid rgba(248,113,113,0.30)",
        color: "#fca5a5",
        fontSize: 13,
        marginTop: inline ? 0 : 14,
        marginBottom: inline ? 12 : 0,
      }}
    >
      {children}
    </div>
  );
}
