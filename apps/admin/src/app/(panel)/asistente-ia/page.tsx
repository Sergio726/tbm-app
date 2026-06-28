import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { getAiConfig, getAiUsage } from "./actions";
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
  const usage = await getAiUsage();
  const nf = new Intl.NumberFormat("es-AR");

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Asistente IA"
        subtitle="Configurá el proveedor, el modelo y la API key de DC. La key se guarda cifrada (Vault) y no se vuelve a mostrar."
      />
      {usage && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Uso · últimos 30 días</div>
          <div className="flex flex-wrap" style={{ gap: 24 }}>
            <Metric label="Tokens totales" value={nf.format(usage.totalTokens)} />
            <Metric label="Entrada" value={nf.format(usage.promptTokens)} />
            <Metric label="Salida" value={nf.format(usage.completionTokens)} />
            <Metric label="Mensajes" value={nf.format(usage.messages)} />
          </div>
        </Card>
      )}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}
