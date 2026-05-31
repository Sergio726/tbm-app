# HALLAZGOS FASE 1 — Mapeo Estratégico
## The Business Multiplier App — Inteligencia Profunda

**Fecha:** Mayo 2026  
**Fuentes procesadas:** 5/5 ✅  
**Analista:** Claude (Cowork)

---

## Resumen Ejecutivo

La Fase 1 reveló **4 conflictos críticos** entre fuentes que deben resolverse antes de codear, **11 conceptos nuevos** no registrados en DISCOVERY.md, y **confirmó** la estructura L.O.S.T. con matices importantes en la expansión del acrónimo. El hallazgo más urgente: el nombre completo de cada pilar de LOST es diferente en las presentaciones vs. el spreadsheet oficial — y las presentaciones parecen ser la versión más pulida y pedagógica.

---

## Documento 1 — ESTRUCTURA COMPLETA TBM (Spreadsheet)

**Leído:** Mayo 2026  
**Tipo:** Estratégico — Esqueleto oficial del programa

### Hallazgos

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🟢 **CONFIRMA** | El programa tiene 8 sesiones + 1 Onboarding (S0) | DISCOVERY.md | Sin cambios |
| 🟢 **CONFIRMA** | El marco es LOST: L-Liderazgo, O-Organización/Ops, S-Sistemas, T-Tiempo/Tracción | DISCOVERY.md | Verificar conflicto de nombres (ver abajo) |
| 🔴 **NUEVO** | Existe una **Sesión 0 — Onboarding** con propósito propio | SPEC.md, DISCOVERY.md | Agregar módulo S0 al app |
| 🔴 **NUEVO** | S0 Onboarding pregunta clave: *"¿Por qué hacer este entrenamiento llevará a mi organización al siguiente nivel?"* | DISCOVERY.md | Registrar |
| 🔴 **NUEVO** | S0 Onboarding propósito: *"Exponer objetivo del entrenamiento, bonus, horarios, tiempo de implementación y mentoría, recursos del líder"* | DISCOVERY.md | Registrar |
| 🔴 **NUEVO** | Post-onboarding: se envía Google Calendar con cronograma | SPEC.md | Considerar integración Calendar o al menos exportación de fechas |
| 🚨 **CRÍTICO** | Solo S0 y S1 tienen PROPÓSITO y PREGUNTA CLAVE en el spreadsheet. **S2-S8 están en blanco.** | DISCOVERY.md | Completar desde presentaciones y workbooks en Fases 2-3 |
| 🔴 **NUEVO** | Cada sesión tiene: Estructura, Guión, Diapositivas, Workbook, Recursos (Audio/ADS) — 5 componentes por sesión | SPEC.md | Considerar si la app accede a todos estos componentes |
| ✅ **RESUELTO** | El mapeo LOST por sesión es: L→S1,S4,S5 / O→S2,S3,S6 / S→S7 / T→S8 | DISCOVERY.md | ✅ Confirmado |
| ✅ **RESUELTO** | El spreadsheet llama al pilar O: **"Organización estratégica"**. Las presentaciones: **"Operaciones Optimizadas"**. **Canónico: Operaciones Optimizadas** (presentaciones = fuente de verdad). | DISCOVERY.md, SPEC.md | ✅ Resuelto |
| ✅ **RESUELTO** | El spreadsheet llama al pilar S: **"Sistemas de medición"**. Las presentaciones: **"Sistemas Escalables"**. **Canónico: Sistemas Escalables**. | DISCOVERY.md, SPEC.md | ✅ Resuelto |
| ✅ **RESUELTO** | El spreadsheet llama al pilar T: **"Tracción y crecimiento"**. Las presentaciones: **"Tiempo Multiplicado"**. **Canónico: Tiempo Multiplicado**. | DISCOVERY.md, SPEC.md | ✅ Resuelto |

**Preguntas que abre:**
- ~~¿Cuál es el nombre canónico de cada pilar LOST?~~ ✅ **Resuelto — las presentaciones son la fuente de verdad.**
- ¿La Sesión 0 Onboarding tiene workbook propio o no?
- ¿Qué son los "ADS" en la columna de Recursos?

