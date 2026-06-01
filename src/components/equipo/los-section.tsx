"use client";

import { Gauge, Zap, Lock } from "lucide-react";
import { LOS_LEVELS } from "@/lib/disc";
import { Card, SectionTitle, MiniBtn } from "./primitives";
import type { Draft } from "./types";

export function LosSection({
  draft,
  patch,
  editable,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
}) {
  const jump = draft.los_target ? draft.los_target - draft.los_level : 0;

  return (
    <Card>
      <div
        className="flex items-start justify-between"
        style={{ gap: 12, marginBottom: 4 }}
      >
        <SectionTitle
          Icon={Gauge}
          label="Nivel LOS · ruta de autonomía"
          color="#5b8aff"
          hint="Cuánta autonomía maneja hoy (N1 ejecuta → N5 socio) y la meta a la que querés llevarlo."
        />
        {jump > 0 && (
          <span
            className="flex items-center"
            style={{
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.35)",
              color: "#fbbf24",
              whiteSpace: "nowrap",
              marginTop: 4,
            }}
          >
            <Zap size={11} /> subir {jump} nivel{jump === 1 ? "" : "es"}
          </span>
        )}
      </div>

      <LosLadderHorizontal current={draft.los_level} target={draft.los_target} />

      <div className="flex flex-col" style={{ gap: 8, marginTop: 18 }}>
        {LOS_LEVELS.map((lvl) => {
          const isCurrent = lvl.level === draft.los_level;
          const isTarget = lvl.level === draft.los_target;
          const locked = lvl.level === 5; // por convención, "Socio" se desbloquea con criterio externo
          return (
            <LosRow
              key={lvl.level}
              level={lvl.level}
              name={lvl.name}
              desc={lvl.desc}
              isCurrent={isCurrent}
              isTarget={isTarget}
              editable={editable}
              locked={locked && !isCurrent && !isTarget}
              onSetCurrent={() => patch({ los_level: lvl.level })}
              onSetTarget={() =>
                patch({ los_target: isTarget ? null : lvl.level })
              }
            />
          );
        })}
      </div>
    </Card>
  );
}

function LosLadderHorizontal({
  current,
  target,
}: {
  current: number;
  target: number | null;
}) {
  return (
    <div className="flex items-center" style={{ gap: 0, marginTop: 14, padding: "12px 4px" }}>
      {LOS_LEVELS.map((lvl, i) => {
        const isCurrent = lvl.level === current;
        const isTarget = lvl.level === target;
        const isPath =
          target != null && lvl.level >= current && lvl.level <= target;

        return (
          <div
            key={lvl.level}
            className="flex flex-col items-center"
            style={{ flex: 1, position: "relative" }}
          >
            {i < LOS_LEVELS.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 24,
                  left: "50%",
                  right: "-50%",
                  height: 2,
                  background: isPath
                    ? "repeating-linear-gradient(to right, #fbbf24 0, #fbbf24 5px, transparent 5px, transparent 9px)"
                    : "rgba(255,255,255,0.08)",
                  zIndex: 0,
                }}
              />
            )}
            {isCurrent && (
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#bcd0ff",
                  letterSpacing: 0.7,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                Estás acá
              </span>
            )}
            {!isCurrent && isTarget && (
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#fbbf24",
                  letterSpacing: 0.7,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                🎯 Meta
              </span>
            )}
            {!isCurrent && !isTarget && (
              <span style={{ height: 16, marginBottom: 4 }} />
            )}
            <div
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isCurrent
                  ? "#5b8aff"
                  : isTarget
                    ? "rgba(251,191,36,0.18)"
                    : "rgba(255,255,255,0.04)",
                border: isCurrent
                  ? "2px solid rgba(91,138,255,0.7)"
                  : isTarget
                    ? "2px solid #fbbf24"
                    : "1px solid rgba(255,255,255,0.10)",
                color: isCurrent
                  ? "#fff"
                  : isTarget
                    ? "#fbbf24"
                    : "rgba(255,255,255,0.5)",
                fontSize: 11.5,
                fontWeight: 700,
                zIndex: 1,
                boxShadow: isCurrent
                  ? "0 0 16px rgba(91,138,255,0.5)"
                  : isTarget
                    ? "0 0 12px rgba(251,191,36,0.35)"
                    : "none",
              }}
            >
              N{lvl.level}
            </div>
            <span
              style={{
                fontSize: 10.5,
                color: isCurrent || isTarget ? "#fff" : "rgba(255,255,255,0.5)",
                marginTop: 4,
                fontWeight: isCurrent || isTarget ? 600 : 400,
              }}
            >
              {lvl.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LosRow({
  level,
  name,
  desc,
  isCurrent,
  isTarget,
  editable,
  locked,
  onSetCurrent,
  onSetTarget,
}: {
  level: number;
  name: string;
  desc: string;
  isCurrent: boolean;
  isTarget: boolean;
  editable: boolean;
  locked: boolean;
  onSetCurrent: () => void;
  onSetTarget: () => void;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        background: isCurrent
          ? "linear-gradient(135deg, rgba(91,138,255,0.18), rgba(91,138,255,0.04))"
          : isTarget
            ? "rgba(251,191,36,0.05)"
            : "rgba(255,255,255,0.025)",
        border: `1px solid ${
          isCurrent
            ? "rgba(91,138,255,0.35)"
            : isTarget
              ? "rgba(251,191,36,0.30)"
              : "rgba(255,255,255,0.06)"
        }`,
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
        N{level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center" style={{ gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
          {locked && <Lock size={11} color="rgba(255,255,255,0.35)" />}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
          {desc}
        </div>
      </div>
      {editable && (
        <div className="flex items-center" style={{ gap: 6 }}>
          <MiniBtn active={isCurrent} onClick={onSetCurrent} label="Actual" />
          <MiniBtn
            active={isTarget}
            onClick={onSetTarget}
            label="Meta"
            color="#fbbf24"
          />
        </div>
      )}
    </div>
  );
}
