import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, BarChart3, ArrowRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile, WorkbookProgress } from "@/types/database";
import { SessionsGrid } from "@/components/workbooks/sessions-grid";

export const dynamic = "force-dynamic";

export default async function WorkbooksPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (!profile.onboarding_completed || !profile.company_id) redirect("/onboarding");
  if (profile.role !== "arquitecto") redirect("/dashboard");

  const companyId = profile.company_id!;

  // Fetch all progress rows for this user
  const { data: progress } = await supabase
    .from("workbook_progress")
    .select("*")
    .eq("user_id", user.id);

  const allProgress = (progress ?? []) as WorkbookProgress[];

  // Auto-inicializar Sesión 1 si aún no existe (para empezar a contar los 7 días)
  const hasS1 = allProgress.some((p) => p.session_number === 1);
  if (!hasS1) {
    const { data: inserted } = await supabase
      .from("workbook_progress")
      .upsert(
        {
          company_id: companyId,
          user_id: user.id,
          session_number: 1,
          pct_complete: 0,
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: "user_id,session_number" }
      )
      .select()
      .single();
    if (inserted) allProgress.push(inserted as WorkbookProgress);
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
                border: "1px solid rgba(91,138,255,0.25)",
                color: "#9fb9ff",
              }}
            >
              <BookOpen size={18} strokeWidth={1.6} />
            </div>
            <h1
              className="text-white"
              style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}
            >
              Workbooks
            </h1>
          </div>
          <p
            style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 52 }}
          >
            Programa TBM — 8 sesiones interactivas que transforman el conocimiento en acción concreta
          </p>
        </div>
        <Link
          href="/workbooks/mi-programa"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition hover:bg-white/[0.05]"
          style={{
            background: "rgba(91,138,255,0.10)",
            borderColor: "rgba(91,138,255,0.30)",
            color: "#bcd0ff",
          }}
        >
          <BarChart3 size={15} />
          Mi Programa
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Info banner */}
      <div
        className="mb-6 rounded-2xl border p-4"
        style={{
          background: "rgba(91,138,255,0.06)",
          borderColor: "rgba(91,138,255,0.15)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "rgba(91,138,255,0.2)", color: "#9fb9ff" }}
          >
            i
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Metodología de desbloqueo</p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Cada sesión se desbloquea automáticamente 7 días después de completar la anterior al 100%.
              Si la completás antes, podés solicitar avance anticipado desde dentro de la sesión.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de sesiones */}
      <SessionsGrid allProgress={allProgress} />
    </div>
  );
}