---

## Documento 2 — FEEDBACK TBM (Kathe Jaimes, Editora)

**Leído:** Mayo 2026  
**Tipo:** Estratégico — Observaciones editoriales críticas

### Hallazgos

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🟢 **CONFIRMA** | La estructura basada en LOST es correcta como marco del programa | DISCOVERY.md | Sin cambios |
| 🟢 **CONFIRMA** | El Workbook 1 + Diagnóstico están combinados en un solo documento — aprobado | SPEC.md | S1 workbook = doble: diagnóstico + ejercicios |
| 🔴 **NUEVO** | Kathe propone agregar **Negociación e Influencia** a S4 (alinear personas sin desgaste) | DISCOVERY.md | Registrar como propuesta pendiente — no implementada aún |
| 🔴 **NUEVO** | Los workbooks son descritos como *"contundentes y no extensos"* — esto define el tono y tamaño esperado | SPEC.md | Aplicar al diseño de los formularios en app: concisos, no exhaustivos |
| 🔴 **NUEVO** | Kathe plantea: ¿los workbooks incluyen notas o solo herramientas prácticas? (sin resolver) | SPEC.md | Definir con Dilio: ¿campo de notas libre en cada workbook? |
| 🔴 **NUEVO** | Los anexos y tablas de los workbooks deberían ser **Excel con hipervínculos** — no parte del PDF | SPEC.md | En la app: tablas y plantillas como archivos descargables, no formularios inline |
| 🔴 **NUEVO** | Todos los workbooks deberían tener **Objetivos y Compromisos** al final — o eliminarlos del todo (sin resolver) | SPEC.md | Preguntar a Dilio — si se incluyen, son campos obligatorios en la app |
| 🔴 **NUEVO** | Kathe pide **acompañamiento en el avance de implementación** según el contenido del workbook | SPEC.md | Confirma que la app necesita un módulo de seguimiento de tareas por sesión |
| 🚨 **CRÍTICO** | **URGENTE: El Workbook 8 tiene varias cosas repetidas** — requiere revisión antes de digitalizarlo | SPEC.md, WORKBOOK_DELTA.md | Analizar S8 en Fase 2 con foco en duplicados antes de buildear el módulo |

**Preguntas que abre:**
- ¿Los workbooks llevan notas libres o solo herramientas prácticas?
- ¿Los Objetivos y Compromisos al final de cada workbook son obligatorios o se eliminan?
- ¿Qué exactamente está repetido en el Workbook 8?

---

> 🚫 **ANULADO por Dilio (Mayo 2026) — ver [RESPUESTAS_DILIO.md](./RESPUESTAS_DILIO.md) [N3]:** Los hallazgos de esta sección sobre **cohorts** (soporte multi-cohorte, `cohort_id`, estados por cohorte) quedan **sin efecto**. Dilio confirmó que el programa es **100% individual**: cada empresa avanza a su propio ritmo, **sin módulo de cohorts**. El spreadsheet de seguimiento era una herramienta interna de Dilio, no un requisito de la app. El modelo de datos correcto es por **empresa** (`companies` + `profiles`), como ya está en `schema.sql`.

## Documento 3 — SEGUIMIENTO DE IMPLEMENTACIONES (Spreadsheet)

**Leído:** Mayo 2026  
**Tipo:** Estratégico — Estado real de uso del programa

