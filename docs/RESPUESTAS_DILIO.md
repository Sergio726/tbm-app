# RESPUESTAS_DILIO.md — Fuente de Verdad Oficial
## The Business Multiplier App — Validación de Lógica de Negocio (Sprint 0)

**Autor:** Dilio Donado — creador del framework TBM
**Fecha:** Mayo 2026
**Estado:** ✅ 18/18 preguntas respondidas
**Regla:** Este documento **reemplaza toda interpretación previa**. Ante cualquier conflicto entre los docs de análisis (HALLAZGOS, DISCOVERY, SPEC) y este archivo, **gana este archivo**. Lo no cubierto aquí se consulta con el autor antes de implementar.

> Prioridad: 🔴 CRÍTICO (bloquea desarrollo) · 🟠 ALTA (módulos clave) · 🟡 MEDIA (UX/features) · 🔵 NEGOCIO (modelo comercial)

---

## Inconsistencias entre sesiones — resueltas

### 🔴 I1 — Pase de Estafeta (S6) vs. Protocolo de Delegación (S1)
El protocolo **definitivo es el de S6**. S1 es solo la introducción conceptual (se planta la semilla). El módulo de Delegación se construye **sobre S6**.
Protocolo oficial (5 puntos): (1) **QUÉ** — resultado claro con DoD, no tarea vaga. (2) **POR QUÉ** — contexto y propósito. (3) **CÓMO** — restricciones, presupuesto, formato, referencias. (4) **CUÁNDO** — deadline con hora y canal de entrega. (5) **FEEDBACK LOOP** — check-in antes del vencimiento.

### 🔴 I2 — 3 KPIs (S1) vs. 5 Leading Indicators (S7)
Es el **mismo sistema en dos momentos**. Flujo único de la app:
**Rocas 90D → Los 5 Grandes (noche) → War Up (mañana, 5 tareas alineadas) → Dashboard (medición semanal).**
**REGLA CRÍTICA:** todo lo que no esté alineado a las Rocas va al **Parking Lot**, no al día de hoy. El Dashboard de 5 Leading Indicators es la capa de medición organizacional de esas Rocas. El Parking Lot es un módulo necesario.

### 🔴 I3 — Three Big Wins vs. Los 5 Grandes
Herramientas **distintas en momentos distintos del mismo día**:
- **LOS 5 GRANDES** = planificación estratégica **NOCTURNA**. 5 prioridades del **negocio** para el día siguiente, alineadas a las Rocas. Se hacen la noche anterior.
- **3 BIG WINS** = visualización **personal MATUTINA**. Parte del Pre-Game. 3 victorias personales que el Arquitecto se propone para sí mismo ese día.
Secuencia en la app: noche → Los 5 Grandes · mañana → Pre-Game con 3 Big Wins.

### 🔴 I4 — "Team Performance Scorecard": dos herramientas con el mismo nombre
Son **DOS herramientas distintas**. Deben usar **nombres distintos en toda la UI**:
- **DIAGNÓSTICO ORGANIZACIONAL TBM (S1):** diagnóstico de 8 áreas, escala 1-5. Score total < 25 = urgente. Uso: diagnóstico inicial.
- **TEAM PERFORMANCE SCORECARD (S7):** KPI único por colaborador. Si no puedes definir el propósito de un cargo y medirlo con un número, ese puesto es un despropósito. Uso: seguimiento semanal individual.

### 🟠 I5 — Tres sistemas de niveles de autonomía
Son **tres lentes complementarios** (ninguno reemplaza a otro):
- **ARQI / Rights (S3):** quién puede decidir qué, **tarea por tarea**. 3 niveles: **Informar / Consultar / Delegar**. Se usa AL ASIGNAR una tarea.
- **LOS — 5 Niveles (S6):** madurez del colaborador. **Cadete → Investigador → Recomendador → Ejecutor → Partner/Socio**. Se usa AL EVALUAR el desarrollo de una persona.
- **Matriz de Autoridad (S7):** límites de autorización por monto/tipo. **Operativo / Táctico / Estratégico** (ej. <$100 / $100-$1.000 / >$1.000). Se usa AL DEFINIR qué decisiones requieren aprobación.

---

## Brechas de contenido — completadas

### 🔴 B1 — El Pulso del Dinero (S4)
**Concepto filosófico**, no módulo financiero. La rentabilidad vive de la **constancia diaria** (Amundsen vs. Scott / "Marcha de las 20 millas"). Define tu Polo Sur de 90 días y camina 20 millas diarias hacia él. **No requiere módulo financiero propio** — es el marco conceptual de S4 que sustenta los rituales.

### 🟠 B2 — Sesiones de Escape (formato ESC) = metodología 3 Streaks
- **Streak 1 — Yo lo hago, tú observas:** el líder demuestra; no se suelta hasta que domina.
- **Streak 2 — Tú lo haces, yo acompaño:** la persona ejecuta; se permite el error.
- **Streak 3 — Tú lo haces, yo solo superviso:** autonomía total con check-in ligero.
Si en Streak 2 vuelve el error → se regresa a Streak 1. El registro de los 3 Streaks **protege al líder**. El feedback ESC es para **APRENDIZAJE**, no para mostrar cumplimiento del Scorecard (el Scorecard mide rendimiento; el ESC construye capacidad).

