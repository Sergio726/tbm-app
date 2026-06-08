-- Sprint 11 (app: Sprint 7) — Workbooks Dinámicos S1–S4
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

-- 1. Respuestas de ejercicios
CREATE TABLE workbook_responses (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id     uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id        uuid REFERENCES profiles(id) NOT NULL,
  session_number smallint NOT NULL,              -- 1-4
  exercise_key   varchar(50) NOT NULL,           -- ej: "s1_diagnostico"
  response       jsonb NOT NULL DEFAULT '{}',
  completed_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, session_number, exercise_key)
);
ALTER TABLE workbook_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON workbook_responses
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON workbook_responses TO authenticated;

-- 2. Progreso por sesión
CREATE TABLE workbook_progress (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id       uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id          uuid REFERENCES profiles(id) NOT NULL,
  session_number   smallint NOT NULL,
  pct_complete     smallint DEFAULT 0,
  weekly_commitment text,
  commitment_done  boolean DEFAULT false,
  unlocked_at      timestamptz DEFAULT now(),   -- cuándo se desbloqueó esta sesión
  UNIQUE(user_id, session_number)
);
ALTER TABLE workbook_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON workbook_progress
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON workbook_progress TO authenticated;
