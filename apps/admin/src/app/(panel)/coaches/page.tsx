import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui";
import { CoachesManager, type CoachRow } from "./coaches-manager";

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/login");

  const admin = createAdminClient();
  if (!admin) {
    return (
      <p style={{ color: "#fca5a5", fontSize: 14 }}>
        Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno del panel admin.
      </p>
    );
  }

  const [{ data: coachProfiles }, { data: assigns }, { data: companies }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email").eq("role", "coach"),
    admin.from("coach_assignments").select("coach_id, company_id"),
    admin.from("companies").select("id, name").order("name", { ascending: true }),
  ]);

  const nameById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  // Unir coaches por rol + cualquier coach_id presente en asignaciones.
  const coachIds = new Set<string>((coachProfiles ?? []).map((c) => c.id));
  for (const a of assigns ?? []) coachIds.add(a.coach_id);

  // Completar perfiles faltantes (coaches asignados sin rol 'coach').
  const knownIds = new Set((coachProfiles ?? []).map((c) => c.id));
  const missing = [...coachIds].filter((id) => !knownIds.has(id));
  const { data: extraProfiles } = missing.length
    ? await admin.from("profiles").select("id, full_name, email").in("id", missing)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const profileById = new Map(
    [...(coachProfiles ?? []), ...(extraProfiles ?? [])].map((p) => [p.id, p])
  );

  const coaches: CoachRow[] = [...coachIds].map((id) => {
    const p = profileById.get(id);
    return {
      id,
      full_name: p?.full_name ?? null,
      email: p?.email ?? null,
      companies: (assigns ?? [])
        .filter((a) => a.coach_id === id)
        .map((a) => ({ companyId: a.company_id, name: nameById.get(a.company_id) ?? "—" })),
    };
  });

  return (
    <div>
      <PageHeader
        title="Coaches"
        subtitle={`${coaches.length} ${coaches.length === 1 ? "coach" : "coaches"} en la plataforma.`}
      />
      <CoachesManager coaches={coaches} companies={companies ?? []} />
    </div>
  );
}
