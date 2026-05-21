# PLAN DE ANÁLISIS — Material de Dilio Donado
## The Business Multiplier App — Fase de Inteligencia Profunda

**Fecha:** Mayo 2026  
**Objetivo:** Procesar sistemáticamente toda la información de Dilio sin perder nada relevante para el desarrollo de la app. Cada pieza de información se clasifica, se contrasta con lo que ya sabemos, y se registra su impacto en DISCOVERY.md, SPEC.md o SPRINTS.md.

---

## Sistema de Clasificación Universal

Cada hallazgo que encontremos durante el análisis se etiqueta con:

| Tag | Significado |
|-----|------------|
| 🟢 **CONFIRMA** | Valida algo que ya teníamos en DISCOVERY/SPEC — sin cambios |
| 🟡 **ACTUALIZA** | Corrige o amplía algo que teníamos incompleto o mal |
| 🔴 **NUEVO** | Información que no teníamos — debe agregarse |
| ⚡ **RESPONDE** | Resuelve directamente una de las 18 preguntas enviadas a Dilio |
| 🏗️ **IMPACTA SPEC** | Requiere cambio en la arquitectura o lógica de negocio de la app |
| 🚨 **CRÍTICO** | Cambia algo fundamental — debe revisarse antes de codear |

---

## Archivos a Analizar — Inventario Completo

### PRIORIDAD 1 — Documentos Estratégicos (Procesar primero)
Estos definen el método completo. Son la fuente más confiable.

| # | Archivo | Por qué es prioritario | Estado |
|---|---------|----------------------|--------|
| 1 | `ESTRUCTURA COMPLETA TBM` (Spreadsheet) | Tiene el propósito y pregunta clave de CADA sesión — el "esqueleto oficial" del método | ⏳ Pendiente |
| 2 | `FEEDBACK TBM` (Google Doc - Kathe Jaimes) | Observaciones editoriales críticas, incluyendo que el Workbook 8 tiene cosas repetidas | ⏳ Pendiente |
| 3 | `SESION 1. Como-dejar-de-ser-un-lider-caro.pdf` | Presentación actualizada S1 — versión más reciente del contenido | ⏳ Pendiente |
| 4 | `SESION 2. Arquitectura-de-Equipos-Autonomos.pdf` | Presentación actualizada S2 | ⏳ Pendiente |
| 5 | `SEGUIMIENTO DE IMPLEMENTACIONES` (Spreadsheet) | Muestra el estado real de los alumnos en TBM1, TBM2, TBM3 — datos de uso real | ⏳ Pendiente |

### PRIORIDAD 2 — Workbooks (Comparación versión original vs. corregida)
El objetivo aquí es **detectar diferencias** entre la versión original (PDF) y las correcciones (Google Doc).

| # | Original (PDF) | Corrección (Google Doc) | Sesión | Estado |
|---|----------------|------------------------|--------|--------|
| 6 | `WORKBOOK SESION 1.pdf` | `WORKBOOK 1. DIAGNOSTICO Y SESION 1 (actualizado).pdf` | S1 | ⏳ Pendiente |
| 7 | `WORKBOOK SESION 2.pdf` | `CORRECCIONES WORKBOOK SESION 2` | S2 | ⏳ Pendiente |
| 8 | `WORKBOOK SESION 3.pdf` | `CORRECCIONES WORKBOOK SESION 3` | S3 | ⏳ Pendiente |
| 9 | `WORKBOOK SESION 4.pdf` | `CORRECCIONES WORKBOOK SESION 4` | S4 | ⏳ Pendiente |
| 10 | `WORKBOOK SESION 5.pdf` | `CORRECCIONES WORKBOOK SESION 5` | S5 | ⏳ Pendiente |
| 11 | `WORKBOOK SESION 6.pdf` | `CORRECCIONES WORKBOOK SESION 6` | S6 | ⏳ Pendiente |
| 12 | `WORKBOOK SESION 7.pdf` | `CORRECCIONES WORKBOOK SESION 7` | S7 | ⏳ Pendiente |
| 13 | `WORKBOOK SESION 8.pdf` | `CORRECCIONES WORKBOOK SESION 8` | S8 | ⏳ Pendiente |

