# Roadmap — Evolución de DC + mejoras de la app (2026-06-25)

> Documento de **proyección** (no es backlog cerrado ni código). Reúne lo pendiente de los
> sprints + ideas nuevas, con foco en **DC** (el asistente). Para retomar y priorizar.
> Relacionado: [`JARVIS_AI_ASSISTANT.md`](JARVIS_AI_ASSISTANT.md) (diseño técnico), `SPEC.md` §M10,
> [`JARVIS_QA_2026-06-22.md`](JARVIS_QA_2026-06-22.md) (bugs).

---

## 0. Dónde estamos (resumen)

**Hecho:** beta operativa (god-mode + créditos), Mi Equipo + DISC (B6, D6), y **DC** funcional:
config multi-LLM por OpenRouter desde el admin, chat con streaming, contexto real del equipo,
RAG sobre el método (corpus curado), UX del panel legible.

**Pendiente del backlog previo:**
- **Fase 2:** A4 Stripe *(post-beta)* · verificación E2E del flujo de créditos *(manual)* · fixes del QA de DC.
- **Fase 3 (bloqueado por Dilio):** B3+B4 (3 gráficas DISC de intensidad) · A3.2 (365 meditaciones) · C1 (mapa visual LOST).
- **Fase 4 (venta):** A5 (dashboard de métricas de la startup) · A6 (enterprise readiness: GDPR, planes, SOC2/SSO).

---

## 1. DC: de chat a **copiloto agéntico** (foco principal)

Visión: DC deja de ser un chat en una sola pantalla y se convierte en un **asistente omnipresente
que entiende el contexto, ejecuta acciones y acompaña** el método. Epics ordenados por valor/madurez:

### DC-1 · DC global (omnipresente) — ✅ **hecho (2026-06-26)**
**Problema (resuelto):** el orbe vivía solo en el header del dashboard; en el resto de las ventanas
no se podía hablar con DC.
**Implementado:** `DcLauncher` (`components/dashboard/dc-launcher.tsx`) — **launcher flotante** fijo
abajo a la derecha, montado en el **layout `(dashboard)`** → disponible en **todas** las pantallas.
Hereda el anillo de atención + hint de primera vez del viejo header orb (borrado). Es el "hogar
persistente" del orbe con `layoutId`: la bienvenida cinemática vuela el orbe hasta el launcher.
- ✅ **Context-aware por pantalla:** deriva el módulo de la ruta (`usePathname` → `moduleFromPath`)
  y lo manda en el body a `/api/jarvis`; el route inyecta "PANTALLA ACTUAL: …" al system para que DC
  ajuste sugerencias.
- ✅ Coordinación de fase robusta: el store arrancaba en "pending" y solo la película (en el
  dashboard) lo resolvía → en otras pantallas el launcher toma la fase tras 120ms si nadie la resolvió.
- **Pendiente menor (no bloqueante):** acción "Preguntar a DC" en el **Command Palette (⌘K)**.

### DC-2 · Personalización desde el super-admin — ✅ **hecho (2026-06-26)**
**Implementado** (migración `jarvis_persona`, columnas nuevas en `ai_config`): el admin edita la
"persona" de DC en la sección "Asistente IA" y el web lo refleja al instante (sin tocar código):
- ✅ **Nombre** (default "DC", editable) · ✅ **Tono** (cercano/formal/directo → línea en el system).
- ✅ **Mensaje de bienvenida** del panel · ✅ **Prompts sugeridos** (chips, un prompt por línea).
- ✅ **Features:** toggle **RAG** on/off (gatea `retrieveKnowledge`). **Acciones** (DC-3) y **Voz**
  (DC-8) quedan como placeholders deshabilitados (no construidos).
- Técnico: `apps/web/src/lib/dc-persona.ts` (`DC_DEFAULTS`, `toneLine`, `ragEnabled`,
  `getDcPublicPersona`); el layout `(dashboard)` lee la persona pública (service-role) y la pasa al
  `DcLauncher`→`JarvisPanel`; `api/jarvis/route.ts` arma identidad/tono/RAG. Admin: `actions.ts` +
  `ai-config-form.tsx` (sección "Personalidad de DC").
- **Pendiente / diferido:** **color/avatar del orbe** (se difirió, orbe azul por ahora). **Por
  empresa** y **idioma**: post-beta (la columna `scope='company'` ya existe, sin UI).

### DC-3 · Acciones en la app (tool use) — *el salto a "copiloto"* — *alta prioridad, media complejidad*
DC no solo responde: **hace**. Function calling / tool use. Catálogo inicial de herramientas
(todas con **confirmación** antes de ejecutar, y respetando permisos/rol):
- **Crear tarea** (Pase de Estafeta, con los 5 puntos) y asignarla.
- **Generar link DISC** para un colaborador (consume crédito) / invitar colaborador.
- **Agendar/marcar ritual** (War Up, Cool Down, Pre-game).
- **Cargar feedback S.E.C.** sugerido por DISC.
- **Crear/actualizar Rocas** (Plan 90D) y leading indicators.
- **Actualizar scorecard** / registrar energía.
- **Resumen/insight on-demand:** "armá el reporte semanal", "¿quién está en sombra?".
- Técnico: extender la interfaz `AIProvider` con `tools` (OpenRouter soporta function calling
  estilo OpenAI para modelos compatibles); un **registry de herramientas server-side** que mapea
  cada tool a un server action existente (reusar `equipo/actions`, `generateDiscLink`, etc.);
  **bucle de tool use** (modelo pide tool → ejecutamos → devolvemos resultado → continúa).
  Gate de confirmación en el panel para acciones que escriben.

