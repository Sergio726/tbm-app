import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrearLiderForm } from "./crear-lider-form";

export const dynamic = "force-dynamic";

export default async function NuevaEmpresaPage() {
  // Defensa en profundidad: el guard del layout ya cubre, re-verificamos igual.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/login");

  return (
    <div style={{ maxWidth: 560 }}>
      <Link href="/empresas" style={{ fontSize: 12.5, color: "var(--muted)" }}>
        ← Empresas
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 4px" }}>Nueva empresa</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>
        Crea el líder (arquitecto) y su empresa. Se genera una contraseña temporal que verás
        una sola vez para compartirla con el piloto.
      </p>
      <CrearLiderForm />
    </div>
  );
}
