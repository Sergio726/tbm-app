# INSTRUCCIONES DE SETUP — TBM App
## De cero a producción: Sprint 0 + Sprint 1

---

## ANTES DE EMPEZAR

Todos los archivos de código ya fueron generados por Claude (Cowork) y están en:
```
C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app\
```

Tu trabajo es ejecutar los comandos y configurar los servicios externos.

---

## PASO 1 — Crear el proyecto Next.js

Abrí una terminal y ejecutá:

```bash
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App"

npx create-next-app@latest tbm-app-base --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Cuando te pregunte opciones, aceptá los defaults (Enter en todo).

Después, **copiá los archivos generados encima** del proyecto recién creado:

```bash
# Los archivos en tbm-app/ ya tienen todo configurado.
# create-next-app creó la estructura base — nuestros archivos la reemplazan.
# No necesitás copiar nada manualmente si ya existe la carpeta tbm-app/.
cd tbm-app
```

---

## PASO 2 — Instalar dependencias

```bash
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app"

npm install @supabase/ssr @supabase/supabase-js clsx tailwind-merge lucide-react
npm install -D tailwindcss-animate
```

---

## PASO 3 — Crear proyecto en Supabase

1. Ir a **https://supabase.com** → Sign in → New project
2. Nombre: `tbm-app`
3. Región: `South America (São Paulo)` — la más cercana
4. Generá una contraseña segura y **guardála**
5. Esperá ~2 minutos que termine de crearse

Una vez creado:
- Ir a **Settings → API**
- Copiar:
  - `Project URL` → es tu `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## PASO 4 — Configurar variables de entorno

```bash
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app"
copy .env.local.example .env.local
```

Abrí `.env.local` con cualquier editor y completá:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## PASO 5 — Crear las tablas en Supabase

En Supabase Dashboard → **SQL Editor** → **New query**:

### 5a. Schema base (Sprint 0)
- Copiá el contenido completo de: `tbm-app/supabase/schema.sql`
- Pegalo en el editor → **Run**
- Deberías ver: `Success. No rows returned`

### 5b. Tablas Sprint 1
- Copiá el contenido completo de: `tbm-app/supabase/migration_sprint1.sql`
- Pegalo en el editor → **Run**
- Deberías ver: `Success. No rows returned`

---

## PASO 6 — Configurar autenticación en Supabase

En Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (prod: `https://tbm-app-seven.vercel.app`)
- **Redirect URLs** (agregar):
  - `http://localhost:3000/auth/confirm`
  - `http://localhost:3000/accept-invite`
  - `http://localhost:3000/dashboard`
  - (prod) `https://tbm-app-seven.vercel.app/auth/confirm`
  - (prod) `https://tbm-app-seven.vercel.app/accept-invite`

### Plantilla Magic Link (invitaciones de colaboradores)

En **Authentication → Email Templates → Magic Link**, reemplazá el cuerpo por:

```html
<h2>Te invitaron al equipo</h2>
<p>Hacé clic para confirmar tu email y unirte:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Unirme al equipo</a></p>
```

Sin este cambio, el email llega pero el colaborador puede ver "No hay sesión activa" al abrir el link en el celular.

---

## PASO 7 — Correr localmente

```bash
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app"
npm run dev
```

Abrí **http://localhost:3000** en el browser.

Deberías ver la pantalla de login. Registrate con tu email, creá tu empresa, y vas a ser redirigido al onboarding.

### Verificar que funciona:
- [ ] Pantalla de login se ve
- [ ] Podés registrarte (email + contraseña + nombre de empresa)
- [ ] Sos redirigido al onboarding de 4 pasos
- [ ] El onboarding se guarda y redirige al Dashboard
- [ ] El Dashboard muestra los 8 semáforos con tus scores
- [ ] El selector de energía (emojis) guarda correctamente

---

## PASO 8 — Crear repositorio en GitHub

```bash
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app"

git init
git add .
git commit -m "feat: Sprint 0 + Sprint 1 — auth, onboarding, dashboard"
```

En **https://github.com** → New repository:
- Nombre: `tbm-app`
- Privado ✓
- Sin README (ya tenemos uno)

```bash
git remote add origin https://github.com/TU_USUARIO/tbm-app.git
git branch -M main
git push -u origin main
```

---

## PASO 9 — Deploy en Vercel

