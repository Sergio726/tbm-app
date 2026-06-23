// JARVIS · RAG — Edge Function de embeddings (Supabase gte-small, 384 dims).
// Input: { texts: string[] } → Output: { embeddings: number[][] }.
// Protegida: solo service-role (la usan el server del web y el script de ingesta).

// @ts-nocheck
// Protección: verify_jwt=true en el gateway → exige un JWT válido del proyecto
// (la llaman el server del web y el script de ingesta con la service-role key).
// La sesión se crea UNA vez a nivel módulo (modelo cargado al boot, no por request).
const session = new Supabase.ai.Session("gte-small");

Deno.serve(async (req: Request) => {
  let body: { texts?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const texts = Array.isArray(body.texts) ? body.texts : [];

  const embeddings: number[][] = [];
  for (const t of texts) {
    const e = await session.run(String(t), { mean_pool: true, normalize: true });
    embeddings.push(e as number[]);
  }

  return new Response(JSON.stringify({ embeddings }), {
    headers: { "content-type": "application/json" },
  });
});
