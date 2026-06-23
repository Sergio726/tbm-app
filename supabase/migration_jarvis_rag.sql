-- JARVIS · RAG R1 — corpus del método (embeddings gte-small, 384 dims)
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- knowledge_chunks: fragmentos de la investigación/método con su embedding.
-- match_knowledge: búsqueda por similitud coseno (solo service-role).

create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_chunks (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null default 'global',          -- 'global' | 'company'
  company_id  uuid references public.companies(id) on delete cascade,
  source      text not null,                           -- nombre del doc
  title       text,
  chunk_index int not null default 0,
  content     text not null,
  embedding   extensions.vector(384),
  created_at  timestamptz not null default now()
);

create index if not exists idx_knowledge_chunks_hnsw
  on public.knowledge_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists idx_knowledge_chunks_scope
  on public.knowledge_chunks (scope, company_id);

alter table public.knowledge_chunks enable row level security;
revoke all on public.knowledge_chunks from anon, authenticated;

-- Búsqueda por similitud (coseno). scope global + (opcional) por empresa.
create or replace function public.match_knowledge(
  query_embedding extensions.vector(384),
  match_count int default 6,
  p_company_id uuid default null
)
returns table (source text, title text, content text, similarity float)
language sql
security definer
set search_path = ''
stable
as $$
  select kc.source, kc.title, kc.content,
         1 - (kc.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.knowledge_chunks kc
  where kc.scope = 'global'
     or (p_company_id is not null and kc.company_id = p_company_id)
  order by kc.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

revoke execute on function public.match_knowledge(extensions.vector, int, uuid) from public, anon, authenticated;
grant execute on function public.match_knowledge(extensions.vector, int, uuid) to service_role;
