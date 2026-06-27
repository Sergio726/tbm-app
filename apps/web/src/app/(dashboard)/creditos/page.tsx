import { redirect } from "next/navigation";
import { CreditCard, Ticket, Info, Mail, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import {
  creditTypeLabel,
  formatCreditDate,
  buildCreditRequestMailto,
} from "@/lib/credits";

export const dynamic = "force-dynamic";

type Tx = {
  id: string;
  delta: number;
  type: string;
  reason: string | null;
  created_at: string;
};

export default async function CreditosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id, companies(name)")
    .eq("id", user.id)
    .single();

  // Los créditos son de la empresa y solo el Arquitecto los gestiona.
  if (profile?.role !== "arquitecto" || !profile.company_id) redirect("/dashboard");

  const companyName = (profile.companies as { name: string } | null)?.name ?? null;

  const [{ data: credits }, { data: txs }] = await Promise.all([
    supabase
      .from("company_credits")
      .select("balance")
      .eq("company_id", profile.company_id)
      .maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("id, delta, type, reason, created_at")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const balance = credits?.balance ?? 0;
  const history = (txs ?? []) as Tx[];
  const low = balance > 0 && balance <= 3;
  const accent = balance === 0 ? "#fca5a5" : low ? "#fbbf24" : "#9bb8ff";
  const accentBg =
    balance === 0
      ? "rgba(248,113,113,0.10)"
      : low
        ? "rgba(251,191,36,0.10)"
        : "rgba(91,138,255,0.10)";
  const accentBorder =
    balance === 0
      ? "rgba(248,113,113,0.3)"
      : low
        ? "rgba(251,191,36,0.3)"
        : "rgba(91,138,255,0.25)";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #070a12 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 36px)",
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #5b8aff22, #5b8aff0a)",
              border: "1px solid rgba(91,138,255,0.25)",
              color: "#9fb9ff",
            }}
          >
            <CreditCard size={18} strokeWidth={1.6} />
          </div>
          <h1 className="text-white" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>
            Créditos
          </h1>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 52 }}>
          Cada crédito te habilita un test DISC para tu equipo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3" style={{ alignItems: "start" }}>
        {/* Saldo */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: accentBg, borderColor: accentBorder }}
        >
          <div className="flex items-center gap-2" style={{ color: accent, fontSize: 13, fontWeight: 600 }}>
            <Ticket size={16} strokeWidth={1.9} /> Saldo disponible
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: accent, lineHeight: 1 }}>
              {balance}
            </span>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              {balance === 1 ? "crédito" : "créditos"}
            </span>
          </div>
          <p style={{ marginTop: 12, fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            1 crédito = 1 test DISC
          </p>
          {balance === 0 && (
            <p style={{ marginTop: 8, fontSize: 12.5, color: "#fca5a5", lineHeight: 1.5 }}>
              Te quedaste sin créditos: no vas a poder generar nuevos links DISC hasta cargar más.
            </p>
          )}
          {low && (
            <p style={{ marginTop: 8, fontSize: 12.5, color: "#fbbf24", lineHeight: 1.5 }}>
              Te quedan pocos créditos.
            </p>
          )}
        </div>

        {/* ¿Qué es un crédito? */}
        <Card title="¿Qué es un crédito?" icon={<Info size={16} strokeWidth={1.9} />}>
          <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>Se descuenta <strong style={{ color: "#cdd9ff" }}>1 crédito</strong> al generar el link de un test DISC nuevo.</li>
            <li>Reenviar un test <strong style={{ color: "#cdd9ff" }}>pendiente</strong> (que la persona aún no completó) <strong style={{ color: "#cdd9ff" }}>no cuesta</strong>.</li>
            <li>Volver a evaluar a alguien que ya completó su DISC consume otro crédito.</li>
          </ul>
        </Card>

        {/* Cómo conseguir más */}
        <Card title="¿Necesitás más?" icon={<Mail size={16} strokeWidth={1.9} />}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>
            Durante la beta cargamos los créditos a mano. Escribinos y te sumamos más para que sigas
            evaluando a tu equipo.
          </p>
          <a
            href={buildCreditRequestMailto(companyName)}
            className="inline-flex items-center gap-2 rounded-xl text-white transition hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
              boxShadow: "0 8px 22px rgba(91,138,255,0.34), inset 0 1px 0 rgba(255,255,255,0.2)",
              padding: "11px 18px",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <Mail size={15} strokeWidth={1.9} /> Pedir más créditos
          </a>
        </Card>
      </div>

      {/* Historial */}
      <div className="mt-7 rounded-2xl border" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <History size={16} strokeWidth={1.8} style={{ color: "#9fb9ff" }} />
          <span className="font-semibold text-white" style={{ fontSize: 14 }}>
            Historial de movimientos
          </span>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={<Ticket size={28} strokeWidth={1.4} />}
            title="Todavía no hay movimientos"
            hint="Acá vas a ver cada carga de créditos y cada test DISC que generes."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.4)", textAlign: "left" }}>
                  <th scope="col" style={thStyle}>Fecha</th>
                  <th scope="col" style={thStyle}>Concepto</th>
                  <th scope="col" style={thStyle}>Detalle</th>
                  <th scope="col" style={{ ...thStyle, textAlign: "right" }}>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {history.map((t) => {
                  const positive = t.delta >= 0;
                  return (
                    <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={tdStyle}>{formatCreditDate(t.created_at)}</td>
                      <td style={{ ...tdStyle, color: "rgba(255,255,255,0.9)" }}>{creditTypeLabel(t.type)}</td>
                      <td style={{ ...tdStyle, color: "rgba(255,255,255,0.5)" }}>{t.reason ?? "—"}</td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontWeight: 700,
                          color: positive ? "#34d399" : "#fca5a5",
                        }}
                      >
                        {positive ? "+" : ""}
                        {t.delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="mb-3 flex items-center gap-2" style={{ color: "#9fb9ff", fontSize: 13, fontWeight: 600 }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 18px",
  fontSize: 11.5,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};
const tdStyle: React.CSSProperties = {
  padding: "11px 18px",
  color: "rgba(255,255,255,0.75)",
  whiteSpace: "nowrap",
};
