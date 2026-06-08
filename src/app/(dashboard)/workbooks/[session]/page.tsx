import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile, WorkbookResponse, WorkbookProgress } from "@/types/database";
import { SESSIONS } from "@/lib/workbook-sessions";
import { isSessionUnlocked } from "@/lib/workbook-sessions";
import { WorkbookClient } from "@/components/workbooks/workbook-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ session: string }>;
}

export default async function WorkbookSessionPage({ params }: Props) {
  const { session: sessionParam } = await params;
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

  // Validar parámetro de sesión
  const sessionNum = parseInt(sessionParam, 10);
  if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 4) redirect("/workbooks");

  const sessionDef = SESSIONS.find((s) => s.number === sessionNum);
  if (!sessionDef) redirect("/workbooks");

  const companyId = profile.company_id!;

  // Fetch: all progress, responses de esta sesión, team
  const [{ data: progressRows }, { data: responseRows }, { data: teamRows }] = await Promise.all([
    supabase.from("workbook_progress").select("*").eq("user_id", user.id),
    supabase
      .from("workbook_responses")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_number", sessionNum),
    supabase
      .from("profiles")
      .select("id, full_name, cargo, disc_letters, disc_state, disc_temor")
      .eq("company_id", companyId)
      .order("full_name", { ascending: true }),
  ]);

  const allProgress = (progressRows ?? []) as WorkbookProgress[];
  const responses = (responseRows ?? []) as WorkbookResponse[];
  const team = (teamRows ?? []) as Pick<
    Profile,
    "id" | "full_name" | "cargo" | "disc_letters" | "disc_state" | "disc_temor"
  >[];

  // Guard: si la sesión está bloqueada, redirigir al overview
  if (!isSessionUnlocked(sessionNum, allProgress)) {
    redirect("/workbooks");
  }

  // Auto-crear progress row si no existe (para registrar unlocked_at)
  const hasProgress = allProgress.some((p) => p.session_number === sessionNum);
  if (!hasProgress) {
    const { data: inserted } = await supabase
      .from("workbook_progress")
      .upsert(
        {
          company_id: companyId,
          user_id: user.id,
          session_number: sessionNum,
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
    <WorkbookClient
      session={sessionDef}
      responses={responses}
      allProgress={allProgress}
      team={team}
      currentProfile={profile as Profile}
    />
  );
}
