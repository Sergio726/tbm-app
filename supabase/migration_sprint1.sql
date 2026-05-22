-- ============================================================
-- THE BUSINESS MULTIPLIER APP — Migración Sprint 1
-- Onboarding + Dashboard Central
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: scorecards
-- Diagnóstico Organizacional TBM — 8 áreas, slider 1–5
-- ============================================================
create table public.scorecards (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,

  -- 8 áreas del diagnóstico TBM (score 1–5 cada una)
  score_liderazgo          smallint check (score_liderazgo between 1 and 5),
  score_equipo             smallint check (score_equipo between 1 and 5),
  score_delegacion         smallint check (score_delegacion between 1 and 5),
  score_comunicacion       smallint check (score_comunicacion between 1 and 5),
  score_procesos           smallint check (score_procesos between 1 and 5),
  score_tiempo             smallint check (score_tiempo between 1 and 5),
  score_dinero             smallint check (score_dinero between 1 and 5),
  score_cultura            smallint check (score_cultura between 1 and 5),

  -- Score total calculado (promedio * 20 para escalar a 100)
  total_score   numeric generated always as (
    round(
      (
        coalesce(score_liderazgo, 0) +
        coalesce(score_equipo, 0) +
        coalesce(score_delegacion, 0) +
        coalesce(score_comunicacion, 0) +
        coalesce(score_procesos, 0) +
        coalesce(score_tiempo, 0) +
        coalesce(score_dinero, 0) +
        coalesce(score_cultura, 0)
      )::numeric / 8,
    1)
  ) stored,

  -- Contexto
  notes         text,                            -- reflexión libre del Arquitecto
  is_baseline   boolean default false,           -- true = diagnóstico inicial (Día 1)
  completed_at  timestamptz default now(),
  created_at    timestamptz default now()
);

-- ============================================================
-- TABLA: kpis
-- Leading Indicators semanales por empresa
-- ============================================================
create table public.kpis (
  id             uuid primary key default uuid_generate_v4(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  owner_id       uuid references auth.users(id) on delete set null,

  name           text not null,
  description    text,
  type           text default 'leading',        -- 'leading' | 'lagging'
  unit           text,                          -- '%', '$', 'unidades', etc.

  weekly_target  numeric not null default 0,
  current_value  numeric default 0,

  week_date      date not null,                 -- lunes de la semana correspondiente
  entered_at     timestamptz,                   -- cuándo el dueño ingresó el valor
  is_active      boolean default true,

  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ============================================================
-- TABLA: energy_logs
-- Energía diaria del Arquitecto (1–5)
-- ============================================================
create table public.energy_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  level       smallint not null check (level between 1 and 5),
  log_date    date not null default current_date,
  note        text,
  created_at  timestamptz default now(),

  unique (user_id, log_date)  -- un registro por usuario por día
);

-- ============================================================
-- TABLA: invitations
-- Invitaciones pendientes de colaboradores
-- ============================================================
create table public.invitations (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  invited_by   uuid not null references auth.users(id) on delete cascade,
  email        text not null,
  role         text default 'colaborador',     -- 'colaborador' | 'observador'
  token        text unique default encode(gen_random_bytes(32), 'hex'),
  status       text default 'pending',         -- 'pending' | 'accepted' | 'expired'
  expires_at   timestamptz default (now() + interval '7 days'),
  accepted_at  timestamptz,
  created_at   timestamptz default now(),

  unique (company_id, email)
);

-- ============================================================
-- ROW LEVEL SECURITY — nuevas tablas
-- ============================================================

-- scorecards
alter table public.scorecards enable row level security;

create policy "Arquitecto ve scorecards de su empresa"
  on public.scorecards for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = scorecards.company_id
    )
  );

create policy "Usuario puede insertar su propio scorecard"
  on public.scorecards for insert
  with check (auth.uid() = user_id);

create policy "Usuario puede actualizar su propio scorecard"
  on public.scorecards for update
  using (auth.uid() = user_id);

-- kpis
alter table public.kpis enable row level security;

create policy "Miembros de empresa ven los KPIs"
  on public.kpis for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = kpis.company_id
    )
  );

create policy "Arquitecto puede crear y editar KPIs"
  on public.kpis for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = kpis.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Dueño del KPI puede actualizar su valor"
  on public.kpis for update
  using (
    auth.uid() = owner_id or
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = kpis.company_id
        and p.role = 'arquitecto'
    )
  );

-- energy_logs
alter table public.energy_logs enable row level security;

create policy "Usuario ve su propio log de energía"
  on public.energy_logs for select
  using (auth.uid() = user_id);

create policy "Arquitecto ve energía de su empresa"
  on public.energy_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = energy_logs.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Usuario inserta su propia energía"
  on public.energy_logs for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza su propia energía"
  on public.energy_logs for update
  using (auth.uid() = user_id);

-- invitations
alter table public.invitations enable row level security;

create policy "Arquitecto ve las invitaciones de su empresa"
  on public.invitations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = invitations.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto puede invitar"
  on public.invitations for insert
  with check (
    auth.uid() = invited_by and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = invitations.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto puede actualizar invitaciones"
  on public.invitations for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = invitations.company_id
        and p.role = 'arquitecto'
    )
  );

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create trigger kpis_updated_at
  before update on public.kpis
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ÍNDICES de performance
-- ============================================================
create index idx_scorecards_company_id  on public.scorecards(company_id);
create index idx_scorecards_user_id     on public.scorecards(user_id);
create index idx_kpis_company_id        on public.kpis(company_id);
create index idx_kpis_week_date         on public.kpis(week_date);
create index idx_energy_logs_user_date  on public.energy_logs(user_id, log_date);
create index idx_invitations_token      on public.invitations(token);
create index idx_invitations_company    on public.invitations(company_id);
