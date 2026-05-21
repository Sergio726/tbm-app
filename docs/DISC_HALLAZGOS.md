# DISC_HALLAZGOS.md — Análisis de Informes DISC
## Fase 3: Entendiendo el módulo Mi Equipo

**Fecha:** Mayo 2026  
**Fuentes:** 4 informes PDF (Sebas, Jenny, Angélica, Sandra) + HTML evaluador de Dilio  
**Objetivo:** Definir la UX y modelo de datos del módulo Mi Equipo en la app.

---

## 🔴 HALLAZGO CRÍTICO — El Sistema DISC de Dilio tiene DOS versiones

| Versión | Qué es | Costo | Quién lo toma |
|---------|--------|-------|---------------|
| **DISC Externo ($100/persona)** | Test profesional (probablemente TTI o similar). Genera un informe PDF completo de 9 secciones con lenguaje personalizado. | ~$100 USD/persona | Los alumnos del programa TBM |
| **DISC Interno (HTML de Dilio)** | Evaluador propio de Dilio. 24 grupos × 4 palabras. Genera resultado inmediato con 16 perfiles. Corre en el browser, guarda en localStorage. | Gratis | Dilio lo usa para demos o evaluaciones rápidas |

**Implicación para la app:**
- El informe completo ($100) se sube como PDF a la app por empresa → la app lo usa como referencia
- La app NO puede reemplazar el test externo
- La app PUEDE integrar el evaluador rápido de Dilio (HTML) como herramienta de diagnóstico complementario

---

## Estructura Estándar del Informe DISC (9 Secciones)

Todos los informes tienen exactamente las mismas 9 secciones, en el mismo orden:

| # | Sección | Contenido |
|---|---------|-----------|
| 1 | **Tu temperamento DISC** | Descripción del factor dominante y secundario. Qué tipo de entorno le funciona. |
| 2 | **El nombre de tu perfil** | Nombre descriptivo (no solo letras). Refleja la característica principal. |
| 3 | **Tu estructura de Luz y Sombra** | Fortalezas naturales (Luz) + dónde ese mismo rasgo puede limitar (Sombra). |
| 4 | **Tus temores dominantes** | Qué situaciones le generan incomodidad o resistencia natural. |
| 5 | **Tu comportamiento bajo presión** | Cómo reacciona cuando aumenta la presión. Qué hace (y cómo lo perciben otros). |
| 6 | **Tu impacto en el negocio y el equipo** | Qué aporta cuando está en Luz. Qué riesgo genera cuando está en Sombra. |
| 7 | **Qué necesitas para ir a tu PRIME** | El camino de evolución. Ajustes concretos. |
| 8 | **El riesgo si no evolucionas** | Consecuencia concreta de quedarse en la sombra. |
| 9 | **Tu plan PRIME** | Cierre con compromisos concretos de crecimiento. |

**Nota de diseño:** Los informes están escritos en **segunda persona** ("tú"), son **narrativos** (no tablas), y tienen un tono **de coach** (directo, sin juicio, orientado a crecimiento). La app debe mostrarlos como richtext/documento, NO como campos de formulario.

---

## Perfiles DISC Analizados (4 de 5)

### Sebas García — El Especialista (S)

| Atributo | Contenido |
|---------|-----------|
| **Perfil DISC** | S predominante + D e I moderados |
| **Nombre** | El Especialista |
| **Luz** | Constancia, compromiso, confiabilidad. Sostiene procesos sin depender de presión externa. "Columna del equipo." |
| **Sombra** | Resistencia al cambio. Preferir procesos conocidos aunque el contexto pida evolución. |
| **Temor** | Cambios abruptos. Perder control sobre lo aprendido. Moverse muy rápido sin tiempo para adaptarse. |
| **Bajo presión** | Mantiene disciplina. Se cierra en su propio proceso. Desde afuera parece distante, por dentro está intentando mantener estabilidad. |
| **Impacto negocio** | Continuidad y confiabilidad. "Columna del equipo." Avance sostenido. |
| **Plan PRIME** | Combinar constancia con apertura al cambio. Compartir conocimiento. Explorar nuevos retos. |
| **Riesgo sin evolución** | Quedar cómodo en procesos conocidos. Estancamiento gradual. |

---

### Jenny Morales — El Evaluador Estratégico (IC)