### PRIORIDAD 3 — Informes DISC
Nos dan el modelo exacto de cómo Dilio estructura cada informe — esto define la UX del módulo Mi Equipo.

| # | Archivo | Persona | Perfil | Estado |
|---|---------|---------|--------|--------|
| 14 | `INFORME DISC SEBASTIAN GARCIA.pdf` | Sebas (nosotros) | El Especialista (S) | ⏳ Pendiente |
| 15 | `DISC Dilio Donado.html` | Dilio | Por determinar | ⏳ Pendiente |
| 16 | `INFORME DISC JENNY MORALES.pdf` | Jenny (alumna TBM2) | El Evaluador Estratégico (IC) | ⏳ Pendiente |
| 17 | `INFORME DISC ANGELICA VELEZ.pdf` | Angélica (alumna TBM1) | El Alentador (DI) | ⏳ Pendiente |
| 18 | `INFORME DISC SANDRA MUNOZ.pdf` | Sandra (alumna TBM1) | La Guardiana del Orden (SC) | ⏳ Pendiente |

### PRIORIDAD 4 — Material de Referencia / Contexto
Complementan la comprensión pero no cambian la arquitectura.

| # | Archivo | Valor | Estado |
|---|---------|-------|--------|
| 19 | `NOTES SESION 2 ARQUITECTURA DE EQUIPOS AUTONOMOS.pdf` | Notas expandidas de S2 | ⏳ Pendiente |
| 20 | `TEST-DE-LIDERAZGO-JIM-COLLINS.pdf` | Herramienta de diagnóstico de nivel de liderazgo | ⏳ Pendiente |
| 21 | `Colaves Mesa Liderazgo Parte 1 (transcripcion).pdf` | Ejemplo de coaching de Dilio en acción | ⏳ Pendiente |
| 22 | `Colaves Sesion Liderazgo Parte 2 (transcripcion).pdf` | Continuación — lenguaje y método real de Dilio | ⏳ Pendiente |
| 23 | `DISC Software.xls` | El software original del test DISC | ⏳ Pendiente |

### PRIORIDAD 5 — Videos (S1–S8)
No son legibles directamente, pero si hay transcripciones disponibles las procesamos. Los videos son el método en vivo.

| # | Archivo | Sesión | Tamaño | Estado |
|---|---------|--------|--------|--------|
| 24 | `VIDEO SESION 1.MOV` | S1 | ~3.6GB | Ver si hay transcripción |
| 25 | `VIDEO SESION 2.MOV` | S2 | ~4.5GB | Ver si hay transcripción |
| 26 | `VIDEO SESION 3.MOV` | S3 | ~1.5GB | Ver si hay transcripción |
| 27 | `VIDEO SESION 4.MOV` | S4 | ~1.4GB | Ver si hay transcripción |
| 28 | `VIDEO SESION 5.mp4` | S5 | ~1.4GB | Ver si hay transcripción |
| 29 | `VIDEO SESION 6.MOV` | S6 | ~1.1GB | Ver si hay transcripción |
| 30 | `VIDEO SESION 7.MOV` | S7 | ~0.9GB | Ver si hay transcripción |
| 31 | `VIDEO SESION 8.mp4` | S8 | ~1.8GB | Ver si hay transcripción |

---

## Fases del Análisis

### FASE 1 — Mapeo Estratégico (½ sesión)
**Qué hacemos:** Leer los 5 documentos de Prioridad 1.  
**Output:** Lista de hallazgos clasificados (🟢🟡🔴⚡🏗️🚨) en `HALLAZGOS_FASE1.md`  
**Pregunta guía:** *¿El esqueleto del método que tenemos en DISCOVERY.md es correcto y completo?*