### Hallazgos

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🔴 **NUEVO** | El programa tiene **3 cohortes activas**: TBM1 (11 clientes), TBM2 (9 clientes), TBM3 (9 clientes) | DISCOVERY.md | Registrar — la app debe soportar múltiples cohortes simultáneas |
| 🔴 **NUEVO** | El tracking en el spreadsheet usa **4 columnas (1-2-3-4)** — probable seguimiento de pagos/cuotas, no de sesiones | DISCOVERY.md | Confirmar con Dilio si columnas = pagos o sesiones |
| 🔴 **NUEVO** | **Ningún cliente está al 100%** (4/4 completo) en ninguna cohorte | DISCOVERY.md | El programa es reciente — la app llega en momento oportuno |
| 🔴 **NUEVO** | TBM1: 75% de avance máximo (2 clientes: Andrea Trillos, Rosalys Ledezma) | DISCOVERY.md | TBM1 está más avanzado — posibles early adopters de la app |
| 🔴 **NUEVO** | TBM3: Mayoría al 0% — cohorte más nueva | DISCOVERY.md | TBM3 podría ser la primera cohorte en usar la app desde S1 |
| 🔴 **NUEVO** | **Sebas García aparece en TBM2 con 0% de avance** | DISCOVERY.md | Sebas es participante activo del programa — perspectiva de usuario real |
| 🏗️ **IMPACTA SPEC** | La app necesita soporte para múltiples cohortes con diferentes puntos de partida | SPEC.md | Diseñar el modelo de datos con cohort_id y fecha de inicio por alumno |
| 🏗️ **IMPACTA SPEC** | Algunos clientes son parejas/equipos ("Alejandro y Victoria Monsalve", "Yamid y Yuliany Ibañez") | SPEC.md | El modelo de usuarios debe soportar múltiples personas bajo un mismo "cliente/empresa" |
| 🏗️ **IMPACTA SPEC** | "Kathy Higuera - Will Moreno (awebo)" están al 0% en TBM1 — posibles bajas | SPEC.md | La app debe gestionar estados: activo / inactivo / en pausa |

**Preguntas que abre:**
- ¿Las 4 columnas son pagos o sesiones completadas?
- ¿Cómo maneja Dilio a los clientes que no avanzan (como TBM3 que está casi todo en 0%)?

---

## Documento 4 — SESION 1. Como-dejar-de-ser-un-lider-caro.pdf

**Leído:** Mayo 2026  
**Tipo:** Presentación actualizada — S1

### Hallazgos

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🟢 **CONFIRMA** | S1 propósito: Romper la adicción al "hacer" y confrontar el costo del activismo | DISCOVERY.md | Confirma el spreadsheet |
| 🟢 **CONFIRMA** | S1 pregunta clave: "¿Cómo me convierto en un líder rentable?" | DISCOVERY.md | Confirma el spreadsheet |
| 🔴 **NUEVO** | **Nombre completo del marco LOST en presentaciones:** L=Liderazgo estratégico / O=Operaciones optimizadas / S=Sistemas escalables / T=Tiempo multiplicado | DISCOVERY.md | Estos son los nombres a usar en la UI de la app |
| 🔴 **NUEVO** | **El ciclo LOST no es lineal** — es un ciclo de retroalimentación continua: L→O→S→T→L | SPEC.md, DISCOVERY.md | En la app: no bloquear sesiones por orden estricto de pilar LOST |
| 🔴 **NUEVO** | **Multiplicador de horas:** 1h operativo=1x / 1h desarrollo equipo=10x / 1h sistemas=100x / 1h estratégico=1000x | DISCOVERY.md | Framework clave para S1 — puede usarse en la UI del módulo Rituales |
| 🔴 **NUEVO** | **Data McKinsey citada:** Líderes usan 70% operativo / 30% estratégico | DISCOVERY.md | Dato de contexto para el diagnóstico inicial |
| 🔴 **NUEVO** | **Data Gallup citada:** 21% pérdida de productividad en equipos con baja claridad — $367,500 costo anual en empresa de 50 personas | DISCOVERY.md | Dato de impacto — puede usarse en onboarding de la app |
| 🔴 **NUEVO** | El proceso de liberación de Operaciones tiene 3 pasos: **Auditar → Clasificar → Eliminar** | DISCOVERY.md | Herramienta de S1 — digitalizar en workbook de S1 |
| 🔴 **NUEVO** | S1 define qué decide el líder vs. el equipo: Líder=visión/recursos/talento/relaciones externas. Equipo=ejecución táctica/operativa/coordinación/métricas | DISCOVERY.md | Marco de delegación — conecta con S6 |
| 🔴 **NUEVO** | Frase central: *"Si no funciona sin ti, no es un sistema. Eres tú."* | DISCOVERY.md | Lenguaje exacto de Dilio — usar en la UI |
| ⚡ **RESPONDE** | S1 cierra con preview de S2: "Liderazgo estratégico y Arquitectura de Equipos" — confirma que S2 sigue en el pilar L | DISCOVERY.md | Documenta conflicto con el spreadsheet que ubica S2 en O |
| 🟡 **ACTUALIZA** | El nombre "Líder Rentable" es central en S1 — no solo un descriptor sino el concepto transformacional de la sesión | DISCOVERY.md | Usar este lenguaje en la card de S1 en la app |

