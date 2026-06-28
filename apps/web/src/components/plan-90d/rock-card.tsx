"use client";

import { useState } from "react";
import { TrendingUp, CheckCircle2, XCircle, Archive, Clock } from "lucide-react";
import type { Rock, Profile } from "@/types/database";
import { daysSince, daysLeft, rockProgressColor, formatShortDate } from "@/lib/plan90d";
import { ProgressModal } from "./progress-modal";

interface RockCardProps {
  rock: Rock;
  team: Pick<Profile, "id" | "full_name">[];
  isPending: boolean;
  onUpdateProgress: (rockId: string, progress: number, note: string) => void;
  onUpdateStatus: (rockId: string, status: string) => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={13} style={{ color: "#34d399" }} />,
  failed: <XCircle size={13} style={{ color: "#f87171" }} />,
  archived: <Archive size={13} style={{ color: "rgba(255,255,255,0.62)" }} />,
  active: <Clock size={13} style={{ color: "#9fb9ff" }} />,
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  completed: "Completada",
  failed: "Fallida",
  archived: "Archivada",
};

export function RockCard({ rock, team, isPending, onUpdateProgress, onUpdateStatus }: RockCardProps) {
  const [showProgress, setShowProgress] = useState(false);

  const owner = team.find((m) => m.id === rock.owner_id);
  const ownerInitials = owner?.full_name
    ? owner.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const dayNum = daysSince(rock.start_date);
  const remaining = daysLeft(rock.end_date);
  const isActive = rock.status === "active";
  const color = rockProgressColor(rock.progress);

  return (
    <>
      <div
        className="rounded-2xl border p-4 flex flex-col gap-3 transition-colors"
        style={{
          borderColor: isActive ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
          background: isActive ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
          opacity: isActive ? 1 : 0.65,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-white leading-snug"
              style={{ fontSize: 14 }}
            >
              {rock.title}
            </p>
            {rock.success_criteria && (
              <p
                className="mt-1 line-clamp-2"
                style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.5 }}
              >
                {rock.success_criteria}
              </p>
            )}
          </div>
          {/* Owner badge */}
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{
              background: "rgba(91,138,255,0.2)",
              color: "#9fb9ff",
              border: "1px solid rgba(91,138,255,0.3)",
            }}
            title={owner?.full_name ?? "Sin dueño"}
          >
            {ownerInitials}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold tabular-nums" style={{ color }}>
              {rock.progress}%
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
              {isActive ? `Día ${dayNum} de 90` : STATUS_LABELS[rock.status]}
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${rock.progress}%`, background: color }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STATUS_ICONS[rock.status]}
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.62)" }}>
              {isActive
                ? remaining > 0
                  ? `${remaining}d restantes`
                  : "Vence hoy"
                : `${formatShortDate(rock.start_date)} – ${formatShortDate(rock.end_date)}`}
            </span>
          </div>

          {isActive && (
            <div className="flex items-center gap-2">
              {rock.progress < 100 && (
                <button
                  onClick={() => setShowProgress(true)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
                  style={{
                    background: "rgba(91,138,255,0.12)",
                    border: "1px solid rgba(91,138,255,0.2)",
                    color: "#9fb9ff",
                  }}
                >
                  <TrendingUp size={11} strokeWidth={2} />
                  Actualizar
                </button>
              )}
              {rock.progress === 100 && (
                <button
                  onClick={() => onUpdateStatus(rock.id, "completed")}
                  disabled={isPending}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    color: "#34d399",
                  }}
                >
                  Marcar completada
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showProgress && (
        <ProgressModal
          rockTitle={rock.title}
          currentProgress={rock.progress}
          isPending={isPending}
          onSubmit={(p, n) => {
            onUpdateProgress(rock.id, p, n);
            setShowProgress(false);
          }}
          onClose={() => setShowProgress(false)}
        />
      )}
    </>
  );
}
