# PROGRESS — The Business Multiplier App

> **Fuente de verdad del estado del proyecto, sprint por sprint.**
> Mantenelo actualizado en cada PR o commit que cierre/abra una pieza de un sprint.
> Plan completo: [`docs/SPRINTS.md`](docs/SPRINTS.md) (incluye CHANGELOG v1.1).
> Feedback del cliente jun-2026 (post-S17, para implementar): [`docs/OBSERVACIONES_DILIO_2026-06.md`](docs/OBSERVACIONES_DILIO_2026-06.md).
> Panel de plataforma + roadmap de startup (god mode, créditos, Stripe, métricas): [`docs/GODMODE_Y_ROADMAP_STARTUP.md`](docs/GODMODE_Y_ROADMAP_STARTUP.md).

**Última actualización:** 2026-06-19 · **Completitud:** 🎉 **TODO el código de S0–S17 está implementado** · **Última pieza cerrada:** S17.D (bienvenida cinemática JARVIS). Lo que queda es configuración/operación (ver "Pendientes para beta").

> **Novedades 2026-06-16:**
> - **Pasada mobile-first completa** (no era un sprint): la app pasó de desktop-only a usable en celular — sidebar→drawer con hamburguesa, login responsive, inputs 16px (fin del zoom de iOS), wrappers de página con `clamp()`, HeroStrip 2×2 y tour móvil propio. Desktop quedó idéntico.
> - **Login en producción arreglado**: la `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Vercel estaba corrupta (espacio al pegar la JWT) → `UNAUTHORIZED_INVALID_API_KEY`. Se cambió a la publishable key `sb_publishable_...` (corta, a prueba de corrupción).
> - **Las 5 migraciones ⏳ ya estaban aplicadas** (verificado por MCP el 2026-06-16): existen `process_assets`, `notifications`, `tour_completed`, `coach_assignments`/`coaching_notes`, `multiplicador_diagnostics`. El item #1 de "Pendientes para beta" queda cerrado.
> - **Advisors Supabase revisados** (2026-06-16): 0 ERROR de seguridad (todas las tablas con RLS). Pendientes solo de hardening/escala — ver "Hardening Supabase (pre-beta)".

---

## Estado por sprint

Leyenda · ✅ Completo · 🟡 Parcial · ❌ Pendiente · 🚫 No iniciado (ops)

| Sprint | Tema | Estado | Notas |
|---|---|---|---|
| **S0** | Setup & Auth | ✅ | App en Vercel · auth + 2 tipos de usuario (Alumno/Independiente). |
| **S1** | Onboarding + Dashboard | ✅ | Diagnóstico + Naming v1.1. El pendiente "Dashboard con datos reales" se cerró en S12. |
| **S2** | Rituales | ✅ | Pre-game · Los 5 Grandes · War Up Realtime · Cool Down + Reporte Semanal automático · Parking Lot · Config. |
| **S3** | Mi Equipo (DISC + LOS + Matriz) | ✅ | DISC + LOS + Matriz Autoridad + Cruces Peligrosos · rediseño RPG gamificado. |
| **S4** | Delegación | ✅ | Wizard Pase de Estafeta (5 puntos) · Kanban · Vista colaborador · Escudo Anti-Boomerang. |
| **S5** | Feedback S.E.C. | ✅ | Templates S/E/C por perfil DISC · Sesiones Escape · 3 Streaks. |
| **S6** | Plan 90D + BOS + Activos | ✅ | Rocas + Leading Indicators + Disagree & Commit + L4 YoY + **Activos del Sistema** (tab en /plan-90d: `process_assets` con categorías, links video/doc, dueño y estado — migración `sprint12_activos`, ⏳ aplicar en Supabase). |
| **S7** | Workbooks S1–S4 | ✅ | 4 sesiones digitalizadas + desbloqueo híbrido (7 días o "avance anticipado"). |
| **S8** | Workbooks S5–S8 | ✅ | 4 sesiones + 16 ejercicios + componente `counter_tracker` + vista "Mi Programa" (`/workbooks/mi-programa`) con timeline 8 sesiones + comparativa scorecard baseline vs último (Día 1 vs Hoy). |
| **S9** | Polish + Exportación + Super Coach | ✅ | **Panel Super Coach** (N1): 3 capas en `/super-coach`, seguridad por asignación explícita (`coach_assignments`, solo-lectura, Pre-game/Cool Down excluidos) — migración `sprint15` ⏳. **Emails cron**: `/api/cron/daily` (Vercel Cron 11:00 UTC) con digest matinal + `task_overdue` (cierra S4 E7) — inerte hasta setear envs en Vercel. **Exportación PDF**: `/export/{diagnostico,plan-90d,equipo,semana}` con vista documento + print stylesheet; accesos desde ⌘K y el reporte semanal. |
| **S10** | Beta cerrada | 🚫 | Tarea operativa, fuera de código. |
| **S11** | Tour guiado | ✅ | `driver.js` instalado · `tour-steps.ts` con flujos por rol (arquitecto/colaborador) · `TourProvider` en layout con auto-arranque la primera vez + marca `tour_completed` al cerrar · `data-tour` en sidebar/semáforos/avatar · popover con design system en globals.css · "Ver tour de nuevo" en /cuenta (sección Ayuda) · migración `sprint14_tour` (⏳ aplicar; el layout degrada con gracia si la columna no existe). |
| **S12** | Dashboard 100% funcional | ✅ | `/diagnostico` re-eval (pre-cargada) · tendencia histórica real por área · rituales de hoy con estado real (done/live/upcoming + CTA links) · Hero Strip real (Ciclo 90D desde baseline, racha Pre-game, promedio+delta diagnóstico, equipo activo hoy con avatares DISC). |
| **S13** | Hero Strip interactivo | ✅ | HeroStrip extraído a client component (`hero-strip.tsx` + `tile-tooltip.tsx`): tiles clickeables con hover ring + tooltips (ciclo/fechas, racha 7 días + mejor racha, Multiplicador proxy fase A con badge Multiplicador/Disminuidor, panel de energía por miembro con ⚠ sin registrar). |
| **S14** | Búsqueda ⌘K + Notificaciones | ✅ | Command Palette custom (⌘K/Ctrl+K, módulos + quick actions por rol) · tabla `notifications` (migración `sprint13`, ⏳ aplicar) · badge real + panel dropdown + `/notificaciones` · eventos: task_assigned, task_blocked, task_done, war_up_started · fix EnergySelector (error + revert). Pendiente menor: `task_overdue` necesita cron (S4 E7) y `scorecard_updated` no tiene emisor no-arquitecto. |
| **S15** | Cierre Migración Supabase | ✅ | Proyecto nuevo en prod (`fozhnfxehbbgqaerprgf`) + SMTP propio + recovery tooling. |
| **S16** | Mejoras y Correcciones (Mi Equipo) | ✅ | 19 bugs resueltos: 4 ALTA + 9 MEDIA + 6 BAJA del módulo Mi Equipo. |
| **S17** | Multiplicador (M8) + JARVIS + Re-tour | ✅ | **17.C Multiplicador** real: `/multiplicador` deja de ser redirect → diagnóstico ROI de Talento (3 Pecados /36 + banda + 3 Herramientas + historial), tabla `multiplicador_diagnostics` (migración `sprint17`, ⏳ aplicar), guard arquitecto. **17.A JARVIS**: saludo contextual en login fresco (`welcome-greeting.tsx`, flag localStorage, descartable/apagable). **17.B Re-tour**: "Ver tour de nuevo" en Command Palette + botón ayuda en sidebar, hook compartido `use-restart-tour`. **17.D Bienvenida cinemática JARVIS**: overlay full-screen en login fresco (cover → typewriter con briefing real + chime Web Audio → reveal → el orbe "vuela" al header con `layoutId` de Motion y queda persistente como adelanto del asistente IA S18). Reemplaza `welcome-greeting.tsx` (borrado) → **resuelve el saludo doble**. Stack: `motion` + CSS; coordinación orbe overlay↔header vía store liviano (`jarvis-store`); respeta `prefers-reduced-motion`. ⏳ Diferido: retos interactivos del Multiplicador (contador 3 días / experimento 48h). |

---

## CHANGELOG v1.1 — checklist específico

| Ref | Cambio | Estado | Sprint |
|---|---|---|---|
| I4 | Naming "Team Performance Scorecard" sólo para módulo S7 (KPI individual); el diagnóstico 8 áreas se llama "Diagnóstico Organizacional TBM" | ✅ | S1/S7 |
| I2/I3 | Los 5 Grandes = ritual nocturno (≠ Pre-game matutino) | ✅ | S2 |
| B3 | Módulo "Activos del Sistema" (repositorio de procesos) | ✅ | S6 |
| B4 | Cool Down del viernes genera Reporte Semanal automático | ✅ | S2 |
| L1 | War Up en vivo (sala digital, Supabase Realtime) | ✅ | S2 |
| L3 | Desbloqueo híbrido de workbooks (7 días + botón anticipado) | ✅ | S7 |
| L4 | Indicador financiero YoY + ciclo continuo 90D | ✅ | S6 |
| N1 | Panel Super Coach 3 capas | ✅ | S9 |
| N2 | Tipo de acceso Alumno TBM vs Independiente | ✅ schema | S0 |

---

## Roadmap por fases (lo que viene)

> Reorganización estratégica (2026-06-16). Reemplaza las viejas listas sueltas de
> "Pendientes para beta" + "Roadmap God Mode": ahora todo lo que queda (operativo +
> backlog de Dilio + plataforma/god-mode) está ordenado en **5 fases por valor de
> negocio y dependencias**, no por número de sprint. Tablero visual privado:
> `_local/sprints-dashboard.html`. Detalle del god-mode:
> [`docs/GODMODE_Y_ROADMAP_STARTUP.md`](docs/GODMODE_Y_ROADMAP_STARTUP.md);
> backlog de Dilio: [`docs/OBSERVACIONES_DILIO_2026-06.md`](docs/OBSERVACIONES_DILIO_2026-06.md).
>
> **Migraciones:** las 5 ⏳ ya están aplicadas (verificado por MCP el 2026-06-16).

### Fase 0 — Tapar huecos (días, no semanas)
*No depende de nada; se hace en la app actual.*
- ✅ **Cerrar el registro público** (2026-06-17) — `/register` cerrado en 3 capas:
  link "Crear cuenta" quitado del login (`login-form.tsx`), `/register/page.tsx`
  redirige incondicionalmente a `/login`, y `/register` sacada de las rutas públicas
  del `middleware.ts`. Alta solo por invitación (`/accept-invite`, intacto).
  `register-form.tsx` se conserva para reuso del admin (Fase 2 / A1·adm). *Seguridad ALTA.*
- ✅ **Activar el cron de emails** (2026-06-17) — env vars seteadas en Vercel Production
  + **fix de middleware** (`90766b4`): el middleware 307-redirigía `/api/cron/daily` a
  `/login` en el Edge de Vercel (no traía sesión) → el job nunca corría. Se excluyó
  `/api/` del redirect de sesión (se autentica con `CRON_SECRET`). Verificado en prod:
  `GET /api/cron/daily` con bearer → `200 {"ok":true,...}`; sin bearer → `401`. Habilita
  digest matinal + alerta 72h + `task_overdue` (S4 E7), corre 11:00 UTC. **Modo test:**
  `RESEND_FROM = onboarding@resend.dev` solo entrega al mail dueño de la cuenta Resend →
  verificar dominio propio antes de la beta para que lleguen a los líderes.

### Fase 1 — Lanzar la beta (validar el método)
*Validar antes de construir el cobro; instrumentar analytics acá da datos para la Fase 4.*
- ✅ **Cuenta de Dilio + asignar coach** (2026-06-18) — cuenta de coach dedicada
  `dilio@stlabs.ar` (`role=coach`, sin empresa) asignada a "The Business Multiplier" vía
  `coach_assignments`. Code (`b48a980`): un coach sin empresa se rutea a `/super-coach` en
  vez de caer en `/onboarding`/dashboard vacío; `ROLE_LABEL.coach`. También se creó la
  cuenta de arquitecto DC Donado (`tbm@stlabs.ar` → The Business Multiplier). **Falta:**
  sumar pilotos como nuevas asignaciones.
- 📊 **Tablero de sprints publicado** (fuera de scope de fases) — `_local/sprints-dashboard.html`
  (master privado) copiado a `public/roadmap-tbm-<token>.html`, servido con URL oculta +
  `noindex` + badge "en vivo" (reloj local). Middleware excluye `.html` del redirect de auth.
- **S10 — Onboarding de 3–5 pilotos** (mentored, gratis → sin billing aún). *(Demo:
  `tbm@stlabs.ar` / "The Business Multiplier" NO cuenta como piloto; pilotos reales se
  crean al arrancar la beta. Con coach + arquitecto + 1 colaborador alcanza para validar.)*
- 🟡 **Instrumentar PostHog + Sentry** — **código HECHO y deployado** (`984c2b8`), inerte
  sin keys (gateado por env, build verificado). Provider + pageviews + identify (sin PII) +
  10 eventos del funnel + Sentry (instrumentation + global-error). **PENDIENTE: activar
  (crear cuentas + env vars en Vercel + redeploy).** Pasos guardados abajo en
  [**"Pendiente: activar PostHog + Sentry"**](#pendiente-activar-posthog--sentry).
- **Quick-wins de Dilio sin bloqueo** — A1 recordatorio de "armá el próximo ciclo"
  (reusa cron + notificaciones); A3.1 checklist de hábitos del Pre-game.
- 📧 **Email server disponible** *(Sebas, 2026-06-19)* — desbloquea el dominio propio para
  los emails del cron (hoy en modo test `onboarding@resend.dev`). **PENDIENTE: definir
  Camino A (verificar dominio en Resend → cambiar `RESEND_FROM`, sin código) vs Camino B
  (reescribir `email.ts` a SMTP propio con nodemailer).** Falta confirmar dominio/proveedor.
- 🐛 **S16 Mejora #4 — Naming LOS → LOST** *(confirmado por Sebas 2026-06-19)* —
  la metodología es **LOST** (con T), no "LOS". Bug de copy en UI/tour/docs que
  confunde el marco completo con los niveles de autonomía N1–N5. **Corregir pronto:**
  barrido de textos visibles al usuario; **no** renombrar `los_level` / tablas SQL
  hasta definir naming canónico con Dilio. Detalle: [`docs/SPRINTS.md`](docs/SPRINTS.md)
  → Sprint 16, Mejora #4.

### Fase 2 — Monetizar (panel god-mode + créditos)
*Recién acá el cobro. Decidido: monorepo, misma DB Supabase, 1 crédito = 1 DISC.*
- **A0** — Reestructurar a monorepo (`apps/web` + `apps/admin` + `packages/shared`),
  2 proyectos Vercel, subdominio admin. *Base técnica.*
- **A1·adm** — `platform_admins` + `is_platform_admin()`, login admin con MFA,
  formaliza el cierre de registro, listado de empresas.
- **A2** — Crear líderes + invitaciones desde admin; editar datos sensibles; CRUD
  usuarios; alta de coaches; audit log base.
- **A3** — Créditos (saldo + ledger append-only) + **gating del DISC por créditos** +
  carga manual/descuentos. *(reemplaza E1 parte 1)*
- **A4** — Stripe: compra de créditos por el líder + webhooks → ledger + cupones +
  Stripe Tax. *(reemplaza E1 parte 2)*

### Fase 3 — Producto profundo (con insumos de Dilio)
*Agrupa lo bloqueado por material que tiene que pasar Dilio.*
- **B3+B4** — DISC: las 3 gráficas clásicas (natural/adaptado/combinado). Feature
  grande, sesión dedicada. *Bloqueado por Dilio (material modelo).*
- **A3.2** — Meditaciones del Pre-game (365). *Bloqueado por Dilio.*
- **B2** — Recomendaciones IA personalizadas DISC. *Bloqueado por Dilio (docs maestros).*
- **C1** — Claridad conceptual / naming LOST. *Mapa visual del sistema bloqueado por
  Dilio (presentaciones).* El barrido de copy **LOS → LOST** en UI ya está ticketizado
  como S16 Mejora #4 (quick-win, sin bloqueo).

### Fase 4 — Escala y venta (startup vendible)
*Lo que un comprador/inversor revisa en due diligence.*
- **A5** — Dashboard de métricas de la startup: ingresos/MRR, KPIs de uso, tiempo,
  país (con datos de PostHog de la Fase 1).
- **A6** — Enterprise readiness: export/borrado GDPR, planes/feature flags, roles
  internos del admin, camino SOC2 / SSO-SAML, leaked-password (requiere Supabase Pro).

---

## Pendiente: activar PostHog + Sentry

> Código ya implementado y deployado (`984c2b8`), **inerte sin keys**. Esto es solo la
> activación operativa: crear las cuentas y cargar env vars en Vercel + redeploy.
> Las vars están documentadas en `.env.local.example`.

**PostHog (analítica):**
1. Cuenta free en posthog.com → elegir región (US/EU).
2. Project Settings → **Project API Key** (`phc_...`).
3. Host: US `https://us.i.posthog.com` / EU `https://eu.i.posthog.com`.
4. Vercel (Production): `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
5. **Redeploy** (las `NEXT_PUBLIC_*` se inyectan en build).
6. Verificar: app → PostHog → Live events (`$pageview` + eventos; persona con role/company_id).
   *Tip: poner la key solo en Vercel (prod), no en `.env.local`, para no ensuciar con datos de dev.*

**Sentry (errores):**
1. Cuenta free en sentry.io → nuevo proyecto **Next.js** → copiar **DSN**.
2. Anotar **org slug** + **project slug**; (opcional) **Auth token** (scope `project:releases`) para source maps.
3. Vercel (Production): `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
4. **Redeploy.** Los SDK solo reportan en `NODE_ENV=production` → verificar en prod (forzar un error → Sentry Issues).

