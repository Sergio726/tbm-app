import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/ui";
import { getEmailConfig } from "./actions";
import { EmailConfigForm } from "./email-config-form";

export const dynamic = "force-dynamic";

export default async function CorreoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/login");

  const config = await getEmailConfig();

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Configuración de correo"
        subtitle="Remitente, reply-to y casilla de soporte de los mails que envía la app (Resend). La API key se guarda cifrada (Vault)."
      />
      {config ? (
        <Card>
          <EmailConfigForm initial={config} />
        </Card>
      ) : (
        <p style={{ color: "#fca5a5", fontSize: 14 }}>
          No se pudo cargar la configuración (¿falta <code>SUPABASE_SERVICE_ROLE_KEY</code>?).
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>
            Mails de acceso (magic links / invitaciones)
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--faint)", lineHeight: 1.55, margin: 0 }}>
            Los correos de <strong>autenticación</strong> (invitaciones, recuperar contraseña) los
            envía Supabase, no esta app, y se configuran aparte en{" "}
            <strong>Supabase → Authentication → SMTP Settings</strong>. Para que salgan de tu dominio,
            cargá ahí el SMTP de Resend (host <code>smtp.resend.com</code>, port <code>465</code>,
            user <code>resend</code>, pass = una API key de Resend) con el mismo remitente verificado.
            Detalle en <code>docs/EMAIL_ADMIN_CONFIG.md</code>.
          </p>
        </Card>
      </div>
    </div>
  );
}
