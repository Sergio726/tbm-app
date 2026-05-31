# HALLAZGOS — Borrador de Dilio (Artifact HTML)
## Análisis del prototipo funcional creado por Dilio

**Fecha:** Mayo 2026  
**Fuente:** https://claude.ai/public/artifacts/893284ba-8d99-4db6-9d06-28b6bdde3c46  
**Nota:** Este borrador es una referencia, no el spec. Nuestro producto será mejor.

---

## Estructura del Borrador — 6 Módulos

Dilio estructuró su visión de la app como **6 módulos**, no 8 sesiones:

| # | Módulo | Ícono | Equivalente en nuestro SPEC |
|---|--------|-------|---------------------------|
| 1 | Diagnóstico LOST | 🎯 | → Módulo Diagnósticos (parcialmente) |
| 2 | Mapa DISC del Equipo | 👥 | → Módulo Mi Equipo (DISC + LOS) |
| 3 | Dashboard TBM | 📊 | → Screen Dashboard Central (BOS) |
| 4 | Delegación Rentable | 🏃 | → Screen Delegación (Pase de Estafeta) |
| 5 | Plan de Rocas 90D | 🪨 | → Screen Plan 90 Días |
| 6 | Multiplicador | 🧠 | → **🔴 NO EXISTE en nuestro SPEC** |

**Conclusión:** Los 8 sessions del programa son el curriculum. Los 6 módulos son las *herramientas operativas* de la app. Son cosas distintas — nuestro SPEC tiene ambas (workbooks por sesión + módulos operativos). El borrador de Dilio solo tiene los módulos operativos. **Nuestro approach es correcto y más completo.**

---

## Hallazgos por Módulo

### Módulo 1 — Diagnóstico LOST

El borrador usa LOST como **herramienta de diagnóstico** (medir el estado actual del líder), no solo como estructura del programa:

| Dimensión | Label en el borrador | Pregunta diagnóstica |
|-----------|---------------------|---------------------|
| L | Leadership Focus | ¿Opero desde decisiones estratégicas? |
| O | Operating Day | ¿Mi día está diseñado, no sobrevivido? |
| S | Systems of Execution | ¿Tengo sistemas de seguimiento y accountability? |
| T | Team Cadence | ¿Hay ritmo de equipo definido con reuniones efectivas? |

**Preguntas LOST del diagnóstico (5 por dimensión, escala 1-5):**

**L — Leadership:**
1. Mi agenda refleja prioridades estratégicas.
2. Paso la mayor parte de mi tiempo en decisiones de alto impacto.
3. El equipo no depende de mí para decisiones operativas.
4. Tengo claridad semanal de en qué NO debo involucrarme.
5. Protejo espacios para pensar y decidir.

**O — Operating Day:**
1. Inicio el día con claridad de prioridades.
2. Mi día no lo definen urgencias ajenas.
3. Tengo bloques definidos para pensar, decidir y liderar.
4. No reacciono todo el día a mensajes y correos.
5. Termino el día con sensación de avance real.

**S — Systems of Execution:**
1. Las tareas tienen responsables claros.
2. Reviso avances con frecuencia definida.
3. Los errores no se repiten.
4. Las decisiones no vuelven a mí.
5. El equipo sabe qué se espera.

**T — Team Cadence:**
1. Las reuniones tienen objetivo claro.
2. Se toman decisiones concretas en las reuniones.
3. Hay acuerdos claros y documentados.
4. Se da seguimiento a lo decidido.
5. El equipo sabe cuándo y para qué reunirse.

**Scoring:** ≥20/25 = ✨ Foco Rentable / 14-19 = ⚠️ Foco Inestable / ≤13 = 🔴 Líder Caro

---

### Módulo 2 — Mapa DISC

| Tag | Hallazgo |
|-----|---------|
| 🟢 **CONFIRMA** | Nombres cortos de perfiles: Motor / Combustible / Chasis / Sensor |
| 🟢 **CONFIRMA** | Roles ideales por perfil confirmados |
| 🔴 **NUEVO** | El borrador permite agregar personas con: Nombre + Rol + Perfil DISC + Alineación (Alta/Media/Baja) |
| 🔴 **NUEVO** | La "alineación" se mapea a acción: Alta=Mantener / Media=Desarrollar / Baja=Reubicar |
| 🏗️ **IMPACTA SPEC** | El campo "Alineación" es una evaluación subjetiva del líder, no del test DISC en sí — agregar al formulario de Mi Equipo |

---

### Módulo 3 — Dashboard TBM

| Tag | Hallazgo |
|-----|---------|
| ⚡ **RESPONDE I2** | **Confirmado: son 5 Leading Indicators, no 3 KPIs** |
| 🔴 **NUEVO** | Regla de oro del semáforo: **≥100% = 🟢 / 85-99% = 🟡 / <85% = 🔴** |
| 🔴 **NUEVO** | Los 5 KPIs de ejemplo son: Leads Nuevos / Citas Agendadas / Propuestas Enviadas / Entregas a Tiempo (%) / Dinero Recaudado ($) — son ejemplos, no fijos |
| 🔴 **NUEVO** | El dashboard rastrea semana 1, 2, 3 por indicador — no es semanal, tiene **3 semanas visibles por vez** |
| 🔴 **NUEVO** | Cada indicador tiene: Nombre / Dueño / Meta / S1 / S2 / S3 / Estado (semáforo automático) |
| 🏗️ **IMPACTA SPEC** | El estado del semáforo se calcula desde el último valor ingresado vs. la meta — no manual |