**Email server / dominio propio (cron):** ver bullet 📧 en Fase 1. Camino A (verificar
dominio en Resend → `RESEND_FROM`, sin código) vs Camino B (SMTP propio, reescribir
`src/lib/email.ts`). Falta que Sebas confirme dominio + proveedor.

---

## Hardening Supabase (pre-beta)

Revisión de advisors el **2026-06-16** (vía MCP). **No hay ERRORES** — todas las
tablas tienen RLS y no hay datos expuestos. Lo siguiente es endurecimiento y
optimización de escala; **nada bloquea la beta** con el volumen actual.

**Quick-wins de seguridad aplicados** (2026-06-16, migración `hardening_2026_06_security_quickwins`, ver [`supabase/migration_hardening_2026-06.sql`](supabase/migration_hardening_2026-06.sql)):
- ✅ `function_search_path_mutable`: `set search_path = ''` en `handle_updated_at` y `update_tasks_updated_at`.
- ✅ `public_bucket_allows_listing`: borrada la policy `"Avatares: lectura pública"` (el bucket es público → las URLs siguen sirviendo, se corta solo el listado).
- ✅ `handle_new_user` ejecutable como RPC: `revoke execute` de public/anon/authenticated (el trigger sigue disparando).

**Aceptado / no se toca (con motivo):**
- `auth_company_id`, `auth_is_arquitecto`, `auth_is_coach_of` (`SECURITY DEFINER`): se usan **dentro de las RLS**; revocar EXECUTE las rompería. Exposición nula (solo devuelven company_id/rol del propio caller).
- `get_disc_assessment`, `submit_disc`: anon-callable **a propósito** (test DISC público por token).

