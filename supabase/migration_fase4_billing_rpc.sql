-- ============================================================
-- FASE 4 — RPC de acreditación de compras (webhook de Stripe)
--   Depende de: migration_fase4_billing_schema.sql + migration_fase2c_ledger.sql
--
--   grant_credits (admin) está gateado por is_platform_admin(), que el webhook
--   —service-role, sin auth.uid()— no cumple. Esta RPC acredita una compra de
--   forma ATÓMICA e IDEMPOTENTE y solo la puede ejecutar el service-role.
--
--   Idempotencia en dos capas:
--     · webhook_events.id (PK) corta el reproceso del MISMO evento de Stripe.
--     · purchases.status = 'paid' corta la doble acreditación del mismo purchase.
--
--   Idempotente. Aplicar en el SQL Editor.
-- ============================================================

create or replace function public.apply_purchase_credits(
  p_purchase_id uuid,
  p_event_id    text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_purchase public.purchases;
  v_current  int;
  v_balance  int;
  v_tx_id    uuid;
begin
  select * into v_purchase from public.purchases where id = p_purchase_id for update;
  if v_purchase.id is null then
    return jsonb_build_object('ok', false, 'error', 'purchase_inexistente');
  end if;

  -- Ya acreditado → no-op idempotente.
  if v_purchase.status = 'paid' then
    return jsonb_build_object('ok', true, 'idempotent', true);
  end if;
  if coalesce(v_purchase.credits, 0) <= 0 then
    return jsonb_build_object('ok', false, 'error', 'sin_creditos');
  end if;

  -- Acreditar de forma atómica (lock del saldo).
  insert into public.company_credits (company_id, balance, updated_at)
  values (v_purchase.company_id, 0, now())
  on conflict (company_id) do nothing;

  select balance into v_current
    from public.company_credits where company_id = v_purchase.company_id for update;
  v_current := coalesce(v_current, 0);
  v_balance := v_current + v_purchase.credits;

  update public.company_credits
    set balance = v_balance, updated_at = now()
    where company_id = v_purchase.company_id;

  insert into public.credit_transactions
    (company_id, delta, type, reason, balance_after, product)
  values (v_purchase.company_id, v_purchase.credits, 'purchase',
          'stripe:' || p_event_id, v_balance, 'disc')
  returning id into v_tx_id;

  update public.purchases
    set status = 'paid', credit_tx_id = v_tx_id, updated_at = now()
    where id = p_purchase_id;

  return jsonb_build_object('ok', true, 'balance', v_balance, 'credit_tx_id', v_tx_id);
end;
$$;

-- Solo el service-role (el handler del webhook). Nunca el cliente.
revoke all on function public.apply_purchase_credits(uuid, text) from public, anon, authenticated;
