-- ============================================================
-- FASE 2A — Índices de performance (auditoria.md DB-9)
--   El lote Sprint 9-11 se creó sin un solo índice, y varias FKs quedaron
--   sin índice. A escala (cientos de empresas × años de filas) cada render
--   de Plan 90D/BOS/feedback es un seq scan, y los ON DELETE CASCADE desde
--   companies escanean estas tablas enteras.
--
--   Aditivo y seguro: solo CREATE INDEX IF NOT EXISTS. No toca datos ni RLS.
--   Nota: en tablas ya grandes conviene CREATE INDEX CONCURRENTLY (no cabe en
--   un DO block / transacción); acá son chicas (beta) → índice normal.
-- ============================================================

-- Plan 90D (migration_sprint10_plan90d.sql se creó sin índices)
create index if not exists idx_rocks_company              on public.rocks(company_id);
create index if not exists idx_rock_updates_rock           on public.rock_updates(rock_id);
create index if not exists idx_idea_parking_company        on public.idea_parking(company_id);
create index if not exists idx_decisions_company           on public.decisions(company_id);
create index if not exists idx_leading_indicators_company  on public.leading_indicators(company_id);

-- Foreign keys sin índice (predicado de queries + destino de CASCADE)
create index if not exists idx_ai_conversations_company    on public.ai_conversations(company_id);
create index if not exists idx_coaching_notes_coach        on public.coaching_notes(coach_id);
create index if not exists idx_credit_requests_requested_by on public.credit_requests(requested_by);
create index if not exists idx_user_habits_company         on public.user_habits(company_id);
create index if not exists idx_kpis_owner                  on public.kpis(owner_id);
create index if not exists idx_invitations_invited_by      on public.invitations(invited_by);

-- Tablas cuyo esquema exacto no verifiqué en esta sesión: creamos el índice
-- solo si la columna existe (defensivo ante el drift de T4).
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'notifications'
               and column_name = 'company_id') then
    create index if not exists idx_notifications_company on public.notifications(company_id);
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'pre_games'
               and column_name = 'company_id') then
    create index if not exists idx_pre_games_company on public.pre_games(company_id);
  end if;
end $$;
