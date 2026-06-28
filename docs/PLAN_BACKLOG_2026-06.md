# Plan de ejecución — Backlog Sebas (2026-06-28)

> Plan **cerrado** de las 6 tareas levantadas por Sebas. Cada decisión de producto ya está
> resuelta (ver tabla) para no abrir dudas durante la implementación. Resumen corto en
> [`ROADMAP_DC_Y_APP_2026-06.md`](ROADMAP_DC_Y_APP_2026-06.md) §2·C; **acá vive el detalle**.
> Estado verificado en código el 2026-06-28.

## Decisiones cerradas

| # | Tarea | Decisión de Sebas |
|---|---|---|
| **N1** | DC explica + te lleva a la ventana | **(a)** Explica y muestra **botón "Ir a X →"** (no autopilot). |
| **N2** | Pedir créditos in-app | **(a)** Form in-app → registra pedido + **notifica/emaila al admin** → admin carga manual. |
| **N3** | Login minimalista | Quitar el **testimonial ficticio** ("Joaquín Pérez"). |
| **N4** | Mejorar el tour | **(a)** Pulir el **tour estático** con los módulos que faltan **+ cerrar presentando a DC como copiloto de toda la app**. |
| **N5** | Cambiar gráfica DISC | Reemplazar el **radar "Atributos base"** (Perfil DISC en Mi Equipo) por un **modelo de 4 cuadrantes** estilo la imagen de referencia. |
| **N6** | Modelos gratis en admin | Sumar los **free tiers potentes** al catálogo de OpenRouter. |

**Orden sugerido de ejecución** (rápido→profundo): **N3 → N6** (quick wins, sin DB) → **N5**
(autocontenido, UI) → **N1** (DC navegación) → **N4** (tour + outro DC) → **N2** (necesita migración + UI admin).

---

## N1 · DC: explicar y llevarte a la ventana (botón)

**Objetivo.** Cuando el usuario pregunta "¿cómo hago una delegación?", DC explica **y** ofrece un
botón **"Ir a Delegación →"** que lo lleva al módulo. Read-only ⇒ **sin tarjeta de confirmación**.

**Estado hoy.** DC explica (RAG) pero **no navega**. Tools actuales (`lib/jarvis-tools.ts`):
`generar_link_disc`, `crear_tarea`, `invitar_colaborador`. `api/jarvis/route.ts` no tiene deep-link.
Las acciones (DC-3) están gateadas por `features.actions` + solo arquitectos — **la navegación NO
debe gatearse así** (tiene que andar para todos los roles y aunque las acciones estén apagadas).

**Decisión de diseño (cerrada): marcador en el stream, NO tool-use.**
Razón: el tool-use de DC-3 fuerza una respuesta **no-streaming** y está gateado. La navegación tiene
que (1) preservar el streaming del chat normal, (2) andar para **todos los roles**, (3) ser **un solo
llamado** al LLM. Por eso se resuelve con un **marcador** que el modelo emite al final de su respuesta
y que el panel parsea y convierte en botón. (Alternativa tool-use evaluada y descartada por lo anterior.)

**Plan.**
1. **System prompt** (`api/jarvis/route.ts`, donde se arma el system): agregar una instrucción —
   *"Si la respuesta refiere a algo que se hace en un módulo de la app, terminá con una línea sola
   `[[IR:<slug>]]` (un solo marcador, al final). Slugs válidos: `dashboard, equipo, delegacion,
   rituales, plan-90d, feedback, workbooks, multiplicador, diagnostico, sistema, creditos, cuenta`.
   Si no aplica, no agregues nada."*
2. **Mapa slug → ruta + label** en un módulo compartido nuevo `lib/dc-navigation.ts` (reutiliza/invierte
   el `MAP` de `moduleFromPath` en `components/dashboard/dc-launcher.tsx`). Exporta `resolveNav(slug)
   → { path, label } | null` (whitelist server y cliente).
3. **Panel** (`components/dashboard/jarvis-panel.tsx`): al renderizar el mensaje del assistant,
   **extraer** `[[IR:slug]]` del texto (regex), no mostrarlo como markdown, y si resuelve a un módulo
   válido renderizar un botón **"Ir a {label} →"** que hace `router.push(path)` (Next `useRouter`).
   Si el slug no está en la whitelist → ignorar (no romper el render).
