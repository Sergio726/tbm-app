# Preguntas para Dilio — decisiones de método (jun 2026)

> Surgieron al digerir el material canónico **TBM 4** (presentaciones S1–S6 +
> transcripciones) en [`METODO_TBM_CANONICO.md`](METODO_TBM_CANONICO.md). Son **2
> decisiones de método** que la app necesita para no construir sobre contenido viejo
> (divergencias **D3** y **D4** del §8 de ese doc). El resto de divergencias ya se
> resolvieron solas (naming LOST, ARQI 4 pilares).
>
> **Cómo usar este doc:** enviarle a Dilio la versión corta de abajo (§"Para enviar").
> Cuando responda, registrar las respuestas acá y abrir los tickets de implementación.

---

## Contexto de las dos preguntas

### D3 — El módulo "Multiplicador" de la app vs. tu Sesión 5 nueva

Hoy en la app hay un módulo **Multiplicador** (diagnóstico de "ROI de Talento") que el
arquitecto completa y le da un puntaje. Está armado sobre **3 conceptos de una versión
anterior de tu método**:
- **Los 3 Pecados del Líder Caro**: el Rescatista, el Marcapasos, el Respuesta-Rápida.
- La **estadística del 48%** ("tu equipo opera al ~48% de su capacidad").
- La **"Definición de Hecho" (ARQI)** como una de las herramientas.

Pero en tu **presentación TBM 4 de la Sesión 5 (Leadership Multiplier)** esos 3 conceptos
**ya no aparecen** — los reemplazaste por:
- El **modelo de duplicación en 3 fases** (Yo lo hago → Lo hacemos juntos → Tú lo haces).
- Los **3 niveles de multiplicación** (duplicar habilidades → criterio → visión).
- **Genio vs. Hacedor de Genios**, la **zona de impacto único**, y "¿estás multiplicando
  o acumulando?".
- Las **métricas de multiplicación** (¿cuántas decisiones pasan por vos vs. hace 6 meses?, etc.).

**Lo que necesitamos definir:** cómo querés que quede el módulo Multiplicador de la app.

### D4 — ¿Pre-Game y "Los 5 Grandes" son uno o dos rituales?

Acá hay una diferencia entre **dos fuentes tuyas**:

- En tus **18 respuestas anteriores** nos dijiste que son **dos herramientas distintas en
  momentos distintos**: el **Pre-game** es **matutino y personal** del líder (3 Big Wins
  personales + la Marcha de 20 Millas), y **Los 5 Grandes** son **nocturnos y del negocio**
  (5 prioridades para el día siguiente, alineadas a las Rocas del trimestre). Así está hoy
  construida la app: dos pantallas separadas.

- En tu **presentación TBM 4 de la Sesión 4 (Biología del Líder)**, el **Pre-Game = Los 5
  Grandes**: "5 cosas que si las hacés hoy, el día fue exitoso", **escritas la noche
  anterior**, y que **incluyen la vida personal** (no solo el negocio). Ahí aparecen como
  **un solo ritual**, no dos.

**Lo que necesitamos definir:** ¿la app mantiene los dos rituales separados, o los unifica
en uno?

---

## Para enviar a Dilio (versión corta)

> Hola Dilio 👋 Terminamos de volcar tu material nuevo (TBM 4) a la app y nos quedaron
> **2 decisiones tuyas** para no dejar nada del método viejo. Son rápidas:

**1) Módulo "Multiplicador" 🧮**
En la app, el líder hace un diagnóstico de multiplicación basado en **los 3 Pecados
(Rescatista / Marcapasos / Respuesta-Rápida)** y el **48%**. En tu **Sesión 5 nueva** eso
ya no está — ahora usás el **modelo de duplicación (3 fases)** y los **3 niveles de
multiplicación**. ¿Qué hacemos con el módulo?
- **a)** Lo dejamos como está (3 Pecados + 48%).
- **b)** Lo reemplazamos por el modelo nuevo de la Sesión 5 (duplicación + 3 niveles).
- **c)** Mezcla: el diagnóstico de los 3 Pecados queda como herramienta, pero agregamos
  el modelo nuevo como el marco principal.
- ¿Los **3 Pecados** y las **Fichas de Póker** siguen siendo parte del método, o los
  retiraste del todo?

**2) Pre-Game y "Los 5 Grandes" 🌙☀️**
Antes nos dijiste que eran **dos cosas distintas**: Pre-game **de mañana y personal** (3 Big
Wins + Marcha de 20 Millas) y Los 5 Grandes **de noche y del negocio**. En tu **Sesión 4
nueva**, el Pre-Game **son** Los 5 Grandes: 5 cosas escritas la noche anterior que **incluyen
lo personal**. ¿Cómo lo dejamos?
- **a)** Dos rituales separados, como está hoy (Pre-game mañana/personal + 5 Grandes
  noche/negocio).
- **b)** Un solo ritual: "Pre-Game = Los 5 Grandes" (5 cosas la noche anterior, mezclan
  negocio y vida personal).
- Si es **b**, ¿qué pasa con los "3 Big Wins personales" y la "Marcha de 20 Millas" —
  entran dentro de los 5, o se mantienen como campos aparte?

> Con esas 2 respuestas dejamos el método 100% alineado a TBM 4. 🙌

---

## Sugerencia nuestra (no vinculante, para acelerar)

- **D3:** opción **(c)** — mantener el diagnóstico de los 3 Pecados como "autoevaluación
  rápida" pero encuadrarlo dentro del **modelo de duplicación** de la Sesión 5 como marco
  principal. Así no se pierde lo construido y queda alineado a lo nuevo. *(Cambio mediano:
  toca `multiplicador` + `MULTIPLICADOR_SINS`/`scoreBandForTotal` en `database.ts`.)*
- **D4:** esperar la respuesta antes de tocar nada — es el corazón de los rituales (S2) y un
  cambio acá impacta Pre-game, Los 5 Grandes, el gate del War Up y los workbooks. Bajo
  riesgo de equivocarse, alto costo de rehacer.

---

## Respuestas de Dilio

*(pendiente — registrar acá cuando responda, con fecha. Luego abrir tickets en `PROGRESS.md`.)*

- **D3:** …
- **D4:** …
