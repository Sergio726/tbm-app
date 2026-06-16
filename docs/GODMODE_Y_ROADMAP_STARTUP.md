# God Mode — Panel de plataforma + Roadmap para una startup vendible

> **Estado:** documento de alcance (no implementado todavía). Define el panel de
> super-admin ("god mode") y lo que la startup necesita para ser vendible/escalable.
> Fuente de referencia para los sprints A0–A6+. Última actualización: 2026-06-16.

---

## 1. Por qué este documento

Hoy `/register` está **100 % abierto**: cualquiera se crea una cuenta `arquitecto`
(dueño de empresa) gratis, sin gate de pago ni invitación. El aislamiento de datos
por RLS es correcto (cada quien ve solo lo suyo — auditado vía advisors), pero **no
hay control comercial ni operativo de la plataforma**.

Se necesita un **panel de super-admin separado** ("god mode" / panel de la startup)
desde el cual el equipo (Sebastián + Dilio) pueda:

- Crear líderes de empresa (los que pagan la suscripción) y enviarles invitaciones.
- Editar datos sensibles de las empresas.
- Cargar créditos y descuentos.
- Ver métricas de negocio (ingresos, uso, tiempo en app, segmentación por país).

**Modelo de negocio:** el líder de empresa compra **créditos**; **1 crédito = 1
DISC**. Un colaborador invitado solo puede hacer su DISC si la empresa tiene crédito.
La app cliente actual (`apps/web`) es la **vista de líder de empresa + Super Coach**;
el god-mode (`apps/admin`) **no** tiene acceso a esa app.

---

## 2. Decisiones de arquitectura

- **Monorepo (un solo repo, workspaces):** `apps/web` (app cliente actual) +
  `apps/admin` (god mode) + `packages/shared` (tipos, cliente Supabase, design
  tokens). **No** repos separados — para un equipo chico, los tipos compartidos y los
  cambios atómicos de schema pesan más que la separación de repos.
- **Deploy separado:** dos proyectos Vercel distintos (cada uno apunta a su carpeta),
  subdominio propio para el admin (ej. `admin.tbm…`). Separación total de
  runtime/cookies; lo único compartido es el código común.
- **Misma base de datos Supabase** para ambas apps (el admin debe ver todas las
  empresas). El admin opera con **service-role en server actions** protegidas por un
  guard `is_platform_admin()`; nunca se expone service-role al cliente.
- **El platform-admin NO es un rol de `profiles`.** `profiles.role` siempre está
  atado a una empresa (`arquitecto`/`colaborador`/`coach`). El admin de plataforma
  vive en una tabla aparte `platform_admins`, sin `company_id`.
- **Unidad de crédito:** 1 crédito = 1 DISC. Invitar es gratis; el crédito se
  descuenta al generar/completar el DISC del colaborador.

### Decisiones abiertas (a confirmar al implementar)

- ¿Re-generar un DISC ya hecho descuenta otro crédito? *Sugerido:* sí, salvo
  corrección por error → ajuste manual con registro en el ledger.
- ¿Trial con N créditos gratis al crear empresa? *Sugerido:* sí (1–3 para probar).
- Analytics de uso (tiempo, país): instrumentar PostHog temprano vs. junto al
  dashboard. *Sugerido:* temprano, para tener histórico.
- Roles internos del admin (super-admin / finanzas / soporte) desde el día uno vs.
  un único rol. *Sugerido:* un rol al inicio, estructura lista para segmentar.

---

## 3. Alcance del panel God Mode (módulos)

Cada módulo es incremental.

### M1 · Empresas (tenants)
- Listado de todas las empresas: nombre, plan, dueño, fecha de alta, # usuarios,
  saldo de créditos, estado (activa/suspendida).
- Ficha de empresa: editar datos sensibles (nombre, sector, plan, settings),
  suspender/reactivar, ver equipo y actividad.
