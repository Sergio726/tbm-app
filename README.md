# The Business Multiplier App
**Sistema Operativo de Negocios** — Método TBM de Dilio Donado  
Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## Setup inicial (Sprint 0)

### 1. Prerequisitos
- Node.js ≥ 18
- npm ≥ 9
- Cuenta en [Supabase](https://supabase.com) (free tier)
- Cuenta en [Vercel](https://vercel.com) (free tier)

### 2. Clonar e instalar

```bash
# Crear el proyecto Next.js (si no existe aún)
npx create-next-app@latest tbm-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd tbm-app

# Instalar dependencias adicionales
npm install @supabase/ssr @supabase/supabase-js clsx tailwind-merge lucide-react
npm install -D tailwindcss-animate

# Copiar los archivos de este Sprint 0 al proyecto
# (reemplazar src/, middleware.ts, tailwind.config.ts, etc.)
```

### 3. Configurar Supabase

```bash
# 1. Ir a https://supabase.com/dashboard → New project
# 2. Copiar URL y anon key (Settings → API)
# 3. Crear variables de entorno:

cp .env.local.example .env.local
# Editar .env.local con tus valores reales
```

#### Crear las tablas en Supabase

```bash
# En Supabase Dashboard → SQL Editor → New query
# Pegar el contenido de: supabase/schema.sql
# Ejecutar (Run)
```

### 4. Correr localmente

```bash
npm run dev
# Abrir http://localhost:3000
```

Deberías ver la pantalla de login. Podés registrarte, crear tu empresa, e iniciar sesión.

### 5. Deploy en Vercel

```bash
# En https://vercel.com → Import Git Repository
# Agregar las variables de entorno:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_APP_URL → https://tu-app.vercel.app
```

---

## Estructura del proyecto

```
tbm-app/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login + Register (rutas públicas)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/         # Rutas protegidas
│   │   │   ├── layout.tsx       # Sidebar + verificación de sesión
│   │   │   └── dashboard/page.tsx
│   │   ├── globals.css          # Design system TBM
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Redirect → /dashboard
│   ├── components/
│   │   └── layout/
│   │       ├── sidebar.tsx      # Navegación con 9 módulos TBM
│   │       └── header.tsx       # Header con empresa + avatar
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   └── server.ts        # Server/SSR client
│   │   └── utils.ts             # cn(), semaforoClass(), etc.
│   └── types/
│       └── database.ts          # Tipos TypeScript del schema
├── supabase/
│   └── schema.sql               # Tablas + RLS + Triggers
├── middleware.ts                 # Protección de rutas
├── tailwind.config.ts            # Paleta TBM
├── .env.local.example
└── package.json
```

---

## Criterio de éxito Sprint 0

> Puedo ir a `tbm-app.vercel.app`, registrarme con mi empresa,
> iniciar sesión, ver el sidebar con los 9 módulos, y cerrar sesión.
> Los datos se guardan en Supabase real.

---

## Módulos TBM (9 en total)

| # | Módulo | Sprint | Estado |
|---|--------|--------|--------|
| M1 | Dashboard Central | S1 | 🔜 |
| M2 | Rituales (Pre-game/Warm Up/Cool Down) | S2 | 🔜 |
| M3 | Mi Equipo (DISC + LOS) | S3 | 🔜 |
| M4 | Delegación (Pase de Estafeta) | S4 | 🔜 |
| M5 | Feedback S.E.C. | S5 | 🔜 |
| M6 | Plan 90D (Rocas + Arena) | S6 | 🔜 |
| M7 | Workbooks S1–S8 | S7–S8 | 🔜 |
| M8 | Multiplicador | S7 | 🔜 |
| M9 | Diagnósticos & Scorecards | S8 | 🔜 |

---

## Comandos útiles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run type-check   # Verificar tipos TypeScript sin compilar
npm run lint         # ESLint
```

---

*The Business Multiplier App — Sprint 0 completado*