---

### Módulo 4 — Delegación Rentable

#### ⚡ RESUELVE PREGUNTA I1 — Pase de Estafeta: confirmado 5 pasos

| # | Paso | Descripción exacta de Dilio |
|---|------|---------------------------|
| 1 | 🎯 QUÉ | "¿Cómo luce el éxito? Sé específico y verificable." |
| 2 | 💡 POR QUÉ | "¿Por qué es importante? Dale propósito." |
| 3 | ⚙️ CÓMO | "¿Qué límites hay? Presupuesto, herramientas." |
| 4 | 📅 CUÁNDO | "Fecha Y hora exacta." |
| 5 | 🔁 CHEQUEO | "Borrador intermedio antes del entregable final." |

**Nuestro SPEC ya tenía estos 5 pasos correctos ✅**

#### 🚨 CRÍTICO — Nombres de los Niveles LOS (conflicto con DISCOVERY.md)

| Nivel | DISCOVERY.md (anterior) | Borrador de Dilio (actual) |
|-------|------------------------|--------------------------|
| N1 | Cadete | **Cadete** ✅ |
| N2 | **Aprendiz** | **Investigador** ❌ |
| N3 | **Ejecutor** | **Recomendador** ❌ |
| N4 | **Referente** | **Ejecutor** ❌ |
| N5 | Socio | **Socio** ✅ |

**N1 y N5 coinciden. N2, N3, N4 son diferentes. El borrador de Dilio es más reciente — usar sus nombres.**

Descripciones exactas del borrador:
- **N1 Cadete:** "Ejecuta exactamente lo indicado. No improvisa."
- **N2 Investigador:** "Investiga opciones y las presenta. El líder decide."
- **N3 Recomendador:** "Analiza, recomienda y espera aprobación."
- **N4 Ejecutor:** "Decide y ejecuta. Solo informa qué hizo."
- **N5 Socio:** "Autonomía total. Solo reporta el resultado final."

#### Regla del 70%

> "Si alguien puede hacerlo al 70% de lo bien que tú lo harías — TIENES QUE DELEGARLO. Ese 30% que falta es el margen de crecimiento de tu equipo. Mientras perfeccionas ese 30% operativo, pierdes el 100% de tu tiempo estratégico."

🔴 **NUEVO** — Este principio debe aparecer en la pantalla de Delegación de nuestra app.

---

### Módulo 5 — Plan de Rocas 90D

| Tag | Hallazgo |
|-----|---------|
| 🟢 **CONFIRMA** | Máximo 5 Rocas (borrador limita a 5 con botón deshabilitado) |
| 🟢 **CONFIRMA** | Parqueadero de Ideas existe y funciona |
| 🔴 **NUEVO** | Campos por Roca: Iniciativa estratégica / Dueño / Fecha límite / Métrica de éxito / % Avance |
| 🔴 **NUEVO** | El % de avance es un **slider manual** (0-100%) — no calculado automáticamente |
| 🟡 **ACTUALIZA** | La Métrica de éxito en Rocas se describe como: *"¿Cómo luce el éxito al día 90?"* — lenguaje exacto a usar en la UI |

---

### Módulo 6 — Multiplicador 🆕 (no existía en nuestro SPEC)

Este módulo es **completamente nuevo** y no estaba en nuestro SPEC ni DISCOVERY.md. Es uno de los módulos centrales del programa.

**Concepto central:**
> "Los Multiplicadores obtienen el 97% de la inteligencia de su equipo. Los Disminuidores solo el 48%."

**Los 3 Pecados del Disminuidor:**

| Pecado | Descripción |
|--------|-------------|
| 🚨 El Rescatista | Interviene antes de que el equipo resuelva. Termina haciendo lo que delegó. |
| ⚡ El Marcapasos | Trabaja a un ritmo que nadie puede seguir. Usa "si yo puedo, ustedes pueden". |
| 💬 El Respuesta-Rápida | Da la solución antes de que terminen de explicar el problema. El que más habla en reuniones. |

**Diagnóstico:** 4 preguntas por pecado (escala 1-4). Score total /36.
- ≤15 = 🟢 Multiplicador Natural
- 16-24 = 🟡 Disminuidor Accidental
- ≥25 = 🔴 Disminuidor en Acción

**Las 3 Herramientas del Multiplicador:**

| Herramienta | Reto |
|-------------|------|
| 🃏 Las Fichas de Póker | 5 fichas por reunión. Cuando se acaban — te callás. Máximo 5 intervenciones. |
| ❓ La Pregunta que Desbloquea | Cuando traigan un problema: *"¿Tú qué recomiendas?"* 48hs sin dar respuestas directas. |
| ✅ Definición de "Hecho" | Antes de delegar: formato exacto, fecha y hora, criterios de calidad. |

