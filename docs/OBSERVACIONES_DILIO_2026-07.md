# Observaciones de Dilio Donado — round jul-2026

> **Origen:** transcripción de la Meet **Dilio ↔ Sebas del 25/07/2026** (37 min,
> Google Drive: *"Meet Dilio - Sebas 25/07/2026"*).
> **Cruce contra el código:** 2026-07-29 (estado real del repo, post `b0350f1`).
> **Round anterior:** [`OBSERVACIONES_DILIO_2026-06.md`](OBSERVACIONES_DILIO_2026-06.md)
> — este doc **no lo reemplaza**, lo continúa. Los ítems de junio que siguen
> abiertos (3 gráficas DISC, meditaciones, LOST) no se repiten acá.
> **Alcance:** solo la **app TBM**. Los acuerdos comerciales de la misma reunión
> van al final como *fuera de scope*, para no perderlos.

**Ojo con el naming:** Dilio llama al producto **"DC"** (su executive coach
digital), no "TBM app". En los mensajes salientes él quiere esa voz: *"aquí DC,
tu executive coach"*.

---

## Leyenda

- ✅ **Ya cubierto** — no re-implementar.
- 🟡 **Parcial** — la base existe; falta exactamente lo que pide Dilio.
- ❌ **Pendiente** — feature nueva.
- ⛔ **Bloqueado** — depende de un insumo externo.
- 🔍 **Revisar** — hay que verificar el estado antes de estimar.

---

## Lo que Dilio dijo que YA está bien

No tocar sin razón — son las piezas que él validó explícitamente:

- **Pre-game:** *"está muy bien"*.
- **Sprints:** *"eso está muy bien hecho"* (salvo el anclaje al calendario, ver F1).

---

## A. Despertador diario (email + WhatsApp)

### A1 · Email matinal a **cada usuario**, con voz de DC — 🟡

Dilio: *"sería bueno que el sistema te despierte con un correo"*, con la voz de DC
y **sugiriendo a la persona lo que ella misma dijo que hace diariamente**.

- **Hoy (`src/app/api/cron/daily/route.ts` §B):** hay un digest matinal, pero
  1. va **solo al Arquitecto**, no a los colaboradores;
  2. es **condicional** (`if (lines.length === 0) continue`) — si está todo al día
     no llega nada, así que no funciona como despertador;
  3. el copy es genérico (*"🧭 TBM hoy"*), no tiene la persona de DC;
  4. **no incluye los hábitos declarados** del usuario, que ya existen en
     `user_habits` / `habit_logs` (A3.1 de junio).
- **Falta:** email diario a todos los roles, con la voz de DC, listando los hábitos
  que la persona eligió + su Pre-game pendiente. Hora configurable (Dilio menciona
  **5 am**; hoy el cron corre una vez al día, revisar husos y `rituales/config`).

### A2 · Mismo mensaje por **WhatsApp** — ❌ / 🔍 desbloqueado

Dilio: *"ojalá también un mensaje al WhatsApp… buenos días, aquí DC, tu executive
coach, recuerda hacer tu pre-game"*.

- **Hoy:** cero WhatsApp en el repo (grep sin resultados).
- **Desbloqueo confirmado en la meet:** *"—¿Ya la tienen? —Sí, ya la tienen"*. La
  **API de WhatsApp ya está contratada** y se la habían dado a **Mike** para
  correr su CRM. **Contacto: Juan José (Juanjo)**, canal *"Plataformas"*.
- **Tareas:** pedir credenciales a Juanjo → capa de envío (`lib/whatsapp.ts` espejo
  de `lib/email.ts`) → campo teléfono verificado en `profiles` → opt-in y opt-out →
  plantillas aprobadas por Meta (WhatsApp exige *message templates* para mensajes
  iniciados por el negocio: **esto es el cuello de botella real, no el código**).

---

## B. Delegación: que el sistema **impida delegar mal**

### B1 · Validación de **calidad** (no solo de completitud) — 🟡

Dilio: *"si voy a delegar algo, el sistema debe impedir que yo delegue mal… debe
decirme: a pesar de que estás escribiendo esto, la delegación está incompleta"*, y
además **sugerirle la redacción**.

- **Hoy (`components/delegacion/task-wizard.tsx`, 687 líneas):** el wizard ya pide
  QUÉ (Definition of Done) · POR QUÉ · CÓMO · CUÁNDO · CHECK LOOP. La estructura
  que pide Dilio **ya está**.
