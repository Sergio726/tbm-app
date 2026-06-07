-- Sprint 10 (app: Sprint 6) — Plan 90D + BOS Dashboard
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

-- 1. Rocas trimestrales
CREATE TABLE rocks (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id       uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  title            text NOT NULL,
  owner_id         uuid REFERENCES profiles(id),
  success_criteria text,
  start_date       date NOT NULL DEFAULT CURRENT_DATE,
  end_date         date NOT NULL,
  progress         smallint DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status           text DEFAULT 'active' CHECK (status IN ('active','completed','failed','archived')),
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE rocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON rocks
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON rocks TO authenticated;

-- 2. Updates / check-ins de Rocas
CREATE TABLE rock_updates (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rock_id     uuid REFERENCES rocks(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES profiles(id) NOT NULL,
  note        text,
  progress_at smallint CHECK (progress_at BETWEEN 0 AND 100),
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE rock_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON rock_updates
  USING (rock_id IN (
    SELECT id FROM rocks WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));
GRANT SELECT, INSERT ON rock_updates TO authenticated;

-- 3. Parqueadero de Ideas
CREATE TABLE idea_parking (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  proposed_by uuid REFERENCES profiles(id),
  idea        text NOT NULL,
  rationale   text,
  parked_at   timestamptz DEFAULT now(),
  review_at   timestamptz NOT NULL,
  status      text DEFAULT 'parked' CHECK (status IN ('parked','promoted','discarded'))
);
ALTER TABLE idea_parking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON idea_parking
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON idea_parking TO authenticated;

-- 4. Decisiones (Filtro 70% + Disagree & Commit)
CREATE TABLE decisions (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id          uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id             uuid REFERENCES profiles(id) NOT NULL,
  decision_text       text NOT NULL,
  info_available      smallint CHECK (info_available BETWEEN 0 AND 100),
  applied_70_rule     boolean DEFAULT false,
  disagree_and_commit boolean DEFAULT false,
  disagree_with       text,
  outcome             text,
  created_at          timestamptz DEFAULT now()
);
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON decisions
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON decisions TO authenticated;

-- 5. Leading Indicators (BOS Dashboard)
CREATE TABLE leading_indicators (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id    uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  owner_id      uuid REFERENCES profiles(id),
  weekly_target decimal NOT NULL DEFAULT 0,
  current_value decimal,
  week_date     date NOT NULL,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE leading_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_isolation" ON leading_indicators
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
GRANT SELECT, INSERT, UPDATE ON leading_indicators TO authenticated;