**Preguntas que abre:**
- ¿El proceso Auditar→Clasificar→Eliminar tiene un nombre propio en el método?

---

## Documento 5 — SESION 2. Arquitectura-de-Equipos-Autonomos.pdf

**Leído:** Mayo 2026  
**Tipo:** Presentación actualizada — S2

### Hallazgos

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🔴 **NUEVO** | **S2 se posiciona bajo "L — Liderazgo estratégico"** en el mapa LOST mostrado en la presentación | DISCOVERY.md | Conflicto con el spreadsheet que dice S2 = "O - Organización estratégica" |
| 🚨 **CRÍTICO** | **Conflicto de mapeo LOST:** Spreadsheet dice S2=O y S3=O. Presentación de S2 dice que S2=L y preview de S3 dice S3=S. Esto cambia la estructura del programa. | DISCOVERY.md, SPEC.md | Preguntar a Dilio: ¿cuál es el mapeo LOST correcto sesión por sesión? |
| 🔴 **NUEVO** | **S2 propósito (inferido de presentación):** "Del liderazgo por suerte al liderazgo por diseño" — identificar si tenés las personas correctas en el bus | DISCOVERY.md | Completar el campo propósito de S2 en DISCOVERY.md |
| 🔴 **NUEVO** | **S2 pregunta clave (inferida):** "¿Tenés las personas correctas en el bus?" | DISCOVERY.md | Completar el campo pregunta de S2 en DISCOVERY.md |
| 🔴 **NUEVO** | **Distribución poblacional DISC:** D=3% / I=11% / S=69% / C=17% de la población | DISCOVERY.md, SPEC.md | Usar en la UI del módulo Mi Equipo al mostrar el perfil |
| 🔴 **NUEVO** | **Nombres de perfiles DISC:**D="El Motor de la Ejecución" / I="El Combustible del Equipo" / S="El Chasis de la Empresa" / C="El Sensor de Calidad" | DISCOVERY.md, SPEC.md | Estos son los nombres exactos a usar en la app — reemplaza los genéricos |
| 🔴 **NUEVO** | **Roles ideales DISC:** D→Dirección/Expansión/Crisis / I→Ventas/Marketing/Cultura / S→Operaciones/Customer Success/RRHH / C→Finanzas/Legal/Sistemas | DISCOVERY.md, SPEC.md | Mostrar en el perfil DISC de Mi Equipo bajo "Rol Ideal" |
| 🔴 **NUEVO** | **Conexiones y fricciones DISC (oficial):** Buena conexión: D↔C, I↔S, S↔C, I↔D. Requieren trabajo: D↔S, I↔C | DISCOVERY.md, SPEC.md | Implementar en la vista de equipo — alertas de fricción entre miembros |
| ⚡ **RESPONDE** | Las descripciones de Luz ☀️ y Sombra 🌑 por perfil DISC son confirmadas y detalladas con contenido específico | SPEC.md Mi Equipo | Actualizar la UX del módulo Mi Equipo con este contenido exacto |
| 🔴 **NUEVO** | **"Las 3 preguntas de la muerte":** (1) ¿Todo depende de ti? (2) ¿Sabés tus números? (3) ¿Te duplicaste? | DISCOVERY.md | Framework de S2 — puede usarse como diagnóstico inicial en la app |
| 🔴 **NUEVO** | **Tarea del líder antes de S3:** Hacer test DISC a todo el equipo, evaluar: ¿asiento correcto? / ¿luz o sombra? / ¿por diseño o para tapar un hueco? | DISCOVERY.md | Confirma que el DISC es pre-requisito para S3 — el módulo Mi Equipo debe completarse antes de S3 |
| 🔴 **NUEVO** | **Método ARQI** — mencionado como herramienta de S3 (preview al cierre de S2): "cómo diseñar el equipo para que rinda sin depender de ti" | DISCOVERY.md | Nuevo concepto no registrado — analizar en Fase 2 cuando veamos S3 workbook |
| 🔴 **NUEVO** | **S3 se mapea a "S — Sistemas escalables"** según el preview de S2 | DISCOVERY.md | Conflicto con el spreadsheet que dice S3 = "O - Organización estratégica" |
| 🏗️ **IMPACTA SPEC** | El módulo Mi Equipo (DISC) debe completarse antes de que el usuario pueda avanzar a S3 | SPEC.md | Agregar dependencia: S3 requiere DISC completado del equipo |
| 🏗️ **IMPACTA SPEC** | La app debe mostrar fricciones entre perfiles DISC en la vista de equipo | SPEC.md Mi Equipo | Agregar sección "Fricciones detectadas" en Mi Equipo |

