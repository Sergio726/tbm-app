# AGENTS.md

Instrucciones obligatorias para asistentes de IA (Claude Code u otros) trabajando en este repo.

---

## 1. Mantener `PROGRESS.md` actualizado — siempre

[`PROGRESS.md`](PROGRESS.md) en la raíz es la **fuente de verdad del estado del proyecto** por sprint.

**Regla:** cada vez que cerrás o abrís una pieza de un sprint, **actualizá `PROGRESS.md` en el mismo commit**.

Esto incluye:
- Cambiar el estado de un sprint (❌ → 🟡 → ✅) cuando arranca o cierra.
- Tachar líneas de "Falta…" cuando esa pieza queda lista.
- Actualizar la "Última actualización" y el contador de completitud cuando cambie el conteo.
- Agregar piezas nuevas que no estén en el plan al final, con referencia al CHANGELOG v1.1 si aplica.

Si tu cambio no toca el estado de ningún sprint (refactor, bug fix menor, docs sueltos) no hace falta tocar `PROGRESS.md`. Pero ante la duda, abrilo y revisalo.

**No crear archivos paralelos** tipo `STATUS.md`, `SPRINT_PROGRESS.md`, `ROADMAP.md`, etc. Todo va en `PROGRESS.md`.

---

## 2. Fuente de verdad del método y el plan

Antes de empezar un sprint o tomar una decisión de producto, leer:

- [`docs/SPRINTS.md`](docs/SPRINTS.md) — plan completo S0–S14 + **CHANGELOG v1.1** al inicio con las 18 respuestas oficiales del autor del método (Dilio Donado). El CHANGELOG es la fuente de verdad ante cualquier discrepancia con el plan original.
- [`docs/SPEC.md`](docs/SPEC.md) — especificación de módulos.
- [`docs/DISCOVERY.md`](docs/DISCOVERY.md) — base del método TBM.

---

## 3. Stack y convenciones

- **Frontend:** Next.js 14 App Router · TypeScript · Tailwind CSS
- **DB/Auth/Realtime/Storage:** Supabase
- **Email:** Resend
- **Deploy:** Vercel (auto-deploy de `main`)
- **Shadcn:** **no instalado**. El proyecto tiene el scaffold (vars CSS en `globals.css`, `cn()` en `lib/utils.ts`, `tailwindcss-animate`) pero ningún componente `src/components/ui/*`. Todos los componentes son custom: Tailwind classes + `style={{}}` para colores dinámicos.

### Naming crítico (no romper)

- **"Diagnóstico Organizacional TBM"** = diagnóstico de 8 áreas del S1.
- **"Team Performance Scorecard"** = KPI individual por colaborador del S7 (Ley de Pearson).
- Confundirlos rompe la consistencia del método (ver CHANGELOG v1.1 · I4).

### Rituales (S2) — no confundir

- **Pre-game** = matutino y **personal** del Arquitecto (3 Big Wins personales + Marcha de 20 Millas).
- **Los 5 Grandes** = nocturno y **del negocio** (5 prioridades para el día siguiente, alineadas a Rocas del Plan 90D).
- **War Up** = sala en **vivo** con el equipo (Supabase Realtime), no formulario asincrónico.
- **Cool Down del viernes** = genera el **Reporte Semanal automáticamente**.
- **Parking Lot** = ítems del War Up o Los 5 Grandes que no están alineados a una Roca.

---

## 4. Reglas de proceso

1. **Un módulo a la vez.** No abrir el sprint siguiente sin cerrar el actual en `PROGRESS.md`.
2. **Componentes pequeños.** Un componente por archivo. Si supera ~300 líneas, evaluar split.
3. **Commits descriptivos** por feature completa. Conventional Commits: `feat(s2): …`, `fix(equipo): …`, `refactor(rituales): …`.
4. **La app vive en producción** desde S0 — cualquier push a `main` deploya en Vercel. Antes de pushear, considerar si rompe rutas existentes.
5. **Migraciones SQL** van en `supabase/` con nombre `migration_sprintN_<tema>.sql`. Actualizar `supabase/README.md` con el orden de aplicación y la tabla de PROGRESS.md con qué sprint cubre.
6. **Numeración de migraciones ≠ número de sprint del plan.** Las migraciones se numeraron por orden de creación. Cruzar con la tabla de `PROGRESS.md` para saber qué cubre cada una.

---

## 5. Variables de entorno

Ver `.env.local.example` para la lista completa. Mínimos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

En dev local: `NODE_TLS_REJECT_UNAUTHORIZED=0` es aceptable solo para evitar el error `UNABLE_TO_VERIFY_LEAF_SIGNATURE` cuando un antivirus/proxy rompe la cadena de certs hacia Supabase. **Nunca en producción.**

---

## 6. Diseño y referencia visual

Cuando hay un bundle de diseño (export de Claude Design u otro), descomprimirlo en `.design/` (gitignored). Leer los `.jsx` o `.html` como **referencia visual** y traducirlos a Next/Tailwind. No copiar la estructura interna del prototipo si no encaja con el codebase — replicá el output visual, no el código.

Ejemplo: el módulo `/equipo` actual está basado en `.design/tbm-app/project/Mi Equipo.html` y sus 12 .jsx asociados.