- **Falta:** el juicio. Hoy se valida que el campo **no esté vacío**; no hay nada
  que detecte *"esto está escrito como actividad, no como entregable"*. Es un
  gate con IA sobre cada paso: puntaje de calidad + reescritura sugerida
  (aceptar / editar), reusando el patrón de `lib/ai-report.ts`.
- **Decisión pendiente:** ¿bloquea el guardado o solo advierte? Dilio dice
  *"impedir"* — literalmente bloqueante. Confirmar con él antes de implementar,
  porque un gate duro con IA falible es riesgoso.

### B2 · ¿Falta el campo **DÓNDE**? — 🔍

Dilio enumeró *"¿Qué? ¿Por qué? ¿Cuándo? ¿Cómo? ¿Dónde?"*. El wizard tiene los
cuatro primeros. **Preguntarle** si el "dónde" es un campo real (canal/sistema
donde se entrega) o solo un modo de hablar. No inventarlo hasta confirmar.

---

## C. Rol **Super Coach** — el bloque más grande del round

Dilio, sobre su propia cuenta: *"vos entras y no ves nada, solamente ves dos
opciones… porque no le hemos definido un rol a ese coach"*.

### C0 · 🔍 **Revisar primero:** ¿por qué Dilio no ve el panel?

`/super-coach/page.tsx` **existe** (247 líneas, capa 1: semáforo por empresa
alumna) pero arranca con un guard:

```
if (!assignments || assignments.length === 0) redirect("/dashboard");
```

Sospecha fuerte: **la cuenta de Dilio no tiene filas en `coach_assignments`**, así
que ve el dashboard normal y cree que el módulo no existe. **Verificar en la base
antes de construir nada** — puede ser un alta de datos de 5 minutos, no una feature.

### C1 · Adopción: *"¿están utilizando el sistema?"* — 🟡

- **Hoy:** el panel ya muestra semáforo de scorecard, War-Ups cerrados en 7 días y
  progreso de rocas.
- **Falta:** una métrica explícita de **uso/adopción** por empresa (Pre-games
  completados, logins, workbooks avanzando) y su tendencia.

### C2 · Alertas de **cosas relegadas en el tiempo** — ❌

*"encuentra rápidamente las alertas de las cosas que se van quedando relegadas para
que el consultor pueda intervenir: ey, esto se nos está quedando, ¿qué pasó?"*.
Bandeja de alertas cross-empresa, ordenada por antigüedad del atasco.

### C3 · Ver los **DISC** de todas las empresas — 🟡

El coach debe poder ver los perfiles. Hoy el RLS de `disc_assessments` es
**solo arquitecto** (auditado en junio, B1). Hay que abrir un carril para el rol
coach **sin romper** la regla de que el colaborador no ve a sus compañeros.

### C4 · Alerta de **equipo desbalanceado por composición DISC** — 🟡

*"contrataste cinco dominantes en esa área, aquí vamos a tener problemas de
conexión"*.

- **Hoy:** B6 de junio ya construyó el rombo + `detectPairCrossings` con
  `TBM_DISC_CRUCES`, y quedaron las heurísticas de composición como señal
  secundaria — **justo lo que Dilio pide acá**.
- **Falta:** subir esa señal al panel del coach a nivel *"esta empresa tiene un
  problema de constitución de equipo"*.

### C5 · **Mensajería interna** coach → líder / coach → colaborador — ❌

*"puede interactuar con el líder, puede interactuar con el equipo"*. No existe
mensajería en el repo. Tabla + bandeja + notificación. **Feature grande.**
Alternativa barata a evaluar: reusar el canal de notificaciones + email en lugar
de construir un inbox completo.

### C6 · **Asistente IA del coach** (multi-empresa) — ❌

*"que esté vigilando todas las compañías, los puntos críticos que se van quedando y
alertándome: esta empresa se está quedando, aquí no están registrando nada, aquí no
se está documentando nada"*.

- Es Jarvis pero con **scope cross-empresa** y **push** en vez de pull.
- Depende de C2 (hay que tener las señales antes de que la IA las narre).

> **Por qué importa comercialmente:** Dilio lo dijo explícito — *"para la
> consultora, para Newway se vuelve muy importante, porque cuando nosotros
> asignamos cosas por hacer, ahí nos damos cuenta si la gente lo está haciendo"*.
> Este bloque es **el producto para la consultora**, no un extra.

---

## D. Capacitación: grabar → transcribir → **SOP en PDF**

### D1 · Grabación **dentro del sistema** — ❌

