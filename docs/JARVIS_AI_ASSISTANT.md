# JARVIS — Asistente IA (S18) · Documento de diseño

> Estado: **diseño / no implementado**. Esta nota define la arquitectura del asistente IA real,
> multi-proveedor y configurable desde el panel admin. La implementación se hará por fases
> (ver §9). Fecha: 2026-06-22.

---

## 1. Visión

Convertir **JARVIS** de un *teaser* visual (el orbe que hoy vive en el header del dashboard, sin
función) en un **asistente conversacional real** que entiende el método TBM y el contexto de la
empresa del usuario: su equipo (DISC), sus tareas, sus rituales, su scorecard. El líder le
pregunta en lenguaje natural ("¿a quién delego el cierre de ventas?", "¿por qué Ana está en
sombra?", "armame el reporte de la semana") y JARVIS responde **con la voz del método** y datos
reales.

Dos requisitos de producto definidos por Sebas:
1. **Multi-proveedor**: no atado a Anthropic. Debe permitir elegir **Claude (Anthropic), ChatGPT
   (OpenAI), Gemini (Google) y DeepSeek** — y sumar otros a futuro.
2. **Configurable desde el panel admin** (god-mode): la **API key, el proveedor y el modelo** se
   cargan desde la UI del admin, no hardcodeados en variables de entorno.

---

## 2. Estado actual (de dónde partimos)

- **Orbe + película de bienvenida** (S17.D): `jarvis-core`, `jarvis-intro`, `jarvis-header-orb`,
  `jarvis-store`. El orbe "vuela" del overlay al header. Hoy el orbe del header **no hace nada**
  (tooltip "Tu asistente · próximamente").
- **Briefing contextual** ya existe: `lib/greeting.ts` (`buildBriefing`) arma 1–3 frases con
  datos reales (tareas por vencer, próximo ritual, áreas en rojo, novedades).
- **Contexto del método ya digerido**: `lib/tbm-disc-context.ts` (`TBM_DISC_CANON`,
  `TBM_DISC_CRUCES`, `TBM_METHOD_FRAMING`) + `docs/METODO_TBM_CANONICO.md`. Ya se usa para inyectar
  el método en el prompt de `lib/ai-report.ts` (síntesis DISC con Anthropic, raw fetch).
- **Panel admin** (`apps/admin`, god-mode) con guard `is_platform_admin` y kit de UI propio —
  el lugar natural para la configuración del proveedor.

→ Tenemos la **UI del orbe**, el **contexto del método** y un **primer llamado a IA** (ai-report).
Falta: la capa de proveedores, la config desde admin, el panel de chat y la inyección de contexto.

---

## 3. Arquitectura multi-proveedor

### 3.1 Capa de abstracción (un solo punto de entrada)

Un módulo `packages/shared/ai/` (o `apps/web/src/lib/ai/`) expone **una interfaz única**; cada
proveedor es un *adapter* que la implementa. El resto de la app nunca habla con un SDK concreto.

```ts
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatOptions = {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
};

export interface AIProvider {
  id: "anthropic" | "openai" | "google" | "deepseek";
  // Devuelve texto completo, o un stream de tokens si stream:true.
  chat(opts: ChatOptions, apiKey: string): Promise<string> | AsyncIterable<string>;
}

// El factory elige el adapter según la config del admin (§4).
export function getProvider(id: AIProvider["id"]): AIProvider;
```

- **Normalización**: cada adapter traduce `ChatMessage[]` al formato del proveedor (Anthropic
  separa `system` del array; OpenAI/DeepSeek lo meten como mensaje `system`; Gemini usa `contents`
  + `systemInstruction`). La app siempre trabaja con el formato normalizado.
- **Streaming**: todos exponen SSE/stream; el adapter los unifica en un `AsyncIterable<string>`.
- **Errores y fallback**: un error/refusal de un proveedor puede caer a otro (ver §10, *failover*).

### 3.2 Proveedores soportados

| Proveedor | Modelos | Acceso | Notas |
|---|---|---|---|
| **OpenRouter (multi-LLM)** ✅ | toda la gama por slug (`anthropic/claude-…`, `openai/gpt-4o`, `google/gemini-2.5-pro`, `deepseek/deepseek-chat`, `meta-llama/…`) | **un endpoint** compatible OpenAI + **una key** | **Vía recomendada (S18.1b)** — una sola integración destraba todos los modelos |
| **Anthropic (Claude)** ✅ | `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5` | raw fetch (patrón `ai-report.ts`) | Opción **directa** (sin intermediario), se mantiene |

> **Decisión (2026-06-22):** se adopta **OpenRouter como vía recomendada** para multi-LLM — un
> endpoint + una key dan acceso a Claude/GPT/Gemini/DeepSeek/Llama eligiendo el modelo por slug.
> **Reemplaza los adapters directos de OpenAI/Gemini/DeepSeek** que estaban planeados para S18.4
> (ya no hacen falta). Se conserva el adapter **Anthropic directo** como alternativa. El admin
> elige proveedor + modelo + key desde el panel.

### 3.3 Dónde corre (seguridad de ejecución)

- **Siempre server-side**: server actions o un **edge function** de Supabase. La API key **nunca**
  llega al cliente. El navegador habla con nuestro endpoint, no con el proveedor.
- **Streaming al cliente** vía SSE desde nuestro endpoint (no exponemos el del proveedor).

---

## 4. Configuración desde el panel admin (god-mode)

### 4.1 UI nueva

Nueva sección **"Asistente IA"** en el sidebar del admin (junto a Inicio · Empresas · Coaches ·
Auditoría). Permite:
- Elegir **proveedor** (Anthropic / OpenAI / Gemini / DeepSeek).
- Elegir **modelo** (lista por proveedor).
- Pegar la **API key** (se guarda cifrada, no se vuelve a mostrar — solo "•••• últimos 4").
- Editar el **system prompt** base (con un default TBM) y la **temperatura**.
- **Activar/desactivar** el asistente (flag global).
- Botón **"Probar conexión"** (hace un ping mínimo al proveedor y reporta ok/error).

### 4.2 Esquema de datos

```sql
create table public.ai_config (
  id            uuid primary key default gen_random_uuid(),
  scope         text not null default 'platform',  -- 'platform' | 'company'
  company_id    uuid references public.companies(id) on delete cascade, -- null si platform
  provider      text not null,                       -- anthropic | openai | google | deepseek
  model         text not null,
  api_key_ref   text,                                -- nombre/id del secreto en Vault (NO la key)
  system_prompt text,
  temperature   numeric not null default 0.7,
  enabled       boolean not null default false,
  updated_by    uuid references auth.users(id),
  updated_at    timestamptz not null default now()
);
alter table public.ai_config enable row level security;   -- sin policies: solo service-role
```

- **Beta**: una sola fila `scope='platform'` (config global; todas las empresas usan el mismo
  proveedor/modelo regalado). Más adelante, override `scope='company'` por empresa.
- Las acciones de escritura/lectura van por **service-role** desde el admin (`createAdminClient`),
  con guard `is_platform_admin`. Toda edición se registra en `audit_log` (`action: 'edit_ai_config'`).

### 4.3 Seguridad de las API keys (crítico)

- **No** guardar la key en claro en `ai_config`. Usar **Supabase Vault** (`vault.create_secret`):
  guardamos el secreto cifrado y en `ai_config.api_key_ref` solo el **nombre/id** del secreto.
- El server (edge function / action con service-role) lee la key vía `vault.decrypted_secrets`
  **en el momento del llamado**; nunca se serializa al cliente ni a logs.
- Alternativa simple para MVP: variable de entorno por proveedor (`ANTHROPIC_API_KEY`, etc.) +
  selección de proveedor/modelo desde el admin. Pero el requisito de Sebas es **cargar la key
  desde la UI** → Vault es el camino correcto.

### 4.4 Plataforma vs por-empresa

| Etapa | Modelo de config |
|---|---|
| **Beta** | `scope='platform'` única (la startup paga la IA, igual que regala créditos) |
| **Post-beta** | Override `scope='company'`: una empresa puede traer su propia key/modelo (BYOK) o usar el plan de la plataforma |

---

## 5. Contexto TBM (qué sabe JARVIS)

El valor está en el **contexto inyectado**. El endpoint arma el `system` + un bloque de contexto
del usuario (server-side, con RLS/own-data):

- **Método** (la "voz"): `TBM_METHOD_FRAMING` + resumen de `METODO_TBM_CANONICO.md` (LOST, ARQI,
  delegación, DISC canónico). Ya existe.
- **Empresa y rol**: nombre, sector, rol del usuario (arquitecto/colaborador/coach).
- **Equipo (DISC)**: perfiles del equipo, cruces y fricciones (`TBM_DISC_CRUCES`,
  `detectPairCrossings`), áreas en rojo.
- **Operación del día**: tareas por vencer, próximo ritual, scorecard semanal, novedades
  (reusa la data de `buildBriefing`).
- **Privacidad**: solo datos de **su** empresa (nunca de otras). Ver §8.

> JARVIS = método (system) + datos reales del usuario (contexto) + pregunta. Eso lo distingue de
> un chatbot genérico.

---

## 6. UX en la web (orbe → panel)

- **Disparador**: click/tap en el **orbe del header** (hoy hover-only → pasa a `<button>`
  accesible, teclado + touch). También atajo `⌘J / Ctrl+J`.
- **Panel**: slide-over lateral (estilo command palette) con:
  - Mensajes (markdown), **respuesta en streaming** (token a token).
  - **Prompts sugeridos** contextuales ("¿A quién delego…?", "¿Por qué X está en sombra?",
    "Resumí mi semana").
  - Estado de "pensando" + posibilidad de cancelar.
- **Historial** (opcional, fase posterior): persistir conversaciones por usuario
  (`ai_conversations` / `ai_messages`).
- Respeta `prefers-reduced-motion`. El orbe reusa `jarvis-core`/`jarvis-store`.

---

## 7. Costos y gating

La IA cuesta por token. Opciones (a decidir, §11):
- **Beta**: la plataforma absorbe el costo (como regala créditos). Rate-limit por usuario/día.
- **Post-beta**: atar el consumo a un saldo de **créditos IA** (separado del crédito = 1 DISC), o
  a un plan. El `audit_log`/un `ai_usage` registra tokens por empresa para control.
- **Control de costo técnico**: default a modelos baratos (Haiku / Gemini Flash / deepseek-chat)
  para consultas simples; subir a Opus/GPT-4o solo en tareas complejas (router por dificultad).

---

## 8. Privacidad y seguridad

- **Qué se envía** al proveedor: solo lo necesario del contexto del usuario; nunca datos de otras
  empresas. Documentar y permitir **opt-out** por empresa.
- **Retención del proveedor**: avisar que el texto se procesa en un tercero; elegir proveedores/
  planes con retención acotada. (Claude/OpenAI/Gemini tienen modos enterprise sin entrenamiento.)
- **PII**: evitar mandar emails/teléfonos salvo que la consulta lo requiera.
- **Keys**: Vault (§4.3). **Guard** `is_platform_admin` en toda la config. Audit log.
- **Prompt injection**: el contexto de datos va claramente delimitado y el system instruye a no
  ejecutar instrucciones embebidas en datos del usuario.

---

## 9. Roadmap por fases

| Fase | Alcance | Entregable |
|---|---|---|
| **S18.1 — Cimientos** ✅ | Capa de abstracción `ai/` + adapter **Anthropic** + esquema `ai_config` + Vault + sección admin "Asistente IA" (cargar key/modelo, probar conexión) | Config funcional, sin chat aún |
| **S18.1b — OpenRouter** ✅ | Adapter **OpenRouter** (un endpoint/una key → toda la gama de LLMs por slug) + modelo libre en el admin | Multi-LLM ya disponible |
| **S18.2 — Chat básico** | Endpoint server + panel slide-over desde el orbe (accesible) + respuesta **no-streaming** con contexto TBM mínimo | JARVIS responde |
| **S18.3 — Streaming + contexto rico** | SSE token a token + inyección completa (equipo/DISC/tareas/rituales) + prompts sugeridos | Experiencia "real" |
| **S18.4 — (absorbido por S18.1b)** | ~~Adapters OpenAI/Gemini/DeepSeek directos~~ → cubiertos por OpenRouter. Failover entre modelos queda para una fase posterior | — |
| **S18.5 — Acciones (tool use)** | JARVIS ejecuta: crear tarea, generar link DISC, armar reporte semanal (function calling) | Asistente que *hace* |
| **S18.6 — Historial + costos** | Persistencia de conversaciones + `ai_usage` + gating/rate-limit | Producción sostenible |

> Camino mínimo a un JARVIS usable: **S18.1 → S18.2 → S18.3**.

---

## 10. Propuestas adicionales (ideas para evaluar)

1. **Tool use / function calling** — que JARVIS no solo responda sino que **actúe**: "creá una
   tarea para Ana con deadline viernes" → usa el Pase de Estafeta; "generá el link DISC de Beto";
   "armá el reporte semanal". Es el salto de asistente → copiloto. (Anthropic, OpenAI y Gemini
   soportan tool use; el adapter lo normaliza.)
2. **Asistente por rol** — comportamiento distinto para **arquitecto** (delegación, equipo,
   números), **colaborador** (sus tareas, su DISC, cómo crecer) y **coach** (insights cross-empresa
   de sus asignadas).
3. **Briefing proactivo con IA** — la película de login y un "resumen del día" generados por IA a
   partir de `buildBriefing` + tendencias, en vez de plantillas fijas.
4. **RAG sobre datos propios** — embeddings de los workbooks, reportes y notas de coaching de la
   empresa (pgvector en Supabase) para respuestas **fundamentadas en su propia operación**.
5. **Modo coach** — para coaches: "¿qué empresa necesita atención esta semana?" mirando scorecards
   y áreas en rojo de sus asignadas.
6. **Voz** — input por micrófono y/o respuesta hablada (el chime de bienvenida ya marca el tono
   "asistente"); encaja con la identidad JARVIS.
7. **Router de costo** — clasificar la consulta y mandar las simples a un modelo barato, las
   complejas a uno premium; ahorra sin perder calidad.
8. **Failover entre proveedores** — si el proveedor activo falla o rechaza, reintentar con otro
   configurado (la abstracción ya lo permite).
9. **Biblioteca de prompts** — prompts guardados/sugeridos por el método (delegación, feedback
   S.E.C., diseño de equipo por DISC) como atajos de un toque.
10. **Telemetría** — registrar (sin PII) uso por empresa/feature en PostHog para ver qué se le
    pregunta a JARVIS y priorizar.

---

## 11. Decisiones abiertas (para Sebas)

- **Default de proveedor/modelo en beta**: ¿Claude (recomendado) u otro? ¿Modelo caro o barato por
  defecto?
- **Costo en beta**: ¿lo absorbe la plataforma (como los créditos) o gating desde el día 1?
- **Alcance del MVP**: ¿arrancamos por chat informativo (S18.1–3) o vamos directo a acciones
  (tool use, S18.5)?
- **Config global vs por-empresa**: ¿beta 100% plataforma, o ya dejamos BYOK por empresa?
- **Almacenamiento de la key**: ¿Vault (recomendado) o env-vars por proveedor para el MVP?

> Relacionado: [[METODO_TBM_CANONICO]] · `lib/tbm-disc-context.ts` · `lib/ai-report.ts` ·
> `components/dashboard/jarvis-*`. Backlog: este doc cubre **S17 → S18** (el orbe ya anticipaba
> este asistente).
