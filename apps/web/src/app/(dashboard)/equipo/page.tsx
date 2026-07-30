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
  const { data: team, error: teamError } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  // El equipo es la data crítica de esta pantalla: si falla, avisar en vez de
  // mostrar un equipo vacío indistinguible de "sin datos".
  if (teamError) {
    console.error("equipo: error cargando el equipo", teamError);
    return <EquipoError />;
  }

  // Tests DISC de la empresa (para mostrar link/estado por miembro).
  const { data: assessments, error: assessmentsError } = await supabase
    .from("disc_assessments")
    .select("id, token, profile_id, status, completed_at")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: false });
  if (assessmentsError) console.error("equipo: error cargando assessments", assessmentsError);

  // Matriz de Autoridad de la empresa
  const { data: authorityMatrix, error: authorityError } = await supabase
    .from("authority_matrix")
    .select("*")
    .eq("company_id", profile.company_id!)
    .maybeSingle();
  if (authorityError) console.error("equipo: error cargando authority_matrix", authorityError);

  // Fichas de rol (S22 · §I1). El RLS decide el alcance solo: el Arquitecto
  // recibe las de su empresa; un colaborador, únicamente la suya.
  const { data: charters, error: chartersError } = await supabase
    .from("role_charters")
    .select("*")
    .eq("company_id", profile.company_id!);
  if (chartersError) console.error("equipo: error cargando role_charters", chartersError);

  const isArquitecto = profile.role === "arquitecto";

  // Saldo de créditos de la empresa (Fase 2 A3) — para el indicador del Arquitecto.
  const { data: credits } = await supabase
    .from("company_credits")
    .select("balance")
    .eq("company_id", profile.company_id!)
    .maybeSingle();

  // Invitaciones pendientes (aún no aceptadas) — solo para el panel del Arquitecto.
  const { data: pendingInvites } = isArquitecto
    ? await supabase
        .from("invitations")
        .select("id, email, created_at, expires_at")
        .eq("company_id", profile.company_id!)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <EquipoClient
      team={(team ?? []) as Profile[]}
      currentUserId={user.id}
      companyId={profile.company_id!}
      isArquitecto={isArquitecto}
      assessments={assessments ?? []}
      authorityMatrix={authorityMatrix ?? null}
      charters={charters ?? []}
      creditBalance={credits?.balance ?? 0}
      pendingInvites={pendingInvites ?? []}
    />
  );
}

function EquipoError() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-5 py-[30px] text-fg md:px-10">
      <div className="mx-auto mt-10 max-w-[480px] rounded-2xl border border-[#f87171]/30 bg-[#2a1416]/60 p-7 text-center">
        <div className="mb-2 text-3xl">⚠️</div>
        <h1 className="text-[17px] font-bold text-fg">No pudimos cargar tu equipo</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          Hubo un error al consultar los datos. Recargá la página; si el problema persiste,
          revisá tu conexión o intentá de nuevo en unos minutos.
        </p>
      </div>
    </main>
  );
}
