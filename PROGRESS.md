# PROGRESS — The Business Multiplier App

> **Fuente de verdad del estado del proyecto, sprint por sprint.**
> Mantenelo actualizado en cada PR o commit que cierre/abra una pieza de un sprint.
> Plan completo: [`docs/SPRINTS.md`](docs/SPRINTS.md) (incluye CHANGELOG v1.1).
> Feedback del cliente jun-2026 (post-S17, para implementar): [`docs/OBSERVACIONES_DILIO_2026-06.md`](docs/OBSERVACIONES_DILIO_2026-06.md).
> Panel de plataforma + roadmap de startup (god mode, créditos, Stripe, métricas): [`docs/GODMODE_Y_ROADMAP_STARTUP.md`](docs/GODMODE_Y_ROADMAP_STARTUP.md).

**Última actualización:** 2026-06-20 · **Completitud:** 🎉 **TODO el código de S0–S17 está implementado** · **Última pieza cerrada:** B1 — `/equipo` como "Mi Perfil" para el colaborador (pulido UX; la seguridad ya estaba OK). Antes: B2 (IA DISC con método), C1 (mapa LOST), D1/D2 (naming). PostHog + Sentry activos en prod. Lo que queda es configuración/operación (incl. `ANTHROPIC_API_KEY`) + decisiones de Dilio (D3/D4).

