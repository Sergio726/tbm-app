# Migraciones Supabase — orden de aplicación

Proyecto: **onzsxbghmyuqykiejpxw** (org TBM Corp). Se aplican en el **SQL Editor**
del dashboard (el MCP/CLI no llega a este proyecto). Correr **en orden**.

> Cada archivo es idempotente donde se puede (`if not exists`, `create or replace`,
> `on conflict do nothing`). Si ya aplicaste alguno, re-correrlo no debería romper.

## Orden

| # | Archivo | Qué hace | Estado típico |
|---|---------|----------|---------------|
| 1 | `schema.sql` | Esquema base: companies, profiles, scorecards, kpis, rituales, RLS inicial | Base (ya aplicado) |
| 2 | `migration_sprint1.sql` | Sprint 1 | ya aplicado |
| 3 | `migration_sprint2.sql` | Sprint 2 (rituales) | ya aplicado |
| 4 | `fix_rls_recursion.sql` | Helpers `auth_company_id()` / `auth_is_arquitecto()` + fix de RLS recursiva | ya aplicado |
| 5 | `migration_sprint3_disc.sql` | Módulo DISC: tabla `disc_assessments`, RLS, RPCs `submit_disc`/`get_disc_assessment`, bucket `disc-reports`, columnas DISC en profiles | aplicado |
| 6 | `migration_sprint4_disc_ux.sql` | DISC UX: columna `ai_narrative`, `submit_disc` con `p_narrative`, realtime en `disc_assessments` | aplicado |
| 7 | `migration_sprint5_roles.sql` | **Fix de roles**: default `colaborador`, `handle_new_user` explícito, fix de datos por `owner_id` | ⏳ pendiente |
| 8 | `migration_sprint6_account.sql` | **Mi cuenta**: columnas `phone/timezone/bio` + bucket `avatars` con policies | aplicado |
| 9 | `migration_sprint7_equipo.sql` | **Cierre S3**: tabla `authority_matrix` (Matriz de Autoridad) + RLS | ⏳ pendiente |
| 10 | `migration_sprint8_delegacion.sql` | **S4 Delegación**: tablas `tasks` + `task_updates` + RLS | aplicado (módulo en uso) |
| 11 | `migration_sprint9_feedback.sql` | **S5 Feedback**: tabla `feedbacks` + RLS | aplicado (módulo en uso) |
| 12 | `migration_sprint10_plan90d.sql` | **S6 Plan 90D**: `rocks`, `rock_updates`, `idea_parking`, `decisions`, `leading_indicators` | aplicado (módulo en uso) |
| 13 | `migration_sprint11_workbooks.sql` | **S7 Workbooks**: `workbook_responses` + `workbook_progress` | aplicado (módulo en uso) |
| 14 | `migration_sprint12_activos.sql` | **Cierre S6 [B3]**: tabla `process_assets` (Activos del Sistema) + RLS | ⏳ pendiente |
| 15 | `migration_sprint13_notifications.sql` | **S14**: tabla `notifications` + índice parcial no-leídas + RLS | ⏳ pendiente |

## Limpieza puntual (no es migración de esquema)

- `fix_perfil_corrupto.sql` — corrige el perfil renombrado/DISC cruzado por el bug
  viejo de `accept-invite`. Correr **después** del sprint 5. Filtra por email; hay
  que poner el email real (ver comentarios del archivo).

## Después de aplicar

- Si cambian columnas/funciones, conviene regenerar/actualizar `src/types/database.ts`
  (en este proyecto se edita a mano porque el MCP no llega).
- Revisar **Advisors → Security** en el dashboard tras cambios de RLS/funciones.

## Notas de entorno (no es SQL, pero relacionado)

- Para que los magic links de invitación funcionen en cualquier dominio:
  **Authentication → URL Configuration** → Site URL = dominio de prod, y en
  Redirect URLs agregar `https://<dominio>/**`, `https://*.vercel.app/**`,
  `http://localhost:3000/**`.
- Vars en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  (obligatorias; sin ellas el middleware tira 500). `NEXT_PUBLIC_APP_URL` ya no se usa.
