-- KPIs por colaborador (decisión Sebas, ver docs/PENDIENTES_REVISION.md §1)
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Antes: los KPIs eran un tablero compartido (todo el equipo veía todos los KPIs de
-- la empresa; solo el Arquitecto podía crearlos). Decisión: cada colaborador ve/carga
-- SOLO sus propios KPIs; el Arquitecto sigue viendo y creando los de toda la empresa.

-- SELECT: dueño ve los suyos; Arquitecto ve todos los de su empresa.
drop policy if exists "Miembros de empresa ven los KPIs" on public.kpis;
create policy "Ver KPIs propios o todos si arquitecto"
  on public.kpis for select
  using (
    owner_id = auth.uid()
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );

-- INSERT: cada colaborador puede autocrear los suyos (owner_id = sí mismo);
-- el Arquitecto puede crear para cualquiera de su empresa.
drop policy if exists "Arquitecto puede crear y editar KPIs" on public.kpis;
create policy "Crear KPI propio o como arquitecto"
  on public.kpis for insert
  with check (
    company_id = public.auth_company_id()
    and (owner_id = auth.uid() or public.auth_is_arquitecto())
  );

-- UPDATE: sin cambios (dueño o arquitecto ya podían actualizar el valor) —
-- se re-declara igual por completitud/documentación del cambio.
drop policy if exists "Dueño del KPI puede actualizar su valor" on public.kpis;
create policy "Dueño del KPI puede actualizar su valor"
  on public.kpis for update
  using (
    auth.uid() = owner_id
    or (public.auth_is_arquitecto() and company_id = public.auth_company_id())
  );
