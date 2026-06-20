-- Fase 2 · A3 — Motor de créditos + gating del DISC
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Modelo: 1 crédito = 1 DISC. El crédito se descuenta al GENERAR el link de test
-- (atómico, vía RPC). Reusar un pendiente no recobra; re-test tras completar = otro
-- crédito. Regalo de beta = grant_credits (solo platform_admin).

-- ── Saldo por empresa ────────────────────────────────────────
create table if not exists public.company_credits (
  company_id uuid primary key references public.companies(id) on delete cascade,
  balance    int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

alter table public.company_credits enable row level security;
-- Los miembros de la empresa pueden VER su saldo (para el indicador). Nadie escribe
-- desde el cliente: el balance solo se mueve por las RPC SECURITY DEFINER.
create policy "ve_saldo_de_su_empresa" on public.company_credits
  for select using (company_id = public.auth_company_id());

-- ── Ledger append-only ───────────────────────────────────────
create table if not exists public.credit_transactions (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  delta      int not null,                 -- +grant / -consume / ±adjust
  type       text not null,                -- grant | consume | adjust | promo | expire | purchase
  reason     text,
  actor_id   uuid references auth.users(id) on delete set null,
  ref        text,                         -- ej. profile_id del DISC consumido
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_tx_company on public.credit_transactions(company_id, created_at desc);

alter table public.credit_transactions enable row level security;
-- El arquitecto de la empresa puede ver su propio historial (lectura). Sin writes de cliente.
create policy "ve_ledger_de_su_empresa" on public.credit_transactions
  for select using (company_id = public.auth_company_id());

-- ── RPC: cargar créditos (regalo beta / ajuste) — solo platform_admin ──
create or replace function public.grant_credits(
  p_company_id uuid,
  p_amount     int,
  p_reason     text default null,
  p_type       text default 'grant'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance int;
begin
  if not public.is_platform_admin() then
    return jsonb_build_object('ok', false, 'error', 'no_autorizado');
  end if;
  if p_amount is null or p_amount = 0 then
    return jsonb_build_object('ok', false, 'error', 'monto_invalido');
  end if;

  insert into public.company_credits (company_id, balance, updated_at)
  values (p_company_id, greatest(0, p_amount), now())
  on conflict (company_id) do update
    set balance = greatest(0, public.company_credits.balance + p_amount),
        updated_at = now()
  returning balance into v_balance;

  insert into public.credit_transactions (company_id, delta, type, reason, actor_id)
  values (p_company_id, p_amount, coalesce(p_type, 'grant'), p_reason, auth.uid());

  return jsonb_build_object('ok', true, 'balance', v_balance);
end;
$$;
grant execute on function public.grant_credits(uuid, int, text, text) to authenticated;

-- ── RPC: generar link DISC con gating de crédito (reemplaza el INSERT client-side) ──
create or replace function public.generate_disc_link(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company   uuid;
  v_full_name text;
  v_cargo     text;
  v_token     text;
  v_pending   public.disc_assessments;
  v_balance   int;
begin
  -- 1. La persona objetivo + su empresa.
  select company_id, full_name, cargo
    into v_company, v_full_name, v_cargo
    from public.profiles where id = p_profile_id;
  if v_company is null then
    return jsonb_build_object('ok', false, 'error', 'perfil_invalido');
  end if;

  -- 2. El caller debe ser arquitecto de ESA empresa.
  if not public.auth_is_arquitecto() or public.auth_company_id() is distinct from v_company then
    return jsonb_build_object('ok', false, 'error', 'no_autorizado');
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  -- 3. ¿Ya hay un pendiente para este perfil? → reusar el slot pago (sin cobrar).
  select * into v_pending
    from public.disc_assessments
    where profile_id = p_profile_id and status = 'pendiente'
    order by created_at desc limit 1;

  if v_pending.id is not null then
    update public.disc_assessments
      set token = v_token, created_by = auth.uid(), created_at = now()
      where id = v_pending.id;
  else
    -- 4. DISC nuevo → cobrar 1 crédito de forma atómica (row lock).
    select balance into v_balance
      from public.company_credits where company_id = v_company for update;

    if coalesce(v_balance, 0) < 1 then
      return jsonb_build_object('ok', false, 'error', 'sin_creditos');
    end if;

    update public.company_credits
      set balance = balance - 1, updated_at = now()
      where company_id = v_company;

    insert into public.credit_transactions (company_id, delta, type, reason, actor_id, ref)
    values (v_company, -1, 'consume', 'disc_link', auth.uid(), p_profile_id::text);

    insert into public.disc_assessments (token, company_id, profile_id, full_name, cargo, created_by, status)
    values (v_token, v_company, p_profile_id, v_full_name, v_cargo, auth.uid(), 'pendiente');
  end if;

  -- 5. Reset del perfil (mismo efecto que el flujo viejo).
  update public.profiles set
      disc_status = 'enviado',
      disc_letters = null, disc_name = null, disc_icon = null,
      disc_profile_key = null, disc_scores = null
    where id = p_profile_id;

  return jsonb_build_object('ok', true, 'token', v_token);
end;
$$;
grant execute on function public.generate_disc_link(uuid) to authenticated;