### DC-4 · Integración Claude Code / Agent SDK — *visión, planificar* — *media/alta complejidad*
Llevar DC-3 a un **agente real multi-paso** usando el **Claude Agent SDK** (o el patrón de
"managed agents"): DC planifica y ejecuta flujos completos ("onboardea a este nuevo colaborador":
crea perfil → genera link DISC → agenda ritual → arma su mapa de rol), con loop gestionado,
memoria de la conversación y herramientas. Dos lecturas (documentar ambas):
- **(a) Producto — "Claude Code para tu negocio":** DC como agente que opera la app por el usuario
  (el norte de DC-3 escalado). Requiere proveedor con tool use robusto (Claude/Anthropic
  directo o vía OpenRouter) y un runtime de agente (Agent SDK / loop propio).
- **(b) Desarrollo:** usar Claude Code (la herramienta) en el flujo de desarrollo del repo
  (ya se viene usando para construir esto).
- **Decisión abierta:** ¿agente "managed" (Anthropic hostea el loop) vs **loop propio** server-side
  (más control, encaja con el stack actual y multi-proveedor)? Recomendado: **loop propio** sobre
  la abstracción `lib/ai` para no atarse a un solo proveedor.

### DC-5 · RAG R2 — conocimiento por empresa — *media prioridad*
Sumar al corpus global (método) el **material por empresa**: workbooks completados, informes DISC
en PDF, notas de coaching, y el material de **Google Drive TBM4** (presentaciones/transcripciones).
Requiere: upload + parsing (PDF→texto), scope `company` (ya soportado en `knowledge_chunks`),
y un re-ingest. Resultado: DC responde fundamentado en la operación real de cada empresa.

### DC-6 · Historial, costos y control — *necesario antes de escalar*
- **Historial** persistente (`ai_conversations` / `ai_messages`) para retomar conversaciones.
- **`ai_usage`** (tokens por empresa/usuario) + **rate-limit** y, post-beta, **presupuesto/gating**
  (créditos IA separados o por plan).
- **Router de costo:** consultas simples → modelo barato; complejas → premium.

### DC-7 · Proactividad — *diferenciador*
DC **inicia** en vez de solo responder: briefing diario generado por IA, nudges contextuales
("hace 5 días que no movés esta tarea"), alertas de equipo (alguien en sombra), check-in semanal.
Encaja con el cron existente y las notificaciones.

