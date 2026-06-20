"use client";

import { MessageSquare } from "lucide-react";
import type { Feedback, Profile } from "@/types/database";
import { FeedbackMetrics } from "./feedback-metrics";
import { FeedbackCard } from "./feedback-card";

interface FeedbackHistoryProps {
  member: Profile | null;
  feedbacks: Feedback[];
  onDeliver: (id: string) => void;
  deliveringId: string | null;
}

export function FeedbackHistory({
  member,
  feedbacks,
  onDeliver,
  deliveringId,
}: FeedbackHistoryProps) {
  if (!member) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center rounded-2xl border py-16 text-center"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
          minHeight: 300,
        }}
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: "rgba(91,138,255,0.1)",
            border: "1px solid rgba(91,138,255,0.2)",
          }}
        >
          <MessageSquare size={22} strokeWidth={1.5} style={{ color: "#5b8aff" }} />
        </div>
        <p
          className="font-semibold text-white"
          style={{ fontSize: 15, marginBottom: 6 }}
        >
          Historial de feedbacks
        </p>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 260,
            lineHeight: 1.6,
          }}
        >
          Seleccioná un colaborador para ver su historial y balance S/E/C.
        </p>
      </div>
    );
  }

  const memberFeedbacks = feedbacks.filter((f) => f.to_user === member.id);
  const initials = (member.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Member mini-header */}
      <div
        className="flex items-center gap-3 rounded-xl border p-4"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ background: "rgba(91,138,255,0.2)", color: "#9fb9ff" }}
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-white" style={{ fontSize: 14 }}>
            {member.full_name}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {member.cargo ?? "Sin cargo"} · {memberFeedbacks.length} feedback
            {memberFeedbacks.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <FeedbackMetrics feedbacks={memberFeedbacks} />

      {/* Timeline */}
      {memberFeedbacks.length === 0 ? (
        <div
          className="rounded-xl border py-10 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Sin feedbacks todavía.
            <br />
            Construí el primero usando el panel izquierdo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {memberFeedbacks.map((fb) => (
            <FeedbackCard
              key={fb.id}
              feedback={fb}
              onDeliver={onDeliver}
              delivering={deliveringId === fb.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