**Preguntas que abre:**
- ¿Qué es exactamente el Método ARQI? ¿Tiene pasos definidos?
- ¿El DISC del equipo completo es pre-requisito obligatorio para avanzar en la app?

---

## Resumen de Conflictos Críticos

Estos 4 conflictos deben resolverse con Dilio antes de codear cualquier lógica de negocio que los involucre:

### CONFLICTO 1 — Nombres de los pilares LOST
| Pilar | Spreadsheet oficial | Presentaciones S1/S2 |
|-------|-------------------|---------------------|
| L | Liderazgo estratégico | Liderazgo estratégico ✅ |
| O | **Organización estratégica** | **Operaciones optimizadas** ❌ |
| S | **Sistemas de medición** | **Sistemas escalables** ❌ |
| T | **Tracción y crecimiento** | **Tiempo multiplicado** ❌ |

**✅ RESUELTO — Mayo 2026:** Sebas confirmó que las presentaciones son la fuente más actualizada. **Los nombres canónicos son los de las presentaciones:**
- O = Operaciones optimizadas
- S = Sistemas escalables
- T = Tiempo multiplicado

### CONFLICTO 2 — Mapeo de sesiones a pilares LOST
| Sesión | Spreadsheet | Presentaciones |
|--------|-------------|---------------|
| S2 | **O — Organización** | **L — Liderazgo** |
| S3 | **O — Organización** | **S — Sistemas** |

**Hipótesis:** Las presentaciones reflejan la enseñanza real. Posible que el spreadsheet esté estructurado diferente a como Dilio presenta en vivo.

### CONFLICTO 3 — Workbook 8 con contenido repetido
Kathe Jaimes marca esto como URGENTE. Necesitamos leer el Workbook 8 original Y la corrección para identificar exactamente qué está duplicado antes de digitalizar S8 en la app.

### CONFLICTO 4 — Las 4 columnas del seguimiento
¿Las columnas 1-2-3-4 representan pagos o sesiones? Cambia cómo interpretamos el avance real de los alumnos.

---

## Nuevos Conceptos a Agregar a DISCOVERY.md

1. **Sesión 0 — Onboarding** (con propósito y pregunta clave)
2. **Nombres canónicos de perfiles DISC** (Motor, Combustible, Chasis, Sensor)
3. **Porcentajes poblacionales DISC** (3/11/69/17%)
4. **Roles ideales por perfil DISC**
5. **Conexiones y fricciones DISC**
6. **Multiplicador de horas** (1x/10x/100x/1000x)
7. **Proceso de liberación** (Auditar→Clasificar→Eliminar)
8. **Las 3 preguntas de la muerte**
9. **Método ARQI** (sin detalle aún — pendiente S3)
10. **S2 propósito y pregunta clave** (inferidos de presentación)
11. **3 cohortes activas** (TBM1/TBM2/TBM3) con estado de avance