### 🟠 B3 — Activos del Sistema (repositorio de conocimiento)
**Sí requiere módulo** de repositorio dentro del BOS. El líder graba un proceso **una sola vez** → queda disponible 24/7 (activo que trabaja sin el líder). Se actualiza **solo cuando el proceso cambia**. Puede integrar Drive/Loom; lo clave es registrar qué procesos están documentados, dónde y cuándo se actualizaron.

### 🟠 B4 — El Reporte Semanal
Es el **cierre de semana del viernes**, integrado al **Cool Down**. Celebración de victorias o reflexión sobre derrotas — ritual de cultura, no reporte burocrático. La app lo **genera automáticamente** (no manual).

### 🟡 B5 — La Hoja de Restauración (Anexo 3, S1)
**NO va en la app.** No es parte del BOS TBM.

---

## Lógica de negocio y flujos

### 🔴 L1 — Invalidar una entrada del War Up
El colaborador **sí recibe notificación**. Pero el War Up es un ritual **EN VIVO, DE PIE, en tiempo real**: la corrección ocurre **en el momento, frente al equipo**. La app debe soportar el flujo en vivo (sala tipo stand-up digital donde el líder valida/invalida en vivo) — **NO** un formulario asíncrono que se revisa después. La notificación es para el registro; la corrección real es presencial.

### 🟠 L2 — Modo solopreneur
**Sí existe.** Sistema **completo, nada deshabilitado.** El solopreneur aprende a operar el sistema solo; cuando contrate a su primer colaborador, el sistema ya le es familiar. La interfaz se adapta a uso individual pero todas las herramientas están disponibles.

### 🟡 L3 — Desbloqueo de sesiones
**Híbrido:** ritmo base **una sesión por semana** (mínimo 7 días — el cambio de comportamiento necesita implementación, no solo lectura). **Excepción:** si completa todos los ejercicios antes, puede **"Solicitar avance anticipado"**; el sistema lo desbloquea **automáticamente al 100%** de completitud, sin aprobación del coach.

### 🟡 L4 — ¿Graduación o ciclo continuo?
**Ciclo continuo** de sprints de 90 días. **Sin graduación.** Al terminar S8 inicia un nuevo ciclo trimestral, indefinidamente. **Indicador financiero único:** facturación del **mismo mes del año anterior vs. mes actual** (muestra la promesa de 15-30% de crecimiento). Al completar el primer ciclo: celebración + activación automática del segundo.

---

## Arquitectura del negocio

### 🔵 N1 — Acceso del autor a los datos (Vista Super Coach, 3 capas)
- **Capa 1 — Vista general:** semáforo de salud por alumno (🟢🟡🔴), filtro "Solo mostrar rojos", columnas nombre/sesión actual/último acceso/estado. Saber en 30 s a quién llamar hoy.
- **Capa 2 — Deep dive por alumno:** Rocas y % cumplimiento, Dashboard de 5 KPIs con semáforos, consistencia en rituales (% días), indicador financiero YoY, tamaño del equipo y niveles LOS.
- **Capa 3 — Intervención directa:** nota de coaching enviada al alumno, vinculada a un dato específico, visible en su app.
**Sin ranking** entre alumnos — cada empresa va a su ritmo. El valor está en saber quién necesita intervención.

### 🔵 N2 — Relación Coach → Alumno (dos roles desde el registro)
- **Alumno TBM (`mentored`):** con visibilidad del coach (aparece en panel Super Coach, recibe notas).
- **Usuario Independiente (`independent`):** self-service, sin visibilidad del coach.
El tipo de acceso se define en el registro y determina la visibilidad.

### 🔵 N3 — ¿Cohorts o individual?
**100% individual.** Cada empresa avanza a su propio ritmo. **NO se construye módulo de cohorts**, ni benchmarks entre alumnos, ni espacios de comunidad. ⚠️ Esto **anula** los hallazgos previos (HALLAZGOS_FASE1) que pedían `cohort_id` y soporte multi-cohorte.

### 🔵 N4 — Modelo comercial
**Suscripción anual**, dos versiones: **Bundle con mentoría TBM** (precio con descuento, `mentored`) y **Sistema Independiente** (precio sin descuento, `independent`). La mentoría es el canal de adquisición; el standalone es el producto de escala.

---

## Impacto en el código / esquema (ya verificado contra el repo)

| Tema | Estado en el repo | Acción |
|---|---|---|
| LOS niveles (I5) | `LOS_NAMES` ya = Cadete/Investigador/Recomendador/Ejecutor/Socio | ✅ Sin cambios |
| Cohorts (N3) | `schema.sql` NO usa `cohort_id` (modelo por empresa) | ✅ Sin cambios — limpiar docs de análisis |
| Diagnóstico vs. Scorecard (I4) | Dashboard usa "Diagnóstico Organizacional TBM" | ✅ Mantener nombres distintos en toda la UI |
| War Up en vivo (L1) | `ritual_configs` tiene `war_up_deadline` (modo async) | ⚠️ El modo en vivo (Realtime) es el primario; el async es secundario para equipos remotos |
| Dos roles (N2) | `profiles.role` existe; falta `access_type` (`mentored`/`independent`) | 🔜 Agregar `access_type` al schema (Sprint 0/9) |
| Super Coach (N1) | No existe `coaching_notes` ni rol `coach` | 🔜 Sprint 9 |
| Activos del Sistema (B3) | No existe `process_assets` | 🔜 Sprint 6 |

---

*Fuente: documento oficial "Respuestas al Equipo de Desarrollo — Validación de Lógica de Negocio (Sprint 0)", Dilio Donado, Mayo 2026.*
