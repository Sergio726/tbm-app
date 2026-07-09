-- ============================================================
-- FASE 2D — Integridad: privacidad del ledger + uniques de negocio
--   (auditoria.md PAY-9 / DB-19)
--
--   · PAY-9: el ledger de créditos deja de ser legible por cualquier miembro;
--     solo el arquitecto de la empresa lo ve (montos, motivos, ritmo de compra
--     = info comercial sensible una vez que haya `purchase` real).
--   · DB-19: uniques de negocio que faltaban. Van con guard defensivo: si hay
--     datos que ya los violan, NO aborta la migración — avisa por NOTICE para
--     limpiar y reintentar.
--
--   NOTA — pendientes de este bloque que NO están acá (requieren más contexto):
--     · DB-13 (colaboradores ven a sus compañeros): chocaría con la privacidad
--       del DISC (B1: el perfil de rango solo lo ve el líder). RLS filtra filas,
--       no columnas → necesita una VISTA con columnas no sensibles + refactor
--       del código que hoy lee `profiles` directo. Decisión de producto.
--     · DB-16 (CHECKs de dominio en role/status/type): hay que confirmar el
--       set exacto de valores válidos con la app corriendo para no romper
--       inserts/updates legítimos.
--
--   Idempotente. Aplicar en el SQL Editor.
-- ============================================================

-- ── PAY-9: ledger solo para el arquitecto ────────────────────
drop policy if exists "ve_ledger_de_su_empresa" on public.credit_transactions;
create policy "ve_ledger_de_su_empresa" on public.credit_transactions
  for select using (
    company_id = (select public.auth_company_id())
    and (select public.auth_is_arquitecto())
  );

-- ── DB-19: uniques de negocio (defensivos) ───────────────────

-- Un solo diagnóstico "Día 1" (baseline) por empresa.
do $$
begin
  begin
    create unique index if not exists uq_scorecards_baseline
      on public.scorecards(company_id) where is_baseline;
  exception when others then
    raise notice 'uq_scorecards_baseline: hay >1 baseline por empresa, limpiar. %', sqlerrm;
  end;
end $$;

-- Una métrica (name) por empresa y semana — evita KPIs duplicados.
do $$
begin
  begin
    create unique index if not exists uq_kpis_company_name_week
      on public.kpis(company_id, name, week_date);
  exception when others then
    raise notice 'uq_kpis_company_name_week: hay duplicados, limpiar. %', sqlerrm;
  end;
end $$;

-- Ídem para los Leading Indicators del BOS.
do $$
begin
  begin
    create unique index if not exists uq_leading_ind_company_name_week
      on public.leading_indicators(company_id, name, week_date);
  exception when others then
    raise notice 'uq_leading_ind_company_name_week: hay duplicados, limpiar. %', sqlerrm;
  end;
end $$;
