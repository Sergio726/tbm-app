-- Sprint 12 (plan: cierre de S6) — Activos del Sistema [CHANGELOG B3]
-- Repositorio de procesos documentados: cada proceso crítico del negocio
-- queda escrito/grabado para que la empresa opere sin el Arquitecto.
-- Ejecutar manualmente en: https://supabase.com/dashboard/project/onzsxbghmyuqykiejpxw/sql/new

CREATE TABLE process_assets (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id   uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_by   uuid REFERENCES profiles(id) NOT NULL,
  owner_id     uuid REFERENCES profiles(id),          -- responsable de mantenerlo al día

  title        text NOT NULL,
  description  text,
  category     text NOT NULL DEFAULT 'operaciones',   -- operaciones | ventas | finanzas | rrhh | tecnologia | otro
  video_url    text,                                  -- Loom / YouTube del proceso grabado
  doc_url      text,                                  -- Notion / Drive / SOP escrito

  status       text NOT NULL DEFAULT 'activo',        -- borrador | activo | desactualizado
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE process_assets ENABLE ROW LEVEL SECURITY;

-- Todos los miembros de la empresa ven y crean activos (documentar es del equipo)
CREATE POLICY "members_select" ON process_assets FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "members_insert" ON process_assets FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

-- Edita el autor, el dueño asignado o el arquitecto
CREATE POLICY "author_owner_or_architect_update" ON process_assets FOR UPDATE
  USING (
    created_by = auth.uid()
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = process_assets.company_id
        AND p.role = 'arquitecto'
    )
  );

-- Borra solo el arquitecto
CREATE POLICY "architect_delete" ON process_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = process_assets.company_id
        AND p.role = 'arquitecto'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON process_assets TO authenticated;

CREATE TRIGGER process_assets_updated_at
  BEFORE UPDATE ON process_assets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX idx_process_assets_company ON process_assets(company_id);
CREATE INDEX idx_process_assets_status  ON process_assets(status);
