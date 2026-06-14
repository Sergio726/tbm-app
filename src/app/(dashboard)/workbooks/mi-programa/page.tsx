import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import type {
  Scorecard,
  WorkbookProgress,
  WorkbookResponse,
} from "@/types/database";
import { MiProgramaClient } from "@/components/workbooks/mi-programa-client";

export const dynamic = "force-dynamic";

export default async function MiProgramaPage() {
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
  if (!profile.onboarding_completed || !profile.company_id)
    redirect("/onboarding");
  if (profile.role !== "arquitecto") redirect("/dashboard");

  const [{ data: progressRows }, { data: responseRows }, { data: scorecardRows }] =
    await Promise.all([
      supabase.from("workbook_progress").select("*").eq("user_id", user.id),
      supabase
        .from("workbook_responses")
        .select("session_number, exercise_key, completed_at")
        .eq("user_id", user.id),
      supabase
        .from("scorecards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

  const allProgress = (progressRows ?? []) as WorkbookProgress[];
  const responses = (responseRows ?? []) as Pick<
    WorkbookResponse,
    "session_number" | "exercise_key" | "completed_at"
  >[];
  const scorecards = (scorecardRows ?? []) as Scorecard[];
  const baseline = scorecards.find((s) => s.is_baseline) ?? scorecards[0] ?? null;
  const latest =
    scorecards.length > 0 ? scorecards[scorecards.length - 1] : null;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        minHeight: "100vh",
        padding: "32px 36px 60px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <Link
        href="/workbooks"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/80"
      >
        <ArrowLeft size={14} />
        Workbooks
      </Link>

      <MiProgramaClient
        allProgress={allProgress}
        responses={responses}
        baseline={baseline}
        latest={latest}
      />
    </div>
  );
}
