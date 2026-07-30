-- ============================================================================
-- S25 · KPIs en cascada — de la Roca del trimestre a la actividad diaria
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-30
--
-- Dilio (Meet 2026-07-25): "cuando tú estableces los cinco grandes estratégicos,
-- el sistema tiene que OBLIGAR a que la persona describa claramente a cada
-- implicado cuáles son los indicadores con los que él aportaría al tema general".
--
-- Su ejemplo, y el caso de prueba del sprint:
--   "un grande es… conseguir cinco clientes mensuales. Esos cinco clientes tienen
--    que aportar $25.000. ¿Quiénes son los responsables? A Sebastián le
--    corresponden tres clientes, a Dilio le corresponden dos. Cada uno tiene que
--    hacer tantas llamadas, mandar tantas propuestas al mes."
--
-- ANCLAJE (decidido con Sebas, PENDIENTES_REVISION §6): la cascada cuelga de la
-- ROCA del trimestre. El "5 por mes" es la CADENCIA de una meta trimestral
-- (3×5 = 15 en el trimestre), no un nivel aparte. Por eso NO hay tabla de metas
-- mensuales: alcanza con el ritmo como atributo derivado.
--
-- Y el compromiso se guarda como TOTAL DEL TRIMESTRE, no como cuota mensual:
--   "se puede dar que el primer mes no llegue a los 5, que el segundo tampoco y
--    tal vez el último sí lo logre… pero debe saber qué está haciendo o no está
--    haciendo para lograr el objetivo"  (Sebas, 2026-07-30)
-- O sea: 2+4+9 = 15 cierra igual. Un mes flojo es un dato, no un incumplimiento.
--
-- NO toca `kpis` ni `leading_indicators`: son otros dos conceptos del método
-- (número único por colaborador · los 5 del BOS). Ver §6.
--
-- IDEMPOTENTE: se puede correr entera y volver a correr.
-- ============================================================================


-- ── 1. La meta medible de la Roca ───────────────────────────────────────────
-- Hoy `rocks` tiene título y `success_criteria` en texto libre. Para poder
-- repartir y proyectar hace falta un número.

alter table public.rocks add column if not exists target_value  numeric(14,2);
alter table public.rocks add column if not exists target_unit   text;          -- 'clientes', '$', 'unidades'
alter table public.rocks add column if not exists target_money  numeric(14,2); -- lo que ese volumen aporta ($25.000/mes → 75.000)

comment on column public.rocks.target_value is
  'Meta TOTAL del trimestre (ej. 15 clientes). El ritmo mensual se deriva dividiendo por los meses del trimestre — no se guarda como cuota mensual: el compromiso es el total.';


-- ── 2. El reparto: cuánto aporta cada responsable ────────────────────────────
-- "A Sebastián le corresponden tres clientes, a Dilio le corresponden dos"
-- (por mes → 9 y 6 en el trimestre).

create table if not exists public.rock_contributions (
  id           uuid primary key default gen_random_uuid(),
  rock_id      uuid not null references public.rocks(id) on delete cascade,
  company_id   uuid not null references public.companies(id) on delete cascade,
  owner_id     uuid not null references public.profiles(id) on delete cascade,

  -- Aporte comprometido para TODO el trimestre (no por mes).
  target_value numeric(14,2) not null default 0,
  target_money numeric(14,2),

  notes        text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Una fila por persona y por Roca: el reparto no se duplica.
  unique (rock_id, owner_id)
);

create index if not exists idx_rock_contributions_owner
  on public.rock_contributions (owner_id);
create index if not exists idx_rock_contributions_company
  on public.rock_contributions (company_id);


-- ── 3. Las actividades que llevan a ese aporte ───────────────────────────────
-- "tiene que hacer tantas llamadas, mandar tantas propuestas al mes".
--
-- Son lo ÚNICO que la persona controla directamente (el resultado es
-- consecuencia), así que son las que S26 va a preguntar a diario.