4. **Persistencia (DC-6):** guardar el contenido **con** el marcador (o sin él, decisión menor: guardar
   limpio para no recargar botones viejos en el historial → **guardar sin el marcador**, parsear antes
   de persistir el assistant message).

**Archivos.** `api/jarvis/route.ts` (system + strip antes de persistir) · `lib/dc-navigation.ts`
(nuevo) · `components/dashboard/jarvis-panel.tsx` (parseo + botón) · (opcional) refactor `moduleFromPath`
para no duplicar el mapa.

**DB.** Ninguna.

**Riesgos / mitigación.** El modelo podría no emitir el marcador → degradación elegante (solo no
aparece el botón, la explicación sigue). Slug inválido → ignorado por la whitelist. Marcador en medio
del texto → regex global, se quitan todos.

**Verificación.** "¿cómo delego una tarea?" → respuesta + botón "Ir a Delegación →" que navega.
"hola" → sin botón. Colaborador (no arquitecto) → también ve el botón. El historial reabierto no
muestra basura `[[IR:…]]`.

**Esfuerzo.** Bajo-medio.

---

## N2 · Pedir créditos dentro de la plataforma

**Objetivo.** Que el líder pida una recarga **sin salir de la app** (hoy abre el correo externo) y
que el pedido **quede registrado** y le **llegue al admin**.

**Estado hoy.** `/creditos` (`apps/web/src/app/(dashboard)/creditos/page.tsx`) arma un **`mailto:`**
(`buildCreditRequestMailto`, botón "Pedir más créditos") → abre el cliente de correo, no queda traza
en la app. Email ya operativo (`lib/email.ts`, Resend). Notificaciones in-app ya existen
(tabla `notifications`). Carga de créditos: RPC `grant_credits` (solo platform_admin).

**Decisión (cerrada): (a) notifica + carga manual.** El pedido se registra, le llega notificación +
email al admin, y el admin carga a mano con `grant_credits`. (La bandeja de aprobación en 1-clic queda
para una iteración futura, ver "Diferido".)

**Plan.**
1. **Migración** `supabase/migration_credit_requests.sql` (guardar archivo + aplicar por MCP):
   tabla `credit_requests` (`id uuid pk`, `company_id → companies`, `requested_by → profiles`,
   `amount int` nullable, `note text`, `status text check (status in ('pending','granted','rejected'))
   default 'pending'`, `created_at`, `resolved_at`, `resolved_by`). **RLS:** el arquitecto de la empresa
   **inserta y ve los suyos** (`company_id = auth_company_id()`); el admin lo lee por service-role.
   Índice `(status, created_at)`.
2. **Web — server action** `requestCredits({ amount?, note? })` (en `creditos/actions.ts`, nuevo o
   existente): inserta el `credit_request` (RLS), **emaila al `SUPPORT_EMAIL`** vía `lib/email.ts`
   (reusa `getSupportEmail()`), y crea una **notificación in-app** para el/los platform_admin si aplica
   (o al menos deja el registro; la notif al admin puede ir por email que es lo seguro en beta).
