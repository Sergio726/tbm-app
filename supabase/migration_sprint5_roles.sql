-- ============================================================
-- Sprint 5 — Fix de roles de usuario
--   Problema: el default de profiles.role era 'arquitecto', así que
--   TODO usuario nuevo (incluido un colaborador invitado) nacía arquitecto
--   y solo se degradaba si accept-invite corría. Resultado: invitados con
--   permisos de arquitecto (veían el DISC de todo el equipo).
-- ============================================================

-- ------------------------------------------------------------
-- 0. DIAGNÓSTICO (no modifica nada) — correr y revisar antes/después
-- ------------------------------------------------------------
-- select p.email, p.role, p.company_id, p.onboarding_completed,
--        (c.owner_id = p.id) as es_dueno_empresa
-- from public.profiles p
-- left join public.companies c on c.id = p.company_id
-- order by p.company_id, p.role, p.email;

-- ------------------------------------------------------------
-- 1. Default seguro: los usuarios nuevos nacen 'colaborador'.
--    /register sigue seteando 'arquitecto' explícito al crear empresa.
-- ------------------------------------------------------------
alter table public.profiles alter column role set default 'colaborador';

-- ------------------------------------------------------------
-- 2. handle_new_user: asignar 'colaborador' explícito (no depender del default)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'colaborador'
  );
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. FIX DE DATOS (idempotente) — corrige roles ya asignados mal.
--    Fuente de verdad de quién es arquitecto: companies.owner_id.
-- ------------------------------------------------------------
-- 3a. Dueños de empresa => arquitecto
update public.profiles p
set role = 'arquitecto'
from public.companies c
where c.id = p.company_id
  and c.owner_id = p.id
  and p.role is distinct from 'arquitecto';

-- 3b. Con empresa y NO dueños, marcados como arquitecto => colaborador
--     (corrige invitados que quedaron como arquitecto por el default viejo)
update public.profiles p
set role = 'colaborador'
from public.companies c
where c.id = p.company_id
  and c.owner_id <> p.id
  and p.role = 'arquitecto';
