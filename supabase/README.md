# Migraciones Supabase — orden de aplicación

Proyecto ACTIVO (desde 2026-06-14): **fozhnfxehbbgqaerprgf** (org TBM Org, cuenta
sebastian.soporte.tbm@gmail.com), reconstruido tras perder acceso al dashboard del
proyecto viejo `onzsxbghmyuqykiejpxw` (ver `../docs/RECOVERY_SUPABASE.md`). El MCP de
Supabase **sí** llega al proyecto nuevo (apply_migration/execute_sql). Correr **en orden**.

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
| 16 | `migration_sprint14_tour.sql` | **S11**: columna `tour_completed` en profiles (tour guiado) | ⏳ pendiente |
| 17 | `migration_sprint15_super_coach.sql` | **S9 [N1]**: `coach_assignments` + `auth_is_coach_of()` + policies read-only + `coaching_notes`. Las asignaciones se crean a mano (ver comentarios del archivo) | ⏳ pendiente |
| 18 | `migration_sprint17_multiplicador.sql` | **S17 [M8]**: tabla `multiplicador_diagnostics` (Diagnóstico ROI de Talento — Los 3 Pecados, total /36) + RLS por empresa | ⏳ pendiente |
| 19 | `migration_sprint18_pregame_habits.sql` | **A3.1**: `user_habits` + `habit_logs` (checklist de hábitos del Pre-game) + RLS por usuario | ✅ aplicada (2026-06-19) |
| 20 | `migration_fase2_platform_admins.sql` | **Fase 2 · A1**: `platform_admins` + `is_platform_admin()` (panel god-mode). Seedear a mano el/los user_id de admin | ✅ aplicada (2026-06-20) |
| 21 | `migration_fase2_credits.sql` | **Fase 2 · A3**: `company_credits` + `credit_transactions` (ledger) + RPC `generate_disc_link` (gating del DISC) + `grant_credits` (carga, solo platform_admin) | ✅ aplicada (2026-06-20) |
| 22 | `migration_fase2_audit_log.sql` | **Fase 2 · A2**: `audit_log` (acciones del panel god-mode: alta de líder, carga de créditos). RLS sin policy → solo service-role | ✅ aplicada (2026-06-22) |
| 23 | `migration_fase2_company_status.sql` | **Fase 2 · A2.2**: `companies.status` (active/suspended) + `suspended_at` + check. Empresa suspendida → bloqueada en el dashboard web | ✅ aplicada (2026-06-22) |
| 24 | `migration_jarvis_ai_config.sql` | **JARVIS · S18.1**: `ai_config` (proveedor/modelo/system prompt) + wrappers de Vault `ai_set_api_key`/`ai_get_api_key` (SECURITY DEFINER, solo service-role) para la API key cifrada | ✅ aplicada (2026-06-22) |
| 25 | `migration_jarvis_rag.sql` | **JARVIS · RAG R1**: `pgvector` + `knowledge_chunks` (embeddings 384) + RPC `match_knowledge` (similitud coseno, solo service-role). Embeddings vía Edge Function `embed` (gte-small). Corpus se carga con `scripts/ingest-knowledge.mjs` | ✅ aplicada (2026-06-22) |
| 26 | `migration_jarvis_persona.sql` | **DC · DC-2**: columnas de persona en `ai_config` (`persona_name`, `tone`, `welcome`, `suggested_prompts` jsonb, `features` jsonb) para personalizar DC desde el admin. Solo `ALTER ADD` idempotente; RLS sin cambios (solo service-role) | ✅ aplicada (2026-06-26) |
| 27 | `migration_email_config.sql` | **Email · F1**: tabla `email_config` (remitente/reply-to/soporte del correo de la app) + wrappers de Vault `email_set_secret`/`email_get_secret` (SECURITY DEFINER, solo service-role) para la key de Resend. RLS sin policies (solo service-role) | ✅ aplicada (2026-06-26) |
| 28 | `migration_invitations_invitee_rls.sql` | **Fix invitaciones**: policies para que el invitado **vea y acepte** su propia invitación (`invitations` por `auth.email()`). Antes solo el Arquitecto tenía policies → /accept-invite no encontraba la invitación del colaborador | ✅ aplicada (2026-06-27) |
| 29 | `migration_companies_invitee_select.sql` | **Fix /accept-invite**: policy para que el invitado lea la **empresa que lo invitó** (mostrar su nombre), scopeado por `auth.email()`. Antes solo owner/coach podían leer `companies` → 406 + nombre vacío | ✅ aplicada (2026-06-27) |
| 30 | `migration_invitations_token_accept.sql` | **Invitaciones por token propio**: policy DELETE del Arquitecto sobre las invitaciones de su empresa + índice `(company_id, status)` para el panel de pendientes. Creada junto al fix `0763fff` (2026-07-23) pero **quedó sin registrar ni aplicar** hasta ahora. El código no dependía de ella: `cancelInvite` borra con el admin client (service_role) | ✅ aplicada (2026-07-29) |
| 31 | `migration_s22_role_charter.sql` | **S22 · Rol y progresión**: (a) **blinda los campos de autoridad** de `profiles` — extiende `enforce_profile_role_company` para que `los_level`, `los_target`, `alignment`, `kpi_*` y todo el bloque `disc_*` solo los pueda cambiar el Arquitecto de la empresa (antes un colaborador los editaba desde la consola: RLS no restringe columnas); (b) tabla **`role_charters`** (ficha de rol + tope de decisión en $) con RLS = la persona **lee** la suya, solo el Arquitecto escribe | ✅ aplicada (2026-07-30) |
| 32 | `migration_s23_notification_prefs.sql` | **S23 · Despertador diario**: tabla `notification_prefs` (qué avisos recibe cada persona + hora preferida + canal) con RLS `user_id = auth.uid()` — a diferencia de `role_charters`, acá **el dueño sí escribe**: son sus preferencias, no una evaluación del líder. **Sin fila = todo activado** (no hace falta backfill). El cron degrada solo si no está aplicada: trata la ausencia como "todos reciben" | ✅ aplicada (2026-07-30) |
| 33 | `migration_s24_dc_reviews.sql` | **S24 · DC proactivo**: tabla `ai_reviews` — log de intervenciones sobre formularios. Sostiene un **rate limit propio, separado del chat** (el de DC cuenta `ai_messages` y un formulario agotaría la cuota de conversación del usuario) y permite **medir el costo** del patrón, que es su riesgo principal. NO guarda el texto del usuario, solo su hash y longitud. RLS habilitada **sin policies** = solo service-role (mismo criterio que `audit_log`). ⚠️ El endpoint es **fail-closed**: sin esta tabla no evalúa, para no gastar sin techo | ⏳ **pendiente de aplicar** |

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
