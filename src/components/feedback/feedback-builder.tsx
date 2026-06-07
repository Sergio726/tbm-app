"use client";

import { CheckCircle, Save } from "lucide-react";
import type { Profile, FeedbackType } from "@/types/database";
import { primaryLetter } from "@/lib/disc";
import { SEC_CONFIG } from "@/lib/feedback";
import { DiscToneGuide } from "./disc-tone-guide";

interface FeedbackBuilderProps {
  member: Profile;
  feedbackType: FeedbackType;
  content: string;
  onChange: (c: string) => void;
  onSaveDraft: () => void;
  onDeliver: () => void;
  isPending: boolean;
}

export function FeedbackBuilder({
  member,
  feedbackType,
  content,
  onChange,
  onSaveDraft,
  onDeliver,
  isPending,
}: FeedbackBuilderProps) {
  const cfg = SEC_CONFIG[feedbackType];
  const discLetter = primaryLetter(member.disc_letters);
  const isEmpty = content.trim().length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Tone guide */}
      <DiscToneGuide feedbackType={feedbackType} discLetter={discLetter} />

      {/* Textarea */}
      <div>
        <label
          className="mb-2 block text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Feedback para {member.full_name?.split(" ")[0] ?? "este colaborador"}
        </label>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Editá el template o escribí tu propio feedback…"
          className="w-full resize-y rounded-xl border bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors"
          style={{
            borderColor: isEmpty
              ? "rgba(255,255,255,0.08)"
              : `${cfg.color}44`,
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.7,
            minHeight: 120,
          }}
        />
        <p className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          Template pre-cargado según el tipo. Editá libremente — no hay límite de caracteres.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSaveDraft}
          disabled={isPending || isEmpty}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <Save size={15} strokeWidth={2} />
          {isPending ? "Guardando…" : "Guardar borrador"}
        </button>

        <button
          onClick={onDeliver}
          disabled={isPending || isEmpty}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color}99)`,
            boxShadow: `0 4px 14px ${cfg.color}33`,
          }}
        >
          <CheckCircle size={15} strokeWidth={2} />
          {isPending ? "Guardando…" : "Marcar como entregado"}
        </button>
      </div>
    </div>
  );
}
