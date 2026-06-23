// JARVIS · RAG — recuperación de fragmentos del corpus del método (R1). Server-only.
// Embebe la consulta con la Edge Function `embed` (gte-small) y busca por similitud
// con match_knowledge. Tolerante a fallos: si algo falla, devuelve [] (el chat sigue).

import { createAdminClient } from "@/lib/supabase/admin";

export type KnowledgeChunk = {
  source: string;
  title: string | null;
  content: string;
  similarity: number;
};

const SIM_THRESHOLD = 0.3;

export async function retrieveKnowledge(
  query: string,
  companyId?: string | null,
  matchCount = 6
): Promise<KnowledgeChunk[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !query.trim()) return [];

  try {
    const res = await fetch(`${url}/functions/v1/embed`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ texts: [query.slice(0, 1200)] }),
    });
    if (!res.ok) return [];
    const { embeddings } = (await res.json()) as { embeddings: number[][] };
    const vec = embeddings?.[0];
    if (!vec || !vec.length) return [];

    const admin = createAdminClient();
    if (!admin) return [];
    const { data, error } = await admin.rpc("match_knowledge", {
      query_embedding: JSON.stringify(vec),
      match_count: matchCount,
      p_company_id: companyId ?? undefined,
    });
    if (error || !data) return [];
    return (data as KnowledgeChunk[]).filter((c) => c.similarity > SIM_THRESHOLD);
  } catch {
    return [];
  }
}
