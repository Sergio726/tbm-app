# Observaciones de Dilio Donado — round jun-2026

> **Origen:** feedback de Dilio (cliente/dueño de la metodología) registrado a
> inicios de junio 2026, + tareas que Sebastian reconoció pendientes en esa misma
> conversación.
> **Cruce contra el código:** 2026-06-15 (estado real del repo, post S12–S17).
> **Alcance de este doc:** solo lo que toca la **app TBM**. Los proyectos externos
> (funnel GoHighLevel, IA de campañas, módulo financiero, cliente Venezuela,
> hosting) se listan al final como **fuera de scope** para no perderlos, pero no
> son backlog de este repo.

**Para implementar en sesiones futuras.** Este documento es la fuente única de
este round de feedback; cuando una pieza se cierra, marcarla acá y reflejarla en
[`PROGRESS.md`](../PROGRESS.md).

---

## Leyenda

- ✅ **Ya cubierto** — hecho en sprints recientes (S12–S17), no re-implementar.
- 🟡 **Parcial** — la base existe; falta exactamente lo que pide Dilio.
- ❌ **Pendiente** — feature nueva, no hay nada todavía.
- ⛔ **Bloqueado** — depende de contenido/insumo que debe entregar Dilio.

---

## A. Metodología, rituales y experiencia de usuario

### A1 · Recordatorio anticipado de "armá el próximo ciclo" — ✅ (2026-06-20)
Dilio: el sistema debe **recordar 30 días antes** que hay que armar el siguiente
sprint, como parte del ecosistema de trabajo.

- **Hecho:** bloque nuevo en el cron diario (`src/app/api/cron/daily/route.ts`) que,
  por empresa, calcula el día del ciclo 90D desde el `created_at` del scorecard baseline
  (misma fórmula que el Hero Strip del dashboard) y, cuando quedan **≤30 días**, avisa
  al/los **Arquitecto(s)**: notificación in-app (`type: cycle_reminder`, ícono 🗓️) +
  email, con CTA a `/plan-90d`. **Una sola vez por ciclo** (dedup 60 días). No requirió
  tabla nueva. Verificado E2E (no-dispara mid-ciclo · dispara a 30 días · dedup).
- **Decisión tomada (Sebas, 2026-06-20):** 30 días **fijo**, **un solo aviso**, solo al
  Arquitecto. La **secuencia 30/15/7** y el umbral configurable quedan como extensión
  futura si Dilio lo pide.

### A2 · "Que fluya" / practicidad — 🟡 (principio, no feature)
Principio de diseño transversal, no una tarea cerrable. Se aplica en cada mejora
de UX. No se documenta como item de backlog con estado.

### A3 · Pre-game: meditaciones + hábitos en checklist + mobile-first — 🟡 (pieza 1 ✅ / pieza 2 ⛔)
Dilio quiere que el Pre-game (ritual matutino, se hace al levantarse **desde el
celular**) incluya:
- **Meditaciones** — Dilio está escribiendo **365 meditaciones de autoliderazgo**.
- **Hábitos sugeridos** (gym, meditar, tomar agua, no comer azúcar en la mañana…).
  El usuario **no hace todos**: elige algunos (5–10) y los marca como checklist.

- **Estado, en 2 piezas:**
  1. ✅ **Checklist de hábitos (A3.1, hecho 2026-06-19):** sección "Hábitos de hoy"
     en el Pre-game (`HabitsChecklist.tsx` + `HabitsPicker.tsx`, catálogo en
     `src/lib/habits.ts`). Catálogo curado por categorías (movimiento/mente/cuerpo/
     nutrición) **+ hábito propio**; el usuario elige hasta 10 y los marca de **un
     toque** (optimista, sin botón guardar) con **anillo de progreso del día** y
     micro-celebración al completar todos. Tablas `user_habits` + `habit_logs` (RLS
     por usuario, soft-remove con `is_active`). Mobile-first (chips grandes, sheet a
     pantalla completa, inputs 16px).
  2. **Meditaciones del día** — ⛔ **bloqueado**: requiere que Dilio entregue las
     365 meditaciones (formato/estructura a definir: texto, audio, rotación diaria).
