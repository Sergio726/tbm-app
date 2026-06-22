-- JARVIS · S18.1 — Configuración del asistente IA (multi-proveedor)
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- ai_config: proveedor/modelo/system prompt/temperatura del asistente. La API key
-- NO se guarda acá: va cifrada en Supabase Vault; api_key_ref guarda solo el id del
-- secreto. Beta = una sola fila scope='platform'. Solo service-role accede.

create table if not exists public.ai_config (
  id            uuid primary key default gen_random_uuid(),
  scope         text not null default 'platform',          -- 'platform' | 'company'
  company_id    uuid references public.companies(id) on delete cascade,
  provider      text not null default 'anthropic',          -- anthropic | openai | google | deepseek
  model         text not null default 'claude-haiku-4-5',
  api_key_ref   text,                                       -- id del secreto en Vault (NO la key)
  system_prompt text,
  temperature   numeric not null default 0.7,
  enabled       boolean not null default false,
  updated_by    uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now()
);

-- Una única config de plataforma (beta).
create unique index if not exists ai_config_platform_uniq
  on public.ai_config (scope) where scope = 'platform';

alter table public.ai_config enable row level security;
-- RLS activo + sin policies → ni anon ni authenticated. Solo service-role.
revoke all on public.ai_config from anon, authenticated;

-- ── Wrappers de Vault ────────────────────────────────────────
-- El esquema `vault` no se expone por PostgREST, así que envolvemos en `public`
-- con SECURITY DEFINER. EXPONEN LA API KEY → ejecutables SOLO por service_role.

create or replace function public.ai_set_api_key(p_secret text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'ai_provider_api_key';
  if v_id is null then
    v_id := vault.create_secret(p_secret, 'ai_provider_api_key', 'JARVIS provider API key');
  else
    perform vault.update_secret(v_id, p_secret);
  end if;
  return v_id::text;
end;
$$;

create or replace function public.ai_get_api_key()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ai_provider_api_key' limit 1;
$$;

revoke execute on function public.ai_set_api_key(text) from public, anon, authenticated;
revoke execute on function public.ai_get_api_key() from public, anon, authenticated;
grant execute on function public.ai_set_api_key(text) to service_role;
grant execute on function public.ai_get_api_key() to service_role;
