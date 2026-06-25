// JARVIS · RAG — Ingesta del corpus del método a knowledge_chunks (scope='global').
// Lee docs markdown, chunkea, embebe vía la Edge Function `embed` (gte-small) y upsertea.
//
// Uso:  node scripts/ingest-knowledge.mjs
// Requiere en apps/web/.env.local (o en el entorno):
//   NEXT_PUBLIC_SUPABASE_URL  y  SUPABASE_SERVICE_ROLE_KEY

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Corpus CURADO: solo el método canónico + material primario de Dilio.
// Se EXCLUYEN los docs históricos de proceso/descubrimiento (HALLAZGOS_*, WORKBOOK_DELTA,
// DISC_HALLAZGOS) que arrastran naming desactualizado y contradicciones ya resueltas.
const DOCS = [
  "METODO_TBM_CANONICO.md", // digest canónico (fuente de verdad)
  "MODULO_DISC.md", // referencia DISC
  "Visión de app TBM - Dilio V2.md", // visión de Dilio
  "RESPUESTAS_DILIO.md", // respuestas directas de Dilio
];

// gte-small tope ~512 tokens → chunks chicos (~1400 chars ≈ ~350 tokens).
const MAX_CHARS = 1400;
const OVERLAP_CHARS = 200;
const BATCH = 2;

function loadEnv() {
  const out = { ...process.env };
  const envPath = join(ROOT, "apps", "web", ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = out[m[1]] ?? m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function chunkMarkdown(text) {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let buf = "";
  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > MAX_CHARS) {
      chunks.push(buf);
      buf = buf.slice(Math.max(0, buf.length - OVERLAP_CHARS)) + "\n\n" + p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf.trim()) chunks.push(buf);
  return chunks;
}

function titleOf(text, fallback) {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function embed(texts, url, serviceKey, attempt = 0) {
  const res = await fetch(`${url}/functions/v1/embed`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ texts }),
  });
  if (!res.ok) {
    // 546 = cold start / resource limit → reintentar tras warm-up.
    if ((res.status === 546 || res.status === 503) && attempt < 4) {
      await sleep(1500 * (attempt + 1));
      return embed(texts, url, serviceKey, attempt + 1);
    }
    throw new Error(`embed ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = await res.json();
  return data.embeddings;
}

// PostgREST por fetch (evita supabase-js/WebSocket en Node 20).
function rest(url, serviceKey) {
  const base = `${url}/rest/v1/knowledge_chunks`;
  const headers = {
    "content-type": "application/json",
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
  };
  return {
    async delAllGlobal() {
      const res = await fetch(`${base}?scope=eq.global`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`delete-all ${res.status}: ${await res.text().catch(() => "")}`);
    },
    async del(source) {
      const q = `scope=eq.global&source=eq.${encodeURIComponent(source)}`;
      const res = await fetch(`${base}?${q}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`delete ${res.status}: ${await res.text().catch(() => "")}`);
    },
    async insert(rows) {
      const res = await fetch(base, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(rows),
      });
      if (!res.ok) throw new Error(`insert ${res.status}: ${await res.text().catch(() => "")}`);
    },
  };
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  const db = rest(url, serviceKey);

  // Limpieza total del corpus global → elimina chunks de docs ya removidos de la lista.
  await db.delAllGlobal();
  console.log("· corpus global limpiado");

  let total = 0;
  for (const file of DOCS) {
    const path = join(ROOT, "docs", file);
    if (!existsSync(path)) {
      console.warn(`· (saltado, no existe) ${file}`);
      continue;
    }
    const raw = readFileSync(path, "utf8");
    const title = titleOf(raw, file.replace(/\.md$/, ""));
    const chunks = chunkMarkdown(raw);

    await db.del(file); // idempotente

    for (let i = 0; i < chunks.length; i += BATCH) {
      const slice = chunks.slice(i, i + BATCH);
      const vectors = await embed(slice, url, serviceKey);
      const rows = slice.map((content, j) => ({
        scope: "global",
        source: file,
        title,
        chunk_index: i + j,
        content,
        embedding: JSON.stringify(vectors[j]),
      }));
      await db.insert(rows);
    }
    total += chunks.length;
    console.log(`✓ ${file} — ${chunks.length} chunks`);
  }
  console.log(`\nListo. ${total} chunks indexados (scope=global).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
