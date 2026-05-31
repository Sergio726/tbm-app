"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Sun,
  Moon,
  Target,
  Gauge,
  FileText,
  Sparkles,
  AlertTriangle,
  Check,
  Mail,
  Link2,
  Copy,
  Upload,
  Send,
  X,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import {
  DISC_COLORS,
  DISC_FACTORS,
  DISC_DIMENSIONS,
  LOS_LEVELS,
  ALIGNMENT_ACTION,
  DISC_STATUS_LABEL,
  normalizeLetters,
  primaryLetter,
  systemProfile,
  computeAlignment,
  type AlignmentValue,
  type DiscLetter,
} from "@/lib/disc";

export type DiscAssessmentLite = {
  id: string;
  token: string;
  profile_id: string | null;
  status: string;
  completed_at: string | null;
};

const FONT = "Inter, system-ui, sans-serif";

// Campos editables del perfil en este módulo
type Draft = {
  cargo: string;
  disc_letters: string;
  disc_state: string;
  disc_temor: string;
  disc_prime_plan: string;
  los_level: number;
  los_target: number | null;
  alignment: string | null;
  kpi_name: string;
  kpi_weekly_target: number | null;
};

function draftFrom(p: Profile): Draft {
  return {
    cargo: p.cargo ?? "",
    disc_letters: p.disc_letters ?? "",
    disc_state: p.disc_state ?? "luz",
    disc_temor: p.disc_temor ?? "",
    disc_prime_plan: p.disc_prime_plan ?? "",
    los_level: p.los_level ?? 1,
    los_target: p.los_target ?? null,
    alignment: p.alignment ?? null,
    kpi_name: p.kpi_name ?? "",
    kpi_weekly_target: p.kpi_weekly_target ?? null,
  };
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// =============================================================
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

  // Link DISC generado recién (token), para mostrarlo sin esperar refresh.
  const [freshToken, setFreshToken] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<{ name: string } | null>(null);

  // Ref al equipo para usarlo dentro de la suscripción realtime sin re-suscribir.
  const teamRef = useRef(team);
  teamRef.current = team;

  // Aviso realtime: cuando un miembro completa su test DISC.
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

  // Auto-descartar el aviso a los ~12 s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 12000);
    return () => clearTimeout(t);
  }, [toast]);

  const selected = team.find((m) => m.id === selectedId) ?? null;

  // Test DISC vigente del miembro seleccionado (el más reciente).
  const selectedAssessment = selected
    ? assessments.find((a) => a.profile_id === selected.id) ?? null
    : null;
  const selectedToken = selected
    ? freshToken[selected.id] ?? selectedAssessment?.token ?? null
    : null;

  // Inicializa / resincroniza el draft cuando cambia el seleccionado
  if (selected && baseId !== selected.id) {
    setBaseId(selected.id);
    setDraft(draftFrom(selected));
  }

  const dirty = useMemo(() => {
    if (!selected || !draft) return false;
    const base = draftFrom(selected);
    return JSON.stringify(base) !== JSON.stringify(draft);
  }, [selected, draft]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  async function handleSave() {
    if (!selected || !draft || saving) return;
    if (!draft.kpi_name.trim()) {
      alert("Definí el KPI principal del rol (número único) antes de guardar.");
      return;
    }
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

  // Genera un link público de test DISC para el miembro seleccionado.
  async function handleGenerateLink() {
    if (!selected || generating) return;
    setGenerating(true);
    try {
      const supabase = createBrowserClient();
      const token =
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID().replace(/-/g, "")
          : Math.random().toString(36).slice(2)) + Math.random().toString(36).slice(2);
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
        await supabase.from("profiles").update({ disc_status: "enviado" }).eq("id", selected.id);
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

  // Sube el informe DISC (PDF) al bucket privado y marca el perfil completado.
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
      alert("No se pudo subir el informe. Revisá que sea un PDF y volvé a intentar.");
    } finally {
      setUploadingPdf(false);
    }
  }

  return (
    <div
      className="text-white"
      style={{ padding: "32px 40px 60px", maxWidth: 1600, margin: "0 auto", width: "100%", fontFamily: FONT }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between" style={{ marginBottom: 28, gap: 16 }}>
        <div>
          <div
            className="uppercase"
            style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1.4, marginBottom: 6 }}
          >
            Mi Equipo
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, margin: 0 }}>
            Mapa DISC + LOS del equipo
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
            {team.length} {team.length === 1 ? "persona" : "personas"} · perfil de comportamiento, nivel de autonomía y
            alineación de cada rol.
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

      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start" }}>
        {/* ── Lista de equipo ──────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: 8 }}>
          {team.map((m) => (
            <TeamRow
              key={m.id}
              member={m}
              isYou={m.id === currentUserId}
              active={m.id === selectedId}
              onClick={() => setSelectedId(m.id)}
            />
          ))}

          <div
            className="flex items-center"
            style={{
              gap: 10,
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1.5px dashed rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12.5,
            }}
          >
            <Mail size={15} strokeWidth={1.8} />
            {isArquitecto
              ? 'Usá "Invitar colaborador" para sumar gente al equipo.'
              : "Los nuevos colaboradores aparecen acá cuando aceptan la invitación."}
          </div>
        </div>

        {/* ── Detalle ──────────────────────────────────────── */}
        {selected && draft ? (
          <MemberDetail
            member={selected}
            draft={draft}
            patch={patch}
            editable={isArquitecto}
            dirty={dirty}
            saving={saving}
            savedFlash={savedFlash}
            onSave={handleSave}
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

      {/* Aviso realtime: alguien completó su test DISC */}
      {toast && (
        <div className="fixed tbm-slide-right" style={{ bottom: 20, right: 20, zIndex: 60, maxWidth: 340 }}>
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
              style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52,211,153,0.15)", color: "#34d399" }}
            >
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>
                {toast.name} completó su test DISC
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
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
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Fila de la lista
// =============================================================
function TeamRow({
  member,
  isYou,
  active,
  onClick,
}: {
  member: Profile;
  isYou: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const primary = primaryLetter(member.disc_letters);
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const sys = systemProfile(member.disc_letters);
  const align = member.alignment as AlignmentValue | null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center text-left transition-colors"
      style={{
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        width: "100%",
        cursor: "pointer",
        background: active
          ? "linear-gradient(135deg, rgba(91,138,255,0.18) 0%, rgba(91,138,255,0.05) 100%)"
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${active ? "rgba(91,138,255,0.30)" : "rgba(255,255,255,0.06)"}`,
        color: "#fff",
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: color,
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {initials(member.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>
            {member.full_name ?? "Sin nombre"}
          </span>
          {isYou && (
            <span style={{ fontSize: 9.5, color: "#9fb9ff", fontWeight: 600, letterSpacing: 0.4 }}>TÚ</span>
          )}
        </div>
        <div className="truncate" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
          {sys ? `${sys.icon} ${sys.name}` : member.role ?? "colaborador"}
        </div>
      </div>
      <div className="flex flex-col items-end" style={{ gap: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.6,
            padding: "2px 7px",
            borderRadius: 6,
            background: `${color}22`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {normalizeLetters(member.disc_letters) || "—"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          N{member.los_level ?? 1}
          {align && <span style={{ color: ALIGNMENT_ACTION[align].color }}> ●</span>}
        </span>
      </div>
    </button>
  );
}

// =============================================================
// Detalle del miembro
// =============================================================
function MemberDetail({
  member,
  draft,
  patch,
  editable,
  dirty,
  saving,
  savedFlash,
  onSave,
  testToken,
  testStatus,
  onGenerateLink,
  generating,
  onUploadPdf,
  uploadingPdf,
}: {
  member: Profile;
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
  dirty: boolean;
  saving: boolean;
  savedFlash: boolean;
  onSave: () => void;
  testToken: string | null;
  testStatus: string | null;
  onGenerateLink: () => void;
  generating: boolean;
  onUploadPdf: (file: File) => void;
  uploadingPdf: boolean;
}) {
  const primary = primaryLetter(draft.disc_letters);
  const factor = primary ? DISC_FACTORS[primary] : null;
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const sys = systemProfile(draft.disc_letters);
  const isSombra = draft.disc_state === "sombra";
  const align = draft.alignment as AlignmentValue | null;
  const suggestedAlign = computeAlignment(draft.cargo, draft.disc_letters);
  const kpiMissing = draft.kpi_name.trim() === "";
  const canSave = dirty && !saving && !kpiMissing;

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between" style={{ gap: 16 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: color,
                fontSize: 20,
                fontWeight: 700,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {initials(member.full_name)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
                {member.full_name ?? "Sin nombre"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                {member.email ?? member.role ?? "colaborador"}
              </div>
              {sys && (
                <div className="flex items-center" style={{ gap: 6, marginTop: 8, fontSize: 13, color }}>
                  <span style={{ fontSize: 16 }}>{sys.icon}</span>
                  <span style={{ fontWeight: 600 }}>{member.disc_name || sys.name}</span>
                </div>
              )}
            </div>
          </div>
          <StatusPill status={member.disc_status} />
        </div>
      </Card>

      {/* DISC */}
      <Card>
        <SectionTitle
          Icon={Users}
          label="Perfil DISC"
          color={color}
          hint="Cómo se comporta naturalmente y cómo liderarlo. Generá el link del test o cargá las letras del informe."
        />

        <Field label="Letras DISC (del informe — ej. SC, DI)">
          <input
            value={draft.disc_letters}
            disabled={!editable}
            onChange={(e) => patch({ disc_letters: e.target.value })}
            placeholder="—"
            maxLength={4}
            style={inputStyle}
          />
        </Field>

        <LettersHint raw={draft.disc_letters} />

        {editable && (
          <TestLinkBox
            token={testToken}
            status={testStatus}
            generating={generating}
            onGenerate={onGenerateLink}
          />
        )}

        {factor ? (
          <>
            {/* Barras de los 4 factores (énfasis en primario/secundario) */}
            <DiscBars letters={normalizeLetters(draft.disc_letters)} />

            {/* Toggle Luz / Sombra */}
            <div style={{ marginTop: 16 }}>
              <Label>Estado actual (evaluación del Arquitecto)</Label>
              <div className="flex" style={{ gap: 8, marginTop: 6 }}>
                <ToggleBtn
                  active={!isSombra}
                  disabled={!editable}
                  onClick={() => patch({ disc_state: "luz" })}
                  Icon={Sun}
                  label="Luz"
                  color="#fbbf24"
                />
                <ToggleBtn
                  active={isSombra}
                  disabled={!editable}
                  onClick={() => patch({ disc_state: "sombra" })}
                  Icon={Moon}
                  label="Sombra"
                  color="#a78bfa"
                />
              </div>
            </div>

            {/* Luz / Sombra descriptors */}
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <DescList
                title="Luz ☀️"
                items={factor.luz}
                tone="#34d399"
                dim={isSombra}
              />
              <DescList
                title="Sombra 🌑"
                items={factor.sombra}
                tone="#f87171"
                dim={!isSombra}
              />
            </div>

            {/* Cómo comunicarte */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 10,
                background: `${color}12`,
                border: `1px solid ${color}30`,
              }}
            >
              <div className="flex items-center" style={{ gap: 7, marginBottom: 6 }}>
                <Sparkles size={13} style={{ color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color }}>
                  Cómo liderar a {member.full_name?.split(" ")[0] ?? "esta persona"}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, margin: 0 }}>
                {factor.howToManage}
              </p>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 6, margin: "6px 0 0" }}>
                Bajo presión: {factor.underPressure}
              </p>
            </div>

            {/* Temor */}
            <Field label="Temor dominante (sugerido por perfil — editable)">
              <textarea
                value={draft.disc_temor}
                disabled={!editable}
                onChange={(e) => patch({ disc_temor: e.target.value })}
                placeholder={factor.temor}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Field>
          </>
        ) : (
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginTop: 12 }}>
            Ingresá las letras DISC (del informe) para ver Luz/Sombra, temores y guía de liderazgo.
          </p>
        )}
      </Card>

      {/* LOS */}
      <Card>
        <SectionTitle
          Icon={Gauge}
          label="Nivel LOS (autonomía)"
          color="#5b8aff"
          hint="Cuánta autonomía maneja hoy (N1 ejecuta → N5 socio) y la meta a la que querés llevarlo."
        />
        <LosLadder
          current={draft.los_level}
          target={draft.los_target}
          editable={editable}
          onSetCurrent={(lvl) => patch({ los_level: lvl })}
          onSetTarget={(lvl) => patch({ los_target: lvl === draft.los_target ? null : lvl })}
        />
      </Card>

      {/* Alineación + KPI */}
      <Card>
        <SectionTitle
          Icon={Target}
          label="Alineación rol ↔ perfil & KPI"
          color="#34d399"
          hint="Si su perfil natural encaja con el rol (Mantener / Desarrollar / Reubicar) y su número clave a medir."
        />

        <Field label="Área / función del rol (alimenta la alineación)">
          <input
            value={draft.cargo}
            disabled={!editable}
            onChange={(e) => patch({ cargo: e.target.value })}
            placeholder="Ej. Operaciones, Ventas, Finanzas"
            style={inputStyle}
          />
        </Field>

        <div style={{ marginTop: 14 }}>
          <Label>Alineación (¿el perfil natural calza con el rol?)</Label>
        </div>
        <div className="flex" style={{ gap: 8, marginTop: 6 }}>
          {(Object.keys(ALIGNMENT_ACTION) as AlignmentValue[]).map((key) => {
            const a = ALIGNMENT_ACTION[key];
            const on = align === key;
            return (
              <button
                key={key}
                type="button"
                disabled={!editable}
                onClick={() => patch({ alignment: on ? null : key })}
                className="flex-1 text-center transition-colors"
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  cursor: editable ? "pointer" : "default",
                  background: on ? `${a.color}1f` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${on ? `${a.color}55` : "rgba(255,255,255,0.07)"}`,
                  color: on ? a.color : "rgba(255,255,255,0.6)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.label}</div>
                <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>→ {a.action}</div>
              </button>
            );
          })}
        </div>

        {suggestedAlign && (
          <div
            className="flex items-center"
            style={{ gap: 8, marginTop: 10, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}
          >
            <Sparkles size={13} style={{ color: ALIGNMENT_ACTION[suggestedAlign].color }} />
            <span>
              Sugerido por perfil + área:{" "}
              <span style={{ color: ALIGNMENT_ACTION[suggestedAlign].color, fontWeight: 600 }}>
                {ALIGNMENT_ACTION[suggestedAlign].label} → {ALIGNMENT_ACTION[suggestedAlign].action}
              </span>
            </span>
            {editable && align !== suggestedAlign && (
              <button
                type="button"
                onClick={() => patch({ alignment: suggestedAlign })}
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: "rgba(91,138,255,0.18)",
                  border: "1px solid rgba(91,138,255,0.35)",
                  color: "#bcd0ff",
                }}
              >
                Aplicar
              </button>
            )}
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: "1fr 130px", gap: 12, marginTop: 16 }}>
          <Field label="KPI principal del rol (número único)">
            <input
              value={draft.kpi_name}
              disabled={!editable}
              onChange={(e) => patch({ kpi_name: e.target.value })}
              placeholder="Ej. Propuestas enviadas"
              style={inputStyle}
            />
          </Field>
          <Field label="Meta semanal">
            <input
              type="number"
              value={draft.kpi_weekly_target ?? ""}
              disabled={!editable}
              onChange={(e) =>
                patch({ kpi_weekly_target: e.target.value === "" ? null : Number(e.target.value) })
              }
              placeholder="10"
              style={inputStyle}
            />
          </Field>
        </div>
        {kpiMissing && (
          <div className="flex items-center" style={{ gap: 7, marginTop: 10, fontSize: 11.5, color: "#fbbf24" }}>
            <AlertTriangle size={13} />
            <span>
              <strong>Requerido para guardar:</strong> definí el KPI principal (número único). Si no se
              puede medir, el cargo es ambiguo (Ley de Pearson, S7).
            </span>
          </div>
        )}
      </Card>

      {/* PRIME + informe */}
      <Card>
        <SectionTitle
          Icon={FileText}
          label="Plan PRIME & informe"
          color="#a78bfa"
          hint="El salto de crecimiento de esta persona y el informe DISC profesional en PDF."
        />
        <Field label="Plan PRIME (el salto de crecimiento de esta persona)">
          <textarea
            value={draft.disc_prime_plan}
            disabled={!editable}
            onChange={(e) => patch({ disc_prime_plan: e.target.value })}
            placeholder="Del informe DISC: qué necesita para llegar a su PRIME."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
        <PdfReportBox
          pdfPath={member.disc_pdf_url}
          editable={editable}
          uploading={uploadingPdf}
          onUpload={onUploadPdf}
        />
      </Card>

      {/* Save bar */}
      {editable && (
        <div
          className="flex items-center justify-end"
          style={{ gap: 12, position: "sticky", bottom: 16, marginTop: 4 }}
        >
          {savedFlash && (
            <span className="flex items-center" style={{ gap: 6, fontSize: 12.5, color: "#34d399" }}>
              <Check size={14} /> Guardado
            </span>
          )}
          {dirty && kpiMissing && !savedFlash && (
            <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "#fbbf24" }}>
              <AlertTriangle size={13} /> Falta el KPI para poder guardar
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            title={kpiMissing ? "Definí el KPI principal del rol para guardar" : undefined}
            className="flex items-center transition-all"
            style={{
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: canSave ? "linear-gradient(180deg, #4f86ff, #2c5fe6)" : "rgba(255,255,255,0.06)",
              color: canSave ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: canSave ? "pointer" : "default",
              boxShadow: canSave ? "0 6px 18px rgba(54,114,255,0.3)" : "none",
            }}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Subcomponentes de presentación
// =============================================================
function DiscBars({ letters }: { letters: string }) {
  const primary = letters[0] as DiscLetter | undefined;
  const secondary = letters[1] as DiscLetter | undefined;
  const order: DiscLetter[] = ["D", "I", "S", "C"];
  return (
    <div className="flex flex-col" style={{ gap: 8, marginTop: 14 }}>
      {order.map((l) => {
        const pct = l === primary ? 100 : l === secondary ? 62 : 22;
        const f = DISC_FACTORS[l];
        const c = DISC_COLORS[l];
        const dim = l !== primary && l !== secondary;
        return (
          <div key={l} className="flex items-center" style={{ gap: 10, opacity: dim ? 0.45 : 1 }}>
            <span style={{ width: 14, fontSize: 12, fontWeight: 700, color: c }}>{l}</span>
            <span style={{ width: 138, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{f.shortName}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: c }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LosLadder({
  current,
  target,
  editable,
  onSetCurrent,
  onSetTarget,
}: {
  current: number;
  target: number | null;
  editable: boolean;
  onSetCurrent: (lvl: number) => void;
  onSetTarget: (lvl: number) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {LOS_LEVELS.map((lvl) => {
        const isCurrent = lvl.level === current;
        const isTarget = lvl.level === target;
        return (
          <div
            key={lvl.level}
            className="flex items-center"
            style={{
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: isCurrent
                ? "linear-gradient(135deg, rgba(91,138,255,0.18), rgba(91,138,255,0.04))"
                : "rgba(255,255,255,0.025)",
              border: `1px solid ${isCurrent ? "rgba(91,138,255,0.35)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: isCurrent ? "#5b8aff" : "rgba(255,255,255,0.06)",
                fontSize: 12.5,
                fontWeight: 700,
                color: isCurrent ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              N{lvl.level}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{lvl.name}</span>
                {isTarget && (
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#34d399", letterSpacing: 0.5 }}>
                    🎯 META
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{lvl.desc}</div>
            </div>
            {editable && (
              <div className="flex flex-col" style={{ gap: 3 }}>
                <MiniBtn active={isCurrent} onClick={() => onSetCurrent(lvl.level)} label="Actual" />
                <MiniBtn active={isTarget} onClick={() => onSetTarget(lvl.level)} label="Meta" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 5,
        cursor: "pointer",
        background: active ? "rgba(91,138,255,0.25)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(91,138,255,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#bcd0ff" : "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}

function DescList({ title, items, tone, dim }: { title: string; items: string[]; tone: string; dim: boolean }) {
  return (
    <div style={{ opacity: dim ? 0.4 : 1 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: tone, marginBottom: 7 }}>{title}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li
            key={i}
            className="flex"
            style={{ gap: 7, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.45, marginBottom: 5 }}
          >
            <span style={{ color: tone }}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToggleBtn({
  active,
  disabled,
  onClick,
  Icon,
  label,
  color,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center transition-colors"
      style={{
        flex: 1,
        gap: 8,
        padding: "9px 14px",
        borderRadius: 10,
        cursor: disabled ? "default" : "pointer",
        background: active ? `${color}1f` : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.07)"}`,
        color: active ? color : "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const key = status ?? "pendiente";
  const done = key === "completado";
  const color = done ? "#34d399" : key === "enviado" ? "#fbbf24" : "#64748b";
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        padding: "5px 11px",
        borderRadius: 99,
        background: `${color}1c`,
        border: `1px solid ${color}40`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {DISC_STATUS_LABEL[key] ?? key}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  Icon,
  label,
  color,
  hint,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-center" style={{ gap: 9 }}>
        <div
          className="flex items-center justify-center"
          style={{ width: 28, height: 28, borderRadius: 8, background: `${color}1c`, border: `1px solid ${color}33`, color }}
        >
          <Icon size={14} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      </div>
      {hint && (
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 6, marginLeft: 37, lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{children}</div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#fff",
  fontSize: 13,
  fontFamily: FONT,
  outline: "none",
};

function EmptyDetail() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        padding: "60px 20px",
        borderRadius: 16,
        border: "1px dashed rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.5)",
        minHeight: 320,
      }}
    >
      <Users size={32} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.6 }} />
      <p style={{ fontSize: 14 }}>Tu equipo todavía no tiene miembros.</p>
      <p style={{ fontSize: 12.5, marginTop: 6, maxWidth: 360 }}>
        Usá &quot;Invitar colaborador&quot;. Cuando acepten, vas a poder mapear su perfil DISC y nivel LOS aquí.
      </p>
    </div>
  );
}

// =============================================================
// Feedback en vivo del campo "Letras DISC"
// =============================================================
function LettersHint({ raw }: { raw: string }) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const norm = normalizeLetters(raw);

  // No quedó ninguna letra DISC válida.
  if (!norm) {
    return (
      <div
        className="flex items-start"
        style={{ gap: 7, marginTop: 8, fontSize: 11.5, color: "#f87171", lineHeight: 1.4 }}
      >
        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          No reconocí letras DISC. Usá solo <strong>D</strong>, <strong>I</strong>, <strong>S</strong> o{" "}
          <strong>C</strong> — por ejemplo <strong>SC</strong> o <strong>DI</strong>.
        </span>
      </div>
    );
  }

  const primary = primaryLetter(norm);
  const sys = systemProfile(norm);
  const dim = primary ? DISC_DIMENSIONS[primary] : null;
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  // ¿Se descartó algo de lo tipeado? (letras inválidas o más de 2)
  const dropped = norm !== trimmed.toUpperCase().replace(/\s/g, "");

  return (
    <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5 }}>
      <div className="flex items-center" style={{ gap: 7, flexWrap: "wrap" }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Se interpreta como</span>
        <span
          style={{
            fontWeight: 700,
            letterSpacing: 0.6,
            padding: "1px 7px",
            borderRadius: 6,
            background: `${color}22`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {norm}
        </span>
        {sys && (
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            {sys.icon} {sys.name}
          </span>
        )}
      </div>
      {dim && (
        <div style={{ color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
          Dominante: <span style={{ color }}>{dim.name}</span> — {dim.plain}
        </div>
      )}
      {dropped && (
        <div style={{ color: "#fbbf24", marginTop: 3 }}>
          Se usan solo las 2 primeras letras DISC válidas; el resto se ignora.
        </div>
      )}
    </div>
  );
}

// =============================================================
// Generar / mostrar link público de test DISC
// =============================================================
function TestLinkBox({
  token,
  status,
  generating,
  onGenerate,
}: {
  token: string | null;
  status: string | null;
  generating: boolean;
  onGenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const completed = status === "completado";
  const url =
    token && typeof window !== "undefined" ? `${window.location.origin}/disc/${token}` : token ? `/disc/${token}` : "";

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(91,138,255,0.08)",
        border: "1px solid rgba(91,138,255,0.22)",
      }}
    >
      <div className="flex items-center" style={{ gap: 7, marginBottom: completed ? 6 : token ? 8 : 8 }}>
        <Link2 size={13} style={{ color: "#9fb9ff" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9fb9ff" }}>
          {completed ? "Test DISC completado" : token ? "Link de test DISC" : "Evaluación DISC en la app"}
        </span>
      </div>

      {completed ? (
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
          La persona ya completó el test; su perfil se calculó y cargó automáticamente.
        </p>
      ) : token ? (
        <>
          <div className="flex items-center" style={{ gap: 8 }}>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              style={{ ...inputStyle, fontSize: 11.5 }}
            />
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                gap: 5,
                padding: "9px 12px",
                borderRadius: 9,
                cursor: "pointer",
                background: "rgba(91,138,255,0.2)",
                border: "1px solid rgba(91,138,255,0.4)",
                color: "#bcd0ff",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              background: "none",
              border: "none",
              cursor: generating ? "default" : "pointer",
              padding: 0,
            }}
          >
            {generating ? "Generando…" : "↻ Regenerar link (invalida el anterior)"}
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: "0 0 8px" }}>
            Generá un enlace para que la persona responda el test DISC (24 grupos). El perfil se calcula solo.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center"
            style={{
              gap: 7,
              padding: "8px 14px",
              borderRadius: 9,
              cursor: generating ? "default" : "pointer",
              background: "rgba(91,138,255,0.2)",
              border: "1px solid rgba(91,138,255,0.4)",
              color: "#bcd0ff",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Link2 size={14} /> {generating ? "Generando…" : "Generar link de test"}
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================
// Informe DISC en PDF (bucket privado → signed URL)
// =============================================================
function PdfReportBox({
  pdfPath,
  editable,
  uploading,
  onUpload,
}: {
  pdfPath: string | null;
  editable: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [opening, setOpening] = useState(false);

  async function view() {
    if (!pdfPath) return;
    if (/^https?:\/\//.test(pdfPath)) {
      window.open(pdfPath, "_blank");
      return;
    }
    setOpening(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.storage.from("disc-reports").createSignedUrl(pdfPath, 120);
      if (error || !data) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (e) {
      console.error("Error abriendo informe:", e);
      alert("No se pudo abrir el informe.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex items-center" style={{ gap: 12, marginTop: 6, flexWrap: "wrap" }}>
      {pdfPath ? (
        <button
          type="button"
          onClick={view}
          disabled={opening}
          className="inline-flex items-center transition-opacity hover:opacity-80"
          style={{
            gap: 7,
            fontSize: 12.5,
            color: "#9fb9ff",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <FileText size={14} /> {opening ? "Abriendo…" : "Ver informe DISC (PDF)"}
        </button>
      ) : (
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>Sin informe PDF cargado.</span>
      )}

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center"
            style={{
              gap: 6,
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 8,
              cursor: uploading ? "default" : "pointer",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <Upload size={13} /> {uploading ? "Subiendo…" : pdfPath ? "Reemplazar PDF" : "Subir informe PDF"}
          </button>
        </>
      )}
    </div>
  );
}

// =============================================================
// Modal: invitar colaborador (reusa invitations + OTP)
// =============================================================
function InviteModal({
  companyId,
  invitedBy,
  onClose,
  onDone,
}: {
  companyId: string;
  invitedBy: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function send() {
    if (!email.trim()) {
      setError("Ingresá un email.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const supabase = createBrowserClient();
      const { error: invErr } = await supabase.from("invitations").insert({
        company_id: companyId,
        invited_by: invitedBy,
        email: email.trim(),
        role: "colaborador",
      });
      if (invErr) throw invErr;

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/accept-invite?company=${companyId}`,
        },
      });
      if (otpErr) throw otpErr;

      setSent(true);
      setTimeout(onDone, 1200);
    } catch (e) {
      console.error("Error invitando:", e);
      setError("No se pudo enviar la invitación. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ position: "fixed", inset: 0, background: "rgba(5,10,20,0.7)", zIndex: 50, padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "24px 24px 22px",
          borderRadius: 16,
          background: "#0F1B2D",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>Invitar colaborador</h3>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              Le llega un email con un link mágico para unirse a tu equipo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="flex items-center" style={{ gap: 8, fontSize: 13.5, color: "#34d399", padding: "8px 0" }}>
            <Check size={16} /> Invitación enviada a {email.trim()}.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@empresa.com"
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && send()}
              autoFocus
            />
            {error && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>{error}</div>
            )}
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="flex items-center justify-center"
              style={{
                width: "100%",
                marginTop: 14,
                gap: 8,
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(180deg, #4f86ff, #2c5fe6)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: sending ? "default" : "pointer",
              }}
            >
              <Send size={15} /> {sending ? "Enviando…" : "Enviar invitación"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
