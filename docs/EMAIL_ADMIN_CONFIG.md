# Correo electrónico — estado actual + diseño de "Configuración de correo" en el admin

> Documento de **proyección y decisión** (no código). Objetivo: (1) dejar claro cómo manda mails el
> sistema hoy, (2) resolver el **pendiente del servidor de correo**, y (3) diseñar una sección en el
> panel god-mode para configurar **todo lo de correo sin tocar código** (espejo de la sección
> "Asistente IA" / DC-2). Relacionado: `JARVIS_AI_ASSISTANT.md` (mismo patrón config), `PROGRESS.md`
> (Fase 1 · "Email server disponible").

---

## 1. Cómo manda mails el sistema HOY (dos canales separados)

Hay **dos vías de correo independientes**. Es la distinción más importante de todo el doc, porque
una sección del admin solo puede manejar **una** de las dos por código.

### Canal A — Mails transaccionales de la app (vía **Resend**)
- Código: `apps/web/src/lib/email.ts` → `POST https://api.resend.com/emails`.
- Se activa con dos **env vars** (en Vercel): `RESEND_API_KEY` + `RESEND_FROM`.
- Helpers: `hasResendConfigured()` (¿hay key+from?) y `canSendExternalEmail()` (¿el `from` NO es
  `@resend.dev`?, es decir ¿dominio verificado?).
- **Quién lo usa hoy:**
  - `api/cron/daily/route.ts` → digest matinal, alerta de tarea a 72h, recordatorio de ciclo 90D.
  - `equipo/actions.ts` → enviar el **link del test DISC** por mail al evaluado.
- **Estado: modo prueba.** Con `RESEND_FROM = onboarding@resend.dev`, Resend **solo entrega al mail
  dueño de la cuenta** → los líderes/colaboradores reales NO reciben nada. Este es el pendiente.

### Canal B — Mails de **Supabase Auth** (magic links, invitaciones, reset de contraseña)
- Los dispara Supabase, no nuestro código: `signInWithOtp`, `inviteUserByEmail`, `generateLink`
  (en `equipo/actions.ts` y el flujo `accept-invite`).
- Se configuran en el **dashboard de Supabase** → `Authentication → SMTP Settings` (no por env ni por
  código). En S15 se dejó "SMTP propio" para el proyecto nuevo (ver `SPRINTS.md`).
- ⚠️ **Una sección del admin NO puede cambiar esto por código** (es config del proyecto Supabase). Lo
  que sí puede: **mostrar el estado y las settings recomendadas** para pegar en Supabase.

### Aclaración: "recepción" de correos
El sistema **solo envía**; no recibe ni parsea correos entrantes. Cuando hablamos de "direcciones de
recepción" nos referimos a:
- **Reply-To** — a dónde responden los que reciben un mail nuestro.
- **Casillas de contacto/soporte** — dónde caen los "pedir más créditos" (#7, hoy `SUPPORT_EMAIL`
  hardcodeado en `lib/credits.ts`), contacto, etc.
- **Inbound real** (recibir y procesar mails programáticamente, ej. responder por mail) = otra cosa,
  bastante más grande (Resend Inbound / IMAP) → **fuera de scope** salvo que lo querramos a futuro.

---

## 2. El pendiente real: configurar el servidor de correo

Para que los mails **lleguen a cualquier destinatario** hay que salir del modo prueba. Dos caminos
(no excluyentes; el B lo habilita "Email server disponible" de jun-2026):

| | **Camino A — Resend + dominio verificado** | **Camino B — SMTP propio** |
|---|---|---|
| Qué se hace | Verificar el dominio en Resend (DNS: SPF/DKIM) → cambiar `RESEND_FROM` al dominio | Usar el servidor SMTP propio vía `nodemailer` (host/port/user/pass) |
| Código | **Cero** (solo cambiar la env var) | Reescribir `lib/email.ts` para SMTP (nueva dependencia) |
| Entregabilidad | Muy buena (Resend gestiona reputación) | Depende del servidor propio (hay que cuidar SPF/DKIM/DMARC) |
| Costo | Free hasta cierto volumen | Incluido en el server propio |
| **Canal B (Auth)** | Igual hay que cargar SMTP en Supabase (Resend ofrece SMTP) | Mismo SMTP propio en Supabase → **un solo servidor para todo** |

