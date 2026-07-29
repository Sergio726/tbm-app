# SPEC.md — The Business Multiplier App
**Fase:** Architecture  
**Basado en:** DISCOVERY.md + Visión de app TBM - Dilio V2.md (Sesiones 1–8 completas)  
**Versión:** 1.1  
**Fecha:** Mayo 2026

---

## 1. RESUMEN EJECUTIVO

**The Business Multiplier App** es un Sistema Operativo de Negocios (Business OS) que digitaliza el método TBM de Dilio Donado. Convierte los 8 workbooks estáticos en una herramienta viva que guía, obliga y mide la implementación del método en tiempo real.

**Propuesta de valor core:**  
> "No es un software de gestión. Es un coach digital que no te deja hacer las cosas mal."

**Lo que hace diferente:**
- El sistema valida antes de permitir avanzar (no puedes delegar sin los 5 puntos del Pase de Estafeta)
- Las respuestas de los workbooks alimentan dashboards en vivo (no documentos muertos)
- Combina rituales diarios + diagnósticos + planificación estratégica en un solo lugar
- Diseñado 100% sobre la metodología TBM — no es genérico

---

## 2. USUARIOS Y ROLES

### Roles en el sistema

| Rol | Nombre en la app | Descripción | Acceso |
|---|---|---|---|
| CEO / Fundador | **Arquitecto** | Usuario principal. Configura la empresa, lidera el programa. | Total |
| Líder medio / Jefe de área | **Colaborador** | Participa en rituales, recibe tareas y feedback, reporta avances. | Parcial |
| Coach / Consultor externo | **Observador** *(v2)* | Ve dashboards sin editar. Acompaña el proceso desde afuera. | Solo lectura |

### User Personas principales

**Persona A — El Arquitecto Atrapado** (usuario core, Sesión 1)
- CEO/Fundador, empresa 5–50 personas, 3–10 años en el negocio
- Trabaja 12+ horas, todo depende de él, score TBM < 25
- Objetivo: salir de la operación y escalar

**Persona B — El Arquitecto que Está Escalando**
- Empresa 15–100 personas, ya tiene algunos sistemas
- El equipo no es autónomo, la delegación falla
- Objetivo: subir al equipo por los niveles LOS (N1→N5)

---

## 3. MÓDULOS DE LA APP

La app tiene **8 módulos** que espejean la progresión del programa TBM:

```
┌─────────────────────────────────────────────────────────┐
│                   DASHBOARD CENTRAL                      │
│              (Semáforos + KPIs + 90D)                   │
├──────────┬──────────┬──────────┬───────────┬────────────┤
│ RITUALES │  EQUIPO  │ DELEGAR  │ FEEDBACK  │  PLAN 90D  │
│ Diarios  │  DISC+   │  Pase de │   S.E.C.  │  Rocas &   │
│ Pre/Warm/│  LOS     │ Estafeta │           │  Arena     │
│ CoolDown │          │          │           │            │
├──────────┴──────────┴──────────┴───────────┴────────────┤
│              WORKBOOKS DINÁMICOS (S1–S8)                │
├─────────────────────────────────────────────────────────┤
│              DIAGNÓSTICOS & SCORECARDS                  │
└─────────────────────────────────────────────────────────┘
```

---

### M1 — Dashboard Central (Home)

**Propósito:** Vista de un vistazo del estado de la empresa según el método TBM.

**Componentes:**
- **Semáforo de las 8 Áreas** (del Diagnóstico Organizacional TBM): cada área muestra Verde / Amarillo / Rojo según el último diagnóstico
- **5 Leading Indicators (BOS — S7):** métricas predictivas con dueño + meta semanal + semáforo TBM (🟢 ≥100% de meta / 🟡 85–99% de meta / 🔴 <85% de meta). Tracking por 3 semanas visibles simultáneamente (S1 / S2 / S3). El semáforo usa el último valor ingresado vs. la meta — calculado automáticamente.
- **Número único por colaborador:** un KPI principal que justifica el salario de cada miembro
- **Progreso del Plan 90D:** % de avance en cada Roca del trimestre
- **Estado de rituales:** ¿Se hizo el Warm Up hoy? ¿El Cool Down ayer?
- **Energía del líder:** auto-reporte rápido (1–5) al entrar a la app

**Distinción vital en el Dashboard (S7):**
- **Lagging (Ya pasó):** ventas totales del mes anterior — visible pero NO como foco de decisión
- **Leading (Predictivo):** propuestas enviadas, llamadas realizadas, etc. — ESTOS son los que controlan el futuro

**Reglas de negocio:**
- El semáforo se actualiza automáticamente cuando el usuario completa un módulo del Scorecard
- KPI en rojo → alerta inmediata + campo automático: "¿Excusa o solución?" (obliga a que el dueño del número responda)
- Si llevan 3+ días sin Warm Up → alerta visual en el dashboard
- Si hay una tarea con más de 72h sin actualización → alerta (A.R.Q.U.I. — Update)
- "Sesión de Silencio": cuando el Arquitecto abre un KPI en rojo, la app espera 5 segundos antes de habilitar cualquier acción (fricción intencional para que el equipo hable primero)

---

### M2 — Rituales Diarios

**Propósito:** Digitalizar el ciclo Pre-game / Warm Up / Cool Down. Es el módulo de uso más frecuente.

**Sub-módulos:**

#### Pre-game (Personal — solo el Arquitecto)
- Input: Mis 3 Big Wins del día (visualización)
- Input: Mi Marcha de 20 Millas (acción diaria constante)
- Estado: ¿Hice activación física? ¿Revisé mis 5 Grandes de ayer?
- Bloqueo: la app no abre el Warm Up hasta que el Arquitecto complete su Pre-game

#### Warm Up (Equipo)
- El Arquitecto inicia la sesión
- Cada Colaborador invitado ingresa:
  - **QUÉ:** entregable exacto de hoy (no "trabajar")
  - **POR QUÉ:** validación de criterio (¿es lo más rentable hoy?)
  - **BLOQUEO:** ¿qué necesito del líder?
- El Arquitecto valida cada entrada (puede marcar "sin criterio claro" → ítem se elimina)
- Duración recomendada: 15 min. Timer visible.
- Formato: puede ser asincrónico (cada quien ingresa antes de las 9am) o sincrónico

#### Cool Down (Equipo o individual)
- **Victory Log:** una victoria del día (obligatorio, aunque haya sido un caos)
- **Reality Check:** qué NO se logró y por qué (hechos, no excusas)
- **Cierre de ciclos:** qué queda agendado para mañana
- Regla: si alguien completa el Cool Down sin Victory Log → la app no lo deja cerrar