> **Novedades 2026-06-20:**
> - **Material canónico de Dilio recibido** (Drive "TBM 4": presentaciones S1–S6 + transcripciones) → digerido en [`docs/METODO_TBM_CANONICO.md`](docs/METODO_TBM_CANONICO.md), **nueva fuente de verdad del método**. Desbloquea **C1** (LOST: L-Liderazgo/O-Operaciones/S-Sistemas/T-Tiempo) y **B2** (contenido DISC: temores, luz/sombra, roles, cruces). **B3+B4 sigue parcial** (no vino el modelo de las 3 gráficas DISC; "INFORMES DISC" de clientes vacías). **A3.2** sigue bloqueado (WORKBOOKS vacía).
> - **Divergencias app↔método detectadas** (ver §8 del doc, son tickets): D1 LOS→LOST + "Niveles de Delegación" (no "LOS"); D2 ARQI = **4 pilares** (no "ARQUI"/5); D3 **Multiplicador (S17)** usa los "3 Pecados"+48% que **TBM4 eliminó** (requiere decisión de Dilio); D4 Pre-game vs Los 5 Grandes; D5 ESC vs SEC; D6 arquetipos DISC.
> - **Avances post-material:** ✅ **D1+D2** (barrido de copy LOS→Nivel de Delegación + ARQUI→ARQI). ✅ **C1** (página `/sistema` "Sistema LOST"). ✅ **B2** (síntesis DISC con IA enriquecida con el método canónico de Dilio: `src/lib/tbm-disc-context.ts` inyectado en `ai-report.ts`; **inerte hasta cargar `ANTHROPIC_API_KEY` en Vercel**). ✅ **B1** (`/equipo` → "Mi Perfil" para el colaborador; seguridad ya OK). 📋 **D3+D4** redactadas para Dilio en [`docs/PREGUNTAS_DILIO_2026-06.md`](docs/PREGUNTAS_DILIO_2026-06.md). **B3+B4** sigue parcial (falta el modelo de las 3 gráficas).
>
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
| **S2** | Rituales | ✅ | Pre-game (+ **checklist de hábitos** A3.1: catálogo curado por categorías + hábito propio, marcado de un toque con anillo de progreso, `user_habits`/`habit_logs`) · Los 5 Grandes · War Up Realtime · Cool Down + Reporte Semanal automático · Parking Lot · Config. |
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
| **S18** | JARVIS — Asistente IA (multi-proveedor) | 🟡 en curso | **Diseño:** [`docs/JARVIS_AI_ASSISTANT.md`](docs/JARVIS_AI_ASSISTANT.md). ✅ **S18.1 hecho** (migración `jarvis_ai_config`): capa de abstracción `apps/admin/src/lib/ai/` (interfaz + adapter Anthropic + catálogo de proveedores), tabla `ai_config` + **API key cifrada en Vault** (`ai_set/get_api_key`, solo service-role), sección admin **"Asistente IA"** (proveedor/modelo/system prompt/temperatura + **probar conexión**). Advisor confirma que las funciones de la key NO son anon-ejecutables. ✅ **S18.1b**: adapter **OpenRouter** (un endpoint/una key → toda la gama de LLMs por slug; modelo libre en el admin) → reemplaza los adapters directos de S18.4. ✅ **S18.2**: **chat real en la web** — el orbe del header pasa a botón accesible que abre un panel slide-over (`jarvis-panel`); server action `sendJarvisMessage` lee config+key (service-role), arma contexto TBM mínimo y llama al proveedor (no-streaming); maneja "no configurado". Capa `ai/` copiada al web (deuda: unificar en shared). ✅ **S18.3**: (A) fix del selector de modelos en el admin (dropdown + "otro modelo"); (B) **contexto rico** `lib/jarvis-context` (empresa + equipo DISC + cruces + áreas críticas + tareas) inyectado al system; (C) **streaming** token-a-token vía route handler `/api/jarvis` + `chatStream` en los adapters + panel que renderiza en vivo. ✅ **RAG R1** (migración `jarvis_rag` + Edge Function `embed` gte-small): `knowledge_chunks` + `match_knowledge` (pgvector 384). **corpus curado** (`scripts/ingest-knowledge.mjs`): **38 chunks de 4 docs canónicos/Dilio** (canónico + MODULO_DISC + Visión Dilio + Respuestas Dilio; se **excluyeron los históricos** HALLAZGOS/DISCOVERY/WORKBOOK_DELTA que arrastraban naming viejo). Regla de naming canónico (LOST/Niveles de Delegación/ARQI) en `TBM_METHOD_FRAMING` para que JARVIS no repita rótulos viejos del material. `/api/jarvis` recupera fragmentos relevantes y los inyecta → JARVIS **cita la investigación canónica** (probado: "LOST" → similitud 0.87). ✅ **UX del chat** (markdown, cursor streaming, parar, copiar, nueva conversación, auto-resize). 🐛 **Issues conocidos documentados** en [`docs/JARVIS_QA_2026-06-22.md`](docs/JARVIS_QA_2026-06-22.md) (orbe doble layoutId, temp 0, enabled sin key, verificar service-role key del web en prod). ⏳ Próximo: fixes del QA · **S18.5** tool use · S18.6 historial+costos · **RAG R2** (material por empresa). |
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
- ✅ **Instrumentar PostHog + Sentry** — código (`984c2b8`) + **ambos activos en prod
  (2026-06-20)**. Provider + pageviews + identify (sin PII) + 10 eventos del funnel + Sentry
  (instrumentation + global-error).
  - ✅ **PostHog ACTIVO (2026-06-20)** — proyecto US `478424` (cuenta
    `sebastian.soporte.tbm@gmail.com`). `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`
    cargadas en Vercel (Production+Preview); el deploy de prod posterior ya las horneó →
    capturando `$pageview` + eventos del funnel. Falta solo verificar Live events en el dashboard.
  - ✅ **Sentry ACTIVO (2026-06-20)** — org `tbm-0c`, proyecto `javascript-nextjs` (US).
    `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_ORG` + `SENTRY_PROJECT` + `SENTRY_AUTH_TOKEN` (`sntrys_…`
    válido, scope releases) en Vercel (Production), horneadas vía redeploy (`tbm-ghtd38yb1`) →
    sube source maps en el build. Reporta solo en `NODE_ENV=production`. **Verificar:** forzar
    un error en prod → debe aparecer en Sentry → Issues con stacktrace legible.
