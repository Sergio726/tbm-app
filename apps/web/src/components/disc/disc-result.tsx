"use client";

import { useEffect, useState } from "react";
import { Sparkles, Sun, Moon, Download, Target, Rocket } from "lucide-react";
import {
  DISC_COLORS,
  DISC_DIMENSIONS,
  DISC_FACTORS,
  DISC_ACTION_STEPS,
  primaryLetter,
  profileByKey,
  segToPct,
  type DiscLetter,
} from "@/lib/disc";
import type { DiscScores, DiscSegments } from "@/lib/disc-evaluator";
import { ProfileIcon } from "./profile-icon";

const DIM_ORDER: DiscLetter[] = ["D", "I", "S", "C"];

export function DiscResult({
  segments,
  raw,
  profileKey,
  letters,
  fullName,
  cargo,
  narrative,
}: {
  segments: DiscSegments;
  raw?: DiscScores;
  profileKey: string;
  letters?: string | null;
  fullName?: string | null;
  cargo?: string | null;
  narrative?: string | null;
}) {
  const profile = profileByKey(profileKey);
  const primary = primaryLetter(letters);
  const factor = primary ? DISC_FACTORS[primary] : null;
  const firstName = fullName?.trim().split(" ")[0];
  const iconColor = primary ? DISC_COLORS[primary] : "#5b8aff";

  // Disparar el "reveal" (barras crecen, cards entran) una vez montado.
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    setToday(
      new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    );
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="space-y-6 disc-report">
      {/* Encabezado branded solo en el PDF */}
      <div className="print-only disc-print-header">
        <div className="brand text-sm">THE BUSINESS MULTIPLIER · Informe DISC</div>
        <div className="meta text-xs">
          {fullName ?? ""}
          {cargo ? ` · ${cargo}` : ""}
          {today ? ` · ${today}` : ""}
        </div>
      </div>

      {/* Acción: descargar como PDF (oculto en la impresión) */}
      <div className="flex justify-end no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-medium text-tbm-text-secondary border border-tbm-border rounded-lg px-3 py-1.5 hover:text-tbm-text-primary hover:bg-tbm-elevated transition-colors"
        >
          <Download size={14} /> Descargar informe (PDF)
        </button>
      </div>

      {/* Encabezado del perfil */}
      <div className="text-center tbm-rise" style={{ animationDelay: "0ms" }}>
        {firstName && (
          <p className="text-sm text-tbm-text-secondary mb-1">Hola {firstName}, este es tu perfil:</p>
        )}
        <div className="flex justify-center mb-2">
          <ProfileIcon profileKey={profileKey} emoji={profile?.icon ?? "🧭"} color={iconColor} />
        </div>
        <h1 className="text-2xl font-bold text-tbm-text-primary">{profile?.name ?? profileKey}</h1>
        {letters && (
          <div className="mt-1 inline-flex gap-1">
            {letters.split("").map((l, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs font-bold text-fg"
                style={{ background: DISC_COLORS[l as DiscLetter] ?? "#475569" }}
              >
                {l}
              </span>
            ))}
          </div>
        )}
        {cargo && <p className="mt-2 text-sm text-tbm-text-muted">{cargo}</p>}
      </div>

      {/* Recordatorio: no hay perfiles buenos ni malos */}
      <p className="text-center text-sm text-tbm-text-secondary leading-relaxed tbm-rise" style={{ animationDelay: "70ms" }}>
        Este es tu <span className="text-tbm-text-primary">perfil natural de comportamiento</span>. No
        hay perfiles buenos ni malos: cada uno aporta algo distinto.
      </p>

      {/* Síntesis personalizada (IA) */}
      {narrative && (
        <div className="tbm-card p-4 border border-tbm-blue/30 tbm-rise" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={15} className="text-tbm-blue-light" />
            <h2 className="text-sm font-semibold text-tbm-text-primary">Síntesis personalizada</h2>
          </div>
          <div className="space-y-2">
            {narrative.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="text-sm text-tbm-text-secondary leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Barras por dimensión */}
      <div className="tbm-card p-4 space-y-3 tbm-rise" style={{ animationDelay: "210ms" }}>
        {DIM_ORDER.map((letter, i) => {
          const seg = segments[letter] ?? 4;
          const pct = segToPct(seg);
          return (
            <div key={letter}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-tbm-text-secondary">
                  <span className="font-bold" style={{ color: DISC_COLORS[letter] }}>
                    {letter}
                  </span>{" "}
                  {DISC_DIMENSIONS[letter].name}
                </span>
                <span className="text-tbm-text-muted">
                  {seg}/7{raw ? ` · ${raw[letter] > 0 ? "+" : ""}${raw[letter]}` : ""}
                </span>
              </div>
              <div className="h-2 rounded-full bg-tbm-elevated overflow-hidden">
                <div
                  className="h-full rounded-full tbm-bar"
                  style={{
                    width: mounted ? `${pct}%` : "0%",
                    transitionDelay: `${i * 90}ms`,
                    background: DISC_COLORS[letter],
                  }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-[11px] text-tbm-text-muted pt-1 leading-relaxed">
          Cada barra (1 a 7) indica cuánto se destaca esa energía en tu perfil. Las 2 más altas
          definen tu estilo dominante.
        </p>
      </div>

      {/* Luz y Sombra */}
      {factor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tbm-rise" style={{ animationDelay: "280ms" }}>
          <TraitList
            title="Tu luz"
            Icon={Sun}
            tone="#34d399"
            items={factor.luz}
          />
          <TraitList
            title="Tu sombra"
            Icon={Moon}
            tone="#f87171"
            items={factor.sombra}
          />
        </div>
      )}

      {/* Perfil en detalle */}
      {profile && (
        <div className="tbm-card p-4 space-y-4 tbm-rise" style={{ animationDelay: "350ms" }}>
          <h2 className="text-sm font-semibold text-tbm-text-primary">Tu perfil en detalle</h2>
          <p className="text-sm text-tbm-text-secondary leading-relaxed">{profile.desc}</p>

          <div className="flex flex-wrap gap-1.5">
            {profile.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-xs bg-tbm-elevated text-tbm-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm">
            <Field label="Lo que aportás" value={profile.valor} />
            <Field label="Lo que conviene cuidar" value={profile.abusa} />
            <Field label="Bajo presión" value={factor?.underPressure ?? profile.bajo_presion} />
            <Field label="Tu temor dominante" value={factor?.temor ?? profile.teme} />
            {factor && <Field label="Cómo trabajar mejor con vos" value={factor.howToManage} />}
            <Field label="Tu camino a crecer (PRIME)" value={profile.mas_eficaz} />
          </dl>
        </div>
      )}

      {/* Dónde brillás (roles ideales) */}
      {factor && factor.idealRoles.length > 0 && (
        <div className="tbm-card p-4 tbm-rise" style={{ animationDelay: "390ms" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <Target size={15} style={{ color: iconColor }} />
            <h2 className="text-sm font-semibold text-tbm-text-primary">Dónde brillás</h2>
          </div>
          <p className="text-sm text-tbm-text-secondary mb-2.5">
            Tu estilo natural rinde mejor en roles de:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {factor.idealRoles.map((r) => (
              <span
                key={r}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${iconColor}1c`, border: `1px solid ${iconColor}40`, color: iconColor }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tus próximos pasos */}
      {primary && (
        <div className="tbm-card p-4 tbm-rise" style={{ animationDelay: "430ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={15} className="text-tbm-blue-light" />
            <h2 className="text-sm font-semibold text-tbm-text-primary">Tus próximos pasos</h2>
          </div>
          <ol className="space-y-2.5">
            {DISC_ACTION_STEPS[primary].map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-tbm-text-secondary leading-snug">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tbm-blue/20 text-tbm-blue-light text-[11px] font-bold">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Glosario: qué mide cada letra */}
      <div className="tbm-card p-4 tbm-rise" style={{ animationDelay: "500ms" }}>
        <h2 className="text-sm font-semibold text-tbm-text-primary mb-3">¿Qué significa cada letra?</h2>
        <div className="space-y-2.5">
          {DIM_ORDER.map((letter) => {
            const dim = DISC_DIMENSIONS[letter];
            return (
              <div key={letter} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-fg shrink-0"
                  style={{ background: DISC_COLORS[letter] }}
                >
                  {letter}
                </span>
                <div>
                  <span className="text-sm font-medium text-tbm-text-primary">{dim.name}</span>
                  <span className="text-sm text-tbm-text-muted"> · {dim.question}</span>
                  <p className="text-sm text-tbm-text-secondary">{dim.plain}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referencia: sobre el modelo */}
      <p className="text-xs text-tbm-text-muted leading-relaxed text-center px-2 tbm-rise" style={{ animationDelay: "490ms" }}>
        El modelo DISC describe 4 estilos de comportamiento (Dominante, Influyente, Seguro y
        Pensador). Es una herramienta de autoconocimiento para trabajar mejor en equipo, no un
        diagnóstico ni una medida de capacidad.
      </p>
    </div>
  );
}

function TraitList({
  title,
  Icon,
  tone,
  items,
}: {
  title: string;
  Icon: typeof Sun;
  tone: string;
  items: string[];
}) {
  return (
    <div className="tbm-card p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={15} style={{ color: tone }} />
        <h3 className="text-sm font-semibold" style={{ color: tone }}>
          {title}
        </h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-tbm-text-secondary leading-snug">
            <span style={{ color: tone }}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-tbm-text-muted">{label}</dt>
      <dd className="text-tbm-text-secondary mt-0.5">{value}</dd>
    </div>
  );
}
