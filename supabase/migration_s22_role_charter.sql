-- ============================================================================
-- S22 · Rol y progresión de la persona
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-29
--
-- Dos piezas:
--   E0. Blindar los campos de AUTORIDAD de `profiles` (extiende el trigger
--       `enforce_profile_role_company` de migration_fase0_hardening.sql).
--   E1. Tabla `role_charters` — la ficha de rol que el líder define sobre cada
--       persona, incluido su tope de decisión en $.
--
-- IDEMPOTENTE: se puede correr entera y volver a correr.
-- Reusa helpers SECURITY DEFINER ya existentes: auth_is_arquitecto(),
-- auth_company_id() (fix_rls_recursion.sql).
-- ============================================================================


-- ============================================================================
-- E0 · profiles: congelar los campos de autoridad
--
--   Problema (mismo patrón que T1 de fase0, que solo cubrió role/company_id):
--   la policy UPDATE "Usuario puede editar su propio perfil" (schema.sql:105)
--   usa `using (auth.uid() = id)` y **Postgres no permite restringir columnas
--   dentro de una policy** ⇒ habilita la fila ENTERA. La única defensa de los
--   campos de evaluación era la UI (`editable={isArquitecto}`), que no defiende
--   nada: el guardado de /equipo es un update client-side.
--
--   Hoy, sin esto, un colaborador desde la consola del navegador puede:
--     · subirse el nivel de delegación (los_level 1 → 5),
--     · revertir la evaluación de su líder (alignment 'baja' → 'alta'),
--     · bajarse la meta de KPI (kpi_weekly_target),
--     · falsear su perfil DISC (disc_letters / disc_status / disc_state).
--
--   Se vuelve crítico con la ficha de rol: `decision_limit_amount` NO es
--   informativo, es una autorización ("podés decidir hasta $X sin preguntarme").
--   Guardar autoridad en una superficie escribible por el controlado no sirve.
--
--   Solución: el mismo trigger BEFORE UPDATE (SECURITY INVOKER, hereda el rol
--   del caller) suma una segunda guarda — si cambia un campo de autoridad, el
--   caller tiene que ser el ARQUITECTO de esa empresa.
--
--   Qué se conserva intacto (son los que hacen funcionar el alta de usuarios):
--     · la excepción para postgres / service_role / supabase_admin,
--     · el Caso A (register) y el Caso B (accept-invite) de role/company_id.
--
--   Por qué no rompe nada más (verificado en el código):
--     · El test DISC público escribe vía la RPC `submit_disc`, que es
--       SECURITY DEFINER (migration_sprint3_disc.sql) → cae en la excepción de
--       current_user privilegiado.
--     · /cuenta (account-form.tsx) solo toca full_name, cargo, phone, timezone,
--       bio y avatar_url → ninguno es de autoridad.
--     · /equipo lo usa el Arquitecto → pasa la nueva guarda.
--
--   `cargo` queda FUERA del blindaje a propósito: hoy lo editan los dos — el
--   usuario en /cuenta y el líder en /equipo. Blindarlo rompería /cuenta.
--   Ambigüedad conocida y documentada (docs/PENDIENTES_REVISION.md).
-- ============================================================================

create or replace function public.enforce_profile_role_company()
returns trigger
language plpgsql   -- SECURITY INVOKER (default): current_user = rol del caller
as $$
begin
  -- Procesos privilegiados (service_role del admin, RPCs SECURITY DEFINER
  -- como submit_disc, migraciones que corren como postgres): sin restricción.
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  -- ── Guarda 2 (S22) · campos de AUTORIDAD ─────────────────────────────────
  -- Los define el líder SOBRE la persona; la persona no se los edita a sí
  -- misma. Se evalúa antes que la guarda de role/company_id porque es
  -- independiente: un colaborador que toca solo `los_level` no cambia su rol,
  -- así que la guarda vieja lo dejaba pasar.
  -- Autonomía y evaluación
  if (new.los_level            is distinct from old.los_level)
     or (new.los_target        is distinct from old.los_target)
     or (new.alignment         is distinct from old.alignment)
  -- Objetivos asignados
     or (new.kpi_name          is distinct from old.kpi_name)
     or (new.kpi_weekly_target is distinct from old.kpi_weekly_target)
  -- Perfil DISC evaluado (resultado del test + lectura del líder). Se blinda
  -- el bloque COMPLETO: ningún flujo legítimo lo escribe el propio colaborador
  -- — solo /equipo y /workbooks (ambos solo-arquitecto) y la RPC submit_disc
  -- (SECURITY DEFINER, exceptuada arriba).
     or (new.disc_letters      is distinct from old.disc_letters)
     or (new.disc_name         is distinct from old.disc_name)
     or (new.disc_icon         is distinct from old.disc_icon)
     or (new.disc_status       is distinct from old.disc_status)
     or (new.disc_state        is distinct from old.disc_state)
     or (new.disc_temor        is distinct from old.disc_temor)
     or (new.disc_prime_plan   is distinct from old.disc_prime_plan)
     or (new.disc_pdf_url      is distinct from old.disc_pdf_url)
  then
    if not (public.auth_is_arquitecto()
            and new.company_id is not distinct from public.auth_company_id())
    then
      raise exception
        'No autorizado: el nivel de delegación, la alineación, el KPI y el perfil DISC los define el Arquitecto de tu empresa.'
        using errcode = '42501';
    end if;
  end if;

  -- ── Guarda 1 (fase0 · T1) · role / company_id ────────────────────────────
  -- No cambian las columnas sensibles: permitir (full_name, cargo, tour, etc.).
  if new.role is not distinct from old.role
     and new.company_id is not distinct from old.company_id then
    return new;
  end if;

  -- Caso A — dueño que crea su empresa (register).
  if old.company_id is null
     and new.role = 'arquitecto'
     and public.is_owner_of_company(new.id, new.company_id) then
    return new;
  end if;

  -- Caso B — invitado que acepta (accept-invite).
  if old.company_id is null
     and new.role = 'colaborador'
     and public.has_invite_for_user(new.id, new.company_id) then
    return new;
  end if;

  raise exception 'No autorizado: no podés cambiar tu rol ni tu empresa.'
    using errcode = '42501';
