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

```
Frontend:     Next.js 14 (App Router) + TypeScript
Styling:      Tailwind CSS + shadcn/ui
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
