import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const ACTION: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "accent" | "muted" }> = {
  create_lider: { label: "Alta de líder", tone: "ok" },
  grant_credits: { label: "Carga de créditos", tone: "accent" },
  edit_company: { label: "Edición de empresa", tone: "muted" },
  suspend_company: { label: "Empresa suspendida", tone: "bad" },
  reactivate_company: { label: "Empresa reactivada", tone: "ok" },
  assign_coach: { label: "Coach asignado", tone: "accent" },
  unassign_coach: { label: "Coach quitado", tone: "muted" },
};

export default async function PanelHome() {
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

  const [{ data: companies }, { data: profiles }, { data: credits }, { data: assigns }, { data: audit }] =
    await Promise.all([
      admin.from("companies").select("id, status"),
      admin.from("profiles").select("role"),
      admin.from("company_credits").select("balance"),
      admin.from("coach_assignments").select("coach_id"),
      admin
        .from("audit_log")
        .select("id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const total = companies?.length ?? 0;
  const suspended = (companies ?? []).filter((c) => c.status === "suspended").length;
  const active = total - suspended;
  const creditsInCirculation = (credits ?? []).reduce((s, c) => s + (c.balance ?? 0), 0);
  const lideres = (profiles ?? []).filter((p) => p.role === "arquitecto").length;
  const colaboradores = (profiles ?? []).filter((p) => p.role === "colaborador").length;
  const coaches = new Set((assigns ?? []).map((a) => a.coach_id)).size;

  return (
    <div>
      <PageHeader
        title="Inicio"
        subtitle="Resumen de la plataforma."
        actions={
          <Link href="/empresas/nueva" className="adm-btn adm-btn-primary">
            + Nueva empresa
          </Link>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard label="Empresas" value={total} hint={`${active} activas · ${suspended} suspendidas`} />
        <StatCard label="Créditos en circulación" value={creditsInCirculation} tone="ok" hint="1 crédito = 1 test DISC" />
        <StatCard label="Líderes" value={lideres} tone="accent" hint={`${colaboradores} colaboradores`} />
        <StatCard label="Coaches" value={coaches} tone="warn" hint="con empresas asignadas" />
      </div>

      <section style={{ marginTop: 28 }}>
        <SectionTitle>Últimas acciones</SectionTitle>
        <Card style={{ padding: 8 }}>
          {audit && audit.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {audit.map((a) => {
                const meta = ACTION[a.action] ?? { label: a.action, tone: "muted" as const };
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between"
                    style={{ gap: 12, padding: "10px 12px", borderBottom: "1px solid var(--border)" }}
                  >
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span style={{ fontSize: 12, color: "var(--faint)" }}>
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })
                        : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: 12, margin: 0 }}>
              Todavía no hay acciones registradas.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