**Frecuencia configurable (según cultura del equipo):**
- Modo A: Warm Up lunes + Cool Down viernes (equipo muy productivo)
- Modo B: Abrir lunes + cerrar martes (equipo poco productivo)
- Modo C: Abrir y cerrar el mismo día (situación crítica)
- Modo Diario: todos los días (onboarding inicial recomendado)

---

### M3 — Mi Equipo (DISC + LOS)

**Propósito:** Mapa vivo del equipo: quién es quién, en qué nivel está, si está en Luz o Sombra.

**Componentes:**

#### Perfil DISC por persona

**Estado del test DISC (flujo de onboarding por colaborador):**
- 🔵 **DISC pendiente** — no tiene test. La app muestra el costo estimado (~$100) y el próximo paso.
- 🟡 **Test enviado** — en proceso de evaluación externa.
- 🟢 **Completado** — informe PDF disponible y perfil cargado.

**Campos del perfil (una vez completado):**
- **Letras DISC** (D/I/S/C): ingresadas manualmente desde el informe.
- **Nombre del perfil**: extraído del informe PDF (*no* calculado automáticamente — el nombre personalizado del coaching puede diferir del nombre genérico del sistema). Ejemplos: "El Especialista", "El Evaluador Estratégico", "La Guardiana del Orden".
- **Icono** del perfil: sugerido según letras DISC (16 posibles perfiles con íconos).
- Porcentaje poblacional visible junto al perfil (D=3% / I=11% / S=69% / C=17%)
- Estado actual: ☀️ **Luz** o 🌑 **Sombra** — lo actualiza el Arquitecto semanalmente.
- **Temor dominante** (texto): auto-sugerido según letras DISC, editable por el Arquitecto.
- **Señal de sombra** (texto): cómo se ve cuando está fuera de su mejor versión.
- **Plan PRIME** (resumen): qué necesita para ir a su estado óptimo — ingresado desde el informe.
- Historial de cambios de estado (¿cuándo pasó de Luz a Sombra?)
- **📄 Informe PDF adjunto**: el PDF completo del test DISC, accesible con un tap.
- **Alineación rol ↔ perfil** (evaluación del Arquitecto): 🟢 Alta → Mantener / 🟡 Media → Desarrollar / 🔴 Baja → Reubicar
- **KPI principal del rol**: el número único que justifica el salario (del Team Performance Scorecard, S7).
- **Meta semanal del KPI**: el número objetivo.
- Roles ideales sugeridos según perfil: D→Dirección/Expansión/Crisis / I→Ventas/Marketing/Cultura / S→Ops/CS/RRHH / C→Finanzas/Legal/Sistemas

**Recordatorio contextual inteligente:** La app muestra al Arquitecto un hint basado en el temor del colaborador. Ej: *"Recuerda: El temor de Jenny es decidir sin información completa. Si la ves paralizada, pídele una recomendación."*

#### Nivel LOS (N1–N5)
- Nivel actual de cada colaborador por tarea/área
- Meta del mes: ¿a qué nivel debe subir?
- Progreso visual (escalera animada N1→N5)

#### Mapa de Roles
- Misión única del rol (una sola oración)
- 3 tareas clave diarias por rol
- % de tiempo en operativo vs. estratégico

#### Matriz de Autoridad TBM (S7) — Eliminar fatiga de decisión
- 3 niveles de autonomía financiera configurables por el Arquitecto:
  - **N1 — Autonomía Total (Colaborador):** monto máximo reversible que puede gastar sin consultar
  - **N2 — Autonomía Táctica (Líder de Área):** rango en el que decide e informa al reporte semanal
  - **N3 — Aprobación Requerida (Dueño):** monto o decisión irreversible que requiere al Arquitecto
- Los límites son configurables por empresa y visibles para todo el equipo
- Cuando se crea una tarea con costo asociado → la app indica automáticamente qué nivel aplica

#### Mapa de Conexiones y Fricciones DISC

> Fuente canónica: [`METODO_TBM_CANONICO.md`](METODO_TBM_CANONICO.md) §4 (Sesión 2) y la
> constante `TBM_DISC_CRUCES` en `src/lib/tbm-disc-context.ts`. **No confundir con B3+B4**
> (las 3 gráficas clásicas de intensidad: Pública/Núcleo/Espejo) — eso es otra feature,
> bloqueada por falta de fórmula. Esto es el **diagrama relacional + alertas par-a-par**.

