# Pendientes de revisión (decisiones de producto a confirmar)

> Cosas que **funcionan** pero que Sebas quiere **revisar/decidir** antes de darlas por buenas.
> No son bugs: son decisiones de diseño/visibilidad. Cada ítem dice cómo está hoy y las opciones.
>
> **§2–§5 son de otro tipo:** vienen del feedback de Dilio del 25/07/2026 y **bloquean
> entregables concretos** de los sprints S21–S31. Cada uno dice qué sprint frena.
> Fuente: [`OBSERVACIONES_DILIO_2026-07.md`](OBSERVACIONES_DILIO_2026-07.md) ·
> Plan: [`SPRINTS.md`](SPRINTS.md) § BLOQUE JUL-2026.

---

## 1. Visibilidad de los KPIs (módulo `/dashboard/kpis`) — ✅ DECIDIDO (2026-07-05)

**Decisión: (b) KPIs por colaborador**, con un matiz sobre la creación: cada colaborador
puede **autocrear y ver solo sus propios KPIs**; el Arquitecto sigue viendo y creando los
de toda la empresa (rol de supervisión). El tope de **5 KPIs/semana pasa a ser por
persona**, no por empresa.

**Implementado** (migración `kpis_por_colaborador`, aplicada 2026-07-05):
- RLS `SELECT`: `owner_id = auth.uid() OR (arquitecto AND company_id = propia)`.
- RLS `INSERT`: `company_id = propia AND (owner_id = auth.uid() OR arquitecto)` — antes
  solo el Arquitecto podía crear KPIs; ahora cada colaborador también autocrea los suyos.
- RLS `UPDATE`: sin cambios funcionales (dueño o arquitecto).
- UI (`apps/web/.../dashboard/kpis/page.tsx`): el tope "máx 5" y el botón "Nuevo KPI" ahora
  se calculan sobre **los KPIs propios** (`myKpis`), no sobre el total visible. El Arquitecto
  ve, junto a cada card, de quién es ("Tuyo" / nombre del colaborador) ya que su vista incluye
  los de todo el equipo.

<details>
<summary>Contexto original de la revisión (2026-06-27)</summary>

**Hoy (antes del cambio):** los **KPIs eran de la empresa y los veía TODO el equipo**
(colaboradores incluidos). Era el diseño del método TBM (tablero compartido del equipo ·
Ley de Pearson: "lo que se mide se gestiona"). Sebas detectó que el colaborador veía los
KPIs que cargaba el Arquitecto y lo quiso revisar.

**Cómo estaba armado (técnico):**
- Tabla `kpis`: `company_id`, `owner_id`, `name`, `type` (leading/lagging), `unit`,
  `weekly_target`, `current_value`, `week_date` (lunes), `is_active`. Semanal, máx 5.
- RLS: crear = solo Arquitecto · ver = todos los miembros (`company_id = auth_company_id()`)
  · actualizar valor = dueño (`owner_id = auth.uid()`) o Arquitecto.

**Opciones evaluadas:**
- (a) Dejar como está → tablero compartido del equipo (diseño del método original).
- (b) KPIs por colaborador (cada uno ve/carga solo los suyos) → **elegida**.
- (c) Solo el Arquitecto los ve (tablero privado del líder).

</details>

---

## 2. Nivel de delegación: ¿lo asigna el líder o lo calcula el sistema? — ⏳ PENDIENTE (Dilio)

**Ya NO bloquea nada** *(actualizado 2026-07-29, al implementar S22)*. Se verificó que **hoy
ya lo asigna el líder a mano** (`los-section.tsx:50-62`, con `editable`), así que S22 colgó la
insignia y el aviso de ascenso del flujo que **ya existía**. La pregunta sigue abierta solo
para decidir si además se agrega un **cálculo automático**; si Dilio lo pide, se suma el
disparador sin rehacer lo hecho. La opción (c) híbrida es la que menos trabajo requiere desde
acá, porque el paso manual del líder ya está construido.

**Hoy:** los 5 niveles (**Cadete → Investigador → Delegado → Doctor → Socio**) viven en
`LOS_LEVELS` (`lib/disc.ts`) y se muestran en `/equipo`. El valor está en
`profiles.los_level`, cargado a mano.

**Por qué está abierto:** Dilio dudó en voz alta en la meet del 25/07 — *"el tema de si es
cadete y eso, yo no estoy tan seguro… me gustaría que el líder lo considera un cadete"* —
pero en la misma frase pidió que el ascenso sea automático: *"si sube de rango porque lo
hace bien, que aparezca que subió de rango"*. Las dos cosas no conviven sin una regla.

**Opciones:**
- (a) **El líder asigna**, el sistema solo muestra → simple, fiel a *"el líder lo considera"*.
  El ascenso nunca es automático: alguien tiene que acordarse de subirlo.
- (b) **El sistema calcula** desde el comportamiento (tareas completadas sin rebote,
  Escudo Anti-Boomerang, cumplimiento de KPIs) → cumple *"si sube de rango, que aparezca"*,
  pero hay que definir los umbrales y el líder pierde control.
