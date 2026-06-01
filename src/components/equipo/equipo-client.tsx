"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Bell, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { normalizeLetters } from "@/lib/disc";
import {
  buildChecklist,
  draftFrom,
  type DiscAssessmentLite,
  type DiscScoresShape,
  type Draft,
  FONT,
} from "./types";
import { TeamSidebar } from "./team-sidebar";
import { MemberDetail } from "./member-detail";
import { EmptyDetail } from "./empty-detail";
import { CompletionBar } from "./completion-bar";
import { InviteModal } from "./invite-modal";

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

  const [freshToken, setFreshToken] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<{ name: string } | null>(null);

  // Realtime: aviso cuando un miembro completa su test DISC.
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
          const row = payload.new as {
            profile_id?: string | null;
            status?: string;
          };
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

  const checklist = useMemo(
    () => (draft ? buildChecklist(draft) : []),
    [draft]
  );

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
      setTimeout(() => setSavedFlash(false), 2000);
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
      if ((selected.disc_status ?? "pendiente") === "pendiente") {
        await supabase
          .from("profiles")
          .update({ disc_status: "enviado" })
          .eq("id", selected.id);
      }
      setFreshToken((m) => ({ ...m, [selected.id]: token }));
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
        .upload(path, file, {
          upsert: true,
          contentType: "application/pdf",
        });
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
    <div
      className="text-white"
      style={{
        padding: "32px 40px 110px", // bottom padding por la sticky bar
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%",
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: 28, gap: 16 }}
      >
        <div>
          <div
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(91,138,255,0.9)",
              letterSpacing: 1.4,
              marginBottom: 6,
            }}
          >
            ● Mi Equipo
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: -0.6,
              margin: 0,
            }}
          >
            Mapa DISC + LOS del equipo
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              marginTop: 6,
            }}
          >
            {team.length} {team.length === 1 ? "persona" : "personas"} · perfil de
            comportamiento, nivel de autonomía y alineación de cada rol.
          </p>
        </div>
        {isArquitecto && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center transition-opacity hover:opacity-90"
            style={{
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 18px rgba(54,114,255,0.3)",
            }}
          >
            <Send size={15} /> Invitar colaborador
          </button>
        )}
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "320px 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <TeamSidebar
          team={team}
          currentUserId={currentUserId}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isArquitecto={isArquitecto}
        />

        {selected && draft ? (
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
          />
        ) : (
          <EmptyDetail />
        )}
      </div>

      {/* Sticky bar — solo si hay un miembro seleccionado con borrador */}
      {selected && draft && (
        <CompletionBar
          checklist={checklist}
          dirty={dirty}
          saving={saving}
          savedFlash={savedFlash}
          editable={isArquitecto}
          onSave={handleSave}
        />
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

      {toast && (
        <div
          className="fixed tbm-slide-right"
          style={{ bottom: 90, right: 20, zIndex: 60, maxWidth: 340 }}
        >
          <div
            className="flex items-start"
            style={{
              gap: 12,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#0F1B2D",
              border: "1px solid rgba(52,211,153,0.4)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(52,211,153,0.15)",
                color: "#34d399",
              }}
            >
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>
                {toast.name} completó su test DISC
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 2,
                }}
              >
                Actualizá para ver su perfil cargado.
              </div>
              <button
                onClick={() => {
                  setToast(null);
                  router.refresh();
                }}
                style={{
                  marginTop: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#9fb9ff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Actualizar ahora ↻
              </button>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
