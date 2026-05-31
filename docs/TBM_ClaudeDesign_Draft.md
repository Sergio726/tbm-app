# THE BUSINESS MULTIPLIER — App Design Brief

## Project Overview

**App Name:** The Business Multiplier (TBM)
**Type:** Business Operating System (BOS) — web application
**Purpose:** A structured system that guides business leaders through the TBM framework by Dilio Donado. The app enforces the method — users cannot skip steps or bypass required validations.
**Target Users:** Business leaders (CEOs, founders, directors) going through the TBM program; their teams; and Dilio (the coach) who monitors all progress.

---

## Design System

### Brand Personality
- Professional, premium, structured — this is a serious business tool, not a productivity app
- Conveys authority and method — every screen should feel "orchestrated"
- Warm but precise — reflects coaching (human) + system (structured)

### Color Palette

**Primary:**
- Deep Navy: `#0F1B2D` — primary background (dark mode preferred)
- Electric Blue: `#2563EB` — primary action, CTAs, active states
- Cyan Accent: `#06B6D4` — highlights, progress indicators

**Semantic Colors (Semáforo TBM — traffic light system):**
- 🟢 Verde (On Track): `#10B981` — ≥100% of target
- 🟡 Amarillo (Alert): `#F59E0B` — within 10% deviation from target
- 🔴 Rojo (Critical): `#EF4444` — >10% deviation, blocked items

**Neutral Scale:**
- Surface: `#1E293B`
- Card: `#253347`
- Border: `#334155`
- Text Primary: `#F1F5F9`
- Text Secondary: `#94A3B8`
- Text Muted: `#64748B`

### Typography
- **Headings:** Inter Bold — clean, geometric authority
- **Body:** Inter Regular — highly legible
- **Labels/Tags:** Inter Medium, uppercase tracking — for badges and status indicators
- **Data/Numbers:** Inter Tabular — for KPIs and metrics

### Visual Language
- Dark mode primary interface
- Subtle glass-morphism cards with `border: 1px solid rgba(255,255,255,0.08)`
- Traffic light indicators (🟢🟡🔴) are prominent, never decorative
- Progress is shown as horizontal bars with percentage labels
- Blocked/locked states use a padlock icon + muted overlay
- Wizard flows use a prominent step indicator at the top

---

## App Structure — Navigation

**Left Sidebar (persistent, collapsible):**
```
[TBM Logo]
────────────────
🏠  Dashboard
🌅  Rituales
👥  Mi Equipo
📋  Delegación
💬  Feedback S.E.C.
🗓  Plan 90 Días
📚  Workbooks
📊  Diagnósticos
────────────────
[User Avatar + Name]
[Settings ⚙️]
```

The sidebar shows a small colored dot next to each module reflecting its health status (green/yellow/red). Modules that are blocked or incomplete show a ⚠️ badge.

---

## Screen 1 — Dashboard Central (BOS)

**Purpose:** The "cockpit" of the business. Shows the overall health at a glance.

**Layout:** Full-width dark canvas. Top bar shows company name, current week, and user role. Below that: 3 sections in a grid.

**Section A — Semáforo TBM (Top, full width)**
A horizontal row of 5 large metric cards, each showing:
- Metric name (e.g., "Revenue / Meta Semanal")
- Current value vs. target (e.g., "$12,400 / $14,000")
- Traffic light color fills the left border of the card (green/yellow/red)
- Trend arrow (↑↓→)
- % deviation label in the matching color

Below the 5 cards: a single sentence summary — e.g., *"2 indicadores en rojo esta semana. Revisá Delegación y Plan 90D."*

**Section B — Mis Próximas Acciones (Left column, 60% width)**
A vertical list of up to 7 action items. Each item shows:
- Checkbox (circular, not square — feels more like a habit tracker)
- Task title
- Associated module tag (colored pill: "Pase de Estafeta", "Roca", "Ritual", etc.)
- Due date — shown in red if overdue
- Person avatar if delegated to someone

At the top of this section: a small progress ring showing "X de Y completadas hoy"