- **Crítico (Dilio insiste):** esta sección debe estar **optimizada para móvil**.
  El checklist se construyó mobile-first; al sumar las meditaciones, revisar el
  layout completo del Pre-game.

### A4 · Parking lot + interfaz más práctica — ✅ base / 🟡 pulido
- **Hoy:** el Parking Lot existe (S2, `/rituales/parking-lot`).
- **Pendiente:** pulido iterativo de UX para que "fluya". No es construir, es
  refinar. Se trata como mejora continua, no como feature bloqueante.

> **Obsoleto:** la nota de Sebastian "el dashboard es solo un ejemplo visual"
> quedó superada — S12/S13 conectaron el dashboard a datos reales (Hero Strip,
> tendencias por área, rituales de hoy). Lo único abierto es **definir con Dilio
> qué métricas priorizar**, no construir el contenedor.

---

## B. DISC y reportes

### B1 · Perfil de rango: solo lo ve el líder — ✅ (seguridad OK + pulido UX hecho 2026-06-20)
Dilio: el perfil de rango debe verlo **solo el líder**, no el colaborador.

- **Auditado el 2026-06-15 — NO hay fuga de datos.** El RLS está correctamente
  cerrado:
  - `profiles` SELECT (`supabase/schema.sql:90-103`): un usuario ve **solo su
    propia fila**; ver todo el equipo exige `role = 'arquitecto'`.
  - `disc_assessments` SELECT (`migration_sprint3_disc.sql:47-49`) y los PDFs en
    storage: **solo arquitecto**.
  - Resultado: aunque la UI de `/equipo` está construida para listar al equipo,
    cuando entra un colaborador el server le devuelve **solo su propia fila** (cero
    assessments). No puede ver el perfil DISC/LOS/rango de ningún compañero — ni por
    la pantalla ni por query directa. Refuerza esto `migration_sprint5_roles.sql`,
    que ya corrigió el bug histórico del default `arquitecto`.
- ✅ **Pulido UX hecho (2026-06-20):** `/equipo` se **reconvierte en "Mi Perfil"** para todo
  rol no-arquitecto (conserva su única auto-vista DISC, en vez de ocultarla). El nav (sidebar
  + ⌘K) muestra **"Mi Perfil"** para el colaborador; la página adapta header y **oculta el
  TeamSidebar** (queda su ficha a ancho completo, read-only). El arquitecto no cambia.
  Archivos: `layout.tsx` (pasa `isArquitecto`), `sidebar.tsx`, `command-palette.tsx`,
  `equipo/equipo-client.tsx`. Sin tocar RLS/schema.

### B2 · Recomendaciones personalizadas con IA desde los documentos maestros — ✅ (síntesis enriquecida 2026-06-20)
Dilio: el sistema debe usar sus **documentos maestros** para hacer un análisis y
dar **recomendaciones personalizadas** a cada persona.

- **Hoy:** ya hay síntesis narrativa con IA (`src/lib/ai-report.ts`,
  `generateDiscNarrative`), gateada por `ANTHROPIC_API_KEY` y cacheada.
