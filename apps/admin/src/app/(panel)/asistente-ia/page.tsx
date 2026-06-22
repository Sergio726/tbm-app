import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { getAiConfig } from "./actions";
import { AiConfigForm } from "./ai-config-form";

export const dynamic = "force-dynamic";

export default async function AsistenteIaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/login");

  const config = await getAiConfig();

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Asistente IA"
        subtitle="Configurá el proveedor, el modelo y la API key de JARVIS. La key se guarda cifrada (Vault) y no se vuelve a mostrar."
      />
      {config ? (
        <Card>
          <AiConfigForm initial={config} />
        </Card>
      ) : (
        <p style={{ color: "#fca5a5", fontSize: 14 }}>
          No se pudo cargar la configuración (¿falta <code>SUPABASE_SERVICE_ROLE_KEY</code>?).
        </p>
      )}
    </div>
  );
}
