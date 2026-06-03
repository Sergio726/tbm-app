"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trophy, Bell, X, FileText } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { normalizeLetters } from "@/lib/disc";
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

export type { DiscAssessmentLite } from "./types";

export function EquipoClient({
  team,
  currentUserId,
  companyId,
  isArquitecto,
  assessments,
}: {
  team: Profile[];
  currentUserId: string;
  companyId: string;
  isArquitecto: boolean;
  assessments: DiscAssessmentLite[];
}) {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(
    team.find((m) => m.id !== currentUserId)?.id ?? team[0]?.id ?? null
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [baseId, setBaseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [toast, setToast] = useState<{ name: string } | null>(null);

  const [freshToken, setFreshToken] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Realtime: aviso cuando un miembro completa su test DISC
  const teamRef = useRef(team);
  teamRef.current = team;
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("equipo-disc-assessments")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "disc_assessments" },
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
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 12000);
    return () => clearTimeout(t);
  }, [toast]);

  const selected = team.find((m) => m.id === selectedId) ?? null;
  const selectedAssessment = selected
    ? assessments.find((a) => a.profile_id === selected.id) ?? null
    : null;
  const selectedToken = selected
    ? freshToken[selected.id] ?? selectedAssessment?.token ?? null
    : null;

  if (selected && baseId !== selected.id) {
    setBaseId(selected.id);
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
      alert("No se pudo guardar. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateLink() {
    if (!selected || generating) return;
    setGenerating(true);
    try {
      const supabase = createBrowserClient();
      const token =
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, "")
          : Math.random().toString(36).slice(2)) +
        Math.random().toString(36).slice(2);
      const { error } = await supabase.from("disc_assessments").insert({
        token,
        company_id: companyId,
        profile_id: selected.id,
        full_name: selected.full_name,
        cargo: draft?.cargo || selected.cargo || null,
        created_by: currentUserId,
        status: "pendiente",
      });
      if (error) throw error;
      // Re-hacer test: dejar el perfil en blanco y en estado "enviado" para
      // que el nuevo test arranque limpio (decisión: "limpiar de una").
      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          disc_status: "enviado",
          disc_letters: null,
          disc_name: null,
          disc_icon: null,
          disc_profile_key: null,
          disc_scores: null,
        })
        .eq("id", selected.id);
      if (profErr) throw profErr;
      setFreshToken((m) => ({ ...m, [selected.id]: token }));
      patch({ disc_letters: "" }); // limpia barras/Luz-Sombra al instante
      router.refresh();
    } catch (e) {
      console.error("Error generando link DISC:", e);
      alert("No se pudo generar el link. Intentá de nuevo.");
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
      const { error } = await supabase
        .from("profiles")
        .update({ disc_pdf_url: path, disc_status: "completado" })
        .eq("id", selected.id);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error("Error subiendo PDF:", e);
      alert(
        "No se pudo subir el informe. Revisá que sea un PDF y volvé a intentar."
      );
    } finally {
      setUploadingPdf(false);
    }
  }

  const scores = (selected?.disc_scores ?? null) as DiscScoresShape;

  return (
    <main
      className="mx-auto w-full max-w-[1500px] px-10 py-[30px] pb-10 text-white"
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
            Mi Equipo
          </div>
          <h1
            className="m-0 text-[34px] font-extrabold text-white"
            style={{ letterSpacing: -0.8 }}
          >
            Mapa DISC + LOS del equipo
          </h1>
          <p className="mt-2 text-sm text-white/55">
            {team.length} {team.length === 1 ? "persona" : "personas"} · perfil de
            comportamiento, nivel de autonomía y alineación de cada rol.
          </p>
        </div>
        {isArquitecto && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2.5 rounded-xl border-0 px-4.5 py-3 text-[13.5px] font-semibold text-white transition hover:-translate-y-px"
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
        )}
        {!isArquitecto && (
          <div
            className="max-w-[320px] rounded-xl px-4 py-3 text-[12px] leading-relaxed text-white/55"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Tu rol es <span className="font-semibold text-white/80">colaborador</span>. Solo el
            Arquitecto puede editar el equipo, generar links de test e invitar.
          </div>
        )}
      </div>

      <div
        className="grid items-start gap-[22px]"
        style={{ gridTemplateColumns: "300px minmax(0, 1fr)" }}
      >
        <TeamSidebar
          team={team}
          currentUserId={currentUserId}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isArquitecto={isArquitecto}
        />

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
              onGenerateLink={handleGenerateLink}
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

      {reportOpen && selected && (
        <MemberReportModal member={selected} team={team} onClose={() => setReportOpen(false)} />
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
          <div className="flex items-start gap-3 rounded-xl border border-[#34d399]/40 bg-[#0F1B2D] p-4 shadow-2xl">
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
              className="text-white/40"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
