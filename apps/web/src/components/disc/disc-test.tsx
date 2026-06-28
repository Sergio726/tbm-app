"use client";

import React, { useEffect, useRef, useState } from "react";
import { Info, Clock, Sparkles, Layers, CheckCircle2 } from "lucide-react";
import { WORD_GROUPS, TOTAL_GROUPS, type DiscAnswer, type DiscDim } from "@/lib/disc-evaluator";
import { DISC_DIMENSIONS, DISC_COLORS } from "@/lib/disc";
import { wordDefinition } from "@/lib/disc-words";
import { submitDisc, type SubmitDiscResult } from "@/app/disc/[token]/actions";
import { capture } from "@/lib/analytics";
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
    capture("disc_submitted", { profile_key: res.profileKey, letters: res.letters });
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
    const firstName = (name || "").trim().split(" ")[0];
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-7 tbm-rise" style={{ animationDelay: "0ms" }}>
          <HeroCompass />
          {companyName && (
            <span className="mb-2.5 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-tbm-text-muted">
              Invitación de {companyName}
            </span>
          )}
          {hasProfile && firstName ? (
            <>
              <h1 className="text-[26px] font-bold leading-tight text-tbm-text-primary">
                ¡Hola, {firstName}! <span className="align-middle">👋</span>
              </h1>
              <p className="mt-1 text-sm text-tbm-text-secondary">
                Te invitaron a descubrir tu{" "}
                <span className="text-gradient-blue font-semibold">perfil DISC</span>.
              </p>
            </>
          ) : (
            <h1 className="text-[26px] font-bold leading-tight text-tbm-text-primary">
              Tu <span className="text-gradient-blue">perfil DISC</span>
            </h1>
          )}
        </div>

        {/* ¿Qué es el DISC? */}
        <div
          className="tbm-card p-5 mb-4 tbm-rise"
          style={{ animationDelay: "90ms", borderColor: "rgba(91,138,255,0.22)" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "rgba(91,138,255,0.14)", color: "#9fb9ff" }}
            >
              <Sparkles size={15} strokeWidth={2} />
            </span>
            <h2 className="text-sm font-semibold text-tbm-text-primary">¿Qué es el DISC?</h2>
          </div>
          <p className="text-sm text-tbm-text-secondary leading-relaxed">
            Es un mapa de tu <span className="text-tbm-text-primary">forma natural de comportarte</span>: cómo
            tomás decisiones, te comunicás y trabajás. No mide inteligencia ni si sos &quot;bueno&quot; o
            &quot;malo&quot; —{" "}
            <span className="text-tbm-text-primary">no hay perfiles mejores que otros</span>. Solo describe tu
            estilo para ayudarte a aprovechar tus fortalezas.
          </p>
        </div>

        {/* Las 4 energías */}
        <div className="mb-4 tbm-rise" style={{ animationDelay: "170ms" }}>
          <h2 className="mb-2.5 px-0.5 text-sm font-semibold text-tbm-text-primary">
            Las 4 energías que mide
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {DIM_ORDER.map((d, i) => (
              <EnergyCard key={d} d={d} delay={210 + i * 70} />
            ))}
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="tbm-card p-5 mb-6 tbm-rise" style={{ animationDelay: "430ms" }}>
          <h2 className="mb-3 text-sm font-semibold text-tbm-text-primary">Cómo funciona</h2>
          <div className="mb-3.5 grid grid-cols-3 gap-2.5">
            <StatTile Icon={Layers} text={`${TOTAL_GROUPS} grupos`} color="#5b8aff" />
            <StatTile Icon={Clock} text="~5 minutos" color="#fbbf24" />
            <StatTile Icon={CheckCircle2} text="Sin respuestas malas" color="#34d399" />
          </div>
          <div className="flex items-center gap-2 text-[12.5px] leading-snug text-tbm-text-secondary">
            <span>En cada grupo elegís la que te describe</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-tbm-green/40 bg-tbm-green/10 px-2 py-0.5 text-[11px] font-bold text-tbm-green">
              + MÁS
            </span>
            <span>y la</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-tbm-red/40 bg-tbm-red/10 px-2 py-0.5 text-[11px] font-bold text-tbm-red">
              − MENOS
            </span>
          </div>
          <p className="mt-2.5 text-[12px] leading-relaxed text-tbm-text-muted">
            ¿No conocés una palabra? Tocá{" "}
            <Info size={12} className="inline align-middle text-tbm-text-muted" /> para ver qué significa.
            No hay respuestas correctas: respondé con tu{" "}
            <span className="text-tbm-text-secondary">primera reacción</span>.
          </p>
        </div>

        {hasProfile ? (
          // Identidad fija: el link ya pertenece a un miembro. No se piden datos.
          <div className="space-y-3.5 tbm-rise" style={{ animationDelay: "520ms" }}>
            <div
              className="tbm-card flex items-center gap-3.5 p-4"
              style={{ borderColor: "rgba(91,138,255,0.28)" }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ background: "linear-gradient(135deg, #5b8aff, #2c5fe6)" }}
              >
                {(name || "?")
                  .trim()
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-tbm-text-muted">
                  Vas a hacer el test como
                </p>
                <p className="truncate text-[17px] font-bold text-tbm-text-primary">
                  {name || "este colaborador"}
                </p>
                {cargo && <p className="truncate text-xs text-tbm-text-muted">{cargo}</p>}
              </div>
            </div>
            <button
              className="tbm-btn-primary tbm-cta-glow w-full py-3.5 text-[15px]"
              onClick={() => setPhase("test")}
            >
              Empezar mi test →
            </button>
            <p className="text-center text-xs text-tbm-text-muted">
              ¿No sos vos? Pedile al Arquitecto el link correcto.
            </p>
          </div>
        ) : (
          <div className="space-y-4 tbm-rise" style={{ animationDelay: "520ms" }}>
            <Input label="Tu nombre completo" value={name} onChange={setName} placeholder="Juan García" />
            <Input label="Tu cargo o área" value={cargo} onChange={setCargo} placeholder="Operaciones" />
            <Input label="Email (opcional)" value={email} onChange={setEmail} placeholder="juan@empresa.com" type="email" />
            <button
              className="tbm-btn-primary tbm-cta-glow w-full py-3.5 text-[15px]"
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
                      borderColor: isMost ? "#10B981" : "var(--border)",
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
                      borderColor: isLeast ? "#EF4444" : "var(--border)",
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

// Ícono héroe: emoji compás con flotación suave + halo de glow (CSS, sin assets).
function HeroCompass() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const color = "#5b8aff";
  return (
    <div className="relative mx-auto mb-3 flex h-[92px] w-[92px] items-center justify-center">
      {!reduced && (
        <span
          aria-hidden
          className="tbm-glow-pulse absolute rounded-full"
          style={{
            width: 122,
            height: 122,
            background: `radial-gradient(circle, ${color}55 0%, ${color}00 68%)`,
          }}
        />
      )}
      <span
        className={`relative text-[56px] leading-none ${reduced ? "" : "tbm-float"}`}
      >
        🧭
      </span>
    </div>
  );
}

// Mini-card de una de las 4 energías DISC.
function EnergyCard({ d, delay }: { d: DiscDim; delay: number }) {
  const dim = DISC_DIMENSIONS[d];
  const c = DISC_COLORS[d];
  return (
    <div
      className="tbm-rise rounded-xl border p-3"
      style={{ animationDelay: `${delay}ms`, background: `${c}10`, borderColor: `${c}33` }}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ background: c }}
        >
          {d}
        </span>
        <span className="text-[13px] font-semibold text-tbm-text-primary">{dim.name}</span>
      </div>
      <p className="text-[12px] leading-snug text-tbm-text-secondary">{dim.plain}</p>
    </div>
  );
}

// Tile de estadística (ícono + texto) para "Cómo funciona".
function StatTile({
  Icon,
  text,
  color,
}: {
  Icon: typeof Clock;
  text: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `${color}1c`, color }}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="text-[12px] font-semibold leading-tight text-tbm-text-primary">{text}</span>
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