| Atributo | Contenido |
|---------|-----------|
| **Perfil DISC** | Influencia moderada + análisis C estructurado. D neutro (no necesita dominar). S bajo (no le va lo lento/repetitivo). |
| **Nombre** | El Evaluador Estratégico |
| **Luz** | Reflexiva, detecta inconsistencias, aporta claridad estratégica, evita decisiones precipitadas. |
| **Sombra** | Sobreanálisis. Postura excesivamente observadora. No toma posición clara frente al equipo. |
| **Temor** | Tomar decisiones incorrectas o con información incompleta. |
| **Bajo presión** | Intensifica el análisis. Busca más información y validación antes de actuar. |
| **Impacto negocio** | Eleva calidad del pensamiento. Evita decisiones impulsivas. Si no comunica su criterio, no influye. |
| **Plan PRIME** | Confiar más en su propio criterio. Tomar más postura. Expresar lectura estratégica sin esperar el momento perfecto. |
| **Riesgo sin evolución** | La persona que entiende todo pero dirige poco. No ocupa espacios de liderazgo porque no verbaliza su visión. |

---

### Angélica Vélez — El Alentador (DI)

| Atributo | Contenido |
|---------|-----------|
| **Perfil DISC** | D predominante alto + I secundario. Orientada al poder personal, acción y control del entorno. |
| **Nombre** | El Alentador *(nota: a pesar del nombre suave, el informe lo describe como fuerza y empuje)* |
| **Luz** | Líder movilizadora. Presencia, carácter, capacidad de empuje. Pone orden, marca ritmo, exige resultados. |
| **Sombra** | La misma fuerza puede tornarse intimidante. Puede cruzar la línea entre liderar y controlar. |
| **Temor** | Perder posición, influencia o autoridad. Que la perciban como débil. |
| **Bajo presión** | Se endurece. Más dominante, confrontativa, menos paciente. Pendenciera — no porque disfrute el conflicto, sino porque no sabe quedarse quieta. |
| **Impacto negocio** | Cuando está en PRIME: los equipos se mueven, hay acción y disciplina. Cuando está en sombra: genera miedo, resistencia silenciosa. |
| **Plan PRIME** | Liderar sin intimidar. Escuchar sin sentir que pierde control. Delegar sin supervisar desde la desconfianza. Combinar dirección con empatía estratégica. |
| **Riesgo sin evolución** | Líder temida pero no seguida. Poder sin conexión que aísla. Resultados corto plazo, pero pierde compromiso a largo plazo. |

---

### Sandra Muñoz — La Guardiana del Orden (SC)

| Atributo | Contenido |
|---------|-----------|
| **Perfil DISC** | S+C predominante. C muy marcado. No se mueve por impulso, no improvisa. Necesita entender el terreno antes de avanzar. |
| **Nombre** | La Guardiana del Orden |
| **Luz** | Consistente, responsable, confiable. Sostiene procesos cuando otros se cansan. Detecta errores antes de que sean problemas. Mantiene estándar incluso sin que nadie mire. |
| **Sombra** | Sobrecontrol. Asume más carga de la que le corresponde. Cuesta delegar. Confunde excelencia con perfección. |
| **Temor** | Permitir que algo salga mal bajo su responsabilidad. |
| **Bajo presión** | Se cierra, habla menos, hace más. Se apoya en normas y procedimientos. Evita conflicto directo. Por fuera parece estable, por dentro sostiene mucha carga. |
| **Impacto negocio** | En PRIME: estabilidad, calidad, orden, errores disminuyen. En sombra: todo pasa por ella, equipo dependiente, cuello de botella sin quererlo. |
| **Plan PRIME** | Definir estándares en lugar de ejecutar todo. Tomar decisiones con plazo (no esperar perfección). Delegar con seguimiento acordado (no control constante). Expresar lo que piensa antes de asumir carga. |
| **Riesgo sin evolución** | Agotamiento. La persona que sostiene todo, nunca falla, siempre responde — pero se cansa y carga sola. |

---

### Dilio Donado — Perfil desconocido

> ⚠️ El archivo `DISC Dilio Donado.html` es la **herramienta evaluadora** que Dilio construyó (no un informe completado). Los resultados del test de Dilio se guardarían en el localStorage del browser cuando él lo tomó — no son accesibles desde el archivo.

**Lo que SÍ aprendimos del archivo HTML:**
- El evaluador tiene **24 grupos de 4 palabras** — se elige la que MÁS y la que MENOS describe (formato ipsativo)
- Genera **16 perfiles** (listados abajo)
- Tiene historial guardado en localStorage

**Perfil de Dilio: a confirmar directamente con él.** Sin embargo, por sus comportamientos observados (mueve equipos, alta energía, alta exigencia, visión clara), es probable un perfil **DI o D** (El Resolutivo u Orientado a Resultados).

