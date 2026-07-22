import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { DiscTest } from "@/components/disc/disc-test";
import { DiscResult } from "@/components/disc/disc-result";
import { PublicBrandHeader } from "@/components/disc/public-brand-header";
import type { DiscScores, DiscSegments } from "@/lib/disc-evaluator";

export const dynamic = "force-dynamic";

// La ruta es pública y se comparte por link → metadata con marca para el
// preview (OpenGraph). `noindex`: es un test personal por token, no debe indexarse.
export const metadata: Metadata = {
  title: "Test DISC · The Business Multiplier",
  description:
    "Descubrí tu perfil DISC en ~5 minutos. Una invitación de The Business Multiplier.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Test DISC · The Business Multiplier",
    description:
      "Descubrí tu perfil DISC en ~5 minutos. Una invitación de The Business Multiplier.",
    siteName: "The Business Multiplier",
    type: "website",
  },
};

type AssessmentData = {
  id: string;
  status: string;
  full_name: string | null;
  cargo: string | null;
  company_name: string | null;
  has_profile: boolean;
  raw: DiscScores | null;
  segments: DiscSegments | null;
  profile_key: string | null;
  disc_letters: string | null;
  ai_narrative: string | null;
  completed_at: string | null;
};

export default async function DiscTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase.rpc("get_disc_assessment", { p_token: token });
  const a = data as AssessmentData | null;

  return (
    <main className="min-h-screen bg-tbm-bg text-tbm-text-primary">
      <PublicBrandHeader />
      {!a ? (
        <Invalid />
      ) : a.status === "completado" && a.segments && a.profile_key ? (
        <div className="max-w-xl mx-auto px-4 pb-10">
          <DiscResult
            segments={a.segments}
            raw={a.raw ?? undefined}
            profileKey={a.profile_key}
            letters={a.disc_letters}
            fullName={a.full_name}
            cargo={a.cargo}
            narrative={a.ai_narrative}
          />
        </div>
      ) : (
        <DiscTest
          token={token}
          defaultName={a.full_name}
          defaultCargo={a.cargo}
          companyName={a.company_name}
          hasProfile={a.has_profile}
        />
      )}
    </main>
  );
}

function Invalid() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div
        className="mx-auto"
        style={{
          maxWidth: 420,
          padding: "36px 28px",
          borderRadius: 18,
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="text-4xl mb-3">🔗</div>
        <h1 className="text-xl font-bold text-tbm-text-primary">Este enlace ya no está disponible</h1>
        <p className="text-sm text-tbm-text-secondary mt-2 leading-relaxed">
          El link de test DISC no existe o expiró. Pedile a quien te invitó que te
          genere uno nuevo — toma solo un momento.
        </p>
      </div>
    </div>
  );
}