**Propósito:** ayudar al Arquitecto a diseñar el equipo desde el temperamento ("Primero el
quién. Luego el qué."). Muestra qué perfiles conectan naturalmente y qué pares son cruzados
(requieren trabajo de comunicación), y alerta cuando esos cruces aparecen entre personas reales
del equipo.

**Diagrama de referencia (rombo):** D arriba · I derecha · S abajo · C izquierda.
- **Conexión natural** → líneas sólidas en el perímetro.
- **Temperamento cruzado** → líneas punteadas en las diagonales.

**Reglas oficiales de pares:**

| Tipo | Pares | Severidad |
|------|-------|-----------|
| Buena conexión natural | D↔C · I↔S · S↔C · I↔D | 🟢 verde / informativo (opcional) |
| Temperamentos cruzados (requieren trabajo) | D↔S · I↔C | 🟡 amarillo / atención |

**Comportamiento esperado de la app:**
- Mostrar el **diagrama de referencia** (rombo con leyenda) en Mi Equipo — panel "Salud del
  equipo" / educativo. También puede aparecer como sección educativa en el resultado del test
  y, si aplica, en el workbook de S2.
- Con **≥2 miembros con DISC cargado**: detectar **pares cruzados entre personas** (ej. líder
  **C** + miembro **I** = cruce I↔C) usando `TBM_DISC_CRUCES` como **fuente de verdad**.
- Mostrar **alerta con severidad** (cruzado = amarillo; conexión natural = verde/informativo
  opcional) y una **sugerencia alineada al método**: diseño de equipo y protocolo de
  comunicación entre esos perfiles — **no** microgestión del perfil individual.
- **Ejemplo de advertencia del método:** equipo de ventas con director **Pensador (C)** y tres
  **Influyentes (I)** → reto de comunicación permanente (I↔C es cruce). Hoy este caso **no
  dispara** alerta.

**Relación con la lógica actual (`detectDangerousCrossings()` en `src/lib/disc.ts`):** hoy usa
**heurísticas de composición** del equipo (equipo homogéneo; ≥2 D sin S; ≥2 I sin C; todo S/C
sin D/I), **no** los pares oficiales. Al implementar:
- **Fuente de verdad nueva:** los pares de `TBM_DISC_CRUCES` (detección par-a-par entre personas).
- **Se mantienen como reglas secundarias de composición:** "equipo homogéneo", "≥2 D sin S",
  "≥2 I sin C", "todo S/C sin motor" (siguen siendo lecturas válidas de salud del equipo).
- **Se complementa, no se borra:** el detector pasa a emitir dos familias de señales —
  *cruces par-a-par* (nuevo, canónico) + *composición* (existente, secundario).

**Dónde se muestra:** vista Mi Equipo (panel "Salud del equipo"); ficha individual (qué perfiles
le resultan cruzados); sección educativa del rombo (test/resultado o workbook S2).

**Criterios de aceptación:**
- [ ] Componente visual del **rombo** (D arriba / I derecha / S abajo / C izquierda) con líneas
      sólidas (conexión natural) y punteadas (cruzados) + leyenda.
- [ ] `detectDangerousCrossings()` (o su sucesor) detecta **pares cruzados entre personas reales**
      según `TBM_DISC_CRUCES` (el caso **C director + 3 I dispara alerta amarilla**).
- [ ] Las reglas de composición existentes se conservan como señales secundarias, documentadas.
- [ ] Cada alerta trae **severidad** + **sugerencia de método** (diseño de equipo / comunicación,
      no microgestión).
- [ ] Copy alineado a nombres canónicos: **D=Dominante, I=Influyente, S=Seguro, C=Pensador**
      (ver divergencia D6 de naming).

**Estado:** ✅ **Hecho (2026-06-22, `5e7a583`).** Rombo `disc-connections-diagram.tsx` + lógica
par-a-par en `lib/disc` (`detectPairCrossings`/`discPairRelation`/`presentPairKeys`) con
`TBM_DISC_CRUCES` como fuente de verdad, integrado en "Salud del equipo". El caso C+3I dispara.
*Follow-up menor:* copy canónico (D6) y rombo educativo en test/workbook S2 (componente reutilizable).

#### Escáner de Sombras (Sesión 3)
- Tabla: Nombre + Perfil DISC + Luz/Sombra + Temor activo + "¿Qué activé como líder?"
- El Arquitecto puede actualizar el estado semanalmente

---

### M4 — Delegación (Pase de Estafeta)

**Propósito:** Sistema de delegación que no permite crear tareas incompletas.

**Flujo de creación de tarea:**
```
Nueva tarea → Checklist de 5 puntos (todos obligatorios) → 
Asignar colaborador → Definir nivel LOS requerido → 
Tarea activa → Alerta 72h → Colaborador actualiza → 
Cierre con Definition of Done
```

**Los 5 puntos del Pase de Estafeta (todos obligatorios):**
1. **El QUÉ** — Definition of Done: ¿cómo luce el éxito? (texto + opción de adjuntar imagen/video)
2. **El POR QUÉ** — Contexto e impacto si sale bien o mal
3. **El CÓMO** — Restricciones: presupuesto, herramientas, límites (qué NO romper)
4. **El CUÁNDO** — Deadline exacto: fecha + hora
5. **El CHEQUEO** — Feedback loop: ¿cuándo revisamos el borrador?

**Regla de negocio crítica:** Si falta cualquiera de los 5 puntos → la tarea no se puede guardar. El error es del líder.

**Escudo Anti-Boomerang:**
- Cuando un Colaborador marca su tarea como "bloqueado" → la app no notifica al Arquitecto directamente
- Primero le pregunta al Colaborador: "¿Cuáles son tus 3 opciones y cuál recomiendas?"
- Solo si el Colaborador no puede resolverlo → se escala al Arquitecto

**Regla del 70%:**
- Al crear una tarea, el Arquitecto puede marcar: "Podría hacerlo yo al 100% pero alguien del equipo puede hacerlo al 70%+"
- Esto genera una alerta si el Arquitecto tiene demasiadas tareas que podría delegar

**Lista de Transferencia Inmediata:**
- Sección separada donde el Arquitecto lista actividades que sigue haciendo él pero debería delegar
- Cálculo automático: "Si tu hora vale $X y pasas Y horas en esto → costo mensual: $Z"

---

### M5 — Feedback S.E.C.

**Propósito:** Constructor de conversaciones de feedback estructurado. Nunca improvisar un feedback.

**Flujo:**
```
Seleccionar colaborador → Elegir tipo (S/E/C) → 
Completar template → Guardar borrador → 
Marcar como "entregado" → Historial
```

**Templates por tipo:**

**S — SOSTENER (Refuerzo positivo):**
> "Noté que hiciste [acción específica]. Eso nos da [beneficio]. Quiero que sostengas ese estándar."

**E — ELEVAR (Reto de crecimiento):**
> "Tu trabajo en [tarea] estuvo bien, pero tú eres un jugador de nivel [X]. Para la próxima quiero que [nueva expectativa]."

**C — CORREGIR (Límite claro):**
> "El comportamiento de [acción negativa] es una falta de respeto al estándar del equipo. Nos cuesta [impacto]. Necesito que corrijas esto inmediatamente."

**Templates sugeridos por perfil DISC:**
- La app sugiere el tono apropiado según el perfil DISC del colaborador
- Ej: para perfil S (Estable) → el feedback C debe ser directo pero sin agresividad; el temor es la no aprobación

**Historial de feedback:**
- Timeline por colaborador
- Balance S/E/C (¿cuándo fue el último feedback positivo?)
- Alerta si lleva 2+ semanas sin feedback de ningún tipo

---

### M6 — Plan 90D (Rocas & Arena)

**Propósito:** Planificación estratégica trimestral. Distinguir lo que escala de lo que consume.

**Componentes:**

#### Clasificador Rocas vs. Arena
- El Arquitecto lista todas sus iniciativas actuales
- Las clasifica: ¿Alta urgencia + bajo impacto? → Arena → va a Delegación (M4)
- ¿Alto impacto + no urgente? → Roca → va al Plan 90D

#### Las Rocas Trimestrales (máx 5)
- Por cada Roca: Iniciativa + Dueño único + Criterio de éxito en el Día 90
- Barra de progreso visual
- Check-in semanal (¿qué avanzó esta semana?)

#### Velocidad de Decisión — Filtro del 70%
- Espacio para registrar: "Decisión que estoy aplazando"
- La app pregunta: "Si aplicas la regla del 70%, ¿cuál sería tu decisión ahora mismo?"
- Historial de decisiones tomadas y su resultado

#### Parqueadero de Ideas
- Tabla: Idea Millonaria + Propuesta por + Fecha + Revisar el Día 91
- **Capacidad máxima: 10 ideas** (del workbook original)
- Prohibido ejecutar hasta el Día 91
- La app muestra un contador: "X días hasta que puedes ejecutar esta idea"
- Al llegar al Día 91 → notificación: "¿Sigue siendo una buena idea? ¿Va a las Rocas del próximo trimestre?"
- > *"El súper poder del líder de alto rendimiento es decirle NO a ideas excelentes para proteger las Rocas."*

#### Protocolo Disagree and Commit
- Registro de decisiones donde hubo desacuerdo interno
- ¿Con quién? ¿Sobre qué? ¿Qué se decidió? ¿Se ejecutó al 100%?

---

### M7 — Workbooks Dinámicos (Sesiones 1–8)

**Propósito:** Convertir los ejercicios estáticos de cada sesión en formularios interactivos que alimentan la base de datos viva de la empresa.

**Lógica:** Las respuestas no se guardan como documentos — se guardan como datos estructurados que el resto de la app usa.

| Sesión | Ejercicio principal | Se convierte en... |
|---|---|---|
| S1 | Diagnóstico Organizacional TBM | → Semáforo del Dashboard (M1) |
| S1 | Los 5 Grandes | → Tareas del día en Rituales (M2) |
| S1 | Protocolo de Delegación | → Checklist del Pase de Estafeta (M4) |
| S2 | Mapeo DISC del equipo | → Perfil del colaborador en M3 |
| S2 | Las 3 Preguntas de la Muerte | → Diagnóstico inicial del Arquitecto |
| S3 | Auditoría A.R.Q.U.I. | → Score de cada pilar en M3 |
| S3 | Escáner de Sombras | → Estado Luz/Sombra en M3 |
| S4 | Auditoría de Energía | → Nivel de energía en Dashboard (M1) |
| S4 | Mi Marcha de 20 Millas | → Hábito diario en Rituales (M2) |
| S5 | Detector de Pecados | → Alerta de disminuidor en M4 |
| S5 | Definition of Done | → Campo en Pase de Estafeta (M4) |
| S6 | Lista de Transferencia Inmediata | → Tareas candidatas a delegar (M4) |
| S6 | Niveles LOS | → Nivel de cada colaborador en M3 |
| S7 | 5 Leading Indicators + Número único por rol | → Dashboard Central (M1) |
| S7 | Matriz de Autoridad TBM (N1/N2/N3) | → Sub-módulo de M3 (Equipo) |
| S8 | Rocas Trimestrales | → Plan 90D (M6) |
| S8 | Parqueadero de Ideas | → Ideas aparcadas (M6) |

**Progreso por sesión:**
- Cada sesión tiene un % de completado
- Las sesiones se desbloquean secuencialmente (no se puede ir a S3 sin completar los ejercicios clave de S1 y S2)
- Compromiso de la semana: cada sesión cierra con un compromiso que queda en el tracker

---

### M8 — Multiplicador de Liderazgo

**Propósito:** Diagnóstico del ROI de talento — si el líder es un Multiplicador (extrae el 97% de la inteligencia del equipo) o un Disminuidor (solo el 48%). Módulo derivado de S5 del programa.

**Concepto central:** *"Los Multiplicadores obtienen el 97% de la inteligencia de su equipo. Los Disminuidores solo el 48%."*

**Pantalla de entrada — Diagnóstico ROI de Talento:**
Antes del diagnóstico formal, el Arquitecto responde una sola pregunta brutal:
> *"¿Cuánto de la capacidad mental y creativa de tu equipo estás utilizando hoy?"*

| Rango | Descripción |
|---|---|
| 0–50% | Solo ejecutan órdenes, yo decido todo |
| 51–80% | Aportan ideas, pero yo tengo la última palabra siempre |
| 81–100% | Toman decisiones complejas sin mí y me sorprenden |

> *Reflexión de la app: "Si marcaste menos del 80%, estás perdiendo dinero en cada nómina."*

**Diagnóstico — Los 3 Pecados del Disminuidor (3 preguntas por pecado, escala 1–4):**

| Pecado | Descripción | Síntoma visible |
|---|---|---|
| 🚨 El Rescatista | Interviene antes de que el equipo resuelva solo | Termina haciendo lo que delegó |
| ⚡ El Marcapasos | Trabaja a un ritmo que nadie puede seguir | El equipo se vuelve espectador |
| 💬 El Respuesta-Rápida | Da la solución antes de que terminen de explicar | Es el que más habla en reuniones |

**Scoring total /36:**
- ≤15 = 🟢 Multiplicador Natural
- 16–24 = 🟡 Disminuidor Accidental (buenas intenciones, patrones que limitan)
- ≥25 = 🔴 Disminuidor en Acción (el equipo usa solo el 48% de su capacidad)

**Las 3 Herramientas del Multiplicador (post-diagnóstico, con retos asignados):**

| Herramienta | Mecánica | Reto semanal |
|---|---|---|
| 🃏 Las Fichas de Póker | 5 fichas por reunión. Cada intervención gasta una. Al acabarse, solo preguntas. | Máximo 5 intervenciones en la próxima reunión |
| ❓ La Pregunta que Desbloquea | Ante cualquier problema: *"¿Tú qué recomiendas?"* — Script: (1) "¿Tú qué piensas?" (2) "¿Cuáles son tus 3 opciones y cuál recomiendas?" (3) "Confío en tu criterio." | 48h sin dar respuestas directas |
| ✅ Definición de "Hecho" | Antes de delegar: formato exacto + fecha/hora + criterios de calidad (A.R.Q.U.I.) | Definir el "Hecho" de la próxima delegación |

**Retos de Implementación (semana del módulo):**
- **Auditoría de Interrupciones (3 días):** El Arquitecto cuenta cuántas veces interrumpe, corrige o da respuestas directas. Total por día (Lunes/Martes/Miércoles). La app provee un contador simple.
- **Experimento de las Preguntas (48 horas):** Solo puedes liderar haciendo preguntas. Prohibido dar afirmaciones directas. La app registra el compromiso y solicita un reporte al cierre.

**Reglas de negocio:**
- El diagnóstico se puede repetir mensualmente (tracking de evolución)
- Si el score es ≥25 → alerta en Dashboard: "Tu equipo opera al 48% de su capacidad"
- Los retos semanales se registran como compromisos en el tracker de implementación
- El score del Multiplicador aparece como métrica en el Dashboard Central

---

### M9 — Diagnósticos & Scorecards

**Propósito:** Módulo de evaluación periódica. Lo que no se mide, no se mejora.

**Diagnósticos disponibles:**

| Diagnóstico | Frecuencia recomendada | Origen |
|---|---|---|
| Diagnóstico Organizacional TBM (8 áreas) | Cada 14 días | S1 |
| Auditoría A.R.Q.U.I. (5 pilares) | Mensual | S3 |
| Auditoría de Energía del Líder | Semanal (autodiagnóstico) | S4 |
| ROI de Talento (% capacidad del equipo) | Mensual | S5 |
| Mapeo DISC del equipo | Al incorporar un miembro o trimestralmente | S2/S3 |

**Histórico y tendencias:**
- Gráficas de evolución de cada score en el tiempo
- Comparativa: "¿Dónde estabas el Día 1 vs. hoy?"
- Exportar reporte PDF de diagnóstico actual

---

### M10 — DC (Asistente IA)

> **Nombre:** el asistente se llama **DC** (nombre visible). "JARVIS" quedó como nombre interno/
> código del subsistema (archivos, componentes, ruta `/api/jarvis`).

> Diseño técnico completo: [`JARVIS_AI_ASSISTANT.md`](JARVIS_AI_ASSISTANT.md). Acá va el
> comportamiento de producto. Estado: chat funcional con streaming + RAG sobre el método (S18.3 /
> RAG R1). Multi-LLM por **OpenRouter**, configurable desde el panel admin.

**Propósito:** un asistente conversacional que ayuda al líder a aplicar el método TBM a su negocio
real — entiende su equipo (DISC, cruces), sus tareas, sus áreas críticas y la metodología, y
responde fundamentado en eso.

**Dónde vive (descubribilidad):**
- Un **orbe azul** ("DC") en el header del dashboard, junto al nombre del usuario.
- Como el usuario no necesariamente sabe qué es, el orbe tiene un **anillo de atención que pulsa
  cada ~7 s** (mientras el chat está cerrado) y, la **primera vez**, un hint de bienvenida
  ("👋 Soy DC, tu asistente…"). Al tocarlo se abre un **panel de chat** (slide-over).

**Comportamiento de respuesta (reglas obligatorias, inyectadas siempre):**
1. **Brevedad** — respuestas cortas y al grano (2–4 frases). Nada de respuestas largas o listados
   extensos salvo que el usuario lo pida.
2. **Cierre con pregunta** — termina SIEMPRE con UNA pregunta breve para descubrir qué necesita
   realmente el usuario y continuar la conversación.
3. **Solo su dominio** — responde únicamente sobre método TBM, liderazgo, equipos, delegación,
   DISC, productividad del líder y el negocio del usuario. Fuera de eso (ej. recetas, deportes,
   trivia) **declina con amabilidad y reencauza** — no responde off-topic.
4. **Formato sobrio** — texto plano y natural; negritas con mucha moderación (1–2 términos), nunca
   frases enteras en negrita.
5. **Naming canónico** — usa siempre LOST (no "LOS"), "Niveles de Delegación" (no "LOS"), ARQI.
6. **No inventa** — solo usa el contexto real provisto (equipo/tareas/método); si le falta un
   dato, lo pide.

**UX del panel:** markdown liviano, respuesta en **streaming** (token a token) con cursor, botón
**Parar**, **copiar** respuesta, **nueva conversación**, textarea que crece, prompts sugeridos,
disclaimer ("puede equivocarse, verificá lo importante"). Cierra con Esc / × / click afuera.

**Configuración (panel admin · god-mode):** proveedor (OpenRouter recomendado / Anthropic), modelo,
API key (cifrada en Vault), system prompt base, temperatura, activar/desactivar, "probar conexión".

**Conocimiento (RAG):** corpus **curado** del método (canónico + material primario de Dilio)
indexado con embeddings `gte-small`; en cada pregunta recupera los fragmentos relevantes y los
inyecta. Pendiente: material **por empresa** (workbooks/informes DISC/Drive) — ver R2.

**Criterios de aceptación:**
- [ ] El orbe se nota (pulso periódico + hint primera vez) y abre el chat al tocarlo.
- [ ] Respuestas breves que terminan en una pregunta.
- [ ] Rechaza pedidos off-topic y reencauza al método/negocio.
- [ ] Sin exceso de negritas; naming canónico (LOST, Niveles de Delegación, ARQI).
- [ ] Usa datos reales del equipo/empresa y cita el método cuando corresponde.

**Pendiente (mejoras futuras):** tool use (que DC *actúe*: crear tareas, generar link DISC),
historial persistente + control de costos, RAG por empresa, modo coach, voz. Ver
`JARVIS_AI_ASSISTANT.md` §12.

---

## 4. FLUJOS DE USUARIO CLAVE

### Flujo 1 — Onboarding (Primera vez)
```
Registro (nombre, empresa, # colaboradores) 
→ Diagnóstico Organizacional TBM (diagnóstico inicial)
→ Configurar equipo (invitar colaboradores, asignar perfil DISC)
→ Definir primera Roca del trimestre
→ Configurar rituales (frecuencia Warm Up / Cool Down)
→ Dashboard activo
```
**Tiempo estimado:** 20–30 minutos

### Flujo 2 — Día típico del Arquitecto
```
09:00 → Pre-game personal (Big Wins + Marcha 20 millas)
→ Iniciar Warm Up (ver entradas del equipo)
→ Validar QUÉ/POR QUÉ de cada Colaborador
→ Día operativo (crear tareas, dar feedback)
→ 18:00 → Cool Down (Victory Log + Reality Check)
```

### Flujo 3 — Delegación de tarea
```
Nueva tarea → Completar 5 puntos del Pase de Estafeta (todos obligatorios)
→ Asignar colaborador + nivel LOS requerido
→ Colaborador notificado → confirma comprensión ("retorno")
→ Alerta automática a 72h → Colaborador actualiza avance
→ Arquitecto revisa borrador → Colaborador cierra con DoD
```

### Flujo 4 — Sesión de workbook
```
Seleccionar sesión (desbloqueada) 
→ Ejercicio interactivo con inputs estructurados
→ Respuestas → alimentan módulos activos de la app
→ Compromiso de la semana guardado en tracker
→ Progreso de sesión actualizado
```

### Flujo 5 — Reunión de 30 min TBM (Formato digital)
```
Iniciar reunión → 
Min 1–10: Victorias (cada miembro ingresa su victoria) →
Min 11–20: Trabas (hechos, no excusas; se crean tareas automáticamente) →
Min 21–30: Acción (Pase de Estafeta para cada tarea) →
Resumen automático → enviado a todos los participantes
```

### Flujo 6 — Feedback S.E.C.
```
Seleccionar colaborador → Ver historial previo (evitar solo dar C)
→ Elegir tipo (S/E/C) → La app sugiere tono según perfil DISC
→ Completar template → Guardar borrador → Practicar en voz alta
→ Marcar "Entregado" → Historial actualizado
```

---

## 5. ARQUITECTURA TÉCNICA

### Fase 1: MVP No-Code (Validación — 0 a 3 meses)
**Objetivo:** Validar la lógica del método con usuarios reales antes de construir código custom.

**Stack recomendado:**
| Herramienta | Uso |
|---|---|
| **Notion** | Workbooks dinámicos (S1–S8), base de datos de tareas, equipo |
| **Airtable** | Scorecards, KPIs, tracking de rituales, datos estructurados |
| **Make (Integromat)** | Automatizaciones: alertas 72h, recordatorios de rituales, notificaciones |
| **Tally o Typeform** | Formularios de Warm Up / Cool Down / Pase de Estafeta |
| **WhatsApp / Telegram** | Notificaciones de rituales y alertas (vía Make) |

**Qué validar en Fase 1:**
- ¿Los usuarios completan los rituales diarios consistentemente?
- ¿El Pase de Estafeta de 5 puntos se usa o se evita?
- ¿El equipo completa el Warm Up o solo el Arquitecto?
- ¿Qué módulo genera más valor inmediato?

### Fase 2: Automatización (3 a 6 meses)
**Stack adicional:**
| Herramienta | Uso |
|---|---|
| **Supabase** | Base de datos PostgreSQL en la nube (reemplaza Airtable) |
| **Retool o Softr** | Frontend semi-custom sobre Supabase sin escribir código |
| **n8n** | Automatizaciones más complejas (reemplaza Make) |
| **Resend** | Emails transaccionales (recordatorios, resúmenes) |

### Fase 3: App Propia (6 a 18 meses)
**Stack recomendado para frontend custom:**
| Capa | Tecnología | Por qué |
|---|---|---|
| **Frontend** | Next.js 14 + TypeScript | React moderno, SSR, excelente DX |
| **Styling** | Tailwind CSS + shadcn/ui | Rápido, consistente, componentes de calidad |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) | BaaS completo, escala sin DevOps |
| **Auth** | Supabase Auth | Email/contraseña + Google OAuth |
| **Notificaciones** | Resend (email) + OneSignal (push) | Rituales diarios requieren push |
| **Mobile** | React Native / Expo | Warm Up es mobile-first (de pie, 15 min) |
| **Hosting** | Vercel (frontend) + Supabase Cloud | Gratis hasta escala significativa |