- **Impersonation con auditoría** ("ver como este líder") para soporte — toda sesión
  impersonada queda registrada. Nunca impersonar sin log.

### M2 · Usuarios
- CRUD de usuarios across empresas: crear líder manualmente, enviar/reenviar link de
  invitación, cambiar rol, resetear contraseña, desactivar/eliminar (borrado
  GDPR-compliant).
- Crear cuentas de **coach** y asignarlas a empresas (`coach_assignments`) desde la
  UI — hoy es INSERT manual por SQL.

### M3 · Créditos
- Saldo por empresa + **ledger append-only** (cada compra, consumo, ajuste,
  descuento, expiración queda registrado, inmutable).
- Cargar créditos manualmente (con motivo), créditos promocionales con fecha de
  inicio/fin, ajustes/correcciones.
- Visualización de consumo por empresa y en el tiempo.

### M4 · Facturación / Billing (Stripe)
- Paquetes de créditos (productos/precios), cupones/descuentos.
- Estado de suscripción/compras por empresa, historial de pagos, reembolsos.
- Webhooks de Stripe → acreditan el ledger (idempotentes, con idempotency keys).
- Stripe Tax (impuestos por país); dunning (reintentos de cobro fallido).

### M5 · Métricas de negocio (dashboard de la startup)
- **Ingresos:** MRR/ARR, ingresos por créditos, ticket promedio, crecimiento.
- **Producto/uso:** usuarios activos (DAU/WAU/MAU), DISC generados, rituales
  completados, retención/cohortes, churn.
- **Engagement:** tiempo en app, frecuencia de uso.
- **Segmentación:** por país, plan, sector, tamaño de equipo.
- Fuente: PostHog (product analytics) + queries a Supabase (datos de negocio).

### M6 · Planes & feature flags
- Planes (trial/pro/enterprise — `companies.plan` ya existe) con límites/cuotas y
  features por plan.
- Feature flags por empresa para habilitar/probar funciones.

### M7 · Soporte & comunicación
- Bandeja/registro de tickets o, mínimo, vista del estado de cada empresa para dar
  soporte. Anuncios/mensajes in-app a líderes.
- (Más adelante) integración con help desk / docs.

### M8 · Gobernanza & auditoría
- **Audit log** de TODA acción del admin (quién, qué, cuándo, valor anterior/nuevo):
  editar datos sensibles, cargar créditos, impersonar, eliminar usuarios.
- Roles internos del admin (super-admin / finanzas / soporte) con permisos
  diferenciados (RBAC interno).
- **MFA obligatorio** para cuentas platform-admin.

### M9 · Salud del sistema
- Estado de cron jobs (digest/alertas), errores recientes (Sentry), uso de storage,
  advisors de Supabase. Panel operativo único.

---

## 4. Qué hace a la startup "vendible" (enterprise / acquisition readiness)

Más allá del panel: lo que un comprador/inversor revisa en due diligence. El god-mode
cubre parte; el resto es infra y procesos.

| Pilar | Tenemos ✅ / Falta ⏳ |
|-------|----------------------|
| **Seguridad & compliance** | RLS por tenant ✅. ⏳ audit logs, MFA (líderes y admin), leaked-password (requiere Supabase Pro), camino SOC 2 / GDPR (DPA, pen-test), SSO/SAML + SCIM (enterprise). |
| **Billing & revenue** | ⏳ Stripe (créditos/suscripciones), invoicing, Stripe Tax, dunning, métricas MRR/ARR/churn auditables. |
| **Observabilidad** | `scripts/backup-data.mjs` ✅. ⏳ Sentry, uptime monitoring, logs centralizados, DR/runbook, staging env. |
| **Datos & governance** | ⏳ export y borrado de datos por usuario/empresa (GDPR: portabilidad + derecho al olvido), consentimientos. |
| **Producto & analytics** | ⏳ PostHog (uso, cohortes, funnels) — habilita M5 y muestra tracción. |
| **Calidad de ingeniería** | Sin secretos en repo ✅. ⏳ tests automatizados, CI/CD, docs de arquitectura/runbooks (reduce "bus factor"). |

