# Deploy en Dokploy (Docker)

Guía para deployar el monorepo en **Dokploy** con Docker. El repo trae todo lo
necesario: `output: standalone` en ambas apps, un `Dockerfile` por app y
`.dockerignore`. Los builds fueron verificados localmente (generan el
`server.js` standalone en la ruta que apunta cada Dockerfile).

> El monorepo son **dos apps Next.js** independientes → **dos servicios** en Dokploy:
> - `apps/web` (**tbm-app**) — la app de los clientes · puerto **3000**
> - `apps/admin` (**tbm-admin**) — el panel god-mode interno · puerto **3001**
>
> Podés deployar solo una si querés (p. ej. `web` en Dokploy y `admin` en Vercel).

---

## 1. Crear el servicio de `web` en Dokploy

**Application** nueva, tipo **Docker**, conectada a este repo (branch `main`):

| Campo | Valor |
|---|---|
| Build Type | **Dockerfile** |
| Build Path / Context | `.` (la **raíz** del repo — obligatorio por los npm workspaces) |
| Dockerfile Path | `apps/web/Dockerfile` |
| Puerto expuesto | `3000` |
| Dominio | `app.tudominio.com` |

**Variables** (ver [`apps/web/.env.dokploy.example`](../apps/web/.env.dokploy.example)):
- Las `NEXT_PUBLIC_*` van como **build args / build-time** (se inlinean en el bundle).
- El resto (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `RESEND_*`, `ANTHROPIC_API_KEY`,
  `STRIPE_*`, `DC_*`) van como **runtime**.
- **`NEXT_PUBLIC_APP_URL` es obligatoria** y debe ser el dominio real (sin ella no
  salen las invitaciones ni los links del cron).

## 2. Crear el servicio de `admin`

Igual que el anterior pero:

| Campo | Valor |
|---|---|
| Dockerfile Path | `apps/admin/Dockerfile` |
| Puerto expuesto | `3001` |
| Dominio | `admin.tudominio.com` |

**Variables** (solo 3, ver [`apps/admin/.env.dokploy.example`](../apps/admin/.env.dokploy.example)):
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (build) y
`SUPABASE_SERVICE_ROLE_KEY` (runtime).

---

## 3. El cron (⚠️ NO se migra solo desde Vercel)

`vercel.json` (el cron diario de emails + alerta 72h) **no lo ejecuta Dokploy**. Hay
que reemplazarlo por un **Schedule** de Dokploy (o un cron del host) que pegue al
endpoint una vez al día:

```bash
curl -fsS -X GET https://app.tudominio.com/api/cron/daily \
  -H "Authorization: Bearer $CRON_SECRET"
```

- En Dokploy: **Schedules** → cron `0 11 * * *` (o el horario que prefieras) con ese comando.
- Usá el **mismo `CRON_SECRET`** que cargaste en el servicio `web`.
- Sin esto, DC deja de mandar el digest matinal, la alerta de tareas vencidas y el
  recordatorio de "armá el próximo ciclo".

> Nota de escala (auditoría T6): ese cron es un monolito secuencial. Sirve para pocas
> empresas; a gran escala hay que pasarlo a dispatcher + worker (ver `auditoria.md`).

---

## 4. Stripe (si activás pagos)

- El webhook queda en `https://app.tudominio.com/api/stripe/webhook`; registralo en el
  dashboard de Stripe y cargá `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` en `web`.
- Cargá los paquetes en la tabla `credit_packages` (recién ahí aparece la UI de compra).
- Detalle en [`CHECKLIST_POST_MIGRACION.md`](../CHECKLIST_POST_MIGRACION.md) §4.

---

## 5. Notas / troubleshooting

- **Node 20** (fijado en `.nvmrc` y en los Dockerfiles con `node:20-alpine`).
- **Healthcheck:** apuntá el de Dokploy a `/` (o a `/login`) en cada puerto.
- **`sharp` / imágenes:** las imágenes se sirven con `<img>` (no `next/image`
  optimizado), así que Alpine alcanza. Si en el futuro se usa `next/image` con
  optimización y falla en Alpine, cambiar la base de los Dockerfiles a `node:20-slim`.
- **Build localmente** (para reproducir el de Dokploy), desde la raíz:
  ```bash
  docker build -f apps/web/Dockerfile   -t tbm-web   \
    --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
    --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
    --build-arg NEXT_PUBLIC_APP_URL=... .
  docker build -f apps/admin/Dockerfile -t tbm-admin \
    --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
    --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... .
  ```
- **Compatibilidad con Vercel:** `output: "standalone"` no rompe el deploy de Vercel
  (Vercel usa su propio adaptador e ignora esa opción), así que podés mantener ambos
  en paralelo durante la migración.