> **Recomendación:** **un solo servidor de correo para A y B.** Lo más simple y de mejor
> entregabilidad para la beta es **Camino A (Resend + dominio verificado)** y usar el **SMTP de
> Resend también en Supabase Auth** → todos los mails (transaccionales + auth) salen del mismo
> dominio verificado, sin reescribir `email.ts`. Camino B tiene sentido si querés no depender de
> Resend; cuesta más mantenimiento de entregabilidad.

**Quick win inmediato (sin la sección admin):** verificar dominio en Resend + setear `RESEND_FROM` en
Vercel + cargar el SMTP de Resend en Supabase Auth. Eso ya **desbloquea la beta** hoy. La sección
admin (abajo) es la evolución para no depender de env vars.

---

## 3. Propuesta: sección "Configuración de correo" en el admin (god-mode)

Mismo patrón que **DC-2 / `ai_config`**: una tabla de config + secretos en **Vault** + un form en el
panel + **"enviar email de prueba"**. Beneficio: cambiar remitente, reply-to, credenciales o
proveedor **sin redeploy** (hoy `RESEND_*` son env vars → cambiarlas exige redeploy).

### 3.1 Modelo de datos — tabla `email_config` (scope plataforma)
Columnas (la fila única `scope='platform'`, igual que `ai_config`):
- `provider` — `resend` | `smtp`.
- `from_name`, `from_email` — remitente visible (ej. "The Business Multiplier" `<noreply@dominio>`).
- `reply_to` — a dónde responden.
- `support_email` — casilla de "pedir más créditos" / contacto (reemplaza el `SUPPORT_EMAIL`
  hardcodeado de #7).
- SMTP (solo si `provider='smtp'`): `smtp_host`, `smtp_port`, `smtp_secure` (bool), `smtp_user`.
- `enabled` — interruptor general.
- **Secretos en Vault** (NO en columnas): `resend_api_key` y `smtp_password`, vía wrappers
  `email_set_secret` / `email_get_secret` (SECURITY DEFINER, solo `service_role`) — copiando
  `ai_set_api_key`/`ai_get_api_key` de `migration_jarvis_ai_config.sql`.
- RLS: activa, **sin policies** (solo `service_role`), igual que `ai_config`.

### 3.2 Admin — sección "Correo" (en `apps/admin`)
Espejo de `asistente-ia/`: `page.tsx` + `actions.ts` (`getEmailConfig`/`saveEmailConfig`/
`testEmailConnection`) + `email-config-form.tsx`. Campos: proveedor, from (nombre+email), reply-to,
support email, bloque SMTP (host/port/secure/user/pass) que aparece si `provider='smtp'`, key de
Resend si `provider='resend'`, **enviar email de prueba** a una dirección que tipee el admin. Auditar
en `audit_log` (`action: 'edit_email_config'`).

### 3.3 Web — `lib/email.ts` lee de la DB (no de env)
Refactor: `sendEmail` lee `email_config` (vía `createAdminClient`, server-only) + el secreto del
Vault, y despacha por **Resend** (fetch actual) o **SMTP** (`nodemailer`, nueva dep en `apps/web`).
Fallback a las env vars `RESEND_*` si la tabla aún no está configurada (transición sin romper el
cron). `SUPPORT_EMAIL`/reply-to pasan a salir de la config.

### 3.4 Lo que el admin NO maneja (y hay que documentar en la misma pantalla)
- **Supabase Auth SMTP (Canal B).** No se puede setear por código. La pantalla del admin muestra un
  bloque "Mails de acceso (magic links / invitaciones)" con las **settings recomendadas** (host,
  port, user, from) para pegar en `Supabase → Authentication → SMTP Settings`, y un link directo.
  Idealmente el mismo SMTP/dominio que el Canal A.

---

## 4. Decisiones abiertas (para Sebas)
1. **Camino del servidor:** ¿Resend + dominio verificado (recomendado, sin código) o SMTP propio
   (nodemailer)? ¿O Resend para la app + SMTP propio en Supabase Auth?
2. **Dominio y direcciones:** ¿qué dominio usamos para `from` (ej. `noreply@thebusinessmultiplier.…`)?
   ¿`reply_to`? ¿`support_email` (hoy placeholder `tbm@stlabs.ar`)?
3. **¿Sección admin ahora o quick-win primero?** Recomendado: **quick-win** (desbloquear beta con env
   vars) **ahora**, y la **sección admin** como pieza siguiente (es la que da control sin redeploy).
4. **¿Inbound a futuro?** (recibir/responder por mail) — fuera de scope por ahora; anotar si interesa.

---

## 5. Plan sugerido por fases
- **F0 · Quick win:** ✅ **hecho (2026-06-27)** — dominio **`send.stlabs.ar`** verificado en Resend
  y **envío de la app andando** (probado con "enviar email de prueba" desde `/correo`). El gate de
  invitaciones (`sendTeamInvite`) ahora usa `mailCanSendExternal()` (lee `email_config`), así que las
  invitaciones también salen por la config del admin sin tocar env vars. ✅ **Canal B hecho
  (2026-06-27, re-verificado en dashboard 2026-07-22)**: SMTP de Resend cargado en **Supabase →
  Authentication → SMTP** — `smtp.resend.com:465`, user `resend`, sender `noreply@send.stlabs.ar`,
  `smtp_pass` = la API key de Resend del **Vault** (la misma de la app; ⚠️ NO la de `.env.local`,
  que es de otra cuenta). Plantillas recovery/email-change en flujo `token_hash`; recovery probado
  200. Todos los mails (app + Auth) salen del dominio verificado.
- **F1 · Sección admin "Correo":** ✅ **hecho (2026-06-26)** — migración `email_config` + Vault
  (`email_set/get_secret`) + sección admin **`/correo`** (form remitente/reply-to/soporte/key +
  **enviar email de prueba**) + refactor de `lib/email.ts` a **DB-config con fallback a env** (el
  cron nunca se rompe). `SUPPORT_EMAIL` (#7) ahora sale de `support_email` si está configurado. SMTP
  queda como "próximamente". La pantalla incluye el bloque informativo del **Canal B** (Supabase
  Auth SMTP) que no se puede setear por código.
- **F2 · SMTP propio (opcional):** soporte `provider='smtp'` con `nodemailer` en `lib/email.ts` +
  campos SMTP en el form. Solo si se decide no depender de Resend.
- **F3 · (futuro) Inbound:** recibir/parsear correos — evaluar si aporta.

> **Próximo paso recomendado:** definir el punto 1 y 2 de §4 (camino + dominio/direcciones). Con eso
> hago el **F0** (instrucciones exactas de DNS/Vercel/Supabase para vos) y dejo lista la
> implementación del **F1** (sección admin) como el siguiente entregable de código.

---

## 6. Decisión tomada (2026-06-26)
- **Proveedor: Resend para TODO el envío de la app.** Se descarta Purelymail (era hosting de
  casillas, no un ESP transaccional). Un solo proveedor de envío.
- **Subdominio de envío dedicado:** `send.<tu-dominio>` → Resend pone ahí SPF/DKIM, sin tocar el
  resto del dominio. `from = noreply@send.<tu-dominio>`.
- **Resend solo ENVÍA, no recibe** → `reply_to` y `support_email` deben ser un **buzón que el dueño
  lea** (ej. el Gmail personal). No se hostean casillas.
- **Supabase Auth (Canal B):** SMTP de Resend (host `smtp.resend.com`), mismo remitente.
- **Orden: quick-win (F0) primero** (verificar dominio + cargar la config) → la sección admin (F1)
  ya está hecha, así que la key/remitente se cargan ahí o por env.

## 7. Runbook F0 — desbloquear el correo (sin código; lo ejecuta Sebas)
Reemplazá `stlabs.ar` por el dominio elegido. Recomendado un **subdominio** de envío (ej.
`send.stlabs.ar`) para no tocar el MX del dominio raíz si ya recibís correo ahí.

1. **Resend — verificar el dominio**
   - resend.com → **Domains → Add Domain** → `stlabs.ar` (o `send.stlabs.ar`).
   - Cargar en tu DNS los registros que da Resend: **SPF** (TXT), **DKIM** (CNAME/TXT) y, recomendado,
     **DMARC**. Esperar el estado **Verified**.
2. **Vercel — proyecto `tbm-app` (web), Production**
   - `RESEND_FROM = The Business Multiplier <noreply@stlabs.ar>` (debe ser del dominio verificado).
   - Confirmar que `RESEND_API_KEY = re_…` está cargada.
   - **Redeploy.** A partir de acá `canSendExternalEmail()` = true → el cron y el link DISC entregan a
     cualquier destinatario (ya no solo a la cuenta Resend).
3. ✅ **Supabase Auth — SMTP de Resend (Canal B) — YA APLICADO** (2026-06-27, re-verificado 2026-07-22)
   - En Resend → **SMTP**: host `smtp.resend.com`, port `465` (SSL) o `587` (TLS), user `resend`,
     pass = una API key de Resend.
   - Supabase (proyecto `fozhnfxehbbgqaerprgf`) → **Authentication → SMTP Settings → Enable Custom
     SMTP**: host/port/user/pass + **Sender** `noreply@send.stlabs.ar` / "The Business Multiplier".
   - Estado actual: **Custom SMTP ON** con esos valores; `smtp_pass` = API key del Vault. Solo se
     cambia por **dashboard o Management API** (no MCP). Ver §"Migración de dominio" abajo.
4. **`SUPPORT_EMAIL` (#7):** cambiar el placeholder `tbm@stlabs.ar` en `apps/web/src/lib/credits.ts`
   por la casilla real de contacto (ej. `hola@stlabs.ar`). *(cambio de 1 línea — lo hago cuando se
   confirme la dirección.)*
5. **Verificación**
   - Test DISC: `/equipo` → "enviar por email" a una casilla externa → debe llegar.
   - Cron: `/api/cron/daily` (con bearer) o esperar 11:00 UTC → digest a arquitectos.
   - Auth: invitar / reset password → mail desde el dominio propio.

---

## 8. Migración de dominio — puntos a cambiar

> El dominio de envío hoy es **`send.stlabs.ar`** (cuenta Resend de prod, DNS en Cloudflare). Si
> alguna vez se migra a otro dominio, el remitente vive en **varios lugares independientes** — no
> alcanza con cambiar uno. Checklist único (repasarlos TODOS):

1. **Resend — verificar el dominio nuevo.** Domains → Add Domain → cargar SPF/DKIM (y DMARC) en el
   DNS del dominio nuevo hasta el estado **Verified**. Si es otra cuenta de Resend, generar ahí una
   API key nueva (cuidado con el GOTCHA de las 2 cuentas).
2. **App / Canal A — Admin `/correo`** (`email_config` + Vault): `from_email` y `reply_to` al dominio
   nuevo + la **API key** de la cuenta Resend dueña del dominio. Sin redeploy (lee de la DB). Fallback
   env vars `RESEND_FROM` / `RESEND_API_KEY` en Vercel por si la tabla no está seteada.
3. **Auth / Canal B — Supabase Auth SMTP** (proyecto `fozhnfxehbbgqaerprgf` → Authentication →
   Emails/SMTP): actualizar el **Sender email** al dominio nuevo y la **smtp_pass** si cambió la API
   key. ⚠️ **Solo por dashboard o Management API** (`/v1/projects/<ref>/config/auth` con un PAT
   `sbp_…`) — **no** por MCP ni por el repo → es el punto que más fácil se olvida.
4. **`SUPPORT_EMAIL` / reply-to**: si el buzón de contacto cambia con el dominio, ajustar
   `email_config.support_email` (admin) o el placeholder de `apps/web/src/lib/credits.ts`.
5. **Redirect URLs / Site URL** de Auth: solo si además cambia el **dominio del sitio** (no el de
   envío) — Authentication → URL Configuration.

> Riesgo de drift relacionado: `auditoria.md` · **CRON-15** (SMTP de Auth gestionado a mano →
> cuidar la rotación de la key para que Canal A y Canal B no queden desincronizados).
