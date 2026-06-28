"use client";

import { useEffect, useRef, useState } from "react";
import { buildBriefing, type BriefingData } from "@/lib/greeting";
import { setJarvisPhase } from "./jarvis-store";
import { JarvisCore } from "./jarvis-core";

const FRESH_LOGIN_KEY = "tbm:just-logged-in";
const GREETING_OFF_KEY = "tbm:greeting-off";

// Duración de cada fase (ms). Total ≈ 3.75 s — intensidad cinemática.
// SPEAK da tiempo a que el typewriter termine ambas líneas + un momento de lectura.
const COVER_MS = 350;
const SPEAK_MS = 4700;
const REVEAL_MS = 800;

type Step = "off" | "cover" | "speak" | "reveal" | "done";

/**
 * Bienvenida cinemática "JARVIS" (S17.D).
 * Reemplaza el banner welcome-greeting. Solo se reproduce en login fresco
 * (flag `tbm:just-logged-in`). Secuencia: cover → speak (typewriter + chime) →
 * reveal → el orbe vuela al header. Resuelve el saludo doble: el header queda
 * como único saludo persistente; esto es una película transitoria.
 */
export function JarvisIntro({
  firstName,
  greeting,
  tasksDueCount,
  nextRitualLabel,
  areasCriticasCount,
  unreadCount,
}: { firstName: string; greeting: string } & BriefingData) {
  const [step, setStep] = useState<Step>("off");
  const [entered, setEntered] = useState(false);
  const finished = useRef(false);
  const started = useRef(false); // inicializa una sola vez (resiliente a Strict Mode)
  const mounted = useRef(true); // guarda setState tras desmontar real
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const briefing = buildBriefing({
    tasksDueCount,
    nextRitualLabel,
    areasCriticasCount,
    unreadCount,
  });
  const lines = [`${greeting} de nuevo, ${firstName}.`, briefing];

  // Termina la película: el overlay suelta el orbe y el header lo recibe (vuelo).
  function finish() {
    if (finished.current || !mounted.current) return;
    finished.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setJarvisPhase("idle");
    setStep("done");
  }

  useEffect(() => {
    mounted.current = true;
    // En Strict Mode (dev) el efecto corre dos veces. Inicializamos una sola vez
    // y NO cancelamos los timers en el cleanup falso — solo marcamos desmontado.
    if (started.current) return () => void (mounted.current = false);
    started.current = true;

    if (typeof window === "undefined") return;

    const fresh = window.localStorage.getItem(FRESH_LOGIN_KEY) === "1";
    const off = window.localStorage.getItem(GREETING_OFF_KEY) === "1";
    // Consumimos el flag siempre, para que no reaparezca al navegar.
    if (fresh) window.localStorage.removeItem(FRESH_LOGIN_KEY);

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    // Sin login fresco, apagado, o reduce-motion → sin película; orbe directo en header.
    if (!fresh || off || reduced) {
      setJarvisPhase("idle");
      return () => void (mounted.current = false);
    }

    setJarvisPhase("playing");
    setStep("cover");
    playChime();
    requestAnimationFrame(() => {
      if (mounted.current) setEntered(true); // dispara el fade-in
    });

    timers.current = [
      setTimeout(() => mounted.current && setStep("speak"), COVER_MS),
      setTimeout(() => mounted.current && setStep("reveal"), COVER_MS + SPEAK_MS),
      setTimeout(finish, COVER_MS + SPEAK_MS + REVEAL_MS),
    ];

    return () => void (mounted.current = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step === "off" || step === "done") return null;

  const revealing = step === "reveal";
  const washOpacity = revealing ? 0 : entered ? 1 : 0;
  const orbOpacity = entered ? 1 : 0; // el orbe NO se desvanece: vuela al header
  const textOpacity = entered && !revealing ? 1 : 0;

  return (
    <div
      role="dialog"
      aria-label="Bienvenida"
      onClick={finish}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ cursor: "pointer" }}
    >
      {/* Lavado de color (aurora azul TBM) — entra en cover, se disuelve en reveal */}
      <div
        className="jarvis-wash absolute inset-0"
        style={{ opacity: washOpacity, transition: "opacity 450ms ease-in-out" }}
      />

      {/* Orbe — visible durante toda la película; vuela al header al terminar */}
      <div
        className="relative"
        style={{ opacity: orbOpacity, transition: "opacity 400ms ease-out" }}
      >
        <JarvisCore size={92} />
      </div>

      {/* Texto + acción — fade out junto con el reveal */}
      <div
        className="relative flex flex-col items-center px-6 text-center"
        style={{ opacity: textOpacity, transition: "opacity 500ms ease-in-out" }}
      >
        <div className="mt-7 min-h-[68px]">
          <Typewriter lines={lines} active={step === "speak"} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            try {
              window.localStorage.setItem(GREETING_OFF_KEY, "1");
            } catch {
              /* ignore */
            }
            finish();
          }}
          className="mt-6 text-[12px] text-white/65 underline-offset-2 transition hover:text-white/70 hover:underline"
        >
          No volver a mostrar
        </button>
      </div>

      <div className="absolute bottom-8 text-[11px] tracking-wide text-white/65">
        Click para saltar
      </div>
    </div>
  );
}

/** Typewriter de 2 líneas, sin librerías (S17.D). */
function Typewriter({ lines, active }: { lines: string[]; active: boolean }) {
  const [out, setOut] = useState<string[]>(() => lines.map(() => ""));
  const [caretLine, setCaretLine] = useState(0);

  useEffect(() => {
    if (!active) return;
    let li = 0;
    let ci = 0;
    const acc = lines.map(() => "");
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (li >= lines.length) return;
      const line = lines[li];
      if (ci <= line.length) {
        acc[li] = line.slice(0, ci);
        setOut([...acc]);
        setCaretLine(li);
        ci += 1;
        timer = setTimeout(tick, 34);
      } else {
        li += 1;
        ci = 0;
        timer = setTimeout(tick, 240);
      }
    };
    timer = setTimeout(tick, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <div className="text-[22px] font-semibold leading-snug text-white">
        {out[0]}
        {caretLine === 0 && <Caret />}
      </div>
      <div className="mt-2 text-[15px] leading-relaxed text-white/70">
        {out[1]}
        {caretLine === 1 && <Caret />}
      </div>
    </>
  );
}

function Caret() {
  return (
    <span
      className="jarvis-caret ml-0.5 inline-block align-middle"
      style={{
        width: 2,
        height: "1em",
        background: "#9fb9ff",
        transform: "translateY(1px)",
      }}
    />
  );
}

/** Chime sutil (Web Audio). Degrada sin sonido si el navegador bloquea autoplay. */
function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5 → B5, ascendente sutil
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });

    setTimeout(() => void ctx.close().catch(() => {}), 1300);
  } catch {
    /* autoplay bloqueado → sin sonido */
  }
}