Dilio: *"yo debiese tener una opción que me permita a mí grabar el video"*, en la
pestaña de mentoría que cuelga de las **5 Rocas**.

- **Hoy (`components/plan-90d/activo-form.tsx:128-131`):** el campo es un **input de
  texto**, `placeholder="Link al video (Loom, YouTube…)"`. Es exactamente la
  fricción que Dilio señaló: *"te dice sube un link… no lo puede hacer
  directamente"*.
- **Sebas en la meet:** *"el sistema debería tener la capacidad de grabar"*, porque
  Loom implica cuenta, pago y dos pasos más para el empresario.
- **Tarea:** grabación in-app (`MediaRecorder` + `getUserMedia`, pantalla + cámara)
  → subida a Supabase Storage.

### D2 · Transcripción + **PDF de máximo 2 páginas** — ❌

*"grabar, transcribir y generar el proceso en un PDF de máximo dos hojas. No puede
ser más porque nadie lee esa vaina, y que los títulos queden bien establecidos para
que sea fácil encontrarlos: ¿cómo hacer tal cosa? ¿cómo hacer tal otra?"*

- Pipeline: audio → transcripción (Whisper o similar) → resumen a SOP con IA →
  PDF con **títulos en forma de pregunta** y **tope duro de 2 páginas**.
- El límite de 2 páginas es un **requisito de producto explícito**, no una
  sugerencia: hay que forzarlo en el prompt y validarlo al renderizar.

---

## E. KPIs en cascada — segundo bloque más grande

### E1 · Del **5 Grandes** al KPI individual, obligatorio — ❌

Dilio: *"cuando tú estableces los cinco grandes estratégicos, el sistema tiene que
obligar a que la persona describa claramente a cada implicado cuáles son los
indicadores con los que él aportaría al tema general"*.

Su ejemplo textual: 5 clientes/mes = $25.000 → responsables Sebastián (3) y Dilio
(2) → cada uno con su aporte en dinero, **llamadas** y **propuestas enviadas**.

- **Hoy:** `/dashboard/kpis` (384 líneas) es una lista **semanal y plana**
  (nombre, target, unidad, leading/lagging, owner). **No hay jerarquía** contra
  `rituales/5-grandes` ni descomposición meta → responsable → actividad diaria.
- **Falta:** vincular KPI a los 5 Grandes + reparto por responsable + actividades
  diarias derivadas.

### E2 · **Sugerencia de KPIs con IA** — ❌

*"ahí el sistema tiene que sugerirle cosas a la persona porque si no, no lo van a
poder hacer. A veces la gente no sabe cómo asignar un KPI."*

### E3 · **Check diario** de actividades — ❌

*"diariamente el sistema le tiene que decir al responsable: ¿hiciste las llamadas?
¿mandaste las propuestas? ¿tocaste la puerta?"*. Marcado diario, no semanal.

### E4 · Alerta **predictiva** (parabrisas, no retrovisor) — ❌

Cita clave del método: *"no miremos el retrovisor, siempre el parabrisas. No
lleguemos al final del mes para decir: no lo lograste, y marcar el semáforo en
rojo."*

- Al colaborador: *"estás atrasado en este KPI, no lo vas a lograr en el mes"*.
- Al líder: *"Fulanito lleva tres días sin avanzar en el tema"*.
- Canal preferido por Dilio: **WhatsApp** (depende de A2).
- Técnicamente: proyección lineal (ritmo actual vs. días restantes) → si no llega,
  dispara. **No** esperar al vencimiento.

### E5 · **Autogestión**: el colaborador arma su propia estructura — ❌

Sebas preguntó si el colaborador puede cargar sus propios KPIs o solo recibirlos.
Dilio: *"no, no, él también puede armar su propia estructura para lograrlo, y eso
es muy importante lo que acabas de preguntar, porque nosotros predicamos una
**cultura de autogestión**"*.

- **Hoy:** el RLS ya deja que el colaborador vea los suyos. **Revisar si puede
  crearlos** (hoy el form parece pensado para el arquitecto).

---

## F. Sprints anclados al **año calendario**

### F1 · No permitir sprints fuera del trimestre calendario — ❌

Dilio: *"si la persona empieza tarde, no puede poner los sprints fuera del rango de
los tres meses… nuestro año sprint casa con el año calendario"*.

- Trimestres fijos: **ene-mar · abr-jun · jul-sep · oct-dic**.
- Quien arranca tarde **recorta** su sprint; no lo extiende hacia el trimestre
  siguiente.
