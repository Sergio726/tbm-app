import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft, Inbox } from "lucide-react";
import ParkingLotClient from "@/components/rituales/ParkingLotClient";

export default async function ParkingLotPage() {
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

  const { data: items } = await supabase
    .from("parking_lot")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  // Resolver nombres de proposed_by
  const userIds = Array.from(
    new Set((items ?? []).map((i) => i.proposed_by).filter((v): v is string => !!v))
  );
  let nameMap = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? null]));
  }

  return (
    <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(18px, 5vw, 40px)", color: "#fff", maxWidth: 980 }}>
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
        <div className="flex items-center" style={{ gap: 12, marginBottom: 10 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(148,163,184,0.12)",
              border: "1px solid rgba(148,163,184,0.28)",
              color: "#cbd5e1",
            }}
          >
            <Inbox size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              Parking Lot
            </h1>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Ideas y acciones que no encajan en una Roca del Plan 90D
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          Acá viven los ítems del War Up o Los 5 Grandes que no están alineados a
          ninguna Roca, más cualquier idea que aparezca en el día. No se descartan —
          se aparcan. El Arquitecto las promueve a Roca o las archiva.
        </p>
      </header>

      <ParkingLotClient
        companyId={profile.company_id}
        userId={user.id}
        isArquitecto={isArquitecto}
        items={items ?? []}
        nameMap={Object.fromEntries(nameMap)}
      />
    </div>
  );
}
