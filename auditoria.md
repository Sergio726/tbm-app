# Auditoría de estructura y escalabilidad — TBM App

> **Objetivo:** dejar las bases sólidas para escalar el producto (multi-empresa · multi-usuario · pasarela de pagos · cron de emails · asistente de IA).
> **Fecha:** 2026-07-13 · **Alcance:** monorepo `tbm-app` completo (`apps/web`, `apps/admin`, `packages/shared`, `supabase/`).
> **Método:** 6 auditorías paralelas (BD/multi-tenancy, seguridad/auth, asistente IA, cron/emails, créditos/pagos, monorepo/frontend). Cada hallazgo fue verificado leyendo el código real; se cita `archivo:línea`. Lo no verificable desde el repo (estado vivo de la BD, envs de Vercel) está marcado como **a verificar**.

---

## Cómo leer este informe

- Los hallazgos que aparecieron en **más de una** auditoría se consolidan en **§1 Hallazgos transversales** (son los más importantes: la misma raíz golpea varias áreas).
- El resto va agrupado por área (§2–§7), con ID estable (`DB-x`, `SEC-x`, `IA-x`, `CRON-x`, `PAY-x`, `ARCH-x`) para poder ticketizarlos.
- **§8** es el plan de remediación por fases (qué hacer primero y por qué).
- **§9** es lo que ya está bien hecho — para no romperlo en el camino.
- **§10** es el diseño concreto recomendado antes de conectar la pasarela de pagos.

### Conteo por severidad

| Severidad | Cantidad | Qué significa |
|-----------|:---:|---|
| 🔴 CRÍTICO | 8 | Rompe aislamiento multi-tenant, permite robo de cuenta, pérdida de plata o de datos. Bloqueante para escalar/cobrar. |
| 🟠 ALTO | 18 | Falla a escala o abre un hueco explotable con impacto acotado. Resolver antes de sumar pilotos. |
| 🟡 MEDIO | 24 | Deuda estructural que encarece cada feature nuevo o degrada la operación. |
| ⚪ BAJO | 15 | Higiene, consistencia, robustez fina. |

**Veredicto general:** el producto tiene **buenos patrones de base** (ledger de créditos append-only, Vault para secretos, helpers RLS `SECURITY DEFINER`, rate-limit en BD, RSC en el dashboard). Pero la **capa de aislamiento multi-tenant tiene una grieta crítica** (cualquier usuario se auto-promueve a arquitecto de cualquier empresa), **no hay red de contención** (sin CI, sin tests, sin sistema de migraciones) y **varios subsistemas están diseñados para ~10 empresas, no 1.000** (cron monolítico, sin tope de costo de IA, tipos duplicados a mano). Nada de esto es irreparable; el orden de ataque está en §8.

---

## 📌 Estado de remediación (2026-07-13)

- **Las 8 migraciones (fase0–fase4) se aplicaron en producción sin errores.** Cerraron: **T1, T3, T5, DB-4, DB-5, DB-6, DB-8, DB-9, DB-19, PAY-2, PAY-3, PAY-6, PAY-9, CRON-6** + el schema/RPC de billing (**PAY-4**).
- **Fixes de código en la rama `develop`** (mergeándose a `main`): **T2, T7, IA-3/4/5/15, CRON-1/4/5/8/14, SEC-B2, T8, ARCH-14** + flujo de Stripe (checkout + webhook + UI).
- **Pendiente inmediato:** smoke test de los flujos que tocan RLS/onboarding (ver [`CHECKLIST_POST_MIGRACION.md`](CHECKLIST_POST_MIGRACION.md)), setear envs en Vercel (`NEXT_PUBLIC_APP_URL`, Stripe), y cargar `credit_packages` para activar la compra.
- **Sin empezar (necesitan BD viva, refactor con test, o decisión de producto):** T4, ARCH-3, DB-16 · T6 (dispatcher del cron), ARCH-6/IA-10 (unificar `packages/shared`), ARCH-9/10 (monolitos) · DB-13, DB-7.

---

## §1 · Hallazgos transversales (aparecieron en varias auditorías)

Estos son los que confirmaron dos o más auditores de forma independiente. Son la prioridad absoluta.

### T1 🔴 CRÍTICO — Cualquier usuario se auto-promueve a Arquitecto de cualquier empresa (ruptura total del aislamiento multi-tenant)
> ✅ **Aplicado (2026-07-13) — migración corrida sin errores.** `supabase/migration_fase0_hardening.sql` agrega un trigger `BEFORE UPDATE` en `profiles` que congela `role`/`company_id` en sesiones de usuario, salvo la primera vinculación validada (dueño de su empresa o invitado con invitación real). No requiere cambios de código (register/accept-invite siguen igual). **Pendiente: correr la migración en el SQL Editor.**

