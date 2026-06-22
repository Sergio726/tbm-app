import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2 } from "lucide-react";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { GrantForm } from "./grant-form";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  // Defensa en profundidad: re-verificar admin antes de usar service-role.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect("/login");

  const admin = createAdminClient();
  if (!admin) {
    return (
      <p style={{ color: "#fca5a5", fontSize: 14 }}>
        Falta <code>SUPABASE_SERVICE_ROLE_KEY</code> en el entorno del panel admin.
      </p>
    );
  }

  const [{ data: companies }, { data: profiles }, { data: credits }] = await Promise.all([
    admin
      .from("companies")
      .select("id, name, plan, status, owner_id, created_at")
      .order("created_at", { ascending: true }),
    admin.from("profiles").select("id, company_id, role"),
    admin.from("company_credits").select("company_id, balance"),
  ]);

  const countByCompany = new Map<string, number>();
  for (const p of profiles ?? []) {
    if (p.company_id) countByCompany.set(p.company_id, (countByCompany.get(p.company_id) ?? 0) + 1);
  }
  const balanceByCompany = new Map<string, number>();
  for (const c of credits ?? []) balanceByCompany.set(c.company_id, c.balance);

  const rows = companies ?? [];

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle={`${rows.length} ${rows.length === 1 ? "empresa" : "empresas"} en la plataforma.`}
        actions={
          <Link href="/empresas/nueva" className="adm-btn adm-btn-primary">
            + Nueva empresa
          </Link>
        }
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", color: "var(--muted)", textAlign: "left" }}>
              <th scope="col" style={th}>Empresa</th>
              <th scope="col" style={th}>Estado</th>
              <th scope="col" style={th}>Plan</th>
              <th scope="col" style={th}>Usuarios</th>
              <th scope="col" style={th}>Créditos</th>
              <th scope="col" style={th}>Alta</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 0 }}>
                  <EmptyState
                    icon={<Building2 size={26} strokeWidth={1.5} />}
                    title="Todavía no hay empresas"
                    hint="Creá la primera con “+ Nueva empresa”."
                  />
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ ...td, fontWeight: 600 }}>
                    <Link href={`/empresas/${c.id}`} style={{ color: "#9bb8ff" }}>
                      {c.name}
                    </Link>
                  </td>
                  <td style={td}>
                    {c.status === "suspended" ? (
                      <Badge tone="bad">Suspendida</Badge>
                    ) : (
                      <Badge tone="ok">Activa</Badge>
                    )}
                  </td>
                  <td style={td}>{c.plan ?? "—"}</td>
                  <td style={td}>{countByCompany.get(c.id) ?? 0}</td>
                  <td style={td}>
                    <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
                      <span style={{ fontWeight: 700, minWidth: 24 }}>{balanceByCompany.get(c.id) ?? 0}</span>
                      <GrantForm companyId={c.id} />
                    </div>
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("es-AR") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 12 }}>
        1 crédito = 1 test DISC. Cargá créditos por empresa (queda en el ledger con motivo). Usá un
        número negativo para ajustar/descontar.
      </p>
    </div>
  );
}

const th: React.CSSProperties = { padding: "11px 14px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "11px 14px" };
