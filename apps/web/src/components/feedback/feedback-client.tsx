"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { MessageSquare, ChevronRight } from "lucide-react";
import type { Profile, Feedback, FeedbackType } from "@/types/database";
import { createBrowserClient } from "@/lib/supabase/client";
import { primaryLetter } from "@/lib/disc";
import { FEEDBACK_TEMPLATES, SEC_CONFIG } from "@/lib/feedback";
import { EmptyState } from "@/components/ui/empty-state";
import { MemberSelector } from "./member-selector";
import { SecTypeSelector } from "./sec-type-selector";
import { FeedbackBuilder } from "./feedback-builder";
import { FeedbackHistory } from "./feedback-history";

interface FeedbackClientProps {
  currentProfile: Profile;
  team: Profile[];
  initialFeedbacks: Feedback[];
}

export function FeedbackClient({
  currentProfile,
  team,
  initialFeedbacks,
}: FeedbackClientProps) {
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [content, setContent] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [isPending, startTransition] = useTransition();
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ref guards against double-click race (isPending flips async)
  const isSubmittingRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(successTimerRef.current);
      clearTimeout(errorTimerRef.current);
    },
    []
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg(null);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 4000);
  };

  const handleSelectMember = (m: Profile) => {
    setSelectedMember(m);
    setFeedbackType(null);
    setContent("");
  };

  const handleTypeChange = (type: FeedbackType) => {
    setFeedbackType(type);
    setContent(FEEDBACK_TEMPLATES[type]);
  };

  const handleSaveDraft = () => {
    if (
      !selectedMember ||
      !feedbackType ||
      !content.trim() ||
      isSubmittingRef.current
    )
      return;

    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const discLetter = primaryLetter(selectedMember.disc_letters);
        const { data, error } = await supabase
          .from("feedbacks")
          .insert({
            company_id: currentProfile.company_id!,
            from_user: currentProfile.id,
            to_user: selectedMember.id,
            type: feedbackType,
            content: content.trim(),
            disc_profile_target: discLetter,
            is_draft: true,
          })
          .select()
          .single();

        if (error) {
          showError("Error al guardar el borrador. Intentá de nuevo.");
        } else if (data) {
          setFeedbacks((prev) => [data as Feedback, ...prev]);
          setContent("");
          setFeedbackType(null);
          showSuccess("Borrador guardado");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleDeliver = () => {
    if (
      !selectedMember ||
      !feedbackType ||
      !content.trim() ||
      isSubmittingRef.current
    )
      return;

    isSubmittingRef.current = true;
    startTransition(async () => {
      try {
        const supabase = createBrowserClient();
        const discLetter = primaryLetter(selectedMember.disc_letters);
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("feedbacks")
          .insert({
            company_id: currentProfile.company_id!,
            from_user: currentProfile.id,
            to_user: selectedMember.id,
            type: feedbackType,
            content: content.trim(),
            disc_profile_target: discLetter,
            is_draft: false,
            delivered_at: now,
          })
          .select()
          .single();

        if (error) {
          showError("Error al entregar el feedback. Intentá de nuevo.");
        } else if (data) {
          setFeedbacks((prev) => [data as Feedback, ...prev]);
          setContent("");
          setFeedbackType(null);
          showSuccess("Feedback marcado como entregado ✓");
        }
      } finally {
        isSubmittingRef.current = false;
      }
    });
  };

  const handleDeliverExisting = async (feedbackId: string) => {
    setDeliveringId(feedbackId);
    const now = new Date().toISOString();
    const supabase = createBrowserClient();
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ is_draft: false, delivered_at: now })
        .eq("id", feedbackId);

      if (error) {
        showError("Error al marcar como entregado. Intentá de nuevo.");
      } else {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === feedbackId
              ? { ...f, is_draft: false, delivered_at: now }
              : f
          )
        );
        showSuccess("Feedback entregado ✓");
      }
    } catch {
      showError("Error de conexión. Intentá de nuevo.");
    } finally {
      setDeliveringId(null);
    }
  };

  // Sin colaboradores todavía: el feedback se da al equipo → guía a sumar gente.
  if (team.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(180deg, var(--bg) 0%, var(--bg) 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
        }}
      >
        <EmptyState
          icon={<MessageSquare size={30} strokeWidth={1.4} />}
          title="Todavía no tenés a quién darle feedback"
          hint="El feedback S.E.C. se da a los miembros de tu equipo. Sumá tu primer colaborador para empezar."
          cta={{ label: "Ir a Mi Equipo", href: "/equipo" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, var(--bg) 0%, var(--bg) 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "var(--accent-text)",
            }}
          >
            <MessageSquare size={18} strokeWidth={1.6} />
          </div>
          <h1
            className="text-fg"
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}
          >
            Feedback S.E.C.
          </h1>
        </div>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", marginLeft: 52 }}>
          Sostener · Elevar · Corregir — nunca más improvisar un feedback
        </p>
      </div>

      {/* Toasts */}
      {successMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(52,211,153,0.1)",
            borderColor: "rgba(52,211,153,0.3)",
            color: "var(--success-text)",
            fontSize: 13.5,
          }}
        >
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div
          className="mb-4 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(248,113,113,0.1)",
            borderColor: "rgba(248,113,113,0.3)",
            color: "var(--danger-text)",
            fontSize: 13.5,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Two-column layout — responsive: stacks on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ alignItems: "start" }}>
        {/* LEFT: Constructor */}
        <div className="flex flex-col gap-5">
          <Section
            step={1}
            title="¿A quién?"
            done={!!selectedMember}
            doneLabel={selectedMember?.full_name ?? undefined}
          >
            <MemberSelector
              team={team}
              selected={selectedMember}
              onSelect={handleSelectMember}
            />
          </Section>

          {selectedMember && (
            <Section
              step={2}
              title="¿Qué tipo de feedback?"
              done={!!feedbackType}
              doneLabel={feedbackType ? SEC_CONFIG[feedbackType].label : undefined}
            >
              <SecTypeSelector value={feedbackType} onChange={handleTypeChange} />
            </Section>
          )}

          {selectedMember && feedbackType && (
            <Section step={3} title="Escribí el feedback">
              <FeedbackBuilder
                member={selectedMember}
                feedbackType={feedbackType}
                content={content}
                onChange={setContent}
                onSaveDraft={handleSaveDraft}
                onDeliver={handleDeliver}
                isPending={isPending}
              />
            </Section>
          )}
        </div>

        {/* RIGHT: History */}
        <div>
          <FeedbackHistory
            member={selectedMember}
            feedbacks={feedbacks}
            onDeliver={handleDeliverExisting}
            deliveringId={deliveringId}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  step,
  title,
  done,
  doneLabel,
  children,
}: {
  step: number;
  title: string;
  done?: boolean;
  doneLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: done ? "rgba(91,138,255,0.2)" : "rgba(255,255,255,0.07)",
        background: "var(--elevated)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: done ? "rgba(91,138,255,0.25)" : "rgba(255,255,255,0.08)",
            color: done ? "#9fb9ff" : "rgba(255,255,255,0.4)",
          }}
        >
          {step}
        </div>
        <p className="font-semibold text-fg" style={{ fontSize: 13.5 }}>
          {title}
        </p>
        {done && doneLabel && (
          <>
            <ChevronRight size={13} style={{ color: "var(--fg-muted)" }} />
            <span style={{ fontSize: 12.5, color: "var(--accent-text)" }}>{doneLabel}</span>
          </>
        )}
      </div>
      {children}
    </div>
  );
}