**Por qué este stack:**
- Next.js + Supabase es el combo más adoptado para SaaS en 2025–2026
- Supabase tiene Row Level Security (RLS) → perfecto para el modelo multi-empresa
- No requiere backend propio → Sebas puede construirlo solo o con 1 dev
- La misma base de datos sirve para web y mobile

---

## 6. MODELO DE DATOS (Entidades principales)

```
Company (empresa)
├── id, name, owner_id, created_at
├── plan (free / pro / enterprise)
└── settings (ritual_frequency, timezone)

User (usuario)
├── id, company_id, name, email, role (arquitecto / colaborador / observador)
├── disc_letters (D/I/S/C), disc_profile_name (texto del informe), disc_icon (emoji)
├── disc_status (pendiente / enviado / completado), disc_pdf_url
├── disc_state (luz/sombra), disc_state_updated_at
├── disc_temor (texto), disc_sombra_signal (texto), disc_prime_plan (texto)
├── los_level (1-5), los_target_level (1-5)
├── kpi_name (texto), kpi_meta_semanal (número)
├── alignment (alta/media/baja), alignment_action (mantener/desarrollar/reubicar)
└── profile_completed_at

Ritual (ritual diario)
├── id, company_id, type (pregame / warmup / cooldown)
├── date, created_by
└── entries[] → RitualEntry

RitualEntry (entrada de Warm Up / Cool Down)
├── id, ritual_id, user_id
├── what, why, blocker (para Warm Up)
├── victory, reality_check, next_day (para Cool Down)
└── validated_by_arquitecto (bool)

Task (tarea delegada)
├── id, company_id, created_by, assigned_to
├── what_dod, why_context, how_constraints, when_deadline, check_loop
├── los_required (1-5), los_current
├── status (pending / in_progress / blocked / done)
└── delegable_flag (bool → alerta Regla 70%)

Feedback (feedback S.E.C.)
├── id, company_id, from_user, to_user
├── type (S/E/C), content
├── disc_tone_used, delivered_at
└── created_at

Scorecard (diagnóstico TBM)
├── id, company_id, user_id, type (tbm_8areas / arqui / energy / roi)
├── scores (JSON: {area: score})
├── total_score
└── completed_at

Rock (Roca del Plan 90D)
├── id, company_id, title, owner_id
├── success_criteria, start_date, end_date (día 90)
├── progress (0-100), status (active / completed / cancelled)
└── weekly_updates[]

IdeaParking (Parqueadero de Ideas)
├── id, company_id, proposed_by
├── idea, rationale
├── parked_at, review_at (parked_at + 90 days)
└── status (parked / promoted_to_rock / discarded)

WorkbookProgress (progreso de sesiones)
├── id, company_id, user_id, session_number (1-8)
├── completed_exercises (JSON)
├── weekly_commitment, commitment_done (bool)
└── completed_at
```