**El Multiplicador de Horas (confirmado del S1):**
- x1 = Operar (Haces tú. Intercambias tiempo por dinero.)
- x10 = Entrenar (Enseñas a uno. El tiempo se convierte en palanca.)
- x100 = Sistematizar (Creas un activo. Tu conocimiento trabaja 24/7.)

---

## Diseño Visual del Borrador — Diferencias con Nuestro SPEC

| Elemento | Borrador de Dilio | Nuestro SPEC |
|----------|-----------------|--------------|
| Modo | **Light mode** (fondo off-white) | **Dark mode** (fondo navy) |
| Color primario | `#1B3A6B` (azul) | `#0F1B2D` (navy oscuro) |
| Acento | `#E8621A` (naranja) | `#2563EB` (electric blue) |
| Tipografía | Playfair Display + DM Sans | Inter Bold |
| Estilo | Profesional clásico | Moderno premium |

**Nuestra decisión de diseño:** Mantenemos dark mode. Se ve más premium y diferenciado de lo que Dilio hizo. Además nuestro target (líderes de empresa) esperan un dashboard de negocios serio, no una web corporativa clásica. **No cambia nada de nuestro TBM_ClaudeDesign_Draft.md.**

---

## Lo que FALTA en el Borrador de Dilio (y nosotros SÍ tenemos)

| Feature | En borrador de Dilio | En nuestro SPEC |
|---------|---------------------|-----------------|
| Rituales (Pre-game/Warm Up/Cool Down) | ❌ No existe | ✅ Screen completo |
| Workbooks por sesión (S1-S8) | ❌ No existe | ✅ Screen completo |
| Feedback S.E.C. | ❌ No existe | ✅ Screen completo |
| Vista del Coach (Dilio) | ❌ No existe | ✅ Dashboard de Dilio |
| Autenticación / usuarios | ❌ No tiene (app local) | ✅ Auth con Supabase |
| Persistencia real de datos | ❌ Datos en memoria | ✅ Base de datos Supabase |
| Multi-empresa / cohortes | ❌ No tiene | ✅ Modelo de datos con cohort_id |
| Módulo Multiplicador | ❌ Tiene | 🔴 AGREGAR A NUESTRO SPEC |
| Mapa DISC con alineación | Básico | 🟡 Actualizar nuestro SPEC |

---

## Acciones Concretas Post-Análisis

### 🔴 URGENTE — Cambiar en DISCOVERY.md
1. Actualizar nombres de niveles LOS: N2=Investigador / N3=Recomendador / N4=Ejecutor
2. Agregar Módulo 6 Multiplicador al modelo del método
3. Agregar las 3 preguntas diagnósticas del LOST (L/O/S/T con sus 5 preguntas)
4. Agregar los 3 Pecados del Disminuidor
5. Agregar las 3 Herramientas del Multiplicador

### 🏗️ URGENTE — Cambiar en SPEC.md
1. Agregar **Screen 9 — Multiplicador** (nuevo módulo)
2. Actualizar Screen 3 Mi Equipo: agregar campo "Alineación" (Mantener/Desarrollar/Reubicar)
3. Actualizar Screen 4 Delegación: agregar "Regla del 70%"
4. Actualizar Screen 1 Dashboard: confirmar semáforo ≥100%=Verde / 85-99%=Amarillo / <85%=Rojo
5. Actualizar Screen 1 Dashboard: 3 semanas visibles por indicador (S1/S2/S3)
6. Confirmar scoring del Diagnóstico LOST: ≥20=Foco Rentable / 14-19=Inestable / ≤13=Caro

### ✅ YA RESUELTAS CON ESTE ANÁLISIS
- ⚡ **I1** — Pase de Estafeta: **5 pasos confirmados** (QUÉ/POR QUÉ/CÓMO/CUÁNDO/CHEQUEO)
- ⚡ **I2** — Dashboard: **5 Leading Indicators** con semáforo ≥100%/85-99%/<85%
- 🟢 Nombres de perfiles DISC: Motor / Combustible / Chasis / Sensor — confirmados
- 🟢 Niveles LOS N1 y N5: Cadete y Socio — confirmados

### ✅ RESUELTAS por Dilio (Mayo 2026 — ver [RESPUESTAS_DILIO.md](./RESPUESTAS_DILIO.md))
- **Cohorts / multi-empresa:** ❌ NO se construye — programa 100% individual [N3]. (Anula la fila "Multi-empresa / cohortes con cohort_id" de la tabla de arriba.)
- **4 columnas del Seguimiento de Implementaciones:** irrelevante — era herramienta interna de Dilio, no requisito de la app [N3].
- **Método ARQI:** lente de **derechos de decisión por tarea**, 3 niveles: Informar / Consultar / Delegar [I5].

### ⏳ AÚN PENDIENTES (editoriales — no bloquean desarrollo)
- Nombres canónicos de pilares LOST (Sebas confirmó: usar los de las presentaciones — Operaciones optimizadas / Sistemas escalables / Tiempo multiplicado).
- Contenido repetido en Workbook 8 (limpieza editorial antes de digitalizar S8).
