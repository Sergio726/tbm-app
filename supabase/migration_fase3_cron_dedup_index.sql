-- ============================================================
-- FASE 3 — Índice para la dedup de notificaciones del cron (auditoria.md CRON-6)
--
--   El cron diario deduplica las alertas de 72h con:
--     select count(*) from notifications
--      where type = 'task_overdue' and href = $1 and created_at >= $cutoff
--   Los únicos índices de notifications son (user_id, read_at) y
--   (user_id, created_at) → esa query degenera en seq scan sobre una tabla que
--   solo crece. Este índice la soporta.
--
--   Aditivo y seguro. Defensivo ante el drift de T4 (solo si las columnas
--   existen).
-- ============================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'notifications' and column_name = 'href'
  ) and exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'notifications' and column_name = 'type'
  ) then
    create index if not exists idx_notifications_dedup
      on public.notifications(type, href, created_at);
  end if;
end $$;