end;
$$;

-- El trigger ya existe (fase0); se recrea por idempotencia si falta.
drop trigger if exists trg_enforce_profile_role_company on public.profiles;
create trigger trg_enforce_profile_role_company
  before update on public.profiles
  for each row execute function public.enforce_profile_role_company();


-- ============================================================================
-- E1 · role_charters — la ficha de rol ("rights" de Dilio)
--
--   Dilio (Meet 2026-07-25): "el rol tiene que decirle a la persona qué hace,
--   cómo lo hace, las expectativas que se tienen con él, los resultados que
--   buscamos al tenerlo en el equipo, y sus derechos: tú puedes decidir hasta
--   $X.000 sin preguntarme a mí. No me preguntes, ejecuta."
--
--   Tabla propia y no columnas en `profiles` porque: son 5 campos de texto
--   largo sobre una tabla que ya tiene ~25 columnas; conceptualmente es un
--   DOCUMENTO del líder sobre la persona, no un atributo del usuario; y así se
--   puede versionar/auditar más adelante sin migrar `profiles`.
--
--   1:1 con profiles (PK = profile_id). `company_id` se desnormaliza para que
--   las policies no tengan que joinear (mismo criterio que el resto del repo).
-- ============================================================================

create table if not exists public.role_charters (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  company_id   uuid not null references public.companies(id) on delete cascade,

  -- La ficha, en el orden en que Dilio la enumeró.
  mission      text,          -- qué hace
  how          text,          -- cómo lo hace
  expectations text,          -- qué se espera de él
  outcomes     text,          -- resultados que buscamos al tenerlo en el equipo
  rights       text,          -- sus derechos (texto libre)

  -- El derecho concreto y medible: hasta cuánto decide sin preguntar.
  -- Complementa (no reemplaza) a `authority_matrix`, que define las bandas de
  -- monto de la EMPRESA (N1 autonomía total / N2 táctica / N3 requiere
  -- aprobación). Acá va el derecho INDIVIDUAL, que es lo que pidió Dilio:
  -- "tú puedes decidir hasta $X.000 sin preguntarme a mí". Misma moneda por
  -- defecto que la matriz (ARS) para no arrastrar dos unidades distintas.
  decision_limit_amount   numeric(14,2),
  decision_limit_currency text default 'ARS',

  updated_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Monto no negativo (null = sin tope definido, que es distinto de 0).
alter table public.role_charters drop constraint if exists role_charters_limit_non_negative;
alter table public.role_charters add constraint role_charters_limit_non_negative
  check (decision_limit_amount is null or decision_limit_amount >= 0);

create index if not exists idx_role_charters_company on public.role_charters (company_id);

alter table public.role_charters enable row level security;

-- SELECT: el dueño de la ficha (Dilio insistió en que LA PERSONA la vea) +
-- el Arquitecto de su empresa.
drop policy if exists "Ver ficha de rol propia o de mi empresa" on public.role_charters;
create policy "Ver ficha de rol propia o de mi empresa"
  on public.role_charters for select
  using (
    profile_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

-- INSERT / UPDATE / DELETE: SOLO el Arquitecto de la empresa. La persona nunca
-- se edita su propia ficha — es el punto de todo E0.
drop policy if exists "Arquitecto crea fichas de rol" on public.role_charters;
create policy "Arquitecto crea fichas de rol"
  on public.role_charters for insert
  with check (
    public.auth_is_arquitecto() and company_id = public.auth_company_id()
  );

drop policy if exists "Arquitecto edita fichas de rol" on public.role_charters;
create policy "Arquitecto edita fichas de rol"
  on public.role_charters for update
  using (
    public.auth_is_arquitecto() and company_id = public.auth_company_id()
  );

drop policy if exists "Arquitecto borra fichas de rol" on public.role_charters;
create policy "Arquitecto borra fichas de rol"
  on public.role_charters for delete
  using (
    public.auth_is_arquitecto() and company_id = public.auth_company_id()
  );

-- `updated_at` automático (reusa el trigger genérico del schema base).
drop trigger if exists role_charters_updated_at on public.role_charters;
create trigger role_charters_updated_at
  before update on public.role_charters
  for each row execute procedure public.handle_updated_at();
