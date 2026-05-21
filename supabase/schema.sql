-- ============================================================
-- THE BUSINESS MULTIPLIER APP — Supabase Schema
-- Sprint 0: companies + profiles con RLS
-- ============================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: companies
-- ============================================================
create table public.companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner_id    uuid references auth.users(id) on delete cascade,
  sector      text,
  team_size   int,                        -- cantidad de colaboradores
  plan        text default 'trial',       -- 'trial' | 'pro' | 'enterprise'
  settings    jsonb default '{
    "ritual_frequency": "daily",
    "timezone": "America/Bogota"
  }',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos de la app
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  company_id      uuid references public.companies(id) on delete cascade,
  full_name       text,
  email           text,
  role            text default 'arquitecto', -- 'arquitecto' | 'colaborador' | 'observador'
  avatar_url      text,

  -- DISC
  disc_letters    text,                  -- 'D' | 'I' | 'S' | 'C' | 'DI' | 'SC' etc.
  disc_name       text,                  -- 'El Especialista', 'El Alentador', etc.
  disc_icon       text,                  -- emoji del perfil
  disc_status     text default 'pendiente', -- 'pendiente' | 'enviado' | 'completado'
  disc_state      text default 'luz',    -- 'luz' | 'sombra'
  disc_temor      text,
  disc_prime_plan text,
  disc_pdf_url    text,

  -- LOS (Leadership Operating System)
  los_level       int default 1,         -- 1-5 (Cadete → Socio)
  los_target      int,                   -- nivel meta del mes

  -- Alineación rol ↔ perfil (evaluación del Arquitecto)
  alignment       text,                  -- 'alta' | 'media' | 'baja'

  -- KPI único del rol (Team Performance Scorecard)
  kpi_name        text,
  kpi_weekly_target numeric,

  -- Onboarding
  onboarding_completed boolean default false,
  onboarding_step      int default 0,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- companies: solo el owner puede ver/editar su empresa
alter table public.companies enable row level security;

create policy "Owner puede ver su empresa"
  on public.companies for select
  using (auth.uid() = owner_id);

create policy "Owner puede crear su empresa"
  on public.companies for insert
  with check (auth.uid() = owner_id);

create policy "Owner puede editar su empresa"
  on public.companies for update
  using (auth.uid() = owner_id);

-- profiles: cada usuario ve su propio perfil + los de su empresa
alter table public.profiles enable row level security;

create policy "Usuario puede ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Arquitecto ve todos los perfiles de su empresa"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = profiles.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Usuario puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Arquitecto puede editar perfiles de su empresa"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = profiles.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Sistema puede insertar perfiles"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- TRIGGER: auto-crear profile al registrarse un usuario
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at
  before update on public.companies
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ÍNDICES de performance
-- ============================================================
create index idx_profiles_company_id on public.profiles(company_id);
create index idx_companies_owner_id on public.companies(owner_id);