---

## 5. Roadmap por sprints (entregas funcionales)

| Sprint | Entrega | Cierra |
|--------|---------|--------|
| **A0 — Monorepo** | Reestructurar a workspaces (`apps/web`, `apps/admin`, `packages/shared`); 2 proyectos Vercel; subdominio admin. App cliente sigue igual. | Base técnica |
| **A1 — Fundación admin + cerrar registro** | Tabla `platform_admins` + `is_platform_admin()`; login admin con MFA; **cerrar `/register` público**; listado read-only de empresas (M1 base). | Hueco de seguridad |
| **A2 — Gestión** | Crear líderes + enviar invitaciones desde admin; editar datos sensibles; CRUD usuarios; alta de coaches (M2). + Audit log base (M8). | Operar sin SQL |
| **A3 — Motor de créditos** | Tablas saldo + ledger; **gating del DISC por créditos** en app cliente; carga manual de créditos/descuentos (M3); UX de saldo bajo. | Modelo de negocio enforced |
| **A4 — Stripe** | Compra de créditos por el líder desde su panel; webhooks → ledger; cupones/descuentos; Stripe Tax (M4). | Cobro automático |
| **A5 — Métricas** | Dashboard de ingresos/MRR + KPIs de uso + tiempo + país (M5; requiere PostHog instrumentado antes, idealmente desde A1). | Panel de startup |
| **A6+ — Enterprise readiness** | Sentry, export/borrado GDPR, planes/feature flags (M6), roles internos admin, camino SOC2/SSO. | Vendible |

---

## 6. Data model — adiciones principales (alto nivel)

- `platform_admins (user_id, role_interno, mfa_enabled, created_at)` — quién es admin
  de plataforma (NO vinculado a empresa).
- `company_credits (company_id, balance, updated_at)` — saldo actual.
- `credit_transactions (id, company_id, delta, type, reason, actor_id, ref, created_at)`
  — ledger append-only (compra/consumo/ajuste/promo/expiración).
- `audit_log (id, actor_id, action, target_type, target_id, before, after, created_at)`.
- **Gating DISC:** la RPC de generación / `submit_disc` chequea y descuenta crédito de
  forma atómica (row lock), o un wrapper server-side en `apps/web`.
- Posible `invitations.quota` / límites por plan (M6).

## 7. Funciones/patrones existentes a reusar

- `createAdminClient()` (`src/lib/supabase/admin.ts`) — patrón service-role (lo usa
  el cron). El god-mode lo reusa para acciones privilegiadas.
- `auth_is_coach_of()` / `coach_assignments` (`supabase/migration_sprint15_super_coach.sql`)
  — precedente de "observar varias empresas"; el admin es la versión total.
- Flujo de invitación: `src/components/equipo/invite-modal.tsx` +
  `src/app/(auth)/accept-invite/page.tsx` — reusar para invitar desde el admin.
- DISC: `src/lib/disc-evaluator.ts`, RPC `submit_disc` — punto donde se inserta el
  gating por créditos.

---

## 8. Referencias (best practices consultadas)

- Stripe — [Credits for usage-based billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing)
  y [credits-based subscription model](https://stripe.com/resources/more/what-is-a-credits-based-subscription-model-and-how-does-it-work).
- Descope — [B2B SaaS Guide to Enterprise Readiness](https://www.descope.com/blog/post/b2b-saas-enterprise-readiness).
- Frontegg — [SaaS Multitenancy best practices](https://frontegg.com/blog/saas-multitenancy).
- Ghinda — [Domain structure for SaaS products](https://ghinda.com/blog/products/2020/domain-structure-for-saas-products.html)
  (subdominio para el admin).
