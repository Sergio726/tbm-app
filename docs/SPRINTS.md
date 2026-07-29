# SPRINTS.md — The Business Multiplier App
**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel  
**Ritmo:** 2h/día · ~14h/semana · Sprints de 2 semanas (~20h c/u)  
**Duración total:** 20 semanas (~5 meses)  
**Equipo inicial:** Solo (Sebas) → incorporar segunda persona en Fase 2  

---

## CHANGELOG — Actualización v1.1 (Mayo 2026)
> Basado en las **18 respuestas oficiales de Dilio Donado** — fuente de verdad del método.

| Ref. | Impacto | Cambio |
|---|---|---|
| I1 | Sprint 4 | Módulo de Delegación se construye sobre S6 (5 puntos). S1 es solo introducción conceptual. Ya correcto en el plan. |
| I2 | Sprint 2 + 6 | Flujo único: Rocas 90D → Los 5 Grandes (noche) → War Up (mañana, alineado) → Dashboard. Parking Lot obligatorio. |
| I3 | Sprint 2 | Los 5 Grandes ≠ 3 Big Wins. Son herramientas distintas en momentos distintos. Añadido ritual nocturno "Los 5 Grandes". |
| **I4** | **Sprint 1 + 7** | **BUG DE NAMING:** El diagnóstico de 8 áreas de S1 se llama "Diagnóstico Organizacional TBM". "Team Performance Scorecard" es la herramienta de S7 (KPI individual). Corregido en sprint 1 y 7. |
| I5 | Sprint 3 | ARQI / LOS / Matriz son tres lentes complementarios — ninguno reemplaza a otro. Ya correcto en el plan. |
| B2 | Sprint 5 | Sesiones de Escape = metodología 3 Streaks. El feedback es de aprendizaje, no de cumplimiento del Scorecard. Añadido. |
| B3 | Sprint 6 | Confirmado: la app necesita módulo "Activos del Sistema" (repositorio de procesos documentados). Añadido a Sprint 6. |
| B4 | Sprint 2 | Reporte Semanal = Cool Down del viernes, generado automáticamente por la app. Añadido. |
| L1 | Sprint 2 | War Up es en vivo, de pie, en tiempo real. La corrección es presencial. La app soporta flujo en vivo como sala digital. |
| L2 | Sprint 0 | Modo solopreneur: sistema completo, nada deshabilitado. Ya correcto en el plan. |
| L3 | Sprint 7 | Desbloqueo híbrido: mínimo 7 días + botón "Solicitar avance anticipado" al llegar al 100% de completitud. Corregido. |
| L4 | Sprint 6 | Sin graduación. Ciclo continuo de 90 días. Indicador financiero: mes anterior año pasado vs. mes actual. Añadido. |
| N1 | Sprint 9 | Panel Super Coach en 3 capas: semáforo general, deep dive por alumno, canal de nota de coaching. Añadido a Sprint 9. |
| N2 | Sprint 0 | Dos tipos de acceso: Alumno TBM (visible al coach) vs. Usuario Independiente (self-service). Añadido al schema. |
| N3 | — | 100% individual, cada empresa a su propio ritmo. Sin cohorts. Ya correcto en el plan. |
| N4 | Sprint 10 | Suscripción anual: Bundle con mentoría (precio con descuento) vs. Sistema Standalone (precio sin descuento). Anotado. |

---

## RESUMEN EJECUTIVO DE SPRINTS

| Sprint | Tema | Semanas | Entregable clave |
|---|---|---|---|
| **S0** | Setup & Auth | 1–2 | App en producción con login + 2 tipos de usuario |
| **S1** | Onboarding + Dashboard | 3–4 | Diagnóstico Organizacional TBM + semáforos |
| **S2** | Rituales | 5–6 | Los 5 Grandes + War Up en vivo + Cool Down |
| **S3** | Mi Equipo (DISC + LOS) | 7–8 | Mapa completo del equipo |
| **S4** | Delegación | 9–10 | Pase de Estafeta (S6) con 5 puntos + ARQI |
| **S5** | Feedback S.E.C. | 11–12 | Sistema de feedback + 3 Streaks |
| **S6** | Plan 90D + BOS + Activos | 13–14 | Planificación estratégica + repositorio de procesos |
| **S7** | Workbooks S1–S4 | 15–16 | Primeras 4 sesiones digitalizadas (unlock híbrido) |
| **S8** | Workbooks S5–S8 | 17–18 | Programa completo digitalizado |
| **S9** | Polish + Exportación + Super Coach | 19–20 | App lista para beta + panel de Dilio |
| **S10** | Beta cerrada | 21–22 | Feedback real de 3–5 empresas piloto |
| **S11** | Tour Guiado de Onboarding | 23–24 | Primera experiencia interactiva paso a paso para usuarios nuevos |
| **S12** | Dashboard 100% Funcional | 25–26 | Hero strip, rituales y diagnóstico con datos reales — sin hardcoding |
| **S13** | Hero Strip Interactivo | 27–28 | Las 4 tiles del dashboard con hover, click, tooltips y paneles de detalle |
| **S14** | Búsqueda, Notificaciones & Energía | 29–30 | ⌘K navegación rápida + campana funcional con eventos reales + fix energía |
| **S15** | Cierre de Migración Supabase | — | Proyecto nuevo en prod (Vercel) + SMTP propio + prueba real de colaborador |
| **S16** | Mejoras y Correcciones (Mi Equipo) | — | 19 bugs resueltos del módulo Mi Equipo (4 ALTA + 9 MEDIA + 6 BAJA) |
| **S17** | Multiplicador (M8) + Bienvenida JARVIS + Re-tour | — | Módulo Multiplicador de Liderazgo real + saludo contextual en login + re-acceso al tour |
| **S18** | Asistente IA Conversacional | — | 🔮 Propuesto. Etapas 1–3 **ya implementadas** como DC (DC-1…DC-9); la **Etapa 4 (proactividad)** la cierra S24 |
| **S19** | Notificaciones por Email | — | 🔮 Propuesto → **absorbido por S23**, que lo reemplaza con el pedido concreto de Dilio |
| **S20** | Diagrama de Dependencias en Tiempo Real | — | 🔮 Propuesto, sin fecha |
| | **── BLOQUE JUL-2026 (feedback Dilio 25/07) ──** | | ver [`OBSERVACIONES_DILIO_2026-07.md`](OBSERVACIONES_DILIO_2026-07.md) |
| **S21** | Confianza: acceso, coach y calendario | — | Alta de colaboradores reparada + panel del coach visible + sprints anclados al año calendario |
| **S22** | Rol y progresión de la persona | — | Ficha de rol con derechos de decisión ($) + insignia de nivel visible |
| **S23** | Despertador diario (voz de DC) | — | Email matinal a todos los roles, con la persona de DC y los hábitos que cada uno declaró |
| **S24** | DC proactivo + delegación asistida | — | DC deja de ser pasivo: interviene mientras el usuario delega. **Patrón reusable** por S25 y S27 |
| **S25** | KPIs en cascada: estructura | — | De los 5 Grandes al aporte de cada responsable y su actividad diaria |
| **S26** | KPIs: seguimiento y alerta predictiva | — | "Parabrisas, no retrovisor": avisa a mitad de mes, no al vencer |
| **S27** | Super Coach: señales multi-empresa | — | Adopción, rezagos y equipos desbalanceados de todas las empresas alumnas |
| **S28** | Super Coach: intervención | — | Mensajería coach ↔ empresa + asistente IA que vigila todas las compañías |
| **S29** | Capacitación: grabar → SOP en PDF | — | Grabar in-app → transcribir → manual de 2 páginas con títulos en forma de pregunta |
| **S30** | Madurez del empresario | — | ⛔ Bloqueado: "¿seguís siendo el cuello de botella?" + aviso de retroceso |
| **S31** | Canal WhatsApp | — | ⛔ Bloqueado: suma WhatsApp a la capa de canal de S23/S26/S28 |

---

## SPRINT 0 — Setup & Fundamentos
**Semanas:** 1–2 · **Horas estimadas:** 18h  
**Objetivo:** Tener el esqueleto de la app corriendo en producción, con auth completo y navegación base.

### Tareas