1. Ir a **https://vercel.com** → Add New Project
2. Importar el repositorio `tbm-app` de GitHub
3. En **Environment Variables**, agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = (el mismo valor de tu .env.local)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (el mismo valor de tu .env.local)
   NEXT_PUBLIC_APP_URL          = https://tbm-app.vercel.app (o la URL que te asigne Vercel)
   ```
4. Click **Deploy**

Una vez deployado:
- Volver a Supabase → **Authentication → URL Configuration**
- Agregar en Redirect URLs: `https://tu-app.vercel.app/accept-invite`
- Actualizar Site URL a la URL de producción

---

## PASO 10 — Continuar con Claude Code

Una vez que todo lo anterior funciona, podés continuar el desarrollo con Claude Code:

```bash
# Instalar Claude Code (si no lo tenés)
npm install -g @anthropic/claude-code

# Navegar al proyecto
cd "C:\Users\Sebastian\Documents\Claude\Projects\THE BUSINESS MULTIPLIER - App\tbm-app"

# Iniciar Claude Code
claude
```

### Qué decirle a Claude Code para continuar:

Copiá y pegá esto como primer mensaje:

```
Estoy trabajando en TBM App (The Business Multiplier), una app Next.js 14 + 
TypeScript + Tailwind + Supabase. Los Sprints 0 y 1 ya están completos 
(auth, onboarding, dashboard con semáforos, KPIs, energía, invitaciones).

El próximo sprint es Sprint 2 — Rituales Diarios:
- Pre-game personal del Arquitecto (3 Big Wins, Marcha 20 Millas, activación física)
- Warm Up del equipo en tiempo real (QUÉ / POR QUÉ / BLOQUEO, validación del Arquitecto)
- Cool Down (Victory Log obligatorio, Reality Check, Cierre de ciclos)
- Configuración de modo ritual (A/B/C/Diario)
- Historial tipo GitHub contributions

Stack: Next.js 14 App Router, Supabase (RLS habilitado), Tailwind con design 
system TBM (dark mode, colores en tailwind.config.ts).

Por favor leé los archivos del proyecto antes de empezar para entender 
la estructura existente.
```

---

## ESTRUCTURA DE ARCHIVOS ACTUAL

```
tbm-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          ✅ Sprint 0
│   │   │   ├── register/page.tsx       ✅ Sprint 0
│   │   │   └── accept-invite/page.tsx  ✅ Sprint 1
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ✅ Sprint 0
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx            ✅ Sprint 1
│   │   │   │   └── kpis/page.tsx       ✅ Sprint 1
│   │   │   └── onboarding/page.tsx     ✅ Sprint 1
│   │   ├── globals.css                 ✅ Sprint 0
│   │   ├── layout.tsx                  ✅ Sprint 0
│   │   └── page.tsx                    ✅ Sprint 0
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx             ✅ Sprint 0
│   │   │   └── header.tsx              ✅ Sprint 0
│   │   └── dashboard/
│   │       ├── EnergySelector.tsx      ✅ Sprint 1
│   │       └── KpiCard.tsx             ✅ Sprint 1
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               ✅ Sprint 0
│   │   │   └── server.ts               ✅ Sprint 0
│   │   └── utils.ts                    ✅ Sprint 0
│   └── types/
│       └── database.ts                 ✅ Sprint 0+1
├── supabase/
│   ├── schema.sql                      ✅ Sprint 0 — EJECUTAR PRIMERO
│   └── migration_sprint1.sql           ✅ Sprint 1 — EJECUTAR SEGUNDO
├── middleware.ts                        ✅ Sprint 0+1
├── tailwind.config.ts                  ✅ Sprint 0
├── .env.local.example                  ✅ Sprint 0
└── package.json                        ✅ Sprint 0
```

---

## POSIBLES ERRORES Y SOLUCIONES

**Error: "Cannot find module '@/lib/supabase/client'"**
→ Verificar que `tsconfig.json` tiene `"@/*": ["./src/*"]` en paths.

**Error: "supabaseUrl is required"**
→ El `.env.local` no está configurado o falta reiniciar el servidor (`Ctrl+C` → `npm run dev`).

**Error al correr schema.sql: "already exists"**
→ La tabla ya existe. Podés ignorar el error o agregar `IF NOT EXISTS` a cada `CREATE TABLE`.

**El login redirige en loop**
→ Verificar en Supabase → Authentication → URL Configuration que el Site URL es `http://localhost:3000`.

**TypeScript errors en build**
→ Correr `npm run type-check` para ver los errores específicos antes de hacer build.

---

*Generado por Claude (Cowork) — The Business Multiplier App*
*Sprint 0 ✅ + Sprint 1 ✅ — Próximo: Sprint 2 (Rituales)*
