-- ============================================================
-- FASE 2C — Endurecer el ledger de créditos (auditoria.md DB-8/PAY-2/3/6/5/11)
--
--   · Idempotencia por request_id (PAY-2): base para reusar la misma RPC desde
--     el webhook de Stripe (event.id como request_id) sin doble carga.
--   · No permitir saldo negativo (DB-8/PAY-3): evita el drift ledger⇄saldo que
--     producía el clamp greatest(0, …).
--   · CHECK de type (PAY-6) + balance_after (auditoría contable).
--   · ref del consumo = assessment_id, no profile_id (PAY-6): ata el movimiento
--     al test que pagó.
--   · Unique parcial de pendientes por perfil (PAY-5): la carrera de doble
--     generación resuelve en 1 solo cobro.
--   · Tope de monto + manejo de FK (PAY-11).
--
--   Idempotente. Aplicar en el SQL Editor. Nota: el caller del admin sigue
--   funcionando sin cambios (request_id es opcional); pasar un request_id desde
--   el código activa la idempotencia (PAY-2 lado código, pendiente).
-- ============================================================

-- ── 1. Columnas nuevas del ledger ────────────────────────────
alter table public.credit_transactions
  add column if not exists request_id    uuid,
  add column if not exists balance_after int;

-- Idempotencia: un request_id no se procesa dos veces.
create unique index if not exists uq_credit_tx_request
  on public.credit_transactions(request_id) where request_id is not null;

-- Dominio de type (NOT VALID: no reprocesa filas viejas, solo valida las nuevas).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'credit_tx_type_chk') then
    alter table public.credit_transactions
      add constraint credit_tx_type_chk
      check (type in ('grant','consume','adjust','promo','expire','purchase','refund'))
      not valid;
  end if;
end $$;

-- ── 2. Unique parcial: un solo pendiente por perfil (PAY-5) ──
-- Si hay pendientes duplicados preexistentes, no aborta la migración: avisa.
do $$
begin
  begin
    create unique index if not exists uq_disc_pending_per_profile
      on public.disc_assessments(profile_id) where status = 'pendiente';
  exception when others then
    raise notice 'uq_disc_pending_per_profile no se creó (hay pendientes duplicados). Limpiar y reintentar: %', sqlerrm;
  end;
end $$;

-- ── 3. grant_credits: idempotente + no-negativo + tope (PAY-2/3/11) ──
drop function if exists public.grant_credits(uuid, int, text, text);
create or replace function public.grant_credits(
  p_company_id uuid,
  p_amount     int,
  p_reason     text default null,
  p_type       text default 'grant',
  p_request_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current int;
  v_balance int;
begin
  if not public.is_platform_admin() then
    return jsonb_build_object('ok', false, 'error', 'no_autorizado');
  end if;
  if p_amount is null or p_amount = 0 then
    return jsonb_build_object('ok', false, 'error', 'monto_invalido');
  end if;
  if abs(p_amount) > 100000 then
    return jsonb_build_object('ok', false, 'error', 'monto_excesivo');
  end if;

  -- Idempotencia: si ese request_id ya se aplicó, devolver el saldo (no recarga).
  if p_request_id is not null and exists (
    select 1 from public.credit_transactions where request_id = p_request_id
  ) then
    select balance into v_balance from public.company_credits where company_id = p_company_id;
    return jsonb_build_object('ok', true, 'balance', coalesce(v_balance, 0), 'idempotent', true);
  end if;

  -- Asegurar la fila de saldo y lockearla.
  insert into public.company_credits (company_id, balance, updated_at)
  values (p_company_id, 0, now())
  on conflict (company_id) do nothing;

  select balance into v_current
    from public.company_credits where company_id = p_company_id for update;
  v_current := coalesce(v_current, 0);

  -- No dejar saldo negativo (evita el drift ledger⇄saldo).
  if v_current + p_amount < 0 then
    return jsonb_build_object('ok', false, 'error', 'saldo_insuficiente');
  end if;

  v_balance := v_current + p_amount;
  update public.company_credits
    set balance = v_balance, updated_at = now()
    where company_id = p_company_id;

  insert into public.credit_transactions
    (company_id, delta, type, reason, actor_id, request_id, balance_after)
  values (p_company_id, p_amount, coalesce(p_type, 'grant'), p_reason, auth.uid(), p_request_id, v_balance);

  return jsonb_build_object('ok', true, 'balance', v_balance);

exception
  when unique_violation then
    -- carrera con el mismo request_id → idempotente
    select balance into v_balance from public.company_credits where company_id = p_company_id;
    return jsonb_build_object('ok', true, 'balance', coalesce(v_balance, 0), 'idempotent', true);
  when foreign_key_violation then
    return jsonb_build_object('ok', false, 'error', 'empresa_inexistente');
end;
$$;
grant execute on function public.grant_credits(uuid, int, text, text, uuid) to authenticated;

-- ── 4. generate_disc_link: ref = assessment_id + balance_after (PAY-6) ──
create or replace function public.generate_disc_link(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company       uuid;
  v_full_name     text;
  v_cargo         text;
  v_token         text;
  v_pending       public.disc_assessments;
  v_balance       int;
  v_assessment_id uuid;
begin
  select company_id, full_name, cargo
    into v_company, v_full_name, v_cargo
    from public.profiles where id = p_profile_id;
  if v_company is null then
    return jsonb_build_object('ok', false, 'error', 'perfil_invalido');
  end if;

  if not public.auth_is_arquitecto() or public.auth_company_id() is distinct from v_company then
    return jsonb_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  select * into v_pending
    from public.disc_assessments
    where profile_id = p_profile_id and status = 'pendiente'
    order by created_at desc limit 1;

  if v_pending.id is not null then
    -- Reusar el slot pago (sin cobrar).
    update public.disc_assessments
      set token = v_token, created_by = auth.uid(), created_at = now()
      where id = v_pending.id;
  else
    -- DISC nuevo → cobrar 1 crédito de forma atómica (row lock).
    select balance into v_balance
      from public.company_credits where company_id = v_company for update;
    if coalesce(v_balance, 0) < 1 then
      return jsonb_build_object('ok', false, 'error', 'sin_creditos');
    end if;

    update public.company_credits
      set balance = balance - 1, updated_at = now()
      where company_id = v_company;

    -- Crear el assessment primero para atar el movimiento a su id (PAY-6).
    insert into public.disc_assessments (token, company_id, profile_id, full_name, cargo, created_by, status)
    values (v_token, v_company, p_profile_id, v_full_name, v_cargo, auth.uid(), 'pendiente')
    returning id into v_assessment_id;

    insert into public.credit_transactions
      (company_id, delta, type, reason, actor_id, ref, balance_after)
    values (v_company, -1, 'consume', 'disc_link', auth.uid(), v_assessment_id::text, v_balance - 1);
  end if;

  update public.profiles set
      disc_status = 'enviado',
      disc_letters = null, disc_name = null, disc_icon = null,
      disc_profile_key = null, disc_scores = null
    where id = p_profile_id;

  return jsonb_build_object('ok', true, 'token', v_token);
end;
$$;
grant execute on function public.generate_disc_link(uuid) to authenticated;
