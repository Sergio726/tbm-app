"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Lock, CheckCircle, Clock } from "lucide-react";
import { SESSIONS } from "@/lib/workbook-sessions";
import { isSessionUnlocked, daysUntilUnlock } from "@/lib/workbook-sessions";
import type { WorkbookProgress } from "@/types/database";

interface Props {
  allProgress: WorkbookProgress[];
}

export function SessionsGrid({ allProgress }: Props) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SESSIONS.map((session) => {
        const progress = allProgress.find((p) => p.session_number === session.number);
        const unlocked = isSessionUnlocked(session.number, allProgress);
        const pct = progress?.pct_complete ?? 0;
        const days = daysUntilUnlock(session.number, allProgress);
        const completed = unlocked && pct === 100;
        const dayInSession = progress?.unlocked_at
          ? Math.min(7, Math.floor((Date.now() - new Date(progress.unlocked_at).getTime()) / 86_400_000) + 1)
          : null;

        const handleClick = () => {
          if (unlocked) router.push(`/workbooks/${session.number}`);
        };

        return (
          <div
            key={session.number}
            onClick={handleClick}
            className="rounded-2xl border p-5 transition-all"
            style={{
              background: unlocked
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.02)",
              borderColor: completed
                ? "rgba(52,211,153,0.3)"
                : unlocked
                ? "rgba(91,138,255,0.2)"
                : "rgba(255,255,255,0.06)",
              cursor: unlocked ? "pointer" : "default",
              opacity: unlocked ? 1 : 0.65,
            }}
            onMouseEnter={(e) => {
              if (unlocked)
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              if (unlocked)
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: completed
                    ? "rgba(52,211,153,0.15)"
                    : unlocked
                    ? "rgba(91,138,255,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: completed
                    ? "1px solid rgba(52,211,153,0.3)"
                    : unlocked
                    ? "1px solid rgba(91,138,255,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {!unlocked ? (
                  <Lock size={16} color="rgba(255,255,255,0.35)" />
                ) : completed ? (
                  <CheckCircle size={16} color="#34d399" />
                ) : (
                  <BookOpen size={16} color="#9fb9ff" />
                )}
              </div>

              {/* Badge */}
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={
                  completed
                    ? { background: "rgba(52,211,153,0.15)", color: "#34d399" }
                    : unlocked
                    ? { background: "rgba(91,138,255,0.15)", color: "#9fb9ff" }
                    : days > 0
                    ? {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.62)",
                      }
                    : {
                        background: "rgba(251,191,36,0.1)",
                        color: "#fbbf24",
                      }
                }
              >
                {completed
                  ? "Completada"
                  : unlocked
                  ? "En curso"
                  : days > 0
                  ? `Bloqueada · ${days}d`
                  : "Lista para desbloquear"}
              </span>
            </div>

            <div className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.62)" }}>
              Sesión {session.number}
            </div>
            <h3 className="mb-1 text-base font-bold text-white">{session.title}</h3>
            <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
              {session.subtitle}
            </p>

            {/* Progress bar */}
            {unlocked && (
              <>
                <div
                  className="mb-2 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: completed
                        ? "#34d399"
                        : "linear-gradient(90deg, #5b8aff, #9fb9ff)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.62)" }}>
                  <span>{pct}% completado</span>
                  {dayInSession !== null && !completed && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      Día {dayInSession}/7
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
