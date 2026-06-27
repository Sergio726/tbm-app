-- Email · F1 — Configuración de correo desde el panel god-mode
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- email_config: proveedor/remitente/reply-to/soporte del correo de la app (Canal A,
-- hoy Resend). El secreto (API key de Resend o pass SMTP) NO se guarda acá: va cifrado
-- en Supabase Vault; api_key_ref guarda solo el id del secreto. Beta = una sola fila
-- scope='platform'. Solo service-role accede. (Mismo patrón que ai_config / DC-2.)
-- NOTA: NO controla los mails de Supabase Auth (magic links/invites) → esos se
-- configuran en el dashboard de Supabase (ver docs/EMAIL_ADMIN_CONFIG.md, Canal B).

create table if not exists public.email_config (
  id            uuid primary key default gen_random_uuid(),
  scope         text not null default 'platform',     -- 'platform' | 'company'
  provider      text not null default 'resend',        -- resend | smtp
  from_name     text,                                  -- "The Business Multiplier"
  from_email    text,                                  -- noreply@dominio (verificado)
  reply_to      text,                                  -- a dónde responden
  support_email text,                                  -- casilla de contacto / "pedir créditos"
  smtp_host     text,                                  -- (provider='smtp', futuro)
  smtp_port     int,
  smtp_secure   boolean not null default true,
  smtp_user     text,
  api_key_ref   text,                                  -- id del secreto en Vault (NO la key)
  enabled       boolean not null default false,
  updated_by    uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now()
);

-- Una única config de plataforma (beta).
create unique index if not exists email_config_platform_uniq
  on public.email_config (scope) where scope = 'platform';

alter table public.email_config enable row level security;
-- RLS activo + sin policies → ni anon ni authenticated. Solo service-role.
revoke all on public.email_config from anon, authenticated;

-- ── Wrappers de Vault ────────────────────────────────────────
-- El secreto es la API key de Resend (o el pass SMTP). EXPONEN EL SECRETO →
-- ejecutables SOLO por service_role. (Mismo patrón que ai_set/get_api_key.)

create or replace function public.email_set_secret(p_secret text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'email_provider_secret';
  if v_id is null then
    v_id := vault.create_secret(p_secret, 'email_provider_secret', 'Email provider secret (Resend key / SMTP pass)');
  else
    perform vault.update_secret(v_id, p_secret);
  end if;
  return v_id::text;
end;
$$;

create or replace function public.email_get_secret()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'email_provider_secret' limit 1;
$$;

revoke execute on function public.email_set_secret(text) from public, anon, authenticated;
revoke execute on function public.email_get_secret() from public, anon, authenticated;
grant execute on function public.email_set_secret(text) to service_role;
grant execute on function public.email_get_secret() to service_role;
