-- Sprint 8 (app) / Sprint 4 (producto) — Módulo Delegación (Pase de Estafeta)
-- Tablas: tasks, task_updates
-- RLS: usuarios solo ven tareas de su empresa

-- ── tasks ─────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id            uuid          primary key default gen_random_uuid(),
  company_id    uuid          not null references companies(id) on delete cascade,
  created_by    uuid          not null references profiles(id),
  assigned_to   uuid          references profiles(id),

  -- Los 5 puntos del Pase de Estafeta
  what_dod      text          not null default '',
  why_context   text          not null default '',
  how_constraints text        not null default '',
  when_deadline timestamptz   not null default now(),
  check_loop    text          not null default '',

  -- Metadata
  los_required  smallint,
  estimated_cost decimal(12,2),
  authority_level smallint,
  status        varchar(20)   not null default 'pending',
  delegable_flag boolean      not null default false,

  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

-- Auto-actualizar updated_at en tasks
create or replace function update_tasks_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_tasks_updated_at();

-- ── task_updates ──────────────────────────────────────────────────────────────
create table if not exists task_updates (
  id        uuid        primary key default gen_random_uuid(),
  task_id   uuid        not null references tasks(id) on delete cascade,
  user_id   uuid        not null references profiles(id),
  type      varchar(30) not null,
  -- tipos válidos: progress | blocked | boomerang_attempt | completed | stale_alert
  content   text,
  created_at timestamptz not null default now()
);

-- ── RLS — tasks ───────────────────────────────────────────────────────────────
alter table tasks enable row level security;

-- Lectura: cualquier miembro de la empresa ve las tareas de su empresa
create policy "tasks_select_company"
  on tasks for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
  );

-- Insertar: cualquier miembro autenticado de la empresa puede crear tareas
create policy "tasks_insert_company"
  on tasks for insert
  with check (
    company_id = (select company_id from profiles where id = auth.uid())
  );

-- Actualizar: el creador o el asignado pueden actualizar
create policy "tasks_update_company"
  on tasks for update
  using (
    company_id = (select company_id from profiles where id = auth.uid())
  );

-- Eliminar: solo el creador puede eliminar
create policy "tasks_delete_creator"
  on tasks for delete
  using (created_by = auth.uid());

-- ── RLS — task_updates ────────────────────────────────────────────────────────
alter table task_updates enable row level security;

create policy "task_updates_select_company"
  on task_updates for select
  using (
    task_id in (
      select id from tasks
      where company_id = (select company_id from profiles where id = auth.uid())
    )
  );

create policy "task_updates_insert_company"
  on task_updates for insert
  with check (
    task_id in (
      select id from tasks
      where company_id = (select company_id from profiles where id = auth.uid())
    )
  );

-- ── Índices para queries frecuentes ──────────────────────────────────────────
create index if not exists tasks_company_id_idx on tasks(company_id);
create index if not exists tasks_assigned_to_idx on tasks(assigned_to);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists task_updates_task_id_idx on task_updates(task_id);
