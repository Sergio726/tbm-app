# Recuperación de acceso a Supabase — Runbook

> Última actualización: 2026-06-13. Mantener este archivo como fuente única de la
> incidencia hasta resolverla.

## 1. Resumen de la incidencia

- **Proyecto en producción:** `onzsxbghmyuqykiejpxw` (`https://onzsxbghmyuqykiejpxw.supabase.co`).
- **Síntoma:** al loguearse en supabase.com con `sergio.sebass03@gmail.com`, el
  proyecto **no aparece** en la cuenta, pero la **base sigue viva** (la API REST
  responde y el login de usuario de la app funciona — verificado 2026-06-13).
- **Diagnóstico (CONFIRMADO vía MCP, 2026-06-14):** no es pérdida de datos, es un
  problema de **propiedad**. El proyecto pertenece a **otra cuenta de Supabase**
  (otro email), no a la que se usa para entrar.
- **Ticket de soporte:** **SU-395249** (canal formal para restablecer/transferir el proyecto).

### Cuentas en juego
- **Dashboard / dueño de la org "TBM Org":** `sebastian.soporte.tbm@gmail.com`
  (org id `tsrojzcgrnalbtrwrvhu`, plan free). Es la cuenta que controlamos hoy.
- **Usuario de la app (auth de la base):** `sergio.sebass03@gmail.com`
  (id `ee600008-2c94-43e1-ba06-6c521590c50e`).
- **Dueño del proyecto perdido `onzsxbghmyuqykiejpxw`:** una **tercera** cuenta
  desconocida (ni "TBM Org" ni "plataformaz" lo contienen).

### Evidencia del diagnóstico (MCP de Supabase, cuenta sebastian.soporte.tbm@gmail.com)
- `list_organizations` → una sola org: **`TBM Org`** (`tsrojzcgrnalbtrwrvhu`), plan free.
- `list_projects` → **vacío** (`[]`). No tiene ningún proyecto.
- `get_project(onzsxbghmyuqykiejpxw)` → **"You do not have permission to perform this action"**.

Conclusión: el proyecto real `onzsxbghmyuqykiejpxw` vive bajo **otra cuenta**.
Recuperación = entrar con el email correcto de esa otra cuenta, o pedir
transferencia a soporte (SU-395249). **Decisión 2026-06-14:** reconstruir en un
proyecto nuevo dentro de "TBM Org" (cuenta `sebastian.soporte.tbm@gmail.com`).

### ✅ MIGRACIÓN EJECUTADA (2026-06-14)
- **Proyecto nuevo:** `fozhnfxehbbgqaerprgf` — `https://fozhnfxehbbgqaerprgf.supabase.co`
  (org TBM Org `tsrojzcgrnalbtrwrvhu`, región sa-east-1, plan free, $0).
- **Esquema:** 13 SQL aplicados en orden vía MCP `apply_migration`. 27 tablas, RLS ok.
- **Usuario:** `sergio.sebass03@gmail.com` recreado (signup + email confirmado por SQL).
  Nuevo `auth.users.id` = `69a0867d-02e1-442a-83b1-e579df4f3857`.
- **Datos:** 27 filas importadas con `scripts/import-as-user.mjs` (REST autenticado
  como el usuario, RLS respetada) remapeando el UID viejo → nuevo. Verificado: el
  perfil quedó arquitecto/STLabs y la app lee companies/profiles/kpis/tasks por RLS.
- **Config:** `.env.local` apunta al proyecto nuevo. **PENDIENTE:** actualizar las
  env vars en **Vercel** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  y las URL de Authentication (Site URL + Redirect URLs) en el proyecto nuevo, y
  reiniciar el `npm run dev` para que tome el nuevo `.env.local`.
- **No migrado:** Storage (avatar). El proyecto viejo `onzsxbghmyuqykiejpxw` queda
  pendiente de transferencia/baja según resuelva soporte (SU-395249).

## 2. Evidencia de que la base está viva (para soporte)

- Login de usuario vía REST (`/auth/v1/token`) → **200 OK**, usuario
  `sergio.sebass03@gmail.com` (id `ee600008-2c94-43e1-ba06-6c521590c50e`).
- Export de tablas vía REST → 27 filas recuperadas (ver `tbm-app/backups/`).
- Anon key y URL del proyecto siguen siendo válidas (en `.env.local`).

## 3. Track A — Recuperar el dashboard

### Pasos del lado del usuario
1. **Revisar todas las organizaciones** en supabase.com: el selector de org (arriba
   a la izquierda) puede estar ocultando la org dueña (p. ej. "TBM Corp"). Cambiar
   de org y buscar el proyecto `onzsxbghmyuqykiejpxw`.
2. **Probar con otros emails/cuentas** que se hayan podido usar al crear el proyecto
   (hay indicios de más de una cuenta/org; existe otro ref histórico
   `klbmggtrwyvapzljszqo`).
3. Si no aparece en ninguna org propia → es de otra cuenta: **resolver vía soporte**.

