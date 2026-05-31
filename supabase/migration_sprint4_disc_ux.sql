-- ============================================================
-- Sprint 4 — Mejoras UX del módulo DISC
--   • columna ai_narrative (síntesis con IA, cacheada)
--   • submit_disc acepta y guarda la narrativa
--   • get_disc_assessment la devuelve
--   • Realtime en disc_assessments (aviso al Arquitecto)
-- Requiere haber corrido antes migration_sprint3_disc.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Narrativa IA cacheada
-- ------------------------------------------------------------
alter table public.disc_assessments
  add column if not exists ai_narrative text;

-- ------------------------------------------------------------
-- 2. submit_disc: agregar p_narrative (cambia firma → drop + recreate)
-- ------------------------------------------------------------
drop function if exists public.submit_disc(text, text, text, text, jsonb, jsonb, jsonb, text, text, text, text);

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
  p_disc_icon   text,
  p_narrative   text default null
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
    ai_narrative = p_narrative,
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

grant execute on function public.submit_disc(text, text, text, text, jsonb, jsonb, jsonb, text, text, text, text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 3. get_disc_assessment: incluir ai_narrative
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
    'ai_narrative', a.ai_narrative,
    'completed_at', a.completed_at
  ) end
  from public.disc_assessments a
  left join public.companies c on c.id = a.company_id
  where a.token = p_token;
$$;

grant execute on function public.get_disc_assessment(text) to anon, authenticated;

-- ------------------------------------------------------------
-- 4. Realtime: el Arquitecto recibe el evento al completarse un test.
--    (RLS sigue aplicando: solo ve filas de su empresa.)
-- ------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.disc_assessments;
exception
  when duplicate_object then null; -- ya estaba en la publicación
end $$;

-- Refrescar el cache de esquema de PostgREST (para la nueva firma del RPC).
notify pgrst, 'reload schema';
