-- Fase 2 · A1 — Fundación del panel god-mode
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- platform_admins: quién es admin de PLATAFORMA (super-admin de la startup).
-- NO es un rol de `profiles` (esos están atados a una empresa). Sin company_id.
-- is_platform_admin(): guard que usa el panel admin (apps/admin) y, a futuro, RLS.

create table if not exists public.platform_admins (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  role_interno  text not null default 'superadmin',  -- superadmin | finanzas | soporte (RBAC futuro)
  created_at    timestamptz not null default now()
);

-- RLS activo + sin policies → ni anon ni authenticated leen/escriben desde el cliente.
-- Solo la service-role (server actions del admin) o funciones SECURITY DEFINER acceden.
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

-- Lo invocan usuarios logueados (el guard del panel). Solo devuelve un boolean
-- sobre el propio caller — exposición nula, mismo patrón que auth_is_arquitecto().
grant execute on function public.is_platform_admin() to authenticated;