create table if not exists public.contribution_activities (
  id              uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.rock_contributions(id) on delete cascade,
  company_id      uuid not null references public.companies(id) on delete cascade,
  -- Desnormalizado: las policies y el check diario de S26 filtran por persona.
  owner_id        uuid not null references public.profiles(id) on delete cascade,

  name            text not null,          -- 'llamadas', 'propuestas enviadas'
  unit            text,
  -- Ritmo objetivo. Semanal porque es la cadencia de los rituales TBM (War Up).
  weekly_target   numeric(10,2) not null default 0,

  sort_order      int not null default 0,
  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_contribution_activities_owner
  on public.contribution_activities (owner_id, is_active);
create index if not exists idx_contribution_activities_contribution
  on public.contribution_activities (contribution_id);


-- ── 4. RLS ──────────────────────────────────────────────────────────────────
-- Se respeta la decisión de PENDIENTES_REVISION §1 (ya aplicada para `kpis`):
-- el colaborador ve y AUTOGESTIONA lo suyo; el Arquitecto ve y edita todo lo de
-- su empresa. §E5: "él también puede armar su propia estructura para lograrlo…
-- nosotros predicamos una cultura de autogestión".

alter table public.rock_contributions enable row level security;
alter table public.contribution_activities enable row level security;

-- rock_contributions
drop policy if exists "Ver aportes propios o de mi empresa" on public.rock_contributions;
create policy "Ver aportes propios o de mi empresa"
  on public.rock_contributions for select
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

-- El dueño puede crear/editar SU aporte (autogestión) y el Arquitecto cualquiera
-- de su empresa. Ojo: el dueño no puede inventarse un aporte en otra empresa
-- porque `company_id` tiene que ser la suya.
drop policy if exists "Crear aporte propio o de mi empresa" on public.rock_contributions;
create policy "Crear aporte propio o de mi empresa"
  on public.rock_contributions for insert
  with check (
    company_id = public.auth_company_id()
    and (owner_id = auth.uid() or public.auth_is_arquitecto())
  );

drop policy if exists "Editar aporte propio o de mi empresa" on public.rock_contributions;
create policy "Editar aporte propio o de mi empresa"
  on public.rock_contributions for update
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

-- Borrar: solo el Arquitecto. El reparto lo define el líder; que un colaborador
-- pueda eliminar su propio compromiso vaciaría el sentido de la cascada.
drop policy if exists "Arquitecto borra aportes" on public.rock_contributions;
create policy "Arquitecto borra aportes"
  on public.rock_contributions for delete
  using (public.auth_is_arquitecto() and company_id = public.auth_company_id());

-- contribution_activities — mismo criterio.
drop policy if exists "Ver actividades propias o de mi empresa" on public.contribution_activities;
create policy "Ver actividades propias o de mi empresa"
  on public.contribution_activities for select
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

drop policy if exists "Crear actividad propia o de mi empresa" on public.contribution_activities;
create policy "Crear actividad propia o de mi empresa"
  on public.contribution_activities for insert
  with check (
    company_id = public.auth_company_id()
    and (owner_id = auth.uid() or public.auth_is_arquitecto())
  );

drop policy if exists "Editar actividad propia o de mi empresa" on public.contribution_activities;
create policy "Editar actividad propia o de mi empresa"
  on public.contribution_activities for update
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

-- Su propia actividad SÍ la puede borrar: es el "cómo" que ella eligió para
-- llegar, no el compromiso en sí (que es el aporte, y ese no lo borra).
drop policy if exists "Borrar actividad propia o de mi empresa" on public.contribution_activities;
create policy "Borrar actividad propia o de mi empresa"
  on public.contribution_activities for delete
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );


-- ── 5. updated_at automático ────────────────────────────────────────────────
drop trigger if exists rock_contributions_updated_at on public.rock_contributions;
create trigger rock_contributions_updated_at
  before update on public.rock_contributions
  for each row execute procedure public.handle_updated_at();

drop trigger if exists contribution_activities_updated_at on public.contribution_activities;
create trigger contribution_activities_updated_at
  before update on public.contribution_activities
  for each row execute procedure public.handle_updated_at();

-- NOTA para S26: el marcado diario de estas actividades ("¿hiciste las llamadas?
-- ¿mandaste las propuestas?") y la proyección TRIMESTRAL (acumulado vs. meses
-- restantes, sin semáforo mensual pass/fail) son de S26. Acá solo la estructura.
