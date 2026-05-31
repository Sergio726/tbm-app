import { createServerClient } from "@/lib/supabase/server";
import { DiscTest } from "@/components/disc/disc-test";
import { DiscResult } from "@/components/disc/disc-result";
import type { DiscScores, DiscSegments } from "@/lib/disc-evaluator";

export const dynamic = "force-dynamic";

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
      {!a ? (
        <Invalid />
      ) : a.status === "completado" && a.segments && a.profile_key ? (
        <div className="max-w-xl mx-auto px-4 py-10">
          <p className="text-center text-tbm-green text-sm mb-4">✓ Test completado</p>
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
        />
      )}
    </main>
  );
}

function Invalid() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-3">🔗</div>
      <h1 className="text-xl font-bold text-tbm-text-primary">Link inválido</h1>
      <p className="text-sm text-tbm-text-secondary mt-2">
        Este enlace de test DISC no existe o expiró. Pedile al Arquitecto que te genere uno nuevo.
      </p>
    </div>
  );
}