### DC-8 · Voz y modo coach — *exploratorio*
- **Voz:** input por micrófono / respuesta hablada (la identidad "asistente" ya lo invita).
- **Modo coach:** para coaches, insights cross-empresa de sus asignadas ("¿qué empresa necesita
  atención esta semana?").

### DC-9 · Fixes de calidad (del QA) — 🟡 **mayoría hecho (2026-06-26)**
Del [`JARVIS_QA_2026-06-22.md`](JARVIS_QA_2026-06-22.md): ✅ doble `layoutId` del orbe (parpadeo),
✅ temperatura 0 imposible, ✅ "activar" sin key, ✅ focus-trap del panel. **Diferido:** restringir
la Edge `embed` a service-role (riesgo de romper el RAG en prod según formato de la key). **De
Sebas (prod):** verificar la service-role key del web (#9/#10). + **deuda:** unificar `lib/ai/`
(admin+web) en `packages/shared`.

---

## 2. Mejoras generales de la app (más allá de DC)

### Monetización y escala
- **A4 — Stripe** (post-beta): compra de créditos por el líder + webhooks + cupones + Stripe Tax.
- **A5 — Dashboard de métricas de la startup** (admin): MRR/ingresos, uso, retención, embudo de la
  beta (con datos de PostHog ya activo).
- **A6 — Enterprise readiness:** export/borrado GDPR, planes/feature-flags, roles internos del
  admin, camino SOC2 / SSO-SAML, leaked-password (Supabase Pro).

### Producto (desbloqueado, sin Dilio)
- **PWA / mobile:** instalable, push notifications nativas, offline básico de rituales.
- **Onboarding guiado por DC** (en vez del tour estático): DC acompaña los primeros pasos.
- **Reportes generados por IA:** reporte semanal, resumen de DISC del equipo, plan de acción.
- **Búsqueda semántica** en toda la app (reutiliza el RAG / pgvector).
- **Integraciones:** WhatsApp/Slack (notificaciones y "preguntale a DC"), Google Calendar (rituales).
- **White-label / branding por empresa** (para vender a consultoras además de Dilio).

### Bloqueado por Dilio (Fase 3)
- **B3+B4** — 3 gráficas DISC de intensidad (Pública/Núcleo/Espejo): falta la fórmula/modelo.
- **A3.2** — 365 meditaciones del Pre-game: falta el material.
- **C1** — mapa visual del sistema LOST: falta la presentación unificada.

---

## 2·B — Pulido pre-beta (UX / calidad) — *9 puntos*

Frentes de pulido que pesan especialmente porque define la **primera impresión** de los pilotos.
No son features nuevas: es calidad. Agrupados por urgencia.

### Críticos para la beta (activación / primera impresión)
1. ✅ **Onboarding del piloto, end-to-end** *(hecho 2026-06-25)*: guard en middleware fuerza al
   arquitecto sin `onboarding_completed` a `/onboarding` (loop-safe) + gate de **cambio de
   contraseña** temporal antes del wizard (`must_change_password` en metadata). Hoy el acceso es por **contraseña temporal manual**
   (email en modo test) → clunky, y los primeros 5 minutos definen si el piloto se queda. Pulir:
   pantalla de bienvenida clara, **forzar cambio de contraseña** en el primer login, "primeros 3
   pasos", y que **DC guíe** el arranque (en vez del tour estático). *Alta.*
2. ✅/🟡 **Empty states + "primera acción"** *(parcial, 2026-06-25)*: se creó `EmptyState` web
   (`components/ui/empty-state.tsx`). Al revisar, **Equipo / Delegación / Plan 90D ya tenían** empty
   states con CTA. Se agregó el faltante real: **Feedback** (sin colaboradores → CTA "Ir a Mi
   Equipo"). Pendiente menor: revisar empties de módulos secundarios (Diagnósticos, Workbooks).
3. **Mobile del web app.** Los pilotos van a abrir desde el **celular**. El admin quedó responsive
   (E2), pero el producto no se auditó mobile-first (dashboard + módulos). *Alta.*

### Confianza / calidad percibida
4. **Estados de carga + performance del dashboard.** El dashboard hace **muchas queries** (~15
   `.from()`); se siente lento y sin skeletons → paralelizar consultas + agregar skeletons. *Media.*
5. **Manejo de errores amigable** en el web (toasts / fallbacks) — que nada "se rompa feo" ante un
   fallo de red/RLS. *Media.*
6. **Hardening de seguridad pre-beta.** Los advisors muestran funciones `SECURITY DEFINER`
   ejecutables por anon/authenticated y **leaked-password protection apagada**; repaso de RLS por
   tabla antes de meter datos reales de empresas. *Media/Alta.*

### Coherencia / marca
7. **Vista de créditos del líder.** Hoy solo ve un **chip de saldo**; no entiende qué es un crédito
   ni cómo conseguir más. Para la beta de "regalamos créditos", debe ser claro (saldo + historial +
   cómo pedir más). *Media.*
8. **Experiencia del test DISC público** (`/disc/[token]`). Lo ven **personas que no son usuarios**
   (los evaluados) → cara visible de la marca; pulir esa pantalla. *Media.*
9. **Unificar el design system** admin ↔ web (hoy dos lenguajes visuales) + cerrar **C1**
   (surfacear "LOST" como sistema en el copy, ya casi). *Baja/Media.*

> **Top 3 antes de abrir la beta:** #1 (onboarding del piloto), #2 (empty states / primera acción),
> #3 (mobile) — deciden si un piloto se engancha o abandona el primer día. #4–#6 entran en una
> "pasada de hardening pre-beta".

---

## 3. Priorización sugerida (próximos pasos)

0. **Pulido pre-beta** (§2·B): top 3 — onboarding del piloto, empty states/primera acción, mobile.
   Condiciona la apertura de la beta; va en paralelo a lo de abajo.
1. ✅ **DC-9** (fixes QA — quick wins) + ✅ **DC-1** (DC global) *(hecho 2026-06-26)* → DC usable en
   toda la app.
2. ✅ **DC-2** (personalización desde super-admin) *(hecho 2026-06-26)* → control sin tocar código.
   **Sigue:** **DC-3** (acciones / tool use).
3. **DC-3** (acciones / tool use) → el salto a copiloto; arrancar con 2–3 tools (crear tarea,
   generar link DISC, reporte semanal) con confirmación.
4. **DC-6** (historial + costos) → antes de abrir a más empresas.
5. **DC-5** (RAG R2) + **DC-7** (proactividad) → profundidad.
6. **DC-4** (agente/Claude Agent SDK) → cuando DC-3 esté maduro.
7. En paralelo, según beta: **A4 Stripe**, **A5 métricas**.

## 4. Decisiones abiertas (para Sebas)
- **Tool use:** ¿confirmación siempre antes de escribir, o "autopilot" para acciones reversibles?
- **Agente:** ¿loop propio (recomendado, multi-proveedor) vs managed agents de Anthropic?
- **Costos de IA:** ¿la plataforma los absorbe (como créditos) o gating desde DC-6?
- **Personalización:** ¿una sola persona de DC global, o por empresa desde el día 1?
- **"Claude Code" se refiere a:** ¿DC-como-agente-en-la-app (a), o usar Claude Code en el dev (b)?
