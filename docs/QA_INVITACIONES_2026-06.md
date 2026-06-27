# QA — Flujo de invitación de colaboradores (2026-06-26)

> Bugs encontrados al invitar un colaborador desde `/equipo` **sin el correo configurado**
> (Resend todavía en placeholder). **Documentado, no corregido** (a pedido). Severidad: 🔴 alta ·
> 🟡 media · 🟢 menor. Archivos: `components/equipo/invite-modal.tsx`,
> `app/(dashboard)/equipo/actions.ts` (`sendTeamInvite`), `app/(auth)/accept-invite/page.tsx`.
> Relacionado: `docs/EMAIL_ADMIN_CONFIG.md` (config de correo / F0).

## Cómo se reprodujo
1. `/equipo` (como Arquitecto) → **Invitar colaborador** → email `yulianamartinez553@gmail.com`.
2. Aparece el fallback manual con: *"No pudimos enviar el email automáticamente… Motivo: The
   tudominio.com domain is not verified…"* + el link + botón **Copiar link**.
3. Click en **Copiar link** → no se ve ningún cambio en la UI (pero sí copia al portapapeles).
4. Al abrir **`/accept-invite?company=<id>`** (el link "pelado", sin el `token_hash`) → la página
   muestra *"No encontramos una invitación para tu email en esta empresa. Pedile al Arquitecto que
   te reinvite."*

---

## Bug #1 — 🟢 "Copiar link" no da feedback visual
`invite-modal.tsx` (~L122-128): el botón hace `navigator.clipboard.writeText(manualLink)` y **no
cambia de estado** → el usuario no sabe si copió. Además no maneja el rechazo de `writeText`
(contextos no seguros / permisos).
- **Fix sugerido:** estado `copied` → el botón muestra **"✓ Copiado"** ~1.5 s; `try/catch` con
  fallback (seleccionar el `<textarea>` que ya está en pantalla).

## Bug #2 — 🟡 `RESEND_FROM` en placeholder `@tudominio.com` (causa del "domain is not verified")
En Vercel, `RESEND_FROM` quedó en el valor de ejemplo `…@tudominio.com`. La lógica de
`sendTeamInvite` decide el camino con `canSendExternalEmail()`, que devuelve **true** porque el `from`
**no es `@resend.dev`** — pero `tudominio.com` **no está verificado en Resend** → Resend rechaza el
envío y se cae al fallback "manual". O sea: el chequeo distingue "modo prueba `@resend.dev`" pero
**no** "dominio puesto pero no verificado".
- **Se resuelve con F0** (verificar el dominio real → `RESEND_FROM` al dominio) **o** configurando el
  remitente en la nueva sección admin **`/correo`** (F1). Mientras tanto, dejar `RESEND_FROM` **vacío**
  haría caer al envío por **Supabase Auth (OTP)** en vez de fallar en Resend.
- **Mejora de robustez sugerida (código):** si Resend responde "domain is not verified", que
  `sendTeamInvite` **reintente por el OTP de Supabase** antes de devolver `via:"manual"`; o validar el
  dominio antes de tomar el camino Resend.
- ✅ **Parcialmente resuelto (2026-06-27):** `sendTeamInvite` ya no usa el gate env-based; ahora
  `mailCanSendExternal()` lee `email_config` → con el dominio verificado en el admin, la invitación
  sale por Resend sin depender de las env vars de Vercel. (También se arregló el test del admin que
  marcaba 403 como "API key inválida".)

## Bug #3 — 🟡 Abrir `/accept-invite?company=…` directo → mensaje engañoso ("No encontramos una invitación")
El link que hay que **abrir/compartir es el magic link completo**:
`…/auth/confirm?token_hash=…&type=magiclink&next=%2Faccept-invite%3Fcompany%3D…`. Ese link
**autentica al invitado como su email** y recién ahí `/accept-invite` matchea la invitación
(`invitations` por `company_id` + `user.email`, ver `accept-invite/page.tsx` L129-134). Si en cambio
se abre el `/accept-invite?company=…` **pelado**:
- **Sin sesión** → debería verse el banner ámbar "abrí el link del email…", pero el flujo igual deja
  llenar el form y recién falla al enviar.
- **Con sesión de otra cuenta** (ej. el Arquitecto probando, o un colaborador ya logueado) → la
  búsqueda por `user.email` no encuentra la invitación de `yuliana@…` → sale **"No encontramos una
  invitación para tu email"**, que es **engañoso** (la invitación SÍ existe; el problema es la sesión
  / haber abierto la URL incorrecta).
- Si la sesión es de un **Arquitecto/owner**, antes salta el guard "Esta sesión es de una cuenta de
  Arquitecto…" (L121).
- **Problemas a mejorar (código):**
  1. El mensaje de error no distingue **"abriste la URL/ sesión equivocada"** de **"no existe la
     invitación"**. Conviene un texto claro: *"Abrí el enlace de invitación que copiaste (empieza con
     `/auth/confirm?...`), no esta página directamente."*
  2. La validación de invitación corre **en el submit**, no al cargar → el invitado llena nombre/cargo
     y recién ahí descubre el problema. Mejor validar al montar y mostrar el estado antes del form.
  3. La UX del **fallback manual** (modal) no aclara que **el link es de un solo uso y lo debe abrir
     el invitado** (no el Arquitecto), idealmente en su dispositivo/navegador.

---

## Nota de prioridad
- **#2 y #3 se mitigan en gran parte con F0**: cuando `RESEND_FROM` apunte a un dominio verificado, el
  colaborador **recibe el email** con el botón "Unirme al equipo" (magic link correcto) → desaparece
  el fallback manual y el dead-end del link pelado.
- Quedan como mejora real, independientes del correo: **#1** (feedback del copiar), y los **textos /
  validación temprana** de `/accept-invite` (#3.1, #3.2) + el **reintento OTP** ante "domain not
  verified" (#2 robustez).