---

## 7. MODELO DE NEGOCIO

### Opciones (para decidir con Dilio)

| Modelo | Descripción | Pros | Contras |
|---|---|---|---|
| **Incluida en el programa** | La app es parte del paquete TBM, sin costo extra | Adopción inmediata, diferenciador del programa | Sin ingresos propios de la app |
| **SaaS mensual** | Suscripción independiente al programa | Ingreso recurrente, escalable | Requiere adquisición propia de usuarios |
| **Freemium** | Gratis hasta X colaboradores / rituales; pago para más | Viral dentro de empresas | Riesgo de que no conviertan |
| **Lifetime (recomendado MVP)** | Pago único para early adopters del programa | Valida disposición a pagar, fondea desarrollo | No recurrente |

### Pricing sugerido para MVP (Fase 1)
- **Early Adopter (alumnos TBM actuales):** $97 USD one-time → acceso lifetime MVP
- **Plan Arquitecto (post-MVP):** $49/mes — 1 empresa, hasta 5 colaboradores
- **Plan Equipo:** $99/mes — hasta 15 colaboradores
- **Plan Empresa:** $199/mes — colaboradores ilimitados + Observador externo

---

## 8. ROADMAP DE DESARROLLO

### Sprint 0 — Fundamentos (Semanas 1–2)
- [ ] Definir respuestas a las 7 preguntas pendientes con Dilio
- [ ] Decidir modelo de negocio
- [ ] Crear design system básico (colores, tipografía, componentes)
- [ ] Configurar repositorio + Supabase inicial