**Diferido — requiere plan pago de Supabase:**
- ⏳ `auth_leaked_password_protection` (chequeo de contraseñas filtradas contra HaveIBeenPwned): **NO disponible en el plan Free** — necesita Supabase **Pro**. Se deja pendiente hasta upgrade del proyecto. Cuando se contrate Pro: activar en Authentication → Policies (es un toggle, sin código).

**Performance (168, todo WARN/INFO — optimización de escala):**
- `auth_rls_initplan` (70): policies usan `auth.uid()` directo → envolver en `(select auth.uid())` para no reevaluar por fila.
- `multiple_permissive_policies` (50): varias policies permisivas por tabla/acción/rol.
- `unindexed_foreign_keys` (34) e `unused_index` (14): índices a agregar/limpiar cuando haya tráfico real.

> Recomendación: atacar los quick wins de seguridad (leaked-password, search_path,
> bucket avatars, revoke en triggers) antes de abrir la beta; lo de performance,
> cuando crezca el volumen.

---

## Migraciones SQL aplicadas

Orden de aplicación en Supabase (ver [`supabase/README.md`](supabase/README.md) para el detalle oficial):

| # | Archivo | Sprint cubierto |
|---|---|---|
| 0 | `schema.sql` | S0 — companies, profiles |
| 1 | `migration_sprint1.sql` | S1 — scorecards, kpis |
| 2 | `migration_sprint2.sql` | S2 — rituales + parking_lot + weekly_reports + Realtime |
| 3 | `migration_sprint3_disc.sql` | S3 — DISC public test |
| 4 | `migration_sprint4_disc_ux.sql` | S3 — DISC UX (cargo, scores) |
| 5 | `migration_sprint5_roles.sql` | misc — roles |
| 6 | `migration_sprint6_account.sql` | módulo Mi Cuenta (phone, bio, timezone) |
| 7 | `migration_sprint7_equipo.sql` | S3 — Matriz Autoridad + Cruces |
| 8 | `migration_sprint8_delegacion.sql` | S4 — tasks + task_updates |
| 9 | `migration_sprint9_feedback.sql` | S5 — feedbacks |
| 10 | `migration_sprint10_plan90d.sql` | S6 — rocks + process_assets + leading_indicators |
| 11 | `migration_sprint11_workbooks.sql` | S7 — workbook_responses + progress |
| 12 | `migration_sprint12_activos.sql` | S6 — process_assets (Activos del Sistema) · ✅ aplicada (2026-06-16) |
| 13 | `migration_sprint13_notifications.sql` | S14 — notifications · ✅ aplicada (2026-06-16) |
| 14 | `migration_sprint14_tour.sql` | S11 — tour_completed en profiles · ✅ aplicada (2026-06-16) |
| 15 | `migration_sprint15_super_coach.sql` | S9 — coach_assignments + coaching_notes + RLS coach · ✅ aplicada (2026-06-16) |
| 16 | `migration_sprint17_multiplicador.sql` | S17 — multiplicador_diagnostics (M8 ROI de Talento) · ✅ aplicada (2026-06-16) |

> ⚠️ **Numeración no coincide con sprint del plan** — los archivos se numeraron por orden de creación. Cruzá con esta tabla para saber qué cubre cada uno.

---

## Cómo actualizar este archivo

1. Cuando abrís un sprint → cambiá su fila a 🟡 con la nota "EN CURSO · <fecha>".
2. Cuando cerrás una pieza concreta → tachá la línea en "Notas" y/o cambiá el estado.
3. Cuando cerrás un sprint completo → ✅ y actualizá la fecha de "Última actualización" + el contador de completitud.
4. Si surge una pieza nueva fuera del plan → agregala como fila al final con `S?` y referenciala al CHANGELOG si aplica.

Commiteá los cambios al PROGRESS.md **en el mismo commit** que cierra/abre la pieza — no en uno aparte.
