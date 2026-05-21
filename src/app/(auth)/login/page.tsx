import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

/**
 * Pantalla de login.
 * Server-side guard: si ya hay sesión activa, redirige a /dashboard
 * antes de renderizar el formulario (defense in depth + middleware).
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return <LoginForm />;
}