- (c) **Híbrido:** el sistema **propone** el ascenso y el líder **confirma** → conserva el
  criterio humano y el momento de celebración. *Recomendación de Sebas, a confirmar.*

**Nota:** la insignia visible (la mitad del entregable) **no depende de esta decisión** y se
puede construir igual. Lo que espera es el disparador del ascenso.

---

## 3. Validación de delegación: ¿bloquea o solo advierte? — ⏳ PENDIENTE (Dilio)

**Bloquea:** S24 · Entregable 2 (gate de calidad en el wizard de delegación).

**Hoy:** `components/delegacion/task-wizard.tsx` valida que los campos no estén vacíos. Nada
juzga la **calidad** de lo escrito.

**Lo que dijo Dilio:** *"el sistema debe **impedir** que yo delegue mal… debe decirme: a
pesar de que estás escribiendo esto, la delegación está incompleta"*. Literalmente
bloqueante.

**Por qué se revisa igual:** el juicio lo pone un modelo de IA, que se equivoca. Un gate duro
puede **bloquear a alguien que escribió bien** — y eso enseña a los usuarios a odiar el
módulo central de la app. El costo del falso positivo es alto y silencioso.

**Opciones:**
- (a) **Bloqueo duro** — fiel al pedido. No se guarda hasta que la IA apruebe.
- (b) **Advertencia fuerte + fricción** — se puede guardar, pero con confirmación explícita
  ("guardar igual") y la tarea queda marcada como delegación incompleta, visible para el
  líder. *Recomendación de Sebas:* cumple la intención (que no se delegue mal sin darse
  cuenta) sin regalarle a un modelo el poder de veto.
- (c) Bloqueo duro **solo** cuando el campo está objetivamente vacío o es trivial (< N
  caracteres), advertencia para el resto.

**Cómo destrabarlo:** mostrarle a Dilio la versión (b) funcionando. La discusión abstracta
no se cierra; con la pantalla delante, sí.

---

## 3.b `cargo`: ¿lo define la persona o el líder? — ⏳ PENDIENTE (ambigüedad detectada)

**Detectada al implementar S22·E0** (2026-07-29). No bloquea nada hoy.

**Hoy lo editan los dos, sobre la misma columna:**
- La persona, en `/cuenta` (`account-form.tsx:375`) — su "puesto" tal como lo describe ella.
- El líder, en `/equipo` (`equipo-client.tsx:162`) — el cargo que le asigna.

El último que guarda gana, sin aviso. Por eso `cargo` quedó **fuera** del blindaje de campos
de autoridad de E0: si se blindaba, `/cuenta` dejaba de funcionar para todos los colaboradores.

**Opciones:** (a) es del líder → sacarlo de `/cuenta`; (b) es de la persona → sacarlo de
`/equipo` y que el líder use la nueva **ficha de rol** para describir el puesto (ya cubre
"qué hace"); (c) dejarlo compartido y documentarlo. *Recomendación de Sebas: (b)* — la ficha
de rol de S22 ya cumple ese propósito mejor que un texto libre.

---

## 4. Delegación: ¿el "¿DÓNDE?" es un campo real? — ⏳ PENDIENTE (Dilio)

**Bloquea:** S24 · Entregable 3 (~2h, chico).

Dilio enumeró los criterios de una buena delegación: *"¿Qué? ¿Por qué? ¿Cuándo? ¿Cómo?
**¿Dónde?**"*. El wizard tiene los cuatro primeros (QUÉ / POR QUÉ / CÓMO / CUÁNDO + CHECK
LOOP).

**Preguntar antes de construir:** ¿"dónde" es un **campo** (el canal o sistema donde se
entrega el trabajo: Drive, el CRM, impreso) o fue una forma de hablar dentro de la
enumeración? **No inventarlo** — un campo de más en el paso crítico de la app cuesta más que
uno de menos.

---

## 5. Niveles de madurez del empresario: nombres y umbrales — ⛔ BLOQUEANTE (Dilio)

**Bloquea:** S30 completo (~18h). Es el único sprint del bloque que **no puede arrancar**.

**Lo que dio Dilio:**
- **N0 — Cuello de botella:** *"el peor estado, la parte más baja de la productividad"*.
- **N1 — Inicio de arquitectura:** *"permite ver que ya empezamos un proceso de
  transformación"*.
- Habló de *"tres o cuatro parámetros"* en total.

**Lo que falta:** los nombres canónicos de los niveles restantes (N2, N3 y ¿N4?) y, sobre
todo, **los criterios medibles de cada uno**. Sin eso cualquier escala que inventemos va a
chocar con su metodología, y este indicador es de los que el cliente mira primero.

**Candidatos a criterio** (para proponerle, no para decidir solos): delegación activa,
% de decisiones que no pasan por el dueño, nivel LOS promedio del equipo, tareas del dueño
que son ejecución vs. dirección.

**No olvidar:** Dilio remarcó el **retroceso** tanto como el avance — *"si se va cayendo la
vaina, le avisa: estás volviendo a ser el cuello de botella"*. Los umbrales tienen que
servir para bajar de nivel, no solo para subir (y necesitan histéresis, o el indicador
oscila).
