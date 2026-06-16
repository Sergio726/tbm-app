import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isoDate, isoTomorrow, humanDate } from "@/lib/dates";
import { ArrowLeft, Moon } from "lucide-react";
import Los5GrandesForm from "@/components/rituales/Los5GrandesForm";
import type { Los5GrandesItem } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Los5GrandesPage({ searchParams }: PageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) redirect("/onboarding");

  const isArquitecto = profile.role === "arquitecto";
  const today = isoDate();
  const params = await searchParams;
  const forDate = params.date ?? isoTomorrow();
  const isPast = forDate < today;
  const isToday = forDate === today;

  // Padre + items para la fecha seleccionada
  const { data: parent } = await supabase
    .from("los_5_grandes")
    .select("*")
    .eq("company_id", profile.company_id)
    .eq("for_date", forDate)
    .maybeSingle();

  let items: Los5GrandesItem[] = [];
  if (parent) {
    const { data: itemsData } = await supabase
      .from("los_5_grandes_items")
      .select("*")
      .eq("los_5_grandes_id", parent.id)
      .order("position", { ascending: true });
    items = itemsData ?? [];
  }

  // Fechas para navegación rápida
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return isoDate(d);
  })();
  const tomorrow = isoTomorrow();

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "#fff", maxWidth: 880 }}>
      <Link
        href="/rituales"
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} />
        Rituales
      </Link>

      <header style={{ marginBottom: 28 }}>
        <div
          className="flex items-center"
          style={{ gap: 12, marginBottom: 10 }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(129,140,248,0.12)",
              border: "1px solid rgba(129,140,248,0.28)",
              color: "#818cf8",
            }}
          >
            <Moon size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Los 5 Grandes
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Para {humanDate(forDate)} · Ritual nocturno del negocio
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            maxWidth: 680,
          }}
        >
          Las 5 prioridades del negocio para {isToday ? "HOY" : "el día siguiente"}.
          Cada una alineada a una Roca del Plan 90D — si no encaja con ninguna, va al{" "}
          <Link
            href="/rituales/parking-lot"
            style={{ color: "#bcd0ff", textDecoration: "underline" }}
          >
            Parking Lot
          </Link>
          . No es lista de tareas — son las apuestas estratégicas que mueven la aguja.
        </p>
      </header>

      {/* Selector rápido de fecha */}
      <div
        className="flex items-center"
        style={{ gap: 8, marginBottom: 22 }}
      >
        <DateTab href={`/rituales/5-grandes?date=${yesterday}`} active={forDate === yesterday}>
          Ayer
        </DateTab>
        <DateTab href={`/rituales/5-grandes?date=${today}`} active={forDate === today}>
          Hoy
        </DateTab>
        <DateTab href={`/rituales/5-grandes?date=${tomorrow}`} active={forDate === tomorrow}>
          Mañana
        </DateTab>
      </div>

      {!isArquitecto && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
            color: "#fcd34d",
            fontSize: 13.5,
            marginBottom: 18,
          }}
        >
          Modo lectura. Solo el Arquitecto puede crear o editar Los 5 Grandes.
        </div>
      )}

      <Los5GrandesForm
        companyId={profile.company_id}
        userId={user.id}
        forDate={forDate}
        canEdit={isArquitecto && !isPast}
        canMarkExecuted={isArquitecto && (isToday || isPast)}
        initialParent={parent ?? null}
        initialItems={items}
      />
    </div>
  );
}

function DateTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "7px 14px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 500,
        background: active
          ? "linear-gradient(135deg, rgba(129,140,248,0.22), rgba(129,140,248,0.06))"
          : "rgba(255,255,255,0.03)",
        border: active
          ? "1px solid rgba(129,140,248,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#c7d2fe" : "rgba(255,255,255,0.7)",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
