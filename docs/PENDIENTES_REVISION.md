# Pendientes de revisión (decisiones de producto a confirmar)

> Cosas que **funcionan** pero que Sebas quiere **revisar/decidir** antes de darlas por buenas.
> No son bugs: son decisiones de diseño/visibilidad. Cada ítem dice cómo está hoy y las opciones.

---

## 1. Visibilidad de los KPIs (módulo `/dashboard/kpis`) — 🔍 EN REVISIÓN (2026-06-27)

**Hoy:** los **KPIs son de la empresa y los ve TODO el equipo** (colaboradores incluidos). Es el
diseño del método TBM (tablero compartido del equipo · Ley de Pearson: "lo que se mide se gestiona").
Sebas detectó que el colaborador ve los KPIs que carga el Arquitecto y lo quiere revisar.

**Cómo está armado (técnico):**
- Tabla `kpis`: `company_id`, `owner_id`, `name`, `type` (leading/lagging), `unit`, `weekly_target`,
  `current_value`, `week_date` (lunes), `is_active`. Semanal, **máx 5 por semana**.
- RLS: **crear** = solo Arquitecto · **ver** = todos los miembros (`company_id = auth_company_id()`)
  · **actualizar valor** = dueño (`owner_id = auth.uid()`) o Arquitecto.
- UI: `apps/web/src/app/(dashboard)/dashboard/kpis/page.tsx`. Semáforo 🟢≥100% 🟡≥85% 🔴<85%.

**Opciones si se decide cambiar:**
- **(a)** Dejar como está → tablero compartido del equipo (diseño del método). *Sin cambios.*
- **(b)** KPIs por colaborador (cada uno ve/carga solo los suyos) → filtrar por `owner_id` + ajustar
  la RLS de SELECT.
- **(c)** Solo el Arquitecto los ve (tablero privado del líder) → RLS SELECT restringida a arquitecto.

**Pendiente:** Sebas confirma cuál. Hasta entonces, no se toca.
