-- ============================================================
-- Sprint 3 — Módulo Mi Equipo / DISC
-- Evaluación automática (test público con token) + alineación
-- + columnas de scoring + bucket de informes PDF.
-- Reusa los helpers SECURITY DEFINER: auth_company_id(), auth_is_arquitecto()
-- (definidos en fix_rls_recursion.sql).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Columnas nuevas en profiles
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists cargo             text,   -- área/función (para alineación rol↔perfil)
  add column if not exists disc_profile_key  text,   -- clave del perfil del evaluador (ej. 'Especialista')
  add column if not exists disc_scores       jsonb;  -- { raw:{D,I,S,C}, segments:{D,I,S,C} }

-- ------------------------------------------------------------
-- 2. Tabla disc_assessments (test + historial)
-- ------------------------------------------------------------
create table if not exists public.disc_assessments (
  id            uuid primary key default gen_random_uuid(),
  token         text unique not null,
  company_id    uuid not null references public.companies(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  full_name     text,
  cargo         text,
  email         text,
  status        text not null default 'pendiente', -- 'pendiente' | 'completado'
  answers       jsonb,                              -- [{m,l}, ...] 24 respuestas
  raw           jsonb,                              -- {D,I,S,C}
  segments      jsonb,                              -- {D,I,S,C} 1..7
  profile_key   text,                               -- 'Especialista', etc.
  disc_letters  text,                               -- 'SC'
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now(),
  completed_at  timestamptz
);

create index if not exists idx_disc_assessments_company on public.disc_assessments(company_id);
create index if not exists idx_disc_assessments_profile on public.disc_assessments(profile_id);
create index if not exists idx_disc_assessments_token   on public.disc_assessments(token);

alter table public.disc_assessments enable row level security;

-- El Arquitecto gestiona los tests de su empresa.
drop policy if exists "Arquitecto ve los tests DISC de su empresa" on public.disc_assessments;
create policy "Arquitecto ve los tests DISC de su empresa"
  on public.disc_assessments for select
  using (public.auth_is_arquitecto() and company_id = public.auth_company_id());

drop policy if exists "Arquitecto crea tests DISC" on public.disc_assessments;
create policy "Arquitecto crea tests DISC"
  on public.disc_assessments for insert
  with check (public.auth_is_arquitecto() and company_id = public.auth_company_id());

drop policy if exists "Arquitecto actualiza tests DISC" on public.disc_assessments;
create policy "Arquitecto actualiza tests DISC"
  on public.disc_assessments for update
  using (public.auth_is_arquitecto() and company_id = public.auth_company_id());

drop policy if exists "Arquitecto borra tests DISC" on public.disc_assessments;
create policy "Arquitecto borra tests DISC"
  on public.disc_assessments for delete
  using (public.auth_is_arquitecto() and company_id = public.auth_company_id());

-- NOTA: el acceso público (sin sesión) al test es SOLO vía las funciones
-- SECURITY DEFINER de abajo, nunca por SELECT/UPDATE directos. Por eso no
-- agregamos políticas para 'anon' sobre la tabla.

-- ------------------------------------------------------------
-- 3. RPC pública: leer un test por token (para renderizar)
--    Devuelve datos mínimos; si está completado, incluye el resultado.
-- ------------------------------------------------------------
create or replace function public.get_disc_assessment(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when a.id is null then null else jsonb_build_object(
    'id',           a.id,
    'status',       a.status,
    'full_name',    a.full_name,
    'cargo',        a.cargo,
    'company_name', c.name,
    'has_profile',  (a.profile_id is not null),
    'raw',          a.raw,
    'segments',     a.segments,
    'profile_key',  a.profile_key,
    'disc_letters', a.disc_letters,
    'completed_at', a.completed_at
  ) end
  from public.disc_assessments a
  left join public.companies c on c.id = a.company_id
  where a.token = p_token;
$$;

-- ------------------------------------------------------------
-- 4. RPC pública: enviar resultado del test
--    El scoring se calcula en la app (src/lib/disc-evaluator.ts) y aquí
--    se persiste. Token secreto = autorización. Solo escribe si está
--    'pendiente' (no se puede re-enviar).
-- ------------------------------------------------------------
create or replace function public.submit_disc(
  p_token       text,
  p_full_name   text,
  p_cargo       text,
  p_email       text,
  p_answers     jsonb,
  p_raw         jsonb,
  p_segments    jsonb,
  p_profile_key text,
  p_letters     text,
  p_disc_name   text,
  p_disc_icon   text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.disc_assessments;
begin
  select * into v_row from public.disc_assessments where token = p_token for update;
  if v_row.id is null then
    return jsonb_build_object('ok', false, 'error', 'token_invalido');
  end if;
  if v_row.status = 'completado' then
    return jsonb_build_object('ok', false, 'error', 'ya_completado');
  end if;

  update public.disc_assessments set
    full_name    = coalesce(p_full_name, full_name),
    cargo        = coalesce(p_cargo, cargo),
    email        = coalesce(p_email, email),
    answers      = p_answers,
    raw          = p_raw,
    segments     = p_segments,
    profile_key  = p_profile_key,
    disc_letters = p_letters,
    status       = 'completado',
    completed_at = now()
  where id = v_row.id;

  -- Denormaliza en el perfil vinculado (si existe).
  if v_row.profile_id is not null then
    update public.profiles set
      disc_letters     = p_letters,
      disc_name        = p_disc_name,
      disc_icon        = p_disc_icon,
      disc_profile_key = p_profile_key,
      disc_scores      = jsonb_build_object('raw', p_raw, 'segments', p_segments),
      disc_status      = 'completado',
      cargo            = coalesce(cargo, p_cargo)
    where id = v_row.profile_id;
  end if;

  return jsonb_build_object('ok', true, 'profile_key', p_profile_key, 'letters', p_letters);
end;
$$;

-- Acceso público controlado por token.
grant execute on function public.get_disc_assessment(text) to anon, authenticated;
grant execute on function public.submit_disc(text, text, text, text, jsonb, jsonb, jsonb, text, text, text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 5. Storage: bucket privado para informes DISC en PDF
--    Path: <company_id>/<profile_id>.pdf
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('disc-reports', 'disc-reports', false)
on conflict (id) do nothing;

drop policy if exists "Arquitecto sube informes DISC" on storage.objects;
create policy "Arquitecto sube informes DISC"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'disc-reports'
    and public.auth_is_arquitecto()
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

drop policy if exists "Arquitecto ve informes DISC" on storage.objects;
create policy "Arquitecto ve informes DISC"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'disc-reports'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

drop policy if exists "Arquitecto reemplaza informes DISC" on storage.objects;
create policy "Arquitecto reemplaza informes DISC"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'disc-reports'
    and public.auth_is_arquitecto()
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

drop policy if exists "Arquitecto borra informes DISC" on storage.objects;
create policy "Arquitecto borra informes DISC"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'disc-reports'
    and public.auth_is_arquitecto()
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );
