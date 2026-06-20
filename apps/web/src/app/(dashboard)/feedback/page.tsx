import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile, Feedback } from "@/types/database";
import { FeedbackClient } from "@/components/feedback/feedback-client";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
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

  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, cargo, disc_letters, disc_state, disc_temor, avatar_url, role")
    .eq("company_id", profile.company_id!)
    .neq("id", user.id)
    .order("full_name", { ascending: true });

  const { data: feedbacks } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: false });

  return (
    <FeedbackClient
      currentProfile={profile as Profile}
      team={(team ?? []) as Profile[]}
      initialFeedbacks={(feedbacks ?? []) as Feedback[]}
    />
  );
}
