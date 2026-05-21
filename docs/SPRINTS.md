# SPRINTS.md — The Business Multiplier App
**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel  
**Ritmo:** 2h/día · ~14h/semana · Sprints de 2 semanas (~20h c/u)  
**Duración total:** 20 semanas (~5 meses)  
**Equipo inicial:** Solo (Sebas) → incorporar segunda persona en Fase 2  

---

## RESUMEN EJECUTIVO DE SPRINTS

| Sprint | Tema | Semanas | Entregable clave |
|---|---|---|---|
| **S0** | Setup & Auth | 1–2 | App en producción con login |
| **S1** | Onboarding + Dashboard | 3–4 | Diagnóstico inicial + semáforos |
| **S2** | Rituales | 5–6 | Warm Up / Cool Down funcional |
| **S3** | Mi Equipo (DISC + LOS) | 7–8 | Mapa completo del equipo |
| **S4** | Delegación | 9–10 | Pase de Estafeta con validaciones |
| **S5** | Feedback S.E.C. | 11–12 | Sistema de feedback estructurado |
| **S6** | Plan 90D + BOS | 13–14 | Planificación estratégica completa |
| **S7** | Workbooks S1–S4 | 15–16 | Primeras 4 sesiones digitalizadas |
| **S8** | Workbooks S5–S8 | 17–18 | Programa completo digitalizado |
| **S9** | Polish + Exportación | 19–20 | App lista para beta |
| **S10** | Beta cerrada | 21–22 | Feedback real de 3–5 empresas piloto |

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
profiles (id, company_id, full_name, email, role, avatar_url, created_at)
```
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
- [ ] Pantalla 1: Datos de empresa (nombre, sector, cantidad de colaboradores)
- [ ] Pantalla 2: Team Performance Scorecard — 8 áreas, slider 1–5 con descripción de cada área
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

**Pre-game personal (3h)**
- [ ] Formulario matutino privado del Arquitecto:
  - Big Win 1, 2, 3 (3 inputs de texto)
  - Mi Marcha de 20 Millas (acción diaria constante — editable solo 1 vez por semana)
  - ¿Hice activación física? (toggle)
- [ ] Pre-game como gate: el Warm Up no se puede iniciar hasta que el Arquitecto lo complete
- [ ] Historial de pre-games (calendario de días completados)

**Warm Up del equipo (8h)**
- [ ] El Arquitecto inicia el Warm Up del día (botón "Iniciar Warm Up")
- [ ] Cada colaborador ve la pantalla de entrada con 3 campos:
  - **QUÉ:** "¿Qué vas a lograr hoy?" (placeholder: "No digas 'trabajar', di el entregable exacto")
  - **POR QUÉ:** "¿Por qué es lo más rentable hoy?"
  - **BLOQUEO:** "¿Qué necesitás del líder para lograrlo?"
- [ ] El Arquitecto ve todas las entradas en tiempo real (Supabase Realtime)
- [ ] Por cada entrada: botón "✓ Con criterio" o "✗ Sin criterio claro" → si marca sin criterio, el ítem se tilda visualmente
- [ ] Timer visible: 15 minutos recomendados (no bloqueante, solo visual)
- [ ] Modo asincrónico: plazo hasta las 9am para ingresar

**Cool Down (6h)**
- [ ] Formulario de cierre accesible desde las 5pm
- [ ] 3 campos por persona:
  - **Victory Log:** "¿Cuál fue tu victoria de hoy?" — campo obligatorio (no se puede enviar vacío, mensaje: "Encontrá UNA victoria, aunque haya sido un caos")
  - **Reality Check:** "¿Qué NO se logró y por qué?" (hechos, no excusas)
  - **Cierre de ciclos:** "¿Qué queda agendado para mañana?"
- [ ] El Arquitecto ve resumen del equipo al final del día

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
- [ ] Formulario en 5 pasos (wizard):
  - Paso 1 — **QUÉ:** Definition of Done (texto + opción de adjuntar imagen)
  - Paso 2 — **POR QUÉ:** Contexto e impacto
  - Paso 3 — **CÓMO:** Restricciones (presupuesto, herramientas, qué NO romper)
  - Paso 4 — **CUÁNDO:** Date-time picker exacto
  - Paso 5 — **CHEQUEO:** Cuándo se revisa el borrador
- [ ] Barra de progreso del wizard (1/5 → 5/5)
- [ ] Botón "Guardar" deshabilitado hasta completar los 5 pasos
- [ ] Mensaje de error si intenta saltear: "Este punto es obligatorio. Si falta, el error es tuyo."
- [ ] Selector de colaborador asignado + nivel LOS requerido

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

### ✅ Criterio de éxito del Sprint 5
> El Arquitecto puede construir un feedback S/E/C en < 3 minutos con el template, con sugerencia de tono según el perfil DISC del colaborador, y ver el historial de balance S/E/C por persona.

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

### ✅ Criterio de éxito del Sprint 6
> El Arquitecto define las Rocas del trimestre, ve el Dashboard con Leading Indicators y semáforos reales, puede aparcar ideas con fecha de liberación automática, y registra decisiones con el filtro del 70%.

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
- [ ] Sistema de desbloqueo: S2 se activa cuando S1 tiene ≥ 70% completado
- [ ] Barra de progreso por sesión
- [ ] Cierre de sesión: "Mi compromiso de esta semana:" → guarda en `workbook_progress`

**Sesión 1 — Diagnóstico (4h)**
- [ ] Team Performance Scorecard (8 áreas 1–5) → actualiza semáforos del Dashboard
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

**Polish general (5h)**
- [ ] Loading states en todos los formularios
- [ ] Empty states con instrucción clara (cuando no hay datos aún)
- [ ] Error handling: mensajes de error humanizados
- [ ] Responsive check en mobile (Warm Up debe ser 100% usable en celular)
- [ ] Performance: lazy loading de módulos pesados
- [ ] Accesibilidad básica (contraste, navegación por teclado)

### ✅ Criterio de éxito del Sprint 9
> La app se ve y se siente profesional. Todos los flujos tienen loading/empty/error states. Se puede exportar un reporte PDF del diagnóstico. Las notificaciones llegan a tiempo.

---

## SPRINT 10 — Beta Cerrada
**Semanas:** 21–22 · **Horas estimadas:** Variable (depende del feedback)  
**Objetivo:** Validar el método con 3–5 empresas piloto reales. Obtener feedback para iterar.

### Tareas

**Lanzamiento beta (3h)**
- [ ] Seleccionar 3–5 alumnos activos del programa TBM de Dilio
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

## STACK TECNOLÓGICO DEFINITIVO

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
