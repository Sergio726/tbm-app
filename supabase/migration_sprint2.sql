-- ============================================================
-- THE BUSINESS MULTIPLIER APP — Migración Sprint 2
-- Rituales: Pre-game (matutino personal), Los 5 Grandes (nocturno),
-- War Up (en vivo con Realtime), Cool Down (diario), Parking Lot,
-- Reporte Semanal automático.
--
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: ritual_configs
-- Configuración de rituales por empresa (modo, horarios)
-- ============================================================
create table public.ritual_configs (
  company_id            uuid primary key references public.companies(id) on delete cascade,
  mode                  text not null default 'daily',     -- 'daily' | 'A' | 'B' | 'C'
  war_up_deadline       time not null default '09:00',     -- hasta esta hora se puede ingresar War Up (modo async)
  cool_down_start       time not null default '17:00',     -- desde esta hora se habilita el Cool Down
  pre_game_reminder     time not null default '07:00',     -- hora del recordatorio matutino
  los_5_grandes_reminder time not null default '20:00',    -- hora del recordatorio nocturno
  timezone              text not null default 'America/Bogota',
  updated_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- TABLA: pre_games
-- Pre-game MATUTINO y PERSONAL del Arquitecto.
-- Privado (solo lo ve quien lo escribe). Es el gate del War Up.
-- ============================================================
create table public.pre_games (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  company_id            uuid not null references public.companies(id) on delete cascade,

  log_date              date not null default current_date,

  -- 3 Big Wins PERSONALES del Arquitecto (no del negocio)
  big_win_1             text,
  big_win_2             text,
  big_win_3             text,

  -- Mi Marcha de 20 Millas — acción diaria constante (editable 1x por semana, validado en app)
  twenty_mile_march     text,

  -- ¿Activación física hoy?
  physical_activation   boolean default false,

  -- Reflexión libre
  notes                 text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (user_id, log_date)
);

-- ============================================================
-- TABLA: los_5_grandes
-- Ritual NOCTURNO del Arquitecto: define las 5 prioridades
-- del NEGOCIO para el día siguiente.
-- Distinto al Pre-game (matutino, personal).
-- ============================================================
create table public.los_5_grandes (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,

  for_date              date not null,                     -- la fecha PARA la que son estas 5 prioridades
  -- (created_at refleja la noche anterior en la que se ingresaron)

  notes                 text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (company_id, for_date)
);

-- ============================================================
-- TABLA: los_5_grandes_items
-- Los 5 ítems individuales (1..5) por Los 5 Grandes.
-- ============================================================
create table public.los_5_grandes_items (
  id                    uuid primary key default uuid_generate_v4(),
  los_5_grandes_id      uuid not null references public.los_5_grandes(id) on delete cascade,

  position              smallint not null check (position between 1 and 5),
  title                 text not null,

  -- Alineación a Roca del Plan 90D (texto libre por ahora; en S6 migramos a rock_id real)
  rock_label            text,
  rock_id               uuid,  -- referencia futura a public.rocks (S6)

  -- Estado de ejecución (actualizado durante o al final del día)
  executed              boolean default false,
  executed_at           timestamptz,
  execution_note        text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (los_5_grandes_id, position)
);

-- ============================================================
-- TABLA: war_ups
-- Sesión EN VIVO del War Up del día (stand-up digital).
-- Una sesión por empresa por día. Usa Supabase Realtime.
-- ============================================================
create table public.war_ups (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade,

  war_up_date           date not null default current_date,
  started_by            uuid references auth.users(id) on delete set null,
  started_at            timestamptz,
  ended_at              timestamptz,

  status                text not null default 'pending',   -- 'pending' | 'active' | 'closed'

  -- Configuración runtime
  timer_duration_min    smallint default 15,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (company_id, war_up_date)
);

-- ============================================================
-- TABLA: war_up_entries
-- Una entrada por colaborador por War Up.
-- Realtime: tanto INSERT como UPDATE se propagan al Arquitecto.
-- ============================================================
create table public.war_up_entries (
  id                    uuid primary key default uuid_generate_v4(),
  war_up_id             uuid not null references public.war_ups(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,

  -- Las 3 preguntas del War Up
  what_today            text,                              -- QUÉ vas a lograr hoy (entregable exacto)
  why_today             text,                              -- POR QUÉ es lo más rentable hoy
  blocker               text,                              -- BLOQUEO: qué necesitás del líder

  -- Alineación a Roca (texto libre; migra en S6)
  rock_label            text,
  rock_id               uuid,

  -- Validación del Arquitecto (en vivo)
  validation_status     text,                              -- 'with_criteria' | 'without_criteria' | null
  validated_by          uuid references auth.users(id) on delete set null,
  validated_at          timestamptz,
  validation_note       text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (war_up_id, user_id)
);

-- ============================================================
-- TABLA: cool_downs
-- Cierre del día por colaborador. Victory Log OBLIGATORIO.
-- El Cool Down del viernes dispara el Reporte Semanal automático.
-- ============================================================
create table public.cool_downs (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,

  log_date              date not null default current_date,

  victory_log           text not null check (length(trim(victory_log)) > 0),  -- obligatorio
  reality_check         text,                              -- qué NO se logró y por qué (hechos)
  next_day              text,                              -- qué queda agendado para mañana

  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),

  unique (user_id, log_date)
);

-- ============================================================
-- TABLA: parking_lot
-- Ítems del War Up o Los 5 Grandes que no están alineados
-- a una Roca del Plan 90D. No bloquea el flujo — se aparcan.
-- ============================================================
create table public.parking_lot (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade,

  source                text not null,                     -- 'war_up' | '5_grandes' | 'manual'
  source_entry_id       uuid,                              -- id del war_up_entries o los_5_grandes_items origen
  proposed_by           uuid references auth.users(id) on delete set null,

  title                 text not null,
  rationale             text,                              -- por qué surgió, contexto
  rock_label            text,                              -- texto libre para futura alineación

  status                text not null default 'parked',    -- 'parked' | 'promoted' | 'discarded'
  reviewed_at           timestamptz,
  reviewed_by           uuid references auth.users(id) on delete set null,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- TABLA: weekly_reports
-- Generado automáticamente cuando se completa el Cool Down del viernes.
-- payload contiene: victories[], ritual_completion{}, 5_grandes[], reality_checks[].
-- ============================================================
create table public.weekly_reports (
  id                    uuid primary key default uuid_generate_v4(),
  company_id            uuid not null references public.companies(id) on delete cascade,

  week_start            date not null,                     -- lunes
  week_end              date not null,                     -- viernes
  generated_at          timestamptz default now(),
  generated_by          uuid references auth.users(id) on delete set null,

  payload               jsonb not null default '{}'::jsonb,

  created_at            timestamptz default now(),

  unique (company_id, week_start)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ritual_configs: empresa entera puede ver, solo Arquitecto edita
alter table public.ritual_configs enable row level security;

create policy "Miembros ven config de su empresa"
  on public.ritual_configs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = ritual_configs.company_id
    )
  );

create policy "Arquitecto puede insertar config"
  on public.ritual_configs for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = ritual_configs.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto puede actualizar config"
  on public.ritual_configs for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = ritual_configs.company_id
        and p.role = 'arquitecto'
    )
  );

