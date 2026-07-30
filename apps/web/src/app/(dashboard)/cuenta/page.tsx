import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile, NotificationPrefs } from "@/types/database";
import { AccountForm } from "@/components/account/account-form";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(name)")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  const companyName =
    (profile as { companies?: { name: string } | null }).companies?.name ?? null;

  // S23 · E1. Puede no existir: "sin fila" = todo activado (ver PREFS_DEFAULTS).
  const { data: prefs } = await supabase
    .from("notification_prefs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <AccountForm
      profile={profile as Profile}
      email={user.email ?? ""}
      companyName={companyName}
      notificationPrefs={(prefs as NotificationPrefs | null) ?? null}
    />
  );
}