Tareas específicas:
1. Leer ESTRUCTURA COMPLETA TBM → extraer propósito + pregunta clave de cada sesión → comparar con DISCOVERY.md
2. Leer FEEDBACK TBM → identificar observaciones críticas → clasificar cuáles impactan la app
3. Leer SEGUIMIENTO DE IMPLEMENTACIONES → entender qué tan avanzados están los alumnos reales
4. Leer presentaciones S1 y S2 → extraer cualquier herramienta o concepto no registrado

**Criterio de completitud:** Ninguna sección del método puede quedar sin un propósito y pregunta clave documentados.

---

### FASE 2 — Auditoría de Workbooks (1 sesión)
**Qué hacemos:** Comparar versión original vs. correcciones de cada Workbook.  
**Output:** `WORKBOOK_DELTA.md` — tabla de diferencias por sesión  
**Pregunta guía:** *¿Qué cambió entre la versión que analizamos y la versión corregida?*

Para cada workbook (S1–S8):
- ¿Se agregaron ejercicios nuevos?
- ¿Se eliminaron herramientas?
- ¿Cambió el orden de las partes?
- ¿Hay nuevos conceptos nombrados?
- ¿El Pase de Estafeta sigue siendo 5 puntos? ¿Cuáles exactamente?
- ¿El modelo SEC sigue siendo 3 partes?
- ¿Las Rocas siguen siendo máximo 5?

**Foco especial en S8:** El FEEDBACK de Kathe indica que tiene cosas repetidas — necesitamos identificar exactamente qué.

---

### FASE 3 — Análisis DISC Profundo (½ sesión)
**Qué hacemos:** Estudiar los informes DISC reales para definir exactamente qué datos captura la app y cómo los muestra.  
**Output:** Actualización de la sección Mi Equipo en SPEC.md  
**Pregunta guía:** *¿Qué campos, secciones y lenguaje usa Dilio en sus informes DISC? ¿La app los replica fielmente?*

Para cada informe DISC:
1. ¿Cuántas secciones tiene? ¿Qué se llama cada una?
2. ¿Qué información se muestra en Luz? ¿En Sombra?
3. ¿Cómo se llama el "nombre del perfil" en cada caso?
4. ¿Qué es el "Plan PRIME"? (concepto nuevo que encontramos)
5. ¿Qué diferencia hay entre el informe individual vs. el grupal?

Leer el DISC de Dilio es especialmente importante: nos dice cómo funciona el coach, qué fortalezas tiene y cómo debería estar diseñada su vista en la app.

---

### FASE 4 — Resolución de las 18 Preguntas (½ sesión)
**Qué hacemos:** Con toda la información recopilada, ir pregunta por pregunta del `Consulta_Tecnica_Dilio_TBM.docx` y marcar cuáles ya tienen respuesta.  
**Output:** `PREGUNTAS_RESUELTAS.md` — estado actualizado de las 18 preguntas  
**Pregunta guía:** *¿Cuántas de las 18 preguntas ya podemos responder sin esperar a Dilio?*

Preguntas críticas a resolver (las más urgentes para el desarrollo):
- I1: ¿El Pase de Estafeta es 5 puntos o existen dos protocolos distintos? → Buscar en workbooks
- I2: ¿Son 3 KPIs o 5 Leading Indicators en el BOS? → Buscar en S7 actualizado
- I3: ¿Son "Los 3 Big Wins" o "Los 5 Grandes"? → Buscar en S4 y S8
- B3: ¿Hay criterios claros de progresión N1→N5 en el LOS? → Buscar en S6 corregido
- L2: ¿Cuántos días exactos tiene cada ciclo? ¿Qué pasa si alguien empieza a mitad de ciclo?

---

