"use client";

import React, { useEffect, useRef, useState } from "react";
import { Info, Clock } from "lucide-react";
import { WORD_GROUPS, TOTAL_GROUPS, type DiscAnswer, type DiscDim } from "@/lib/disc-evaluator";
import { DISC_DIMENSIONS, DISC_COLORS } from "@/lib/disc";
import { wordDefinition } from "@/lib/disc-words";
import { submitDisc, type SubmitDiscResult } from "@/app/disc/[token]/actions";
import { DiscResult } from "./disc-result";

const DIM_ORDER: DiscDim[] = ["D", "I", "S", "C"];
const CONFETTI_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];
const CHECKPOINT_MSGS: [number, string][] = [
  [25, "¡Buen arranque!"],
  [50, "¡Mitad de camino!"],
  [75, "¡Recta final!"],
  [90, "¡Casi listo!"],
];

type Phase = "datos" | "test" | "done";

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function momentum(idx: number, total: number): string {
  const left = total - idx;
  if (idx === 0) return "¡Arrancamos! 🚀";
  if (idx === total - 1) return "¡Último grupo! 🏁";
  if (idx >= Math.floor(total * 0.75)) return `¡Ya casi! Faltan ${left}`;
  if (idx >= Math.floor(total / 2)) return "¡Mitad de camino! 💪";
  return "Vas tomando ritmo 👌";
}

function clockTone(s: number): { color: string; cls: string } {
  if (s < 180) return { color: "#64748B", cls: "" };
  if (s < 300) return { color: "#F59E0B", cls: "tbm-heartbeat" };
  return              { color: "#EF4444", cls: "tbm-heartbeat-strong" };
}

