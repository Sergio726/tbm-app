import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Task } from "@/types/database";
import { AntiBoomerangForm } from "@/components/delegacion/anti-boomerang-form";

export const dynamic = "force-dynamic";

export default async function BlockedPage({
  params,
}: {
  params: { taskId: string };
}) {
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

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", params.taskId)
    .single();

  // La tarea no existe, no le pertenece, o ya está bloqueada/completada
  if (!task || task.assigned_to !== user.id) redirect("/delegacion/mis-tareas");
  if (task.status === "blocked" || task.status === "done") redirect("/delegacion/mis-tareas");

  return <AntiBoomerangForm task={task as Task} currentUserId={user.id} />;
}
