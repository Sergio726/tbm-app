-- N2 · Pedidos de créditos in-app (reemplaza el mailto de /creditos)
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- El arquitecto pide una recarga DESDE la app: queda registrada acá, se le notifica
-- al admin (email + notificación) y el admin la carga a mano con grant_credits,
-- marcando el pedido como 'granted'. Sin auto-grant (beta = carga manual y revisada).

create table if not exists public.credit_requests (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  amount       int,                                   -- cuántos pide (opcional)
  note         text,                                  -- mensaje opcional del líder
  status       text not null default 'pending'
               check (status in ('pending', 'granted', 'rejected')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references auth.users(id) on delete set null
);

create index if not exists idx_credit_requests_status
  on public.credit_requests (status, created_at desc);
create index if not exists idx_credit_requests_company
  on public.credit_requests (company_id, created_at desc);

alter table public.credit_requests enable row level security;

-- El arquitecto crea pedidos para SU empresa (en su nombre).
create policy "arquitecto_crea_pedido" on public.credit_requests
  for insert with check (
    company_id = public.auth_company_id()
    and public.auth_is_arquitecto()
    and requested_by = auth.uid()
  );

-- El arquitecto ve los pedidos de su empresa (para el estado en /creditos).
create policy "ve_pedidos_de_su_empresa" on public.credit_requests
  for select using (company_id = public.auth_company_id());

-- El admin lee/actualiza por service-role (bypassa RLS) → sin policy extra.
grant select, insert on public.credit_requests to authenticated;
