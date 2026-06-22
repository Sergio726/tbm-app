-- Fase 2 · A2.2 — Suspensión de empresas
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- status: 'active' (default) | 'suspended'. Una empresa suspendida no puede usar
-- la app (guard en el dashboard de la web). El admin la suspende/reactiva.

alter table public.companies
  add column if not exists status text not null default 'active',
  add column if not exists suspended_at timestamptz;

-- Solo valores conocidos.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'companies_status_chk'
  ) then
    alter table public.companies
      add constraint companies_status_chk check (status in ('active', 'suspended'));
  end if;
end $$;
