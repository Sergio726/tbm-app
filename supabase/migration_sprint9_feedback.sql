-- Sprint 9 (app: Sprint 5) — Feedback S.E.C.
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

CREATE TABLE feedbacks (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id          uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  from_user           uuid REFERENCES profiles(id) NOT NULL,
  to_user             uuid REFERENCES profiles(id) NOT NULL,
  type                text NOT NULL CHECK (type IN ('S', 'E', 'C')),
  content             text NOT NULL,
  disc_profile_target text,
  is_draft            boolean DEFAULT true,
  delivered_at        timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_isolation" ON feedbacks
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON feedbacks TO authenticated;
