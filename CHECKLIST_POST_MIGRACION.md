# Checklist post-migración — remediación de auditoría

> Las **8 migraciones (fase0–fase4) se aplicaron en producción sin errores** el 2026-07-13.
> El código de la remediación se mergeó de `develop` a `main`.
> Este archivo es la lista de verificación y las recomendaciones pendientes.
> Detalle por hallazgo: [`auditoria.md`](auditoria.md).

---

## 1. Smoke test (HACER YA) — la BD cambió; verificá que nada se rompió

Las migraciones tocan RLS, el trigger de `profiles` y la firma de `grant_credits`.
Probá estos flujos en la app y marcá cada uno:

### Onboarding (lo más sensible — trigger de T1)
- [ ] **Registrar una empresa nueva** (`/register`) → debe crear la cuenta y entrar como Arquitecto.
- [ ] **Invitar a un colaborador** desde `/equipo` y **aceptar la invitación** con ese email → debe quedar vinculado como `colaborador`.
- [ ] *(Negativo, opcional)* Desde la consola del browser, intentar
      `supabase.from('profiles').update({ role:'arquitecto' }).eq('id', MI_ID)` →
      **debe fallar** (así confirmás que T1 bloquea la auto-escalada).

### Créditos / DISC (T3 + firma nueva de grant_credits)
- [ ] **Generar un link de test DISC** desde `/equipo` → debe **descontar 1 crédito**.
- [ ] **Reenviar un test pendiente** → **no** debe descontar.
- [ ] **Cargar créditos desde el admin** (`/empresas/[id]` → grant) → debe acreditar
      (la RPC cambió de firma; confirmá que el botón sigue andando).
- [ ] *(Negativo)* Intentar `INSERT`/`UPDATE` directo en `disc_assessments` desde la consola →
      **debe fallar** (T3).

### Plan 90D / Feedback / Workbooks (policies reescritas — fase2b)
- [ ] **Crear una Roca** en `/plan-90d` y **actualizar su avance**.
- [ ] **Cargar un Leading Indicator** y actualizar su valor.
- [ ] **Escribir un Feedback S.E.C.** (borrador) y **marcarlo entregado**.
- [ ] Confirmar que un **borrador de feedback NO lo ve el destinatario** (DB-6).
- [ ] **Guardar un ejercicio de Workbook** (que persista).

### Asistente DC + cron
- [ ] Abrir el asistente **DC** y mandar un mensaje → debe responder (no romper por el tope T7).
- [ ] *(Si aplica)* Revisar que el **cron diario** siga corriendo sin error (logs de Vercel).

> Si algo de esto falla, anotá el error exacto y avisá — probablemente sea un
> desajuste con el estado real de la BD que se ajusta en la migración.

---

## 2. Deploy — ✅ hecho
- [x] Merge `develop → main` (deploya web + admin en Vercel).
- [ ] Confirmar que el **CI** quedó verde en GitHub Actions.
- [ ] Verificar que el deploy de Vercel terminó OK (web y admin).

---

## 3. Env vars en Vercel (después del deploy)

- [ ] **`NEXT_PUBLIC_APP_URL`** — **importante**: con el fix T2 deployado, si falta,
      **las invitaciones dejan de salir** (devuelven un error claro). Seteala al dominio
      real en **ambos** proyectos (web y admin).
- [ ] *(Opcional)* `DC_COMPANY_MONTHLY_LIMIT` (default 2000) y `DC_KILL_SWITCH` — control
      de gasto del asistente.

---

## 4. Activar los pagos con Stripe (solo si se cobra ahora)

- [ ] Crear los **Prices** en Stripe (uno por paquete de créditos).
- [ ] Cargar cada paquete en la tabla **`credit_packages`**
      (`stripe_price_id`, `name`, `credits`, `amount_cents`, `currency`, `active=true`).
      *Recién con paquetes activos aparece la UI de compra en `/creditos`.*
- [ ] Setear `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` en Vercel.
- [ ] Registrar el endpoint **`/api/stripe/webhook`** en el dashboard de Stripe.
- [ ] Probar de punta a punta: `stripe listen --forward-to <dominio>/api/stripe/webhook`
      + un pago de test → confirmar que el crédito se acredita y el `purchase` queda `paid`.

---

## 5. Opcional
- [ ] Asignar coach para el Super Coach:
      `insert into coach_assignments (coach_id, company_id) values ('<uuid coach>', '<uuid empresa>');`

---

## 6. Recomendaciones / lo que quedó pendiente de la auditoría

Ninguno es bloqueante, pero conviene planificarlos. Detalle y evidencia en [`auditoria.md`](auditoria.md).

### Necesitan BD viva / tooling
- **T4 — Migraciones versionadas.** Adoptar `supabase/migrations/` con timestamps
  (`supabase link` + `db diff` para un baseline). Hoy el estado real de la BD no es
  verificable → es la causa raíz de que estas migraciones no se pudieran probar antes.
- **ARCH-3 — Tipos generados.** `supabase gen types` a `@tbm/shared` para matar la
  duplicación de `database.ts` (hoy los tipos se editan a mano; se agregaron las tablas
  de billing a mano en esta remediación).
- **DB-16 — CHECKs de dominio** en `role`/`status`/`type` (confirmar los valores válidos
  con la app antes de aplicarlos).

### Refactor con capacidad de test
- **T6 — Cron a dispatcher + worker por empresa.** Los fixes de robustez (CRON-1/4/5/14)
  ya están; falta el refactor que resuelve el timeout de 60s a gran escala
  (Supabase Queues / QStash). Necesario **antes de sumar muchas empresas**.
- **CRON-3/6 (resto)** — dedup persistente del digest + `dedup_key` unique (la carrera
  check-then-insert). Se resuelve junto con T6.
- **CRON-10/11** — `email_log` + webhook de bounces de Resend + `notification_prefs` +
  `List-Unsubscribe` (entregabilidad a escala).
- **IA-5 (resto) / IA-6** — retry+fallback entre proveedores del asistente + cache del
  contexto por turno.
- **ARCH-6 / IA-10 / CRON-12** — unificar en `packages/shared` los clientes Supabase, la
  capa de IA y las plantillas de email (hoy duplicadas y divergiendo entre web y admin).
- **ARCH-9/10/11** — romper los monolitos client-side (onboarding 1.571 líneas, login,
  account, WarUpRoom) y mover fetching a server components.
- **ARCH-5 / lint** — terminar el theming (codemod de hex) y limpiar los 34 warnings de
  `react-hooks` 7 (hoy degradados a warn) para poder subirlos a error.
- **DB-14/15** — retención de `ai_messages`/`notifications`/`audit_log` + denormalizar
  `user_id` en `ai_messages` (el índice de rate-limit hoy no discrimina usuario).
- **ARCH-13** — Sentry en `apps/admin` (hoy sin observabilidad).

### Decisión de producto
- **DB-13 — Colaboradores ven a sus compañeros** (nombres para War Up/notificaciones):
  choca con la privacidad del DISC (B1). Necesita una **vista** con columnas no sensibles.
- **DB-7 — RPC `accept_invitation`** + expiración efectiva de invitaciones (SEC-M4).
  El trigger de T1 ya mitiga la escalada; esto es el endurecimiento fino.
- **Modelo comercial (RESPUESTAS_DILIO N4)** — Dilio definió **suscripción anual**
  (`mentored`/`independent`), pero el producto evolucionó a **créditos** (Stripe pago único).
  Definir si conviven o cuál gana. Relacionado: **`access_type`** no existe en el schema.

---

*Generado como cierre de la remediación de auditoría. Marcá las casillas a medida que avances.*