- **Quick-wins de Dilio sin bloqueo**
  - ✅ **A1 recordatorio "armá el próximo ciclo"** (2026-06-20): bloque nuevo en el cron
    diario (`/api/cron/daily`) que avisa al/los Arquitecto(s) cuando quedan ≤30 días del
    ciclo 90D (ancla = `created_at` del scorecard baseline, misma fórmula que el Hero Strip),
    notificación in-app (`type: cycle_reminder`) + email, **una vez por ciclo** (dedup 60d).
    Sin tabla nueva. Verificado E2E local (no-dispara día 31 · dispara a 30 días · dedup ·
    datos restaurados). *(Decisión: aviso único a 30 días, solo arquitecto; secuencia 30/15/7
    queda como extensión futura.)*
  - ✅ **A3.1 checklist de hábitos del Pre-game** (2026-06-19):
    catálogo curado por categorías + hábito propio, marcado de un toque (optimista) con anillo
    de progreso + micro-celebración, mobile-first; tablas `user_habits`/`habit_logs` (RLS por
    usuario). Las **meditaciones** del Pre-game siguen ⛔ bloqueadas por Dilio (365 meditaciones).
- 📧 **Email server disponible** *(Sebas, 2026-06-19)* — desbloquea el dominio propio para
  los emails del cron (hoy en modo test `onboarding@resend.dev`). **PENDIENTE: definir
  Camino A (verificar dominio en Resend → cambiar `RESEND_FROM`, sin código) vs Camino B
  (reescribir `email.ts` a SMTP propio con nodemailer).** Falta confirmar dominio/proveedor.
- ✅ **S16 Mejora #4 — Naming LOS → LOST / ARQI** *(copy hecho 2026-06-20)* — barrido
  D1+D2 del copy visible: "Nivel LOS"→**"Nivel de Delegación"** (Cadete→Socio, el término
  canónico de Dilio) en UI/tour/workbooks/export, y "A.R.Q.U.I."→**"ARQI"** (4 pilares).
  Type-check + build verdes. **Diferido** (no en este pase): renombrar identificadores/SQL
  (`LOS_LEVELS`, `los_level`) y surfacear "LOST" como nombre del sistema (eso es **C1**, un
  feature aparte). Detalle de divergencias: [`docs/METODO_TBM_CANONICO.md`](docs/METODO_TBM_CANONICO.md) §8.

### Fase 2 — Monetizar (panel god-mode + créditos) · EN CURSO (A0/A1/A2/A3 en `main` + deployados)
> **Deploy 2026-06-20:** `fase2` mergeado a `main`. Vercel **web** repuntado a Root Directory
> `apps/web` (prod live, 200). Proyecto Vercel **admin** nuevo (`tbm-app-admin`, Root Directory
> `apps/admin`) live en `https://tbm-app-admin.vercel.app` (login + guard OK). Pendiente: subdominio
> propio para el admin + verificación E2E del gating de créditos con sesión real.
*Recién acá el cobro. Decidido: monorepo, misma DB Supabase, 1 crédito = 1 DISC. Beta:
**regalar créditos** (carga manual), Stripe después. Crédito se descuenta al **generar el link
DISC**. Plan completo: `docs/GODMODE_Y_ROADMAP_STARTUP.md` + memoria `project-fase2-monetizacion`.*
- ✅ **A0 — Monorepo** (`bff037f`): app movida a `apps/web` + npm workspaces; `packages/shared`
  (tipos) y `apps/admin` se sumaron en A1. Web buildea verde desde el workspace. ⚠️ **antes de
  mergear a `main`: cambiar Root Directory del proyecto Vercel a `apps/web`** (lo hace Sebas).
- ✅ **A1 — Fundación admin**: tabla `platform_admins` + `is_platform_admin()` (`SECURITY DEFINER`,
  RLS, migración `fase2_platform_admins` aplicada; Sebas seedeado superadmin). App **`apps/admin`**
  nueva (Next, subdominio): login Supabase + middleware + guard de panel (`is_platform_admin`) +
  **listado read-only de empresas** (saldo de créditos = — hasta A3). `packages/shared` con el
  `Database` subset. Builds verdes. **MFA diferido** (hardening A6). Proyecto Vercel del admin ya
  creado y live (`tbm-app-admin`); falta solo un **subdominio propio** más prolijo (opcional).