### Plantilla de respuesta para el ticket SU-395249
```
Asunto: SU-395249 — Recuperar acceso / transferir proyecto onzsxbghmyuqykiejpxw

Hola, equipo de Supabase.

No puedo ver el proyecto onzsxbghmyuqykiejpxw en mi cuenta
(sergio.sebass03@gmail.com), pero la base sigue activa: su API REST responde 200
y puedo autenticar usuarios de la app contra ella.

Necesito:
1) Confirmar bajo qué email/organización está actualmente el proyecto
   onzsxbghmyuqykiejpxw.
2) Transferirlo a mi cuenta/organización (la que controlo con este email), o
   indicarme cómo recuperar el acceso de propietario.

Datos:
- Project ref: onzsxbghmyuqykiejpxw
- URL: https://onzsxbghmyuqykiejpxw.supabase.co
- Email de mi cuenta actual: sergio.sebass03@gmail.com
  (su única organización es "TBM Org" / tsrojzcgrnalbtrwrvhu, sin proyectos).
- Con esta cuenta, la Management API devuelve "You do not have permission to
  perform this action" al pedir el proyecto onzsxbghmyuqykiejpxw — es decir, el
  proyecto está bajo otra cuenta/organización.
- Evidencia de que está vivo: login REST 200 el 2026-06-13/14.

Gracias.
```

## 4. Track B — Reconstruir en un proyecto nuevo (contingencia)

Solo si soporte **no** restablece el acceso. Tiempo estimado: < 1 hora.

### 4.1. Crear proyecto nuevo
- Crear un proyecto Supabase en una organización que controles.
- Anotar: `Project URL`, `anon/publishable key` y `service_role key`
  (Settings → API).

### 4.2. Aplicar el esquema — **orden exacto**
Correr en el **SQL Editor** del proyecto nuevo, en este orden (fuente:
`tbm-app/supabase/README.md`):

1. `schema.sql`
2. `migration_sprint1.sql`
3. `migration_sprint2.sql`
4. `fix_rls_recursion.sql`
5. `migration_sprint3_disc.sql`
6. `migration_sprint4_disc_ux.sql`
7. `migration_sprint5_roles.sql`
8. `migration_sprint6_account.sql`
9. `migration_sprint7_equipo.sql`
10. `migration_sprint8_delegacion.sql`
11. `migration_sprint9_feedback.sql`
12. `migration_sprint10_plan90d.sql`
13. `migration_sprint11_workbooks.sql`

> Los archivos son idempotentes donde se puede. `fix_perfil_corrupto.sql` es
> limpieza puntual: **no** hace falta en una base nueva.

### 4.3. Crear el usuario en Auth
- Authentication → Users → **Add user** con `sergio.sebass03@gmail.com`.
- Copiar el **id** del usuario creado → ese es el `NEW_UID`.

### 4.4. Importar los datos del backup
Usar el backup más reciente de `tbm-app/backups/`. El importador remapea el id
viejo (`ee600008-2c94-43e1-ba06-6c521590c50e`) al `NEW_UID` y respeta el orden FK:

```powershell
$env:TARGET_SUPABASE_URL = "https://<nuevo-ref>.supabase.co"
$env:TARGET_SERVICE_ROLE_KEY = "<service_role del proyecto NUEVO>"
node scripts/import-data.mjs backups/<fecha> <NEW_UID>
```

(El `OLD_UID` por defecto ya es el correcto; se puede pasar como 3er argumento si cambia.)

### 4.5. Actualizar configuración de la app
- `tbm-app/.env.local` y **Vercel** → variables del proyecto nuevo:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Authentication → URL Configuration del proyecto nuevo: Site URL + Redirect URLs
  (`https://<dominio>/**`, `https://*.vercel.app/**`, `http://localhost:3000/**`).

### 4.6. Verificar
- `npm run dev` en `tbm-app`, login, y revisar que se ven companies/profiles/tasks/etc.
- Revisar Advisors → Security tras los cambios de RLS.

## 5. Backup completo (cuando se recupere el acceso)
Si se recupera el dashboard (Track A), copiar la `service_role key` y correr un
backup **completo** (todas las filas + todos los usuarios de auth, bypass RLS):

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "<service_role>"
node scripts/backup-data.mjs
```

El script detecta la service_role automáticamente y cambia a modo completo.

## 6. Mapeo de identidades
- Usuario original (`auth.users.id`): `ee600008-2c94-43e1-ba06-6c521590c50e`
- Empresa (`companies.id`, se preserva): `4306e831-4781-47fb-9cca-fa677e9365ea`
- En el proyecto nuevo, el `auth.users.id` cambia → se remapea con `import-data.mjs`.

## 7. Límites conocidos
- El backup actual es **parcial** (RLS, 1 usuario). Como hoy la app tiene 1 empresa
  y 1 usuario, cubre casi todo el dato real, pero **no** filas de otros usuarios,
  ni `auth.users` interno completo, ni triggers/funciones/policies (eso está en
  `supabase/*.sql`).
- **Storage** (avatares, reportes DISC) NO se migra con `import-data.mjs`: las URLs
  apuntan al proyecto viejo. Re-subir desde la app si hace falta.
- Un `pg_dump` total solo es posible con `service_role` o acceso al dashboard.
