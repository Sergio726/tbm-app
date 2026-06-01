"use client";

import { Users, Sun, Moon, Sparkles } from "lucide-react";
import type { Profile } from "@/types/database";
import { DISC_COLORS, DISC_FACTORS, primaryLetter, normalizeLetters } from "@/lib/disc";
import { Card, SectionTitle, Field, ToggleBtn, inputStyle } from "./primitives";
import { LettersHint } from "./letters-hint";
import { TestLinkBox } from "./test-link-box";
import { DiscBars } from "./disc-bars";
import { DiscRadar } from "./disc-radar";
import type { Draft, DiscScoresShape } from "./types";

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
  const primary = primaryLetter(draft.disc_letters);
  const factor = primary ? DISC_FACTORS[primary] : null;
  const color = primary ? DISC_COLORS[primary] : "#64748b";
  const isSombra = draft.disc_state === "sombra";
  const normalized = normalizeLetters(draft.disc_letters);

  return (
    <Card>
      <SectionTitle
        Icon={Users}
        label="Perfil DISC"
        color={color}
        hint="Cómo se comporta naturalmente y cómo liderarlo. Generá el link del test o cargá las letras del informe."
      />

      <Field label="Letras DISC" hint="ej. SC, DI">
        <input
          value={draft.disc_letters}
          disabled={!editable}
          onChange={(e) => patch({ disc_letters: e.target.value })}
          placeholder="—"
          maxLength={4}
          style={{
            ...inputStyle,
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 8,
            padding: "12px",
          }}
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
          {/* Atributos: radar + barras */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "150px 1fr",
              gap: 18,
              marginTop: 18,
              alignItems: "center",
            }}
          >
            <DiscRadar letters={normalized} scores={scores} />
            <DiscBars letters={normalized} scores={scores} />
          </div>

          <StateToggle draft={draft} patch={patch} editable={editable} />

          {/* Luz / Sombra side by side */}
          <div
            className="grid"
            style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}
          >
            <DescList
              title="Luz"
              Icon={Sun}
              items={factor.luz}
              tone="#34d399"
              dim={isSombra}
            />
            <DescList
              title="Sombra"
              Icon={Moon}
              items={factor.sombra}
              tone="#a78bfa"
              dim={!isSombra}
            />
          </div>

          {/* Cómo liderar */}
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: `${color}12`,
              border: `1px solid ${color}30`,
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: 7, marginBottom: 6 }}
            >
              <Sparkles size={13} style={{ color }} />
              <span style={{ fontSize: 12, fontWeight: 600, color }}>
                Cómo liderar a{" "}
                {member.full_name?.split(" ")[0] ?? "esta persona"} · estrategia
              </span>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {factor.howToManage}
            </p>
            <p
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.5)",
                marginTop: 6,
              }}
            >
              Bajo presión: {factor.underPressure}
            </p>
          </div>

          <Field label="Temor dominante" hint="sugerido por perfil — editable">
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
        <p
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.45)",
            marginTop: 12,
          }}
        >
          Ingresá las letras DISC (del informe) para ver Luz/Sombra, temores y guía de
          liderazgo.
        </p>
      )}
    </Card>
  );
}

function StateToggle({
  draft,
  patch,
  editable,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
}) {
  const isSombra = draft.disc_state === "sombra";
  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}
      >
        Estado actual (evaluación del Arquitecto)
      </div>
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
  );
}

function DescList({
  title,
  Icon,
  items,
  tone,
  dim,
}: {
  title: string;
  Icon: typeof Sun;
  items: string[];
  tone: string;
  dim: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        background: dim ? "rgba(255,255,255,0.015)" : `${tone}0d`,
        border: `1px solid ${dim ? "rgba(255,255,255,0.05)" : `${tone}28`}`,
        opacity: dim ? 0.5 : 1,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 600, color: tone }}
      >
        <Icon size={12} />
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li
            key={i}
            className="flex"
            style={{
              gap: 7,
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.45,
              marginBottom: 4,
            }}
          >
            <span style={{ color: tone }}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