- ✅ **A2 — Alta de líder/empresa desde el admin + audit log** (migración `fase2_audit_log`):
  acción server `createLiderAndCompany` (service-role: `createUser` con **contraseña temporal** +
  `email_confirm`, crea empresa, promueve profile a `arquitecto`, créditos iniciales opc., rollback
  si falla) → UI `/empresas/nueva` que muestra **email + contraseña una sola vez** (botón copiar).
  Tabla `audit_log` (RLS sin policy, solo service-role) registra `create_lider` y `grant_credits`.
  Acceso por contraseña temporal porque el email está en modo test. Builds verdes.
- ✅ **A2.2 — Gestión de empresas desde el admin** (`/empresas/[id]`): página de detalle (líder +
  equipo + ledger de créditos + **audit_log** en pantalla) · **editar** empresa/líder (nombre,
  sector, cargo, email vía `auth.admin.updateUserById`) · **suspender/reactivar** (migración
  `companies.status` + guard en el dashboard web → pantalla "Cuenta suspendida") · **alta de
  coaches** desde UI (`addCoachToCompany`: crea con contraseña temporal o reusa usuario + 
  `coach_assignments`). Todo auditado. Builds verdes.
- ✅ **Admin UI · pulido leve** (`ca2f93f`): botón **Cerrar sesión** (client `LogoutButton`:
  `signOut` → `/login`) + header con avatar de inicial + email truncado.
- ✅ **Frontend avanzado del admin — rediseño completo (E1–E5)** (`c2e43a9`…`d3503fd`):
  - **Base** (`c2e43a9`): tokens enriquecidos + primitivas (`.adm-card/.adm-input/.adm-btn`) en
    `globals.css`; **kit de UI** server-safe (`components/ui.tsx`: PageHeader, Card, StatCard,
    Badge, SectionTitle, EmptyState, Skeleton); **sidebar lateral** (`AdminSidebar`) con nav de
    estado activo; **dashboard de inicio** con métricas (empresas/créditos/líderes/coaches) +
    últimas acciones.
  - **E1** (`a2d16ea`): detalle + "nueva empresa" uniformados con el kit.
  - **E2** (`22b1e0d`): sidebar **responsive** (topbar + drawer mobile con overlay).
  - **E3** (`b0c94a1`): página global **`/auditoria`** (audit_log filtrable + paginado).
  - **E4** (`2942ea2`): página global **`/coaches`** (lista + asignar/quitar centralizado).
  - **E5** (`d3503fd`): `loading.tsx` skeletons por ruta + empty states + foco/hover + a11y
    (`aria-current`, `scope=col`, `prefers-reduced-motion`).
  - Sidebar final: **Inicio · Empresas · Coaches · Auditoría**. Builds verdes, deployado.
- ✅ **A3 — Motor de créditos + gating** (migración `fase2_credits`): `company_credits`
  (saldo) + `credit_transactions` (ledger append-only) + RPC **`generate_disc_link`**
  (gating atómico: descuenta 1 crédito al generar el link DISC; reusar pendiente no cobra;
  sin créditos → bloquea) que **reemplaza el INSERT client-side** + RPC **`grant_credits`**
  (carga/regalo, solo platform_admin). Web: server action `generateDiscLink` + chip de saldo
  en `/equipo` + aviso "sin créditos". Admin: saldo por empresa + form "Cargar créditos".
  STLabs seedeada con 25 (beta). Builds verdes. ⏳ E2E runtime pendiente (necesita sesión).
- **A4** — Stripe: compra de créditos por el líder + webhooks → ledger + cupones +
  Stripe Tax. *(reemplaza E1 parte 2)*

