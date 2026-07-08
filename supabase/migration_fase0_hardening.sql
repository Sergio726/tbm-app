-- ============================================================
-- FASE 0 — Hardening de seguridad (auditoria.md §1)
--   Cierra 3 críticos de aislamiento multi-tenant / créditos:
--     T1  profiles: congelar role/company_id (auto-escalada a arquitecto)
--     T3  disc_assessments: revocar writes directos (bypass de créditos)
--     T5  role: default seguro 'colaborador' (invitados nacían arquitecto)
--
--   IDEMPOTENTE y AUTOCONTENIDA: se puede correr entera y volver a correr.
--   NO requiere cambios de código para funcionar (los flujos legítimos de
--   register/accept-invite siguen andando — ver T1). Aplicar en el SQL Editor.
-- ============================================================


-- ============================================================
-- T5 · Default de rol seguro + handle_new_user explícito
--   (equivalente a migration_sprint5_roles.sql; re-aplicable sin daño)
-- ============================================================
alter table public.profiles alter column role set default 'colaborador';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
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

-- Fix de datos (idempotente): la verdad de quién es arquitecto = companies.owner_id.
update public.profiles p
   set role = 'arquitecto'
  from public.companies c
 where c.id = p.company_id
   and c.owner_id = p.id
   and p.role is distinct from 'arquitecto';

update public.profiles p
   set role = 'colaborador'
  from public.companies c
 where c.id = p.company_id
   and c.owner_id <> p.id
   and p.role = 'arquitecto';


-- ============================================================
-- T3 · disc_assessments: solo lectura para el cliente
--   Todos los writes pasan por RPCs SECURITY DEFINER (generate_disc_link /
--   submit_disc) — verificado: no hay ni un .from("disc_assessments")
--   .insert/.update/.delete en apps/. Dejar estas policies vivas permitía
--   crear tests DISC gratis o resetear status desde la consola del browser.
-- ============================================================
drop policy if exists "Arquitecto crea tests DISC"      on public.disc_assessments;
drop policy if exists "Arquitecto actualiza tests DISC" on public.disc_assessments;
drop policy if exists "Arquitecto borra tests DISC"     on public.disc_assessments;
-- (se conserva "Arquitecto ve los tests DISC de su empresa" = SELECT)

revoke insert, update, delete on public.disc_assessments from authenticated;
revoke insert, update, delete on public.disc_assessments from anon;


-- ============================================================
-- T1 · profiles: congelar role/company_id contra auto-escalada
--
--   Problema: la policy UPDATE "Usuario puede editar su propio perfil" no
--   tiene WITH CHECK ⇒ cualquiera hace
--       update profiles set role='arquitecto', company_id='<víctima>'
--   desde la consola y toma control de otra empresa (toda la autorización
--   deriva de profiles.role + profiles.company_id).
--
--   Solución: un trigger BEFORE UPDATE (SECURITY INVOKER, hereda el rol del
--   caller) que congela ambas columnas para sesiones de usuario, salvo la
--   PRIMERA vinculación y sólo si está validada server-side:
--     · Caso A (register)      → el usuario se hace arquitecto de una empresa
--                                 de la que ES owner (companies.owner_id).
--     · Caso B (accept-invite) → el usuario se hace colaborador de una empresa
--                                 que lo invitó por su email (invitations).
--   Así register-form.tsx y accept-invite/page.tsx siguen funcionando tal
--   cual (updates directos) pero el bypass queda cerrado: un colaborador ya
--   vinculado (old.company_id NOT NULL) no puede tocar ni su rol ni su empresa.
-- ============================================================

-- Helpers con privilegio (leen companies/invitations sin depender de RLS).
create or replace function public.is_owner_of_company(p_user uuid, p_company uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.companies
     where id = p_company and owner_id = p_user
  );
$$;

create or replace function public.has_invite_for_user(p_user uuid, p_company uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
      from public.invitations i
      join public.profiles pr on pr.id = p_user
     where i.company_id = p_company
       and lower(i.email) = lower(pr.email)
  );
$$;

revoke all on function public.is_owner_of_company(uuid, uuid)  from public, anon;
revoke all on function public.has_invite_for_user(uuid, uuid)  from public, anon;
grant execute on function public.is_owner_of_company(uuid, uuid) to authenticated;
grant execute on function public.has_invite_for_user(uuid, uuid) to authenticated;

create or replace function public.enforce_profile_role_company()
returns trigger
language plpgsql   -- SECURITY INVOKER (default): current_user = rol del caller
as $$
begin
  -- Procesos privilegiados (service_role del admin, RPCs SECURITY DEFINER,
  -- migraciones que corren como postgres): sin restricción.
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  -- No cambian las columnas sensibles: permitir (full_name, cargo, tour, etc.).
  if new.role is not distinct from old.role
     and new.company_id is not distinct from old.company_id then
    return new;
  end if;

  -- Caso A — dueño que crea su empresa (register).
  if old.company_id is null
     and new.role = 'arquitecto'
     and public.is_owner_of_company(new.id, new.company_id) then
    return new;
  end if;

  -- Caso B — invitado que acepta (accept-invite).
  if old.company_id is null
     and new.role = 'colaborador'
     and public.has_invite_for_user(new.id, new.company_id) then
    return new;
  end if;

  raise exception 'No autorizado: no podés cambiar tu rol ni tu empresa.'
    using errcode = '42501';
end;
$$;

drop trigger if exists trg_enforce_profile_role_company on public.profiles;
create trigger trg_enforce_profile_role_company
  before update on public.profiles
  for each row execute function public.enforce_profile_role_company();

-- Nota: un arquitecto que hoy edite el perfil de OTRO miembro para cambiarle
-- role/company_id por update directo quedará bloqueado (no encontré ese flujo
-- en apps/; la gestión de roles se hace desde el admin con service_role). Si
-- se necesita en la app web, exponer una RPC SECURITY DEFINER dedicada.
