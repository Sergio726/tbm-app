-- ============================================================
-- FIX: Infinite recursion in RLS policies
-- Las políticas que hacen SELECT FROM profiles dentro de
-- policies de profiles causan recursión infinita.
-- Solución: funciones SECURITY DEFINER que bypasean RLS.
-- ============================================================

-- 1. Función helper: obtener company_id del usuario actual
CREATE OR REPLACE FUNCTION public.auth_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Función helper: verificar si el usuario actual es arquitecto
CREATE OR REPLACE FUNCTION public.auth_is_arquitecto()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'arquitecto'
  )
$$;

-- 3. Corregir policies de PROFILES (causa directa de la recursión)
DROP POLICY IF EXISTS "Arquitecto ve todos los perfiles de su empresa" ON public.profiles;
CREATE POLICY "Arquitecto ve todos los perfiles de su empresa"
  ON public.profiles FOR SELECT
  USING (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

DROP POLICY IF EXISTS "Arquitecto puede editar perfiles de su empresa" ON public.profiles;
CREATE POLICY "Arquitecto puede editar perfiles de su empresa"
  ON public.profiles FOR UPDATE
  USING (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

-- 4. Corregir policies de ENERGY_LOGS
DROP POLICY IF EXISTS "Arquitecto ve energía de su empresa" ON public.energy_logs;
CREATE POLICY "Arquitecto ve energía de su empresa"
  ON public.energy_logs FOR SELECT
  USING (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

-- 5. Corregir policies de INVITATIONS
DROP POLICY IF EXISTS "Arquitecto puede invitar" ON public.invitations;
CREATE POLICY "Arquitecto puede invitar"
  ON public.invitations FOR INSERT
  WITH CHECK (auth.uid() = invited_by AND public.auth_is_arquitecto() AND company_id = public.auth_company_id());

DROP POLICY IF EXISTS "Arquitecto ve las invitaciones de su empresa" ON public.invitations;
CREATE POLICY "Arquitecto ve las invitaciones de su empresa"
  ON public.invitations FOR SELECT
  USING (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

DROP POLICY IF EXISTS "Arquitecto puede actualizar invitaciones" ON public.invitations;
CREATE POLICY "Arquitecto puede actualizar invitaciones"
  ON public.invitations FOR UPDATE
  USING (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

-- 6. Corregir policies de KPIS
DROP POLICY IF EXISTS "Arquitecto puede crear y editar KPIs" ON public.kpis;
CREATE POLICY "Arquitecto puede crear y editar KPIs"
  ON public.kpis FOR INSERT
  WITH CHECK (public.auth_is_arquitecto() AND company_id = public.auth_company_id());

DROP POLICY IF EXISTS "Miembros de empresa ven los KPIs" ON public.kpis;
CREATE POLICY "Miembros de empresa ven los KPIs"
  ON public.kpis FOR SELECT
  USING (company_id = public.auth_company_id());

DROP POLICY IF EXISTS "Dueño del KPI puede actualizar su valor" ON public.kpis;
CREATE POLICY "Dueño del KPI puede actualizar su valor"
  ON public.kpis FOR UPDATE
  USING (auth.uid() = owner_id OR (public.auth_is_arquitecto() AND company_id = public.auth_company_id()));

-- 7. Corregir policies de SCORECARDS
DROP POLICY IF EXISTS "Arquitecto ve scorecards de su empresa" ON public.scorecards;
CREATE POLICY "Arquitecto ve scorecards de su empresa"
  ON public.scorecards FOR SELECT
  USING (company_id = public.auth_company_id());
