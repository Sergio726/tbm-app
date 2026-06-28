-- DC-6 — Historial de conversaciones del asistente DC + base de uso/costos.
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- ai_conversations + ai_messages: persisten las charlas con DC (retomar charlas) y
-- los tokens por mensaje (base de costos; el consumo se agrega por query, sin tabla
-- de rollup en v1). RLS: cada usuario ve/administra SOLO sus conversaciones.

create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  company_id  uuid references public.companies(id) on delete cascade,  -- null: coach sin empresa
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ai_conversations_user_updated
  on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.ai_conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null default '',
  model             text,
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists ai_messages_conversation_created
  on public.ai_messages (conversation_id, created_at);

-- Para el rate-limit (mensajes del usuario en la última hora) sin join costoso.
create index if not exists ai_messages_role_created
  on public.ai_messages (role, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

-- conversations: dueño por user_id
create policy "ai_conv_own_select" on public.ai_conversations
  for select using (user_id = auth.uid());
create policy "ai_conv_own_insert" on public.ai_conversations
  for insert with check (user_id = auth.uid());
create policy "ai_conv_own_update" on public.ai_conversations
  for update using (user_id = auth.uid());
create policy "ai_conv_own_delete" on public.ai_conversations
  for delete using (user_id = auth.uid());

-- messages: acceso si la conversación es del usuario
create policy "ai_msg_own_select" on public.ai_messages
  for select using (
    exists (select 1 from public.ai_conversations c
            where c.id = ai_messages.conversation_id and c.user_id = auth.uid())
  );
create policy "ai_msg_own_insert" on public.ai_messages
  for insert with check (
    exists (select 1 from public.ai_conversations c
            where c.id = ai_messages.conversation_id and c.user_id = auth.uid())
  );

grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert on public.ai_messages to authenticated;
