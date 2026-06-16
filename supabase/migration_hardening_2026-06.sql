-- migration_hardening_2026-06.sql
-- Hardening de seguridad pre-beta a partir de los advisors de Supabase (2026-06-16).
-- Aplicado por MCP el 2026-06-16 (migración `hardening_2026_06_security_quickwins`).
-- Solo resuelve los quick-wins seguros; ver PROGRESS.md → "Hardening Supabase (pre-beta)"
-- para los hallazgos que se dejan aceptados (auth_* usadas en RLS, submit_disc /
-- get_disc_assessment públicas por diseño) y el toggle manual de leaked-password.

-- 1. Fijar search_path en las 2 funciones trigger (lint function_search_path_mutable).
--    No cambia comportamiento: solo hacen `new.updated_at = now()`.
alter function public.handle_updated_at() set search_path = '';
alter function public.update_tasks_updated_at() set search_path = '';

-- 2. handle_new_user es un trigger de auth.users; no debe ser ejecutable como RPC.
--    El trigger sigue disparando igual (no requiere EXECUTE del invocador).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Bucket avatars (public=true): quitar la policy SELECT amplia que permite LISTAR
--    todos los archivos. Al ser público, las URLs públicas siguen sirviendo los
--    objetos sin esta policy (la app arma la URL, no lista el bucket).
drop policy "Avatares: lectura pública" on storage.objects;