-- pre_games: PRIVADO. Solo el dueño ve, inserta, actualiza.
alter table public.pre_games enable row level security;

create policy "Usuario ve su propio pre-game"
  on public.pre_games for select
  using (auth.uid() = user_id);

create policy "Usuario inserta su propio pre-game"
  on public.pre_games for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza su propio pre-game"
  on public.pre_games for update
  using (auth.uid() = user_id);

-- los_5_grandes: empresa entera ve; solo Arquitecto crea/edita.
alter table public.los_5_grandes enable row level security;

create policy "Miembros ven Los 5 Grandes de su empresa"
  on public.los_5_grandes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = los_5_grandes.company_id
    )
  );

create policy "Arquitecto inserta Los 5 Grandes"
  on public.los_5_grandes for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = los_5_grandes.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto actualiza Los 5 Grandes"
  on public.los_5_grandes for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = los_5_grandes.company_id
        and p.role = 'arquitecto'
    )
  );

-- los_5_grandes_items: mismo company scope que su parent.
alter table public.los_5_grandes_items enable row level security;

create policy "Miembros ven items de Los 5 Grandes"
  on public.los_5_grandes_items for select
  using (
    exists (
      select 1
      from public.los_5_grandes lg
      join public.profiles p on p.company_id = lg.company_id
      where lg.id = los_5_grandes_items.los_5_grandes_id
        and p.id = auth.uid()
    )
  );

create policy "Arquitecto inserta items"
  on public.los_5_grandes_items for insert
  with check (
    exists (
      select 1
      from public.los_5_grandes lg
      join public.profiles p on p.company_id = lg.company_id
      where lg.id = los_5_grandes_items.los_5_grandes_id
        and p.id = auth.uid()
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto actualiza items"
  on public.los_5_grandes_items for update
  using (
    exists (
      select 1
      from public.los_5_grandes lg
      join public.profiles p on p.company_id = lg.company_id
      where lg.id = los_5_grandes_items.los_5_grandes_id
        and p.id = auth.uid()
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto borra items"
  on public.los_5_grandes_items for delete
  using (
    exists (
      select 1
      from public.los_5_grandes lg
      join public.profiles p on p.company_id = lg.company_id
      where lg.id = los_5_grandes_items.los_5_grandes_id
        and p.id = auth.uid()
        and p.role = 'arquitecto'
    )
  );

-- war_ups: empresa entera ve; solo Arquitecto inicia/cierra.
alter table public.war_ups enable row level security;

create policy "Miembros ven war_ups de su empresa"
  on public.war_ups for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = war_ups.company_id
    )
  );

create policy "Arquitecto inicia war_up"
  on public.war_ups for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = war_ups.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto actualiza war_up"
  on public.war_ups for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = war_ups.company_id
        and p.role = 'arquitecto'
    )
  );

