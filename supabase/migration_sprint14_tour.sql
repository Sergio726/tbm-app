-- Sprint 14 (plan: S11) — Tour guiado de onboarding
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

-- El tour es por usuario (no por empresa): arquitecto y colaborador
-- ven pasos distintos y cada uno lo completa por su cuenta.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tour_completed boolean DEFAULT false;