3. **Web — UI:** reemplazar el `<a href=mailto>` por un **modal/form** ("¿cuántos créditos? + nota
   opcional") con estado de envío y confirmación ("Pedido enviado ✅, te avisamos cuando se cargue").
   Quitar `buildCreditRequestMailto` (o dejarlo como fallback si el email falla).
4. **Admin — visibilidad:** mostrar los `credit_requests` pendientes. Mínimo viable: una **sección en
   `/empresas/[id]`** ("Pedidos de créditos") con los pendientes; al cargar créditos con el form
   existente, marcar el request como `granted` (update `status/resolved_at/resolved_by`). *(Bandeja
   global `/pedidos` = diferido.)*

**Archivos.** `supabase/migration_credit_requests.sql` (nuevo) · `creditos/page.tsx` +
`creditos/actions.ts` (web) · `lib/email.ts` (reuso) · `apps/admin/.../empresas/[id]` + su `actions.ts`
· tipos en `types/database.ts` y `packages/shared/src/database.types.ts`.

**Riesgos.** Doble pedido / spam → deshabilitar el botón mientras hay un `pending` de esa empresa
(chequeo simple). Email caído → el registro queda igual (el admin lo ve en el panel). RLS: que el
arquitecto **no** pueda ver pedidos de otra empresa (patrón `auth_company_id()`).

**Verificación.** Líder pide 10 créditos → aparece en `/empresas/[id]` del admin + llega email →
admin carga → request pasa a `granted` y el saldo sube. Otro arquitecto no ve el pedido (RLS).

**Esfuerzo.** Media (migración chica + 2 UIs).

**Diferido.** Bandeja global de pedidos con "aprobar y cargar" en 1-clic (auto-`grant_credits`).

---

## N3 · Login minimalista (quitar comentarios)

**Objetivo.** Login más limpio/serio, sin testimonial inventado.

**Estado hoy.** `apps/web/src/app/(auth)/login/login-form.tsx` → `LeftPanel` tiene un bloque
`{/* Testimonial */}` hardcodeado ("Joaquín Pérez · CEO en Acme", ~líneas 238-288). Es ficticio.

**Plan.**
1. Borrar el bloque `{/* Testimonial */}` completo del `LeftPanel`.
2. Quitar el import `Quote` (lucide) si queda sin uso; idem cualquier otro import huérfano.
3. Rebalancear el `LeftPanel`: el hero + `ProductPreview` quedan centrados/respirando (ajustar
   `justifyContent`/paddings si hace falta). No tocar el `RightPanel` (form).

**Archivos.** `apps/web/src/app/(auth)/login/login-form.tsx` (único).

**DB.** Ninguna.

**Riesgos.** Mínimos (sólo UI). Verificar que no quede un `borderTop` colgando ni espacio raro.

**Verificación.** `/login` desktop: sin testimonial, layout balanceado. Mobile: sin cambios (el
`LeftPanel` ya está oculto en `< md`). `tsc` + build verdes (imports limpios).

**Esfuerzo.** Bajo (quick win).

---

## N4 · Tour: más módulos + presentar a DC como copiloto

**Objetivo.** Que el tour recorra los módulos que hoy faltan y **cierre presentando a DC** como el
copiloto disponible en toda la app.

**Estado hoy.** `apps/web/src/lib/tour-steps.ts` (driver.js): `COMMON_INTRO` (sidebar, semáforos,
rituales) + pasos por rol. **Arquitecto** ve equipo + delegación + avatar; **colaborador** ve
delegación + rituales + avatar. **Faltan:** Plan 90D, Feedback S.E.C., Multiplicador, Workbooks,
Créditos, y **DC** (el launcher flotante). Targets `data-tour` existen en sidebar/semáforos/avatar;
los nuevos pasos necesitan que sus targets tengan `data-tour`.

**Plan.**
1. **Auditar `data-tour`**: confirmar/añadir atributos en el sidebar para `nav-plan-90d`,
   `nav-feedback`, `nav-multiplicador`, `nav-creditos` (arquitecto), `nav-workbooks`, y en el
   **`DcLauncher`** (`components/dashboard/dc-launcher.tsx`) un `data-tour="dc-launcher"`.
2. **Ampliar `ARQUITECTO_STEPS`**: sumar Plan 90D (Rocas/leading indicators), Feedback S.E.C.,
   Multiplicador (ROI de Talento), Créditos (saldo + pedir recarga — enlaza con N2). Mantener orden
   lógico del método.
3. **Ampliar `COLABORADOR_STEPS`**: sumar Feedback S.E.C. y (si aplica a su rol) Mi Perfil/Workbooks.
4. **Paso final DC (ambos roles)**: nuevo step apuntando a `[data-tour="dc-launcher"]` con copy del
   estilo *"Te presento a DC, tu copiloto. Está en todas las pantallas: preguntale cómo hacer
   cualquier cosa del método y te explica — incluso te lleva al módulo."* Reemplaza/antecede el outro
   "¡Ya conocés el sistema!".
5. **Mobile**: el sidebar es drawer cerrado → en `MOBILE_INTRO` los pasos `nav-*` no aplican. Agregar
   el paso de **DC** en mobile (el launcher flotante **sí** está visible) y mantener el resto apuntando
   a hamburguesa + semáforos.

**Archivos.** `lib/tour-steps.ts` (principal) · sidebar (`data-tour` faltantes; ubicar el componente
del nav) · `components/dashboard/dc-launcher.tsx` (`data-tour="dc-launcher"`).

**DB.** Ninguna (el `tour_completed` ya existe).

**Riesgos.** Si un target `data-tour` no existe en una pantalla, driver.js puede saltearlo/romper →
asegurar que los `nav-*` están en el layout (siempre montado) y degradar steps sin elemento. Gatear
pasos arquitecto-only (Créditos/Multiplicador) para que el colaborador no los vea.

**Verificación.** Arquitecto nuevo: el tour recorre los módulos nuevos y termina presentando a DC.
Colaborador: su flujo + DC. Mobile: hamburguesa + semáforos + DC. "Ver tour de nuevo" (en /cuenta y
⌘K) reproduce el flujo ampliado.

**Esfuerzo.** Media.

**Nota de roadmap.** El §2·B#1 propone más adelante **onboarding guiado por DC** (DC reemplaza al
tour). N4 pule el estático ahora; el paso final de DC es el puente natural hacia esa fase.

