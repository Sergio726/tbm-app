-- Sprint 13 (plan: S14) — Sistema de notificaciones in-app
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        varchar(40) NOT NULL,
  -- task_blocked | task_overdue | task_done | task_assigned
  -- war_up_started | scorecard_updated
  title       text NOT NULL,
  body        text,
  href        text,                -- a dónde navegar al hacer click
  read_at     timestamptz,         -- null = no leída
  created_at  timestamptz DEFAULT now()
);

-- Índice parcial para el badge (no leídas por usuario)
CREATE INDEX notifications_user_unread
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve y administra SOLO sus notificaciones
CREATE POLICY "own_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "own_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Cualquier miembro de la empresa puede generar una notificación para otro
-- miembro de la MISMA empresa (los eventos los dispara quien ejecuta la acción:
-- el colaborador que escala genera la notificación del arquitecto, etc.)
CREATE POLICY "company_insert" ON notifications FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles target
      WHERE target.id = notifications.user_id
        AND target.company_id = notifications.company_id
    )
  );

GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