### FASE 5 — Síntesis y Actualización de Documentos (1 sesión)
**Qué hacemos:** Actualizar DISCOVERY.md y SPEC.md con todos los hallazgos validados.  
**Output:** DISCOVERY.md y SPEC.md actualizados + `CHANGELOG_ANALISIS.md`  
**Pregunta guía:** *¿Qué cambió en nuestra comprensión del método y qué impacta en la arquitectura de la app?*

Acciones concretas:
1. Agregar a DISCOVERY.md: propósito exacto + pregunta clave de cada sesión (de la ESTRUCTURA COMPLETA)
2. Actualizar en SPEC.md: cualquier herramienta con nombre, número de pasos o lógica que haya cambiado
3. Marcar en SPRINTS.md: si algún sprint necesita ajustarse por nueva info
4. Crear `CHANGELOG_ANALISIS.md`: registro permanente de qué cambió y por qué

---

## Plantilla de Registro de Hallazgos

Para cada archivo analizado, usamos esta plantilla en `HALLAZGOS_[FASE].md`:

```
### [Nombre del archivo]
**Leído:** [Fecha]
**Tipo:** Workbook / Presentación / DISC / Estratégico
**Hallazgos:**

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🔴 NUEVO | [Descripción] | DISCOVERY.md § X | Agregar a sección Y |
| ⚡ RESPONDE | Pregunta I1: confirmado que... | SPEC.md § Delegación | Actualizar lógica Pase de Estafeta |
| 🚨 CRÍTICO | El workbook 8 duplica... | SPEC.md § Plan 90D | Revisar módulo antes de S9 |

**Preguntas que abre:**
- [Nueva incertidumbre descubierta]
```

---

## Criterio de Finalización del Análisis

El análisis está completo cuando:
- [ ] Los 5 documentos de Prioridad 1 están procesados y sus hallazgos registrados
- [ ] Los 8 workbooks fueron comparados original vs. corrección
- [ ] Los 5 informes DISC fueron analizados y la UX del módulo Mi Equipo está validada
- [ ] Al menos 12 de las 18 preguntas tienen respuesta (las que no requieren a Dilio)
- [ ] DISCOVERY.md fue actualizado con toda la nueva información
- [ ] SPEC.md fue auditado y cualquier cambio de arquitectura fue documentado
- [ ] No existe ningún archivo de Prioridad 1-3 marcado como ⏳ Pendiente

---

## Orden de Ejecución Recomendado

```
SESIÓN HOY:
  1. ESTRUCTURA COMPLETA TBM → define el esqueleto
  2. FEEDBACK TBM → identifica problemas críticos ya conocidos
  3. SEGUIMIENTO IMPLEMENTACIONES → entiende el contexto real de uso
  
PRÓXIMA SESIÓN:
  4. Presentaciones S1 + S2 (actualizadas)
  5. Comparación Workbooks S1-S4

SESIÓN SIGUIENTE:
  6. Comparación Workbooks S5-S8
  7. Informes DISC (todos)

SESIÓN FINAL:
  8. Resolución de 18 preguntas
  9. Actualización DISCOVERY.md + SPEC.md
  10. Decisión: ¿Podemos iniciar Sprint 0? ¿Qué queda pendiente de Dilio?
```

---

## Decisión Final Post-Análisis

Al terminar el análisis, decidimos una de estas tres opciones:

**A) Iniciar Sprint 0 ahora** → Si el 85%+ del método está claro y los puntos ambiguos no bloquean el desarrollo técnico inicial (setup de infra, auth, DB schema).

**B) Esperar respuesta de Dilio** → Si hay 2+ inconsistencias críticas que afectan la lógica de negocio central (ej: Pase de Estafeta con número de pasos incorrecto).

**C) Sprint 0 en paralelo + esperar a Dilio para Sprint 1** → La opción más probable: arrancar el setup técnico mientras Dilio responde las preguntas de contenido.
