import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type {
  LeadingIndicator,
  Profile,
  Rock,
  Scorecard,
  WeeklyReport,
} from "@/types/database";
import type { WeeklyReportPayload } from "@/lib/rituales/weekly-report";
import { PrintBar } from "@/components/export/print-bar";
import { ExportShell } from "@/components/export/export-shell";
import {
  ExportDiagnostico,
  ExportPlan90d,
  ExportEquipo,
  ExportSemana,
} from "@/components/export/export-views";

export const dynamic = "force-dynamic";

const TIPOS = {
  diagnostico: {
    title: "Diagnóstico Organizacional TBM",
    subtitle: "Las 8 áreas del negocio · Día 1 vs hoy",
    back: "/diagnostico",
  },
  "plan-90d": {
    title: "Plan 90D",
    subtitle: "Rocas del trimestre y Leading Indicators",
    back: "/plan-90d",
  },
  equipo: {
    title: "Perfil del equipo",
    subtitle: "DISC · niveles LOS · número único por rol",
    back: "/equipo",
  },
  semana: {
    title: "Reporte Semanal",
    subtitle: "Victorias, adherencia a rituales y Los 5 Grandes",
    back: "/rituales/cool-down/reporte",
  },
} as const;

type Tipo = keyof typeof TIPOS;

interface Props {
  params: Promise<{ tipo: string }>;
}

export default async function ExportPage({ params }: Props) {
  const { tipo: tipoParam } = await params;
  if (!(tipoParam in TIPOS)) redirect("/dashboard");
  const tipo = tipoParam as Tipo;
  const meta = TIPOS[tipo];

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, companies(name)")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");
  if (profile.role !== "arquitecto") redirect("/dashboard");

  const companyId = profile.company_id;
  const companyName =
    (profile as { companies?: { name: string } | null }).companies?.name ?? "Mi Empresa";

  // Fetch según tipo
  let body: React.ReactNode = null;

  if (tipo === "diagnostico") {
    const { data } = await supabase
      .from("scorecards")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });
    const history = (data ?? []) as Scorecard[];
    const baseline = history.find((s) => s.is_baseline) ?? history[0] ?? null;
    const latest = history.at(-1) ?? null;
    body = <ExportDiagnostico baseline={baseline} latest={latest} />;
  }

  if (tipo === "plan-90d") {
    const [{ data: rocks }, { data: indicators }, { data: team }] = await Promise.all([
      supabase
        .from("rocks")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false }),
      supabase
        .from("leading_indicators")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true),
      supabase.from("profiles").select("id, full_name").eq("company_id", companyId),
    ]);
    body = (
      <ExportPlan90d
        rocks={(rocks ?? []) as Rock[]}
        indicators={(indicators ?? []) as LeadingIndicator[]}
        team={(team ?? []) as Pick<Profile, "id" | "full_name">[]}
      />
    );
  }

  if (tipo === "equipo") {
    const { data: team } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", companyId)
      .order("role", { ascending: true })
      .order("full_name", { ascending: true });
    body = <ExportEquipo team={(team ?? []) as Profile[]} />;
  }

  if (tipo === "semana") {
    const { data: report } = await supabase
      .from("weekly_reports")
      .select("*")
      .eq("company_id", companyId)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    const r = report as WeeklyReport | null;
    body = r ? (
      <ExportSemana
        payload={r.payload as unknown as WeeklyReportPayload}
        weekStart={r.week_start}
        weekEnd={r.week_end}
      />
    ) : (
      <p className="text-[13px] text-slate-500">
        Todavía no hay un Reporte Semanal generado. Se crea automáticamente con el
        Cool Down del viernes.
      </p>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#f4f6fb", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 820, padding: "24px 24px 60px" }}>
        <PrintBar backHref={meta.back} title={`Exportar · ${meta.title}`} />
        <div
          className="tbm-export-page rounded-2xl border bg-white p-8"
          style={{ borderColor: "#e2e8f0", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}
        >
          <ExportShell title={meta.title} subtitle={meta.subtitle} companyName={companyName}>
            {body}
          </ExportShell>
        </div>
      </div>
    </div>
  );
}