---

## Impactos en SPEC.md

| Módulo | Cambio requerido |
|--------|-----------------|
| Onboarding | Agregar S0 como módulo inicial de la app (antes de S1) |
| Mi Equipo | Usar nombres exactos de perfiles (Motor/Combustible/Chasis/Sensor) |
| Mi Equipo | Agregar porcentaje poblacional por perfil |
| Mi Equipo | Agregar Roles Ideales por perfil DISC |
| Mi Equipo | Agregar mapa de Conexiones y Fricciones entre miembros |
| Workbooks | DISC del equipo debe completarse como pre-requisito de S3 |
| Workbooks | S8 bloqueado hasta resolver el conflicto de contenido repetido |
| Plan 90D | Confirmar nombres de pilares LOST antes de usarlos en la UI |
| Modelo de datos | Soportar múltiples personas por cliente/empresa |
| Modelo de datos | Agregar cohort_id y estados (activo/inactivo/en pausa) |

---

## Hallazgo Post-Fase 1 — Modelo de Negocio DISC

| Tag | Hallazgo | Impacta en | Acción |
|-----|----------|-----------|--------|
| 🔴 **NUEVO** | **El test DISC tiene un costo de ~USD $100 por persona** | SPEC.md, modelo de negocio | El DISC no es gratuito — la app debe gestionar quién pagó y quién no |
| 🔴 **NUEVO** | **Empresa con 8 empleados = $800 en tests DISC** — es una compra significativa | SPEC.md | El módulo Mi Equipo debe gate-keepear por tests pagos |
| 🏗️ **IMPACTA SPEC** | La app necesita distinguir entre: miembros con DISC completado (pago) vs. sin DISC | SPEC.md Mi Equipo | Agregar estado "DISC pendiente / pagado / completado" por miembro del equipo |
| 🏗️ **IMPACTA SPEC** | Puede requerirse un flujo de compra/activación del test DISC dentro de la app | SPEC.md | Diseñar el flujo: líder solicita tests → pago → link de test → resultados cargados |
| 🔴 **NUEVO** | **El borrador de Dilio dice "6-Module Leadership System"** (no 8 sesiones) — posible reestructuración | DISCOVERY.md | 🚨 CRÍTICO — verificar si el programa cambió de 8 sesiones a 6 módulos |

---

## Estado de las 18 Preguntas (Actualización Fase 1)

| Pregunta | Estado |
|----------|--------|
| I1 — Pase de Estafeta: ¿5 puntos o dos protocolos? | ⏳ Pendiente (S6) |
| I2 — ¿3 KPIs o 5 Leading Indicators en BOS? | ⏳ Pendiente (S7) |
| I3 — ¿"3 Big Wins" o "5 Grandes"? | ⏳ Pendiente (S4/S8) |
| B3 — Criterios de progresión N1→N5 en LOS | ⏳ Pendiente (S6) |
| L2 — ¿Cuántos días tiene cada ciclo? | ⏳ Pendiente (S8) |
| **NUEVA** — ¿Nombres canónicos de pilares LOST? | 🚨 Conflicto — preguntar a Dilio |
| **NUEVA** — ¿Mapeo LOST por sesión: spreadsheet vs. presentaciones? | 🚨 Conflicto — preguntar a Dilio |
| **NUEVA** — ¿4 columnas de seguimiento = pagos o sesiones? | ⏳ Pendiente — preguntar a Dilio |

---

## Criterio de Completitud Fase 1

- [x] ESTRUCTURA COMPLETA TBM — procesada ✅
- [x] FEEDBACK TBM — procesada ✅
- [x] SEGUIMIENTO IMPLEMENTACIONES — procesada ✅
- [x] Presentación S1 — procesada ✅
- [x] Presentación S2 — procesada ✅
- [ ] Conflictos resueltos con Dilio — ⏳ Pendiente respuesta

**Fase 1 completa en términos de lectura. Pendiente: validación de 4 conflictos críticos con Dilio.**
