import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GrantForm } from "../grant-form";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  create_lider: "Alta de líder",
  grant_credits: "Carga de créditos",
};

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const { data: company } = await admin
    .from("companies")
    .select("id, name, sector, plan, owner_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!company) notFound();

  const [{ data: profiles }, { data: credits }, { data: ledger }, { data: audit }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, full_name, email, role, cargo, disc_status")
        .eq("company_id", id)
        .order("created_at", { ascending: true }),
      admin.from("company_credits").select("balance").eq("company_id", id).maybeSingle(),
      admin
        .from("credit_transactions")
        .select("id, delta, type, reason, created_at")
        .eq("company_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("audit_log")
        .select("id, action, after, created_at")
        .eq("target_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const members = profiles ?? [];
  const lider = members.find((m) => m.id === company.owner_id) ?? null;
  const balance = credits?.balance ?? 0;

  return (
    <div style={{ maxWidth: 920 }}>
      <Link href="/empresas" style={{ fontSize: 12.5, color: "var(--muted)" }}>
        ← Empresas
      </Link>
      <div className="flex items-center justify-between" style={{ gap: 16, margin: "10px 0 22px" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{company.name}</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {company.sector || "Sin sector"} · plan {company.plan ?? "—"} · alta{" "}
            {company.created_at ? new Date(company.created_at).toLocaleDateString("es-AR") : "—"}
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Créditos</span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{balance}</span>
          <GrantForm companyId={company.id} />
        </div>
      </div>

      {/* Líder */}
      <Section title="Líder (arquitecto)">
        {lider ? (
          <div style={{ fontSize: 13.5 }}>
            <strong>{lider.full_name || "Sin nombre"}</strong>
            {lider.cargo ? <span style={{ color: "var(--muted)" }}> · {lider.cargo}</span> : null}
            <div style={{ color: "var(--muted)", marginTop: 2 }}>{lider.email}</div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Esta empresa no tiene líder asignado.</p>
        )}
      </Section>

      {/* Miembros */}
      <Section title={`Equipo (${members.length})`}>
        <Table head={["Nombre", "Email", "Rol", "Cargo", "DISC"]}>
          {members.map((m) => (
            <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={td}>{m.full_name || "—"}</td>
              <td style={{ ...td, color: "var(--muted)" }}>{m.email || "—"}</td>
              <td style={td}>{m.role ?? "—"}</td>
              <td style={td}>{m.cargo ?? "—"}</td>
              <td style={td}>{m.disc_status ?? "—"}</td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Ledger de créditos */}
      <Section title="Movimientos de créditos">
        {ledger && ledger.length > 0 ? (
          <Table head={["Fecha", "Δ", "Tipo", "Motivo"]}>
            {ledger.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...td, color: "var(--muted)" }}>{fmt(t.created_at)}</td>
                <td style={{ ...td, fontWeight: 700, color: t.delta >= 0 ? "#34d399" : "#fca5a5" }}>
                  {t.delta >= 0 ? `+${t.delta}` : t.delta}
                </td>
                <td style={td}>{t.type}</td>
                <td style={{ ...td, color: "var(--muted)" }}>{t.reason ?? "—"}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin movimientos.</p>
        )}
      </Section>

      {/* Audit log */}
      <Section title="Historial de acciones (audit log)">
        {audit && audit.length > 0 ? (
          <Table head={["Fecha", "Acción", "Detalle"]}>
            {audit.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...td, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(a.created_at)}</td>
                <td style={td}>{ACTION_LABEL[a.action] ?? a.action}</td>
                <td style={{ ...td, color: "var(--muted)", fontFamily: "monospace", fontSize: 11.5 }}>
                  {a.after ? JSON.stringify(a.after) : "—"}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin acciones registradas.</p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#9bb8ff", marginBottom: 10 }}>
        {title}
      </h2>
      <div style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--panel)", padding: 16, overflow: "hidden" }}>
        {children}
      </div>
    </section>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ color: "var(--muted)", textAlign: "left" }}>
          {head.map((h) => (
            <th key={h} style={{ padding: "6px 10px", fontWeight: 600 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const td: React.CSSProperties = { padding: "8px 10px" };
