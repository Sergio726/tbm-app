import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
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

  return (
    <AccountForm
      profile={profile as Profile}
      email={user.email ?? ""}
      companyName={companyName}
    />
  );
}