**Section C — Estado del Equipo (Right column, 40% width)**
A compact team grid. Each team member shown as:
- Avatar (initial letter circle)
- Name + LOS Level badge (N1–N5, colored differently per level)
- Pequeño semáforo de 3 dots — their overall performance
- "Tareas vencidas" count in red if >0

At the bottom: one CTA button — "Ver Equipo Completo →"

**Section D — Rituales de Hoy (Bottom strip, full width)**
A horizontal row of 3 cards:
- Pre-game (🌅 Mañana)
- Warm Up (☀️ Inicio de Jornada)
- Cool Down (🌙 Fin de Día)

Each card shows: status (Completado ✓ / Pendiente / No aplica hoy), time indicator, and a "Iniciar →" or "Ver →" button.

---

## Screen 2 — Rituales

**Purpose:** Daily rhythms. 3 ritual types, each with specific mandatory fields.

**Layout:** Single column, centered, max-width 720px (focused, intentional — like a journal entry)

**Top of screen:** Day + date in large text. Below: a 3-tab switcher:
`[ 🌅 Pre-game ] [ ☀️ Warm Up ] [ 🌙 Cool Down ]`

**Pre-game Tab — "La Sesión de Silencio"**
Before the form loads: a full-screen overlay with a 5-second countdown.
- Dark background, centered large countdown number (5… 4… 3… 2… 1…)
- Text below: *"Pausá. Respirá. Entra al modo Arquitecto."*
- After countdown: overlay fades, form appears

Form fields (each required, blocks next field until completed):
1. **Gratitud** — "¿Qué agradecés hoy?" (text area, 1–3 items)
2. **Revisión de Sueño** — Stars 1–5 + slider for hours
3. **Top 3 Prioridades** — 3 text inputs (ordered), with auto-link to Rocas
4. **Estado de Energía** — Emoji scale: 😴 😐 🙂 ⚡ 🔥
5. **Intención del Día** — Single sentence text input

At the bottom: "Completar Pre-game ✓" button — only active when all 5 fields are filled.
After submit: confetti animation + "*Modo Arquitecto activado. Que empiece la construcción.*"

**Warm Up Tab**
Simpler form, no overlay. Fields:
1. Review of yesterday's Cool Down priorities — were they achieved? (✓/✗ per item)
2. Top 5 tasks for today (linked to delegated tasks or Rocas)
3. 1 decision to make today (text input)

**Cool Down Tab**
Form fields:
1. Logros del día (what got done — checkbox list from Warm Up tasks)
2. ¿Qué podría mejorar mañana? (text area)
3. Nivel de satisfacción con el día — Emoji scale
4. Top 3 para mañana (carries over to next Pre-game as suggestions)

**History View (below the tabs):**
A compact calendar strip showing the last 30 days. Each day is a small colored dot:
- 🟢 All 3 rituals completed
- 🟡 1–2 rituals completed
- ⚫ No entry
- Clicking a day shows the read-only entry for that day

---

## Screen 3 — Mi Equipo (DISC + LOS)

**Purpose:** Visualize each team member's behavioral profile (DISC) and autonomy level (LOS). Used by the leader to calibrate communication and delegation.

**Layout:** Left: team member list. Right: profile detail panel (selected member).

**Left Panel — Team List (30% width)**
Vertical list of team members:
- Avatar circle (initial, colored by DISC type: D=red, I=yellow, S=green, C=blue)
- Name + role
- LOS Level badge: `N1 Cadete` / `N2 Aprendiz` / `N3 Ejecutor` / `N4 Referente` / `N5 Socio`
- A tiny row of 3 colored dots (their Semáforo)
At the bottom: "+ Agregar Miembro" button

**Right Panel — Member Profile (70% width)**

*Header row:* Large avatar, name, role, join date, LOS level badge (prominent, colored)

*DISC Section:* 
A horizontal bar chart showing the 4 dimensions (D, I, S, C) as bars 0–100%.
Below the chart: 2 columns:
- **Luz ☀️ (High Energy / Natural State)** — bullet list of 3–4 behavioral descriptors
- **Sombra 🌑 (Stress / Under Pressure)** — bullet list of 3–4 descriptors (in muted red)

