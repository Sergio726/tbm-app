import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type { MultiplicadorDiagnostic } from "@/types/database";
import { MultiplicadorClient } from "@/components/multiplicador/multiplicador-client";

export const dynamic = "force-dynamic";

export default async function MultiplicadorPage() {
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

  // Historial de diagnósticos (el más reciente primero) — el último alimenta
  // la vista de resultados y los previos la evolución.
  const { data: history } = await supabase
    .from("multiplicador_diagnostics")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })
    .limit(12);

  const diagnostics = (history as MultiplicadorDiagnostic[]) ?? [];

  return (
    <div
      className="text-white"
      style={{
        padding: "32px 40px 60px",
        maxWidth: 880,
        margin: "0 auto",
        width: "100%",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-white/55 transition hover:text-white/80"
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <header className="mb-7">
        <div className="mb-2.5 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #fbbf2422, #fbbf240a)",
              border: "1px solid rgba(251,191,36,0.25)",
              color: "#fcd34d",
            }}
          >
            <Zap size={18} strokeWidth={1.7} />
          </div>
          <div>
            <h1
              className="m-0"
              style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}
            >
              Multiplicador de Liderazgo
            </h1>
            <p className="mt-0.5 text-[12.5px] text-white/55">
              Diagnóstico ROI de Talento · ¿Multiplicás o disminuís a tu equipo?
            </p>
          </div>
        </div>
        <p className="max-w-[640px] text-[13.5px] leading-relaxed text-white/60">
          Los Multiplicadores obtienen el <strong className="text-white/80">97%</strong> de la
          inteligencia de su equipo. Los Disminuidores, solo el{" "}
          <strong className="text-white/80">48%</strong>. Respondé sin filtros: este
          diagnóstico mide tus 3 Pecados del Disminuidor y te devuelve las
          herramientas para corregirlos. Repetilo cada mes para ver tu evolución.
        </p>
      </header>

      <MultiplicadorClient
        userId={user.id}
        companyId={profile.company_id}
        history={diagnostics}
      />
    </div>
  );
}