---

## Los 16 Perfiles del Sistema DISC de Dilio

Extraídos directamente del evaluador HTML. Estos son los nombres canónicos del sistema:

| # | Icono | Nombre | Perfil DISC sugerido | Descripción corta |
|---|-------|--------|---------------------|-------------------|
| 1 | ⚡ | **Realizador** | D alto | Metas propias profundas, fuerte responsabilidad, combina metas personales con organizacionales |
| 2 | 🔬 | **Perfeccionista** | C alto | Metódico, preciso, procedimientos ordenados, busca estabilidad y claridad |
| 3 | 💡 | **Creativo** | DC | Dos fuerzas: resultados vs. perfección. Prevé el enfoque correcto y efectúa cambios oportunos |
| 4 | 🎯 | **Objetivo** | C | Pensamiento crítico desarrollado. Precisión y exactitud. Control indirecto vía normas |
| 5 | 🤝 | **Persuasivo** | DI | Hace negocios amistosamente mientras persigue objetivos. Convence y retiene |
| 6 | 📣 | **Promotor** | I | Red de contactos extensa. Gregario, sociable, genera entusiasmo hacia proyectos |
| 7 | 💬 | **Consejero** | IS | Resuelve problemas ajenos. Afecto, empatía, comprensión. Relaciones íntimas y de confianza |
| 8 | 🌿 | **Agente** | S | Relaciones humanas. Empatía, tolerancia, sabe escuchar. Busca armonía y cooperación |
| 9 | 📊 | **Evaluador** | IC | Ideas creativas aplicadas a fines prácticos. Competitivo, directo pero muestra empatía |
| 10 | 🔥 | **Resolutivo** | D | Individualista, busca nuevos horizontes. Extremadamente autosuficiente e independiente |
| 11 | 🏆 | **Orientado a Resultados** | DI | Enérgico, directo, rápido de pensamiento y acción. Evita lo que lo restrinja |
| 12 | 🛠 | **Especialista** | S | Conserva pautas conocidas. Eficiente en áreas especializadas. Planeación cuidadosa |
| 13 | 🔭 | **Investigador** | CD | Tareas técnicas retadoras. Responde a la lógica más que a la emoción |
| 14 | 🎖 | **Profesional** | SC | Estilo relajado, diplomático, afable. Autodisciplina, evalúa a otros por sus estándares |
| 15 | ✨ | **Alentador** | SI | Sabe los resultados que quiere pero no los verbaliza de inmediato. Ofrece a cada persona lo que necesita |
| 16 | 🌀 | **Desconcertante** | Mixto | Perfil poco común. Combinación inusual de fuerzas. Difícil de predecir |

**Correspondencia con informes reales:**
- 🛠 Especialista → Sebas (S) ✅ *nombre coincide exactamente*
- 📊 Evaluador → Jenny (IC) ✅ *en informe: "El Evaluador Estratégico"*
- ✨ Alentador → Angélica (DI) ✅ *nombre coincide exactamente*
- 🎖 Profesional → Sandra (SC)? ⚠️ *informe usa "La Guardiana del Orden", no "Profesional"*

> 🔴 **Conclusión importante:** Los nombres en los informes personalizados pueden diferir de los nombres del sistema. Dilio adapta el nombre al tono del coaching individual. La app debe usar el nombre que aparece en el informe PDF de cada persona (no el nombre genérico del sistema).

---

## Comparativa por Dimensión — Los 4 Perfiles

### Temores (lo que la app puede mostrar al Arquitecto)

| Perfil | Temor central | Señal de activación |
|--------|--------------|---------------------|
| S / Especialista | Cambios abruptos, perder control de lo aprendido | Incomodidad, resistencia inicial, cerrarse |
| IC / Evaluador | Decidir con información incompleta | Análisis paralizado, demora en dar postura |
| DI / Alentador | Perder posición o autoridad | Endurecimiento, confrontación, control excesivo |
| SC / Guardiana | Que algo salga mal bajo su responsabilidad | Sobrecontrol, asume carga extra, habla menos |

### Comportamiento bajo presión (crítico para el Arquitecto)

| Perfil | Qué hace | Cómo parece desde afuera | Cómo gestionarlo |
|--------|----------|--------------------------|-----------------|
| S / Especialista | Se cierra en su trabajo | Distante, silencioso | Darle estructura y tiempo |
| IC / Evaluador | Busca más info antes de decidir | Lento, indeciso | Pedirle una recomendación concreta |
| DI / Alentador | Se vuelve más dominante | Agresivo, intimidante | No confrontar directo; señalar impacto |
| SC / Guardiana | Habla menos, hace más | Estable por fuera, cargada por dentro | Preguntar cómo está, aliviar carga |

