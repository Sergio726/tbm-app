-- ============================================================
-- Sprint 6 — Módulo "Mi cuenta" (perfil del usuario logueado)
--   Columnas opcionales en profiles + bucket de avatars.
--   El nombre/cargo/email/password se editan desde /cuenta.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Columnas opcionales en profiles (avatar_url y cargo ya existen)
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists phone    text,
  add column if not exists timezone text,
  add column if not exists bio      text;

-- ------------------------------------------------------------
-- 2. Storage: bucket público de avatares (lectura pública,
--    cada usuario gestiona solo su propia carpeta <uid>/...)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatares: lectura pública" on storage.objects;
create policy "Avatares: lectura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatares: subir el propio" on storage.objects;
create policy "Avatares: subir el propio"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatares: reemplazar el propio" on storage.objects;
create policy "Avatares: reemplazar el propio"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Avatares: borrar el propio" on storage.objects;
create policy "Avatares: borrar el propio"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