### Fase 1 — MVP No-Code (Semanas 3–10)
- [ ] Semana 3–4: Workbook S1 en Notion/Airtable + Dashboard básico
- [ ] Semana 5–6: Rituales (Warm Up / Cool Down) vía Tally + Make
- [ ] Semana 7–8: Pase de Estafeta (5 puntos obligatorios) en Airtable
- [ ] Semana 9: DISC del equipo + estados Luz/Sombra
- [ ] Semana 10: Plan 90D + Parqueadero de Ideas
- [ ] **Milestone:** Lanzar con 3–5 empresas piloto (alumnos TBM)

### Fase 2 — MVP Web App (Semanas 11–22)
- [ ] Semana 11–12: Setup Next.js + Supabase + Auth
- [ ] Semana 13–14: Dashboard Central + Rituales
- [ ] Semana 15–16: Módulo Equipo (DISC + LOS)
- [ ] Semana 17–18: Delegación (Pase de Estafeta)
- [ ] Semana 19–20: Feedback S.E.C. + Plan 90D
- [ ] Semana 21–22: Workbooks S1–S4 dinámicos
- [ ] **Milestone:** Beta cerrada con 10–20 empresas

### Fase 3 — App Completa (Semanas 23–40)
- [ ] Workbooks S5–S8 dinámicos
- [ ] App móvil (React Native / Expo)
- [ ] Históricos y tendencias (gráficas de evolución)
- [ ] Exportación de reportes PDF
- [ ] Integración Google Calendar (rituales)
- [ ] Push notifications (recordatorios de rituales)
- [ ] **Milestone:** Lanzamiento público