- **Hoy (`components/plan-90d/rocks-panel.tsx:42-47`):** el "Día X de 90" se calcula
  desde el `start_date` activo **más antiguo** — es un contador flotante, **sin
  anclaje al calendario**. Hay que validar `start_date`/`end_date` contra el
  trimestre y ajustar el copy.

---

## G. Jarvis / DC: de **pasivo** a **activo**

### G1 · Acompañamiento proactivo en cada etapa — ❌

Diagnóstico de Sebas en la meet, confirmado por Dilio: *"hoy la IA es pasiva,
cuando yo la invoco recién me contesta. Deberíamos hacerla más activa, que esté
ahí acompañándole, monitoreando lo que hace"*. Dilio: *"clave, clave, porque así la
gente va teniendo el ejercicio más profesional"*.

- **Hoy:** `api/jarvis/route.ts` (412 líneas) es request/response.
- **Falta:** intervenciones contextuales — mientras delega (B1), mientras define
  KPIs (E2), mientras completa un workbook. Este ítem es **el paraguas** de B1 y E2:
  conviene diseñar el patrón una vez y reusarlo, no tres asistentes distintos.

---

## H. Estado del empresario: ¿seguís siendo el cuello de botella?

### H1 · Indicador de madurez con niveles y **retroceso** — ❌

Dilio: *"el sistema tiene que estar concatenado e irle diciendo al dueño dónde se
encuentra: ¿sigue siendo el cuello de botella? ¿ya tenés equipo? Tres o cuatro
parámetros… cuello de botella es el peor estado, la parte más baja de la
productividad. Un segundo nivel que permita ver que ya empezamos un proceso de
transformación, inicio de arquitectura…"*. Y crítico: *"si se va cayendo la vaina,
le avisa: estás volviendo a ser el cuello de botella"*.

- **Hoy:** *"cuello de botella"* aparece **solo como texto** en
  `lib/workbook-sessions.ts`. No hay estado calculado ni visible.
- **Falta:** definir 3-4 niveles con **criterios medibles** (delegación activa,
  % de decisiones que no pasan por el dueño, LOS del equipo), mostrarlo, y
  **alertar el retroceso** — que es lo que Dilio remarcó.
- ⛔ **Necesita a Dilio:** los nombres canónicos y los umbrales de cada nivel. Él
  dio N0 (cuello de botella) y N1 (inicio de arquitectura); faltan los demás.

---

## I. **Rights**: la ficha de rol de cada persona

### I1 · Definición de rol + derechos de decisión — ❌

Dilio: *"los rights no están tan claros… cuando creo el rol de la persona —y eso es
una cosa que creo que no está en la plataforma, no lo he visto— el rol tiene que
decirle a la persona qué hace, cómo lo hace, las expectativas que se tienen con él,
los resultados que buscamos al tenerlo en el equipo, y sus derechos"*.

El ejemplo de derechos es **monetario y concreto**: *"tú puedes decidir hasta
$X.000 sin preguntarme a mí. No me preguntes, ejecuta, dale, tú me respondes por el
billete."*

- **Hoy:** `profiles` tiene `cargo` (texto libre) y `los_level`. **No hay ficha de
  rol ni límite de decisión.**
- **Falta:** ficha estructurada (qué hace · cómo · expectativas · resultados ·
  derechos · **tope de decisión en $**), visible tanto para el líder como para la
  persona.

---

## J. Nivel de delegación **visible** (insignia)

### J1 · Insignia junto al nombre + aviso de ascenso — 🟡

- **Hoy:** los 5 niveles (Cadete → Investigador → … → Socio) existen en
  `LOS_LEVELS` (`lib/disc.ts`) y se muestran en `/equipo`.
- **Problema (Sebas, confirmado por Dilio):** *"está como al final del método, no es
  tan fácil encontrarlo"*.
