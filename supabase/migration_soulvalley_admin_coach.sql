-- ============================================================================
-- Alta de accesos para info@thesoulvalley.com
--   1) Administrador del panel admin  → fila en public.platform_admins
--   2) Super coach de TODAS las empresas → profiles.role='coach'
--                                          + coach_assignments por cada company
--
-- REQUISITO PREVIO: la cuenta debe existir en auth.users. Si no existe, crearla
-- antes por el panel admin /coaches ("Asignar coach a una empresa") o por
-- Supabase Dashboard → Authentication → Invite user. Este script es idempotente:
-- si el usuario no existe todavía, no inserta nada (y no falla).
--
-- Correr como service_role (SQL Editor de Supabase o Supabase MCP). La tabla
-- platform_admins tiene revoke all + RLS sin policies, y coach_assignments no
-- tiene policy de INSERT para authenticated → solo service_role puede escribir.
-- El trigger enforce_profile_role_company NO bloquea a service_role.
--
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-21
-- ============================================================================

-- 1) Admin del panel (idempotente)
insert into public.platform_admins (user_id, role_interno)
select id, 'superadmin'
from auth.users
where email = 'info@thesoulvalley.com'
on conflict (user_id) do nothing;

-- 2) Marcar rol coach (idempotente; cubre también el caso de alta por "invite")
update public.profiles
set role = 'coach'
where id = (select id from auth.users where email = 'info@thesoulvalley.com');

-- 3) Super coach = asignar a TODAS las empresas existentes (idempotente)
--    NOTA: es un snapshot. Empresas creadas a futuro NO quedan asignadas
--    automáticamente; re-correr este INSERT si se agregan empresas.
insert into public.coach_assignments (coach_id, company_id)
select (select id from auth.users where email = 'info@thesoulvalley.com'), c.id
from public.companies c
where exists (select 1 from auth.users where email = 'info@thesoulvalley.com')
on conflict (coach_id, company_id) do nothing;

-- ── Verificación (opcional, correr aparte) ──────────────────────────────────
-- select id, email from auth.users where email = 'info@thesoulvalley.com';
-- select * from public.platform_admins pa
--   join auth.users u on u.id = pa.user_id where u.email = 'info@thesoulvalley.com';
-- select role from public.profiles
--   where id = (select id from auth.users where email = 'info@thesoulvalley.com');
-- select count(*) as asignadas from public.coach_assignments
--   where coach_id = (select id from auth.users where email = 'info@thesoulvalley.com');
-- select count(*) as total_empresas from public.companies;