export function DiscTest({
  token,
  defaultName,
  defaultCargo,
  companyName,
  hasProfile,
}: {
  token: string;
  defaultName?: string | null;
  defaultCargo?: string | null;
  companyName?: string | null;
  hasProfile?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("datos");
  const [name, setName] = useState(defaultName ?? "");
  const [cargo, setCargo] = useState(defaultCargo ?? "");
  const [email, setEmail] = useState("");

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"f" | "b">("f");
  const [openDef, setOpenDef] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(DiscAnswer | null)[]>(
    Array.from({ length: TOTAL_GROUPS }, () => null)
  );

  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Extract<SubmitDiscResult, { ok: true }> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const advancedRef = useRef<Set<number>>(new Set());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossedRef = useRef<Set<number>>(new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = answers[idx];
  const complete = !!current && current.m >= 0 && current.l >= 0;
  const isLast = idx === TOTAL_GROUPS - 1;
  const pct = Math.round(((idx + (complete ? 1 : 0)) / TOTAL_GROUPS) * 100);

  // Cronómetro: corre durante la fase de test.
  useEffect(() => {
    if (phase !== "test") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Checkpoints de progreso: dispara microtoast la primera vez que pct cruza 25/50/75/90/100.
  useEffect(() => {
    if (phase !== "test") return;
    const targets = pct === 100
      ? [[100, "¡Completaste el test! 🎉"] as [number, string]]
      : CHECKPOINT_MSGS;
    for (const [m, msg] of targets) {
      if (pct >= m && !crossedRef.current.has(m)) {
        crossedRef.current.add(m);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(msg);
        toastTimer.current = setTimeout(() => setToast(null), 1500);
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, phase]);

  // Auto-avance: al completar un grupo por primera vez, pasa solo al siguiente.
  useEffect(() => {
    if (phase !== "test" || !complete || isLast) return;
    if (advancedRef.current.has(idx)) return;
    advancedRef.current.add(idx);
    advanceTimer.current = setTimeout(() => {
      setDir("f");
      setOpenDef(null);
      setIdx((i) => Math.min(TOTAL_GROUPS - 1, i + 1));
    }, 380);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [phase, complete, isLast, idx]);

  function goTo(next: number, direction: "f" | "b") {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDir(direction);
    setOpenDef(null);
    setIdx(next);
  }

  function setMost(wordIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      const cur = next[idx] ?? { m: -1, l: -1 };
      const l = cur.l === wordIdx ? -1 : cur.l; // no puede ser la misma
      next[idx] = { m: wordIdx, l };
      return next;
    });
  }
  function setLeast(wordIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      const cur = next[idx] ?? { m: -1, l: -1 };
      const m = cur.m === wordIdx ? -1 : cur.m;
      next[idx] = { m, l: wordIdx };
      return next;
    });
  }

  async function handleFinish() {
    setSubmitting(true);
    setError("");
    const clean = answers.map((a) => (a && a.m >= 0 && a.l >= 0 ? a : { m: 0, l: 1 }));
    const res = await submitDisc({ token, fullName: name, cargo, email, answers: clean });
    setSubmitting(false);
    if (!res.ok) {
      setError(
        res.error === "ya_completado"
          ? "Este test ya fue completado."
          : "No se pudo guardar el resultado. Intentá de nuevo."
      );
      return;
    }
    setDone(res);
    setPhase("done");
  }

  // ── Resultado ──────────────────────────────────────────────
  if (phase === "done" && done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <p className="text-center text-tbm-green text-sm mb-4">✓ Test completado</p>
        <DiscResult
          segments={done.segments}
          raw={done.raw}
          profileKey={done.profileKey}
          letters={done.letters}
          fullName={name}
          cargo={cargo}
          narrative={done.narrative ?? null}
        />
      </div>
    );
  }

  // ── Datos iniciales + intro educativa ──────────────────────
  if (phase === "datos") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧭</div>
          <h1 className="text-2xl font-bold text-tbm-text-primary">Tu perfil DISC</h1>
          {companyName && (
            <p className="text-sm text-tbm-text-muted mt-1">Invitación de {companyName}</p>
          )}
        </div>

        {/* ¿Qué es el DISC? */}
        <div className="tbm-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-tbm-text-primary mb-1.5">¿Qué es el DISC?</h2>
          <p className="text-sm text-tbm-text-secondary leading-relaxed">
            Es un mapa de tu <span className="text-tbm-text-primary">forma natural de comportarte</span>: cómo
            tomás decisiones, te comunicás y trabajás. No mide inteligencia ni si sos &quot;bueno&quot; o
            &quot;malo&quot; —{" "}
            <span className="text-tbm-text-primary">no hay perfiles mejores que otros</span>. Solo describe tu
            estilo para ayudarte a aprovechar tus fortalezas.
          </p>
        </div>

        {/* Las 4 energías */}
        <div className="tbm-card p-4 mb-4">
          <h2 className="text-sm font-semibold text-tbm-text-primary mb-3">Las 4 energías que mide</h2>
          <div className="space-y-2.5">
            {DIM_ORDER.map((d) => {
              const dim = DISC_DIMENSIONS[d];
              return (
                <div key={d} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: DISC_COLORS[d] }}
                  >
                    {d}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-tbm-text-primary">{dim.name}</span>
                    <span className="text-sm text-tbm-text-secondary"> — {dim.plain}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="tbm-card p-4 mb-6">
          <h2 className="text-sm font-semibold text-tbm-text-primary mb-2">Cómo funciona</h2>
          <ul className="text-sm text-tbm-text-secondary space-y-1.5">
            <li>• Son <span className="text-tbm-text-primary">{TOTAL_GROUPS} grupos</span> de 4 palabras (~5 min).</li>
            <li>
              • En cada grupo marcás la que <span className="text-tbm-green font-medium">MÁS (+)</span> y la que{" "}
              <span className="text-tbm-red font-medium">MENOS (−)</span> te describe.
            </li>
            <li>
              • ¿No conocés una palabra? Tocá el ícono{" "}
              <Info size={12} className="inline align-middle text-tbm-text-muted" /> para ver qué significa.
            </li>
            <li>• No hay respuestas correctas: respondé con tu <span className="text-tbm-text-primary">primera reacción</span>, pensando en cómo sos realmente (no en cómo te gustaría ser).</li>
          </ul>
        </div>

        {hasProfile ? (
          // Identidad fija: el link ya pertenece a un miembro. No se piden datos.
          <div className="space-y-4">
            <div className="tbm-card p-4 text-center">
              <p className="text-sm text-tbm-text-secondary">Vas a hacer el test como</p>
              <p className="text-lg font-bold text-tbm-text-primary mt-0.5">{name || "este colaborador"}</p>
              {cargo && <p className="text-sm text-tbm-text-muted mt-0.5">{cargo}</p>}
            </div>
            <button className="tbm-btn-primary w-full" onClick={() => setPhase("test")}>
              Empezar test →
            </button>
            <p className="text-center text-xs text-tbm-text-muted">
              ¿No sos vos? Pedile al Arquitecto el link correcto.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Tu nombre completo" value={name} onChange={setName} placeholder="Juan García" />
            <Input label="Tu cargo o área" value={cargo} onChange={setCargo} placeholder="Operaciones" />
            <Input label="Email (opcional)" value={email} onChange={setEmail} placeholder="juan@empresa.com" type="email" />
            <button
              className="tbm-btn-primary w-full"
              disabled={!name.trim()}
              onClick={() => setPhase("test")}
            >
              Empezar test →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Cuestionario ───────────────────────────────────────────
  const group = WORD_GROUPS[idx];

  const tone = clockTone(elapsed);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header: momentum + cronómetro + progreso */}
      <div className="mb-4">

        {/* Fila superior: texto de momentum / toast + reloj */}
        <div className="flex justify-between items-center mb-1.5 min-h-[22px]">
          <div className="relative flex-1 mr-2 overflow-hidden">
            {toast ? (
              <span
                key={toast}
                className="tbm-toast absolute inset-0 text-sm font-bold text-tbm-text-primary whitespace-nowrap"
              >
                {toast}
              </span>
            ) : (
              <span className="text-sm font-semibold text-tbm-text-primary">{momentum(idx, TOTAL_GROUPS)}</span>
            )}
          </div>

          {/* Pill del reloj */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border tabular-nums text-xs font-medium ${tone.cls}`}
            style={{
              color: tone.color,
              borderColor: tone.color + "40",
              background: tone.color + "14",
            }}
            title="Tiempo (objetivo ~5 min)"
          >
            <Clock size={11} strokeWidth={2} />
            {fmtTime(elapsed)}
          </div>
        </div>

        {/* Barra de progreso con shimmer + notches */}
        <div key={idx} className="tbm-progress-pulse">
          <div className="relative h-2 rounded-full bg-tbm-elevated overflow-visible">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="tbm-bar-shimmer" style={{ width: `${pct}%` }} />
              {pct === 100 && <div className="tbm-bar-flash" />}
            </div>
            {[25, 50, 75, 90].map((m) => (
              <span
                key={m}
                className="tbm-notch"
                data-on={pct >= m ? "1" : "0"}
                style={{ left: `${m}%` }}
              />
            ))}
            {/* Confetti al 100% */}
            {pct === 100 && (
              <div className="tbm-confetti-wrap" aria-hidden>
                {Array.from({ length: 22 }).map((_, i) => (
                  <span
                    key={i}
                    className="tbm-confetti"
                    style={{
                      ["--x" as string]: `${(Math.random() - 0.5) * 220}px`,
                      ["--r" as string]: `${Math.random() * 540}deg`,
                      ["--d" as string]: `${Math.random() * 0.4}s`,
                      ["--c" as string]: CONFETTI_COLORS[i % 4],
                      left: `${Math.random() * 100}%`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-right text-[11px] text-tbm-text-muted mt-1">
          {idx + 1}/{TOTAL_GROUPS}
        </div>
      </div>

      <p className="text-sm text-tbm-text-secondary text-center mb-3">
        De estas 4 palabras, ¿cuál te describe{" "}
        <span className="text-tbm-green font-medium">MÁS</span> y cuál{" "}
        <span className="text-tbm-red font-medium">MENOS</span>?
      </p>
      <div className="flex justify-between text-[11px] uppercase tracking-wide text-tbm-text-muted px-1 mb-2">
        <span className="text-tbm-green">+ Más</span>
        <span className="text-tbm-red">Menos −</span>
      </div>

      {/* Grupo (con animación de entrada) */}
      <div key={idx} className={dir === "f" ? "tbm-slide-right" : "tbm-slide-left"}>
        <div className="space-y-2">
          {group.map(([word], w) => {
            const isMost = current?.m === w;
            const isLeast = current?.l === w;
            const def = wordDefinition(word);
            const defOpen = openDef === w;
            return (
              <div
                key={w}
                className="tbm-card px-3 py-2.5 transition-colors"
                style={{
                  borderColor: isMost
                    ? "rgba(16,185,129,0.45)"
                    : isLeast
                    ? "rgba(239,68,68,0.45)"
                    : undefined,
                  background: isMost
                    ? "rgba(16,185,129,0.07)"
                    : isLeast
                    ? "rgba(239,68,68,0.07)"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Más"
                    onClick={() => setMost(w)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isMost ? "tbm-tap" : ""}`}
                    style={{
                      borderColor: isMost ? "#10B981" : "#1E3050",
                      background: isMost ? "#10B981" : "transparent",
                      color: isMost ? "#fff" : "#64748B",
                    }}
                  >
                    +
                  </button>
                  <span className="flex-1 text-tbm-text-primary text-sm">{word}</span>
                  {def && (
                    <button
                      aria-label={`Qué significa ${word}`}
                      onClick={() => setOpenDef(defOpen ? null : w)}
                      className="shrink-0 transition-colors"
                      style={{ color: defOpen ? "#5b8aff" : "#64748B" }}
                    >
                      <Info size={15} />
                    </button>
                  )}
                  <button
                    aria-label="Menos"
                    onClick={() => setLeast(w)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isLeast ? "tbm-tap" : ""}`}
                    style={{
                      borderColor: isLeast ? "#EF4444" : "#1E3050",
                      background: isLeast ? "#EF4444" : "transparent",
                      color: isLeast ? "#fff" : "#64748B",
                    }}
                  >
                    −
                  </button>
                </div>
                {defOpen && def && (
                  <p className="text-xs text-tbm-text-secondary mt-2 pl-11 pr-2 leading-relaxed">{def}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-tbm-red/10 border border-tbm-red/30 text-tbm-red text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <button
          className="px-4 py-2 rounded-lg border border-tbm-border text-tbm-text-secondary text-sm disabled:opacity-40"
          disabled={idx === 0 || submitting}
          onClick={() => goTo(Math.max(0, idx - 1), "b")}
        >
          ← Atrás
        </button>
        {!isLast ? (
          <button
            className="tbm-btn-primary flex-1"
            disabled={!complete}
            onClick={() => goTo(Math.min(TOTAL_GROUPS - 1, idx + 1), "f")}
          >
            Siguiente →
          </button>
        ) : (
          <button
            className={`tbm-btn-primary flex-1${pct === 100 ? " tbm-cta-glow" : ""}`}
            disabled={!complete || submitting}
            onClick={handleFinish}
          >
            {submitting ? "Armando tu informe…" : "Ver mi perfil"}
          </button>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-tbm-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="tbm-input w-full"
      />
    </div>
  );
}