### Fase 3 — Producto profundo (con insumos de Dilio)
*Agrupa lo bloqueado por material que tiene que pasar Dilio.*
- **B3+B4** — DISC: las 3 gráficas clásicas (natural/adaptado/combinado). Feature
  grande, sesión dedicada. *Bloqueado por Dilio (material modelo).*
- ✅ **B6 — Diagrama "Conexiones y fricciones DISC"** (`5e7a583`, Mi Equipo): rombo SVG
  (`disc-connections-diagram`) con perímetro sólido (conexiones naturales D↔C·I↔S·S↔C·I↔D) y
  diagonales punteadas (cruces D↔S·I↔C), resalta pares presentes. Lógica par-a-par en `lib/disc`
  (`detectPairCrossings`/`discPairRelation`/`presentPairKeys`) con **`TBM_DISC_CRUCES` como fuente
  de verdad**; el caso **C director + 3 I ahora dispara alerta** (antes no). La sección "Salud del
  equipo" muestra diagrama + cruces par-a-par + composición (secundaria). Builds verdes. *Distinto
  de B3+B4.* ✅ **Follow-up D6 hecho** (rombo educativo en workbook S2 `f8afed7`; naming canónico abajo).
- ✅ **D6 — Naming DISC canónico** (`apps/web`): `DISC_DIMENSIONS` y todas las superficies usan
  **Dominante/Influyente/Seguro/Pensador** (antes Dominancia/Influencia/Estabilidad/Cumplimiento);
  temores alineados al canónico; metáforas y % ya canónicos. Test + resultado + Mi Equipo
  (`disc-bars`, `disc-section`, `member-report-modal`) + alertas de composición. **Se mantiene** el
  set de 16 arquetipos. Cierra la divergencia D6 del canónico §8.
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

**PostHog (analítica):** ✅ **HECHO (2026-06-20)** — proyecto US `478424`, vars cargadas en
Vercel (Production+Preview) y horneadas en el deploy de prod. Solo resta que Sebas confirme
los Live events en https://us.posthog.com/project/478424. Pasos originales (referencia):
1. Cuenta free en posthog.com → elegir región (US/EU).
2. Project Settings → **Project API Key** (`phc_...`).
3. Host: US `https://us.i.posthog.com` / EU `https://eu.i.posthog.com`.
4. Vercel (Production): `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
5. **Redeploy** (las `NEXT_PUBLIC_*` se inyectan en build).
6. Verificar: app → PostHog → Live events (`$pageview` + eventos; persona con role/company_id).
   *Tip: poner la key solo en Vercel (prod), no en `.env.local`, para no ensuciar con datos de dev.*

**Sentry (errores):** ✅ **HECHO (2026-06-20)** — org `tbm-0c` / proyecto `javascript-nextjs`,
4 vars en Vercel (Production) + redeploy. Solo resta forzar un error en prod y confirmarlo en
Sentry → Issues. Pasos originales (referencia):
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
| 17 | `migration_sprint18_pregame_habits.sql` | A3.1 — user_habits + habit_logs (checklist de hábitos del Pre-game) · ✅ aplicada (2026-06-19) |

> ⚠️ **Numeración no coincide con sprint del plan** — los archivos se numeraron por orden de creación. Cruzá con esta tabla para saber qué cubre cada uno.

---

## Cómo actualizar este archivo

1. Cuando abrís un sprint → cambiá su fila a 🟡 con la nota "EN CURSO · <fecha>".
2. Cuando cerrás una pieza concreta → tachá la línea en "Notas" y/o cambiá el estado.
3. Cuando cerrás un sprint completo → ✅ y actualizá la fecha de "Última actualización" + el contador de completitud.
4. Si surge una pieza nueva fuera del plan → agregala como fila al final con `S?` y referenciala al CHANGELOG si aplica.

Commiteá los cambios al PROGRESS.md **en el mismo commit** que cierra/abre la pieza — no en uno aparte.
