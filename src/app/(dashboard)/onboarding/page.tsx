"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { SCORECARD_AREAS } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  BarChart3,
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

// ── Paso 1: Datos de empresa ────────────────────────────────────────────────
function StepEmpresa({
  data,
  onChange,
}: {
  data: { sector: string; team_size: string };
  onChange: (k: string, v: string) => void;
}) {
  const SECTORES = [
    "Tecnología / Software",
    "Consultoría / Servicios profesionales",
    "Retail / Comercio",
    "Manufactura / Producción",
    "Salud / Bienestar",
    "Educación / Formación",
    "Construcción / Inmobiliario",
    "Marketing / Agencias",
    "Alimentación / Restaurantes",
    "Otro",
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-tbm-text-secondary mb-2">
          Sector de tu empresa
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SECTORES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange("sector", s)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm text-left transition-all border",
                data.sector === s
                  ? "border-tbm-blue bg-tbm-blue/10 text-white"
                  : "border-tbm-border bg-tbm-surface text-tbm-text-secondary hover:border-tbm-blue/50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-tbm-text-secondary mb-2">
          ¿Cuántas personas hay en tu equipo directo?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["1–3", "4–8", "9–15", "16–30", "31–50", "50+"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange("team_size", r)}
              className={cn(
                "px-3 py-3 rounded-lg text-sm font-medium text-center transition-all border",
                data.team_size === r
                  ? "border-tbm-blue bg-tbm-blue/10 text-white"
                  : "border-tbm-border bg-tbm-surface text-tbm-text-secondary hover:border-tbm-blue/50"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Paso 2: Team Performance Scorecard ─────────────────────────────────────
function StepScorecard({
  scores,
  onChange,
}: {
  scores: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const getColor = (v: number) => {
    if (v >= 4) return "text-tbm-green";
    if (v === 3) return "text-tbm-yellow";
    return "text-tbm-red";
  };

  const getLabel = (v: number) => {
    if (v === 5) return "Excelente";
    if (v === 4) return "Bien";
    if (v === 3) return "Regular";
    if (v === 2) return "Mal";
    return "Crítico";
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-tbm-text-secondary">
        Evaluá tu empresa hoy, sin filtros. Este diagnóstico es solo tuyo.
      </p>
      {SCORECARD_AREAS.map((area) => {
        const val = scores[area.key] ?? 3;
        return (
          <div key={area.key} className="tbm-card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white">{area.label}</span>
              <span className={cn("text-sm font-bold", getColor(val))}>
                {val}/5 — {getLabel(val)}
              </span>
            </div>
            <p className="text-xs text-tbm-text-muted mb-3">{area.descripcion}</p>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={val}
              onChange={(e) => onChange(area.key, Number(e.target.value))}
              className="w-full accent-tbm-blue cursor-pointer"
            />
            <div className="flex justify-between text-xs text-tbm-text-muted mt-1">
              <span>1 Crítico</span>
              <span>5 Excelente</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Paso 3: Configurar rituales ─────────────────────────────────────────────
const RITUAL_MODES = [
  {
    id: "diario",
    label: "Diario",
    desc: "Warm Up todos los días + Cool Down todos los días",
    tag: "Situación crítica",
    tagColor: "text-tbm-red",
  },
  {
    id: "mode_a",
    label: "Modo A",
    desc: "Warm Up lunes + Cool Down viernes",
    tag: "Equipo muy productivo",
    tagColor: "text-tbm-green",
  },
  {
    id: "mode_b",
    label: "Modo B",
    desc: "Warm Up lunes + Cool Down martes",
    tag: "Equipo poco productivo",
    tagColor: "text-tbm-yellow",
  },
  {
    id: "mode_c",
    label: "Modo C",
    desc: "Warm Up y Cool Down el mismo día",
    tag: "Situación de alerta",
    tagColor: "text-tbm-yellow",
  },
];

function StepRituales({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-tbm-text-secondary">
        Podés cambiar esto en cualquier momento desde la configuración.
      </p>
      {RITUAL_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className={cn(
            "w-full text-left p-4 rounded-xl border transition-all",
            selected === m.id
              ? "border-tbm-blue bg-tbm-blue/10"
              : "border-tbm-border bg-tbm-surface hover:border-tbm-blue/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{m.label}</span>
            <span className={cn("text-xs font-medium", m.tagColor)}>
              {m.tag}
            </span>
          </div>
          <p className="text-sm text-tbm-text-secondary mt-1">{m.desc}</p>
        </button>
      ))}
    </div>
  );
}

// ── Paso 4: Invitar colaboradores ───────────────────────────────────────────
function StepInvitar({
  emails,
  onAdd,
  onRemove,
}: {
  emails: string[];
  onAdd: (e: string) => void;
  onRemove: (i: number) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const email = input.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email inválido");
      return;
    }
    if (emails.includes(email)) {
      setError("Ya agregaste ese email");
      return;
    }
    onAdd(email);
    setInput("");
    setError("");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-tbm-text-secondary">
        Podés invitar a todo tu equipo ahora o hacerlo más tarde desde Mi Equipo.
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="colaborador@empresa.com"
          className="tbm-input flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="tbm-btn-primary px-4"
        >
          Agregar
        </button>
      </div>

      {error && <p className="text-sm text-tbm-red">{error}</p>}

      {emails.length > 0 && (
        <div className="space-y-2">
          {emails.map((email, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-tbm-surface border border-tbm-border rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-tbm-blue" />
                <span className="text-sm text-white">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-tbm-text-muted hover:text-tbm-red text-xs"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="tbm-card p-4 border-tbm-blue/30 bg-tbm-blue/5">
        <p className="text-xs text-tbm-text-secondary">
          <span className="text-tbm-blue font-medium">Nota:</span> Cada
          colaborador recibirá un email para crear su cuenta. Podrán completar
          su perfil al aceptar la invitación.
        </p>
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
const STEPS = [
  { label: "Tu empresa",  icon: Building2  },
  { label: "Diagnóstico", icon: BarChart3  },
  { label: "Rituales",    icon: Users      },
  { label: "Tu equipo",   icon: Mail       },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado de cada paso
  const [empresa, setEmpresa] = useState({ sector: "", team_size: "" });
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SCORECARD_AREAS.map((a) => [a.key, 3]))
  );
  const [ritualMode, setRitualMode] = useState("mode_a");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);

  const canAdvance = () => {
    if (step === 0) return empresa.sector !== "" && empresa.team_size !== "";
    if (step === 1)
      return SCORECARD_AREAS.every((a) => scores[a.key] >= 1 && scores[a.key] <= 5);
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      // Guardar progreso intermedio
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_step: step + 1 })
          .eq("id", user.id);
      }
      setStep(step + 1);
      return;
    }
    // Último paso → guardar todo
    await handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("No se encontró la empresa");
      const companyId = profile.company_id;

      // 1. Actualizar datos de empresa
      const teamSizeNum = empresa.team_size
        ? parseInt(empresa.team_size.split("–")[0]) || parseInt(empresa.team_size)
        : null;

      await supabase
        .from("companies")
        .update({
          sector: empresa.sector,
          team_size: teamSizeNum,
          settings: { ritual_frequency: ritualMode, timezone: "America/Bogota" },
        })
        .eq("id", companyId);

      // 2. Guardar scorecard baseline
      await supabase.from("scorecards").insert({
        company_id: companyId,
        user_id: user.id,
        ...scores,
        is_baseline: true,
      });

      // 3. Enviar invitaciones
      for (const email of inviteEmails) {
        // Insertar registro de invitación (el email se envía vía Supabase Auth)
        await supabase.from("invitations").insert({
          company_id: companyId,
          invited_by: user.id,
          email,
          role: "colaborador",
        });

        // Enviar email de invitación vía Supabase Auth
        await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?company=${companyId}`,
          },
        });
      }

      // 4. Marcar onboarding como completado
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, onboarding_step: 4 })
        .eq("id", user.id);

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tbm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-tbm-blue text-sm font-medium mb-1">
            The Business Multiplier
          </p>
          <h1 className="text-2xl font-bold text-white">Configurá tu sistema</h1>
          <p className="text-tbm-text-secondary text-sm mt-1">
            Paso {step + 1} de {STEPS.length} — {STEPS[step].label}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i < step
                  ? "bg-tbm-green"
                  : i === step
                  ? "bg-tbm-blue"
                  : "bg-tbm-border"
              )}
            />
          ))}
        </div>

        {/* Step icon + title */}
        <div className="flex items-center gap-3 mb-6">
          {(() => {
            const Icon = STEPS[step].icon;
            return (
              <div className="w-10 h-10 rounded-xl bg-tbm-blue/10 border border-tbm-blue/30 flex items-center justify-center">
                <Icon className="w-5 h-5 text-tbm-blue" />
              </div>
            );
          })()}
          <h2 className="text-lg font-semibold text-white">{STEPS[step].label}</h2>
        </div>

        {/* Contenido del paso */}
        <div className="mb-8">
          {step === 0 && (
            <StepEmpresa
              data={empresa}
              onChange={(k, v) => setEmpresa((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 1 && (
            <StepScorecard
              scores={scores}
              onChange={(k, v) => setScores((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 2 && (
            <StepRituales selected={ritualMode} onSelect={setRitualMode} />
          )}
          {step === 3 && (
            <StepInvitar
              emails={inviteEmails}
              onAdd={(e) => setInviteEmails((p) => [...p, e])}
              onRemove={(i) =>
                setInviteEmails((p) => p.filter((_, idx) => idx !== i))
              }
            />
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-tbm-red/10 border border-tbm-red/30 text-tbm-red text-sm">
            {error}
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-sm text-tbm-text-secondary hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance() || loading}
            className="tbm-btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Ir al Dashboard
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Skip */}
        {step === STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full text-center text-xs text-tbm-text-muted hover:text-tbm-text-secondary mt-4 transition-colors"
          >
            Invitar después →
          </button>
        )}
      </div>
    </div>
  );
}
