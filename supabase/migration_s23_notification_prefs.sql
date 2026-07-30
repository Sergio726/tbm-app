-- ============================================================================
-- S23 · Despertador diario — preferencias de notificación por usuario
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-30
--
-- Dilio (Meet 2026-07-25): "sería bueno que el sistema te despierte con un
-- correo… buenos días, aquí DC, tu executive coach, recuerda hacer tu pre-game".
-- Para que el despertador sea aceptable tiene que ser apagable: este sprint
-- absorbe el SPRINT 19 propuesto (módulo de notificaciones).
--
-- Diferencia clave con `role_charters` (S22): acá el DUEÑO SÍ ESCRIBE. Son sus
-- preferencias, no una evaluación que el líder hace sobre él. Por eso no toca el
-- trigger de campos de autoridad — es tabla aparte y el usuario la gobierna.
--
-- IDEMPOTENTE: se puede correr entera y volver a correr.
-- ============================================================================

create table if not exists public.notification_prefs (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  -- Desnormalizada para que las policies no tengan que joinear (mismo criterio
  -- que el resto del repo). Nullable: un coach dedicado no tiene empresa.
  company_id uuid references public.companies(id) on delete cascade,

  -- Qué recibe. Todo arranca en true: el sistema avisa por defecto y la persona
  -- apaga lo que no quiere (no al revés — si no, nadie se enteraría de nada).
  daily_digest  boolean not null default true,  -- el despertador matinal
  task_alerts   boolean not null default true,  -- tareas vencidas / bloqueadas
  weekly_report boolean not null default true,  -- reporte semanal

  -- Hora local preferida (0-23). null = usar `ritual_configs.pre_game_reminder`
  -- de la empresa. OJO: hoy el cron corre 1×/día, así que este valor se GUARDA
  -- pero todavía no cambia el momento del envío — eso llega con el barrido
  -- horario (S23b). La UI lo dice explícitamente para no prometer de más.
  preferred_hour int,

  -- Canal. Hoy solo email; WhatsApp entra en S31 sumando una columna acá y un
  -- adapter en lib/notify-channels.ts, sin tocar la lógica de negocio.
  channel_email boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_prefs
  drop constraint if exists notification_prefs_hour_range;
alter table public.notification_prefs
  add constraint notification_prefs_hour_range
  check (preferred_hour is null or (preferred_hour >= 0 and preferred_hour <= 23));

create index if not exists idx_notification_prefs_company
  on public.notification_prefs (company_id);

alter table public.notification_prefs enable row level security;

-- Cada usuario gobierna SOLO sus propias preferencias. Ni el Arquitecto las ve:
-- no son datos del equipo, son de la persona. El cron las lee con service_role.
drop policy if exists "Ver mis preferencias de notificación" on public.notification_prefs;
create policy "Ver mis preferencias de notificación"
  on public.notification_prefs for select
  using (user_id = auth.uid());

drop policy if exists "Crear mis preferencias de notificación" on public.notification_prefs;
create policy "Crear mis preferencias de notificación"
  on public.notification_prefs for insert
  with check (user_id = auth.uid());

drop policy if exists "Editar mis preferencias de notificación" on public.notification_prefs;
create policy "Editar mis preferencias de notificación"
  on public.notification_prefs for update
  using (user_id = auth.uid());

drop trigger if exists notification_prefs_updated_at on public.notification_prefs;
create trigger notification_prefs_updated_at
  before update on public.notification_prefs
  for each row execute procedure public.handle_updated_at();

-- NOTA sobre la ausencia de fila: el cron trata "sin fila" como TODO ACTIVADO.
-- Por eso no se hace backfill de los usuarios existentes: no hace falta, y así
-- nadie queda sin avisos por no haber entrado nunca a configurar.
