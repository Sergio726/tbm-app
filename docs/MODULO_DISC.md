# Módulo DISC + Mi Equipo (M3)

Documentación del módulo de evaluación DISC y gestión de equipo.
Última actualización: 2026-05-30.

---

## 1. Qué hace

- **Test DISC dentro de la app** mediante un **link público con token** (`/disc/[token]`): la persona responde sin loguearse y su perfil se **calcula y guarda automáticamente**.
- **Motor de evaluación** portado fielmente del evaluador HTML de Dilio: 24 grupos de 4 palabras (ipsativo MÁS/MENOS) → puntajes D/I/S/C → segmentos 1–7 → uno de **16 perfiles**.
- **Mapa del equipo** (`/equipo`): el Arquitecto ve el perfil DISC, nivel LOS, alineación rol↔perfil y KPI de cada miembro; genera links de test, invita colaboradores y sube el informe PDF.
- **Informe híbrido**: núcleo estructurado y fiel (siempre) + **síntesis narrativa con IA** (opcional, cacheada).
- **Aviso Realtime**: cuando un miembro completa el test, al Arquitecto le aparece un toast en `/equipo`.

---

## 2. Arquitectura y archivos

### Lógica / datos
- `src/lib/disc-evaluator.ts` — **motor**: `WORD_GROUPS` (24), `SEG_TABLE`, `CLASSIC_PATTERNS`, `DISC_PROFILES_FULL` (16 perfiles), `computeDisc()`. Verificado: `S=6,C=5,D=4,I=3 → "Especialista" / SC` (coincide con informe real).
- `src/lib/disc.ts` — colores, `DISC_FACTORS` (luz/sombra/temor/howToManage), `DISC_DIMENSIONS` (significado de cada letra), `LOS_LEVELS`, `ALIGNMENT_ACTION`, `computeAlignment()`, helpers de normalización.
- `src/lib/disc-words.ts` — glosario de las **89 palabras** del test (definición corta + `wordDefinition()`).
- `src/lib/ai-report.ts` — **server-only**: `generateDiscNarrative()` vía `fetch` a la API de Anthropic. Gateado por `ANTHROPIC_API_KEY`; sin clave o ante error devuelve `null`.

### Test público (fuera de auth)
- `src/app/disc/[token]/page.tsx` — server: valida token vía RPC `get_disc_assessment`; si completado muestra resultado, si no, el test.
- `src/app/disc/[token]/actions.ts` — server action `submitDisc`: `computeDisc` → genera narrativa IA → persiste vía RPC `submit_disc`.
- `src/components/disc/disc-test.tsx` — cuestionario (intro educativa, glosario por palabra, auto-avance, cronómetro, momentum, transición).
- `src/components/disc/disc-result.tsx` — resultado: síntesis IA, barras, Luz/Sombra, perfil en detalle, glosario, referencia.

### Equipo
- `src/app/(dashboard)/equipo/page.tsx` — trae team + `disc_assessments`.
- `src/components/equipo/equipo-client.tsx` — ficha del miembro, generar link, alineación automática, invitar, subir PDF, **toast realtime**.

### Infra
- `middleware.ts` — `/disc/` agregado a rutas públicas.
- `src/types/database.ts` — tipos extendidos a mano (tabla `disc_assessments`, columnas nuevas en `profiles`, RPCs).

---

## 3. Base de datos (Supabase — proyecto `onzsxbghmyuqykiejpxw`)

Migraciones en `supabase/` (se aplican en el **SQL Editor** del proyecto; el MCP no llega a esta cuenta):

- `migration_sprint3_disc.sql` — tabla `disc_assessments` (+RLS), columnas `cargo/disc_profile_key/disc_scores` en `profiles`, RPCs `submit_disc` / `get_disc_assessment` (SECURITY DEFINER), bucket privado `disc-reports` (+policies).
- `migration_sprint4_disc_ux.sql` — columna `ai_narrative`, `submit_disc` con `p_narrative`, `get_disc_assessment` la devuelve, **Realtime** en `disc_assessments`.

> Estado: **ambas aplicadas** (sprint 3 y sprint 4).

**Seguridad del token público:** la escritura del resultado va por la RPC `submit_disc` (SECURITY DEFINER, `search_path=''`), no por UPDATE directo de `anon`. El token secreto autoriza.

---

## 4. Variables de entorno (Vercel)

Configurar en Vercel → Project → Settings → Environment Variables:

| Variable | Requerida | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | anon key |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL pública (links de invitación y de test). En prod = dominio Vercel |
| `ANTHROPIC_API_KEY` | ⬜ opcional | Habilita la síntesis IA del informe. Sin ella, informe estático |
| `DISC_AI_MODEL` | ⬜ opcional | Modelo (default `claude-haiku-4-5`) |

> `NEXT_PUBLIC_APP_URL` debe apuntar al dominio de producción para que los links de invitación/test funcionen en el deploy.

---

## 5. Estado — Realizado ✅

- [x] Motor de evaluación (24 grupos → 16 perfiles) + verificación.
- [x] Test público con token + scoring + persistencia automática.
- [x] Alineación rol↔perfil automática (sugerencia + override manual).
- [x] Invitar colaboradores (invitations + OTP, reusa onboarding).
- [x] Subir informe PDF a bucket privado (signed URL).
- [x] Migraciones DB (sprint 3 y 4) aplicadas; RLS + RPCs + bucket + realtime.
- [x] **UX educativa**: intro "¿Qué es el DISC?", 4 energías, glosario de las 89 palabras a demanda, feedback en vivo del campo Letras DISC.
- [x] **Test dinámico (combo)**: auto-avance, cronómetro, frases de momentum, transición animada.
- [x] **Resultado enriquecido**: Luz/Sombra, secciones tipo informe, glosario de letras, saludo con nombre.
- [x] **Síntesis con IA** (híbrida, cacheada, gateada por env).
- [x] **Aviso Realtime** en `/equipo` (toast + "Actualizar").
- [x] Micro-referencias por sección en `/equipo`.
- [x] **Movimiento / "dopamina"**: `ProfileIcon` con emoji animado de Google (Noto WebP por CDN) + halo de color y fallback CSS (`src/components/disc/profile-icon.tsx`); reveal del resultado (barras que crecen + cards en cascada); micro-interacciones del test (pop en MÁS/MENOS, realce de palabra, pulso de progreso); `prefers-reduced-motion` respetado. Keyframes en `globals.css`.
- [x] `tsc --noEmit` y `next build` limpios.
- [x] **KPI obligatorio**: no se puede guardar un rol sin su KPI principal (botón bloqueado + aviso + guard en `handleSave`).

---

## 6. Estado — Pendiente ⏳

### 6.1 Otras mejoras detectadas
- Compartir/descargar el informe del resultado (PDF propio de la app).
- Afinar tono/largo del prompt de la síntesis IA sobre casos reales.
- Quitar el warning de Turbopack por doble lockfile (raíz + tbm-app) seteando `turbopack.root`.

---

## 7. Deploy a Vercel

1. Asegurar las **migraciones aplicadas** (sprint 3 y 4) en el proyecto Supabase de producción.
2. Cargar las **variables de entorno** (sección 4) en Vercel.
3. Push a `main` → Vercel buildea (`next build`, ya verificado en verde).
4. Verificación post-deploy: `/disc/<token-falso>` debe mostrar "Link inválido" (200); generar un link real desde `/equipo` y completar el test.
