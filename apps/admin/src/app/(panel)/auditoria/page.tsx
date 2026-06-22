import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader, Card, Badge, type Tone } from "@/components/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const ACTION: Record<string, { label: string; tone: Tone }> = {
  create_lider: { label: "Alta de líder", tone: "ok" },
  grant_credits: { label: "Carga de créditos", tone: "accent" },
  edit_company: { label: "Edición de empresa", tone: "muted" },
  suspend_company: { label: "Empresa suspendida", tone: "bad" },
  reactivate_company: { label: "Empresa reactivada", tone: "ok" },
  assign_coach: { label: "Coach asignado", tone: "accent" },
  unassign_coach: { label: "Coach quitado", tone: "muted" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "Todas" },
  { key: "create_lider", label: "Altas" },
  { key: "grant_credits", label: "Créditos" },
  { key: "edit_company", label: "Ediciones" },
  { key: "suspend_company", label: "Suspensiones" },
  { key: "assign_coach", label: "Coaches" },
];

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const action = sp.action ?? "";
  const page = Math.max(0, Number.parseInt(sp.page ?? "0", 10) || 0);

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

  let query = admin
    .from("audit_log")
    .select("id, action, target_id, after, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  if (action) query = query.eq("action", action);

  const { data: rows, count } = await query;

  // Resolver nombres de empresa por target_id.
  const companyIds = [...new Set((rows ?? []).map((r) => r.target_id).filter(Boolean) as string[])];
  const { data: companies } = companyIds.length
    ? await admin.from("companies").select("id, name").in("id", companyIds)
    : { data: [] as { id: string; name: string }[] };
  const nameById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  const total = count ?? 0;
  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < total;
  const qs = (p: number) => `/auditoria?${action ? `action=${action}&` : ""}page=${p}`;

  return (
    <div>
      <PageHeader
        title="Auditoría"
        subtitle={`${total} ${total === 1 ? "acción registrada" : "acciones registradas"}.`}
      />

      <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const active = f.key === action;
          return (
            <Link
              key={f.key || "all"}
              href={`/auditoria${f.key ? `?action=${f.key}` : ""}`}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 600,
                color: active ? "#9bb8ff" : "var(--muted)",
                background: active ? "var(--accent-soft)" : "transparent",
                border: `1px solid ${active ? "rgba(91,138,255,0.4)" : "var(--border)"}`,
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", color: "var(--muted)", textAlign: "left" }}>
              <th style={th}>Fecha</th>
              <th style={th}>Acción</th>
              <th style={th}>Empresa</th>
              <th style={th}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...td, color: "var(--muted)" }}>
                  Sin acciones para este filtro.
                </td>
              </tr>
            ) : (
              (rows ?? []).map((r) => {
                const meta = ACTION[r.action] ?? { label: r.action, tone: "muted" as Tone };
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ ...td, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(r.created_at)}</td>
                    <td style={td}>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td style={td}>
                      {r.target_id && nameById.has(r.target_id) ? (
                        <Link href={`/empresas/${r.target_id}`} style={{ color: "#9bb8ff" }}>
                          {nameById.get(r.target_id)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ ...td, color: "var(--muted)", fontFamily: "monospace", fontSize: 11.5 }}>
                      {r.after ? JSON.stringify(r.after) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
          {hasPrev ? (
            <Link href={qs(page - 1)} className="adm-btn adm-btn-ghost">
              ← Anteriores
            </Link>
          ) : (
            <span />
          )}
          <span style={{ fontSize: 12, color: "var(--faint)" }}>
            Página {page + 1} de {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
          {hasNext ? (
            <Link href={qs(page + 1)} className="adm-btn adm-btn-ghost">
              Siguientes →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "11px 14px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "11px 14px" };
