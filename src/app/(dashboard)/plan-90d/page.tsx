import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, isoMonday } from "@/lib/dates";
import type { Profile, Rock, IdeaParking, Decision, LeadingIndicator } from "@/types/database";
import { PlanClient } from "@/components/plan-90d/plan-client";

export const dynamic = "force-dynamic";

export default async function Plan90dPage() {
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
  const weekDate = isoDate(isoMonday());

  const [
    { data: rocks },
    { data: indicators },
    { data: ideas },
    { data: decisions },
    { data: team },
  ] = await Promise.all([
    supabase
      .from("rocks")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("leading_indicators")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("idea_parking")
      .select("*")
      .eq("company_id", companyId)
      .order("parked_at", { ascending: false }),
    supabase
      .from("decisions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, cargo, disc_letters")
      .eq("company_id", companyId)
      .order("full_name", { ascending: true }),
  ]);

  return (
    <PlanClient
      currentProfile={profile as Profile}
      initialRocks={(rocks ?? []) as Rock[]}
      initialIndicators={(indicators ?? []) as LeadingIndicator[]}
      weekDate={weekDate}
      initialIdeas={(ideas ?? []) as IdeaParking[]}
      initialDecisions={(decisions ?? []) as Decision[]}
      team={(team ?? []) as Pick<Profile, "id" | "full_name" | "cargo" | "disc_letters">[]}
    />
  );
}