---

## N5 · Reemplazar la gráfica DISC "Atributos base"

**Objetivo.** Cambiar el **radar "Atributos base"** del Perfil DISC por un **modelo de 4 cuadrantes**
estilo la imagen de referencia ([`assets/N5_disc_modelo_referencia.png`](assets/N5_disc_modelo_referencia.png)).

**Estado hoy.** La gráfica es `DiscRadar` (`components/equipo/disc-radar.tsx`), rotulada **"Atributos
base"** dentro de `components/equipo/disc-section.tsx` (líneas ~116-119). **Se usa en un solo lugar**
(el Perfil DISC del miembro). Al lado va `DiscBars` (barras numéricas por factor) — eso **se mantiene**.

**Referencia (imagen).** "MODELO DISC · Los 4 estilos de comportamiento". Cuadrantes:
- **D — Dominante** (arriba-izq, rojo): Decisiones rápidas · Competitivo · Orientado a resultados · Le gustan los desafíos.
- **I — Influyente** (arriba-der, amarillo): Sociable y comunicativo · Entusiasta · Persuasivo · Optimista.
- **C — Concienzudo/Pensador** (abajo-izq, azul): Analítico · Preciso · Organizado · Orientado a la calidad.
- **S — Estable/Seguro** (abajo-der, verde): Paciente · Leal · Colaborador · Busca estabilidad.
- **Ejes:** vertical **Extrovertido (Activo) ↔ Introvertido (Reflexivo)**; horizontal **Orientado a las
  tareas ↔ Orientado a las personas**. Flechas curvas D→I→S→C. Cada cuadrante con icono + 4 bullets.

**Decisión de diseño (cerrada).** El nuevo componente es el **modelo de cuadrantes**, pero **conserva
lo personal**: resalta el cuadrante del **estilo primario** del miembro (y atenúa el resto), reusando
`primary`/`code` que ya recibe la sección. Los **valores numéricos** del miembro siguen en `DiscBars`
al lado (no se pierde data medida). Naming **canónico TBM** (D Dominante · I Influyente · S Seguro ·
C Pensador) — **ojo:** la imagen dice "Concienzudo/Estable"; en la app usamos **Pensador/Seguro**
(ver `lib/disc` `DISC_DIMENSIONS`, divergencia D6 ya resuelta). Se respeta el layout de la imagen pero
con **el naming de la app**.

**Plan.**
1. **Componente nuevo** `components/equipo/disc-quadrant-model.tsx`: recibe `{ primary, code? }`
   (mismos datos que hoy recibe el radar). Render de los 4 cuadrantes (grid 2×2) con ejes, color por
   factor (`DISC_COLORS`), icono y los 4 atributos por estilo (texto del método, desde `lib/disc`/
   `DISC_FACTORS` o constante local). **Resalta** el cuadrante `primary` (borde/glow) y, si hay
   secundario en `code`, lo marca suave. SVG/CSS, responsive, mobile-first.
