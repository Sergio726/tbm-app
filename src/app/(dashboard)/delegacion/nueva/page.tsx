import { redirect } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { TaskWizard } from "@/components/delegacion/task-wizard";

export const dynamic = "force-dynamic";

export default async function NuevaTareaPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, los_level")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");

  // Solo el Arquitecto puede crear tareas
  if (profile.role !== "arquitecto") redirect("/delegacion");

  // Equipo disponible para asignar (excluye al propio arquitecto)
  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, cargo, los_level, disc_letters")
    .eq("company_id", profile.company_id)
    .neq("id", user.id)
    .order("full_name", { ascending: true });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
        color: "#fff",
      }}
    >
      {/* Back */}
      <Link
        href="/delegacion"
        className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
        style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}
      >
        <ArrowLeft size={14} />
        Delegación
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
            border: "1px solid rgba(91,138,255,0.25)",
            color: "#9fb9ff",
          }}
        >
          <Send size={18} strokeWidth={1.6} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
            Nueva tarea — Pase de Estafeta
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Los 5 puntos son obligatorios. Si falta uno, el error es tuyo.
          </p>
        </div>
      </div>

      <TaskWizard
        userId={user.id}
        companyId={profile.company_id}
        team={(team ?? []) as {
          id: string;
          full_name: string | null;
          cargo: string | null;
          los_level: number | null;
          disc_letters: string | null;
        }[]}
      />
    </div>
  );
}
