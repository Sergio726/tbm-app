"use client";

import { User, Sun, Moon, Compass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, DISC_FACTORS, normalizeLetters } from "@/lib/disc";
import {
  Panel,
  FieldLabel,
  TextInput,
  TextAreaInput,
} from "./primitives";
import { LettersHintBox } from "./letters-hint";
import { TestLinkBox } from "./test-link-box";
import { DiscRadar } from "./disc-radar";
import { DiscBars } from "./disc-bars";
import {
  archetypeFor,
  effectiveScores,
  MONO,
  type DiscScoresShape,
  type Draft,
} from "./types";

export function DiscSection({
  member,
  draft,
  patch,
  editable,
  scores,
  testToken,
  testStatus,
  onGenerateLink,
  generating,
}: {
  member: Profile;
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
  scores: DiscScoresShape;
  testToken: string | null;
  testStatus: string | null;
  onGenerateLink: () => void;
  generating: boolean;
}) {
  const code = normalizeLetters(draft.disc_letters);
  const arch = archetypeFor(code);
  const primary = arch.primary;
  const accent = DISC_COLORS[primary] ?? "#f87171";
  const factor = DISC_FACTORS[primary];
  const isSombra = draft.disc_state === "sombra";
  const pctScores = effectiveScores(scores, code);

  return (
    <Panel
      icon={<User size={18} strokeWidth={1.9} />}
      iconColor={accent}
      accent={accent}
      title="Perfil DISC"
      sub="Cómo se comporta naturalmente y cómo liderarlo. Generá el link del test o cargá las letras del informe."
    >
      {/* letters input + interpretation */}
      <div className="mb-[18px] grid items-start gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <FieldLabel hint="ej. SC, DI">Letras DISC</FieldLabel>
          <TextInput
            value={draft.disc_letters}
            disabled={!editable}
            maxLength={2}
            onChange={(e) =>
              patch({
                disc_letters: e.target.value.toUpperCase().replace(/[^DISC]/g, ""),
              })
            }
            className="text-center"
            style={{
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              padding: 12,
            }}
          />
        </div>
        <LettersHintBox raw={draft.disc_letters} />
      </div>

      {/* Test DISC callout */}
      {editable && (
        <TestLinkBox
          token={testToken}
          status={testStatus}
          generating={generating}
          onGenerate={onGenerateLink}
        />
      )}

      {code ? (
        <>
          {/* radar + stat bars */}
          <div className="mb-[22px] grid items-center gap-5 md:grid-cols-[230px_minmax(0,1fr)]">
            <div
              className="rounded-[14px] border border-white/[0.05] p-3"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(91,138,255,0.07), transparent 70%)",
              }}
            >
              <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-[1.2px] text-white/40">
                Atributos base
              </div>
              <DiscRadar scores={pctScores} primary={primary} />
            </div>
            <DiscBars scores={pctScores} primary={primary} />
          </div>

          {/* Luz / Sombra toggle */}
          <FieldLabel>Estado actual (evaluación del Arquitecto)</FieldLabel>
          <div className="grid grid-cols-2 gap-2.5">
            <LuzSombraButton
              active={!isSombra}
              disabled={!editable}
              onClick={() => patch({ disc_state: "luz" })}
              Icon={Sun}
              label="Luz"
              color="#fbbf24"
            />
            <LuzSombraButton
              active={isSombra}
              disabled={!editable}
              onClick={() => patch({ disc_state: "sombra" })}
              Icon={Moon}
              label="Sombra"
              color="#a78bfa"
            />
          </div>

          <div className="mt-3.5 flex gap-3">
            <SideList
              title="Luz"
              Icon={Sun}
              color="#fbbf24"
              items={factor.luz}
              dim={isSombra}
            />
            <SideList
              title="Sombra"
              Icon={Moon}
              color="#a78bfa"
              items={factor.sombra}
              dim={!isSombra}
            />
          </div>

          {/* Cómo liderar */}
          <div
            className="mt-[18px] rounded-[14px] border px-4.5 py-4"
            style={{
              background: `${accent}0e`,
              borderColor: `${accent}30`,
              padding: "16px 18px",
            }}
          >
            <div className="mb-2 flex items-center gap-2 text-[13px] font-bold" style={{ color: accent }}>
              <Compass size={16} strokeWidth={1.9} />
              Cómo liderar a {member.full_name?.split(" ")[0] ?? "esta persona"} · estrategia
            </div>
            <div className="mb-1.5 text-[13.5px] font-semibold leading-snug text-white">
              {factor.howToManage}
            </div>
            <div className="text-[12.5px] leading-snug text-white/60">
              Bajo presión: {factor.underPressure}
            </div>
          </div>

          {/* Temor */}
          <div className="mt-[18px]">
            <FieldLabel hint="sugerido por perfil — editable">Temor dominante</FieldLabel>
            <TextAreaInput
              value={draft.disc_temor || factor.temor}
              disabled={!editable}
              onChange={(e) => patch({ disc_temor: e.target.value })}
              rows={2}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 text-[12.5px] text-white/45">
          Ingresá las letras DISC (del informe) para ver Luz/Sombra, temores y guía de
          liderazgo.
        </p>
      )}
    </Panel>
  );
}

function LuzSombraButton({
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
      className="flex items-center justify-center gap-2.5 rounded-xl border px-3 py-3.5 text-[14px] font-semibold transition disabled:cursor-default"
      style={{
        background: active ? `${color}1c` : "rgba(255,255,255,0.03)",
        borderColor: active ? `${color}66` : "rgba(255,255,255,0.08)",
        color: active ? color : "rgba(255,255,255,0.55)",
        boxShadow: active ? `0 0 18px ${color}26` : "none",
      }}
    >
      <Icon size={17} strokeWidth={1.9} />
      {label}
    </button>
  );
}

function SideList({
  title,
  Icon,
  color,
  items,
  dim,
}: {
  title: string;
  Icon: LucideIcon;
  color: string;
  items: string[];
  dim: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-[14px] border px-4 py-4 transition"
      style={{
        background: dim ? "rgba(255,255,255,0.015)" : `${color}0e`,
        borderColor: dim ? "rgba(255,255,255,0.05)" : `${color}30`,
        opacity: dim ? 0.5 : 1,
      }}
    >
      <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold tracking-wide" style={{ color }}>
        <Icon size={15} strokeWidth={2} />
        {title}
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((t, i) => (
          <div
            key={i}
            className="flex gap-2.5 text-[12.5px] leading-snug text-white/70"
          >
            <span className="mt-1 flex-shrink-0" style={{ color }}>
              <svg width="6" height="6" viewBox="0 0 6 6">
                <circle cx="3" cy="3" r="3" fill={color} />
              </svg>
            </span>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