A highlighted box below: *"Cómo comunicarte con [Name]"* — 3 concise actionable tips derived from their DISC.

*LOS Progression Bar:*
A visual ladder (5 steps). Current level highlighted. Each step shows:
- Level name
- 1-line description of what it means
- Key requirement to advance to next level
- Date reached (if applicable)

*Historial de Tareas:*
A compact table showing last 10 tasks assigned to this person:
- Task name / Date assigned / Status / On time? ✓✗

---

## Screen 4 — Delegación (Pase de Estafeta)

**Purpose:** Properly delegate a task using the mandatory 5-point protocol. The app blocks saving until all 5 points are completed.

**Layout:** Step-by-step wizard. Full-screen focus mode with dark overlay over the rest of the app.

**Wizard Header (top of screen):**
A progress bar split into 5 numbered segments:
`[1 QUÉ] → [2 POR QUÉ] → [3 CÓMO] → [4 CUÁNDO] → [5 CHEQUEO]`
Current step is highlighted in Electric Blue. Completed steps show ✓. Cannot click ahead — must complete in order.

**Step 1 — QUÉ (What)**
- Label: *"¿Qué exactamente se va a hacer?"*
- Large text area — minimum 20 characters (enforced)
- Below: auto-suggest to link this task to an existing Roca or session objective
- "Siguiente →" button — disabled until field is valid

**Step 2 — POR QUÉ (Why)**
- Label: *"¿Por qué esto importa? ¿Cómo conecta con el objetivo estratégico?"*
- Text area + optional link to a Roca (dropdown selector)
- A subtle prompt in gray: *"Si no podés explicar el por qué, no delegues aún."*

**Step 3 — CÓMO (How)**
- Label: *"¿Cómo se va a hacer? Describí el proceso o el estándar esperado."*
- Rich text area
- Below: file/link attachment option (for SOPs, templates)
- Option: "Tiene un SOP → Link here" or "Necesita crear SOP" checkbox

**Step 4 — CUÁNDO (When)**
- Label: *"¿Cuándo debe estar listo?"*
- Date + time picker (required)
- Toggle: "Checkpoint intermedio" → adds an optional check-in date
- Below: display of "Días hasta vencimiento: X"
- Warning in yellow if <3 days: *"Plazo muy corto. ¿Ya tiene todo lo necesario?"*

**Step 5 — CHEQUEO (Check-in method)**
- Label: *"¿Cómo vas a verificar que se hizo correctamente?"*
- 3 options (radio): 
  - 📅 Reunión de revisión (date picker appears)
  - ✅ Entregable específico (text field: "¿Qué entregable exactamente?")
  - 📊 Métrica verificable (text field: "¿Qué número lo confirma?")
- Below: Assignee selector — searchable dropdown with team member avatars

**Final Step — Review & Confirm**
A read-only summary of all 5 points in a clean card layout.
At the bottom: 2 buttons:
- "← Editar" (goes back to Step 1)
- "Delegar ✓" (Primary CTA — Electric Blue — saves and notifies the assignee)

**Post-submission:**
A confirmation screen with the task summary + a "✓ Pase de Estafeta registrado" message.
Below: "¿Querés delegar otra tarea?" + "Volver al Dashboard"

---

## Screen 5 — Feedback S.E.C.

**Purpose:** Deliver structured feedback using the S.E.C. model (Situación / Efecto / Cambio o Continúa).

**Layout:** Split — left: feedback history list; right: compose panel.

**Left Panel — Feedback dado y recibido (35% width)**
Two tabs: `[ Dado ]` `[ Recibido ]`
Each entry in the list shows:
- Person avatar + name
- Feedback type badge: `S.E.C. Correctivo` (orange) / `S.E.C. Reforzador` (green)
- Date
- Status: Enviado / Pendiente respuesta / Leído
Clicking an entry expands it in the right panel (read-only).

**Right Panel — Nuevo Feedback (65% width)**
Header: *"Nuevo Feedback S.E.C."*

**Feedback type selector (2 large toggle cards):**
- 🔸 **Correctivo** — "Para corregir un comportamiento o resultado"
- 🟢 **Reforzador** — "Para reconocer y anclar lo que está funcionando"