- **Falta:** insignia **al lado del nombre** en la plataforma del propio
  colaborador (*"que él pueda entrar y tener la insignia de cadete, de
  investigador"*) y **notificación cuando sube de rango** (*"si sube de rango
  porque lo hace bien, que aparezca que subió de rango"*).
- 🔍 **Duda abierta de Dilio:** *"el tema de si es cadete y eso, yo no estoy tan
  seguro… me gustaría que el líder lo considera un cadete"*. Es decir: ¿el nivel lo
  asigna el líder o lo calcula el sistema? **Preguntárselo.**

---

## K. 🔴 Bug de acceso reportado en vivo — **prioridad**

### K1 · *"los chicos"* no se pueden conectar — 🔍 **abierto**

Dilio: *"los chicos me estaban contando que están teniendo problemas para
conectarse al sistema. Pregúntale a **Juanjo** ahí en el chat de plataformas qué le
pasó, por qué no se pudo conectar. No sé si es que no le llega el correo."*
Sebas: *"capaz que va a spam"*.

- **Dato importante:** el commit `0763fff` *"invitaciones robustas por token
  propio (no más pendiente)"* es del **23/07** — **dos días ANTES** de esta meet.
  O sea, **el reporte de Dilio es posterior al fix** y no está cubierto por él.
- **Tareas:** hablar con Juanjo → reproducir el alta → revisar logs de envío,
  SPF/DKIM/DMARC y spam del dominio → considerar un fallback de link directo
  copiable, que no dependa del correo.
- **Es el ítem que más rápido erosiona la confianza del cliente.** Va primero.

---

## L. Branding

### L1 · Aplicar paleta + tipografía cuando llegue el manual — ⛔

Dilio preguntó si es difícil cambiar paleta y tipografía; Sebas dijo que es
sencillo y que lo dejó para el final. **Bloqueado** hasta que Dilio entregue el
diseño de marca (lo está trabajando con Juan).
🔍 **Revisar antes:** que no haya colores hardcodeados fuera de los tokens CSS
(`var(--...)`) — hoy la señal es buena, pero conviene un barrido.

---

## Insumos que necesitamos de Dilio (desbloqueos de este round)

| Item | Desbloquea |
|---|---|
| **Credenciales de la API de WhatsApp** (vía Juanjo) | A2, E4 |
| **Diagnóstico del acceso de "los chicos"** (vía Juanjo) | K1 |
| Nombres y **umbrales de los 3-4 niveles** de madurez del empresario | H1 |
| ¿El **nivel de delegación** lo asigna el líder o lo calcula el sistema? | J1 |
| ¿La validación de delegación **bloquea** o solo advierte? | B1 |
| ¿El **"¿Dónde?"** es un campo real del wizard? | B2 |
| **Manual de marca** (colores + tipografía) | L1 |

*(Siguen abiertos los insumos de junio: 365 meditaciones, fórmula de las 3 gráficas
DISC, presentaciones LOST unificadas.)*

---

## Plan de trabajo — dónde vive cada ítem

> **Estos ítems ya están planificados como sprints.** El plan ejecutable, con
> entregables, estimaciones y criterios de éxito, vive en
> [`SPRINTS.md`](SPRINTS.md) § **BLOQUE JUL-2026 (S21–S31)**. Este documento
> queda como el **porqué** (la voz de Dilio + el cruce contra el código);
> `SPRINTS.md` es el **cómo**. No dupliques el plan acá.

| Ítem | Qué es | Sprint | Estado |
|---|---|---|---|
| **K1** | Bug de acceso de colaboradores | **S21** ·E1 | 🔴 abierto |
| **C0** | Panel del coach invisible para Dilio | **S21** ·E2 | 🔍 verificar datos |
| **F1** | Sprints anclados al año calendario | **S21** ·E3 | ❌ |
| **I1** | Ficha de rol + derechos de decisión ($) | **S22** ·E1 | ❌ |
| **J1** | Insignia de nivel + aviso de ascenso | **S22** ·E2 | 🟡 · decisión §2 |
| **A1** | Despertador matinal con voz de DC | **S23** ·E2 | 🟡 |
| **G1** | DC pasivo → proactivo | **S24** ·E1 | ❌ |
| **B1** | Gate de calidad en delegación | **S24** ·E2 | 🟡 · decisión §3 |
| **B2** | ¿Campo "DÓNDE"? | **S24** ·E3 | 🔍 · decisión §4 |
| **E1** | Cascada desde los 5 Grandes | **S25** ·E2 | ❌ |
| **E2** | Sugerencia de KPIs con IA | **S25** ·E3 | ❌ |
| **E5** | Autogestión del colaborador | **S25** ·E4 | 🟡 |
| **E3** | Check diario de actividades | **S26** ·E1 | ❌ |
| **E4** | Alerta predictiva ("parabrisas") | **S26** ·E2-3 | ❌ |
| **C1** | Adopción por empresa | **S27** ·E1 | 🟡 |
| **C2** | Alertas de rezago cross-empresa | **S27** ·E2 | ❌ |
| **C3** | DISC de todas las empresas | **S27** ·E3 | 🟡 |
| **C4** | Equipo desbalanceado | **S27** ·E4 | 🟡 |
| **C5** | Mensajería coach ↔ empresa | **S28** ·E1 | ❌ |
| **C6** | Asistente IA multi-empresa | **S28** ·E2 | ❌ |
| **D1** | Grabación in-app | **S29** ·E1 | ❌ |
| **D2** | Transcripción → SOP en PDF (2 pág.) | **S29** ·E2 | ❌ |
| **H1** | Madurez del empresario | **S30** | ⛔ · decisión §5 |
| **A2** | Canal WhatsApp | **S31** | ⛔ credenciales |
| **L1** | Paleta + tipografía de marca | tarea suelta | ⛔ manual de marca |

**Cobertura:** los 25 ítems de este documento están asignados. **~218h desbloqueadas
hoy** (S21–S29); ~42h esperando insumos (S30, S31, L1). Total ~260h.

### Las tres claves del orden

1. **S21 va primero y no se discute** — es el único sprint que repara cosas que hoy
   le están costando usuarios y confianza al cliente. Es también el más barato (~14h).
2. **S24 es el cuello de botella** — el patrón de IA proactiva se diseña una vez ahí y
   lo consumen S25 (sugerir KPIs) y S27 (narrar alertas). Saltearlo significa
   construir tres asistentes distintos.
3. **S31 (WhatsApp) no bloquea a nadie** — S23, S26 y S28 se construyen contra una capa
   de canal abstracta, así que WhatsApp entra después sin reescribir lógica de negocio.
   Por eso está último pese a que Dilio lo pidió temprano.

### Decisiones que hay que sacarle a Dilio para no frenarse

Registradas en [`PENDIENTES_REVISION.md`](PENDIENTES_REVISION.md) §2–§5:

| # | Decisión | Frena |
|---|---|---|
| §2 | ¿El nivel de delegación lo asigna el líder o lo calcula el sistema? | S22 ·E2 (parcial) |
| §3 | La validación de delegación, ¿bloquea o solo advierte? | S24 ·E2 |
| §4 | ¿El "¿DÓNDE?" es un campo real? | S24 ·E3 (chico) |
| §5 | Nombres y umbrales de los niveles de madurez | **S30 entero** |

Solo **§5 bloquea un sprint completo**. Las otras tres tienen camino alternativo:
se construye la versión conservadora y se ajusta cuando Dilio confirme.

---

## Fuera de scope de la app TBM (acuerdos de la misma reunión)

Registrado para no perderlo. **No es backlog de este repo.**

**Compromisos de Sebas:**
- Mandar a Dilio el **script de scraping** parametrizado (Dilio debe enviar su
  avatar/ICP de la consultora y de TBM) + una primera lista de precalificados.
- **Reunión con Juan José:** conectar API de Meta (métricas de pauta) y API de
  WhatsApp.
- Aplicar el **content engine** (engagement propio + análisis de competencia
  orgánica). Dilio: *"ese es el que estoy necesitando… en contenido orgánico la
  estoy sufriendo"*.
- Poner una persona a hacer la **página web** de TBM (coordinar con Juan, que está
  en la marca).
- Enviar los **$500** + armar el **roadmap de gastos** (evaluación al 3er mes).

**Decisiones comerciales:**
- **Lanzamientos cada 2 meses**, presupuesto ~**$700** (el anterior fue ~$1.000 y
  *"fue un desastre"*). Dilio evaluaba frenar el lanzamiento en curso si su
  responsable no entregaba métricas.
- **YouTube contenido largo** reusando las grabaciones de mentorías (Sebas: a
  diferencia de IG/TikTok, el video sigue trayendo tráfico).
- **Inversionista potencial** — Dilio tiene a alguien del rubro tecnología
  (*"es un tiburón"*): hay que llegar preparados y cuidar la posición de ambos.
- **Reunión con Mike**, amigo de Dilio que armó un CRM con Claude + WhatsApp que
  *"responde, hace seguimiento, vende, cierra"*.

**Discusión de CRM (visión futura, no comprometida):**
- Conectar un **CRM de ventas** al TBM para que el sistema detecte solo si el
  equipo llama, prospecta y manda ofertas — *"sin que la persona me tenga que decir
  si está cumpliendo"*.
- Después: CRM de **servicio al cliente**; el de **operaciones** solo si una
  empresa grande lo paga.
- **Tensión abierta:** Dilio usa GoHighLevel; Sebas advierte que es lento y con
  curva técnica alta, y que atarse a él **restringe el mercado** a quienes ya lo
  tengan.
