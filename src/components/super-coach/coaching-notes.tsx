"use client";

import { useState, useTransition } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { CoachingNote } from "@/types/database";
import { timeAgo } from "@/lib/notifications";

/**
 * Capa 3 del Panel Super Coach: canal de notas de coaching.
 * El coach deja una nota; los arquitectos de la empresa la ven en
 * /notificaciones (y la nota queda en coaching_notes para el historial).
 */
export function CoachingNotes({
  companyId,
  coachId,
  initialNotes,
  teamArquitectos,
}: {
  companyId: string;
  coachId: string;
  initialNotes: CoachingNote[];
  teamArquitectos: string[];
}) {
  const supabase = createBrowserClient();
  const [notes, setNotes] = useState<CoachingNote[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const send = () => {
    const text = draft.trim();
    if (!text || isPending) return;
    setError(null);

    startTransition(async () => {
      const { data, error: err } = await supabase
        .from("coaching_notes")
        .insert({ company_id: companyId, coach_id: coachId, note: text })
        .select()
        .single();
      if (err || !data) {
        setError("No se pudo guardar la nota. Intentá de nuevo.");
        return;
      }
      setNotes((prev) => [data as CoachingNote, ...prev]);
      setDraft("");

      // Notificar a los arquitectos de la empresa (no bloqueante)
      if (teamArquitectos.length > 0) {
        try {
          await supabase.from("notifications").insert(
            teamArquitectos.map((userId) => ({
              company_id: companyId,
              user_id: userId,
              type: "coaching_note",
              title: "Nota de tu coach",
              body: text.slice(0, 120),
              href: "/notificaciones",
            }))
          );
        } catch (e) {
          console.error("Notificación coaching_note falló (no bloqueante):", e);
        }
      }
    });
  };

  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareText size={15} strokeWidth={1.9} style={{ color: "#34d399" }} />
        <h2 className="m-0 text-[13px] font-bold uppercase tracking-[1.2px] text-white/55">
          Notas de coaching
        </h2>
      </div>

      {/* Form */}
      <div
        className="mb-3 rounded-2xl border p-4"
        style={{
          background: "rgba(52,211,153,0.04)",
          borderColor: "rgba(52,211,153,0.20)",
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Dejá una observación para el Arquitecto: qué está funcionando, qué ajustar esta semana…"
          className="w-full resize-y rounded-xl border bg-transparent p-3 text-sm leading-relaxed text-white outline-none"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.09)",
          }}
        />
        {error && (
          <p className="mt-2 text-[12px]" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11.5px] text-white/40">
            El Arquitecto la recibe como notificación.
          </span>
          <button
            type="button"
            onClick={send}
            disabled={isPending || !draft.trim()}
            className="inline-flex items-center gap-2 rounded-xl border-0 px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              color: "#04241a",
            }}
          >
            <Send size={13} strokeWidth={2.2} />
            {isPending ? "Enviando…" : "Enviar nota"}
          </button>
        </div>
      </div>

      {/* Historial */}
      {notes.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-4 text-center text-[12.5px] text-white/40"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          Sin notas todavía. La primera observación marca el tono del acompañamiento.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <p className="m-0 text-[13px] leading-relaxed text-white/80">
                {n.note}
              </p>
              <span className="mt-1.5 block text-[11px] text-white/35">
                {timeAgo(n.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
