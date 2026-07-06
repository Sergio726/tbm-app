# Pendientes de revisión (decisiones de producto a confirmar)

> Cosas que **funcionan** pero que Sebas quiere **revisar/decidir** antes de darlas por buenas.
> No son bugs: son decisiones de diseño/visibilidad. Cada ítem dice cómo está hoy y las opciones.

---

## 1. Visibilidad de los KPIs (módulo `/dashboard/kpis`) — ✅ DECIDIDO (2026-07-05)

**Decisión: (b) KPIs por colaborador**, con un matiz sobre la creación: cada colaborador
puede **autocrear y ver solo sus propios KPIs**; el Arquitecto sigue viendo y creando los
de toda la empresa (rol de supervisión). El tope de **5 KPIs/semana pasa a ser por
persona**, no por empresa.

**Implementado** (migración `kpis_por_colaborador`, aplicada 2026-07-05):
- RLS `SELECT`: `owner_id = auth.uid() OR (arquitecto AND company_id = propia)`.
- RLS `INSERT`: `company_id = propia AND (owner_id = auth.uid() OR arquitecto)` — antes
  solo el Arquitecto podía crear KPIs; ahora cada colaborador también autocrea los suyos.
- RLS `UPDATE`: sin cambios funcionales (dueño o arquitecto).
- UI (`apps/web/.../dashboard/kpis/page.tsx`): el tope "máx 5" y el botón "Nuevo KPI" ahora
  se calculan sobre **los KPIs propios** (`myKpis`), no sobre el total visible. El Arquitecto
  ve, junto a cada card, de quién es ("Tuyo" / nombre del colaborador) ya que su vista incluye
  los de todo el equipo.

<details>
<summary>Contexto original de la revisión (2026-06-27)</summary>

**Hoy (antes del cambio):** los **KPIs eran de la empresa y los veía TODO el equipo**
(colaboradores incluidos). Era el diseño del método TBM (tablero compartido del equipo ·
Ley de Pearson: "lo que se mide se gestiona"). Sebas detectó que el colaborador veía los
KPIs que cargaba el Arquitecto y lo quiso revisar.

**Cómo estaba armado (técnico):**
- Tabla `kpis`: `company_id`, `owner_id`, `name`, `type` (leading/lagging), `unit`,
  `weekly_target`, `current_value`, `week_date` (lunes), `is_active`. Semanal, máx 5.
- RLS: crear = solo Arquitecto · ver = todos los miembros (`company_id = auth_company_id()`)
  · actualizar valor = dueño (`owner_id = auth.uid()`) o Arquitecto.

**Opciones evaluadas:**
- (a) Dejar como está → tablero compartido del equipo (diseño del método original).
- (b) KPIs por colaborador (cada uno ve/carga solo los suyos) → **elegida**.
- (c) Solo el Arquitecto los ve (tablero privado del líder).

</details>
