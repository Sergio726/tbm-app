"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Trophy, Bell, X, FileText, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { normalizeLetters } from "@/lib/disc";
import { generateDiscLink } from "@/app/(dashboard)/equipo/actions";
import {
  buildChecklist,
  draftFrom,
  type DiscAssessmentLite,
  type DiscScoresShape,
  type Draft,
} from "./types";
import { TeamSidebar } from "./team-sidebar";
import { MemberDetail } from "./member-detail";
import { EmptyDetail } from "./empty-detail";
import { InviteModal } from "./invite-modal";
import { MemberReportModal } from "./member-report-modal";
import { AuthorityMatrixPanel, type AuthorityMatrixRow } from "./authority-matrix-panel";
import { DangerousCrossings } from "./dangerous-crossings";

export type { DiscAssessmentLite } from "./types";

export function EquipoClient({
  team,
  currentUserId,
  companyId,
  isArquitecto,
  assessments,
  authorityMatrix,
  creditBalance,
}: {
  team: Profile[];
  currentUserId: string;
  companyId: string;
  isArquitecto: boolean;
  assessments: DiscAssessmentLite[];
  authorityMatrix: AuthorityMatrixRow | null;
  creditBalance: number;
}) {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(
    team.find((m) => m.id !== currentUserId)?.id ?? team[0]?.id ?? null
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseId, setBaseId] = useState<string | null>(null);
  const [baseSnapshot, setBaseSnapshot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<{ name: string } | null>(null);

  const [freshToken, setFreshToken] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  // Realtime: aviso cuando un miembro completa su test DISC
  const teamRef = useRef(team);
  teamRef.current = team;
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("equipo-disc-assessments")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "disc_assessments",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const row = payload.new as { profile_id?: string | null; status?: string };
          if (row?.status === "completado") {
            const m = teamRef.current.find((x) => x.id === row.profile_id);
            setToast({ name: m?.full_name ?? "Un colaborador" });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 12000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!errorFlash) return;
    const t = setTimeout(() => setErrorFlash(null), 5000);
    return () => clearTimeout(t);
  }, [errorFlash]);
  // Cerrar el diálogo de confirmación con Escape.
  useEffect(() => {
    if (!confirmRegen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmRegen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmRegen]);

  const selected = team.find((m) => m.id === selectedId) ?? null;
  const selectedAssessment = selected
    ? assessments.find((a) => a.profile_id === selected.id) ?? null
    : null;
  const selectedToken = selected
    ? freshToken[selected.id] ?? selectedAssessment?.token ?? null
    : null;

  // Sembrar/refrescar el draft. Reseed al cambiar de miembro; y también cuando
  // los datos del servidor del MISMO miembro cambian (p. ej. tras "Actualizar
  // ahora" del toast realtime o tras guardar) SIEMPRE que no haya ediciones sin
  // guardar (draft === snapshot base), para no pisar lo que el Arquitecto escribió.
  const freshSnapshot = selected ? JSON.stringify(draftFrom(selected)) : null;
  if (selected && baseId !== selected.id) {
    setBaseId(selected.id);
    setBaseSnapshot(freshSnapshot);
    setDraft(draftFrom(selected));
  } else if (
    selected &&
    freshSnapshot !== baseSnapshot &&
    draft &&
    JSON.stringify(draft) === baseSnapshot
  ) {
    setBaseSnapshot(freshSnapshot);
    setDraft(draftFrom(selected));
  }

  const dirty = useMemo(() => {
    if (!selected || !draft) return false;
    return JSON.stringify(draftFrom(selected)) !== JSON.stringify(draft);
  }, [selected, draft]);

  const checklist = useMemo(() => (draft ? buildChecklist(draft) : []), [draft]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  async function handleSave() {
    if (!selected || !draft || saving) return;
    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          cargo: draft.cargo || null,
          disc_letters: normalizeLetters(draft.disc_letters) || null,
          disc_state: draft.disc_state,
          disc_temor: draft.disc_temor || null,
          disc_prime_plan: draft.disc_prime_plan || null,
          los_level: draft.los_level,
          los_target: draft.los_target,
          alignment: draft.alignment,
          kpi_name: draft.kpi_name || null,
          kpi_weekly_target: draft.kpi_weekly_target,
        })
        .eq("id", selected.id);
      if (error) throw error;
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2400);
      router.refresh();
    } catch (e) {
      console.error("Error guardando perfil:", e);
      setErrorFlash("No se pudo guardar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // Gate de confirmación: solo pide confirmar si hay un perfil DISC que se
  // perdería (test completado o letras cargadas). En el primer "Generar link"
  // no hay nada que perder → procede directo.
  function requestGenerateLink() {
    if (!selected || generating) return;
    const hasData = !!(selected.disc_letters || selected.disc_status === "completado");
    if (hasData) setConfirmRegen(true);
    else void handleGenerateLink();
  }

  async function handleGenerateLink() {
    if (!selected || generating) return;
    setConfirmRegen(false);
    setGenerating(true);
    try {
      // Gating de créditos (Fase 2 A3): el descuento del crédito + la creación del
      // token + el reset del perfil ocurren atómicamente en la RPC server-side
      // `generate_disc_link` (no salteable desde la consola). Reusar un pendiente
      // no cobra; sin créditos → aviso, sin crear nada.
      const res = await generateDiscLink(selected.id);
      if (!res.ok) {
        setErrorFlash(
          res.error === "sin_creditos"
            ? "La empresa se quedó sin créditos para tests DISC. Cargá créditos para continuar."
            : "No se pudo generar el link. Intentá de nuevo."
        );
        return;
      }
      setFreshToken((m) => ({ ...m, [selected.id]: res.token }));
      patch({ disc_letters: "" }); // limpia barras/Luz-Sombra al instante
      router.refresh();
    } catch (e) {
      console.error("Error generando link DISC:", e);
      setErrorFlash("No se pudo generar el link. Intentá de nuevo.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleUploadPdf(file: File) {
    if (!selected || uploadingPdf) return;
    setUploadingPdf(true);
    try {
      const supabase = createBrowserClient();
      const path = `${companyId}/${selected.id}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("disc-reports")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });
      if (upErr) throw upErr;
      // Adjuntar el PDF NO equivale a completar el test: solo guarda el informe.
      // El estado "completado" lo fija únicamente la entrega del test (submit_disc),
      // para no contaminar el % "Estado DISC del equipo" ni el badge ✓ del roster.
      const { error } = await supabase
        .from("profiles")
        .update({ disc_pdf_url: path })
        .eq("id", selected.id);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error("Error subiendo PDF:", e);
      setErrorFlash(
        "No se pudo subir el informe. Revisá que sea un PDF y volvé a intentar."
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  const scores = (selected?.disc_scores ?? null) as DiscScoresShape;

  return (
    <main
      className="mx-auto w-full max-w-[1500px] px-5 py-[30px] pb-10 text-white md:px-10"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* page header */}
      <div className="mb-[26px] flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.6px] text-[#9fb9ff]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#5b8aff", boxShadow: "0 0 6px #5b8aff" }}
            />
            {isArquitecto ? "Mi Equipo" : "Mi Perfil"}
          </div>
          <h1
            className="m-0 text-[34px] font-extrabold text-white"
            style={{ letterSpacing: -0.8 }}
          >
            {isArquitecto
              ? "Mapa DISC + Delegación del equipo"
              : "Mi perfil DISC + Delegación"}
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {isArquitecto
              ? `${team.length} ${team.length === 1 ? "persona" : "personas"} · perfil de comportamiento, nivel de autonomía y alineación de cada rol.`
              : "Tu perfil de comportamiento, tu nivel de delegación y tu alineación. Solo el Arquitecto puede editarlo."}
          </p>
        </div>
        {isArquitecto && (
          <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
            <Link
              href="/creditos"
              title="Ver detalle e historial de créditos"
              className="inline-flex items-center transition hover:-translate-y-px"
              style={{
                gap: 7,
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                color: creditBalance > 0 ? "#9bb8ff" : "#fca5a5",
                background:
                  creditBalance > 0 ? "rgba(91,138,255,0.10)" : "rgba(248,113,113,0.10)",
                border:
                  creditBalance > 0
                    ? "1px solid rgba(91,138,255,0.25)"
                    : "1px solid rgba(248,113,113,0.3)",
                borderRadius: 999,
                padding: "8px 13px",
              }}
            >
              🎟️ {creditBalance} {creditBalance === 1 ? "crédito" : "créditos"}
            </Link>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl border-0 py-3 text-[13.5px] font-semibold text-white transition hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
                boxShadow:
                  "0 8px 22px rgba(91,138,255,0.34), inset 0 1px 0 rgba(255,255,255,0.2)",
                padding: "11px 18px",
              }}
            >
              <Send size={15} strokeWidth={1.9} />
              Invitar colaborador
            </button>
          </div>
        )}
      </div>

      <div
        className={
          isArquitecto
            ? "grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[300px_minmax(0,1fr)]"
            : "grid grid-cols-1 items-start gap-[22px]"
        }
      >
        {isArquitecto && (
          <TeamSidebar
            team={team}
            currentUserId={currentUserId}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isArquitecto={isArquitecto}
          />
        )}

        {selected && draft ? (
          <div className="min-w-0">
            {isArquitecto && selected.disc_letters && (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[#5b8aff]/40 bg-[#5b8aff]/15 px-3.5 py-2 text-[12.5px] font-semibold text-[#bcd0ff] transition hover:bg-[#5b8aff]/25"
                >
                  <FileText size={14} /> Ver informe completo
                </button>
              </div>
            )}
            <MemberDetail
              member={selected}
              draft={draft}
              patch={patch}
              editable={isArquitecto}
              checklist={checklist}
              scores={scores}
              testToken={selectedToken}
              testStatus={selectedAssessment?.status ?? null}
              onGenerateLink={requestGenerateLink}
              generating={generating}
              onUploadPdf={handleUploadPdf}
              uploadingPdf={uploadingPdf}
              dirty={dirty}
              saving={saving}
              savedFlash={savedFlash}
              onSave={handleSave}
            />
          </div>
        ) : (
          <EmptyDetail />
        )}
      </div>

      {/* Salud del equipo — lectura agregada (debajo del mapa individual). */}
      {isArquitecto && (
        <section className="mt-9">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.6px] text-[#9fb9ff]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#5b8aff", boxShadow: "0 0 6px #5b8aff" }}
            />
            Salud del equipo
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DangerousCrossings team={team} />
            <div className="space-y-1.5">
              <AuthorityMatrixPanel
                companyId={companyId}
                initial={authorityMatrix}
                editable={isArquitecto}
              />
              <p className="px-1 text-[10.5px] text-white/65">
                Anticipo del módulo Delegación (S4).
              </p>
            </div>
          </div>
        </section>
      )}

      {reportOpen && selected && (
        <MemberReportModal member={selected} team={team} onClose={() => setReportOpen(false)} />
      )}

      {/* Confirmación antes de re-hacer el test (acción destructiva) */}
      {confirmRegen && selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-regen-title"
          onClick={() => setConfirmRegen(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl border border-[#f87171]/30 bg-[#141b2b] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-[#fca5a5]" />
              <h2 id="confirm-regen-title" className="text-[15px] font-bold text-white">
                Re-hacer test DISC
              </h2>
            </div>
            <p className="text-[13px] leading-relaxed text-white/70">
              Esto va a <b className="text-white">borrar el perfil DISC actual</b> de{" "}
              <b className="text-white">{selected.full_name ?? "esta persona"}</b> (letras, scores y
              arquetipo) y a <b className="text-white">invalidar el link anterior</b>. Esta acción no
              se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmRegen(false)}
                className="rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={generating}
                autoFocus
                className="rounded-[10px] bg-gradient-to-br from-[#f87171] to-[#dc2626] px-4 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-60"
              >
                {generating ? "Generando…" : "Sí, re-hacer test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast (savedFlash) — abajo central, RPG-style */}
      {savedFlash && (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-[50] inline-flex -translate-x-1/2 items-center gap-2.5 rounded-xl px-5 py-3 text-[13.5px] font-bold"
          style={{
            background: "linear-gradient(135deg, #34d399, #10b981)",
            color: "#04241a",
            boxShadow: "0 12px 34px rgba(52,211,153,0.4)",
            animation: "tbm-rise .25s ease",
          }}
        >
          <Trophy size={16} strokeWidth={2} />
          ¡Ficha guardada! +1 jugador alineado
        </div>
      )}

      {/* Toast de error — abajo central */}
      {errorFlash && (
        <div
          className="fixed bottom-6 left-1/2 z-[55] inline-flex max-w-[90vw] -translate-x-1/2 items-center gap-2.5 rounded-xl border border-[#f87171]/40 bg-[#2a1416] px-5 py-3 text-[13px] font-semibold text-[#fca5a5]"
          style={{ boxShadow: "0 12px 34px rgba(0,0,0,0.4)", animation: "tbm-rise .25s ease" }}
          role="alert"
        >
          <AlertTriangle size={16} strokeWidth={2} />
          {errorFlash}
          <button
            type="button"
            onClick={() => setErrorFlash(null)}
            aria-label="Cerrar aviso"
            className="ml-1.5 text-[#fca5a5]/60 hover:text-[#fca5a5]"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {inviteOpen && (
        <InviteModal
          companyId={companyId}
          invitedBy={currentUserId}
          onClose={() => setInviteOpen(false)}
          onDone={() => {
            setInviteOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Toast realtime — esquina inferior derecha */}
      {toast && (
        <div
          className="fixed bottom-[90px] right-5 z-[60] max-w-[340px] tbm-slide-right"
        >
          <div className="flex items-start gap-3 rounded-xl border border-[#34d399]/40 bg-[var(--surface)] p-4 shadow-2xl">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#34d399]/[0.15] text-[#34d399]">
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-white">
                {toast.name} completó su test DISC
              </div>
              <div className="mt-0.5 text-xs text-white/55">
                Actualizá para ver su perfil cargado.
              </div>
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  router.refresh();
                }}
                className="mt-2 text-[12.5px] font-semibold text-[#9fb9ff]"
              >
                Actualizar ahora ↻
              </button>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Cerrar notificación"
              className="text-white/65"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