2. **Swap en `disc-section.tsx`**: reemplazar el bloque del radar (el `<div>` "Atributos base" +
   `<DiscRadar/>`, líneas ~109-120) por `<DiscQuadrantModel primary={primary} code={code} />`.
   Mantener `DiscBars` al lado. Ajustar el grid (`md:grid-cols-[230px_minmax(0,1fr)]`) si el modelo
   pide más ancho (probable: pasar a una fila completa arriba + barras abajo).
3. **`disc-radar.tsx`**: queda sin uso → **borrar** (o dejar si se quiere para otro lado; hoy nadie más
   lo importa → borrar y limpiar el import).
4. **Datos de atributos:** definir los 4 bullets por estilo en `lib/disc` (constante `DISC_ATTRS` o
   reusar lo que haya) para una sola fuente de verdad y naming canónico.

**Archivos.** `components/equipo/disc-quadrant-model.tsx` (nuevo) · `components/equipo/disc-section.tsx`
(swap + grid) · `components/equipo/disc-radar.tsx` (borrar) · `lib/disc.ts` (atributos por estilo).

**DB.** Ninguna.

**Riesgos.** El radar mostraba **intensidad medida**; el modelo de cuadrantes es **categórico** → por
eso se conserva `DiscBars` (la medición) al lado. Naming: no copiar "Concienzudo/Estable" de la imagen,
usar el canónico de la app. Layout: el cuadrante es más alto que el radar → revisar el modal del
miembro (`member-report-modal`) y mobile.

**Verificación.** Perfil DISC de un miembro con letras (ej. "DI"): se ve el modelo 2×2, con D resaltado;
barras numéricas siguen al lado; mobile ok; modal ok. Coincide visualmente con la referencia (con
naming de la app).

**Esfuerzo.** Media (componente visual nuevo).

**Decisión (cerrada, 2026-06-28).** El cuadrante **resalta el estilo del miembro** (primario, con
secundario suave) — confirmado por Sebas. Se conserva `DiscBars` (medición) al lado.

---

## N6 · Admin: modelos gratuitos potentes

**Objetivo.** Ofrecer en el admin los **free tiers** más potentes de OpenRouter para abaratar la beta.

**Estado hoy.** Catálogo en `apps/admin/src/lib/ai/index.ts` — proveedor OpenRouter lista modelos
**de pago** (Claude/GPT/Gemini/DeepSeek/Llama/Grok), **ninguno `:free`**. OpenRouter permite tipear
cualquier slug a mano ("otro modelo"), pero no hay sugeridos gratis.

**Plan.**
1. En `OpenRouter.models` agregar entradas `:free` con label "· gratis", por ejemplo:
   - `deepseek/deepseek-r1:free` — DeepSeek R1 · gratis (razonamiento)
   - `meta-llama/llama-3.3-70b-instruct:free` — Llama 3.3 70B · gratis
   - `google/gemini-2.0-flash-exp:free` — Gemini 2.0 Flash (exp) · gratis
   - `qwen/qwen-2.5-72b-instruct:free` — Qwen 2.5 72B · gratis
   *(Validar los slugs vigentes en openrouter.ai/models al implementar — el free tier rota.)*
2. **Hint** del proveedor: aclarar que los `:free` tienen **rate-limits/latencia** y a veces **calidad
   menor** → buenos para probar, no garantizados en prod.

**Archivos.** `apps/admin/src/lib/ai/index.ts` (único — solo data del catálogo).

**DB.** Ninguna.

**Riesgos.** Slugs `:free` que OpenRouter discontinúe → como es un dropdown + "otro modelo", el admin
siempre puede tipear el vigente; documentar que se revisan periódicamente.

**Verificación.** Admin → "Asistente IA" → proveedor OpenRouter → aparecen los modelos gratis;
seleccionar uno + "probar conexión" responde OK (con una key de OpenRouter válida).

**Esfuerzo.** Bajo (quick win).

---

## Preguntas abiertas

**Ninguna.** Todas las decisiones están cerradas (N5: resaltar el estilo del miembro — confirmado
2026-06-28). Imagen de referencia en `docs/assets/N5_disc_modelo_referencia.png` ✅. Al implementar cada tarea: actualizar `PROGRESS.md` y marcar el ítem en
`ROADMAP_DC_Y_APP_2026-06.md` §2·C, y guardar el SQL de N2 en `supabase/` antes de commitear
(convención del proyecto).