-- war_up_entries: empresa entera ve; cada user CRUD su propia entry;
-- Arquitecto puede actualizar validation_*.
alter table public.war_up_entries enable row level security;

create policy "Miembros ven entries del war_up"
  on public.war_up_entries for select
  using (
    exists (
      select 1
      from public.war_ups w
      join public.profiles p on p.company_id = w.company_id
      where w.id = war_up_entries.war_up_id
        and p.id = auth.uid()
    )
  );

create policy "Usuario inserta su propia entry"
  on public.war_up_entries for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1
      from public.war_ups w
      join public.profiles p on p.company_id = w.company_id
      where w.id = war_up_entries.war_up_id
        and p.id = auth.uid()
    )
  );

-- El propio user puede editar lo que escribió; el Arquitecto puede
-- editar TODO de la empresa (para marcar validación).
create policy "Usuario o Arquitecto actualizan entry"
  on public.war_up_entries for update
  using (
    auth.uid() = user_id or
    exists (
      select 1
      from public.war_ups w
      join public.profiles p on p.company_id = w.company_id
      where w.id = war_up_entries.war_up_id
        and p.id = auth.uid()
        and p.role = 'arquitecto'
    )
  );

-- cool_downs: dueño CRUD; Arquitecto SELECT de toda la empresa.
alter table public.cool_downs enable row level security;

create policy "Usuario ve su propio cool_down"
  on public.cool_downs for select
  using (auth.uid() = user_id);

create policy "Arquitecto ve cool_downs de su empresa"
  on public.cool_downs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = cool_downs.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Usuario inserta su cool_down"
  on public.cool_downs for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza su cool_down"
  on public.cool_downs for update
  using (auth.uid() = user_id);

-- parking_lot: Arquitecto CRUD; equipo SELECT.
alter table public.parking_lot enable row level security;

create policy "Miembros ven parking_lot de su empresa"
  on public.parking_lot for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = parking_lot.company_id
    )
  );

create policy "Miembros pueden aparcar"
  on public.parking_lot for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = parking_lot.company_id
    )
  );

create policy "Arquitecto puede actualizar parking_lot"
  on public.parking_lot for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = parking_lot.company_id
        and p.role = 'arquitecto'
    )
  );

create policy "Arquitecto puede borrar de parking_lot"
  on public.parking_lot for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = parking_lot.company_id
        and p.role = 'arquitecto'
    )
  );

-- weekly_reports: empresa entera SELECT; INSERT desde server actions del Arquitecto.
alter table public.weekly_reports enable row level security;

create policy "Miembros ven weekly_reports de su empresa"
  on public.weekly_reports for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = weekly_reports.company_id
    )
  );

create policy "Miembros pueden generar weekly_reports"
  on public.weekly_reports for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = weekly_reports.company_id
    )
  );

create policy "Arquitecto puede actualizar weekly_reports"
  on public.weekly_reports for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = weekly_reports.company_id
        and p.role = 'arquitecto'
    )
  );

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create trigger ritual_configs_updated_at
  before update on public.ritual_configs
  for each row execute procedure public.handle_updated_at();

create trigger pre_games_updated_at
  before update on public.pre_games
  for each row execute procedure public.handle_updated_at();

create trigger los_5_grandes_updated_at
  before update on public.los_5_grandes
  for each row execute procedure public.handle_updated_at();

create trigger los_5_grandes_items_updated_at
  before update on public.los_5_grandes_items
  for each row execute procedure public.handle_updated_at();

create trigger war_ups_updated_at
  before update on public.war_ups
  for each row execute procedure public.handle_updated_at();

create trigger war_up_entries_updated_at
  before update on public.war_up_entries
  for each row execute procedure public.handle_updated_at();

create trigger cool_downs_updated_at
  before update on public.cool_downs
  for each row execute procedure public.handle_updated_at();

create trigger parking_lot_updated_at
  before update on public.parking_lot
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- SUPABASE REALTIME — habilitar publicación
-- War Up es el caso de uso en vivo (stand-up digital).
-- ============================================================
alter publication supabase_realtime add table public.war_ups;
alter publication supabase_realtime add table public.war_up_entries;

-- ============================================================
-- ÍNDICES de performance
-- ============================================================
create index idx_pre_games_user_date          on public.pre_games(user_id, log_date);
create index idx_los_5_grandes_company_date   on public.los_5_grandes(company_id, for_date);
create index idx_los_5_grandes_items_parent   on public.los_5_grandes_items(los_5_grandes_id);
create index idx_war_ups_company_date         on public.war_ups(company_id, war_up_date);
create index idx_war_up_entries_war_up_id     on public.war_up_entries(war_up_id);
create index idx_war_up_entries_user_id       on public.war_up_entries(user_id);
create index idx_cool_downs_user_date         on public.cool_downs(user_id, log_date);
create index idx_cool_downs_company_date      on public.cool_downs(company_id, log_date);
create index idx_parking_lot_company          on public.parking_lot(company_id);
create index idx_parking_lot_status           on public.parking_lot(status);
create index idx_weekly_reports_company_week  on public.weekly_reports(company_id, week_start);