**Infraestructura (4h)**
- [ ] Crear proyecto Next.js 14 con TypeScript (`npx create-next-app@latest tbm-app --typescript`)
- [ ] Configurar Tailwind CSS + shadcn/ui (instalar componentes base: Button, Input, Card, Dialog, Toast)
- [ ] Crear proyecto en Supabase (free tier)
- [ ] Conectar Next.js ↔ Supabase (env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Deploy inicial en Vercel + dominio temporal

**Base de datos — Schema inicial (3h)**
```sql
-- Tablas del Sprint 0
companies (id, name, owner_id, created_at, settings jsonb)
profiles (
  id, company_id, full_name, email, role, avatar_url, created_at,
  access_type varchar(20) DEFAULT 'independent'  -- 'mentored' | 'independent' [N2]
  -- 'mentored': alumno TBM, visible en panel Super Coach de Dilio
  -- 'independent': self-service, no aparece en panel del coach
)
```
> ⚠️ **[N2]** El tipo de acceso se define en el registro. Determina si el usuario aparece en el panel Super Coach.
- [ ] Crear tablas en Supabase
- [ ] Configurar Row Level Security (RLS): cada usuario solo ve datos de su empresa
- [ ] Crear triggers: auto-crear `profile` cuando se registra un usuario

**Auth completo (5h)**
- [ ] Página `/login` — email + contraseña
- [ ] Página `/register` — nombre, email, contraseña + nombre de empresa
- [ ] Middleware de rutas protegidas (`middleware.ts`)
- [ ] Redirect post-login → `/dashboard`
- [ ] Logout
- [ ] Manejo de sesiones con Supabase Auth SSR (`@supabase/ssr`)

**Layout shell (4h)**
- [ ] Sidebar de navegación con los 8 módulos (íconos, labels, active state)
- [ ] Header con avatar del usuario + nombre de empresa
- [ ] Layout responsive (sidebar colapsable en mobile)
- [ ] Página `/dashboard` vacía (placeholder)
- [ ] Tema visual: definir paleta de colores TBM (oscuro/profesional)

**Calidad (2h)**
- [ ] ESLint + Prettier configurados
- [ ] `.env.local` documentado con todas las variables requeridas
- [ ] `README.md` con instrucciones de setup

### ✅ Criterio de éxito del Sprint 0
> Puedo entrar a `tbm-app.vercel.app`, registrarme con mi empresa, iniciar sesión, ver el sidebar con los módulos, y cerrar sesión. Todo con datos reales en Supabase.

---

## SPRINT 1 — Onboarding + Dashboard Central
**Semanas:** 3–4 · **Horas estimadas:** 20h  
**Objetivo:** El Arquitecto completa el diagnóstico inicial y ve su Dashboard con semáforos reales.

### Nuevas tablas
```sql
scorecards (id, company_id, user_id, type, scores jsonb, total_score, completed_at)
kpis (id, company_id, name, owner_id, weekly_target, current_value, week_date)
```

### Tareas

**Onboarding flow (6h)**
- [ ] Pantalla 1: Datos de empresa (nombre, sector, cantidad de colaboradores) + selector de tipo de acceso (Alumno TBM con mentoría / Usuario Independiente) [N2]
- [ ] Pantalla 2: **Diagnóstico Organizacional TBM** — 8 áreas, slider 1–5 con descripción de cada área _(⚠️ NO llamar "Team Performance Scorecard" — ese nombre es exclusivo del módulo S7 de KPI individual por colaborador)_ [I4]
- [ ] Pantalla 3: Configurar rituales (frecuencia: Modo A/B/C/Diario)
- [ ] Pantalla 4: Invitar colaboradores (input de emails → Supabase invite)
- [ ] Guardar progreso de onboarding (si cierra y vuelve, retoma donde quedó)
- [ ] Redirect al Dashboard al completar

**Dashboard Central (10h)**
- [ ] **Semáforo de 8 Áreas:** cards con color según score (Verde ≥4 / Amarillo 3 / Rojo ≤2)
- [ ] **KPIs de la semana:** 3 slots configurables (meta vs. real, barra de progreso)
- [ ] **Estado de rituales:** chip "Warm Up hecho hoy ✓" o "⚠️ Sin ritual hace 3 días"
- [ ] **Energía del líder:** selector 1–5 al entrar (emoji scale), guarda por día
- [ ] **Progreso del Plan 90D:** placeholder (se activa en Sprint 6)
- [ ] Lógica de semáforo: si score < 2.5 en cualquier área → banner de alerta roja

**Invitación de colaboradores (4h)**
- [ ] Email de invitación vía Supabase Auth
- [ ] Página de aceptación de invitación → completa perfil (nombre, cargo)
- [ ] Vista "Mi Equipo" básica: lista de colaboradores con nombre, cargo y estado (pendiente/activo)

### ✅ Criterio de éxito del Sprint 1
> El Arquitecto completa el onboarding en < 10 minutos, ve el Dashboard con los 8 semáforos de color real según su diagnóstico, y puede invitar a un colaborador que se registra y aparece en la lista.

---

## SPRINT 2 — Rituales Diarios
**Semanas:** 5–6 · **Horas estimadas:** 22h  
**Objetivo:** El equipo puede ejecutar el ciclo Pre-game → Warm Up → Cool Down desde la app.

### Nuevas tablas
```sql
rituals (id, company_id, type, date, created_by, status)
ritual_entries (id, ritual_id, user_id, 
  -- Warm Up
  what text, why text, blocker text, validated_by uuid,
  -- Cool Down  
  victory text, reality_check text, next_day text,
  created_at)
```

### Tareas

**Los 5 Grandes — Ritual Nocturno (3h)** _(nuevo — [I2] [I3])_
> Las 5 prioridades del NEGOCIO para el día siguiente, alineadas a las Rocas del trimestre. Se hacen la noche anterior. Herramienta distinta al Pre-game matutino.
- [ ] Formulario nocturno (accesible desde las 6pm): 5 slots de texto con label "¿Qué tiene que pasar mañana para que el trimestre avance?"
- [ ] Cada slot muestra su Roca asociada (selector dropdown de Rocas activas del Plan 90D)
- [ ] Si un ítem NO se puede vincular a ninguna Roca → botón "Enviar al Parking Lot" (no al día de mañana)
- [ ] **REGLA CRÍTICA:** Todo lo que no esté alineado a las Rocas va al Parking Lot, no al día de hoy. La app lo enforcea con aviso visual.
- [ ] Historial de Los 5 Grandes (los últimos 7 días visibles en timeline)

**Pre-game personal (3h)**
> Herramienta MATUTINA y PERSONAL. Distinta a Los 5 Grandes (que son nocturnos y del negocio). [I3]
- [ ] Formulario matutino privado del Arquitecto:
  - **3 Big Wins** (3 victorias personales que se propone para sí mismo ese día — no del negocio, del líder como persona) [I3]
  - Mi Marcha de 20 Millas (acción diaria constante — editable solo 1 vez por semana)
  - ¿Hice activación física? (toggle)
- [ ] Pre-game como gate: el War Up no se puede iniciar hasta que el Arquitecto lo complete
- [ ] Historial de pre-games (calendario de días completados)

**War Up del equipo (8h)** _(⚠️ es "War Up", no "Warm Up")_
> **[L1] DISEÑO CRÍTICO:** El War Up es un ritual EN VIVO, DE PIE, en tiempo real. La corrección ocurre presencialmente mientras el equipo presenta. La app es la sala digital del stand-up — NO un formulario asíncrono.
- [ ] El Arquitecto inicia el War Up del día (botón "Iniciar War Up" → abre sala en vivo)
- [ ] Cada colaborador ve la pantalla de entrada con 3 campos:
  - **QUÉ:** "¿Qué vas a lograr hoy?" (placeholder: "No digas 'trabajar', di el entregable exacto")
  - **POR QUÉ:** "¿Por qué es lo más rentable hoy?" (debe poder vincularse a una Roca)
  - **BLOQUEO:** "¿Qué necesitás del líder para lograrlo?"
- [ ] El Arquitecto ve todas las entradas en tiempo real (Supabase Realtime) — como sala de stand-up digital
- [ ] Por cada entrada: botón "✓ Con criterio" o "✗ Sin criterio claro" → si marca sin criterio, el ítem se tilda visualmente + notificación al colaborador para corregir en el acto
- [ ] Ítem no alineado a Rocas → botón "→ Parking Lot" disponible para el Arquitecto
- [ ] Timer visible: 15 minutos recomendados (no bloqueante, solo visual)
- [ ] Modo secundario asincrónico: plazo hasta las 9am si el equipo es remoto o distribuido

**Cool Down (6h)**
- [ ] Formulario de cierre accesible desde las 5pm
- [ ] 3 campos por persona:
  - **Victory Log:** "¿Cuál fue tu victoria de hoy?" — campo obligatorio (no se puede enviar vacío, mensaje: "Encontrá UNA victoria, aunque haya sido un caos")
  - **Reality Check:** "¿Qué NO se logró y por qué?" (hechos, no excusas)
  - **Cierre de ciclos:** "¿Qué queda agendado para mañana?"
- [ ] El Arquitecto ve resumen del equipo al final del día
- [ ] **Reporte Semanal automático del viernes:** [B4] El Cool Down del viernes genera automáticamente el cierre de semana (celebración de victorias O reflexión sobre derrotas). No es manual — la app lo compila y presenta como ritual de cultura. Formato: victorias + realidades + compromisos del equipo consolidados.

**Configuración y alertas (5h)**
- [ ] Pantalla de configuración de rituales (Modo A/B/C/Diario)
- [ ] Alerta automática: si 3+ días consecutivos sin Warm Up → badge rojo en sidebar + banner en Dashboard
- [ ] Historial de rituales: calendario tipo GitHub (días verdes = ritual completado)
- [ ] Resumen semanal: % de días con ritual completado en las últimas 4 semanas

### ✅ Criterio de éxito del Sprint 2
> El Arquitecto hace su Pre-game, inicia el Warm Up, los colaboradores ingresan su QUÉ/POR QUÉ/BLOQUEO, el Arquitecto valida en tiempo real, y al final del día todos completan el Cool Down con el Victory Log obligatorio.

---

## SPRINT 3 — Mi Equipo (DISC + LOS + Matriz de Autoridad)
**Semanas:** 7–8 · **Horas estimadas:** 20h  
**Objetivo:** El Arquitecto tiene un mapa vivo y completo de cada persona del equipo.

### Nuevas tablas
```sql
-- Agregar a profiles:
disc_profile char(1), -- D/I/S/C
disc_state varchar(10), -- 'luz' | 'sombra'
disc_fear text,
los_level smallint, -- 1-5
los_target smallint,
role_mission text,
role_tasks jsonb -- array de 3 tareas

authority_matrix (id, company_id, 
  level_1_amount decimal, -- autonomía total
  level_2_min decimal, level_2_max decimal, -- táctica
  level_3_threshold decimal) -- requiere aprobación

disc_scans (id, company_id, scanned_user_id, scanned_by,
  state varchar(10), fear_activated text, notes text, scanned_at)
```

### Tareas

**Perfil DISC por colaborador (6h)**
- [ ] Card de cada colaborador con:
  - Badge de perfil DISC (D/I/S/C) con color por tipo
  - Toggle Luz 🌟 / Sombra 🌑 (actualizable por el Arquitecto)
  - Temor activo (texto editable según perfil)
  - Campo: "¿Qué temor le activé yo como líder?"
- [ ] Guía rápida DISC inline (hover sobre el badge → tooltip con descripción)
- [ ] Historial de cambios Luz/Sombra con fecha y nota

**Niveles LOS (4h)**
- [ ] Visualización de escalera N1→N5 por colaborador
- [ ] Nivel actual marcado + nivel meta del mes
- [ ] Criterio para subir de nivel (texto editable por el Arquitecto)
- [ ] Vista global: todos los colaboradores en una grilla con sus niveles

**Mapa de Roles (4h)**
- [ ] Por colaborador: Misión única del rol (una oración), 3 tareas clave diarias
- [ ] % de tiempo operativo vs. estratégico (slider visual)
- [ ] Detector de roles ambiguos: si no tiene "número único" KPI → badge de alerta naranja

**Matriz de Autoridad TBM (3h)**
- [ ] Configuración única del Arquitecto: 3 montos (N1 / rango N2 / umbral N3)
- [ ] Display público para el equipo: "¿Cuánto podés gastar sin preguntar?"
- [ ] Al crear una tarea con costo → la app indica automáticamente qué nivel aplica

**Detector de Cruces Peligrosos (3h)**
- [ ] Al guardar el equipo → algoritmo revisa combinaciones DISC por área
- [ ] Alerta si: Pensador C liderando Influyentes I / Dominante D sin balance S en equipo ejecutor / etc.
- [ ] Sugerencia de corrección por cada cruce detectado

### ✅ Criterio de éxito del Sprint 3
> El Arquitecto puede ver la ficha completa de cada colaborador (DISC, Luz/Sombra, nivel LOS, rol, KPI), configurar la Matriz de Autoridad, y recibir alertas automáticas de cruces peligrosos.

---

## SPRINT 4 — Delegación (Pase de Estafeta)
**Semanas:** 9–10 · **Horas estimadas:** 22h  
**Objetivo:** Sistema de delegación con validación real — no se puede crear una tarea incompleta.

### Nuevas tablas
```sql
tasks (id, company_id, created_by, assigned_to,
  -- Los 5 puntos (todos NOT NULL para poder guardar)
  what_dod text NOT NULL,
  why_context text NOT NULL,
  how_constraints text NOT NULL,
  when_deadline timestamptz NOT NULL,
  check_loop text NOT NULL,
  -- Metadata
  los_required smallint,
  estimated_cost decimal,
  authority_level smallint, -- calculado automáticamente
  status varchar(20), -- pending/in_progress/blocked/done
  delegable_flag boolean,
  created_at, updated_at)

task_updates (id, task_id, user_id, type, content, created_at)
-- type: 'progress' | 'blocked' | 'boomerang_attempt' | 'completed'
```

### Tareas

**Creador de tareas con validación (8h)**
> ⚠️ **[I1]** Este wizard está basado en el Pase de Estafeta de S6 (protocolo definitivo de 5 puntos), NO en el Protocolo de Delegación de S1 (introducción conceptual).
- [ ] Formulario en 5 pasos (wizard):
  - Paso 1 — **QUÉ:** Definition of Done (texto + opción de adjuntar imagen)
  - Paso 2 — **POR QUÉ:** Contexto e impacto
  - Paso 3 — **CÓMO:** Restricciones (presupuesto, herramientas, qué NO romper)
  - Paso 4 — **CUÁNDO:** Date-time picker exacto + canal de entrega
  - Paso 5 — **FEEDBACK LOOP:** Check-in antes del vencimiento (cuándo, cómo)
- [ ] Barra de progreso del wizard (1/5 → 5/5)
- [ ] Botón "Guardar" deshabilitado hasta completar los 5 pasos
- [ ] Mensaje de error si intenta saltear: "Este punto es obligatorio. Si falta, el error es tuyo."
- [ ] Selector de colaborador asignado + nivel LOS requerido
- [ ] **Nivel ARQI de la tarea** [I5]: radio button → Informar / Consultar / Delegar _(ARQI define los derechos de decisión para esa tarea específica. Informar = lo ejecuta y avisa. Consultar = lo ejecuta pero pide opinión antes. Delegar = autonomía total dentro de los límites del QUÉ.)_

**Escudo Anti-Boomerang (5h)**
- [ ] Cuando un colaborador marca "Estoy bloqueado" → NO notifica al Arquitecto directamente
- [ ] La app le presenta primero: "Antes de escalar, respondé: ¿Cuáles son tus 3 opciones? ¿Cuál recomendás?"
- [ ] El colaborador debe completar ese formulario antes de que se habilite el botón "Escalar al líder"
- [ ] El Arquitecto recibe la notificación con las 3 opciones ya escritas (no solo el problema)
- [ ] Log de intentos de boomerang (cuántas veces cada colaborador intentó escalar)

**Sistema de alertas 72h (4h)**
- [ ] Cron job (Supabase Edge Function) que corre cada hora
- [ ] Si una tarea lleva > 72h sin actualización de estado → notificación al Arquitecto
- [ ] Badge rojo en el sidebar del módulo Delegación
- [ ] Email de recordatorio al colaborador asignado

**Lista de Transferencia Inmediata (3h)**
- [ ] Sección "Tareas que sigo haciendo yo" en el Arquitecto
- [ ] Por cada tarea listada: costo de su hora × horas semanales = costo mensual en $
- [ ] Toggle "Podría delegar esta al 70%" → se mueve a candidatos de delegación
- [ ] Alerta si el Arquitecto tiene más de 5 tareas delegables sin delegar

**Vistas del módulo (2h)**
- [ ] Vista "Mis tareas delegadas" (Arquitecto): tablero Kanban simple (Pendiente / En curso / Bloqueado / Listo)
- [ ] Vista colaborador: "Mis tareas" con los 5 puntos visibles, estado, deadline

### ✅ Criterio de éxito del Sprint 4
> No se puede guardar ninguna tarea sin los 5 puntos completos. Cuando un colaborador se bloquea, la app le pide sus 3 opciones antes de escalar. Las tareas sin movimiento en 72h generan alerta automática.

---

## SPRINT 5 — Feedback S.E.C.
**Semanas:** 11–12 · **Horas estimadas:** 16h  
**Objetivo:** El Arquitecto nunca más improvisa un feedback. Todo estructurado, guardado y medible.

### Nuevas tablas
```sql
feedbacks (id, company_id, from_user, to_user,
  type char(1), -- S/E/C
  content text,
  disc_profile_target char(1), -- perfil DISC del receptor
  disc_tone_notes text, -- sugerencia de tono
  delivered_at timestamptz,
  created_at)
```

### Tareas

**Constructor de feedback (7h)**
- [ ] Selector de colaborador → muestra su perfil DISC y último feedback recibido
- [ ] Selector de tipo: S (Sostener) / E (Elevar) / C (Corregir)
- [ ] Template dinámico que se completa según el tipo:
  - **S:** "Noté que hiciste [___]. Eso nos da [___]. Quiero que sostengas ese estándar."
  - **E:** "Tu trabajo en [___] estuvo bien, pero sos un jugador nivel [___]. Para la próxima quiero que [___]."
  - **C:** "El comportamiento de [___] es una falta de respeto al estándar. Nos cuesta [___]. Necesito que corrijas esto inmediatamente."
- [ ] Sugerencia de tono por perfil DISC (ej: para S → no ser agresivo en el C, el temor es la no-aprobación)
- [ ] Botón "Guardar borrador" (para practicar antes de entregar)
- [ ] Botón "Marcar como entregado" → mueve al historial con fecha

**Historial y métricas (5h)**
- [ ] Timeline de feedbacks por colaborador (S/E/C con color)
- [ ] Balance S/E/C: gráfica de torta o barras (¿cuándo fue el último S?)
- [ ] Alerta: si un colaborador lleva 14+ días sin ningún feedback → badge naranja
- [ ] Alerta: si el 100% de feedbacks recientes son tipo C → "¿Cuándo fue la última vez que reforzaste algo positivo?"
- [ ] Vista del colaborador: puede ver los feedbacks que le fueron marcados como "entregados"

**Templates por perfil DISC (4h)**
- [ ] Para cada tipo S/E/C × 4 perfiles DISC = 12 micro-guías de tono
- [ ] Ej: S para perfil D → directo y específico. S para perfil I → público si es posible.
- [ ] Estas guías aparecen como tooltip/sidebar mientras se escribe el feedback

**Sesiones de Escape — Metodología 3 Streaks (3h)** _(nuevo — [B2])_
> ⚠️ El feedback en las Sesiones de Escape es para APRENDIZAJE, no para mostrar indicadores de cumplimiento del Scorecard. El Scorecard mide rendimiento; el ESC construye capacidad.
- [ ] Módulo de Sesión de Escape: el Arquitecto la crea asignada a un colaborador + proceso a enseñar
- [ ] 3 fases visibles con estado:
  - **Streak 1 — Yo hago, tú ves:** El líder demuestra. La persona observa. Estado: Aprendiendo.
  - **Streak 2 — Tú haces, yo acompaño:** La persona ejecuta. El líder acompaña. Estado: Practicando.
  - **Streak 3 — Tú haces, yo superviso:** Autonomía total con check-in ligero. Estado: Autónomo.
- [ ] Regresión documentada: si hay error en Streak 2 → botón "Volver a Streak 1" + nota obligatoria de qué falló
- [ ] Lógica de protección al líder: el registro de los 3 Streaks queda guardado como evidencia de que se dio todo el apoyo necesario
- [ ] **Distinción clara en UI:** Las Sesiones de Escape son un módulo de desarrollo (ícono aprendizaje). Los feedbacks S/E/C son para rendimiento (ícono semáforo). No mezclar.

### ✅ Criterio de éxito del Sprint 5
> El Arquitecto puede construir un feedback S/E/C en < 3 minutos con el template, con sugerencia de tono según el perfil DISC del colaborador, y ver el historial de balance S/E/C por persona. Las Sesiones de Escape quedan registradas con los 3 Streaks y evidencia de soporte al colaborador.

---

## SPRINT 6 — Plan 90D + BOS Dashboard
**Semanas:** 13–14 · **Horas estimadas:** 22h  
**Objetivo:** Planificación estratégica completa + Dashboard de Productividad con Leading Indicators.

### Nuevas tablas
```sql
rocks (id, company_id, title, owner_id, success_criteria,
  start_date, end_date, progress smallint, status, created_at)

rock_updates (id, rock_id, user_id, note, progress_at, created_at)

idea_parking (id, company_id, proposed_by, idea, rationale,
  parked_at, review_at, status) -- review_at = parked_at + 90 días

decisions (id, company_id, user_id, decision_text, 
  info_available smallint, -- % de info al momento de decidir
  applied_70_rule boolean,
  disagree_and_commit boolean, created_at)

leading_indicators (id, company_id, name, owner_id,
  weekly_target decimal, current_value decimal,
  week_date date, created_at)
```

### Tareas

**BOS Dashboard — Leading Indicators (6h)**
- [ ] Configuración: el Arquitecto define hasta 5 Leading Indicators con nombre + dueño + meta semanal
- [ ] Cada lunes: cada dueño ingresa su número real de la semana anterior
- [ ] Semáforo automático: ≥100% → 🟢 / 90–99% → 🟡 / <90% → 🔴
- [ ] "Número único" por colaborador: el KPI que justifica su salario (vinculado a M3)
- [ ] Distinción visual Leading vs Lagging en el Dashboard
- [ ] "Sesión de Silencio": al abrir un KPI en rojo → overlay de 5 segundos antes de habilitar comentario

**Clasificador Rocas vs. Arena (4h)**
- [ ] Matriz 2×2 visual (urgencia × impacto)
- [ ] El Arquitecto arrastra iniciativas a cada cuadrante
- [ ] Lo que cae en "Arena" (urgente + bajo impacto) → botón directo "Enviar a Delegación"
- [ ] Lo que cae en "Rocas" (alto impacto + no urgente) → botón "Agregar al Plan 90D"

**Plan 90D — Rocas Trimestrales (6h)**
- [ ] Formulario: hasta 5 Rocas por trimestre
- [ ] Por Roca: Título + Dueño (un solo usuario) + Criterio de éxito el Día 90
- [ ] Barra de progreso manual (el dueño actualiza % semanalmente)
- [ ] Check-in semanal: notificación al dueño cada lunes "¿Qué avanzó esta Roca?"
- [ ] Contador de días: "Día X de 90"
- [ ] Al llegar al Día 90 → pantalla de evaluación: ¿se logró el criterio de éxito?

**Parqueadero de Ideas (3h)**
- [ ] Tabla de ideas con: Idea + Propuesta por + Fecha + Días para el Día 91
- [ ] Contador visible: "Podés ejecutar esta idea en X días"
- [ ] Al cumplirse el Día 91 → notificación: "¿Sigue siendo una buena idea? ¿Va a las Rocas del próximo trimestre?"
- [ ] La idea no puede moverse a "activa" hasta que pase el Día 91 (bloqueo real)

**Filtro del 70% + Disagree & Commit (3h)**
- [ ] Registro de decisiones: "Decisión pendiente" + "Con 70% de info, decidiría..."
- [ ] Historial de decisiones tomadas y su resultado posterior
- [ ] Registro de Disagree & Commit: ¿Con quién? ¿Sobre qué? ¿Se ejecutó al 100%?

**Activos del Sistema — Repositorio de Procesos (4h)** _(nuevo — [B3])_
> El líder graba un proceso una sola vez → queda disponible para el equipo 24/7. Esto crea un activo que trabaja sin el líder. Se actualiza SOLO cuando el proceso cambia.
```sql
process_assets (id, company_id, created_by,
  title text NOT NULL,
  description text,
  video_url text,           -- link a Drive, Loom, YouTube, etc.
  drive_link text,          -- documento de referencia
  category varchar(50),     -- 'operativo' | 'comercial' | 'rrhh' | 'financiero'
  last_updated_at timestamptz,
  is_active boolean DEFAULT true)
```
- [ ] Vista de repositorio: lista de procesos con título, categoría, fecha de última actualización y link
- [ ] Al crear un proceso: título + descripción + URL del video/doc + categoría
- [ ] Badge "Desactualizado" si `last_updated_at` > 90 días
- [ ] El equipo puede acceder en modo lectura (no puede editar, solo el Arquitecto)
- [ ] Integración con Drive: campo de link directo al documento del proceso

**Indicador Financiero YoY + Ciclo Continuo (2h)** _(nuevo — [L4])_
> El programa TBM no tiene graduación. Es un ciclo continuo de sprints de 90 días. El termómetro de valor es el crecimiento real del negocio.
- [ ] Widget en Dashboard: "Facturación mismo mes del año anterior vs. mes actual" (el Arquitecto ingresa ambos números manualmente)
- [ ] Display visual: barra de crecimiento con % de variación YoY (promesa del framework: 15-30%)
- [ ] Al completar el Día 90: pantalla de celebración → activación automática del Ciclo 2 (no hay graduación, hay inicio del siguiente trimestre)
- [ ] Título de la pantalla: "Ciclo 1 completado → ¿Listo para las Rocas del Q2?"

### ✅ Criterio de éxito del Sprint 6
> El Arquitecto define las Rocas del trimestre, ve el Dashboard con Leading Indicators y semáforos reales, puede aparcar ideas con fecha de liberación automática, registra decisiones con el filtro del 70%, tiene un repositorio de procesos documentados, y ve el indicador financiero YoY.

---

## SPRINT 7 — Workbooks Dinámicos S1–S4
**Semanas:** 15–16 · **Horas estimadas:** 20h  
**Objetivo:** Las primeras 4 sesiones del programa se completan en la app y alimentan los módulos activos.

### Nueva tabla
```sql
workbook_responses (id, company_id, user_id, session_number,
  exercise_key varchar(50), response jsonb, completed_at)

workbook_progress (id, company_id, user_id, session_number,
  pct_complete smallint, weekly_commitment text,
  commitment_done boolean, unlocked_at)
```

### Tareas

**Engine de workbooks (4h)**
- [ ] Componente genérico `<WorkbookExercise>` que recibe tipo (texto, slider, tabla, checklist, reflexión) y guarda en `workbook_responses`
- [ ] **Sistema de desbloqueo híbrido [L3]:** mínimo 7 días calendario por sesión (no se puede avanzar antes aunque se complete todo). Si el usuario llega al 100% de completitud ANTES de los 7 días → aparece botón **"Solicitar avance anticipado"** que desbloquea automáticamente sin aprobación del coach.
- [ ] Barra de progreso por sesión
- [ ] Contador de días: "Día X/7 de esta sesión"
- [ ] Cierre de sesión: "Mi compromiso de esta semana:" → guarda en `workbook_progress`

**Sesión 1 — Diagnóstico (4h)**
- [ ] **Diagnóstico Organizacional TBM** (8 áreas 1–5) → actualiza semáforos del Dashboard _(⚠️ [I4] NO llamar "Team Performance Scorecard" en ninguna parte de la UI)_
- [ ] Dashboard de Productividad → crea los 3 KPI slots del Dashboard
- [ ] Protocolo de Delegación → aparece como checklist en el módulo Delegación
- [ ] Los 5 Grandes → se convierten en tarea del Pre-game diario
- [ ] Plan 14 días → checklist interactivo en el módulo Workbooks

**Sesión 2 — El Equipo (4h)**
- [ ] Las 3 Preguntas de la Muerte → guarda diagnóstico inicial del Arquitecto (visible solo para él)
- [ ] Mapeo DISC del equipo → pre-carga los perfiles en M3 (Mi Equipo)
- [ ] Auditoría del Quién → anota quién está en asiento equivocado con nota
- [ ] Cruces Peligrosos → ejecuta el detector de M3 con los perfiles ingresados

**Sesión 3 — Diseño de Equipo (4h)**
- [ ] Escáner de Sombras → actualiza estado Luz/Sombra de cada colaborador en M3
- [ ] Auditoría A.R.Q.U.I. → score de 5 pilares visible en M3
- [ ] Reunión de 30 min TBM → plantilla de agenda con timer integrado

**Sesión 4 — Neurobiología (4h)**
- [ ] Auditoría de Energía → actualiza el selector de energía diaria del Dashboard
- [ ] Mi Marcha de 20 Millas → pre-carga el campo del Pre-game
- [ ] Protocolo de Blindaje → genera el checklist diario del Pre-game
- [ ] Modelo S.E.C. → abre el módulo Feedback con el template pre-cargado

### ✅ Criterio de éxito del Sprint 7
> Completar S1 activa los semáforos del Dashboard. Completar S2 pre-carga los perfiles DISC del equipo. Cada sesión alimenta los módulos activos — las respuestas no son documentos muertos.

---

## SPRINT 8 — Workbooks Dinámicos S5–S8
**Semanas:** 17–18 · **Horas estimadas:** 18h  
**Objetivo:** Programa completo digitalizado. Las 8 sesiones forman un sistema integrado.

### Tareas

**Sesión 5 — Multiplicación (4h)**
- [ ] Detector de Pecados (Rescatista / Marcapasos / Respuesta-Rápida) → alerta en módulo Delegación
- [ ] Fichas de Póker → herramienta de reunión: contador de intervenciones en el Warm Up
- [ ] Definition of Done → pre-carga el campo QUÉ del Pase de Estafeta
- [ ] Auditoría de Interrupciones (3 días) → mini-tracker con contador diario

**Sesión 6 — Delegación (4h)**
- [ ] Regla del 70% → activa el flag `delegable` en la Lista de Transferencia Inmediata
- [ ] Niveles LOS → actualiza los niveles en M3 con los datos ingresados
- [ ] Pase de Estafeta → pre-explica el wizard de 5 pasos del módulo Delegación
- [ ] Escudo Anti-Boomerang → activa la lógica en el módulo Delegación

**Sesión 7 — BOS (4h)**
- [ ] 5 Leading Indicators → pre-carga los KPIs del BOS Dashboard
- [ ] Número único por rol → vincula KPI de cada colaborador en M3
- [ ] Matriz de Autoridad → pre-carga los valores en M3
- [ ] Reunión de Silencio → activa el overlay de 5s en el Dashboard

**Sesión 8 — Plan 90D (4h)**
- [ ] Auditoría de Enfoque (Rocas vs Arena) → abre el clasificador 2×2 del Plan 90D
- [ ] Rocas Trimestrales → pre-carga el formulario del Plan 90D
- [ ] Parqueadero de Ideas → activa el módulo de Ideas con fecha Día 91
- [ ] Disagree & Commit → activa el registro en el módulo Plan 90D

**Vista de progreso global (2h)**
- [ ] Pantalla "Mi Programa": 8 sesiones con % completado cada una
- [ ] Línea de tiempo de implementación (cuándo se completó cada sesión)
- [ ] Comparativa: "Diagnóstico inicial vs. hoy" (Scorecard Día 1 vs. Día actual)

### ✅ Criterio de éxito del Sprint 8
> Las 8 sesiones están completas, cada una alimenta sus módulos correspondientes, y el usuario puede ver su progreso de transformación desde el Día 1.

---

## SPRINT 9 — Polish, Notificaciones & Exportación
**Semanas:** 19–20 · **Horas estimadas:** 20h  
**Objetivo:** App lista para beta cerrada. Profesional, pulida, exportable.

### Tareas

**Notificaciones (6h)**
- [ ] Email transaccional vía Resend:
  - Recordatorio diario de Pre-game (hora configurable)
  - Alerta de Warm Up si no se hizo antes de las 9am
  - Alerta 72h en tareas sin movimiento
  - Resumen semanal del equipo (domingos)
  - Notificación al dueño de Roca (lunes)
- [ ] In-app notifications: badge en sidebar + panel de notificaciones

**Exportación PDF (5h)**
- [ ] Exportar diagnóstico actual (8 áreas del Scorecard con histórico)
- [ ] Exportar Plan 90D con Rocas y progreso
- [ ] Exportar perfil del equipo (DISC + niveles LOS)
- [ ] Exportar resumen de semana (rituales + tareas + feedback)
- [ ] Usar `@react-pdf/renderer` o `puppeteer` para generación

**Históricos y tendencias (4h)**
- [ ] Gráfica de evolución del Scorecard (línea por semana)
- [ ] Gráfica de rituales completados (últimas 8 semanas, estilo GitHub contributions)
- [ ] Gráfica de KPIs vs. meta (últimas 4 semanas)
- [ ] "¿Cuánto avanzaste?" — comparativa día 1 vs. hoy en formato visual

**Panel Super Coach — Vista de Dilio (8h)** _(nuevo — [N1] [N2])_
> Solo accesible para usuarios con rol `coach`. Solo ve alumnos con `access_type = 'mentored'`. Los usuarios independientes son invisibles para el coach.
```sql
coaching_notes (id, coach_id, student_company_id, 
  linked_metric varchar(100),  -- ej: 'kpi:ventas_semana_22' o 'ritual:warmup'
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz)
```
- [ ] **Capa 1 — Vista general de alumnos:**
  - Tabla: nombre, sesión actual, último acceso, estado de salud (🟢/🟡/🔴)
  - Estado calculado: verde = rituales OK + KPIs OK, amarillo = alguno flojo, rojo = sin actividad > 3 días o KPIs todos rojos
  - Filtro rápido: "Solo mostrar rojos" (el botón más importante de esta vista)
  - En 30 segundos Dilio sabe a quién llamar hoy
- [ ] **Capa 2 — Deep dive por alumno:**
  - Rocas del trimestre con % de cumplimiento
  - Dashboard de 5 KPIs con semáforos de la última semana
  - Consistencia en rituales: % de días completados en las últimas 4 semanas
  - Indicador financiero YoY del alumno
  - Tamaño del equipo + nivel LOS de cada colaborador
- [ ] **Capa 3 — Canal de nota de coaching:**
  - Input de texto libre + selector de métrica vinculada (KPI específico, ritual, Roca)
  - La nota aparece en la app del alumno como un mensaje destacado del coach
  - El alumno puede marcarla como leída
  - El coach ve cuándo fue leída
- [ ] ⚠️ Sin ranking entre alumnos. El valor está en saber quién necesita intervención, no quién va adelante.

**Polish general (5h)**
- [ ] Loading states en todos los formularios
- [ ] Empty states con instrucción clara (cuando no hay datos aún)
- [ ] Error handling: mensajes de error humanizados
- [ ] Responsive check en mobile (War Up debe ser 100% usable en celular)
- [ ] Performance: lazy loading de módulos pesados
- [ ] Accesibilidad básica (contraste, navegación por teclado)

### ✅ Criterio de éxito del Sprint 9
> La app se ve y se siente profesional. Todos los flujos tienen loading/empty/error states. Se puede exportar un reporte PDF del diagnóstico. Las notificaciones llegan a tiempo. Dilio puede entrar al Panel Super Coach y saber en < 30 segundos a qué alumno llamar hoy.

---

## SPRINT 10 — Beta Cerrada
**Semanas:** 21–22 · **Horas estimadas:** Variable (depende del feedback)  
**Objetivo:** Validar el método con 3–5 empresas piloto reales. Obtener feedback para iterar.

### Tareas

**Modelo comercial — Definir e integrar [N4]**
> Suscripción anual en DOS versiones:
> - **Bundle con mentoría TBM:** precio con descuento — la app está incluida como parte del programa de Dilio. Estos usuarios tienen `access_type = 'mentored'`.
> - **Sistema Standalone:** precio sin descuento — el usuario compra el BOS sin acceso a la mentoría. Tienen `access_type = 'independent'`.
> La mentoría actúa como canal de adquisición con precio preferencial. El standalone es el producto de escala masiva.
- [ ] Definir con Dilio los precios de cada tier antes de lanzar la beta
- [ ] Evaluar integración con Stripe para manejo de suscripciones (puede ir en v1.1)

**Lanzamiento beta (3h)**
- [ ] Seleccionar 3–5 alumnos activos del programa TBM de Dilio (con `access_type = 'mentored'`)
- [ ] Sesión de onboarding guiada (30 min por empresa)
- [ ] Grupo de WhatsApp/Slack de beta testers
- [ ] Formulario de feedback semanal

**Monitoreo (ongoing)**
- [ ] Analytics: Mixpanel o Posthog — trackear qué módulos se usan más
- [ ] Session recordings: ver cómo navegan (Hotjar o similar)
- [ ] Errores en producción: Sentry

**Iteración**
- [ ] Bug fixes prioritarios (semana 1 de la beta)
- [ ] Quick wins basados en feedback (semana 2)
- [ ] Backlog de features para v1.1

### ✅ Criterio de éxito del Sprint 10
> 3 empresas piloto usan la app durante 2 semanas consecutivas. Se identifican los 3 módulos más valiosos y los 3 puntos de fricción más altos.

---

## SPRINT 11 — Tour Guiado de Onboarding *(Añadido 2026-06-07)*
**Semanas:** 23–24 · **Horas estimadas:** ~14h  
**Objetivo:** El sistema crece en módulos y complejidad. Un usuario que entra por primera vez necesita entender dónde está cada cosa y para qué sirve — sin necesidad de documentación externa. El tour guiado resuelve esto con una experiencia interactiva en tiempo real: la pantalla focaliza las secciones más importantes paso a paso, y el usuario avanza haciendo click en "Siguiente".

### Concepto de UX

El tour funciona como los recorridos de productos tipo Notion, Loom o Linear:
- El fondo se oscurece levemente
- Un elemento de la pantalla queda "iluminado" (spotlight)
- Un popover aparece junto al elemento explicando qué es y para qué sirve
- El usuario avanza con **"Siguiente →"**, puede **Omitir** en cualquier paso, y al final ve una pantalla de bienvenida final
- El tour se puede **repetir desde configuración de perfil** ("Ver tour de nuevo")

---

### Librería recomendada: `driver.js` v2

**Por qué driver.js y no react-joyride:**

| Criterio | driver.js | react-joyride |
|---|---|---|
| Peso | ~12 KB gzip | ~28 KB gzip |
| Dependencias | Vanilla JS (cero) | React + Popper.js |
| Compatibilidad Next.js | Excelente (solo client-side) | Buena, pero más verbosa |
| Popover personalizable | Sí, CSS variables | Sí, props React |
| Highlight / Overlay | Nativo | Nativo |
| Mantenimiento | Activo (2024–2025) | Activo |

**Instalación:**
```bash
npm install driver.js
```

---

### Base de datos — cambio de schema

```sql
-- Agregar campo a profiles existente
alter table profiles
  add column if not exists tour_completed boolean default false;
```

> El campo vive en `profiles` porque el tour es por usuario, no por empresa. Un colaborador y un arquitecto ven pasos distintos — el tour se adapta al rol.

---

### Pasos del tour (ordenados)

| # | Elemento objetivo | Título | Descripción | Visible para |
|---|---|---|---|---|
| 1 | Sidebar completo | "Tu panel de control" | "Todo el sistema TBM vive en esta barra. Cada sección es un módulo que se va desbloqueando." | Todos |
| 2 | Dashboard — semáforos | "El diagnóstico de tu negocio" | "Estos 8 semáforos muestran la salud de cada área clave. Verde = bien, rojo = atención urgente." | Todos |
| 3 | Sección Rituales | "El motor de tu día" | "Pre-game, War Up y Cool Down son los rituales que sincronizan al equipo. Hacerlos diario es la diferencia." | Todos |
| 4 | Sección Mi Equipo | "El mapa de tu gente" | "Aquí vivé el DISC y el nivel LOS de cada colaborador. Conocer a tu equipo es delegar mejor." | Arquitecto |
| 5 | Sección Delegación | "El Pase de Estafeta" | "Cada tarea delegada tiene 5 puntos obligatorios. Sin los 5 puntos, el error es del líder." | Arquitecto |
| 6 | Botón "Nueva tarea" | "Delegá con claridad" | "Usá el wizard para crear tu primera tarea. Los 5 campos son la diferencia entre delegar y rezar." | Arquitecto |
| 5 | Sección Delegación → Mis tareas | "Tus tareas asignadas" | "Aquí ves todo lo que te delegaron, con los 5 puntos explicados. Sin excusas para no saber qué hacer." | Colaborador |
| 6 | Botón "Estoy bloqueado" | "El Escudo Anti-Boomerang" | "Antes de escalar un problema, el sistema te pide 3 opciones. Así el líder recibe soluciones, no problemas." | Colaborador |
| 7 | Ícono de perfil / avatar | "Tu perfil y configuración" | "Desde aquí podés actualizar tu DISC, tu nivel LOS, y reiniciar este tour cuando quieras." | Todos |
| Final | Pantalla full (overlay) | "¡Ya conocés el sistema!" | "Ahora es tiempo de actuar. El primer paso es completar el diagnóstico de las 8 áreas." | Todos |

> Los pasos 4–6 cambian según el rol (`profile.role === "arquitecto"`). El tour lee el rol desde contexto y muestra el flujo correspondiente.

---

### Archivos a crear/modificar

**Nuevos:**
- `src/lib/tour-steps.ts` — definición de pasos por rol (arrays `ARQUITECTO_STEPS` y `COLABORADOR_STEPS`)
- `src/components/layout/tour-provider.tsx` — wrapper client-side que inicializa driver.js
- `src/hooks/use-tour.ts` — hook: lee `tourCompleted`, expone `startTour()` y `completeTour()`

**Modificar:**
- `src/app/(dashboard)/layout.tsx` — pasar `tourCompleted` y `userRole` como props al `TourProvider`
- `src/components/layout/sidebar.tsx` — agregar atributos `data-tour="..."` en los items del menú
- `src/components/layout/profile-dropdown.tsx` (o equivalente) — agregar opción "Ver tour de nuevo" que llama `startTour()`
- `src/app/(dashboard)/delegacion/page.tsx` — agregar `data-tour="delegacion-nueva-tarea"` al botón "Nueva tarea"

**Migración SQL:**
- `supabase/migration_s11_tour.sql` — `alter table profiles add column tour_completed boolean default false`

---

### Lógica principal

**Trigger del tour:**
```ts
// tour-provider.tsx — se ejecuta en el layout del dashboard
useEffect(() => {
  if (tourCompleted) return;           // ya lo vio
  if (!document) return;               // SSR guard

  const driver = new Driver({ ... })
  driver.setSteps(roleSteps)           // pasos según rol
  driver.drive()                       // inicia desde paso 0
}, [tourCompleted])
```

**Completar el tour (skip o finish):**
```ts
const completeTour = async () => {
  const supabase = createClient()
  await supabase.from("profiles").update({ tour_completed: true }).eq("id", userId)
  setCompleted(true)  // evita re-trigger en el mismo session
}

// Se pasa como onDestroyed y onDeselected a driver.js
```

**Reiniciar tour desde perfil:**
```ts
// profile-dropdown.tsx
const { startTour } = useTour()

<button onClick={() => {
  supabase.from("profiles").update({ tour_completed: false }).eq("id", userId)
  startTour()
}}>Ver tour de nuevo</button>
```

---

### Identificadores DOM (atributos `data-tour`)

Los elementos del DOM necesitan IDs únicos que el tour pueda encontrar:

```html
<!-- sidebar.tsx -->
<a data-tour="nav-dashboard" href="/dashboard">Dashboard</a>
<a data-tour="nav-rituales" href="/rituales">Rituales</a>
<a data-tour="nav-equipo" href="/equipo">Mi Equipo</a>
<a data-tour="nav-delegacion" href="/delegacion">Delegación</a>

<!-- delegacion/page.tsx -->
<Link data-tour="btn-nueva-tarea" href="/delegacion/nueva">Nueva tarea</Link>

<!-- mis-tareas-client.tsx -->
<Link data-tour="btn-bloqueado" href="/delegacion/bloqueado/...">Estoy bloqueado</Link>

<!-- layout — perfil -->
<div data-tour="user-avatar">...</div>
```

---

### Diseño visual del popover

Usar CSS variables de driver.js para que el popover siga el design system de la app:

```css
/* globals.css o tour-provider.tsx con <style> tag */
.driver-popover {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  font-family: Inter, system-ui, sans-serif;
  color: rgba(255,255,255,0.85);
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}
.driver-popover-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.driver-popover-description {
  font-size: 13.5px;
  line-height: 1.6;
  color: rgba(255,255,255,0.6);
}
.driver-popover-next-btn {
  background: linear-gradient(135deg, #5b8aff, #2c5fe6);
  border: none;
  border-radius: 10px;
  font-weight: 600;
}
.driver-overlay { background: rgba(0,0,0,0.7); }
```

---

### ✅ Criterio de éxito del Sprint 11
> Un usuario nuevo (Arquitecto o Colaborador) que ingresa por primera vez ve el tour automáticamente. Puede omitirlo con un click. Al completarlo, no vuelve a aparecer en logins siguientes. Puede reiniciarlo desde su perfil. Cada paso del tour apunta al elemento correcto en pantalla con un texto que explica el valor del módulo en 2 líneas.

---

## SPRINT 12 — Dashboard 100% Funcional *(Añadido 2026-06-07)*
**Semanas:** 25–26 · **Horas estimadas:** ~14h  
**Prioridad:** Alta — implementar antes de S5. El Dashboard es la pantalla que el usuario ve cada día; mostrar datos hardcodeados destruye la confianza en el sistema.

### Problema a resolver

El módulo Dashboard (S1) se construyó con datos reales en Diagnóstico y KPIs, pero tiene tres zonas hardcodeadas que hacen que la pantalla principal se vea "de demo":

| Sección | Problema actual |
|---------|----------------|
| **Hero Strip** (4 tiles de arriba) | 100% hardcodeado: "73 días", "Sprint 2", "2.3×", "8/12" — valores inventados |
| **Rituales de hoy** (3 cards abajo) | Array estático con estados fijos: Pre-game siempre "Completado", War Up siempre "En vivo" |
| **Tendencia del Diagnóstico** (barras por área) | Las 5 barras repiten el mismo valor — no hay historial real |
| **Re-evaluación del Diagnóstico** | El botón "Actualizar" lleva al onboarding completo — no existe una página dedicada |

### Tablas disponibles (sin migraciones nuevas)

Todos los datos necesarios ya existen en la BD:

| Tabla | Datos relevantes |
|-------|-----------------|
| `scorecards` | `score_*` × 8 áreas, `is_baseline`, `created_at`, `company_id` |
| `pre_games` | `log_date`, `user_id`, `big_win_1/2/3` |
| `war_ups` | `war_up_date`, `company_id`, `started_at`, `status` |
| `cool_downs` | `log_date`, `user_id`, `victory_log` |
| `energy_logs` | `log_date`, `user_id`, `company_id` |
| `profiles` | `company_id` (para contar equipo total) |
| `ritual_configs` | `war_up_deadline`, `cool_down_start` (horarios) |

---

### Entregable 1 — Página de re-evaluación del Diagnóstico (~3h)

**Archivos a crear:**
- `src/app/(dashboard)/diagnostico/page.tsx` — server, guard arquitecto, pre-carga último scorecard
- `src/components/diagnostico/diagnostico-form.tsx` — client, 8 selectores 1–5, insert + redirect

**UI del formulario:**
- 8 filas: ícono + nombre del área + selector de 5 botones (1=Crítico … 5=Excelente)
- Pre-rellena con los valores del último scorecard para que el usuario solo ajuste lo que cambió
- Botón "Guardar evaluación" → `supabase.from("scorecards").insert({ ..., is_baseline: false })`
- Al guardar: redirect a `/dashboard`

**Cambio en el Dashboard:**
- `href="/onboarding"` en el botón "Actualizar" → `href="/diagnostico"`

---

### Entregable 2 — Tendencia histórica real (~1.5h)

**Archivo a modificar:** `src/app/(dashboard)/dashboard/page.tsx`

**Query a agregar:**
```ts
const { data: scorecardHistory } = await supabase
  .from("scorecards")
  .select("*")
  .eq("company_id", profile.company_id!)
  .order("created_at", { ascending: true })
  .limit(5)
```

**Función de trend:**
```ts
function buildTrend(history: Scorecard[], key: ScorecardKey): number[] {
  const values = history
    .map(s => s[key])
    .filter((v): v is number => v !== null)
  const padded = Array(5).fill(0)
  values.slice(-5).forEach((v, i) => {
    padded[i + (5 - Math.min(values.length, 5))] = v
  })
  return padded
}
```

**Reemplazar en el render (línea 1166 actual):**
```tsx
// Antes:
const trend = score !== null ? [score, score, score, score, score] : [0,0,0,0,0]
// Después:
const trend = buildTrend(scorecardHistory ?? [], area.key)
```

Con una sola evaluación las barras son iguales. Con 3+ evaluaciones se ve la curva real de evolución.

---

### Entregable 3 — Rituales de hoy con estado real (~4h)

**Archivo a modificar:** `src/app/(dashboard)/dashboard/page.tsx`

**Queries a agregar:**
```ts
const { data: preGameHoy } = await supabase
  .from("pre_games")
  .select("big_win_1")
  .eq("user_id", user.id)
  .eq("log_date", todayStr)
  .maybeSingle()

const { data: warUpHoy } = await supabase
  .from("war_ups")
  .select("started_at, status")
  .eq("company_id", profile.company_id!)
  .eq("war_up_date", todayStr)
  .maybeSingle()

const { data: coolDownHoy } = await supabase
  .from("cool_downs")
  .select("victory_log")
  .eq("user_id", user.id)
  .eq("log_date", todayStr)
  .maybeSingle()
```

**Lógica de status:**
```ts
const preGameStatus: RitualStatus =
  preGameHoy?.big_win_1 ? "done" : "upcoming"

const warUpStatus: RitualStatus =
  warUpHoy?.status === "closed" ? "done" :
  warUpHoy?.status === "active" ? "live" : "upcoming"

const coolDownStatus: RitualStatus =
  coolDownHoy?.victory_log ? "done" : "upcoming"
```

**Reemplazar el array estático `RITUALS`** por uno construido con estas variables, donde cada objeto tiene el `status` calculado arriba en lugar del hardcodeado.

**Corregir el subtítulo hardcodeado** `"1 completado · 1 en vivo · 1 programado"`:
```ts
const completados = [preGameStatus, warUpStatus, coolDownStatus]
  .filter(s => s === "done").length
// → `"${completados} completado · ${enVivo} en vivo · ${programados} programado"`
```

---

### Entregable 4 — Hero Strip con datos reales (~4h)

**Archivo a modificar:** `src/app/(dashboard)/dashboard/page.tsx` + función `HeroStrip`

Los 4 tiles se redefinen con fuentes reales:

#### Tile 1 — "Ciclo 90D" (mantiene posición y diseño)

Fuente: fecha del scorecard con `is_baseline = true`

```ts
const baseline = scorecardHistory?.find(s => s.is_baseline)
const startDate = baseline ? new Date(baseline.created_at!) : null
const dayInProgram = startDate
  ? Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1
  : null
const dayInCycle = dayInProgram ? ((dayInProgram - 1) % 90) + 1 : null
const pctCycle = dayInCycle ? Math.round((dayInCycle / 90) * 100) : 0
```

- Valor: `"Día ${dayInCycle}/90"` (o "Sin iniciar" si no hay baseline)
- Barra de progreso: `pctCycle`% real
- Sub: `"${90 - (dayInCycle ?? 0)} días restantes en este ciclo"`

#### Tile 2 — "Racha de Pre-game" (reemplaza "Sprint actual")

Fuente: tabla `pre_games` — días consecutivos con registro completado

```ts
const { data: recentPreGames } = await supabase
  .from("pre_games")
  .select("log_date")
  .eq("user_id", user.id)
  .gte("log_date", thirtyDaysAgo)   // string YYYY-MM-DD hace 30 días
  .order("log_date", { ascending: false })

// Contar días consecutivos desde hoy hacia atrás
const dateSet = new Set(recentPreGames?.map(p => p.log_date) ?? [])
let streak = 0
const checkDate = new Date(today)
while (dateSet.has(checkDate.toISOString().split("T")[0])) {
  streak++
  checkDate.setDate(checkDate.getDate() - 1)
}
```

- Valor: `"${streak} días"`
- Sub: `"racha actual de Pre-game"` (o "¡Empezá hoy!" si streak=0)
- Ícono: `Flame` en color naranja `#fb923c`

#### Tile 3 — "Diagnóstico" (reemplaza "Multiplicador")

Fuente: último y penúltimo scorecard para calcular promedio y delta

```ts
function avgScorecard(sc: Scorecard | null): number | null {
  if (!sc) return null
  const vals = SCORECARD_AREAS
    .map(a => sc[a.key])
    .filter((v): v is number => v !== null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

const latestAvg = avgScorecard(latestScorecard)
const prevScorecard = scorecardHistory?.at(-2) ?? null
const prevAvg = avgScorecard(prevScorecard)
const delta = latestAvg !== null && prevAvg !== null
  ? (latestAvg - prevAvg).toFixed(1)
  : null
```

- Valor: promedio actual (ej: `"3.4"`) con `/5`
- Sub con delta: `"+0.4 vs evaluación anterior"` en verde, o `"-0.2"` en rojo
- Si no hay scorecard previo: `"Primera evaluación"`
- Ícono: `TrendingUp`

#### Tile 4 — "Equipo hoy" (misma posición, datos reales)

Fuente: `profiles` (total) + `energy_logs` (quién registró energía hoy)

```ts
const { data: teamProfiles } = await supabase
  .from("profiles")
  .select("id, full_name, disc_letters")
  .eq("company_id", profile.company_id!)

const { data: energyLogs } = await supabase
  .from("energy_logs")
  .select("user_id")
  .eq("company_id", profile.company_id!)
  .eq("log_date", todayStr)

const teamTotal = teamProfiles?.length ?? 0
const teamActiveToday = energyLogs?.length ?? 0
```

- Valor: `"${teamActiveToday} / ${teamTotal}"`
- Sub: `"registraron energía hoy"`
- Avatares: reales, generados desde `teamProfiles` con iniciales + color DISC

---

### ✅ Criterio de éxito del Sprint 12

> Abrir el Dashboard y ver **cero valores inventados**. Cada número en pantalla viene de la BD:
>
> 1. Las barras de tendencia del Diagnóstico suben cuando el arquitecto hace una nueva evaluación en `/diagnostico`
> 2. Los rituales cambian de estado a medida que se completan durante el día
> 3. El Hero Strip muestra: día real del ciclo 90D · racha real de Pre-game · promedio real del diagnóstico · equipo activo hoy
> 4. El botón "Actualizar" del Diagnóstico navega a `/diagnostico` (no al onboarding)

---

## SPRINT 13 — Hero Strip Interactivo *(Añadido 2026-06-07)*
**Semanas:** 27–28 · **Horas estimadas:** ~16h  
**Prerrequisito:** S12 completado (datos reales en BD antes de agregar interacción)  
**Objetivo:** Las 4 tiles del Hero Strip pasan de ser decoración visual a ser los accesos rápidos más poderosos del sistema. Cada tile muestra el dato más importante de su módulo, reacciona al hover con un resumen contextual, y al click navega directo a la acción relevante.

---

### Fundamento metodológico de cada tile

Antes de implementar, entender QUÉ representa cada tile en el método TBM:

| Tile | Concepto TBM | Por qué es el más importante |
|------|-------------|------------------------------|
| **Ciclo 90D** | Los ciclos de 90 días comprimen un año en un trimestre. Las Rocas son las únicas iniciativas que importan. | Sin saber en qué día del ciclo estás, todo lo urgente devora lo importante. |
| **Racha activa** | La consistencia en el Pre-game es el indicador de hábito más honesto del sistema. Un líder que no hace Pre-game no está ejecutando el método. | La racha mide disciplina, no intención. |
| **Multiplicador** | Mide qué % de la capacidad intelectual del equipo está siendo utilizada. Disminuidor = 48%, Multiplicador = 97%. | Cada punto de capacidad desperdiciada es dinero que el líder está tirando por la nómina. |
| **Equipo hoy** | El registro de energía diaria es el pulso operativo del equipo. Quién no registró es señal de fricción invisible. | Si el equipo no está en el sistema, el sistema no funciona. |

---

### Patrón de interacción (aplica a todas las tiles)

**Estado base:** Tile compacta con dato principal + subtítulo  
**Hover:** Ring de color del tile + tooltip con 2-3 items de detalle  
**Click:** Navegación directa al módulo correspondiente  
**Estado "sin datos":** CTA de configuración en lugar de número vacío  
**Cursor:** `pointer` en todas — dejan claro que son clickeables

```tsx
// HeroTile pasa de ser un <div> estático a un componente interactivo
<Link href={tile.href} className="group relative ...">
  {/* Contenido base siempre visible */}
  {/* Tooltip que aparece en group-hover */}
</Link>
```

---

### Tile 1 — CICLO 90D (rediseño completo)

**Fuente de datos:** Fecha del scorecard con `is_baseline = true` (ya disponible desde S12)  
**Módulo destino:** `/plan-90d` (S6) · Si no existe: `/diagnostico`

**Compact (estado base):**
```
[Target icon]  CICLO 90D
Día 27/90
══════░░░░░░░░  30%
Ciclo 2 · 63 días restantes
```

**Tooltip en hover (grupo de items):**
```
📅 Inicio del ciclo: 15 mar 2026
🏔️ Rocas activas: 3 de 5
⚡ En riesgo: 1 roca al 12% a 30 días
```
> Las Rocas se muestran cuando exista el módulo Plan 90D (S6). Hasta entonces: solo la fecha de inicio y días restantes.

**Click:**
- Si Plan 90D existe: `→ /plan-90d`
- Si Plan 90D no existe: `→ /diagnostico` con mensaje "Completá tu diagnóstico para activar el ciclo"

**Estado "sin ciclo activo":**
```
[Target icon]  CICLO 90D
Sin iniciar
─────────────
"Completá el diagnóstico inicial →"
```

**Schema extra necesario (S6):**
```sql
-- Tabla a crear en S6, no en este sprint:
create table plan_90d_rocks (
  id uuid primary key,
  company_id uuid references companies(id),
  cycle_number int,
  title text not null,
  owner_id uuid references profiles(id),
  progress_pct int default 0,        -- 0-100, actualizado semanalmente
  success_criteria text,
  due_date date,
  status varchar(20) default 'active' -- active | completed | at_risk | cancelled
)
```
> Este sprint no crea esa tabla — la documenta para que S6 la implemente. En S13 la tile funciona con datos del ciclo pero sin Rocas.

---

### Tile 2 — RACHA ACTIVA (renombrar desde "Sprint actual")

**Fuente de datos:** `pre_games` — días consecutivos con registro completado (disponible desde S12)  
**Módulo destino:** `/rituales`

**Compact (estado base):**
```
[Flame icon]  RACHA ACTIVA
14 días
racha de Pre-game
```

**Tooltip en hover — historial visual de 7 días:**
```
Últimos 7 días:
● ● ● ○ ● ● ●   (dots verde/gris)
Lun Mar Mié Jue Vie Sáb Dom

Mejor racha: 21 días
```

**Click:**
- Si Pre-game de hoy no fue completado: `→ /rituales/pregame` (directo al formulario)
- Si Pre-game de hoy ya fue completado: `→ /rituales` (historial)

**Estados:**
```
Racha = 0  →  "¡Empezá hoy!" + link al pre-game
Racha = 1  →  "1 día · ¡Seguí así!"
Racha >= 7 →  "X días 🔥"
Racha >= 30 →  "X días 🏆"
```

**Datos para el tooltip:**
```ts
// En el server component — historial de los últimos 7 días
const { data: last7Days } = await supabase
  .from("pre_games")
  .select("log_date")
  .eq("user_id", user.id)
  .gte("log_date", sevenDaysAgo)

// Mejor racha histórica — query separada
const { data: allPreGames } = await supabase
  .from("pre_games")
  .select("log_date")
  .eq("user_id", user.id)
  .order("log_date", { ascending: false })
  .limit(90)  // 90 días alcanza para calcular racha máxima
```

---

### Tile 3 — MULTIPLICADOR (redefinir + dos fases)

**Concepto:** Qué % de la capacidad intelectual del equipo está siendo utilizada.  
- Disminuidor = 48% · Disminuidor Accidental = 65% · Multiplicador = 97%

**Fuente de datos — Fase A (este sprint, proxy):**
```ts
// Proxy usando 3 indicadores existentes en la BD:
// 1. score_delegacion del último scorecard (peso 40%)
// 2. Tasa de Anti-Boomerang: task_updates boomerang_attempt / total tasks (peso 40%)
// 3. Tareas completadas por colaboradores sin intervención del arquitecto (peso 20%)

const delegacionScore = (latestScorecard?.score_delegacion ?? 0) / 5  // 0-1
const totalTasks = tasks?.length ?? 0
const boomerangCount = taskUpdates?.filter(u => u.type === "boomerang_attempt").length ?? 0
const boomerangRate = totalTasks > 0 ? 1 - (boomerangCount / totalTasks) : 0.5

const multiplicadorPct = Math.round(
  (delegacionScore * 0.4 + boomerangRate * 0.4 + 0.5 * 0.2) * 100
)
```

**Fuente de datos — Fase B (cuando exista módulo Multiplicador):**
- Score real del diagnóstico de los 3 Pecados del Disminuidor (/36 puntos)
- Fórmula: `(36 - score) / 36 * 100 = % de capacidad utilizada`

**Compact (estado base):**
```
[Zap icon]  MULTIPLICADOR
73%
capacidad de equipo utilizada
```
Badge de clasificación:
- `>= 85%` → "Multiplicador" (verde)
- `65–84%` → "Disminuidor Accidental" (amarillo)
- `< 65%` → "Disminuidor Activo" (rojo)

**Tooltip en hover:**
```
Delegación efectiva:   ████░  4.0/5
Autonomía del equipo:  ███░░  2 de 5 tareas sin escalaciones
Boomerang rate:        ██░░░  3 escalaciones esta semana
```

**Click:**
- Si diagnóstico Multiplicador no existe: abre inline CTA `"Hacer diagnóstico (5 min) →"`
- Si diagnóstico existe: `→ /equipo#multiplicador`

**Datos necesarios (S13 agrega estas queries al dashboard server):**
```ts
// Tasa de Anti-Boomerang
const { data: taskUpdatesBoomerang } = await supabase
  .from("task_updates")
  .select("type")
  .eq("type", "boomerang_attempt")
  .in("task_id", companyTaskIds)

// Tareas completadas en los últimos 30 días
const { data: recentTasks } = await supabase
  .from("tasks")
  .select("status, assigned_to, created_by")
  .eq("company_id", profile.company_id!)
  .gte("updated_at", thirtyDaysAgo)
```

---

### Tile 4 — EQUIPO HOY (ampliar con panel)

**Fuente de datos:** `energy_logs` + `profiles` (disponible desde S12)  
**Módulo destino:** `/equipo`

**Compact (estado base):**
```
[Users icon]  EQUIPO HOY
9 / 12
registraron energía hoy
[A] [L] [M] [C] [P] +4
```
Los avatares son reales: iniciales + color DISC del perfil.

**Tooltip en hover — panel de miembros:**
```
Ana García      ●●●●○  Energía 4
Luis Martínez   ●●●○○  Energía 3
María López     ●●●●●  Energía 5
Carlos Ruiz     ○○○○○  Sin registrar  ⚠
────────────────────────────────
4 sin registrar hoy
```
Los que no registraron aparecen con ⚠ para que el líder note quién puede tener fricción invisible.

**Click:** `→ /equipo` (módulo de equipo)

**Datos para el tooltip:**
```ts
// En el server component — cruzar team con energy_logs de hoy
const teamWithEnergy = teamProfiles?.map(member => ({
  ...member,
  energyToday: energyLogs?.find(e => e.user_id === member.id)?.level ?? null
}))
// null = no registró, número = su nivel de energía
```

---

### Archivos a crear/modificar

**Modificar:**
- `src/app/(dashboard)/dashboard/page.tsx` — agregar queries para tooltip data + pasar a HeroStrip
- `src/components/dashboard/HeroStrip` (extraer de page.tsx a su propio archivo) — agregar interactividad

**Crear:**
- `src/components/dashboard/hero-strip.tsx` — componente cliente con hover/click/tooltip
- `src/components/dashboard/tile-tooltip.tsx` — componente tooltip reutilizable (glass morphism)

**Estructura del componente:**

```tsx
// hero-strip.tsx — "use client"
// Recibe todos los datos pre-calculados del server component

interface HeroStripProps {
  // Tile 1 — Ciclo 90D
  dayInCycle: number | null
  cycleNumber: number
  pctCycle: number
  cycleStartDate: string | null
  // Tile 2 — Racha
  streak: number
  bestStreak: number
  last7Days: boolean[]      // true=hecho, false=falló
  preGameDoneToday: boolean
  // Tile 3 — Multiplicador
  multiplicadorPct: number
  multiplicadorLabel: "Multiplicador" | "Disminuidor Accidental" | "Disminuidor Activo"
  delegacionScore: number
  boomerangRate: number
  // Tile 4 — Equipo hoy
  teamWithEnergy: { id: string; full_name: string; disc_letters: string; energyToday: number | null }[]
}
```

---

### Diseño visual del tooltip

El tooltip sigue el design system glassmorphism de la app:

```tsx
// tile-tooltip.tsx
<div
  style={{
    position: "absolute",
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 50,
    minWidth: 220,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
    pointerEvents: "none",   // el tooltip no bloquea el click
  }}
>
  {children}
</div>
```

El tooltip aparece en `onMouseEnter` y desaparece en `onMouseLeave` via `useState<string | null>(null)` en el componente padre:
```tsx
const [hoveredTile, setHoveredTile] = useState<"ciclo" | "racha" | "multiplicador" | "equipo" | null>(null)
```

---

### ✅ Criterio de éxito del Sprint 13

> 1. **Hover** en cualquier tile muestra un tooltip con contexto adicional — el líder puede escanear el estado del negocio sin abrir ningún módulo
> 2. **Click** en cualquier tile lleva directamente al módulo correspondiente (o a su CTA de configuración si no existe)
> 3. **Tile Multiplicador** muestra un % calculado con datos reales (proxy fase A) y el badge de clasificación correcto
> 4. **Tile Racha** muestra el historial visual de 7 días en el tooltip
> 5. **Tile Equipo hoy** muestra en el tooltip quién registró energía y quién no, con alerta para los ausentes
> 6. **Tile Ciclo 90D** calcula el día real del ciclo basado en el baseline del diagnóstico, no un número inventado
> 7. Todos los tiles tienen `cursor: pointer` y responden visualmente al hover

---

## SPRINT 14 — Búsqueda, Notificaciones & Energía *(Añadido 2026-06-07)*
**Semanas:** 29–30 · **Horas estimadas:** ~16h  
**Objetivo:** Completar los 3 elementos del header del Dashboard que actualmente son decorativos o incompletos: el selector de energía (fix menor), la barra de búsqueda ⌘K (navegación rápida por el sistema), y la campana de notificaciones (sistema completo con eventos reales, panel y badge preciso).

---

### Entregable 1 — Fix selector de energía (~1h)

**Problema:** Usa `createBrowserClient` (versión deprecada) y no maneja errores en el upsert.

**Archivo:** `src/components/dashboard/EnergySelector.tsx`

**Cambios:**
```ts
// Antes:
import { createBrowserClient } from "@/lib/supabase/client"
const supabase = createBrowserClient()

// Después:
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
```

```ts
// Agregar manejo de error al upsert:
const { error } = await supabase.from("energy_logs").upsert(...)
if (error) {
  setSelected(currentLevel)  // revertir selección optimista
  setError("No se pudo guardar. Intentá de nuevo.")
}
```

**También agregar:**
- `useState<string | null>(null)` para error
- Mensaje de error inline debajo del selector si falla
- El estado `loading` ya existe pero no se usa visualmente — agregar `opacity-50 pointer-events-none` al contenedor mientras guarda

---

### Entregable 2 — Búsqueda ⌘K (navegación rápida) (~5h)

**Versión a implementar:** Navegación rápida — el sistema tiene módulos fijos, no necesita full-text search. El ⌘K permite moverse entre secciones sin usar el sidebar.

**Archivos a crear:**
- `src/components/layout/command-palette.tsx` — modal de búsqueda (client component)
- `src/hooks/use-command-palette.ts` — hook para abrir/cerrar + keyboard shortcut

**Archivos a modificar:**
- `src/app/(dashboard)/layout.tsx` — montar `<CommandPalette>` a nivel de layout
- `src/app/(dashboard)/dashboard/page.tsx` — el `<div>` de búsqueda pasa a `<button>` con `onClick`

#### UX del command palette

```
┌──────────────────────────────────────────────┐
│  🔍  Buscar o ir a...            [Esc]        │
│──────────────────────────────────────────────│
│  MÓDULOS                                      │
│  🏠  Dashboard                               │
│  📋  Rituales                                │
│  👥  Mi Equipo                               │
│  📤  Delegación                   ↵          │  ← item activo
│  📊  Plan 90D                                │
│                                              │
│  ACCIONES RÁPIDAS                            │
│  ➕  Nueva tarea delegada                    │
│  📝  Completar Pre-game de hoy               │
│  📈  Actualizar diagnóstico                  │
│──────────────────────────────────────────────│
│  ↑↓ navegar · ↵ ir · Esc cerrar             │
└──────────────────────────────────────────────┘
```

**Comportamiento:**
- Se abre con `⌘K` (Mac) / `Ctrl+K` (Windows) y con click en el `<div>` de búsqueda
- Se cierra con `Esc` o click fuera
- Filtro en tiempo real mientras el usuario escribe (client-side, sin queries a BD)
- Navegación con `↑↓` y confirmación con `Enter`
- Overlay oscuro detrás del modal (mismo patrón que el status dropdown del Kanban)

**Items del palette (estáticos, sin BD):**

```ts
const MODULES = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠", keywords: ["inicio", "home"] },
  { label: "Rituales", href: "/rituales", icon: "📋", keywords: ["pregame", "warmup", "cooldown"] },
  { label: "Mi Equipo", href: "/equipo", icon: "👥", keywords: ["disc", "los", "equipo"] },
  { label: "Delegación", href: "/delegacion", icon: "📤", keywords: ["tareas", "pase", "estafeta"] },
  { label: "Diagnóstico", href: "/diagnostico", icon: "📊", keywords: ["scorecard", "areas"] },
]

const QUICK_ACTIONS = [
  { label: "Nueva tarea delegada", href: "/delegacion/nueva", icon: "➕", role: "arquitecto" },
  { label: "Completar Pre-game de hoy", href: "/rituales/pregame", icon: "📝" },
  { label: "Actualizar diagnóstico", href: "/diagnostico", icon: "📈" },
  { label: "Mis tareas asignadas", href: "/delegacion/mis-tareas", icon: "✅", role: "colaborador" },
]
```

Las acciones con `role` se muestran u ocultan según el rol del usuario (pasar `userRole` como prop al layout).

**Keyboard shortcut:**
```ts
// use-command-palette.ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setOpen(prev => !prev)
    }
    if (e.key === "Escape") setOpen(false)
  }
  document.addEventListener("keydown", handler)
  return () => document.removeEventListener("keydown", handler)
}, [])
```

**Diseño visual:** modal centrado, backdrop blur, mismo glassmorphism del sistema:
```tsx
<div style={{
  position: "fixed", inset: 0, zIndex: 100,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
}}>
  <div style={{
    position: "absolute", top: "20%", left: "50%",
    transform: "translateX(-50%)",
    width: "min(560px, 90vw)",
    background: "#0f1525",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
  }}>
    ...
  </div>
</div>
```

---

### Entregable 3 — Sistema de notificaciones (~10h)

#### 3a. Schema en BD (~1h)

**Migración SQL:**
```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type varchar(40) not null,
  title text not null,
  body text,
  href text,              -- link a donde navegar al hacer click
  read_at timestamptz,   -- null = no leída
  created_at timestamptz default now()
);

-- Índice para el badge: notificaciones no leídas por usuario
create index notifications_user_unread
  on notifications(user_id, read_at)
  where read_at is null;

alter table notifications enable row level security;
create policy "own_notifications" on notifications
  for all using (user_id = auth.uid());
```

**Tipos de notificación (`type`):**

| type | Quién la recibe | Cuándo se genera |
|------|----------------|-----------------|
| `task_blocked` | Arquitecto | Colaborador escala con Anti-Boomerang |
| `task_overdue` | Colaborador | Tarea sin movimiento en 72h (E7 Sprint 4) |
| `task_done` | Arquitecto (creador) | Colaborador marca tarea como completada |
| `task_assigned` | Colaborador | Arquitecto le asigna una nueva tarea |
| `war_up_started` | Todo el equipo | Arquitecto inicia el War Up del día |
| `scorecard_updated` | Arquitecto | Alguien del equipo actualiza el diagnóstico |

#### 3b. Generación de notificaciones (~4h)

Las notificaciones se insertan en el mismo server action o mutation donde ocurre el evento. No hay triggers de BD — se crea en la misma transacción del lado del cliente.

**Ejemplo — al escalar con Anti-Boomerang (`anti-boomerang-form.tsx`):**
```ts
// Después de insertar en task_updates y cambiar status a blocked:
const { data: taskCreator } = await supabase
  .from("tasks")
  .select("created_by, what_dod")
  .eq("id", task.id)
  .single()

await supabase.from("notifications").insert({
  company_id: task.company_id,
  user_id: taskCreator.created_by,        // notifica al arquitecto
  type: "task_blocked",
  title: "Tarea bloqueada",
  body: `${assigneeName} escaló "${task.what_dod.slice(0, 60)}…" con 3 opciones.`,
  href: `/delegacion`,
})
```

**Ejemplo — al crear una tarea nueva (`task-wizard.tsx`):**
```ts
await supabase.from("notifications").insert({
  company_id: profile.company_id,
  user_id: data.assigned_to,              // notifica al colaborador asignado
  type: "task_assigned",
  title: "Te asignaron una tarea",
  body: `"${data.what_dod.slice(0, 60)}…" — revisá los 5 puntos.`,
  href: `/delegacion/mis-tareas`,
})
```

**Ejemplo — al marcar completada (`mis-tareas-client.tsx`):**
```ts
// Después de update status="done":
const { data: taskData } = await supabase
  .from("tasks")
  .select("created_by, what_dod")
  .eq("id", taskId)
  .single()

await supabase.from("notifications").insert({
  company_id: ...,
  user_id: taskData.created_by,
  type: "task_done",
  title: "Tarea completada",
  body: `"${taskData.what_dod.slice(0, 60)}…" fue marcada como lista.`,
  href: `/delegacion`,
})
```

#### 3c. Badge en el header (~1h)

**En el layout server component** — contar no-leídas para que el badge sea preciso desde el primer render:

```ts
// src/app/(dashboard)/layout.tsx
const { count: unreadCount } = await supabase
  .from("notifications")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .is("read_at", null)
```

El badge deja de ser un punto rojo hardcodeado:
```tsx
{/* Antes: siempre encendido */}
<span style={{ background: "#f87171" }} />

{/* Después: solo si hay no-leídas */}
{(unreadCount ?? 0) > 0 && (
  <span style={{ background: "#f87171" }}>
    {unreadCount! > 9 ? "9+" : unreadCount}
  </span>
)}
```

#### 3d. Panel de notificaciones (~4h)

**Archivo a crear:** `src/components/layout/notifications-panel.tsx`

Al hacer click en la campana se abre un panel dropdown (no una página nueva):

```
┌──────────────────────────────────────────┐
│  Notificaciones              Marcar todo │
│──────────────────────────────────────────│
│  🔴  Tarea bloqueada           hace 5m  │
│      Luis escaló "Implementar módulo…"  │
│──────────────────────────────────────────│
│  🟡  Tarea asignada          hace 2h    │
│      "Revisar propuesta Q3" — 5 puntos  │
│──────────────────────────────────────────│
│  ✅  Tarea completada         ayer       │
│      "Onboarding nuevo cliente" — listo │
│──────────────────────────────────────────│
│              Ver todas →                 │
└──────────────────────────────────────────┘
```

**Comportamiento:**
- Al abrir el panel: marca todas como leídas (`update read_at = now()` para las no-leídas mostradas)
- Click en una notificación: navega al `href` y cierra el panel
- "Marcar todo": `update read_at = now() where user_id = x and read_at is null`
- "Ver todas →": navega a `/notificaciones` (página simple con historial completo)
- Se cierra al click fuera (mismo patrón overlay que el Kanban dropdown)
- Muestra las últimas 10 notificaciones ordenadas por `created_at DESC`

**Query al abrir el panel:**
```ts
const { data: notifications } = await supabase
  .from("notifications")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(10)
```

**Tiempo relativo** (`hace 5m`, `ayer`):
```ts
function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return "ayer"
  return `hace ${d} días`
}
```

**Ícono por tipo de notificación:**
```ts
const NOTIF_ICONS: Record<string, string> = {
  task_blocked:   "🚨",
  task_overdue:   "⏰",
  task_done:      "✅",
  task_assigned:  "📋",
  war_up_started: "☀️",
  scorecard_updated: "📊",
}
```

---

### Archivos resumen

**Crear:**
- `src/components/layout/command-palette.tsx`
- `src/components/layout/notifications-panel.tsx`
- `src/hooks/use-command-palette.ts`
- `supabase/migration_s14_notifications.sql`

**Modificar:**
- `src/components/dashboard/EnergySelector.tsx` — fix cliente + errores
- `src/app/(dashboard)/layout.tsx` — montar CommandPalette + pasar unreadCount
- `src/app/(dashboard)/dashboard/page.tsx` — barra de búsqueda pasa a `<button>` con onClick
- `src/components/delegacion/anti-boomerang-form.tsx` — agregar insert de notificación al escalar
- `src/components/delegacion/task-wizard.tsx` — agregar insert de notificación al asignar
- `src/components/delegacion/mis-tareas-client.tsx` — agregar insert de notificación al completar

---

### ✅ Criterio de éxito del Sprint 14

> 1. **Energía:** El selector guarda correctamente, muestra error visible si falla, y no usa cliente deprecado
> 2. **Búsqueda:** Presionar `⌘K` / `Ctrl+K` abre el palette; escribir filtra los módulos; `Enter` navega; `Esc` cierra
> 3. **Notificaciones — badge:** El punto rojo solo aparece cuando hay notificaciones reales no leídas. Si no hay ninguna, desaparece
> 4. **Notificaciones — panel:** Click en la campana abre el dropdown con las últimas 10 notificaciones con tiempo relativo e ícono por tipo
> 5. **Notificaciones — generación:** Crear una tarea notifica al colaborador asignado. Escalar con Anti-Boomerang notifica al arquitecto. Completar una tarea notifica al creador
> 6. **Notificaciones — read:** Al abrir el panel las notificaciones se marcan como leídas y el badge desaparece

---

## SPRINT 15 — Cierre de Migración Supabase *(Añadido 2026-06-14)*
**Objetivo:** Terminar el corte al proyecto Supabase nuevo `fozhnfxehbbgqaerprgf` (org TBM Org,
cuenta `sebastian.soporte.tbm@gmail.com`), creado tras perder el acceso al dashboard del proyecto
viejo `onzsxbghmyuqykiejpxw`. La base, el esquema (27 tablas), los datos (27 filas) y el flujo de
invitación ya quedaron migrados y verificados. Falta lo operativo de despliegue y robustez.
Contexto completo en `docs/RECOVERY_SUPABASE.md`.

### Tareas

**Despliegue (operativo)**
- [ ] **Vercel:** actualizar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  con los valores del proyecto nuevo (ya están en `.env.local`) en Production/Preview/Development,
  y hacer **Redeploy** del último deploy.
- [ ] **Local:** reiniciar `npm run dev` para que tome el nuevo `.env.local` (había un dev server
  viejo en `localhost:3000` con el env anterior cacheado).

**Robustez de email (recomendado para producción)**
- [ ] **(Sebas) Comprar un dominio propio** (~$10/año, ej. Namecheap / Cloudflare /
  Google Domains) para la app. Es prerrequisito de todo lo de abajo: sin dominio
  verificado, Resend solo entrega a la propia casilla de la cuenta Resend
  (remitente de prueba `onboarding@resend.dev`), así que **ningún email llega a
  colaboradores reales**. Estado actual (2026-06-14): sin dominio →
  `RESEND_FROM=onboarding@resend.dev` (modo prueba) en `.env.local`.
- [ ] **Verificar el dominio en Resend** (`resend.com → Domains → Add Domain` →
  pegar los registros DNS SPF/DKIM en el proveedor del dominio). Luego cambiar
  `RESEND_FROM` a `The Business Multiplier <noreply@TU_DOMINIO>` en `.env.local` y Vercel.
- [ ] Configurar **SMTP propio (Resend)** en Auth del proyecto nuevo
  (`Dashboard → Settings → Auth → SMTP Settings`). Las invitaciones usan `signInWithOtp`
  (email de Supabase Auth, no Resend); el email interno de proyectos nuevos es rate-limited.
  Sin SMTP propio las invitaciones pueden cortarse en producción. (Requiere el dominio
  verificado del paso anterior.)

**Pruebas pendientes**
- [ ] Prueba **end-to-end de colaborador** con un segundo email real: invitar desde la app
  (post-redeploy) → recibir magic link → `/accept-invite` → unirse al equipo como colaborador.
  (Ya verificado: creación de invitación por RLS, envío de OTP 200, redirect aceptado, email recibido.)

**Seguimiento (no bloqueante)**
- [ ] Ticket **SU-395249**: transferencia/baja del proyecto viejo `onzsxbghmyuqykiejpxw`
  (vive bajo otra cuenta de Supabase desconocida). Plantilla en `docs/RECOVERY_SUPABASE.md`.
- [ ] (Opcional) Cambiar la contraseña de la app y activar "leaked password protection" en Auth.

### Scripts de la migración (referencia, en `scripts/`)
- `backup-data.mjs` — backup por REST (soporta `service_role` para backup completo).
- `import-as-user.mjs` — import usado (REST autenticado como el usuario, respeta RLS).
- `import-data.mjs` / `backup-to-sql.mjs` — variantes (service_role / SQL).

### ✅ Criterio de éxito del Sprint 15
> Producción en Vercel corre contra `fozhnfxehbbgqaerprgf`, un colaborador real puede aceptar una
> invitación end-to-end con email confiable (SMTP propio), y el proyecto viejo queda encaminado a
> transferencia/baja vía soporte.

---

## SPRINT 16 — Sprint de Mejoras y Correcciones *(Añadido 2026-06-14)*
**Objetivo:** Iterar sobre la experiencia ya construida puliendo fricciones de UX y corrigiendo bugs detectados en uso real. Este sprint es acumulativo: cada mejora se documenta como una entrada con contexto, causa y solución.

### Mejora #1 — Tour de onboarding: fondo demasiado oscuro

**Síntoma reportado**
> El onboarding cumple su función, pero deja el fondo muy oscuro y se dificulta entender sobre qué sección está hablando.

**Causa raíz**
- El overlay de `driver.js` estaba configurado a `rgba(0,0,0,0.7)` vía CSS (`.driver-overlay`), oscureciendo casi todo el viewport.
- No existía un realce visual del elemento enfocado (spotlight), por lo que el ítem destacado se confundía con el resto del fondo oscuro.

**Solución**
- En `src/components/layout/tour-provider.tsx` se movió el control del overlay a la config de `driver.js`:
  - `overlayColor: "#0A0E17"` (tono del fondo de la app, no negro puro)
  - `overlayOpacity: 0.55` (antes 0.7 → fondo más legible)
  - `stagePadding: 8` y `stageRadius: 12` (recorte del spotlight más suave)
  - `disableActiveInteraction: true` (evita clicks accidentales sobre el elemento enfocado)
- En `src/app/globals.css` se reemplazó el override de `.driver-overlay` por un realce del elemento activo:
  - `.driver-active-element` ahora lleva un anillo de acento azul + glow (`box-shadow`), de modo que la sección de la que habla el popover queda claramente iluminada.

**Archivos tocados**
- `src/components/layout/tour-provider.tsx`
- `src/app/globals.css`

**Estado:** ✅ Implementado · ⏳ Pendiente verificación visual en navegador

---

### Mejora #2 — Textos secundarios con bajo contraste / poca legibilidad

**Síntoma reportado**
> Los textos "comunes" (descripciones, subtítulos, labels, placeholders y textos de apoyo) son difíciles de leer e interpretar. El contraste no los favorece.

**Observado en**
- Página **Mi Equipo** (`/equipo`) como caso testigo, pero es un patrón transversal a toda la app.
- Elementos afectados típicos (gris tenue sobre fondo oscuro):
  - Subtítulo de página: *"1 persona · perfil de comportamiento, nivel de autonomía y alineación de cada rol."*
  - Texto guía del estado vacío: *"Usá 'Invitar colaborador' para sumar jugadores al escuadrón."*
  - Descripción del Perfil DISC: *"Cómo se comporta naturalmente y cómo liderarlo. Generá el link del test o cargá las letras del informe."*
  - Labels y helpers de formulario: *"Letras DISC"*, placeholder *"ej. SC, DI"*, *"Se interpreta como"*, descripción del rol DISC.
  - Email del colaborador, label de rol en el avatar (*"Arquitecto"*), microcopys de estado (*"X/3 objetivos"*).

**Hipótesis de causa**
- Uso extendido de texto con baja opacidad (ej. `rgba(255,255,255,0.4–0.6)` / grises tenues) sobre fondos oscuros, por debajo del ratio de contraste recomendado (WCAG AA = 4.5:1 para texto normal).
- Falta de una escala de jerarquía tipográfica clara para texto secundario/terciario que mantenga legibilidad mínima.

**Alcance sugerido (a resolver en otra tarea)**
- Auditar los tokens/clases de color de texto secundario (probablemente en `globals.css` / `tailwind.config.ts` y componentes del módulo Equipo).
- Definir un nivel mínimo de contraste para texto de apoyo y aplicarlo de forma consistente en toda la app.

**Estado:** 📝 Documentado — pendiente de resolución (no implementado)

---

### Mejora #3 — Auditoría completa del módulo "Mi Equipo" (`/equipo`)

**Contexto**
> Revisión a fondo de los 21 componentes de `src/components/equipo/`, la página `src/app/(dashboard)/equipo/page.tsx` y sus `actions.ts`, para detectar bugs y fricciones de UX. Todos los ítems están **solo documentados** (no resueltos). Las referencias de línea son aproximadas a la fecha de la auditoría.

#### 🔴 Severidad ALTA

**3.1 — Pérdida de datos sin confirmación al re-hacer test / regenerar link** · ✅ RESUELTO (2026-06-14)
- `equipo-client.tsx` ~169–212 (`handleGenerateLink`), disparado desde `test-link-box.tsx` ~105–116 y ~173–181.
- Generar un link nuevo borra destructivamente el perfil DISC (`disc_letters/disc_name/disc_icon/disc_profile_key/disc_scores → null`) sin diálogo de confirmación y se aplica al instante en la UI. Un clic accidental destruye datos cargados.
- **Categoría:** bug funcional / riesgo de pérdida de datos.
- **Fix:** nuevo gate `requestGenerateLink()` + modal de confirmación (cancelable con Escape / click afuera) que solo se dispara si hay perfil DISC que perder (`disc_letters` o `disc_status==='completado'`). El primer "Generar link" procede directo.

**3.2 — "Regenerar link (invalida el anterior)" NO invalida el anterior** · ✅ RESUELTO (2026-06-14)
- `equipo-client.tsx` ~179–202; copy en `test-link-box.tsx` ~180.
- Solo hace `insert` de una fila nueva en `disc_assessments`; nunca invalida el token anterior. El `/disc/<token>` viejo sigue activo → dos tests válidos para la misma persona. El copy es engañoso y hay riesgo de consistencia/seguridad.
- **Categoría:** bug funcional / seguridad.
- **Fix:** antes de insertar el nuevo test, `handleGenerateLink` borra las filas no-completadas de esa persona (`delete ... eq(profile_id).neq(status,'completado')`). El token viejo deja de resolver (`get_disc_assessment → null →` página "Link inválido"), así nunca hay dos links de test válidos. Los tests completados se preservan como historial. Sin migración SQL. El copy ahora es veraz.

**3.3 — Layout de 2 columnas no responsive (grid por estilo inline)** · ✅ RESUELTO (2026-06-14)
- `equipo-client.tsx` ~298–301 (`gridTemplateColumns: "300px minmax(0,1fr)"`) + `px-10` en ~244.
- El grid inline no se puede sobreescribir con clases responsive de Tailwind; en viewports angostos no colapsa a una columna → overflow horizontal / squeeze. En mobile la experiencia se rompe.
- **Categoría:** responsive / consistencia visual.
- **Fix:** grid pasado a clases Tailwind `grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]` (una columna en mobile/tablet, dos en `lg+`) y padding del main `px-5 md:px-10`. Sin `style` inline.

**3.4 — Subir PDF marca el test como "completado" aunque no se haya hecho** · ✅ RESUELTO (2026-06-14)
- `equipo-client.tsx` ~224–227 (`disc_status: "completado"` al subir PDF).
- Cargar un PDF fuerza el estado a completado, contaminando el % de "Estado DISC del equipo" (`team-sidebar.tsx` ~26–29), el badge ✓ del roster (~191–197) y el estado del `TestLinkBox`. Conflación de "tiene PDF" con "completó el test".
- **Categoría:** bug funcional.
- **Fix:** `handleUploadPdf` ahora solo guarda `disc_pdf_url` (sin tocar `disc_status`). El estado "completado" lo fija únicamente la entrega del test (`submit_disc`), así el % del equipo y el badge ✓ reflejan tests reales, no PDFs adjuntos.

#### 🟠 Severidad MEDIA

**3.5 — Scores DISC sintéticos mostrados como datos reales** · ✅ RESUELTO (2026-06-14)
- `types.ts` ~84–104 (`syntheticScoresFromLetters`/`effectiveScores`); `disc-section.tsx` ~52/114–116; `disc-bars.tsx` ~82–88; `disc-radar.tsx`.
- Sin scores reales, el radar y las barras muestran valores inventados (ej. 96/64/28) con apariencia de medición exacta. El usuario no distingue estimado de medido.
- **Categoría:** UX / datos.
- **Fix:** `disc-section.tsx` calcula `realScores = scoresToPct(scores)` y `isEstimated = !realScores`; debajo del radar/barras muestra un aviso claro: ⚠ "Valores estimados a partir de las letras DISC, no medidos. Hacé el test…" cuando son estimados, o "Valores medidos en el test DISC." cuando son reales. Se eliminó `effectiveScores` (código muerto).

**3.6 — "Temor dominante" sugerido se muestra pero no se guarda** · ✅ RESUELTO (2026-06-14)
- `disc-section.tsx` ~181–186 (`value={draft.disc_temor || factor.temor}`); guardado en `equipo-client.tsx` ~148.
- El textarea muestra el temor sugerido como contenido real (no como placeholder atenuado), pero `draft.disc_temor` sigue vacío y se guarda `null` si no se edita. No marca `dirty`. Patrón "placeholder vía value" que confunde.
- **Categoría:** UX / bug funcional.
- **Fix:** la sugerencia pasó a ser `placeholder={factor.temor}` (atenuado, no se guarda) y `value={draft.disc_temor}` (lo real). Si el Arquitecto quiere adoptarla, un botón "Usar la sugerencia del perfil" la copia al draft (marca `dirty` y se guarda). Se acabó la confusión "se ve pero no se guarda".

**3.7 — Nombre/emoji del perfil inconsistentes entre Hero y Sidebar/Modal** · ✅ RESUELTO (2026-06-14)
- `member-hero.tsx` ~104–106 (por letras/arquetipo) vs `team-sidebar.tsx` ~161–163 y `member-report-modal.tsx` ~51/115 (por `disc_profile_key` canónico).
- El mismo miembro puede mostrar nombre y emoji distintos en el header vs la tarjeta lateral.
- **Categoría:** consistencia visual / bug.
- **Fix:** `member-hero.tsx` ahora resuelve nombre/emoji con `profileByKey(member.disc_profile_key)` (canónico) y cae a `archetypeFor` por letras — mismo criterio que el roster y el modal. Hero, sidebar y modal muestran siempre el mismo nombre/emoji.

**3.8 — Validación débil de email + invitaciones huérfanas/duplicadas** · ✅ RESUELTO (2026-06-14)
- `invite-modal.tsx` ~24–57 (solo valida `!email.trim()`, a diferencia de `actions.ts` ~6/59 con regex).
- Acepta emails inválidos; si el `signInWithOtp` falla tras el `insert`, queda una fila de invitación huérfana; no controla duplicados (invitar dos veces crea filas repetidas).
- **Categoría:** bug funcional / validación.
- **Fix:** `invite-modal.tsx` ahora valida con `EMAIL_RE` (regex, email normalizado a lowercase); deduplica consultando invitaciones existentes (company_id+email) antes de insertar; y hace **rollback** (borra la fila recién creada) si el `signInWithOtp` falla → no quedan invitaciones huérfanas ni duplicadas.

**3.9 — Errores de Supabase silenciados en la carga de la página** · ✅ RESUELTO (2026-06-14)
- `page.tsx` ~25–44 (queries team / assessments / authorityMatrix).
- No se inspecciona el `error` de ninguna query; ante fallo cae a `[]`/`null` y muestra equipo vacío sin distinguir "sin datos" de "error". Sin feedback al usuario.
- **Categoría:** manejo de errores.
- **Fix:** `page.tsx` captura el `error` de las 3 queries. Si falla la del equipo (data crítica) muestra `<EquipoError />` (bloque rojo claro) en vez de un equipo vacío engañoso; las de assessments/authority_matrix loguean a server y degradan a `[]`/`null`.

**3.10 — Contraste bajo en textos secundarios (confirma y amplía Mejora #2)** · 🟡 PARCIAL (2026-06-14)
- Ejemplos: `equipo-client.tsx` ~365 (`text-white/35`); `primitives.tsx` ~89; `member-report-modal.tsx` ~307/309 (`white/40`–`white/35`); `team-sidebar.tsx` ~119/126/239 (`white/45`); `pdf-report-box.tsx` ~53/64.
- Texto `white/35`–`white/45` sobre fondo oscuro por debajo del mínimo WCAG AA.
- **Categoría:** accesibilidad / contraste.
- **Estado:** el caso del formulario read-only se resolvió en 3.11. El barrido **transversal** de contraste (definir token mínimo de texto secundario y aplicarlo en toda la app) sigue pendiente → se trata como **Mejora #2** (no es solo del módulo Equipo).

**3.11 — Vista colaborador: formulario completo atenuado al 60%** · ✅ RESUELTO (2026-06-14)
- `primitives.tsx` ~105/123 (`disabled:opacity-60`); inputs del detalle con `disabled={!editable}`.
- Para el colaborador (solo lectura) todo el detalle se ve al 60% de opacidad, agravando el bajo contraste. Leer el propio perfil resulta poco legible.
- **Categoría:** accesibilidad / UX.
- **Fix:** `TextInput`/`TextAreaInput` cambian `disabled:opacity-60` por `disabled:cursor-default disabled:text-white/75` → el texto del campo read-only queda legible (75%) en vez de atenuar todo el campo al 60%.

**3.12 — Accesibilidad de modales y botones de solo ícono** · ✅ RESUELTO (2026-06-14)
- `invite-modal.tsx` ~59–85 (sin `role="dialog"`/`aria-modal`, sin focus trap, no cierra con Escape — `member-report-modal.tsx` ~42–48 sí); botones "X" sin `aria-label` en varios lugares (`invite-modal.tsx` ~78, `member-report-modal.tsx` ~119, `equipo-client.tsx` ~402/451).
- Falta de roles ARIA, foco no atrapado, cierre por teclado inconsistente y botones de ícono sin nombre accesible.
- **Categoría:** accesibilidad.
- **Fix:** `invite-modal.tsx` ahora tiene `role="dialog"` + `aria-modal` + `aria-labelledby`, cierra con Escape y su "X" tiene `aria-label`. El modal de confirmación de re-test (bug 3.1) nació con esos atributos. Las "X" de los toasts de `equipo-client.tsx` ya llevan `aria-label`. (`member-report-modal.tsx` ya cerraba con Escape; queda como mejora menor sumarle `aria-label` a su "X".)

**3.13 — Matriz de Autoridad: upsert duplicable y sin validación cruzada** · ✅ RESUELTO (2026-06-14)
- `authority-matrix-panel.tsx` ~51–82 (upsert) y ~94–100.
- El `upsert` por `company_id` solo evita duplicados si existe constraint UNIQUE; solo valida `n2_min > n2_max` (no coherencia global N1<N2<N3); sin valores muestra textos confusos ("Hasta — → decide solo…").
- **Categoría:** bug funcional / UX.
- **Fix:** `upsert` ahora con `onConflict: "company_id"` explícito (esa col es PK → actualiza, no duplica). Se agregó validación de coherencia global: sin negativos, `N2min ≤ N2max`, `N1 ≤ N2min`, `N2max ≤ N3`, con mensajes claros. Cuando un nivel no tiene valores, el desc muestra "Sin definir — configurá … abajo." en vez del texto confuso.

#### 🟡 Severidad BAJA

**3.14 —** ✅ RESUELTO (2026-06-14) `pdf-report-box.tsx` usaba `alert()` nativo. **Fix:** estado local `openErr` + aviso inline rojo bajo "Ver PDF" (mismo patrón que `sendErr` en `test-link-box`).

**3.15 —** ✅ RESUELTO (2026-06-14) `test-link-box.tsx` tragaba el fallo de "Copiar" (`catch {}`). **Fix:** estado `copyErr`; al fallar muestra "No se pudo copiar automáticamente. Seleccioná el link y copialo a mano." (el input es `readOnly`/seleccionable).

**3.16 —** ✅ RESUELTO (2026-06-14) `alignment-section.tsx` meta semanal sin `min`. **Fix:** `min={1} step={1}` + `onChange` que no persiste negativos (`Math.max(0, n)`; vacío = `null`).

**3.17 —** ✅ RESUELTO (2026-06-14) clase `px-4.5` inexistente. **Fix:** quitado el token de `equipo-client.tsx` (botón invitar) y `disc-section.tsx` (div "Cómo liderar"); el padding inline ya mandaba.

**3.18 —** ✅ RESUELTO (2026-06-14) `disc-radar.tsx` `<svg>` sin rol. **Fix:** `role="img"` + `aria-label` con los valores D/I/S/C.

**3.19 —** ✅ RESUELTO (2026-06-14) dos medidores con mismo aspecto. **Fix:** en `member-hero.tsx` el gauge "PERFIL" pasó a **"FICHA"** con `title` explicativo ("DISC + LOS + KPI cargados; distinto del Estado DISC del equipo"). Sin tocar cálculos.

#### Observaciones menores (no bloqueantes)
- `equipo-client.tsx` ~111–124: reseed de `draft` con `JSON.stringify` en cada render (frágil / costo de serialización).
- `equipo-client.tsx` ~342–344: `EmptyDetail` casi inalcanzable (el propio usuario siempre está en `team`); su copy rara vez aplica.
- `equipo-client.tsx` ~378–410: `savedFlash` (z-50) y `errorFlash` (z-55) comparten posición bottom-center y pueden solaparse.

**Estado:** ✅ CERRADO (2026-06-14, build verde) — 🔴 ALTAS (3.1–3.4), 🟠 MEDIAS (3.5–3.13) y 🟡 BAJAS (3.14–3.19) **todas resueltas**. Única excepción: 3.10 queda 🟡 parcial → el barrido transversal de contraste se trata como **Mejora #2** (afecta toda la app, no solo Equipo). Las "Observaciones menores" de abajo no son bloqueantes y quedan como backlog opcional.

---

### Mejora #4 — Naming incorrecto: "LOS" vs metodología **LOST** *(Añadido 2026-06-19)*

**Síntoma reportado**
> En la app y la documentación se usa **"LOS"** como si fuera el nombre de la metodología, pero el marco correcto es **LOST** (con T): Liderazgo · Operaciones · Sistemas · Tiempo.

**Causa**
- Confusión entre dos conceptos distintos:
  1. **LOST** — el sistema/metodología completo (4 pilares).
  2. **Niveles LOS** (N1–N5) — escala de autonomía del colaborador (Cadete → Socio), herramienta dentro del sistema.
- El copy de la UI mezcla ambos y en varios lugares "LOS" suena a metodología, no a nivel de autonomía.

**Alcance sugerido (corregir pronto)**
- **Sí tocar (copy visible):** textos de UI, tour (`tour-steps.ts`), títulos de pantalla, exports, workbooks y docs donde "LOS" signifique la metodología → cambiar a **LOST**.
- **Revisar caso a caso:** etiquetas "Nivel LOS" / "Mapa DISC + LOS" — dejar claro que es autonomía (N1–N5), no el marco LOST; evaluar renombrar a algo menos ambiguo cuando Dilio confirme.
- **No tocar en esta pasada:** columnas/tablas/código (`los_level`, `LOS_LEVELS`, `los_5_grandes`) — requieren decisión de naming + posible migración SQL.

**Archivos típicos afectados**
- `src/lib/tour-steps.ts`, `src/components/equipo/equipo-client.tsx`, `src/components/equipo/los-section.tsx`, `src/lib/workbook-sessions.ts`, `docs/MODULO_DISC.md`, referencias en `SPRINTS.md` / `PROGRESS.md`.

**Relación con otros ítems**
- Amplía **C1** de [`OBSERVACIONES_DILIO_2026-06.md`](OBSERVACIONES_DILIO_2026-06.md) (mapa del sistema LOST). El barrido de copy de esta mejora **no depende** de las presentaciones de Dilio; el mapa visual completo sí.

**Estado:** 🐛 Documentado — **corregir pronto** (prioridad copy/UI, sin cambios de schema)

---

## SPRINT 17 — Multiplicador (M8) + Bienvenida "JARVIS" + Re-acceso al Onboarding *(Implementado 2026-06-14)*
**Estado:** ✅ Implementado  
**Objetivo:** Convertir el ítem "Multiplicador" del sidebar (hoy un redirect muerto) en el módulo real M8, que cada inicio de sesión se sienta personal y "vivo" (estilo asistente de Iron Man), y resolver que el tour de onboarding hoy queda inaccesible una vez completado.

> **Alcance ejecutado:** 17.A (JARVIS simple + localStorage), 17.B (re-tour vía
> Command Palette + sidebar), 17.C (Multiplicador — core diagnóstico) y **17.D
> (bienvenida cinemática JARVIS — implementada 2026-06-15, reemplaza a 17.A y cierra
> el saludo doble)**. Los **retos interactivos del Multiplicador** (contador de
> interrupciones de 3 días y experimento de preguntas de 48h, ver M8 en `SPEC.md`)
> quedan **diferidos** a un sprint futuro; en esta entrega las 3 Herramientas se
> muestran como guía con su reto semanal en texto.

### Feature 17.C — Módulo Multiplicador de Liderazgo (M8) *(nuevo en este sprint)*

**Problema**
> El ítem "Multiplicador" del sidebar (`Zap`) llevaba a `/multiplicador`, que era
> solo `redirect("/equipo")` — un dead-end visible que rompe la confianza en el
> sistema (mismo motivo del S12).

**Solución implementada (core diagnóstico)**
- Nueva tabla `multiplicador_diagnostics` (migración `migration_sprint17_multiplicador.sql`):
  pregunta de capacidad del equipo + 9 respuestas (3 Pecados × 3, escala 1–4) +
  `total_score` calculado (/36) + RLS por empresa.
- `/multiplicador` ahora es módulo real (server page + `multiplicador-client.tsx`
  + `multiplicador-result.tsx`), guard solo arquitecto.
- **Diagnóstico:** pregunta de entrada (% capacidad) + Los 3 Pecados del
  Disminuidor (Rescatista / Marcapasos / Respuesta-Rápida).
- **Resultados:** score /36, banda 🟢≤15 / 🟡16–24 / 🔴≥25, desglose por pecado,
  las 3 Herramientas (Fichas de Póker / La Pregunta que Desbloquea / Definición de
  "Hecho") con su reto semanal, e historial mensual de evolución.
- Constantes y helper `scoreBandForTotal` en `src/types/database.ts`.

### Feature 17.A — Mensaje de bienvenida estilo Iron Man / JARVIS

**Idea**
> Cada vez que el usuario inicia sesión, recibe un saludo personalizado y contextual, con el tono de un asistente personal de alta gama ("Bienvenido de nuevo, Sebastián. Tenés 3 tareas por vencer hoy y el War Up arranca en 20 minutos.").

**Comportamiento esperado**
- Aparece al entrar al dashboard tras login (no en cada navegación interna).
- Saludo según hora del día (buenos días / tardes / noches) + nombre del usuario.
- Línea contextual dinámica con 1–3 datos reales del momento: tareas por vencer, próximo ritual, áreas en rojo, novedades sin leer.
- Tono configurable (formal "JARVIS" / motivacional / neutro). Opción de desactivar en preferencias.
- Animación de entrada sutil (fade + typewriter opcional) y auto-dismiss a los pocos segundos o al primer click.

**Consideraciones técnicas (a definir)**
- Detectar "nuevo login" vs navegación (flag de sesión / timestamp del último saludo en `localStorage` o en `profiles`).
- Las frases contextuales reutilizan datos que ya se calculan para el dashboard (semáforos, rituales, delegación).
- Posible plantilla de frases con variables; evaluar copy con tono de marca.

### Feature 17.B — Re-acceder al onboarding/tour cuando ya fue completado

**Problema**
> El tour guiado (S11) solo arranca automáticamente la primera vez (`tour_completed=false`). Una vez hecho, el usuario no encuentra fácilmente cómo repetirlo.

**Solución propuesta (a implementar a futuro)**
- Punto de entrada visible y descubrible para "Ver tour de nuevo": en el menú de perfil / Mi cuenta y/o en un botón de ayuda (`?`) persistente.
- Reusar la infraestructura ya existente: `startTour()` y el evento `tbm:start-tour` de `tour-provider.tsx`, reseteando `tour_completed=false` o disparando el tour sin reescribir el flag.
- Idealmente, un menú de "Ayuda" que agrupe: repetir tour, ver atajos (⌘K), y documentación.

**Criterio de éxito:** Al iniciar sesión el usuario recibe un saludo contextual con su nombre, y puede relanzar el tour en ≤2 clics desde cualquier pantalla.

---

### Feature 17.D — Bienvenida cinemática "JARVIS" (intro + presencia persistente) *(Implementado 2026-06-15)*

**Estado:** ✅ Implementado. Stack final: **Motion (`motion/react`)** + CSS, con
`layoutId="jarvis-core"` para el "vuelo" del orbe. Archivos:
`src/components/dashboard/jarvis-intro.tsx` (overlay + máquina de estados),
`jarvis-core.tsx` (orbe reutilizable), `jarvis-header-orb.tsx` (instancia
persistente en el header), `jarvis-store.ts` (coordina overlay↔header con
`useSyncExternalStore`, sin dependencias) y `src/lib/greeting.ts` (saludo +
briefing compartidos). Se borró `welcome-greeting.tsx` (lo reemplaza). El
`@keyframes jarvis-wash/breathe/caret` viven en `globals.css` (con override de
`prefers-reduced-motion`). **Resuelto el saludo doble**: el `<h1>` del header es el
único saludo persistente.

**Origen:** La v1 de 17.A dejó un saludo doble — el header del dashboard ya
saluda ("Buenos días, {nombre}") y el banner JARVIS volvía a saludar encima. En
vez de un simple fix (Opción A: convertir el banner en "briefing" sin re-saludar),
se decidió subir la apuesta y convertir el saludo en una **experiencia cinemática
de bienvenida** que además **adelanta el asistente de IA** de los sprints S18/S19.

> ✅ **Resuelto (2026-06-15):** 17.D reemplazó el banner `welcome-greeting.tsx`
> (borrado) por la película transitoria. El `<h1>` del header quedó como único
> saludo persistente → fin del saludo doble.

**Concepto — máquina de estados, solo en login fresco** (reusa el flag
`tbm:just-logged-in` de localStorage que ya existe):

1. **Cover** — al entrar, una capa full-screen cubre la app con un lavado de color
   de marca (aurora/gradiente animado azul TBM). La app ya está renderizada debajo.
2. **Speak** — en el centro aparece el **núcleo JARVIS** (orbe que respira/pulsa) +
   texto *typewriter*: "Bienvenido de nuevo, {nombre}." + briefing del día.
3. **Reveal** — el color se disuelve lentamente (~1.2 s) descubriendo el dashboard.
   El orbe se encoge.
4. **Settle** — el orbe **vuela del centro a su lugar al lado del nombre** en el
   header (transición de elemento compartido).
5. **Idle** — el orbe queda **persistente en el header** con animación sutil de
   "respiración"/glow, incluso en navegaciones normales (reemplaza el ✨ actual).
   Tooltip: "Tu asistente · próximamente". Es el adelanto del asistente IA (S18).

**Decisiones tomadas (a respetar en la implementación):**
- **Intensidad:** cinemática, ~2.5–3 s.
- **Sonido:** *chime* sutil al aparecer JARVIS (Web Audio). ⚠️ Ojo con las políticas
  de autoplay del navegador: puede no sonar en el primer load sin interacción
  previa; degradar con gracia (sin sonido) si el navegador lo bloquea.

**Tecnología recomendada (v1):** **Motion** (`motion/react`, ex Framer Motion) +
CSS.
- El **settle** (paso 4) es un *shared-element transition*: con `layoutId="jarvis-core"`
  en el orbe del overlay y el mismo `layoutId` en el orbe del header, Motion anima
  el vuelo automáticamente al desmontar el overlay (`AnimatePresence`). Sin medir
  coordenadas a mano.
- Lavado de color + glow del orbe: **CSS puro** (radial/conic-gradient animado +
  `box-shadow`/`blur` pulsante), reusando el patrón de `globals.css` (`tbm-pulse`,
  `tbm-float`).
- Typewriter: hook chico (`setInterval`) o el `animate` de Motion. Sin lib extra.
- Gating/descarte: reusa `localStorage` + "No volver a mostrar" + auto-skip al
  click + `prefers-reduced-motion` → saltar directo al estado final (orbe en header,
  sin película).

**Alternativas evaluadas:**

| Opción | "Wow" | Peso | Esfuerzo | Veredicto |
|---|---|---|---|---|
| CSS puro + JS | Medio | 0 kb | Medio-alto (el vuelo a mano con FLIP es fiddly) | Viable, settle costoso |
| **Motion (`motion/react`)** ⭐ | Alto | ~30–40 kb gz | Bajo (layoutId resuelve el settle) | **Recomendada v1** |
| GSAP | Alto | ~50 kb+ | Medio | Overkill |
| react-three-fiber / Three.js | Máximo (orbe 3D, partículas, shader) | ~150 kb+ | Alto | Ideal para v2 del orbe |
| Lottie | Alto (si hay diseño AE) | asset + lib | Medio | Solo si hay orbe diseñado en After Effects |

**Plan por fases:**
- **v1 (próxima sesión):** Motion + CSS. Orbe con glow CSS, lavado de color,
  typewriter, vuelo con `layoutId`, presencia persistente en header, chime sutil.
- **v2 (con el asistente, S18):** upgradear el *skin* del orbe a react-three-fiber
  (glow volumétrico/partículas tipo arc-reactor). La máquina de estados y el
  `layoutId` quedan iguales — solo cambia el render del orbe.

**Notas técnicas a resolver en la implementación:**
- El header hoy es **server component**; para que el orbe persistente participe del
  `layoutId` hay que convertir **solo el orbe** en una isla cliente (no todo el
  header).
- Performance: animar solo `opacity`/`transform` (compositor), nada de layout
  thrash. Desmontar el overlay al terminar.
- Accesibilidad: respetar `prefers-reduced-motion` (saltar a estado final) y permitir
  cerrar/saltar.

**Archivos previstos (a crear/tocar):**
- Nuevo: `src/components/dashboard/jarvis-intro.tsx` (overlay + máquina de estados).
- Nuevo: `src/components/dashboard/jarvis-core.tsx` (el orbe reutilizable: overlay y
  header comparten `layoutId`).
- Modificar: `src/components/dashboard/welcome-greeting.tsx` (lo reemplaza/absorbe).
- Modificar: el header del dashboard (`dashboard/page.tsx`) → isla cliente del orbe
  al lado del nombre, eliminando el ✨ y el saludo duplicado.
- `package.json` → dependencia `motion`.
- `globals.css` → keyframes del lavado de color / glow si hacen falta.

**Criterio de éxito:** En un login fresco, la pantalla se cubre de color, JARVIS
saluda como si hablara (typewriter + chime), el color se disuelve revelando la app,
y el orbe se acomoda junto al nombre y queda con presencia sutil. Sin saludo
duplicado. En navegación normal no se repite la película, pero el orbe sigue
presente. Con `prefers-reduced-motion` se salta a la versión estática.

---

## SPRINT 18 — Asistente IA Conversacional integrado *(Propuesto 2026-06-14)*
**Estado:** 🟡 **Parcialmente implementado** *(actualizado 2026-07-29)* — las **Etapas 1, 2
y 3 ya están en producción** como **DC** (piezas DC-1…DC-9: launcher global, persona
configurable, contexto de datos con RLS, tool use con patrón propose→confirm, historial y
rate-limit). La **Etapa 4 (proactividad y memoria)** sigue abierta y la cierra el
[**SPRINT 24**](#sprint-24--dc-proactivo--delegación-asistida-añadido-2026-07-29), tras el
pedido de Dilio del 25/07.  
**Objetivo:** Un chat con un agente de IA embebido en la app que ayude al usuario a interactuar con el sistema: responder dudas, guiarlo entre módulos, ejecutar acciones y dar contexto sobre sus datos. Se implementa por etapas incrementales para acotar riesgo y costo.

### Etapa 1 — Chat informativo (read-only / RAG sobre la app)
- Widget de chat flotante accesible desde cualquier pantalla.
- Responde preguntas sobre **cómo usar la app** (metodología TBM, qué es cada módulo, cómo delegar, qué es DISC/LOS, etc.) usando como base la documentación del proyecto.
- Sin acceso a datos del usuario todavía; foco en onboarding y soporte.
- Definir proveedor (OpenAI/Anthropic), límites de tokens y costo, y guardado de historial.

### Etapa 2 — Chat con contexto de datos del usuario (consultas)
- El agente puede leer datos del usuario (vía herramientas/funciones server-side con RLS) para responder: "¿qué tareas tengo por vencer?", "¿cómo viene mi Plan 90D?", "¿qué áreas están en rojo?".
- Capa de *function calling* / tools que mapea a queries seguras de Supabase. Nunca SQL libre del modelo.
- Respeto estricto de permisos por rol (un colaborador no ve datos de otros).

### Etapa 3 — Chat con acciones (write / agente operativo)
- El agente ejecuta acciones con confirmación del usuario: crear tarea delegada, agendar ritual, actualizar un KPI, marcar algo como hecho.
- Toda acción de escritura pide confirmación explícita y queda auditada.
- Manejo de errores y "deshacer".

### Etapa 4 — Proactividad y memoria
- El agente sugiere acciones según el estado (ej. "Hace 5 días que no hacés Cool Down").
- Memoria de conversaciones y preferencias del usuario.

**Consideraciones transversales:** costos por uso, rate limiting, privacidad de datos de empresa, logs/auditoría, y un *kill switch* por empresa. Evaluar UI (panel lateral vs modal vs página dedicada).

**Criterio de éxito (Etapa 1):** Un usuario nuevo puede preguntarle al chat "¿cómo delego una tarea?" y recibir una respuesta correcta basada en la metodología, sin salir de la app.

---

## SPRINT 19 — Módulo de Notificaciones por Email *(Propuesto 2026-06-14)*
**Estado:** 🔁 **Absorbido por el [SPRINT 23](#sprint-23--despertador-diario-aquí-dc-tu-executive-coach-añadido-2026-07-29)** *(2026-07-29)* — este sprint planteaba un módulo
de notificaciones genérico; el pedido de Dilio del 25/07 es más concreto y más chico
(despertador matinal con voz de DC + preferencias por usuario), así que S23 lo reemplaza y
se queda con el módulo de configuración y la capa de canal. **No implementar S19 por
separado.** Esta sección se conserva como referencia de diseño (tipos de notificación y
consideraciones técnicas siguen siendo válidos).  
**Objetivo:** El sistema envía emails automáticos sobre vencimientos de tareas y un reporte semanal del estado del negocio. Todo se configura desde un **módulo de Notificaciones** propio.

### Tipos de notificación
1. **Vencimientos de tareas (delegación):** aviso antes del vencimiento (ej. 24–48h antes) y al vencer. Para el responsable y, opcionalmente, el líder.
2. **Reporte semanal del estado** (digest): resumen consolidado con
   - Estado de **dependencias / tareas** (pendientes, bloqueadas, vencidas).
   - **Metas planteadas** y su avance.
   - **Planes** (Plan 90D) y **Rocas** del trimestre.
   - **Novedades** de la semana.
3. (Futuro) Alertas de áreas en rojo del diagnóstico.

### Módulo de configuración (nuevo)
- Sección dedicada donde el usuario configura:
  - Qué notificaciones quiere recibir (toggles por tipo).
  - Frecuencia y día/hora del reporte semanal.
  - Anticipación de los avisos de vencimiento.
  - Destinatarios (solo yo / líder / equipo).
  - Canal (email ahora; SMS/push a futuro).
- Preferencias persistidas por usuario (y/o por empresa con defaults).

### Consideraciones técnicas (alineadas al stack actual)
- **Envío:** Resend (ya en el stack).
- **Scheduling:** Supabase Edge Functions + cron (ya usado en `/api/cron/daily`) para el digest semanal y el barrido de vencimientos.
- Plantillas de email con el design system (reusar enfoque de `@react-pdf/renderer` / HTML emails).
- Tabla de preferencias de notificación + tabla de log de envíos (evitar duplicados, idempotencia).
- Respetar zona horaria del usuario/empresa.
- Link de "gestionar notificaciones" / unsubscribe en cada email.

**Criterio de éxito:** Un Arquitecto configura el reporte semanal para los lunes 8:00 y recibe ese día un email con dependencias, metas, plan, rocas y novedades; además recibe un aviso 24h antes de cada tarea por vencer.

---

## SPRINT 20 — Diagrama de Flujo de Dependencias en Tiempo Real *(Propuesto 2026-06-14)*
**Estado:** 🔮 Futuro — documentado, no implementado  
**Objetivo:** Una vista visual tipo diagrama de flujo donde el dueño de empresa ve, **en tiempo real**, cómo se encadenan las tareas y sus dependencias, para **identificar cuellos de botella** de un vistazo.

### Concepto
- Grafo de nodos (tareas / responsables / hitos) conectados por sus dependencias.
- Estado por color: en curso, bloqueada, vencida, completada.
- **Detección de cuellos de botella:** resaltar nodos que bloquean a muchos otros, cadenas largas, o tareas vencidas que frenan dependientes.
- Filtros por persona, área, estado o proyecto/plan.
- Actualización en **tiempo real** vía Supabase Realtime (igual que el toast de DISC en `equipo-client.tsx`).

### Consideraciones técnicas (a definir)
- Modelo de datos de dependencias entre tareas (relación tarea → tarea; hoy delegación maneja tareas, falta el grafo de dependencias).
- Librería de grafos/flow (ej. React Flow) — evaluar peso y compatibilidad Next.js.
- Layout automático (jerárquico / DAG) y manejo de ciclos.
- Rendimiento con muchos nodos; posible virtualización / agrupamiento.
- Vista read-only primero; edición de dependencias (arrastrar conexiones) como etapa posterior.

**Criterio de éxito:** El dueño abre el diagrama y, sin leer listas, identifica en segundos qué tarea/persona es el cuello de botella que está frenando al resto.

---

# BLOQUE JUL-2026 — Sprints S21–S31 *(Añadido 2026-07-29)*

> **Origen único:** [`OBSERVACIONES_DILIO_2026-07.md`](OBSERVACIONES_DILIO_2026-07.md) —
> transcripción de la Meet Dilio ↔ Sebas del **25/07/2026**, cruzada contra el estado
> real del repo. Cada sprint referencia los ítems (A1, B1, C0…) de ese documento;
> **no dupliques la justificación acá** — vive allá.
>
> **Cómo leer este bloque:** los sprints están en **orden de dependencia**, no de
> importancia. S21 repara lo que hoy rompe la confianza del cliente; S24 construye el
> patrón de IA proactiva que S25 y S26 reusan; S30 y S31 están **bloqueados por
> insumos externos** y van al final aunque su valor sea alto.
>
> **Regla del proyecto que aplica acá:** *un módulo a la vez* (regla 2). Estos sprints
> están dimensionados para cerrarse de a uno, con su migración y su verificación.

## Mapa de dependencias

```
S21 (fixes)  ──┬─→ S22 (rol + insignia)
               │
               ├─→ S23 (despertador) ──────────────┐
               │                                    │
               └─→ S24 (DC proactivo) ──┬─→ S25 (KPIs estructura) ─→ S26 (KPIs seguimiento)
                                        │                                  │
                                        └─→ S27 (coach: señales) ─→ S28 (coach: intervención)
                                                                           │
                        S29 (capacitación → SOP)  [independiente]          │
                                                                           │
                        S30 (madurez) ⛔ insumo Dilio                       │
                        S31 (WhatsApp) ⛔ credenciales ←────────────────────┘
                             (S23/S26/S28 ganan canal WhatsApp al cerrarse S31)
```

**Lecturas del mapa:**
- **S24 es el cuello de botella del bloque.** El patrón de intervención proactiva de IA
  se diseña una vez ahí y lo consumen S25 (sugerir KPIs) y S27 (narrar alertas). Si se
  hace tres veces por separado, son tres asistentes distintos y tres mantenimientos.
- **S31 (WhatsApp) no bloquea nada**, pero mejora S23, S26 y S28 retroactivamente: los
  tres se construyen contra una capa de canal abstracta, y WhatsApp entra como canal
  adicional sin tocar la lógica de negocio.
- **S29 es independiente**: puede adelantarse si Dilio lo prioriza.

---

## SPRINT 21 — Confianza: acceso, panel del coach y calendario *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §K1, §C0, §F1 · **Estimado:** ~14h
**Objetivo:** Reparar las tres cosas que hoy le están costando confianza al cliente. Ninguna
es una feature nueva: dos son bugs y una es una regla de negocio faltante. Es el sprint más
barato del bloque y el que más percepción cambia.

### Entregable 1 — Alta de colaboradores que no llega (~6h) 🔴
**Contexto crítico:** el fix `0763fff` (token propio de invitación) es del **23/07**;
Dilio reportó el problema el **25/07**. El reporte es **posterior al fix** → no está cubierto.

- **Diagnóstico primero, código después.** Hablar con **Juanjo** (chat "Plataformas"),
  conseguir el email exacto que falló y reproducir el alta end-to-end.
- **Aplicar la migración pendiente** `supabase/migration_invitations_token_accept.sql`
  — quedó sin aplicar (la MCP de Supabase pedía re-auth; ver SPEC.md §11). Sin ella no
  corre la expiración `pending → expired` ni el índice `(company_id, status)`.
- Revisar **deliverability** del dominio de envío: SPF, DKIM, DMARC y reputación;
  logs de Resend por destinatario (entregado / rebotado / marcado spam).
- **Fallback que no dependa del correo:** botón "Copiar link de invitación" en `/equipo`,
  junto al panel de invitaciones pendientes que ya existe. El Arquitecto lo manda por
  WhatsApp y listo. *Esto solo cierra la clase entera de fallos de email.*
- **Instrumentar:** registrar estado de envío por invitación para que el próximo reporte
  sea diagnosticable sin adivinar.

### Entregable 2 — Activar el panel Super Coach para Dilio (~2h)
Dilio: *"vos entras y no ves nada"*. El panel **existe** (`/super-coach`, capa 1: semáforo
por empresa alumna); el guard lo esconde.

- **Verificar en la base** si la cuenta de Dilio tiene filas en `coach_assignments`.
  Si no las tiene, es un alta de datos — no una feature.
- **Cambiar el guard** (`super-coach/page.tsx:28`): hoy hace
  `redirect("/dashboard")` cuando no hay asignaciones. Reemplazar por un **estado vacío
  explicativo** ("todavía no tenés empresas asignadas") para que el módulo nunca más
  parezca inexistente.
- **UI en `apps/admin`** para asignar empresas a un coach, así no se hace por SQL.

### Entregable 3 — Sprints anclados al año calendario (~6h)
Dilio: *"si la persona empieza tarde, no puede poner los sprints fuera del rango de los tres
meses… nuestro año sprint casa con el año calendario"*.

- Nuevo `lib/quarters.ts`: trimestre calendario de una fecha (**ene-mar · abr-jun ·
  jul-sep · oct-dic**), inicio/fin, días restantes.
- **Validar** `rocks.start_date` / `end_date` contra los límites del trimestre, en el form
  y en la base. Quien arranca tarde **recorta**; no se extiende al trimestre siguiente.
- `components/plan-90d/rocks-panel.tsx:42-47`: hoy el "Día X de 90" se calcula desde el
  `start_date` activo **más antiguo** — es un contador flotante. Pasa a "Día X de N ·
  trimestre jul-sep", anclado al calendario.
- **Copy** que explique el recorte, para que no se lea como un bug.

### ✅ Criterio de éxito del Sprint 21
Un colaborador invitado entra sin depender de que el correo llegue · Dilio abre
`/super-coach` y ve sus empresas (o un mensaje que le dice por qué no) · una roca creada
el 20 de agosto termina el 30 de septiembre, no el 18 de noviembre.

---

## SPRINT 22 — Rol y progresión de la persona *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §I1, §J1 · **Estimado:** ~18h
**Objetivo:** Que cada persona sepa **qué se espera de ella**, **hasta dónde puede decidir
sola** y **en qué nivel está**. Hoy lo primero y lo segundo no existen, y lo tercero está
enterrado.

### Entregable 1 — Ficha de rol con derechos de decisión (~12h)
Dilio: *"el rol tiene que decirle a la persona qué hace, cómo lo hace, las expectativas que
se tienen con él, los resultados que buscamos… y sus derechos: podés decidir hasta $X sin
preguntarme a mí. No me preguntes, ejecuta"*.

- **Hoy:** `profiles` tiene `cargo` (texto libre) y `los_level`. Nada más.
- **Modelo:** ficha por persona con campos estructurados — *qué hace · cómo lo hace ·
  expectativas · resultados esperados al tenerlo en el equipo · derechos de decisión ·
  **tope de decisión en $** (monto + moneda)*.
- **UI del líder:** definir/editar la ficha desde `/equipo`.
- **UI de la persona:** su ficha en modo lectura, visible desde su propio perfil. El punto
  de Dilio es que **la persona la vea**, no que el líder la archive.
- **Enganche con Delegación:** si una tarea implica un monto por encima del tope de quien
  la recibe, el wizard lo advierte. Es el uso concreto del "derecho", no un campo decorativo.

### Entregable 2 — Insignia de nivel de delegación (~6h)
Los 5 niveles (**Cadete → Investigador → Delegado → Doctor → Socio**) ya existen en
`LOS_LEVELS` (`lib/disc.ts`) y se muestran en `/equipo`. Sebas: *"está al final del método,
no es tan fácil encontrarlo"*.

- **Insignia junto al nombre** en el header/sidebar del propio colaborador — *"que él entre
  y tenga la insignia de cadete, de investigador"*.
- **Notificación + email al subir de nivel** — *"si sube de rango porque lo hace bien, que
  aparezca que subió de rango"*.
- ⚠️ **Bloqueante de diseño:** ¿el nivel lo **asigna el líder** o lo **calcula el sistema**?
  Dilio dudó en voz alta (*"me gustaría que el líder lo considera un cadete"*). Está en
  [`PENDIENTES_REVISION.md`](PENDIENTES_REVISION.md) §2 — **confirmar antes de codear el
  disparador del ascenso**. La insignia en sí se puede hacer sin esperar.

### ✅ Criterio de éxito del Sprint 22
Un colaborador entra y ve, sin buscar: su insignia de nivel y su ficha de rol con el monto
hasta el que puede decidir solo. El líder define esa ficha en menos de 3 minutos.

---

## SPRINT 23 — Despertador diario ("aquí DC, tu executive coach") *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §A1 · **Absorbe el S19 propuesto** (notificaciones por
email) · **Estimado:** ~20h
**Objetivo:** Que el sistema **despierte** a cada persona con la voz de DC y le recuerde lo
que ella misma dijo que hace todos los días. Hoy hay un digest, pero no despierta a nadie.

> **Este sprint reemplaza al SPRINT 19 propuesto.** S19 planteaba un módulo de
> notificaciones por email genérico; se integra acá con el pedido concreto de Dilio, que es
> más específico y más chico. Al cerrarse S23, marcar S19 como *absorbido*.

### Entregable 1 — Preferencias de notificación por usuario (~6h)
- Toggles por tipo de notificación, hora preferida, canal (email hoy; WhatsApp entra en S31).
- Persistidas por usuario con defaults por empresa. Link de gestión en cada email.
- **Diseñar la capa de canal como abstracción desde el día 1** (`enviar(canal, plantilla,
  destinatario)`), para que S31 sume WhatsApp sin reescribir la lógica.

### Entregable 2 — Email matinal a **todos los roles**, con voz de DC (~8h)
**Hoy** (`api/cron/daily/route.ts` §B) el digest tiene 4 problemas, todos a corregir:
1. Va **solo al Arquitecto** → debe ir a **todos los roles**.
2. Es **condicional**: `if (lines.length === 0) continue` (línea 212) → si está todo al día
   no llega nada. Un despertador que a veces no suena no es un despertador. **Debe llegar
   siempre**, con contenido positivo cuando no hay pendientes.
3. El copy es genérico (*"🧭 TBM hoy"*) → adoptar la **persona de DC**, que ya existe en
   `lib/dc-persona.ts`. Dilio lo dictó casi textual: *"buenos días, aquí DC, tu executive
   coach, recuerda hacer tu pre-game"*.
4. **No usa los hábitos declarados** del usuario, que ya están en `user_habits` /
   `habit_logs` desde A3.1 (jun-2026). Es la pieza que Dilio pidió explícitamente: *"que le
   sugiera a la persona lo que él dijo que hace diariamente"*.

### Entregable 3 — Hora de envío y husos horarios (~6h)
- Dilio menciona las **5 am**. Hoy el cron corre **una vez al día**, así que no puede
  respetar la hora local de cada persona.
- Pasar a un barrido **horario** que filtre por zona horaria + hora preferida, con
  idempotencia (un envío por persona por día) y log para evitar duplicados.

### ✅ Criterio de éxito del Sprint 23
Un colaborador en otro huso horario recibe, a la hora que eligió, un email con la voz de DC
que le nombra sus propios hábitos y su Pre-game pendiente — y lo recibe **también** los días
en que tiene todo al día.

---

## SPRINT 24 — DC proactivo + delegación asistida *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §G1, §B1, §B2 · **Cierra la Etapa 4 del SPRINT 18** ·
**Estimado:** ~26h
**Objetivo:** Que DC deje de esperar a que lo invoquen. Sebas lo diagnosticó en la meet y
Dilio lo confirmó: *"—hoy la IA es pasiva, cuando yo la invoco recién me contesta.
—Clave, clave, porque así la gente va teniendo el ejercicio más profesional"*.

> **Sprint pivote del bloque.** Acá se diseña **una vez** el patrón de intervención
> proactiva que después consumen S25 (sugerir KPIs) y S27 (narrar alertas del coach).
> Hacerlo tres veces por separado = tres asistentes distintos que mantener.

### Entregable 1 — Patrón de intervención proactiva reusable (~10h)
- Contrato único: *contexto del formulario → evaluación → intervención (sugerencia /
  advertencia / bloqueo) → aceptar · editar · ignorar*.
- Debe ser **barato y silencioso**: no dispara en cada tecla, no interrumpe al que ya
  escribe bien, y degrada a nada si falta `ANTHROPIC_API_KEY` (mismo criterio que
  `lib/ai-report.ts`).
- Reusa la infra de DC ya construida: adapters, rate-limit (50 msg/usuario/hora),
  historial y feature flags del admin.

### Entregable 2 — Gate de calidad en el wizard de delegación (~10h)
Dilio: *"si voy a delegar algo, el sistema debe impedir que yo delegue mal… debe decirme:
a pesar de que estás escribiendo esto, la delegación está incompleta"* — y además
**sugerirle la redacción**.

- **La estructura ya está**: `components/delegacion/task-wizard.tsx` (687 líneas) pide
  QUÉ (Definition of Done) · POR QUÉ · CÓMO · CUÁNDO · CHECK LOOP. **No faltan campos.**
- **Falta el juicio.** Hoy solo se valida que el campo no esté vacío; nada detecta *"esto
  está escrito como actividad, no como entregable"*.
- Por paso: evaluación de calidad + **reescritura sugerida** que el usuario acepta o edita.
- ⚠️ **Decisión de producto abierta:** Dilio dijo *"impedir"* — literalmente bloqueante.
  Un gate duro apoyado en un modelo falible es riesgoso (bloquea a alguien que escribió
  bien). Ver [`PENDIENTES_REVISION.md`](PENDIENTES_REVISION.md) §3. **Confirmar con Dilio
  antes de implementar el bloqueo.** Mientras tanto: advertencia fuerte, no bloqueo.

### Entregable 3 — ¿Campo "DÓNDE"? (~2h, condicionado)
Dilio enumeró *"¿Qué? ¿Por qué? ¿Cuándo? ¿Cómo? ¿Dónde?"*. El wizard tiene los cuatro
primeros. **No inventarlo:** preguntarle si el "dónde" es un campo real (canal/sistema donde
se entrega el trabajo) o una forma de hablar. Ver `PENDIENTES_REVISION.md` §4.

### Entregable 4 — Acompañamiento en workbooks (~4h)
Aplicar el mismo patrón mientras el usuario completa un workbook, que es donde Dilio ubicó
el problema de fondo: *"hay gente que no sabe eso"*.

### ✅ Criterio de éxito del Sprint 24
Un Arquitecto escribe "hacer el reporte" en el paso QUÉ y, sin pedirlo, DC le señala que eso
es una actividad y le ofrece un entregable concreto que puede aceptar de un clic.

---

## SPRINT 25 — KPIs en cascada: estructura *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §E1, §E2, §E5 · **Estimado:** ~30h
**Objetivo:** Que los 5 Grandes estratégicos **bajen** hasta la actividad diaria de cada
persona. Es el pedido más grande y el más alineado con el discurso del método.

**El ejemplo textual de Dilio, que sirve de caso de prueba:**
> 5 clientes/mes = $25.000 → responsables: Sebastián (3) y Dilio (2) → cada uno con su
> aporte en dinero, sus **llamadas** y sus **propuestas enviadas**.

### Entregable 1 — Modelo de datos jerárquico (~8h)
- **Hoy:** `/dashboard/kpis` (384 líneas) es una lista **semanal y plana** (nombre, target,
  unidad, leading/lagging, owner). **No hay jerarquía** contra `rituales/5-grandes`.
- **Nuevo:** meta estratégica → aporte por responsable → actividades diarias derivadas.
  Tres niveles, con el total del padre validado contra la suma de los hijos (si el objetivo
  son 5 clientes y los aportes suman 4, el sistema lo dice).
- Respetar lo ya decidido en `PENDIENTES_REVISION.md` §1: **cada colaborador ve y autocrea
  solo los suyos**; el Arquitecto ve los de toda la empresa. No reabrir esa decisión.

### Entregable 2 — Flujo obligatorio desde los 5 Grandes (~10h)
Dilio: *"el sistema tiene que **obligar** a que la persona describa claramente a cada
implicado cuáles son los indicadores con los que él aportaría al tema general"*.

- Al definir un Grande en `rituales/5-grandes`: asignar responsables y, **por cada uno**,
  su aporte medible. No se puede cerrar el Grande con responsables sin indicador.
- Es el único "obligar" del bloque que **no** es discutible: acá no hay juicio de un modelo,
  hay campos requeridos.

### Entregable 3 — Sugerencia de KPIs con IA (~8h)
Dilio: *"ahí el sistema tiene que sugerirle cosas a la persona porque si no, no lo van a
poder hacer. A veces la gente no sabe cómo asignar un KPI"*.
Reusa el patrón de S24 · propone actividades diarias a partir de la meta y del rol.

### Entregable 4 — Autogestión del colaborador (~4h)
Dilio, cuando Sebas preguntó si el colaborador puede armar los suyos: *"no, no, él también
puede armar su propia estructura para lograrlo, y eso es muy importante lo que acabas de
preguntar, porque nosotros predicamos una **cultura de autogestión**"*.
- El RLS ya deja que vea y cree los suyos (decidido 2026-07-05). **Revisar el form**, que
  parece pensado para el Arquitecto, y completar lo que falte del lado del colaborador.

### ✅ Criterio de éxito del Sprint 25
Se carga el ejemplo de Dilio completo (5 clientes / $25.000 / 3 y 2 / llamadas y propuestas)
sin salir del flujo, y cada responsable ve sus actividades diarias derivadas.

---

## SPRINT 26 — KPIs: seguimiento diario y alerta predictiva *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §E3, §E4 · **Depende de:** S25 · **Estimado:** ~22h
**Objetivo:** Implementar el principio que Dilio repitió como consigna del método:

> *"No miremos el retrovisor, siempre el parabrisas. No lleguemos al final del mes para
> decir: no lo lograste, y marcar el semáforo en rojo."*

### Entregable 1 — Check diario de actividades (~8h)
Dilio: *"diariamente el sistema le tiene que decir al responsable: ¿hiciste las llamadas?
¿mandaste las propuestas? ¿tocaste la puerta?"*.
- Marcado **diario** (hoy el módulo es semanal). Debe costar un toque, como el checklist de
  hábitos del Pre-game — mismo patrón de UX, ya probado.

### Entregable 2 — Motor de proyección (~8h)
- Ritmo actual vs. días restantes del mes → ¿llega o no llega?
- Dispara **antes** del vencimiento, no al vencer. Ese es todo el punto.
- Definir umbrales y evitar el ruido: una alerta que suena siempre deja de leerse.

### Entregable 3 — Alertas a las dos puntas (~6h)
- **Al colaborador:** *"estás atrasado en este KPI, no lo vas a lograr en el mes"*.
- **Al líder:** *"Fulanito lleva tres días sin avanzar en el tema"*.
- Canal: email vía la capa de S23. **WhatsApp** es el canal que Dilio prefiere y entra solo
  al cerrarse S31 — sin reescribir nada, porque la capa de canal ya es abstracta.

### ✅ Criterio de éxito del Sprint 26
Un colaborador que va atrasado se entera **a mitad de mes** de que no va a llegar, y su
líder se entera de que lleva tres días sin moverse — ninguno de los dos tuvo que abrir la app.

---

## SPRINT 27 — Super Coach: señales y alertas multi-empresa *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §C1, §C2, §C3, §C4 · **Depende de:** S21·E2 ·
**Estimado:** ~28h
**Objetivo:** Construir la capa 2 del panel del coach: **qué está pasando** en todas las
empresas alumnas.

> **Por qué importa comercialmente.** Dilio fue explícito: *"esto para la consultora, para
> Newway se vuelve muy importante, porque cuando nosotros asignamos cosas por hacer,
> implementar, ahí nos damos cuenta si la gente lo está haciendo o no"*. **Este bloque es el
> producto para la consultora**, no un extra del panel.

### Entregable 1 — Adopción: *"¿están utilizando el sistema?"* (~8h)
- **Hoy** el panel ya muestra semáforo de scorecard, War-Ups cerrados en 7 días y progreso
  de rocas. **Falta** una métrica explícita de **uso** (Pre-games completados, logins,
  workbooks avanzando) y su **tendencia** — que es lo que Dilio nombró primero.

### Entregable 2 — Alertas de rezago cross-empresa (~10h)
Dilio: *"encuentra rápidamente las alertas de las cosas que se van quedando relegadas en el
tiempo, para que el consultor pueda intervenir y decir: ey, esto se nos está quedando, ¿qué
pasó?"*.
- Bandeja única ordenada por **antigüedad del atasco**, no por empresa. El coach entra y ve
  lo más podrido primero.

### Entregable 3 — DISC de todas las empresas (~6h)
- **Cuidado con el RLS.** Hoy `disc_assessments` es **solo arquitecto** (auditado en jun-2026
  §B1). Hay que abrir un carril para el rol coach **sin romper** la regla de que un
  colaborador no ve a sus compañeros. Es un cambio de seguridad: se audita antes de mergear.

### Entregable 4 — Alerta de equipo desbalanceado (~4h)
Dilio: *"puede alertar que hay un equipo desbalanceado desde su constitución: mira,
contrataste cinco dominantes en esa área, aquí vamos a tener problemas de conexión"*.
- **Ya existe casi todo:** B6 (jun-2026) construyó el rombo y `detectPairCrossings` con
  `TBM_DISC_CRUCES`, y dejó las heurísticas de composición como señal secundaria — que es
  exactamente lo que pide acá. **Falta subir esa señal al panel del coach** a nivel "esta
  empresa tiene un problema de constitución de equipo". Es integración, no motor nuevo.

### ✅ Criterio de éxito del Sprint 27
Dilio abre el panel una vez por semana y, sin entrar a ninguna empresa, sabe cuál está
abandonando el sistema y cuál tiene un problema de composición de equipo.

---

## SPRINT 28 — Super Coach: intervención *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §C5, §C6 · **Depende de:** S24, S27 · **Estimado:** ~30h
**Objetivo:** Que el coach no solo **vea** sino que **actúe**. Sin esto, S27 es un tablero
bonito que obliga a salir de la app para hacer algo.

### Entregable 1 — Mensajería interna coach ↔ empresa (~18h)
Dilio: *"puede interactuar con el líder, puede interactuar con el equipo. Cuando alguien se
está relegando, él puede interactuar"*.
- **No existe mensajería en el repo.** Es el entregable más caro del sprint.
- **Evaluar primero la alternativa barata:** reusar el canal de **notificaciones + email**
  que ya existe (mensaje dirigido con contexto) en vez de construir un inbox completo con
  hilos, no leídos y tiempo real. Decidir con una demo de la versión barata en la mano —
  puede que alcance.
- Debe partir **desde la alerta**: el coach ve el rezago y responde ahí mismo, sin buscar a
  la persona.

### Entregable 2 — Asistente IA del coach, multi-empresa (~12h)
Dilio: *"que esté vigilando todas las compañías, los puntos críticos que se van quedando, y
alertándome: esta empresa se está quedando, aquí no están registrando nada, aquí no se está
documentando nada"*.
- Es DC con **scope cross-empresa** y en modo **push** en vez de pull.
- **Depende de S27**: la IA narra señales, no las inventa. Sin las señales de S27 esto es
  un modelo alucinando sobre datos que no tiene.
- Reusa el patrón proactivo de S24.

### ✅ Criterio de éxito del Sprint 28
El coach recibe "esta empresa lleva 2 semanas sin documentar nada" y, desde esa misma
alerta, le escribe al líder sin salir del panel.

---

## SPRINT 29 — Capacitación: grabar → transcribir → SOP en PDF *(Añadido 2026-07-29)*
**Estado:** 🔮 Planificado — no implementado
**Origen:** OBSERVACIONES jul-2026 §D1, §D2 · **Independiente** (puede adelantarse) ·
**Estimado:** ~30h
**Objetivo:** Que el empresario capture un proceso **hablando**, y el sistema le devuelva el
manual escrito. Es el entregable con más "wow" del bloque.

### Entregable 1 — Grabación dentro del sistema (~14h)
Dilio: *"yo debiese tener una opción que me permita a mí grabar el video"*.
- **Hoy** (`components/plan-90d/activo-form.tsx:128-131`) el campo es un **input de texto**
  con `placeholder="Link al video (Loom, YouTube…)"`. Es exactamente la fricción que Dilio
  señaló: *"te dice sube un link… no lo puede hacer directamente"*.
- Sebas en la meet: *"el sistema debería tener la capacidad de grabar"*, porque Loom implica
  cuenta, pago y dos pasos más para el empresario. **Menos pasos es el requisito.**
- `MediaRecorder` + `getUserMedia` (pantalla + cámara) → subida a Supabase Storage.
  Verificar límites de tamaño y soporte en navegadores antes de comprometerse.
- Ubicación: la pestaña de mentoría que cuelga de las **5 Rocas**, donde Dilio ya la ubicó.

### Entregable 2 — Transcripción + SOP en PDF de máx. 2 páginas (~16h)
Dilio: *"grabar, transcribir y generar el proceso en un PDF de máximo dos hojas. **No puede
ser más porque nadie lee esa vaina**, y que los títulos queden bien establecidos para que sea
fácil encontrarlos: ¿cómo hacer tal cosa? ¿cómo hacer tal otra?"*.

- Pipeline: audio → transcripción → resumen a SOP con IA → PDF con `@react-pdf/renderer`
  (ya en el stack).
- **Dos requisitos duros, no sugerencias:**
  1. **Tope de 2 páginas** — forzado en el prompt **y validado al renderizar**. Si se pasa,
     se re-resume; no se publica un SOP de 5 páginas.
  2. **Títulos en forma de pregunta** (*"¿Cómo hacer X?"*), porque el criterio de Dilio es
     que se encuentren rápido, no que estén completos.
- El PDF queda como **Activo** de la empresa, buscable.

### ✅ Criterio de éxito del Sprint 29
Un empresario graba 10 minutos explicando cómo se cierra la caja y obtiene, sin editar nada,
un PDF de 2 páginas con títulos en forma de pregunta que su equipo puede seguir.

---

## SPRINT 30 — Estado de madurez del empresario *(Añadido 2026-07-29)*
**Estado:** ⛔ **Bloqueado** — necesita insumo de Dilio
**Origen:** OBSERVACIONES jul-2026 §H1 · **Estimado:** ~18h (post-desbloqueo)
**Objetivo:** Que el sistema le diga al dueño **dónde está parado** y le avise **si
retrocede**.

Dilio: *"el sistema tiene que estar concatenado e irle diciendo al dueño dónde se encuentra:
¿sigue siendo el cuello de botella? ¿ya tenés equipo? Tres o cuatro parámetros… cuello de
botella es el peor estado, la parte más baja de la productividad. Un segundo nivel que
permita ver que ya empezamos un proceso de transformación, inicio de arquitectura"*.
Y lo que más remarcó: *"si se va cayendo la vaina, le avisa: **estás volviendo a ser el
cuello de botella**"*.

- **Hoy:** *"cuello de botella"* aparece **solo como texto** en `lib/workbook-sessions.ts`.
  No hay estado calculado ni visible en ningún lado.
- **Trabajo previsto:** definir los niveles con criterios medibles (delegación activa, % de
  decisiones que no pasan por el dueño, LOS del equipo), mostrarlos en el dashboard, y
  **detectar el retroceso** — que es la mitad del pedido y la más fácil de olvidar.

### ⛔ Qué falta para arrancar
Dilio dio **N0** (cuello de botella) y **N1** (inicio de arquitectura). **Faltan los nombres
canónicos y los umbrales de los 3-4 niveles.** Sin eso, cualquier escala que inventemos va a
chocar con su metodología. Registrado en `PENDIENTES_REVISION.md` §5.

### ✅ Criterio de éxito del Sprint 30
El dueño ve su nivel en el dashboard y, si vuelve a concentrar decisiones, el sistema se lo
dice antes de que él lo note.

---

## SPRINT 31 — Canal WhatsApp *(Añadido 2026-07-29)*
**Estado:** ⛔ **Bloqueado** — faltan credenciales
**Origen:** OBSERVACIONES jul-2026 §A2 · **Mejora retroactivamente:** S23, S26, S28 ·
**Estimado:** ~20h (post-desbloqueo)
**Objetivo:** Sumar WhatsApp como canal, que es donde Dilio quiere que ocurra el seguimiento:
*"si nosotros conectamos el WhatsApp de la persona, el seguimiento de la plataforma se hace
más fácil"*.

**Buena noticia del 25/07:** la API **ya está contratada**. Textual: *"—¿Ya la tienen? —Sí,
sí, ya la tienen"*. Se la habían dado a **Mike** para correr su CRM. **Contacto: Juan José**,
canal "Plataformas".

### Tareas
- Conseguir credenciales (Juanjo) y `lib/whatsapp.ts`, espejo de `lib/email.ts`.
- Campo de **teléfono verificado** en `profiles` + **opt-in / opt-out** explícito.
- Enchufarlo a la capa de canal de S23 — **sin tocar la lógica de negocio** de S23/S26/S28.
- Mensajes de Dilio a portear: despertador matinal (*"buenos días, aquí DC, tu executive
  coach"*), atraso de KPI al colaborador, y aviso al líder (*"Fulanito lleva tres días sin
  avanzar"*).

### ⚠️ El cuello de botella real no es el código
WhatsApp exige **message templates aprobados por Meta** para todo mensaje iniciado por el
negocio. La aprobación tiene tiempos propios y puede rechazar copys. **Arrancar el trámite
apenas se tengan las credenciales**, en paralelo al desarrollo — no después.

### ✅ Criterio de éxito del Sprint 31
Un usuario recibe a las 5 am su recordatorio de Pre-game por WhatsApp, con la voz de DC, y
puede darse de baja del canal sin perder el email.

---

## Tareas sueltas del bloque jul-2026 (sin sprint propio)

| # | Tarea | Estado | Nota |
|---|---|---|---|
| L1 | Aplicar paleta + tipografía de marca | ⛔ Bloqueado | Espera el manual de marca de Dilio (lo trabaja con Juan). Sebas: *"es sencillo"* — el theming ya está tokenizado desde jun-2026. **Antes:** barrido de colores hardcodeados fuera de `var(--…)`. ~4h |

---

## Resumen del bloque jul-2026

| Sprint | Tema | Estimado | Estado | Ítems |
|---|---|---|---|---|
| **S21** | Confianza: acceso, coach y calendario | ~14h | 🔮 | K1, C0, F1 |
| **S22** | Rol y progresión de la persona | ~18h | 🔮 | I1, J1 |
| **S23** | Despertador diario (voz de DC) | ~20h | 🔮 | A1 *(absorbe S19)* |
| **S24** | DC proactivo + delegación asistida | ~26h | 🔮 | G1, B1, B2 *(cierra S18·E4)* |
| **S25** | KPIs en cascada: estructura | ~30h | 🔮 | E1, E2, E5 |
| **S26** | KPIs: seguimiento y alerta predictiva | ~22h | 🔮 | E3, E4 |
| **S27** | Super Coach: señales multi-empresa | ~28h | 🔮 | C1–C4 |
| **S28** | Super Coach: intervención | ~30h | 🔮 | C5, C6 |
| **S29** | Capacitación: grabar → SOP en PDF | ~30h | 🔮 | D1, D2 |
| **S30** | Madurez del empresario | ~18h | ⛔ | H1 |
| **S31** | Canal WhatsApp | ~20h | ⛔ | A2 |
| — | Branding (tarea suelta) | ~4h | ⛔ | L1 |

**Total estimado:** ~260h · **Desbloqueado hoy:** ~218h (S21–S29).

> Las estimaciones son de trabajo de implementación, sin contar QA con Dilio ni las
> decisiones de producto pendientes. Los sprints marcados ⛔ **no se estiman en el
> cronograma** hasta que llegue el insumo.

---


Database:     Supabase (PostgreSQL + Auth + Realtime + Storage)
Backend:      Supabase Edge Functions (Deno) para cron jobs y lógica server-side
Email:        Resend
PDF:          @react-pdf/renderer
Analytics:    Posthog (open source, free tier)
Errores:      Sentry
Deploy:       Vercel
Repo:         GitHub (privado)
```

---

## REGLAS DEL PROYECTO

1. **Regla del 70% aplicada al código:** Si funciona al 70%, se sube. No existe el código perfecto en Sprint 0.
2. **Un módulo a la vez:** No se empieza el Sprint siguiente sin cerrar el anterior.
3. **Demo al final de cada Sprint:** Aunque sea solo para Sebas — graba un Loom de 5 min mostrando el entregable.
4. **Commits diarios:** Aunque sean chicos. El historial de git es el Victory Log del proyecto.
5. **La app vive en producción desde el Sprint 0:** No "localhost forever".

---

## PRÓXIMOS PASOS INMEDIATOS (Esta semana)

- [ ] **Hoy:** Crear repositorio en GitHub (`tbm-app`)
- [ ] **Hoy:** Crear proyecto en Supabase (free tier)
- [ ] **Hoy:** Crear proyecto en Vercel (conectado al repo)
- [ ] **Mañana:** `npx create-next-app@latest` y primer commit
- [ ] **Esta semana:** Auth completo funcionando en producción

---

*Documento generado en Fase EXECUTION — The Business Multiplier App*  
*Stack: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel*
