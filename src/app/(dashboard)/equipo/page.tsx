import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { EquipoClient } from "@/components/equipo/equipo-client";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
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
  if (!profile.onboarding_completed) redirect("/onboarding");

  // Todo el equipo de la empresa (RLS deja al arquitecto ver a todos).
  const { data: team } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  // Tests DISC de la empresa (para mostrar link/estado por miembro).
  const { data: assessments } = await supabase
    .from("disc_assessments")
    .select("id, token, profile_id, status, completed_at")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: false });

  const isArquitecto = profile.role === "arquitecto";

  return (
    <EquipoClient
      team={(team ?? []) as Profile[]}
      currentUserId={user.id}
      companyId={profile.company_id!}
      isArquitecto={isArquitecto}
      assessments={assessments ?? []}
    />
  );
}
