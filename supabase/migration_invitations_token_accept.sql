-- ============================================================================
-- Invitaciones · aceptación por token propio + gestión de pendientes
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-23
--
-- Contexto: el flujo de invitación pasa a usar la columna propia
-- `invitations.token` (unique, 256-bit, 7 días de `expires_at`) en vez del
-- magic link OTP de Supabase (un solo uso / ~1h → lo quemaban los pre-fetch de
-- email). La lectura por token y la vinculación del perfil ocurren server-side
-- con el service_role (bypassa RLS), así que NO se agrega policy de lectura por
-- token. Esta migración solo cubre:
--   1. Permitir al Arquitecto CANCELAR (delete) una invitación de su empresa,
--      para que `cancelInvite` corra con el cliente SSR normal (sin admin).
--   2. Índice para el listado de pendientes (company_id + status).
--
-- IDEMPOTENTE: se puede correr entera y volver a correr.
-- Reusa helpers SECURITY DEFINER: auth_is_arquitecto(), auth_company_id()
-- (definidos en fix_rls_recursion.sql).
-- ============================================================================

-- 1) DELETE: el Arquitecto cancela invitaciones de su empresa.
drop policy if exists "Arquitecto cancela invitaciones" on public.invitations;
create policy "Arquitecto cancela invitaciones"
  on public.invitations for delete
  using (
    public.auth_is_arquitecto()
    and company_id = public.auth_company_id()
  );

-- 2) Índice para el panel de pendientes (filtra company_id + status='pending').
create index if not exists idx_invitations_company_status
  on public.invitations (company_id, status);

-- Nota: la expiración (pending → expired cuando expires_at < now()) la hace el
-- cron diario (apps/web/src/app/api/cron/daily/route.ts) con el service_role;
-- no requiere cambios de schema.