---

## 9. PRINCIPIOS DE DISEÑO (UX/UI)

1. **Fricción intencional:** El sistema no permite saltarse pasos. No puedes delegar sin los 5 puntos. No puedes cerrar el Cool Down sin el Victory Log. La fricción ES el método.

2. **Mobile-first:** El Warm Up se hace de pie, en 15 minutos. La interfaz principal debe funcionar perfectamente en celular.

3. **Un solo foco a la vez:** No mostrar todo al mismo tiempo. Cada pantalla tiene una sola pregunta o acción principal.

4. **Datos vivos, nunca documentos muertos:** Cada campo que el usuario completa alimenta algo visible. El usuario siempre sabe para qué sirve lo que ingresa.

5. **Progreso visible:** Barras de progreso, porcentajes, "hace X días sin ritual" — el usuario siempre sabe dónde está.

6. **Lenguaje TBM consistente:** Usar exactamente los términos del método (Arquitecto, Pase de Estafeta, Rocas, Arena, Luz/Sombra). No traducir a términos genéricos.

7. **Celebración de victorias:** Victory Log, completar una sesión, subir un nivel LOS → pequeñas celebraciones visuales. El método lo dice: el cerebro necesita victorias.

---

## 10. PREGUNTAS ABIERTAS — ✅ RESUELTAS por Dilio (ver [RESPUESTAS_DILIO.md](./RESPUESTAS_DILIO.md))

> Mayo 2026 — Las 18 preguntas fueron respondidas oficialmente por el autor. Todas las de esta sección quedan resueltas.

| # | Pregunta | Resolución oficial (ref.) |
|---|---|---|
| ~~1~~ | ~~¿Qué contiene la Sesión 7?~~ | ✅ BOS: Dashboard, Scorecard, Matriz de Autoridad, Reunión de Silencio |
| ~~2~~ | ~~¿Individual o grupal (cohort)?~~ | ✅ **100% individual, SIN cohorts** [N3]. No se construye módulo de cohorts ni `cohort_id`. |
| ~~3~~ | ~~¿Evaluación/certificación al final?~~ | ✅ **Sin graduación. Ciclo continuo de 90 días** [L4]. Indicador financiero YoY como termómetro de valor. |
| ~~4~~ | ~~¿Acceso a Dilio (coaching 1:1) en la app?~~ | ✅ **Sí — Panel Super Coach en 3 capas** [N1] + nota de coaching vinculada a un dato. |
| ~~5~~ | ~~¿Stack tecnológico preferido?~~ | ✅ Next.js 14 + TypeScript + Tailwind + Supabase + Vercel (ver SPRINTS.md). |
| ~~6~~ | ~~¿Herramienta actual (Notion/Airtable) a integrar?~~ | ✅ Build custom. Integración opcional con Drive/Loom para "Activos del Sistema" [B3]. |
| ~~7~~ | ~~¿Modelo de negocio?~~ | ✅ **Suscripción anual:** Bundle con mentoría (`mentored`) vs. Standalone (`independent`) [N2][N4]. |

---

## 11. BUGS / PENDIENTES DE REVISIÓN

> Problemas detectados que **no** son decisiones de diseño (esos van en
> [PENDIENTES_REVISION.md](./PENDIENTES_REVISION.md)) sino defectos a corregir.

### 🟡 BUG (MITIGADO) · Colaboradores que no logran conectarse — reporte del 25/07

**Estado:** **mitigado el 2026-07-29** (`bd93280`, S21·E1) · **causa raíz aún sin
diagnosticar**. Reportado por Dilio en la Meet del **2026-07-25**.

> **Qué se arregló.** Se encontró y cerró un agujero estructural: `sendTeamInvite`
> **descartaba el link** cuando el proveedor de correo respondía OK
> (`equipo/actions.ts:147` → `return { ok: true, via: "email" }`, sin `link`). El fallback de
> copiar link solo se renderizaba **cuando el envío fallaba**. O sea que el único escenario
> sin salida era justamente el de Dilio: el mail "sale bien" pero no llega (spam, filtro
> corporativo, greylisting) — y el panel de pendientes solo ofrecía *Reenviar* (otro mail que
> tampoco iba a llegar) y *Cancelar*.
>
> Ahora el link vuelve **siempre**, está disponible en el modal, en cada invitación pendiente
> (`getInviteLink`, on-demand) y en la respuesta de DC. **El alta ya no depende del correo.**

> **Qué sigue abierto.** El **diagnóstico de por qué el correo no llega**: falta el caso
> concreto de **Juanjo** (chat "Plataformas") y la revisión de deliverability — SPF / DKIM /
> DMARC y logs de Resend por destinatario. Ya **no es bloqueante** para dar de alta gente,
> así que baja de prioridad, pero no está resuelto.
**Rol afectado:** colaboradores invitados a una empresa (caso concreto: el equipo de Dilio).

**Reporte textual:** *"los chicos me estaban contando que están teniendo problemas para
conectarse al sistema. Pregúntale a **Juanjo** ahí en el chat de plataformas qué le pasó,
por qué no se pudo conectar. No sé si es que no le llega el correo."*
Hipótesis de Sebas en la misma llamada: *"capaz que va a spam"*.

**⚠️ Por qué NO está cubierto por el fix de abajo:** el fix de token propio (`0763fff`) se
mergeó el **2026-07-23**; este reporte es del **2026-07-25**, **dos días después**. Es un
fallo distinto o un residuo no cubierto — **no asumir que ya está arreglado**.

**Sospechas a descartar, en orden:**
1. **Deliverability del dominio de envío** — SPF / DKIM / DMARC, reputación, y si el correo
   está cayendo en spam o siendo rebotado. Revisar logs de Resend por destinatario.
