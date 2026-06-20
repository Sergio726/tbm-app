-- Sprint 18 (A3.1) — Checklist de hábitos del Pre-game
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Ejecutar en: https://supabase.com/dashboard/project/fozhnfxehbbgqaerprgf/sql/new
--
-- Dilio (A3): el Pre-game matutino debe incluir un checklist de hábitos sugeridos
-- (gym, meditar, agua, sin azúcar AM…). El usuario elige 5–10 (+ los propios) y los
-- marca cada día con un toque. Las meditaciones quedan fuera (bloqueadas por Dilio).
--
-- Dos tablas:
--   user_habits — configuración de los hábitos elegidos (persiste entre días)
--   habit_logs  — una fila = ese hábito marcado como hecho ese día (toggle insert/delete)

-- ── user_habits ──────────────────────────────────────────────
create table if not exists public.user_habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  company_id   uuid not null references public.companies(id) on delete cascade,
  label        text not null,
  emoji        text,
  category     varchar(20),               -- movimiento | mente | cuerpo | nutricion | custom
  catalog_key  varchar(40),               -- clave del catálogo; null = hábito propio
  sort_order   int not null default 0,
  is_active    boolean not null default true,  -- soft-remove del checklist (conserva historial)
  created_at   timestamptz not null default now()
);

create index if not exists idx_user_habits_user_active
  on public.user_habits(user_id, is_active);

alter table public.user_habits enable row level security;

create policy "Usuario ve sus propios hábitos"
  on public.user_habits for select
  using (auth.uid() = user_id);

create policy "Usuario crea sus propios hábitos"
  on public.user_habits for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza sus propios hábitos"
  on public.user_habits for update
  using (auth.uid() = user_id);

create policy "Usuario borra sus propios hábitos"
  on public.user_habits for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_habits to authenticated;

-- ── habit_logs ───────────────────────────────────────────────
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    uuid not null references public.user_habits(id) on delete cascade,
  log_date    date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists idx_habit_logs_user_date
  on public.habit_logs(user_id, log_date);

alter table public.habit_logs enable row level security;

create policy "Usuario ve sus propios logs de hábito"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Usuario marca sus propios logs de hábito"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Usuario desmarca sus propios logs de hábito"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.habit_logs to authenticated;
