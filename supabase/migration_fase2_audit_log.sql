-- Fase 2 · A2 — Audit log de acciones del panel god-mode
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Registra TODA acción sensible del admin (crear líder, cargar créditos, etc.).
-- Solo service-role escribe/lee (el panel admin); nadie desde el cliente.

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  action      text not null,                 -- create_lider | grant_credits | edit_company | ...
  target_type text,                          -- company | user | credit | ...
  target_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;
-- RLS activo + sin policies → ni anon ni authenticated acceden. Solo service-role.
revoke all on public.audit_log from anon, authenticated;