2. **La migración `supabase/migration_invitations_token_accept.sql` quedó SIN APLICAR**
   (ver el detalle del bug resuelto, abajo: la MCP de Supabase pedía re-auth). Sin ella no
   corre la expiración `pending → expired` ni el índice `(company_id, status)`. El código no
   depende de ella, pero conviene aplicarla antes de seguir diagnosticando.
3. **Caso de datos específico** — email ya vinculado a otra empresa, o invitación vieja
   colisionando con el flujo nuevo.

**Acciones:**
- Conseguir con **Juanjo** el email exacto que falló y **reproducir el alta end-to-end**
  antes de tocar código.
- **Fallback estructural:** botón "Copiar link de invitación" en `/equipo` — el Arquitecto
  lo manda por WhatsApp y el alta deja de depender del correo. *Cierra la clase entera de
  fallos, no solo este caso.*
- **Instrumentar** el estado de envío por invitación, para que el próximo reporte sea
  diagnosticable sin adivinar.

---

### ✅ BUG (RESUELTO) · Invitación de equipo se quedaba en "pendiente"

**Estado:** detectado 2026-07-23 · **resuelto 2026-07-23** (rama `fix/invitaciones-token-robusto`).
**Rol afectado:** Arquitecto invitando colaboradores (`/equipo` → "Invitar colaborador").
**Síntoma:** el Arquitecto invitaba a un colaborador y este nunca aparecía en el equipo;
la fila quedaba en `invitations.status='pending'` para siempre.

**Fix aplicado (raíz + UI):**
- **Token propio en vez de OTP.** `sendTeamInvite` ahora arma el link
  `/accept-invite?token=<invitations.token>` (unique, 256-bit, 7 días de `expires_at`,
  reusable e inmune a pre-fetch). Se eliminaron `generateLink`/`signInWithOtp`/
  `inviteUserByEmail`. → causas #1 y #5.
- **Aceptación sin sesión previa.** `/accept-invite` valida el token al montar
  (`getInviteInfo`) y en el submit un server action (`acceptTeamInvite`, admin/service_role)
  crea o actualiza el usuario con la contraseña elegida (`createUser({email_confirm:true})`),
  vincula el perfil (verificando fila afectada) y marca `accepted`; el browser hace
  `signInWithPassword` + nav dura a `/dashboard`. → causa #6.
- **Panel de invitaciones pendientes** en `/equipo` con **Reenviar** y **Cancelar**
  (`components/equipo/pending-invites.tsx` + `cancelInvite`). → causa #2.
- **Email ya vinculado** a otra empresa → mensaje claro (`code:'already_linked'`). → causa #4.
- **Guard en `/register`** (`checkPendingInvite`): si el email tiene invitación pendiente,
  redirige a `/accept-invite` en vez de crear empresa nueva. → causa #3.
- **Expiración** automática (`pending → expired`) en el cron diario + migración
  `supabase/migration_invitations_token_accept.sql` (policy DELETE del arquitecto + índice
  `company_id,status`). ⚠️ **La migración quedó pendiente de aplicar** (la MCP de Supabase
  pedía re-auth); el código no depende de ella (`cancelInvite` usa admin client filtrado).

<details>
<summary>Diagnóstico original (2026-07-23)</summary>

**Síntoma:** el Arquitecto invita a un colaborador y este nunca aparece en el equipo;
la fila queda en `invitations.status='pending'` para siempre.

**Flujo actual:** un solo botón (`InviteModal`) dispara `sendTeamInvite()`
(`apps/web/src/app/(dashboard)/equipo/actions.ts`), que tiene 4 caminos de entrega
según la config de correo: (1) Resend + `generateLink` magic link **[el de producción hoy]**,
(2) `signInWithOtp`, (3) `admin.inviteUserByEmail`, (4) link manual. Quien acepta pasa por
`/accept-invite`, que setea contraseña, hace `update profiles set company_id, role='colaborador'`
(autorizado por el trigger `enforce_profile_role_company`, Caso B) y marca la invitación
`accepted`. El colaborador solo aparece en el roster cuando su `profiles.company_id` queda
seteado (el roster se arma solo desde `profiles`, no desde `invitations`).

**Causas encontradas (orden de impacto):**

1. **🔴 Magic link de un solo uso y ~1 h de TTL, quemado por pre-fetch de email.**
   `/auth/confirm` (`route.ts`) hace `verifyOtp`, que consume el token en la primera
   petición. SafeLinks (Outlook), antivirus y proxies de Gmail **pre-abren** los links y
   consumen el token → cuando el usuario real hace clic, ya está usado → sin sesión →
   `error=invalid_link` → no puede completar → la invitación **nunca** pasa a `accepted`.
2. **🔴 No existe NINGUNA UI de invitaciones pendientes** (ni en `/equipo` ni en admin).
   El roster sale solo de `profiles`; las `invitations` en `pending` son invisibles y no
   hay forma de **reenviar** ni **cancelar**. El bug se vuelve indiagnosticable.
3. **🟠 Colisión con auto-registro (`/register`).** Si el invitado se anota por su cuenta
   con el mismo email, crea su propia empresa como `arquitecto` y la invitación queda
   huérfana en `pending` (y `/accept-invite` luego lo bloquea por ser arquitecto/owner).
4. **🟠 Email ya vinculado a otra empresa.** El trigger Caso B exige `old.company_id is null`;
   invitar a alguien que ya está en otra empresa hace fallar el `update` (excepción `42501`)
   → accept rompe → queda `pending`, sin mensaje claro.
5. **🟠 Camino OTP sin dominio verificado** usa `emailRedirectTo=/accept-invite` directo,
   salteando `/auth/confirm`; `/accept-invite` no hace `exchangeCodeForSession` → probable
   "No hay sesión activa" → pendiente. Latente (prod usa Resend).
6. **🟡 `/accept-invite`** no verifica filas afectadas en el `update profiles` ni chequea
   `invitation.status` antes de aceptar.

**Recomendación (a evaluar):** (1) panel de invitaciones pendientes con reenviar/cancelar;
(2) usar token propio de `invitations` (ya existen `token` y `expires_at`, 7 días) validado
server-side en vez del OTP de 1 h; (3) manejar email ya registrado/ya vinculado con mensaje
claro; (4) detectar invitación pendiente en `/register` y redirigir a `/accept-invite`.

</details>

> Ver análisis operativo relacionado en [QA_INVITACIONES_2026-06.md](./QA_INVITACIONES_2026-06.md).

---

*Documento generado en Fase ARCHITECTURE — The Business Multiplier App*  
*Próximo paso: Validación con Dilio → Ejecución (Sprint 0)*