**Form (3 sequential fields — each unlocks the next):**

**S — Situación:**
- Label: *"Describí el hecho concreto, sin interpretaciones"*
- Text area with character counter (min 30 chars)
- Hint: *"Evitá adjetivos. Describí qué pasó, no quién es."*

**E — Efecto:**
- Label: *"¿Qué impacto tuvo esto en el equipo, cliente o resultado?"*
- Text area
- Hint: *"Hablá en primera persona: 'El impacto fue…'"*

**C — Cambio / Continúa:**
- For Correctivo: *"¿Qué esperás que cambie y para cuándo?"*
- For Reforzador: *"¿Qué esperás que continúe haciendo?"*
- Text area + optional date for follow-up

**Recipient selector:** Searchable dropdown with team avatars

**Delivery options:**
- 📤 Enviar ahora (immediate)
- 📅 Programar (date/time picker)
- 📋 Solo guardar como borrador

---

## Screen 6 — Plan 90 Días

**Purpose:** Manage strategic priorities (Rocas) vs. operational tasks (Arena) for the 90-day cycle.

**Layout:** Top: cycle header. Below: 2-column layout (Rocas / Arena).

**Cycle Header (full width):**
A prominent banner card showing:
- Current cycle name: e.g., *"Q2 2026 — Días 1–90"*
- Days remaining: large number (e.g., "**47 días restantes**")
- A thin progress bar across the full width: 0% → 100% (today's position marked)
- 3 metric pills: `🟢 2 Rocas On Track` / `🟡 1 Roca en riesgo` / `🔴 0 Rocas críticas`

**Left Column — ROCAS (60% width)**
Header: *"🪨 Rocas del Trimestre"* + small tag "Máximo 5"

Each Roca displayed as a large card:
- Title (bold)
- Description (1–2 lines)
- Progress bar (0–100%) — manually updated or linked to metrics
- Semáforo dot (green/yellow/red) based on trajectory
- Key milestones as sub-items (collapsible chevron)
- Assigned owner avatar
- "Actualizar progreso %" button

Below all Rocas: if <5 Rocas, shows "+ Nueva Roca" button. If 5 Rocas, button is disabled with tooltip: *"Máximo 5 Rocas por ciclo. Eliminá una para agregar."*

**Right Column — ARENA (40% width)**
Header: *"🏖 Arena — Tareas Operativas"* + tag "Delegá o descartá"

A compact task list. Each item:
- Checkbox
- Task title
- Assignee avatar (if delegated)
- Due date
- Source tag: `Reunión` / `Urgente` / `Recurrente`

Bottom: filter tabs — `[ Todas ] [ Mías ] [ Delegadas ] [ Vencidas ]`

**Parqueadero de Ideas (collapsible section at the bottom)**
Header: *"💡 Parqueadero de Ideas"* with a padlock icon 🔒
- A grid of idea cards — each with title, date added, source
- All cards have a muted overlay with: *"Disponible el Día 91"*
- A small countdown: "Se desbloquea en 47 días"
- "+" button to add new ideas (can always add, just can't act on them until Day 91)

---

## Screen 7 — Workbooks (S1–S8)

**Purpose:** Access the dynamic worksheets for each of the 8 TBM program sessions.

**Layout:** Top: session grid. Below: active workbook viewer.

**Session Grid (top section):**
8 session cards in a 4×2 grid:
- Session number (large, bold)
- Session name (e.g., "S1 — Claridad del Liderazgo")
- Status badge: `Completado ✓` / `En progreso` / `Bloqueado 🔒` / `Disponible`
- Completion percentage ring (0–100%)
- Bloqueo visual: locked sessions show a padlock overlay — you cannot open them until the prior session is 100% complete.

**Active Workbook View (below grid, or full screen on click):**
Header: "Session title" + progress indicator (e.g., "Pregunta 4 de 12")

Each question displayed one at a time (progressive reveal — not a long scrolling form):
- Question text (large, centered)
- Sub-hint in smaller gray text
- Input (varies by question type):
  - Free text area
  - Scale 1–10 (large tappable numbers)
  - Multiple choice (pill buttons)
  - Ranking (drag-to-reorder list)
- "Siguiente →" button — disabled until answered
- Small "← Anterior" link for going back (answers auto-saved)

Bottom right: "Guardar y cerrar" (saves progress, can resume anytime)

After last question: Completion screen
- "✓ Sesión X completada"
- Key insights summary (auto-generated from their answers)
- "Ver mis respuestas completas" button
- Next session unlocks (animation: padlock opens)

---

## Screen 8 — Diagnósticos & Scorecards

**Purpose:** Periodic assessments that measure business health across all dimensions.

**Layout:** Left: scorecard history/list. Right: active scorecard.

**Left Panel — Historial (30% width)**
Vertical list of completed scorecards:
- Date
- Overall score (0–100)
- Semáforo color based on score
- "Ver →" link

At the bottom: "Nuevo Diagnóstico +" button — only active if 30+ days since last one (enforced).

**Right Panel — Scorecard activo (70% width)**
Organized in 4 dimensions matching L.O.S.T.:
- **L — Liderazgo**
- **O — Operaciones**
- **S — Sistemas**
- **T — Tiempo**

Each dimension contains 5–7 statements. For each statement:
- Statement text
- 1–5 rating scale (large clickable numbers: 1=Nunca → 5=Siempre)
- Optional note field (collapsed by default, expands on click)

At the bottom of each dimension: auto-calculated average score with color coding.

**Results Screen (after completion):**
A radar/spider chart showing scores across the 4 L.O.S.T. dimensions.
Below: comparison with previous scorecard (if available) — "Mejoró 12 puntos en Sistemas"
3 auto-generated priority recommendations based on lowest scores.
"Exportar PDF" button (generates a report).

---

## Coach View — Dilio's Dashboard (Super Admin)

**Purpose:** Dilio sees all companies/leaders in the program simultaneously.

**Layout:** Wide dashboard, data-dense.

**Top filters:** Filter by session, status, DISC type _(no cohort filter — el programa es 100% individual [N3], ver RESPUESTAS_DILIO.md)_

**Main grid — All Leaders:**
A sortable table with columns:
- Leader name + company
- Current session (S1–S8, with progress %)
- Last ritual (date + ✓/✗)
- Plan 90D health (semáforo)
- Team size
- Pending tasks count
- Last active date

Rows color-coded by status. Red rows = leaders needing attention.

**Clicking a row:** Opens a read-only view of that leader's full Dashboard — all the same screens but in read-only mode. Dilio can add coaching notes at any screen.

---

## Key Interaction Patterns

### Fricción Intencional (Intentional Friction)
- Multi-step wizards enforce sequential completion
- Fields unlock progressively — you cannot fill Step 3 without completing Step 2
- The 5-second "Sesión de Silencio" overlay before Pre-game — cannot be skipped
- Save buttons are disabled (not just grayed — completely inert) until all required fields are valid
- Locked sessions/features show explicit lock icons with explanation, never just disappear

### Validation Feedback
- Real-time inline validation as the user types (not only on submit)
- Errors shown below the field in red, with actionable message ("Mínimo 30 caracteres — te faltan 12")
- Success states show green checkmark on the field border
- "Complete required fields" toast appears at bottom of screen if user tries to bypass

### Progress & Momentum
- Completion streaks shown on Rituales (🔥 "7 días seguidos")
- Animated transitions when completing major steps (Roca updated, Workbook session finished)
- Dashboard greeting changes based on time of day: "Buenos días, Sebastián 🌅" / "Buenas tardes ☀️" / "Finalizando el día 🌙"

---

## Responsive Notes
- Primary interface: desktop/laptop (1280px+)
- Tablet: sidebar collapses to icon-only mode
- Mobile: view-only access for Dashboard and Rituales check-in — no editing on mobile except Pre-game quick entry

---

## Design Inspiration References
- Dark, structured dashboards like Linear and Vercel
- Coaching/journaling apps like Stoic or Reflectly for the Rituales screens
- Data visualization density like Hex or Metabase for the Scorecard/Coach views
- Professional SaaS feel — not a productivity tool, not a startup toy — a serious leadership operating system
