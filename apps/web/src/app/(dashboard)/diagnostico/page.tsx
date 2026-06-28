import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LineChart } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type { Scorecard } from "@/types/database";
import { DiagnosticoForm } from "@/components/diagnostico/diagnostico-form";

export const dynamic = "force-dynamic";

export default async function DiagnosticoPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, company_id, role, onboarding_completed")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (!profile.onboarding_completed || !profile.company_id) redirect("/onboarding");
  if (profile.role !== "arquitecto") redirect("/dashboard");

  // Último scorecard para pre-rellenar — el usuario solo ajusta lo que cambió
  const { data: lastScorecard } = await supabase
    .from("scorecards")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div
      className="text-fg"
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px) 60px",
        maxWidth: 880,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-fg-muted transition hover:text-fg"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <header className="mb-7">
        <div className="mb-2.5 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "var(--accent-text)",
            }}
          >
            <LineChart size={18} strokeWidth={1.7} />
          </div>
          <div>
            <h1
              className="m-0"
              style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}
            >
              Diagnóstico Organizacional TBM
            </h1>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">
              Re-evaluación de las 8 áreas · los semáforos del Dashboard se
              actualizan al guardar
            </p>
          </div>
        </div>
        <p className="max-w-[640px] text-[13.5px] leading-relaxed text-fg-muted">
          Evaluá tu empresa hoy, sin filtros.{" "}
          {lastScorecard
            ? "Pre-cargamos tu última evaluación — ajustá solo lo que cambió desde entonces."
            : "Esta va a ser tu evaluación inicial."}{" "}
          La comparativa Día 1 vs. hoy vive en{" "}
          <Link href="/workbooks/mi-programa" className="text-[#9fb9ff] underline">
            Mi Programa
          </Link>
          .
        </p>
      </header>

      <DiagnosticoForm
        userId={user.id}
        companyId={profile.company_id}
        lastScorecard={(lastScorecard as Scorecard) ?? null}
      />
    </div>
  );
}