**Confirmado por:** BD (#1), Seguridad (C1).
**Evidencia:** `supabase/schema.sql:105-107`
```sql
create policy "Usuario puede editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);   -- ← sin WITH CHECK
```
Sin `WITH CHECK`, Postgres usa el `USING` como check: lo único que se valida es que `id` siga siendo el del usuario. **`role` y `company_id` quedan libres para escribir.** Ninguna migración posterior lo endurece (`fix_rls_recursion.sql:38-41` solo redefine la policy del arquitecto). Que el cliente escribe estas columnas por PostgREST está probado en `apps/web/src/app/(auth)/register/register-form.tsx:74-81` y `accept-invite/page.tsx:168-177`.

Toda la autorización deriva de esos dos campos: `auth_company_id()` y `auth_is_arquitecto()` (`fix_rls_recursion.sql:9-30`) leen `profiles`.

**Escenario:** desde la consola del navegador, con el JWT propio:
```js
await supabase.from('profiles')
  .update({ role: 'arquitecto', company_id: '<UUID-empresa-víctima>' })
  .eq('id', MI_USER_ID)   // RLS lo permite
```
A partir de ahí, lectura/escritura de arquitecto sobre TODA empresa víctima: DISC del equipo, tasks, scorecards, créditos, matriz de autoridad. Los UUID de otras empresas circulan en invitaciones, notas de coaching y exports. Es confidencialidad + integridad + impacto económico, iterable por todas las empresas.

**Recomendación:** `WITH CHECK` que congele `role`/`company_id` en el self-update, y mover la vinculación a empresa a una RPC `SECURITY DEFINER` que valide la invitación server-side:
```sql
create policy "perfil: editar sin tocar rol/empresa"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and company_id is not distinct from (select company_id from public.profiles where id = auth.uid())
  );
```
Alternativa complementaria: `revoke update (role, company_id) on public.profiles from authenticated` (column-level). Es una migración de ~15 líneas y es lo primero que hay que aplicar.

---

### T2 🔴 CRÍTICO — `origin` controlado por el cliente termina dentro del magic link de invitación → robo de token / account takeover
> ✅ **Resuelto (2026-07-13).** Nuevo `apps/web/src/lib/trusted-origin.ts`: el origin de los links con token se deriva de `NEXT_PUBLIC_APP_URL` (ignora el del cliente salvo localhost). Aplicado en `equipo/actions.ts` (`buildInviteLink` + redirects; aborta con error claro si falta la env) y en `resolveOrigin` de `api/jarvis/route.ts`.

**Confirmado por:** Seguridad (A1), IA (#1).
**Evidencia:** `apps/web/src/app/(dashboard)/equipo/actions.ts:47-68` arma el link **a mano** con el `hashed_token` real de Supabase embebido en un dominio arbitrario:
```ts
async function buildInviteLink(admin, origin, nextPath, email) {
  const { data } = await admin.auth.admin.generateLink({ type: "magiclink", email, ... });
  return `${origin}/auth/confirm?token_hash=${encodeURIComponent(props.hashed_token)}&type=...`;
}
```
`origin` viene de `input.origin` (server action) y en el asistente de `body.origin`, que `resolveOrigin` acepta si matchea `^https?://` **sin allow-list de host** (`api/jarvis/route.ts:137-146`). Como el link se construye a mano con el token embebido, la allow-list de "Redirect URLs" de Supabase **no** protege (a diferencia del path OTP con `emailRedirectTo`).

**Escenario:** se invoca el server action / `/api/jarvis` con `origin: "https://evil.com"`. El email —enviado desde el dominio verificado legítimo `send.stlabs.ar`— contiene `https://evil.com/auth/confirm?token_hash=<token válido>`. La víctima hace clic, su token OTP llega a `evil.com`, que lo canjea con `verifyOtp` y obtiene sesión como la víctima. Si el email es de un usuario existente (otro arquitecto), es apropiación de cuenta.

**Recomendación:** **ignorar el `origin` del cliente.** Derivarlo server-side de `NEXT_PUBLIC_APP_URL` (env de confianza) o validarlo contra una allow-list estricta de hosts propios antes de meterlo en cualquier link con token. Aplica también a `body.origin` en `/api/jarvis`.

---

### T3 🔴 CRÍTICO — El gating de créditos del DISC se puede saltar desde la consola del browser
> ✅ **Aplicado (2026-07-13) — migración corrida sin errores.** `migration_fase0_hardening.sql` dropea las policies insert/update/delete de arquitecto sobre `disc_assessments` y revoca esos permisos a `authenticated`/`anon` (queda solo SELECT). Verificado que ningún `.from("disc_assessments").insert/update/delete` existe en `apps/` → todo pasa por RPC, no rompe nada. **Pendiente: correr la migración.**

**Confirmado por:** Créditos (#1). (Relacionado con T1: mismo patrón de RLS de escritura directa.)
**Evidencia:** `supabase/migration_sprint3_disc.sql:51-64` — las policies pre-créditos siguen vigentes:
```sql
create policy "Arquitecto crea tests DISC"
  on public.disc_assessments for insert
  with check (public.auth_is_arquitecto() and company_id = public.auth_company_id());
```
La Fase 2 solo reemplazó el INSERT **en el código de la app** (`migration_fase2_credits.sql:76`), no revocó el permiso en la base. Ninguna migración dropea estas policies ni revoca los grants.

**Escenario:** un arquitecto con la consola del navegador: (a) `INSERT` directo en `disc_assessments` → **test DISC gratis, sin consumir crédito**; (b) `UPDATE status='pendiente'` sobre un test completado → `generate_disc_link` lo reusa sin cobrar → **re-test gratis**; (c) `DELETE` de un pendiente sin refund. El comentario "no salteable desde la consola" (`equipo-client.tsx:200`) es falso hoy.

**Recomendación:** migración que dropee las policies `insert`/`update`/`delete` de arquitecto sobre `disc_assessments` (dejar solo `select`) y `revoke insert, update, delete on public.disc_assessments from authenticated`. Todo write ya pasa por RPCs (`generate_disc_link`, `submit_disc`). **Imprescindible antes de cobrar plata real.**

---

### T4 🔴 CRÍTICO — No hay sistema de migraciones: el estado de producción es desconocido
**Confirmado por:** BD (#2), y reforzado por Monorepo (#3 — tipos a mano) y Cron/IA (comentarios "aplicar a mano").
**Evidencia:** no existe `supabase/migrations/` ni `config.toml`; el CLI está solo como caché (`supabase/.temp/cli-latest`). Los 25 `migration_*.sql` se aplican a mano en el SQL Editor, sin timestamps ni tabla de tracking. `supabase/README.md:3-5` documenta que se "reconstruyó tras perder acceso al proyecto viejo `onzsxbghmyuqykiejpxw`"; migraciones viejas apuntan al proyecto muerto (`migration_sprint10_plan90d.sql:2`) y las nuevas al activo. El README marca "⏳ pendiente" sprints (5, 7, 12, 13, 14, 15, 17) que los commits recientes dan por cerrados — **contradicción imposible de resolver sin mirar la BD viva**.

**Impacto:** nadie puede afirmar qué SQL corre en producción. Cada feature depende de que un humano recuerde pegar SQL. El drift es invisible hasta que rompe en runtime. Hace **no verificables** casi todos los demás hallazgos de BD.

**Recomendación:** adoptar el flujo del CLI ya instalado — `supabase link` al proyecto activo → `supabase db diff` para capturar el esquema real como baseline en `supabase/migrations/<timestamp>_baseline.sql` → migrar los 25 archivos a ese formato → a partir de ahí `supabase db push` + `db diff` en CI para detectar drift. Es el trabajo estructural que hace verificable todo lo demás.

---

### T5 🔴 CRÍTICO — Posible `role DEFAULT 'arquitecto'`: todo invitado nace como arquitecto (a verificar)
> ✅ **Aplicado (2026-07-13) — migración corrida sin errores.** `migration_fase0_hardening.sql` fija `profiles.role default 'colaborador'`, actualiza `handle_new_user` para asignar rol explícito, y re-aplica el fix de datos idempotente (dueños→arquitecto, resto→colaborador). Es equivalente a `sprint5_roles.sql`, seguro de correr aunque ya estuviera aplicado. **Pendiente: correr la migración.**

**Confirmado por:** BD (#3).
**Evidencia:** `supabase/README.md:21` marca `migration_sprint5_roles.sql` "⏳ pendiente" sobre el proyecto activo. `schema.sql:36` define `role text default 'arquitecto'` y el `handle_new_user` base (`schema.sql:127-141`) no setea role. Si sprint5 no se aplicó, **todo signup (incluidos invitados) nace arquitecto**, que es el bug exacto que sprint5 corrige (`migration_sprint5_roles.sql:3-7`). Combinado con T1, cualquier invitado tendría permisos de arquitecto desde el día cero.

**Recomendación:** verificar hoy en el proyecto activo:
```sql
select column_default from information_schema.columns
where table_name='profiles' and column_name='role';
```
Si devuelve `'arquitecto'`, aplicar `migration_sprint5_roles.sql` de inmediato. Es el mejor ejemplo del costo de T4.

---

### T6 🔴 CRÍTICO — El cron diario no escala: cap duro de 100 empresas + monolito secuencial vs. timeout de 60s
> 🟡 **Parcial (2026-07-13):** el cap de 100 (CRON-1) se quitó y el cron ganó robustez (try/catch por empresa, `ok:false` si hay errores). **El refactor arquitectónico a dispatcher + worker por empresa sigue pendiente** — es el que resuelve el timeout de 60s a gran escala; conviene hacerlo con capacidad de test / cambio de infra (Supabase Queues / QStash).

**Confirmado por:** Cron (#1, #2).
**Evidencia:** `apps/web/src/app/api/cron/daily/route.ts:47-50` limita a `.limit(100)` sin orden ni paginación → la empresa 101+ nunca se procesa y el cron devuelve `ok:true` igual. `route.ts:52` itera **secuencialmente** (`for … of companies`), y por empresa gasta ~8 round-trips DB + varios emails (cada email = 2 queries + 1 RPC Vault + 1 HTTP a Resend, sin cache — ver CRON-9). Con `maxDuration = 60` (`route.ts:6`, además el máximo en plan Hobby), el timeout se agota con **~15-30 empresas activas**. Al cortar por timeout no hay registro de dónde quedó: las restantes pierden el día.

**Recomendación:** convertir `/api/cron/daily` en un **dispatcher** que solo lista empresas y encola un job por empresa; un worker `/api/cron/process-company` procesa una sola. Opciones por encaje con el stack: (a) Supabase Queues (pgmq) + `pg_cron`; (b) Upstash QStash (retries + DLQ + firma incluidos); (c) mínimo viable sin infra: fan-out con `fetch` fire-and-forget por lotes de 10 con `batch_id`. Esto también resuelve el problema de timezones (T-relacionado CRON-7): cron **horario** que procesa solo las empresas cuya hora local cae en la ventana de envío.

---

### T7 🔴 CRÍTICO — El asistente de IA no tiene tope de costo por empresa ni circuit-breaker de gasto
> ✅ **Resuelto — mínimo viable (2026-07-13).** `api/jarvis/route.ts`: kill-switch global por env `DC_KILL_SWITCH` (apaga DC con 503 sin tocar la BD) + `overCompanyBudget()` que corta con 429 cuando la empresa supera `DC_COMPANY_MONTHLY_LIMIT` mensajes/mes (default 2000, 0 = sin tope). Documentado en `.env.local.example`. **Pendiente (fase posterior):** tope por *tokens* (no mensajes) + tabla de rollup + key/budget por empresa.

**Confirmado por:** IA (#2, #14).
**Evidencia:** `overRateLimit` (`api/jarvis/route.ts:85-93`) cuenta solo mensajes del **usuario** en la última hora (50/h). No existe ningún tope por `company_id`. `getAiUsage` (`asistente-ia/actions.ts:199-224`) suma tokens de **toda la plataforma**, sin desglose ni corte. Hay una sola API key global (`ai_get_api_key()` devuelve el secreto fijo `'ai_provider_api_key'`, `migration_jarvis_ai_config.sql:53-61`) → el costo de todas las empresas va a la misma cuenta sin segmentación. No hay gating por créditos en el chat.

**Impacto:** una empresa (50 msgs/h × N usuarios × 24h) puede consumir tokens ilimitados; con un modelo caro configurado, el gasto es ilimitado y no atribuible. No hay kill-switch.

**Recomendación:** tope de tokens/mes por `company_id` (chequeo previo sumando `ai_messages` join `ai_conversations.company_id`) + kill-switch global de gasto. Idealmente una tabla de rollup diaria por empresa (hoy `ai_messages` no tiene ni `user_id` denormalizado — ver DB-15). Prerequisito de multi-tenant real con IA.

---

### T8 🟠 ALTO — Sin red de contención: push a `main` deploya a producción sin CI, sin tests y con el lint roto
> ✅ **Resuelto en gran parte (2026-07-13).** `.github/workflows/ci.yml` corre en cada PR/push: type-check de web+admin y Vitest como **gates duros**, lint informativo. ESLint migrado a flat config nativo de `eslint-config-next`. Primeros tests (`lib/credits`, `lib/trusted-origin`) — 11 verdes. Validado local: type-check web+admin en 0. **Pendiente:** sumar `next build` al CI (con envs dummy) y limpiar los 29 errores de lint heredados (`react-hooks/purity`).

**Confirmado por:** Monorepo (#1, #2).
**Evidencia:** no existe `.github/`, ni `turbo.json`, ni workflows. `AGENTS.md:65,106`: cualquier push a `main` auto-deploya en Vercel (2 proyectos). `find apps packages -name "*.test.*"` → **0 resultados** sobre ~34.600 líneas de `.tsx` solo en web. Y el lint no corre: `apps/web/package.json:9` usa `next lint`, comando **eliminado en Next 16** (falla con "Invalid project directory"); `apps/admin` no tiene ESLint configurado.

**Impacto:** con 2+ devs cada merge es ruleta rusa sobre usuarios reales. Los refactors que este informe recomienda (unificar tipos, endurecer RLS) son inseguros sin red.

**Recomendación:** GitHub Actions mínimo (1 archivo): `npm ci` + `tsc --noEmit` en los 3 workspaces + `next build` de ambas apps en cada PR. Luego Vitest sobre la lógica pura ya aislada (`lib/disc-evaluator.ts`, `credits.ts`, `dates.ts`). Migrar ESLint a flat config v9. **Es el movimiento de mayor palanca**: hace seguro todo lo demás.

---

## §2 · Base de datos y multi-tenancy

> Además de T1, T3, T4, T5 (arriba), que nacen en la capa de datos.

### DB-4 🟠 ALTO — Policies `FOR ALL` "company_isolation": cualquier miembro edita cualquier fila de su empresa
> ✅ **Aplicada (2026-07-13):** `migration_fase2b_policies_aislamiento.sql` separa las policies por comando + DELETE de arquitecto. UPDATE conservador (por empresa) donde el flujo por rol no es verificable sin la app. Falta aplicar.
**Evidencia:** `migration_sprint10_plan90d.sql:18-20` (patrón repetido en `rock_updates`, `idea_parking`, `decisions`, `leading_indicators`, y en `migration_sprint9_feedback.sql:19-22`, `migration_sprint11_workbooks.sql:16-18`):
```sql
CREATE POLICY "company_isolation" ON rocks
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
```
Sin `FOR` explícito = aplica a todos los comandos; con `GRANT … UPDATE`.
**Impacto:** un colaborador modifica rocas del Plan 90D, decisiones, indicadores y workbooks ajenos, sin trazabilidad.
**Recomendación:** separar por comando — SELECT company-wide, INSERT con `user_id = auth.uid()`, UPDATE restringido a autor/dueño/arquitecto. El patrón correcto ya existe en `migration_sprint12_activos.sql:36-46` (`process_assets`).

### DB-5 🟠 ALTO — Suplantación de autoría intra-tenant: `from_user`/`user_id` no se validan contra `auth.uid()`
> ✅ **Aplicada (2026-07-13):** `migration_fase2b_*` — INSERT exige `user_id/proposed_by/from_user = auth.uid()`. Verificado que el código ya setea esos campos → no rompe. Falta aplicar.
**Evidencia:** `migration_sprint9_feedback.sql:19-21` (feedback S.E.C. con `from_user` libre), `rock_updates.user_id` (`migration_sprint10_plan90d.sql:32-36`), `decisions.user_id`, `workbook_responses.user_id`. Contraste correcto: `tasks_insert_company` sí valida `created_by = auth.uid()` (`migration_sprint8_delegacion.sql:70-72`).
**Impacto:** cualquiera inserta feedback "firmado" por otro compañero o check-ins a nombre ajeno — integridad sensible en una herramienta de gestión de personas.
**Recomendación:** `AND from_user = auth.uid()` / `user_id = auth.uid()` en el `WITH CHECK` de cada INSERT.

### DB-6 🟠 ALTO — Borradores de feedback visibles para toda la empresa, incluido el destinatario
> ✅ **Aplicada (2026-07-13):** `migration_fase2b_*` — la SELECT de feedbacks solo muestra borradores a su autor. Falta aplicar.
**Evidencia:** `migration_sprint9_feedback.sql:12,19-21` — existe `is_draft boolean DEFAULT true` pero la única SELECT es company-wide, sin filtrar por draft.
**Impacto:** el destinatario y cualquier tercero leen feedback correctivo a medio escribir. Rompe el flujo draft→delivered.
**Recomendación:** SELECT `(NOT is_draft AND (to_user = auth.uid() OR from_user = auth.uid() OR auth_is_arquitecto())) OR from_user = auth.uid()`.

### DB-7 🟠 ALTO — El invitado puede editar toda su invitación (incluido `role`) antes de aceptarla
**Evidencia:** `migration_invitations_invitee_rls.sql:15-17` — UPDATE sin restricción de columnas ni validación de `expires_at`/`status`; `invitations.role` es text sin CHECK (`migration_sprint1.sql:99`).
**Impacto:** el invitado eleva su propio `role` en la invitación y accept-invite se lo asigna; también "acepta" invitaciones vencidas.
**Recomendación:** reemplazar por RPC `accept_invitation(token)` `SECURITY DEFINER` que solo mueva `status/accepted_at`, valide expiración y asigne el role original. (Resuelve también SEC-M4.)

### DB-8 🟠 ALTO — Motor de créditos: el ledger puede divergir del balance
> ✅ **Aplicada (2026-07-13):** `migration_fase2c_ledger.sql` — `grant_credits` rechaza saldo negativo (mata el clamp), CHECK de type, `balance_after`. Falta aplicar.
**Evidencia:** `migration_fase2_credits.sql:61-69` — con `p_amount` negativo (type 'adjust') y balance insuficiente, el balance se clampa con `greatest(0, …)` pero el ledger registra el delta completo → `sum(delta) ≠ balance` para siempre. `credit_transactions.type` (línea 26) no tiene CHECK.
**Impacto:** el ledger deja de ser fuente de verdad contable justo cuando haya que auditar créditos cobrados. (Ver también PAY-3.)
**Recomendación:** rechazar el ajuste si `balance + p_amount < 0` (en vez de clampear); `CHECK (type IN (...))`; columna `balance_after` + job de reconciliación por empresa.

### DB-9 🟠 ALTO — El lote Sprint 9–11 se creó sin un solo índice; múltiples FKs sin índice
> ✅ **Aplicada (2026-07-13):** `migration_fase2a_indices.sql` — índices sobre company_id (Plan 90D) y FKs sin índice. Aditivo. Falta aplicar.
**Evidencia:** `migration_sprint10_plan90d.sql` (5 tablas), `migration_sprint9_feedback.sql` y `migration_sprint11_workbooks.sql` no tienen **ningún** `CREATE INDEX` — cero índices sobre `company_id`, que es el predicado de todas sus queries y policies. Otras FKs sin índice: `notifications.company_id`, `ai_conversations.company_id`, `coach_assignments.company_id`, `coaching_notes.coach_id`, `kpis.owner_id`, `invitations.invited_by`, `pre_games.company_id`, `credit_requests.requested_by`, `user_habits.company_id`.
**Impacto:** cada render de Plan 90D/BOS/feedback es seq scan; los `ON DELETE CASCADE` desde `companies` escanean todas estas tablas. A 500 empresas × 2 años, degradación generalizada.
**Recomendación:** índices `(company_id)` o compuestos `(company_id, created_at desc)` / `(company_id, week_date)` según patrón. El repo ya tiene el patrón bueno (sprint1/2 indexan todo).

### DB-10 🟠 ALTO — RLS no optimizada: funciones `SECURITY DEFINER` evaluadas por fila + policies SELECT permisivas acumuladas
**Evidencia:** `fix_rls_recursion.sql:36` y ~20 policies usan `public.auth_is_arquitecto() AND company_id = public.auth_company_id()` sin envolver en `(select …)` → evaluación por fila (lint `auth_rls_initplan` de Supabase). Peor: `migration_sprint15_super_coach.sql:44-60` (`USING (public.auth_is_coach_of(id))` sobre 6 tablas) hace una subquery a `coach_assignments` por fila. `profiles` acumula 4 policies SELECT permisivas evaluadas en OR por scan.
**Impacto:** el costo de RLS crece con filas × policies; el clásico "volaba en beta, se arrastra con datos reales".
**Recomendación:** reescribir como `(select public.auth_is_arquitecto())` / `company_id = (select public.auth_company_id())` (InitPlan); consolidar policies SELECT duplicadas.

### DB-11 🟡 MEDIO — La mitad de las migraciones no son idempotentes (contradice su README)
**Evidencia:** `README.md:8-9` promete idempotencia, pero `schema.sql`, `migration_sprint1.sql:11`, `migration_sprint2.sql:14` (y sprint9/10/11/12/13/15/17) usan `create table`/`create policy` pelados; `migration_sprint2.sql:599` (`alter publication … add table`) falla si ya está (sprint4 sí lo maneja con `exception when duplicate_object`).
**Recomendación:** `create table if not exists` + `drop policy if exists`, o resolverlo de raíz con T4.

### DB-12 🟡 MEDIO — `schema.sql` no es un snapshot: reconstruir la BD requiere 25+ archivos en orden no inferible
**Evidencia:** `schema.sql` solo tiene `companies`+`profiles` (172 líneas) pese a que el README lo describe con más tablas. Los nombres no ordenan lexicográficamente (`sprint10` < `sprint2`); dependencias implícitas no declaradas (sprint15 referencia rocks de sprint10; fase2_credits requiere `is_platform_admin`, `auth_company_id`, `disc_assessments`).
**Recomendación:** snapshot real con `supabase db dump`/`db diff` como baseline (parte de T4).

### DB-13 🟡 MEDIO — Colaboradores no pueden leer perfiles de compañeros → notificaciones colaborador→arquitecto fallan en silencio (a verificar)
**Evidencia:** las SELECT de `profiles` son propia / arquitecto / coach. La INSERT de `notifications` (`migration_sprint13_notifications.sql:38-46`) exige `EXISTS (SELECT 1 FROM profiles target WHERE target.id = user_id …)`, subquery que corre bajo el RLS del caller → un colaborador no ve el profile del arquitecto y el INSERT falla. `notify()` es fire-and-forget y traga el error (`apps/web/src/lib/notifications.ts:66-77`).
**Recomendación:** policy `members_see_teammates` (SELECT `company_id = (select auth_company_id())`, exponiendo columnas no sensibles vía vista si el DISC debe quedar privado). Testear el flujo.

### DB-14 🟡 MEDIO — Sin estrategia de retención para tablas de crecimiento ilimitado
**Evidencia:** `ai_messages` (contenido completo de cada chat), `notifications` (sin DELETE ni para el propio usuario), `audit_log`, `habit_logs`, `credit_transactions`, `energy_logs`. No hay job de purga.
**Impacto:** en 12-24 meses dominan storage y backups; `ai_messages` guarda texto de negocio sensible que nadie borra.
**Recomendación:** cron de purga (notificaciones leídas > 90 días, `ai_messages` inactivos > N meses o resumen), política declarada para `audit_log` (retener con archivado). Particionar solo si el volumen lo justifica.

### DB-15 🟡 MEDIO — El índice "para rate-limit" de `ai_messages` no sirve para su propósito
**Evidencia:** `migration_jarvis_history.sql:34-36` crea índice `(role, created_at)` "para el rate-limit", pero `ai_messages` no tiene `user_id`: contar mensajes de un usuario exige join con `ai_conversations`. Un índice global por `(role, created_at)` (role con 2 valores) no discrimina usuario.
**Recomendación:** denormalizar `user_id` en `ai_messages` + índice `(user_id, created_at) WHERE role='user'`. (Habilita el rollup de costos de T7.)

### DB-16 🟡 MEDIO — Columnas de estado/rol sin CHECK: los dominios válidos viven en comentarios
**Evidencia:** `profiles.role`, `companies.plan`, `invitations.status/role`, `war_ups.status`, `parking_lot.source/status`, `task_updates.type`, `credit_transactions.type`, `notifications.type`, `kpis.type`. Contraste: `rocks.status`, `credit_requests.status`, `feedbacks.type` sí tienen CHECK — criterio inconsistente.
**Impacto:** typos y estados inventados entran sin error; un `role` inesperado no matchea ninguna policy.
**Recomendación:** `CHECK (col IN (...))` o enums, especialmente en `profiles.role`.

### DB-17 🟡 MEDIO — `rock_id` quedó como uuid sin FK: huérfanos garantizados
**Evidencia:** `migration_sprint2.sql:94,149` (`rock_id uuid, -- referencia futura a rocks (S6)`); `rocks` se creó en sprint10 pero la FK nunca se agregó. Igual `parking_lot.source_entry_id`.
**Impacto:** la alineación ritual↔roca (feature central) puede apuntar a rocas borradas; reportes semanales agregan sobre referencias muertas.
**Recomendación:** `ADD CONSTRAINT … FOREIGN KEY (rock_id) REFERENCES rocks(id) ON DELETE SET NULL` previa limpieza.

### DB-18 🟡 MEDIO — Resultados DISC calculados en cliente y persistidos por RPC anónima; JSONB sin validación
**Evidencia:** `migration_sprint3_disc.sql:105-166` — `submit_disc` (`grant execute to anon`) persiste `p_raw/p_segments/p_profile_key/p_letters` tal como llegan del cliente ("el scoring se calcula en la app"). Ningún JSONB tiene CHECK de estructura (`weekly_reports.payload`, `workbook_responses.response`, `disc_assessments.answers`, `companies.settings`, `ai_config.features`).
**Impacto:** cualquiera con token válido se fabrica el perfil DISC que quiera (base de feedback y roles); JSON malformado rompe exports/reportes.
**Recomendación:** recalcular el scoring server-side dentro de `submit_disc` a partir de las 24 respuestas; CHECKs mínimos (`jsonb_typeof`) en payloads críticos.

### DB-19 🟡 MEDIO — UNIQUEs de negocio faltantes
> ✅ **Aplicada (2026-07-13):** `migration_fase2d_integridad.sql` — unique de baseline por empresa + (company_id,name,week_date) en kpis y leading_indicators (guard defensivo). Falta aplicar.
**Evidencia:** `scorecards` sin unique parcial `(company_id) WHERE is_baseline` → N "Día 1" por empresa; `kpis`/`leading_indicators` sin `UNIQUE (company_id, name, week_date)` → métricas-semana duplicadas.
**Recomendación:** `CREATE UNIQUE INDEX … ON scorecards(company_id) WHERE is_baseline;` + uniques compuestos en tablas semanales.

### DB-20 ⚪ BAJO — `SECURITY DEFINER` con `search_path = public` en 2 funciones
**Evidencia:** `migration_sprint5_roles.sql:30` (`handle_new_user`) y `migration_sprint15_super_coach.sql:35` (`auth_is_coach_of`) usan `set search_path = public` en vez de `''` (el resto ya se corrigió en `migration_hardening_2026-06.sql:10-11`).
**Recomendación:** `alter function … set search_path = ''` con referencias schema-qualified.

### DB-21 ⚪ BAJO — Cualquier miembro inserta notificaciones arbitrarias (título/body/href libres) a otro miembro
**Evidencia:** `migration_sprint13_notifications.sql:38-46` no restringe `type` ni `href` → phishing interno con `href` a dominio externo.
**Recomendación:** CHECK de `type` contra catálogo, validar `href LIKE '/%'`.

### DB-22 ⚪ BAJO — Módulos enteros sin DELETE (ni grant ni policy)
**Evidencia:** `rocks`/`idea_parking`/`decisions`/`leading_indicators` (sprint10, solo `SELECT, INSERT, UPDATE`), `feedbacks`, `notifications`. Ni el arquitecto puede borrar una roca creada por error.
**Recomendación:** DELETE para arquitecto (patrón `process_assets`) o soft-delete explícito.

### DB-23 ⚪ BAJO — Data-fixes ad hoc versionados con placeholders editables a mano
**Evidencia:** `fix_perfil_corrupto.sql:26` (`where email = 'EMAIL_DE_SEBASTIAN@ejemplo.com'`); UPDATE masivo de roles embebido en migración de esquema (`sprint5:49-63`). Datos y esquema comparten canal manual sin trazabilidad.
**Recomendación:** separar data-fixes de migraciones y registrarlos en `audit_log` al ejecutarlos por service-role.

---

## §3 · Seguridad y autenticación

> Además de T1, T2 (arriba).

### SEC-M1 🟡 MEDIO — El magic link de login puede quedar en manos del invitador
**Evidencia:** `equipo/actions.ts:148-155,188-196` devuelven `{ via:"manual", link }` cuando Resend falla; `jarvis-tools.ts:301-302` lo muestra en el chat del arquitecto. El link se genera con `generateLink({ type:"magiclink", email })` — es una credencial de login completa para ese email.
**Escenario:** un arquitecto invita el email de un usuario existente; si el envío falla, recibe un magic link que inicia sesión como esa cuenta. Refuerza T2.
**Recomendación:** nunca retornar el magic link al invocador; en fallo, informar el error y reintentar/loguear. Usar un token de invitación propio (la tabla `invitations.token` ya existe).

### SEC-M2 🟡 MEDIO — El middleware del admin no filtra por `platform_admin` (defensa en profundidad)
**Evidencia:** `apps/admin/src/middleware.ts:34-41` solo exige sesión; la verificación real de `is_platform_admin` está en `apps/admin/src/app/(panel)/layout.tsx:19-21`. Como admin y web comparten proyecto Supabase, cualquier usuario final autenticado pasa el middleware; solo el layout lo frena.
**Nota:** hoy todos los server actions god-mode reverifican `is_platform_admin` correctamente, y la función es `SECURITY DEFINER` con `platform_admins` sin policies de cliente → no escalable desde el cliente. El riesgo es que una página/route futura del panel olvide el guard.
**Recomendación:** mover el chequeo `is_platform_admin` al `middleware.ts` del admin, además del layout.

### SEC-M3 🟡 MEDIO — El confirm del asistente ejecuta tools con args arbitrarios del cliente
**Evidencia:** `api/jarvis/route.ts:196-202` toma `body.confirm.args` tal cual y llama `executeTool`; el patrón propose→confirm no re-valida. En `crear_tarea`, inserta con `assigned_to` sin validar que el UUID pertenezca a la empresa (`jarvis-tools.ts:266-277`); la RLS `tasks_insert_company` solo valida `company_id`/`created_by` (`migration_sprint8_delegacion.sql:67-72`).
**Mitigación actual:** requiere ser arquitecto; el impacto peor hoy es asignar una tarea de la propia empresa a un `assigned_to` inexistente/ajeno (bajo). La prompt-injection queda acotada a "proponer" (el arquitecto confirma) y la ejecución revalida por RLS en los otros tools.
**Recomendación:** re-validar los args server-side en el confirm (resolver `assigned_to` contra la empresa); agregar a la RLS de tasks que `assigned_to` sea de la misma empresa. (Ver IA-7.)

### SEC-M4 🟡 MEDIO — Las invitaciones no expiran de forma efectiva
**Evidencia:** `invitations.expires_at`/`status` existen (`migration_sprint1.sql:100-103`) pero no se chequean: la RLS del invitado matchea solo por email (`migration_invitations_invitee_rls.sql:10-17`) y `accept-invite/page.tsx:142-153` no mira `status`/`expires_at`. El `token` de 7 días es cosmético.
**Recomendación:** filtrar `status='pending' and expires_at > now()` en la aceptación (dentro de la RPC propuesta en DB-7).

### SEC-B1 ⚪ BAJO — Comparación de `CRON_SECRET` no timing-safe
**Confirmado por:** Seguridad (B1), Cron (#14).
**Evidencia:** `api/cron/daily/route.ts:31` usa `!==` de strings. Positivo: falla cerrado si falta el env (503, `:24-30`). Riesgo de timing sobre red serverless marginal.
**Recomendación:** `crypto.timingSafeEqual(Buffer.from(header ?? ""), Buffer.from(\`Bearer ${secret}\`))` con chequeo previo de longitudes.

### SEC-B2 ⚪ BAJO — Inyección de HTML en el email a soporte (`requestCredits`)
> ✅ **Resuelto (2026-07-13):** se escapan `companyName`/`who`/`email`/`note` antes de interpolarlos en el HTML del correo al admin.
**Evidencia:** `(dashboard)/creditos/actions.ts:64-75` interpola `companyName`, `who`, `profile.email` y `note` (input del usuario) sin escapar en el HTML del email al admin.
**Recomendación:** escapar con el `escapeHtml` ya usado en `equipo/actions.ts:198-204`.

### SEC-B3 ⚪ BAJO — `NODE_TLS_REJECT_UNAUTHORIZED=0` (informativo)
**Evidencia:** documentado en `AGENTS.md:79` como "solo dev local, nunca en producción"; presente en el `.env.local` del root (`apps/web/.env.local.example:10` lo referencia). Ver también ARCH-12.
**Recomendación:** verificar que no se filtre a envs de Vercel; si hay proxy corporativo, usar `NODE_EXTRA_CA_CERTS` en vez de deshabilitar TLS.

---

## §4 · Asistente de IA (DC / ex-JARVIS)

> Además de T2 (origin) y T7 (tope de costo).

### IA-3 🟠 ALTO — El adapter de streaming no tiene timeout ni AbortController: cuelga hasta el hard-limit de Vercel
> ✅ **Resuelto (2026-07-13):** `chatStream` de openrouter y anthropic usan un `AbortController` con idle-timeout de 30s que se rearma en cada chunk. Type-check OK.
**Evidencia:** `chat()`/`chatWithTools()` usan `AbortController` con 30s (`openrouter.ts:27-28`, `anthropic.ts:37`), pero **`chatStream()` no** (`openrouter.ts:61`, `anthropic.ts:73` hacen `fetch` sin `signal`). El route declara `maxDuration = 60`. Si el proveedor se cuelga, no hay corte hasta los 60s.
**Impacto:** funciones serverless colgadas consumen concurrencia; bajo carga, agotamiento de instancias y 5xx en cascada.
**Recomendación:** `AbortController` con idle-timeout entre chunks en `chatStream`, propagando el `signal` del cliente.

### IA-4 🟠 ALTO — Si el stream falla a mitad, el mensaje se persiste con el texto de error incrustado y usage subestimado
**Evidencia:** `route.ts:335-336` — el `catch` hace `enqueue("[No pude completar…]")` que se acumula en `acc`; el `finally` (`:340-349`) persiste `acc` como mensaje del assistant con `estimateTokens(acc)` y `promptTokens: 0`.
**Impacto:** historial contaminado con texto de error que se re-envía como contexto (`slice(-10)`); subconteo sistemático de costo (no cuenta los prompt tokens ya consumidos).
**Recomendación:** en el `catch`, enqueue directo sin sumar a `acc`; marcar el mensaje como incompleto o no persistirlo; estimar prompt tokens del `messages` armado, no 0.

### IA-5 🟠 ALTO — Sin manejo diferenciado de errores del proveedor (429/5xx/timeout), sin reintentos ni fallback
> 🟡 **Parcial (2026-07-13):** el mensaje al usuario ahora varía según el status (429/401/otro) vía `providerErrorText`. **Pendiente:** retry con backoff y fallback al segundo proveedor.
**Evidencia:** el path de tools (`route.ts:310-312`) y el stream (`:335`) usan `catch {}` genérico. `AIError` conserva `status` (`types.ts:98-105`) pero el route nunca lo lee. No hay retry con backoff ni fallback al segundo proveedor del registry (`ai/index.ts:10-13`).
**Impacto:** ante un 429 del proveedor no hay degradación elegante; picos se traducen 1:1 en fallos de UX.
**Recomendación:** distinguir por `e.status` (429 → "reintentá"; 401 → alertar admin; 5xx/timeout → 1 retry con backoff); fallback opcional al segundo proveedor configurado.

### IA-6 🟠 ALTO — Contexto TBM reconstruido íntegro en cada turno con ~6 round-trips a BD, sin cache
**Evidencia:** `buildJarvisContext` (`jarvis-context.ts:12-91`) corre en cada mensaje: profile + `Promise.all` de 4 (company, **todo el roster**, count de tareas, **todos los scorecards**), más `detectPairCrossings` sobre todo el roster; en paralelo RAG (Edge Function `embed` + RPC). `scorecards` se trae con `select("*")` solo para usar `.at(-1)`.
**Impacto:** latencia fija alta por turno; en equipos grandes el system prompt crece sin cota (más input tokens = más costo).
**Recomendación:** cachear el contexto por usuario con TTL corto; traer solo el último scorecard (`order desc limit 1`); acotar el roster inyectado; medir/limitar tamaño del system.

### IA-7 🟡 MEDIO — La confirmación de tool-use re-ejecuta con args del cliente sin re-validar la propuesta
Ver SEC-M3 (mismo hallazgo desde la óptica de IA). El eslabón débil es `crear_tarea`; los demás tools revalidan por RLS/RPC.

### IA-8 🟡 MEDIO — El feature-flag de acciones es global de plataforma, no por empresa
**Evidencia:** `actionsEnabled` (`dc-persona.ts:61`) es flag global (`ai_config` scope platform). Activarlo habilita acciones para todos los arquitectos de todas las empresas. `isArquitecto` sí falla cerrado si la query falla (`route.ts:190-192`).
**Impacto:** no se puede pilotar acciones con una sola empresa; blast radius total.
**Recomendación:** mover `features` a scope company o agregar allowlist de empresas.

### IA-9 🟡 MEDIO — Naming JARVIS→DC a medias: rutas, archivos, tablas y componentes mezclan ambos nombres
**Evidencia:** endpoint `/api/jarvis`; archivos `lib/jarvis-*.ts` conviven con `dc-*.ts`; componentes `JarvisPanel`/`JarvisCore`/`jarvis-store`; clases CSS `jarvis-*`; `HINT_KEY = "tbm:jarvis-hint-seen"`. El system prompt dice "Sos DC" pero el código dice jarvis.
**Impacto:** onboarding confuso; búsquedas fallan; riesgo de tocar el archivo equivocado.
**Recomendación:** decidir un nombre y migrar (alias de ruta `/api/dc`, renombrar módulos) o documentar el mapeo en AGENTS.md.

### IA-10 🟡 MEDIO — Capa de adapters de IA duplicada entre `apps/web` y `apps/admin`, ya divergente
**Confirmado por:** IA (#10), Monorepo (#6).
**Evidencia:** `apps/web/src/lib/ai/types.ts:1-2` admite "copia de apps/admin… Deuda: unificar en packages/shared". El diff confirma divergencia: web tiene `chatStream`/`chatWithTools`/tool types/`parseSSE`; admin no (183 vs 55 líneas en `anthropic.ts`).
**Recomendación:** extraer `lib/ai` (versión de web, superset) a `packages/shared` (admin ya lo transpila).

### IA-11 🟡 MEDIO — Modelos hardcodeados e inconsistentes entre default de BD y de código
**Evidencia:** `migration_jarvis_ai_config.sql:15` default `model='claude-haiku-4-5'` provider `'anthropic'`; pero `asistente-ia/actions.ts:80,243` defaultean a `'openrouter'` / `'anthropic/claude-3.5-haiku'`. Tres strings de modelo distintos. El test de conexión puede probar un modelo distinto del que corre.
**Recomendación:** fuente única de defaults (constante compartida); alinear migración y código.

### IA-12 🟡 MEDIO — `maxTokens` divergente y contexto sin presupuesto de tamaño
**Evidencia:** stream `maxTokens:450` (`route.ts:323`), tools `700` (`:282`), `chat()` `1024`. El system concatena persona + reglas + navegación + contexto empresa completo + hasta 6 chunks RAG sin límite total (`:250-267`). `history.slice(-10)` acota turnos, no tamaño.
**Impacto:** en equipos grandes + RAG el input crece (costo) y el output se corta a 450 (respuestas truncadas).
**Recomendación:** presupuesto de tokens del prompt (truncar contexto/knowledge si excede N); unificar maxTokens; loguear tamaño del system.

### IA-13 🟡 MEDIO — RAG por empresa muerto: el endpoint nunca pasa `companyId`
**Evidencia:** `retrieveKnowledge(query, companyId?, …)` acepta el id (`jarvis-retrieval.ts:16-19`) y el RPC filtra `scope='global' OR company_id = p_company_id` (`migration_jarvis_rag.sql:44-46`), pero el route llama `retrieveKnowledge(lastUser)` **sin** companyId (`route.ts:232`) → solo se recupera corpus global; cualquier `knowledge_chunk` con `scope='company'` jamás se usa. (No hay leak cross-tenant — es sub-uso.)
**Recomendación:** pasar `companyId` desde `meRow`. El filtro del RPC ya excluye empresas ajenas.

### IA-14 🟡 MEDIO — Una sola API key global para toda la plataforma
Ver T7. `ai_get_api_key()` devuelve el secreto fijo `'ai_provider_api_key'` sin relación con empresa. Aceptable en beta si se documenta; para multi-tenant real, key o budget por empresa.

### IA-15 ⚪ BAJO — `estimateTokens` como fallback subcuenta y mezcla prompt/completion
**Evidencia:** `route.ts:307,348` usan `{ promptTokens:0, completionTokens: estimateTokens(finalText) }`; `estimateTokens` es `chars/4` (`types.ts:41-43`) y siempre pone prompt en 0.
**Recomendación:** estimar también promptTokens del `messages`; columna `usage_source` (estimado vs reportado).

### IA-16 ⚪ BAJO — `parseNavMarker`: el regex parcial puede comerse texto legítimo al final del stream
**Evidencia:** `dc-navigation.ts:33` `PARTIAL_TRAILING_RE` borra un `[[` al final aunque no sea marcador.
**Recomendación:** anclar el parcial exactamente al prefijo `[[IR:`; test de casos borde.

### IA-17 ⚪ BAJO — `getOrCreateConversation` confía en el `conversationId` del cliente; `saveMessage` ignora errores
**Evidencia:** `route.ts:96-111` devuelve el `conversationId` del cliente sin verificar pertenencia; el insert posterior fallaría por RLS (`ai_msg_own_insert`) pero `saveMessage` no chequea `.error` (`:122`) → el turno no se guarda en silencio. Confidencialidad OK (RLS protege), integridad degradada.
**Recomendación:** validar pertenencia del `conversationId`; chequear `.error` de los insert.

### IA-18 ⚪ BAJO — `saveMessage` ignora errores de BD en todos los paths
**Evidencia:** `route.ts:122-134,199,296,301` — inserts/updates sin capturar `.error`.
**Recomendación:** chequear `.error` con log de contexto; métrica de fallos de persistencia.

### IA-19 ⚪ BAJO — El embed de RAG se llama en cada turno sin cache
**Evidencia:** `jarvis-retrieval.ts:26-30` — POST a la Edge Function `embed` por cada mensaje; sin caché de embeddings de queries frecuentes.
**Recomendación:** caché LRU por hash de query (TTL); considerar batch.

### IA-20 ⚪ BAJO — El historial se re-envía desde el cliente sin verificación server-side
**Evidencia:** `route.ts:209,269-272` — el `history` que arma el prompt viene del `body.messages`, no de la BD. Un cliente puede inyectar mensajes `assistant` falsos para jailbreak del system (no cruza empresas).
**Recomendación:** para conversaciones con `conversationId`, reconstruir el historial desde `ai_messages` server-side.

---

## §5 · Cron y emails

> Además de T6 (escalabilidad del cron).

### CRON-3 🟠 ALTO — No es idempotente: el digest se duplica si el cron corre dos veces
**Evidencia:** `route.ts:196-197` lo admite en comentario ("el cron corre una sola vez al día"). Las secciones A (72h) y C (ciclo) tienen dedup vía `notifications`; el digest (sección B) no.
**Impacto:** cualquier segunda invocación (retry de Vercel, timeout parcial de T6, re-ejecución manual) manda el digest duplicado a todos los arquitectos. **Bloquea** la mitigación del timeout (no se puede reintentar con seguridad).
**Recomendación:** registrar el envío del digest (fila `type:'daily_digest'` con dedup por `(user_id, fecha local)` o tabla `email_log`). Prerequisito de cualquier arquitectura con retries.

### CRON-4 🟠 ALTO — Errores de DB silenciados: el cron puede devolver `ok:true` sin haber hecho nada
> ✅ **Resuelto (2026-07-13):** cada empresa corre en su try/catch (un fallo no tumba a las demás), se cuenta `stats.errors` y el endpoint devuelve `ok:false` si hubo errores. La query de companies también chequea su error.
**Evidencia:** todas las queries destructuran solo `{ data }` e ignoran `error` (`route.ts:47,55,74,85,97,131,206,244`); sin `try/catch` por empresa. supabase-js no lanza: si `companies` falla, es `null`, el loop itera 0 veces y responde `{ ok:true, companies:0 }`.
**Impacto:** falsos éxitos invisibles; un fallo de red/RLS produce un día sin notificaciones sin señal.
**Recomendación:** chequear `error` en cada query; `try/catch` por empresa; devolver `ok:false`/500 si hubo errores para que el monitor de cron lo marque.

### CRON-5 🟠 ALTO — Resend sin rate limiting ni reintentos: emails perdidos en silencio
> ✅ **Resuelto (2026-07-13):** `sendEmail` reintenta hasta 3 veces ante 429, respetando el header `retry-after` (backoff). Type-check OK. Pendiente opcional: endpoint batch de Resend para digests.
**Evidencia:** `email.ts:114-148` — un solo `fetch` sin manejo de 429, sin backoff, sin retry. En el cron el fallo solo deja de sumar al contador (`route.ts:126,194,271`).
**Impacto:** el rate limit default de Resend es **2 req/s**; el cron dispara en ráfaga → 429 inevitables, cada uno = email perdido sin registro.
**Recomendación:** detectar `429` y reintentar con backoff; throttle global 2 req/s; usar el endpoint batch de Resend (`/emails/batch`, hasta 100) para digests; registrar cada fallo (CRON-10).

### CRON-6 🟠 ALTO — Dedup 72h: sin índice que la soporte y con carrera check-then-insert
> 🟡 **Parcial (2026-07-13):** `migration_fase3_cron_dedup_index.sql` agrega el índice `(type, href, created_at)` que soporta el count de dedup. **Pendiente:** la carrera check-then-insert (columna `dedup_key` con unique + upsert) — se resuelve junto con el refactor T6.
**Evidencia:** `route.ts:85-91` hace `count exact` por `(type, href, created_at)`; los únicos índices de `notifications` son `(user_id, read_at)` y `(user_id, created_at)` (`migration_sprint13_notifications.sql:19-24`).
**Impacto:** cada tarea vencida ejecuta un count que degenera en seq scan sobre una tabla que solo crece; el check-then-insert no es atómico (retry duplica).
**Recomendación:** índice `(type, href, created_at)`, o mejor columna `dedup_key` con unique parcial + `upsert … ignoreDuplicates` (atómico, idempotente).

### CRON-7 🟠 ALTO — Un solo cron a las 11 UTC: el digest matinal llega de noche fuera de LatAm
**Evidencia:** `vercel.json:5` (`"0 11 * * *"`); los helpers `localISODate`/`localWeekday` (`route.ts:285-305`) calculan bien el **día** local por timezone, pero la **hora** de envío es global: 11 UTC = 6:00 Bogotá (bien), 13:00 Madrid, 20:00 Tokio, 23:00 Auckland. En UTC+13 el cron corre a las 00:00 local → "War Up de hoy no iniciado" es falso positivo.
**Impacto:** hoy con clientes solo en LatAm funciona; se rompe con el primer cliente europeo/asiático.
**Recomendación:** cron **horario** (`0 * * * *`) + filtrar empresas cuya hora local sea la ventana objetivo. Combina con el fan-out de T6 (cada corrida procesa ~1/24 de las empresas).

### CRON-8 🟡 MEDIO — El fallback a env anula el kill-switch del admin y puede enviar con credenciales/remitente viejos
> ✅ **Resuelto (2026-07-13):** si la fila `email_config` existe y `enabled=false`, `sendEmail` no envía (aunque haya env vars). El fallback a env queda solo para fila inexistente / DB caída.
**Evidencia:** `email.ts:21-49` — `resolveMail()` parte de `process.env.RESEND_API_KEY/RESEND_FROM` y solo los pisa si `email_config.enabled === true`; el `catch` (`:45-47`) es silencioso.
**Impacto:** poner `enabled=false` en `/correo` **no** apaga el envío; una key rotada en Vault pero con env vieja en Vercel sigue enviando con la key revocada y otro `from` (rompe SPF/DKIM de `send.stlabs.ar`).
**Recomendación:** si existe fila `email_config` y `enabled===false` → **no enviar**; reservar el fallback a env solo para "fila inexistente". Loguear la fuente usada. Documentar borrar `RESEND_*` de Vercel tras verificar el panel.

### CRON-9 🟡 MEDIO — `resolveMail()` sin cache: 2 round-trips extra (query + RPC Vault) por cada email
**Evidencia:** `email.ts:100` — `sendEmail` llama `resolveMail()` en cada invocación (select a `email_config` + RPC `email_get_secret` contra Vault). Sin memoización.
**Impacto:** en el cron, N emails = 2N queries extra (incluyendo N desencriptaciones de Vault); suma directo al presupuesto de 60s de T6.
**Recomendación:** cache a nivel módulo con TTL 30-60s, o resolver una vez por invocación del cron y pasar la config como parámetro.

### CRON-10 🟡 MEDIO — Observabilidad casi nula: no hay registro de qué se envió, a quién, ni si rebotó
**Evidencia:** solo el objeto `stats` de la respuesta HTTP y `console.error` en fallos. No hay tabla `email_log`, no se persiste el `id` de Resend (`email.ts:145` lo retorna y nadie lo guarda), no hay webhook de bounces/complaints.
**Impacto:** imposible responder "¿le llegó el digest a X?"; los bounces no procesados hunden la reputación del dominio (afecta también invitaciones y magic links de Auth por el mismo dominio) sin señal previa.
**Recomendación:** tabla `email_log (id, to, type, resend_id, status, error, created_at)`; webhook de Resend (`email.bounced`, `email.complained`); monitoreo del cron.

### CRON-11 🟡 MEDIO — Sin unsubscribe ni preferencias de notificación por usuario
**Evidencia:** no existe tabla de preferencias ni header `List-Unsubscribe`; `simpleEmail` (`route.ts:315-348`) solo tiene footer de branding.
**Impacto:** emails recurrentes no solicitados → el destinatario marca spam → complaints contra `send.stlabs.ar` hunden la entregabilidad de todo. Gmail/Yahoo exigen `List-Unsubscribe` one-click para senders de volumen desde 2024.
**Recomendación:** tabla `notification_prefs` chequeada antes de cada envío + header `List-Unsubscribe` + link de baja en el footer.

### CRON-12 🟡 MEDIO — Plantilla HTML duplicada en 5 lugares y remitentes/URLs hardcodeados
**Confirmado por:** Cron (#12), Monorepo (#7).
**Evidencia:** el mismo layout inline está copiado en `route.ts:315-348`, `equipo/actions.ts:14,212`, `creditos/actions.ts:67`, `apps/admin/.../correo/actions.ts:163`. Hardcodeos: fallback `"https://tbm-app.vercel.app"` (`route.ts:320`), `SUPPORT_EMAIL = "tbm@stlabs.ar"` (`lib/credits.ts:10`).
**Recomendación:** módulo compartido de templates (`renderEmail({title, lines, cta})` en `packages/shared` o React Email); hacer que `NEXT_PUBLIC_APP_URL` ausente sea error en prod, no fallback.

### CRON-13 ⚪ BAJO — El digest del domingo puede anunciar un Reporte Semanal viejo
**Evidencia:** `route.ts:149-155` toma el último `weekly_report` sin validar que sea de la semana en curso; `:179-181` lo anuncia si es domingo y existe cualquiera.
**Recomendación:** filtrar `week_start >= inicio de la semana local actual`; normalizar fechas del cálculo de ciclo al mismo huso.

### CRON-15 ⚪ BAJO — SMTP de Supabase Auth gestionado a mano: riesgo de drift al rotar la key (a verificar)
**Evidencia (docs):** `docs/EMAIL_ADMIN_CONFIG.md:170-174` — el SMTP de Auth se carga a mano en el dashboard de Supabase con la API key de Resend; hay dos copias de la credencial (Vault + dashboard) sin sync. Al rotar la key desde el panel, Auth sigue con la vieja y, al revocarla, deja de mandar mails en silencio.
**Recomendación:** key de Resend dedicada para SMTP de Auth con permisos mínimos, o procedimiento de rotación de 2 pasos documentado en `/correo`.
**Estado (2026-07-22):** SMTP de Auth **verificado OK** en el dashboard (Custom SMTP ON, `smtp.resend.com`, sender `noreply@send.stlabs.ar`). El checklist de qué tocar al migrar de dominio / rotar la key vive ahora en `docs/EMAIL_ADMIN_CONFIG.md` §8 "Migración de dominio". El riesgo de drift sigue vigente (dos copias de la key: Vault + dashboard de Auth).

---

## §6 · Créditos y pasarela de pagos

> Además de T3 (bypass del gating). Ver §10 para el diseño recomendado antes de conectar Stripe.

### PAY-2 🟠 ALTO — `grant_credits` no es idempotente: retry o doble submit = doble carga
> ✅ **Aplicada (2026-07-13):** `migration_fase2c_ledger.sql` — `grant_credits` acepta `p_request_id` (unique) → idempotente. Base para el webhook de Stripe. Falta aplicar + pasar el `request_id` desde el código.
**Evidencia:** `migration_fase2_credits.sql:40-74` suma al balance e inserta un tx sin clave de request. Única protección: UI (`grant-form.tsx:59` `disabled={isPending}`).
**Impacto:** server action lento + reintento (refresh, dos pestañas, retry de red) = carga doble sin forma de detectarla salvo leyendo el ledger. **Este agujero se hereda directo al webhook de Stripe** si se reusa la RPC tal cual.
**Recomendación:** `p_request_id uuid` en `grant_credits` + columna `request_id uuid unique` en `credit_transactions`; el form genera el UUID al montar; capturar `unique_violation` → devolver balance actual. El webhook usará `event.id` de Stripe como `request_id`.

### PAY-3 🟠 ALTO — Drift ledger⇄saldo por el clamping `greatest(0, …)`
Ver DB-8 (mismo hallazgo). El ledger deja de ser fuente de verdad contable; sin invariante ni job que lo detecte.

### PAY-4 🟠 ALTO — Preparación para Stripe: no existe ninguna pieza estructural
> 🛠️ **Flujo completo en código (2026-07-13):** schema (`migration_fase4_billing_schema.sql`) + RPC (`migration_fase4_billing_rpc.sql`, `apply_purchase_credits`) + `lib/stripe.ts` (firma HMAC + checkout) + `/api/stripe/webhook` + `startCheckout` + **UI de compra en `/creditos`** (tarjetas de paquete → Checkout). Type-check + lint OK. **Falta solo config/prueba:** aplicar migraciones, cargar `credit_packages`, setear `STRIPE_*`, y probar con Stripe CLI (`stripe listen`).
**Evidencia:** grep de `stripe|checkout|webhook|customer` en `apps/`+`supabase/` → solo docs. No hay `stripe_customer_id` en `companies` (`schema.sql:12-22`), ni tabla de eventos de webhook, ni catálogo precio→créditos, ni moneda, ni orders, ni distinción test/live. Solo el type `'purchase'` reservado como comentario (`migration_fase2_credits.sql:26`) y `platform_admins.role_interno 'finanzas'` decorativo.
**Recomendación:** ver §10 — es la lista de lo que hay que crear **antes** de escribir código de Stripe para no rehacer el motor.

### PAY-5 🟡 MEDIO — Race en `generate_disc_link`: doble request concurrente consume 2 créditos y crea 2 pendientes
**Evidencia:** `migration_fase2_credits.sql:106-134` — el chequeo de pendiente (paso 3) corre antes y fuera del lock; el `FOR UPDATE` solo serializa el saldo. Dos llamadas simultáneas (dos pestañas; el guard `generating` de `equipo-client.tsx:194` es por-tab) doble-cobran. No hay unique parcial (solo `idx_disc_assessments_profile` normal).
**Recomendación:** `create unique index on disc_assessments(profile_id) where status='pendiente'` + capturar `unique_violation` reusando el pendiente ganador.

### PAY-6 🟡 MEDIO — Integridad del ledger débil: `type` texto libre, sin `balance_after`, referencia de consumo floja
**Evidencia:** `migration_fase2_credits.sql:26` (`type` sin CHECK), consumo guarda `ref = p_profile_id::text` (`:129-130`) en vez del `disc_assessments.id` → un movimiento no se ata 1:1 al assessment que pagó (ambiguo con re-tests).
**Recomendación:** `check (type in ('grant','consume','adjust','promo','expire','purchase','refund'))`, `balance_after int not null`, guardar `assessment_id` en consumos.

### PAY-7 🟡 MEDIO — Resolución de `credit_requests` bulk e informal, sin vínculo pedido→transacción ni flujo de rechazo
**Evidencia:** `apps/admin/src/app/(panel)/actions.ts:48-54` — cualquier carga positiva marca `granted` **todos** los pending de la empresa. El estado `'rejected'` existe en el CHECK pero grep de `rejected` en `apps/` → 0 resultados (no hay UI). No se registra qué tx resolvió qué pedido.
**Impacto:** trazabilidad pedido→carga perdida; un pedido no aprobado queda pending para siempre bloqueando nuevos (PAY-8).
**Recomendación:** resolver por `id` de pedido; acción "rechazar"; columna `granted_tx_id uuid references credit_transactions(id)`.

### PAY-8 🟡 MEDIO — Anti-duplicado de `requestCredits` con race (read-then-insert, sin constraint)
**Evidencia:** `(dashboard)/creditos/actions.ts:40-54` cuenta pendings y después inserta; sin unique parcial.
**Recomendación:** `create unique index on credit_requests(company_id) where status='pending'`; tratar `23505` como "ya tenés un pedido pendiente".

### PAY-9 ⚪ BAJO — El ledger es legible por cualquier miembro de la empresa (contradice su comentario)
> ✅ **Aplicada (2026-07-13):** `migration_fase2d_integridad.sql` — la SELECT de `credit_transactions` ahora exige `auth_is_arquitecto()`. Falta aplicar.
**Evidencia:** `migration_fase2_credits.sql:35-37` — la policy es `using (company_id = auth_company_id())` sin `auth_is_arquitecto()`, pese a que el comentario dice "el arquitecto puede ver su propio historial". El mismo repo ya corrigió esto para `credit_requests` (`migration_credit_requests_select_arquitecto.sql:8-11`).
**Impacto:** un colaborador lee montos, motivos y ritmo de compra; con `purchase` y plata real, es info comercial sensible.
**Recomendación:** agregar `and public.auth_is_arquitecto()` a la SELECT de `credit_transactions`.

### PAY-10 ⚪ BAJO — Si falta la service-role key, la carga ocurre pero sin audit ni resolución de pedidos, en silencio
**Evidencia:** `apps/admin/src/app/(panel)/actions.ts:39-54` — `admin?.from("audit_log").insert(...)` y `admin?.from("credit_requests").update(...)` con `admin===null` se tragan ambas escrituras, pero la RPC `grant_credits` (client de sesión) ya acreditó.
**Recomendación:** guard explícito `if (!admin) return { ok:false, error:"sin_service_role" }` antes de la RPC (como ya hace `createLiderAndCompany`), o mover audit+resolución dentro de la transacción.

### PAY-11 ⚪ BAJO — `grant_credits` sin tope de monto y con FK sin manejar
**Evidencia:** `migration_fase2_credits.sql:57-66` valida solo `null/0`; un typo (`100000`) se acredita; un `p_company_id` inexistente revienta con excepción de FK cruda.
**Recomendación:** tope razonable (`abs(p_amount) <= 1000`), `exception when foreign_key_violation then return … 'empresa_inexistente'`.

---

## §7 · Monorepo, frontend y proceso

> Además de T8 (CI + tests + lint).

### ARCH-3 🟠 ALTO — Tipos de `Database` duplicados y divergentes; web no usa `packages/shared`
**Confirmado por:** Monorepo (#3), BD (#19).
**Evidencia:** `packages/shared/src/database.types.ts` (389 líneas, subset manual solo para admin, su header lo admite) vs `apps/web/src/types/database.ts` (2.181 líneas, copia completa). `grep "@tbm/shared" apps/` → solo 3 archivos de **admin**; cero imports desde web. Editado a mano (`supabase/README.md:53-54`).
**Impacto:** cada migración exige editar 2 archivos a mano; si se olvida el de admin, su compilador "aprueba" queries contra un schema viejo.
**Recomendación:** `supabase gen types typescript --linked > packages/shared/src/database.types.ts` (script + check de CI); ambas apps importan de `@tbm/shared`; borrar la copia de web (mover helpers como `SCORECARD_AREAS` a shared/lib).

### ARCH-4 🟠 ALTO — Errores de Supabase silenciados sistemáticamente en data fetching
**Confirmado por:** Monorepo (#4), Cron (#4).
**Evidencia:** `dashboard/page.tsx` (1.304 líneas, ~15 queries): `grep "error"` → 0. Patrón `(data ?? [])`: **99 ocurrencias** en web. `.single()` sin chequear error: **66 usos** (ej. `dashboard/page.tsx:515-520` — un error de infra expulsa al usuario logueado con `redirect("/login")`).
**Impacto:** un fallo de RLS/red/columna se renderiza como "dashboard vacío", indistinguible de "empresa nueva". Sentry no ve errores que nunca se lanzan.
**Recomendación:** helper `unwrap(query)` en shared que loguee a Sentry y derive a `error.tsx`; regla: `?? []` solo con el `error` capturado.

### ARCH-5 🟠 ALTO — Theming a medias: 669 hex hardcodeados en 97 componentes pese a la migración a tokens
**Evidencia:** sistema de tokens correcto y reciente (`globals.css:19-58` + `tailwind.config.ts:13-33`), pero `grep -rEo '#[0-9a-fA-F]{6}'` → **669 en 97 archivos** (top: `onboarding/page.tsx` 31, `login-form.tsx` 22, `equipo-client.tsx` 17), + 61 clases arbitrarias `bg-[#…]`, + inline `style={{}}` en 121 archivos. `theme-flags.ts:4` tiene `LIGHT_THEME_READY = false`.
**Impacto:** la migración quedó al ~60-70%; el modo claro (ya planificado) se romperá visualmente al activarlo.
**Recomendación:** codemod por lotes (los hex mapean 1:1 a tokens existentes) + regla ESLint que congele el stock actual.

### ARCH-6 🟠 ALTO — Clientes Supabase y capa de IA copiados-y-pegados entre apps, ya divergiendo
Ver IA-10 (IA) + este (Supabase). `apps/web/src/lib/supabase/{server,client}.ts` sumaron la lógica "Recordarme" (`remember.ts`) que admin no tiene; `admin.ts` es idéntico salvo el import de tipos.
**Recomendación:** factory de clientes Supabase en `packages/shared` parametrizable por el adapter de cookies; mover `lib/ai` completo.

### ARCH-8 🟡 MEDIO — Admin tiene un sistema de theming totalmente distinto al de web
**Evidencia:** `apps/admin/src/app/globals.css:5-21` usa variables propias (`--bg`, `--accent:#5b8aff`) distintas a los `--c-*` de web; `apps/admin/tailwind.config.ts` conserva la paleta hex pre-migración; estiliza con inline + clases artesanales `.adm-card`/`.adm-input` (`components/ui.tsx:4-10`).
**Impacto:** dos design systems, tres técnicas de estilado; cada cambio de marca se hace N veces.
**Recomendación:** extraer el preset de Tailwind + tokens de web a `packages/` y consumirlo desde admin.

### ARCH-9 🟡 MEDIO — Monolitos client-side de 700–1.600 líneas
**Evidencia:** `onboarding/page.tsx` **1.571** (`"use client"`, mezcla wizard + writes a 4 tablas), `login-form.tsx` **1.000**, `account-form.tsx` **995**, `WarUpRoom.tsx` **961**, `jarvis-panel.tsx` **821**, `task-wizard.tsx` **687**. 110 archivos con `"use client"` en web.
**Impacto:** irreviewables/intesteables como unidad; bundle client inflado.
**Recomendación:** presupuesto blando ~300 líneas/componente; separar por paso de wizard; extraer writes a server actions.

### ARCH-10 🟡 MEDIO — Cascadas de fetching client-side donde correspondería server
**Evidencia:** `dashboard/kpis/page.tsx` es `"use client"` y encadena en `useEffect` `getUser()` → `profiles.select().single()` → `kpis.select()` (3 RTT secuenciales desde el browser) cuando el layout server ya conoce al usuario. Igual en `onboarding/page.tsx:1188-1299`.
**Recomendación:** convertir a RSC que pase datos iniciales a un client component de edición.

### ARCH-11 🟡 MEDIO — El dashboard (RSC) hace ~8 awaits secuenciales evitables
**Evidencia:** `dashboard/page.tsx:507-742` — `profile` → `scorecardRows` → `kpis` → `energyToday` → `Promise.all` (bien) → 4 counts secuenciales más. Es la página más vista.
**Recomendación:** colapsar lo independiente en 1-2 `Promise.all` (solo `profile` es dependencia real).

### ARCH-12 🟡 MEDIO — Higiene del root: restos pre-monorepo y `.env.local` root muerto con TLS deshabilitado
**Evidencia:** en el root viven `next-env.d.ts`, `tsconfig.tsbuildinfo` (144 KB, sin `tsconfig.json` root) y `.next/` — gitignoreados (basura local, pero confunde). `.env.local` en el **root** (Next carga el env de `apps/web`, no del root → el archivo real no se lee) con `NODE_TLS_REJECT_UNAUTHORIZED=0`.
**Recomendación:** borrar los 3 restos; mover `.env.local` a `apps/web/`; crear `apps/admin/.env.local.example`; eliminar el flag TLS (usar `NODE_EXTRA_CA_CERTS` si hay proxy).

### ARCH-13 🟡 MEDIO — Admin sin observabilidad (web tiene Sentry + PostHog; admin nada)
**Evidencia:** `apps/web/package.json:13,22` (`@sentry/nextjs`, `posthog-js`) + `next.config.mjs:45`; `apps/admin` no tiene ninguno. Admin ejecuta operaciones service-role sensibles (créditos, suspensiones, config de email/IA).
**Recomendación:** mismo `withSentryConfig` en admin con DSN de un segundo proyecto Sentry.

### ARCH-14 ⚪ BAJO — Root `package.json` no orquesta admin ni shared; scripts duplicados; sin turborepo
> ✅ **Resuelto (2026-07-13).** Root `package.json`: `+dev:admin`, `+build:admin`, `type-check --workspaces --if-present` (web+admin), `+lint`. Turborepo sigue opcional a esta escala.

**Evidencia:** `package.json:10-15` — todos los scripts apuntan a `-w tbm-app`; `build` y `build:web` idénticos; sin `dev:admin`/`build:admin`/`type-check` global. Admin solo se buildea implícitamente en Vercel.
**Recomendación:** agregar `dev:admin`, `build:admin`, `type-check: --workspaces --if-present`. Turborepo opcional; el CI (T8) no.

### ARCH-15 ⚪ BAJO — Config de deploy de admin no versionada
**Evidencia:** único `vercel.json` es el de web (cron). El proyecto `tbm-app-admin` existe solo en el dashboard de Vercel. Envs duplicadas entre proyectos (no verificable desde el repo).
**Recomendación:** `apps/admin/vercel.json` documental + documentar envs por app.

### ARCH-16 ⚪ BAJO — Documentación desactualizada y tsconfigs clonados sin base compartida
**Evidencia:** `README.md:3` dice "Next.js 14" (real: 16.2.6). `apps/web/tsconfig.json` y `apps/admin/tsconfig.json` idénticos línea por línea (ambos `strict:true`, correcto) pero sin `tsconfig.base.json`; `packages/shared` sin tsconfig propio.
**Recomendación:** `tsconfig.base.json` en root + `extends`; actualizar README.

---

## §8 · Plan de remediación por fases

El orden está pensado para **cerrar primero lo que sangra plata o datos, y montar la red de contención antes de refactorizar**. Cada fase es acumulativa.

### Fase 0 — Contención inmediata — ✅ COMPLETA (migración aplicada 2026-07-13 · código en `develop`)
Cosas que se explotan hoy o que impiden verificar el resto. Casi todo son migraciones pequeñas.
1. 🛠️ **T1** — trigger en `profiles` que congela `role`/`company_id` (autocontenido, sin tocar código). *La grieta multi-tenant.* → **en `migration_fase0_hardening.sql`, falta aplicar.**
2. 🛠️ **T3** — dropear policies write de `disc_assessments` + revoke. *Bypass de créditos.* → **misma migración, falta aplicar.**
3. ✅ **T2** — `lib/trusted-origin.ts`: origin de confianza en invitaciones (`equipo/actions.ts` + `/api/jarvis`). *Robo de token.*
4. 🛠️ **T5** — default `role='colaborador'` + `handle_new_user` + fix de datos. → **misma migración, falta aplicar.**
5. ✅ **T7 (mínimo)** — kill-switch `DC_KILL_SWITCH` + tope `DC_COMPANY_MONTHLY_LIMIT` por empresa/mes en `/api/jarvis`.

> ✅ **Fase 0 aplicada (2026-07-13):** `migration_fase0_hardening.sql` corrió sin errores. Código (T2+T7) en `develop`. **Pendiente:** smoke test del onboarding (register + accept-invite) tras el trigger de T1.

### Fase 1 — Red de contención y verificabilidad (semana 1-2) — 🟡 EN CURSO (2026-07-13)
Sin esto, los refactors siguientes son a ciegas.
6. ✅ **T8** — CI en GitHub Actions (type-check web+admin + Vitest, gates; lint informativo) + ESLint flat config + primeros tests + scripts de root. **Pendiente:** `next build` en CI + ESLint en admin + limpiar 29 errores de lint.
7. 🔒 **T4** — `supabase link` + `db diff` → baseline en `supabase/migrations/`. **Bloqueado: requiere conexión viva a Supabase (MCP no autenticado en esta sesión).**
8. 🔒 **ARCH-3 / DB-19** — `supabase gen types` a `@tbm/shared`. **Bloqueado: requiere conexión viva a Supabase.**

### Fase 2 — Solidez del aislamiento y de los datos — ✅ MIGRACIONES APLICADAS (2026-07-13)
Cuatro migraciones en `supabase/` (idempotentes), cada una en su commit:
9. 🛠️ **DB-4/5/6** (`migration_fase2b_policies_aislamiento.sql`) — policies por comando + autoría en INSERT + borradores de feedback privados + DELETE de arquitecto. **DB-7** (RPC `accept_invitation`) queda pendiente (ya mitigado en parte por el trigger de T1). UPDATE conservador (ver nota en el archivo).
10. 🛠️ **DB-8 / PAY-2/3/6/5/11** (`migration_fase2c_ledger.sql`) — `grant_credits` idempotente + no-negativo + tope; `request_id`/`balance_after`/CHECK de type; `ref`=assessment_id; unique de pendiente por perfil. Falta el lado código (pasar `request_id`).
11. 🛠️ **DB-9** (`migration_fase2a_indices.sql`) — índices sobre `company_id` y FKs. **DB-10** parcial: las policies reescritas en 2B usan `(select …)`; el resto de la RLS legacy queda por optimizar.
12. 🛠️ **DB-19 + PAY-9** (`migration_fase2d_integridad.sql`) — uniques de negocio (baseline, kpis, leading_indicators) + ledger solo-arquitecto. **DB-13** (ver compañeros) y **DB-16** (CHECKs de dominio) quedan fuera: el primero choca con la privacidad del DISC (necesita vista), el segundo requiere confirmar dominios con la app.

> ✅ **Fase 2 aplicada (2026-07-13):** las 4 migraciones corrieron sin errores. **Pendiente:** smoke test de las policies nuevas (crear Roca/Feedback/Workbook) y confirmar que `grant_credits` (firma nueva) sigue acreditando desde el admin.

### Fase 3 — Escalabilidad operativa (semana 3-5) — 🟡 EN CURSO (2026-07-13)
13. 🟡 **CRON** — hechos los fixes quirúrgicos de robustez: **CRON-1** (sin cap de 100), **CRON-4** (try/catch por empresa + `ok:false` si hay errores), **CRON-14** (secreto timing-safe). **Pendiente el refactor arquitectónico T6** (dispatcher + worker, cron horario) y **CRON-3/5/6** (dedup del digest, backoff de Resend, índice de dedup) — necesitan capacidad de test / cambio de infra.
14. ⬜ **CRON-10, CRON-11** — `email_log` + webhook de bounces + `notification_prefs` + `List-Unsubscribe`. Pendiente.
15. ✅ **IA-3/4/5/15** — idle-timeout en el stream (openrouter+anthropic), errores por status, prompt tokens estimados. **IA-6** (cache del contexto) pendiente.
16. ⬜ **DB-14, DB-15** — retención de tablas + denormalizar `user_id` en `ai_messages`. Pendiente.

### Fase 4 — Preparación para pagos y consolidación (antes de conectar Stripe)
17. 🛠️ **PAY-4 + §10** — flujo de pagos completo en código (schema + RPC + `lib/stripe.ts` + `/api/stripe/webhook` + `startCheckout` + UI de compra en `/creditos`). **Falta solo:** aplicar migraciones, cargar paquetes, setear `STRIPE_*` y probar con Stripe CLI.
18. **ARCH-6, IA-10, CRON-12** — unificar clientes Supabase, capa de IA y templates de email en `packages/shared`.
19. **ARCH-5, ARCH-8** — terminar el theming (codemod de hex) y unificar el design system de admin; activar `LIGHT_THEME_READY`.
20. **ARCH-9, ARCH-10, ARCH-11, ARCH-13** — romper monolitos, mover fetching a server, Sentry en admin.

Los BAJO restantes se van resolviendo oportunísticamente al tocar cada área.

---

## §9 · Lo que ya está bien (no romperlo)

Para calibrar: el proyecto tiene decisiones acertadas que conviene preservar y **usar como patrón** al remediar.

- **Secretos en Vault correctamente aislados:** `ai_get_api_key`/`email_get_secret` con `REVOKE … FROM public, anon, authenticated` + `GRANT … TO service_role`; las keys se resuelven solo server-side, nunca se serializan al cliente. No hay secretos con `NEXT_PUBLIC_`.
- **Patrón "RLS on + cero policies + revoke all"** en `platform_admins`, `audit_log`, `ai_config`, `email_config`, `knowledge_chunks` — solo service-role llega. `is_platform_admin()` es `SECURITY DEFINER` no escalable desde el cliente.
- **Motor de créditos bien modelado de base:** balance cacheado + ledger append-only; `generate_disc_link` descuenta con `SELECT … FOR UPDATE` (atómico) y valida el tenant del caller. Solo falla en los bordes (clamp, idempotencia).
- **`fix_rls_recursion.sql`** resolvió correctamente la recursión con helpers `SECURITY DEFINER` + `search_path=''`.
- **Rate-limit del asistente en BD** (no en memoria) → funciona multi-instancia serverless. Su debilidad es de diseño (per-user, no per-company), no de implementación.
- **RAG sin fuga cross-company:** `match_knowledge` con `p_company_id null` devuelve solo `scope='global'`; `buildJarvisContext` usa el cliente RLS del usuario.
- **DISC por token** de 64 hex no enumerable; escritura vía RPC autorizada por el token.
- **No hay `ignoreBuildErrors`/`ignoreDuringBuilds`** en ningún `next.config.mjs`; `strict:true` en ambos tsconfigs; una sola versión de Next/React/TS en el lockfile.
- **Auth de base sólida:** middleware de web con carve-out documentado para el cron; cron protegido por `CRON_SECRET` que falla cerrado sin env; clientes service-role aislados server-side; el alias `@/` scoped por app (sin cross-imports accidentales).
- **Índice parcial `notifications_user_unread`** y el HNSW de pgvector bien elegidos; el dashboard es RSC.

---

## §10 · Diseño recomendado antes de conectar la pasarela de pagos

Stripe está en el roadmap (`docs/GODMODE_Y_ROADMAP_STARTUP.md`) pero **nada estructural existe** (PAY-4). Estos son los cambios de schema/arquitectura a hacer **antes** de escribir la primera línea de Stripe, para no rehacer el motor de créditos:

1. **Cerrar el bypass (T3) primero.** El gating solo vale si la RPC es el único camino de escritura a `disc_assessments`. Cobrar por algo salteable no tiene sentido.
2. **Idempotencia como primitiva del ledger (PAY-2).** `credit_transactions.request_id uuid unique` + `grant_credits(p_request_id)`. El webhook usará `event.id`/`checkout_session.id` como `request_id` → misma RPC, cero código nuevo de acreditación.
3. **Tabla `webhook_events`** (`id text primary key` = event id de Stripe, `type`, `payload jsonb`, `status`, `processed_at`): insertar-primero con la PK como candado de idempotencia, procesar después. Reintentos de Stripe → no-op.
4. **`billing_customers`** (o columnas en `companies`): `company_id`, `stripe_customer_id unique`, `livemode boolean`. Separar test/live desde el día 1 para no contaminar datos productivos con compras de prueba.
5. **Catálogo `credit_packages`:** `id`, `stripe_price_id`, `credits int`, `currency`, `active`. El mapping precio→créditos vive en la DB (no hardcodeado); el webhook resuelve `price_id → créditos` sin deploy.
6. **Tabla `purchases`/orders:** `company_id`, `package_id`, `stripe_session_id unique`, `amount_cents`, `currency`, `status (pending|paid|refunded)`, `credit_tx_id`. La conciliación pagos⇄créditos es un JOIN, no arqueología.
7. **Endurecer el ledger (DB-8/PAY-3/PAY-6):** CHECK de `type` (+ `refund`), `balance_after`, prohibir saldo negativo, job de reconciliación `sum(delta)=balance` por empresa, y columna `product text default 'disc'` si van a coexistir créditos DISC e IA (ALTER barato hoy, migración dolorosa después).
8. **Flujo de refund:** `refund` como type con `request_id` = refund id de Stripe; decidir qué pasa si ya consumió los créditos reembolsados (permitir saldo cero + marca en `purchases`).
9. **Reusar `credit_requests` como puente comercial:** pedido → link de checkout (en vez de carga manual), con `granted_tx_id`/`purchase_id` para trazabilidad (PAY-7).
10. **Operativa:** firmar webhooks (`STRIPE_WEBHOOK_SECRET`) y procesarlos con service-role fuera de RLS; claves test/live en envs separados de Vercel; el rol `finanzas` de `platform_admins.role_interno` (hoy decorativo) como gate real para refunds/ajustes.

---

*Auditoría generada por 6 análisis paralelos verificados contra el código. Cada hallazgo cita `archivo:línea`. Los marcados "a verificar" requieren consultar el estado vivo de la BD (el MCP de Supabase no pudo autenticarse en esta sesión no interactiva).*
