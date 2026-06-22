import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrearLiderForm } from "./crear-lider-form";
import { PageHeader } from "@/components/ui";

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
    <div style={{ maxWidth: 600 }}>
      <PageHeader
        back={
          <Link href="/empresas" style={{ fontSize: 12.5, color: "var(--muted)" }}>
            ← Empresas
          </Link>
        }
        title="Nueva empresa"
        subtitle="Crea el líder (arquitecto) y su empresa. Se genera una contraseña temporal que verás una sola vez para compartirla con el piloto."
      />
      <CrearLiderForm />
    </div>
  );
}
