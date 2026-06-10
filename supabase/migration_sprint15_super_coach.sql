-- Sprint 15 (plan: S9) — Panel Super Coach [CHANGELOG N1]
-- Dilio (o cualquier coach) ve el estado de sus empresas alumnas asignadas.
-- Modelo de seguridad:
--   · Acceso por ASIGNACIÓN EXPLÍCITA (fila en coach_assignments) — no hay
--     rol global que vea todo.
--   · Nadie puede auto-asignarse: NO hay policy de INSERT para authenticated.
--     Las asignaciones se crean desde el SQL Editor / service role:
--       insert into coach_assignments (coach_id, company_id)
--       values ('<uuid del coach>', '<uuid de la empresa>');
--   · El coach tiene SOLO LECTURA sobre datos de negocio. Los rituales
--     personales (pre_games, cool_downs) quedan FUERA del alcance del coach.
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

-- 1. Asignaciones coach ↔ empresa
CREATE TABLE coach_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (coach_id, company_id)
);

ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

-- El coach ve sus propias asignaciones (necesario para el guard del panel)
CREATE POLICY "coach_sees_own_assignments" ON coach_assignments FOR SELECT
  USING (coach_id = auth.uid());

GRANT SELECT ON coach_assignments TO authenticated;

-- 2. Helper SECURITY DEFINER (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.auth_is_coach_of(target_company uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM coach_assignments
    WHERE coach_id = auth.uid() AND company_id = target_company
  );
$$;

-- 3. Policies de SOLO LECTURA para el coach sobre datos de negocio
CREATE POLICY "coach_select" ON companies FOR SELECT
  USING (public.auth_is_coach_of(id));

CREATE POLICY "coach_select" ON profiles FOR SELECT
  USING (public.auth_is_coach_of(company_id));

CREATE POLICY "coach_select" ON scorecards FOR SELECT
  USING (public.auth_is_coach_of(company_id));

CREATE POLICY "coach_select" ON war_ups FOR SELECT
  USING (public.auth_is_coach_of(company_id));

CREATE POLICY "coach_select" ON rocks FOR SELECT
  USING (public.auth_is_coach_of(company_id));

CREATE POLICY "coach_select" ON leading_indicators FOR SELECT
  USING (public.auth_is_coach_of(company_id));

-- 4. Canal de notas de coaching (capa 3)
CREATE TABLE coaching_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  coach_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE coaching_notes ENABLE ROW LEVEL SECURITY;

-- El coach escribe y lee notas de SUS empresas asignadas
CREATE POLICY "coach_insert" ON coaching_notes FOR INSERT
  WITH CHECK (coach_id = auth.uid() AND public.auth_is_coach_of(company_id));

CREATE POLICY "coach_select" ON coaching_notes FOR SELECT
  USING (public.auth_is_coach_of(company_id));

-- Los miembros de la empresa leen las notas que les dejaron
CREATE POLICY "company_select" ON coaching_notes FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

GRANT SELECT, INSERT ON coaching_notes TO authenticated;

CREATE INDEX idx_coaching_notes_company ON coaching_notes(company_id, created_at DESC);
CREATE INDEX idx_coach_assignments_coach ON coach_assignments(coach_id);