### Plan PRIME resumido (qué necesita cada perfil para crecer)

| Perfil | El salto clave |
|--------|----------------|
| S / Especialista | Apertura al cambio + compartir conocimiento |
| IC / Evaluador | Confiar en su criterio + verbalizar más |
| DI / Alentador | Liderar con empatía + escuchar sin perder autoridad |
| SC / Guardiana | Delegar con estándar claro + no ejecutar todo |

---

## 🏗️ Impacto en el Diseño de Mi Equipo (M3)

### Lo que la app necesita almacenar por persona

| Campo | Fuente | Tipo de dato |
|-------|--------|-------------|
| Nombre del perfil | Informe PDF (manual) | Texto |
| Letras DISC (D/I/S/C) | Informe PDF (manual) | Select múltiple |
| Icono del perfil | Calculado desde letras | Emoji |
| Estado actual: Luz o Sombra | Arquitecto lo actualiza | Toggle |
| Temor dominante | Del informe (pre-cargado por perfil) | Texto auto-sugerido |
| Señal de sombra | Del informe (pre-cargado por perfil) | Texto auto-sugerido |
| Plan PRIME (resumen) | Del informe (manual) | Texto libre |
| Alineación rol ↔ perfil | Arquitecto la evalúa | Alta / Media / Baja |
| Nivel LOS actual | Arquitecto lo define | N1–N5 |
| Meta de nivel LOS este mes | Arquitecto la define | N1–N5 |
| KPI principal del rol | Workbook S7 | Texto + número |
| Informe PDF | Upload | PDF adjunto |

### Pantalla sugerida — Vista de un colaborador

```
┌─────────────────────────────────────────────────────────┐
│  👤 Jenny Morales                    [📄 Ver informe]    │
│  Cargo: Marketing Manager                               │
│  ─────────────────────────────────────────────────────  │
│  DISC: IC  📊 El Evaluador Estratégico                  │
│  Estado: ☀️ Luz   [cambiar a 🌑 Sombra]                 │
│  ─────────────────────────────────────────────────────  │
│  📍 Nivel LOS: N2 Investigador → 🎯 Meta: N3           │
│  📊 KPI: Propuestas enviadas / Meta: 10/semana         │
│  ─────────────────────────────────────────────────────  │
│  💡 Recuerda: Su temor es decidir sin info completa.   │
│     Si la ves paralizada: pídele una recomendación.    │
│  ─────────────────────────────────────────────────────  │
│  🟡 Alineación: Media → Desarrollar                    │
└─────────────────────────────────────────────────────────┘
```

### Reglas de negocio específicas de Mi Equipo

1. **El informe PDF se sube una vez** — la app lo adjunta al perfil. El Arquitecto puede verlo siempre.
2. **El estado Luz/Sombra lo actualiza el Arquitecto** — no el sistema. Es una evaluación subjetiva semanal.
3. **El nombre del perfil viene del informe** — no se calcula automáticamente. Si no hay informe, se puede ingresar el perfil DISC (letras) y la app muestra el nombre del sistema.
4. **Los temores se pre-cargan** como texto sugerido según las letras DISC ingresadas — el Arquitecto puede editar.
5. **La alineación** (Alta/Media/Baja) la evalúa el Arquitecto mirando si el perfil DISC natural coincide con las demandas del rol actual.
6. **DISC pendiente de pago:** Si el colaborador no tiene informe, la app muestra estado "DISC pendiente" con botón para gestionar el pago (~$100).

---

## Nuevos elementos para DISCOVERY.md

1. **Los 16 perfiles del sistema DISC de Dilio** (con nombres e iconos) — agregar a sección DISC de DISCOVERY.md
2. **El evaluador HTML de Dilio** existe como herramienta gratuita alternativa al test de $100
3. **"PRIME"** es el estado óptimo hacia el que apunta cada informe — debe ser un concepto visible en la app
4. **Los informes usan nombres personalizados** que pueden diferir de los nombres genéricos del sistema

## Pendientes

| # | Pendiente |
|---|-----------|
| 1 | Confirmar perfil DISC de Dilio Donado (pedir directamente) |
| 2 | Decidir si integrar el evaluador HTML de Dilio como feature de la app |
| 3 | Definir si la app pre-carga los 16 perfiles con sus temores/señales o si el Arquitecto ingresa todo manual |

---

*Análisis Fase 3 completado — Mayo 2026*