- ✅ **Hecho (2026-06-20):** se inyectó el **método canónico de Dilio** en el prompt —
  nuevo `src/lib/tbm-disc-context.ts` (`TBM_DISC_CANON` con arquetipo/%/temor/rol/luz/
  sombra por letra desde [`METODO_TBM_CANONICO.md`](METODO_TBM_CANONICO.md) §4, cruces, y
  `TBM_METHOD_FRAMING` con el encuadre "líder rentable / luz = madurez emocional / DISC ≠
  inteligencia / el temor dispara la sombra"). La síntesis ahora "habla" TBM, apoyándose en
  el arquetipo y el temor canónicos (no en el `DISC_FACTORS` del app, que diverge — ver D6).
- ⚙️ **Activar:** la IA sigue **inerte hasta cargar `ANTHROPIC_API_KEY` en Vercel**
  (operativo, igual que PostHog/Sentry). Sin la key, el informe muestra todo menos la card
  "Síntesis personalizada". Para síntesis más ricas: `DISC_AI_MODEL=claude-opus-4-8`.
- *(Las gráficas avanzadas de B3+B4 siguen sin modelo — ver abajo.)*

### B3 + B4 · Las 3 gráficas DISC + intensidad centrada en la media — ❌ / ⛔ parcial (FEATURE GRANDE)
> **2026-06-20:** llegó el material de Dilio (TBM 4) pero **NO** trae el modelo de cálculo
> de las 3 gráficas clásicas (las subcarpetas "INFORMES DISC" de los clientes están
> vacías). Sigue **bloqueado en lo técnico**: falta el método para derivar Pública/Núcleo/
> Espejo desde MÁS/MENOS. Pedir a Dilio un informe DISC de ejemplo + la fórmula.

Dilio quiere las gráficas clásicas DISC:
- **Temperamento bajo presión** (gráfica Pública / "máscara").
- **Temperamento en público.**
- **Autopercepción** (Espejo).
- **Intensidad de las letras por encima/por debajo de la media**, en un gráfico
  **con punto medio** (no barras 0→máx como hoy).

- **Hoy:** el motor (`src/lib/disc-evaluator.ts`) calcula **un solo perfil**
  (respuestas MÁS/MENOS → puntajes D/I/S/C → 1 de 16 perfiles). **No** deriva las 3
  gráficas clásicas ni centra la intensidad en la media.
- **Por qué es grande:** las 3 gráficas clásicas (Pública/Núcleo/Espejo) se derivan
  por separado de las selecciones MÁS y MENOS. Hay que **rediseñar el motor** para
  exponer las tres distribuciones, y rehacer la visualización con un eje centrado
  en la media (punto medio) en vez de barras absolutas.
- **A definir en la sesión de implementación:**
  - Confirmar si el set de respuestas que ya se guarda permite derivar las 3
    gráficas, o si hay que persistir más datos del test.
  - Diseño visual del gráfico con punto medio (intensidad ± media).
  - Validar el modelo de las 3 gráficas contra el material original de Dilio.

### B5 · El sistema "llama la atención" y motiva a completar el test — ✅ mayormente
- **Hoy:** la intro del test ya es gamificada (4 energías, cronómetro, frases de
  momentum, reveal animado del resultado, `ProfileIcon` con emoji animado). Cubre
  bien la intención.
- **Opcional:** refuerzos menores (recordatorio si el test queda a medias, nudge en
  el dashboard si falta completarlo).

### B6 · Diagrama "Conexiones y fricciones DISC" — ✅ Hecho (2026-06-22)

> **Implementado (`5e7a583`):** rombo SVG en Mi Equipo ("Salud del equipo") con perímetro sólido
> (conexión natural) + diagonales punteadas (cruzado), `detectPairCrossings` con `TBM_DISC_CRUCES`
> como fuente de verdad y alertas par-a-par entre miembros (el caso C+3I ahora dispara). Las
> heurísticas de composición quedan como señal secundaria. Follow-up menor: copy canónico (D6) +
> rombo educativo en test/workbook (componente ya reutilizable). Spec en `SPEC.md` §M3.

> **NO es B3+B4.** B3+B4 son las **3 gráficas de intensidad** (Pública/Núcleo/Espejo, eje
> centrado en la media) y siguen bloqueadas por falta de fórmula. **B6 es el diagrama
> relacional** (rombo de pares + alertas par-a-par). El **material de Dilio para esta pieza
> YA llegó** (presentación S2 / infografía de la Sesión 2): **no está bloqueado por insumos**.

Diagrama de la Sesión 2: rombo **D arriba · I derecha · S abajo · C izquierda**, con
**conexiones naturales** (sólidas: D↔C · I↔S · S↔C · I↔D) y **temperamentos cruzados**
(punteadas: D↔S · I↔C). Frase del método: *"Primero el quién. Luego el qué."* Ejemplo de
advertencia: director **C** + tres **I** = reto de comunicación permanente (cruce I↔C).

- **Hoy (parcial):** las reglas correctas ya viven en `src/lib/tbm-disc-context.ts`
  (`TBM_DISC_CRUCES`) y en [`METODO_TBM_CANONICO.md`](METODO_TBM_CANONICO.md) §4; `ai-report.ts`
  ya las inyecta en el prompt de síntesis IA. **Falta** el componente visual del rombo y la
  **detección par-a-par** entre personas.
- **Incorrecto:** `detectDangerousCrossings()` (`src/lib/disc.ts`) usa **heurísticas de
  composición** (homogéneo, ≥2 D sin S, ≥2 I sin C, todo S/C), **no** los pares oficiales →
  el caso C+3I **no dispara** alerta hoy.
- **Propuesta:** componente SVG del rombo + refactor del detector para usar `TBM_DISC_CRUCES`
  como fuente de verdad (heurísticas de composición quedan como reglas secundarias) +
  integración en `/equipo`. Especificado en `SPEC.md` §M3 → "Mapa de Conexiones y Fricciones
  DISC". **Desbloqueado** (no espera a Dilio).

---

## C. Sistema LOST y claridad conceptual

### C1 · Que el usuario entienda LOST y dónde está parado — ✅ (mapa LOST hecho 2026-06-20)
Dilio: **LOST (con T)** representa **todo el sistema**, no una parte.

> **Hecho (2026-06-20):** nueva página **`/sistema` ("Sistema LOST")** en el sidebar
> (`src/app/(dashboard)/sistema/page.tsx` + `src/lib/lost.ts`): tira L-O-S-T + las 4
> dimensiones con su definición canónica, cada una listando sus módulos como links
> navegables, y header "Día X de 90 · Ciclo N" (reusa el cómputo del baseline). Abierta a
> todos los roles. Junto con el barrido D1/D2, cierra C1. *(El mapa se ancla a los módulos
> del app, no a las 8 sesiones de Dilio — esas no coinciden 1:1.)*

> **Desbloqueado (2026-06-20):** llegó el material canónico. Definiciones oficiales (de las
> presentaciones, ver [`METODO_TBM_CANONICO.md`](METODO_TBM_CANONICO.md) §1–§2):
> **L** = Liderazgo estratégico · **O** = Operaciones optimizadas · **S** = Sistemas
> escalables · **T** = Tiempo multiplicado. Cada presentación abre con un "mapa LOST" que
> ubica la sesión. Además: los "Niveles LOS" (N1–N5) del app son en realidad los **5
> Niveles de Delegación** (Cadete→Socio), **no** "LOS" → corregir naming (divergencia D1).
> Ya se puede construir el barrido LOS→LOST y una vista "mapa del sistema".

- **Hoy:** la metodología está volcada en módulos, pero el **copy/naming** no guía
  explícitamente "estás en esta parte del sistema LOST".
- **Propuesta:** alinear naming, copy y, posiblemente, una vista de "mapa del
  sistema" que ubique cada módulo dentro de LOST. Es trabajo de UX/copy, no de
  lógica.
- ⛔ **Bloqueado:** depende de las **presentaciones LOST actualizadas y unificadas**
  de Dilio (una sola presentación vigente).

---

## E1 · Cobro de tests DISC: créditos + Stripe — ❌ (FEATURE GRANDE)

> **Replanteado (2026-06-16):** E1 ya no es una feature suelta — pasa a ser parte
> del **roadmap de plataforma A0–A6**. Los créditos (A3) y Stripe (A4) viven ahora
> en [`docs/GODMODE_Y_ROADMAP_STARTUP.md`](GODMODE_Y_ROADMAP_STARTUP.md), junto con
> el panel de super-admin que los administra. Modelo confirmado: **1 crédito = 1
> DISC**.

Dilio: cada test DISC debe ser **pagado**. El sistema de **créditos** debe estar
**enlazado con Stripe** para que el pago **habilite automáticamente** el acceso.

- **Hoy:** no existe nada de Stripe ni de créditos en el repo.
- **Propuesta (encaja en S10 / comercial):**
  - Tabla de **créditos** por empresa/usuario.
  - Integración **Stripe Checkout** + **webhook** que acredita al confirmarse el pago.
  - **Gate** en la generación de links de test DISC (`/equipo`): consume 1 crédito;
    sin saldo, ofrece comprar.
- **A definir con Dilio:** precio por test, paquetes de créditos, quién paga
  (empresa vs individuo), moneda.

---

## Insumos que necesitamos de Dilio (desbloqueos)

| Item | Desbloquea |
|---|---|
| Las **365 meditaciones de autoliderazgo** | A3 (meditaciones del Pre-game) |
| Los **documentos maestros DISC** | B2 (recomendaciones IA personalizadas) |
| Las **presentaciones LOST** actualizadas y unificadas | C1 (claridad conceptual / naming) |
| Modelo/material de las **3 gráficas DISC** clásicas | B3+B4 (validar el motor) |
| Definición de **precios/paquetes** de créditos | E1 (Stripe) |

> **B6 (diagrama Conexiones y fricciones DISC) NO está en esta lista a propósito:** su material
> (presentación/infografía de la Sesión 2) **ya llegó** y las reglas están en el canónico §4 +
> `TBM_DISC_CRUCES`. Es trabajo de implementación (UI + detector par-a-par), no de insumos.

---

## Resumen ejecutable (qué se puede arrancar ya, sin esperar a Dilio)

1. ✅ **A1** — Recordatorio de "armá el próximo ciclo" (reusa cron + notificaciones).
   **Hecho 2026-06-20.**
2. ✅ **A3.1** — Checklist de hábitos del Pre-game (sin las meditaciones) + pasada
   mobile-first. **Hecho 2026-06-19.**
3. **B1** — Auditoría de permisos: colaborador no ve el perfil de rango del equipo.
4. **E1** — Andamiaje de créditos + Stripe (la parte técnica; los precios después).
5. **B3+B4** — Arrancar el rediseño del motor DISC para las 3 gráficas (feature
   grande, conviene una sesión dedicada).
6. **B6** — Diagrama Conexiones y fricciones DISC (rombo + alertas par-a-par con
   `TBM_DISC_CRUCES`). **Desbloqueado** (material S2 ya llegó). ~4–6h.

> Lo demás (A3.2 meditaciones, B2 IA con docs, C1 LOST) queda **a la espera de los
> insumos de Dilio**.

---

## Fuera de scope de la app TBM (registrado para no perderlo)

Estos puntos del feedback **no son backlog de este repo** — son proyectos externos,
infraestructura o coordinación. Se listan solo como referencia:

- **Funnel de leads** (pauta → lead magnet → chat 1:1 con agente que califica →
  comunidad): proyecto **GoHighLevel + IA**, separado.
- **IA para campañas Meta / análisis de avatar / reportes diarios de pauta**:
  proyecto de marketing-datos, separado.
- **Plataforma actual con problemas** (emails en inglés sin branding, flujos de
  cursos/correos mal configurados): pertenece a **otra herramienta**, no a la app
  TBM. Coordinación aparte.
- **Módulo financiero de Dilio** (ya construido por él): revisar + alojar en la
  nueva infraestructura. Proyecto/infra separado.
- **Cliente de Venezuela** (control financiero + integraciones IA): proyecto de
  servicio a terceros, separado.
- **Comunidad / mentoría / beta** (poner la plataforma al servicio de la comunidad,
  acceso a presentaciones, sumar a Sebastian a los chats de mentoría y
  "Plataformas"): **operativo/coordinación**, no código. La beta cerrada es la
  tarea S10 en `PROGRESS.md`.
- **Hosting / "cerebro IA de TBM"** (servidor GoDaddy, KB consultable con todo el
  conocimiento de TBM): infraestructura/proyecto mayor, fuera de este repo.
