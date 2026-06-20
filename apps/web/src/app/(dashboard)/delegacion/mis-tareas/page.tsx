import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Task, Profile } from "@/types/database";
import { MisTareasClient } from "@/components/delegacion/mis-tareas-client";

export const dynamic = "force-dynamic";

export default async function MisTareasPage() {
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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, cargo, avatar_url, disc_letters, los_level")
    .eq("company_id", profile.company_id!)
    .order("full_name", { ascending: true });

  return (
    <MisTareasClient
      tasks={(tasks ?? []) as Task[]}
      team={(team ?? []) as Profile[]}
      currentUserId={user.id}
    />
  );
}
