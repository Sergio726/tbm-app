# PROGRESS — The Business Multiplier App

> **Fuente de verdad del estado del proyecto, sprint por sprint.**
> Mantenelo actualizado en cada PR o commit que cierre/abra una pieza de un sprint.
> Plan completo: [`docs/SPRINTS.md`](docs/SPRINTS.md) (incluye CHANGELOG v1.1).

**Última actualización:** 2026-06-09 · **Completitud global:** 10 / 14 sprints (71%) · **Última pieza cerrada:** S8 completo

---

## Estado por sprint

Leyenda · ✅ Completo · 🟡 Parcial · ❌ Pendiente · 🚫 No iniciado (ops)

| Sprint | Tema | Estado | Notas |
|---|---|---|---|
| **S0** | Setup & Auth | ✅ | App en Vercel · auth + 2 tipos de usuario (Alumno/Independiente). |
| **S1** | Onboarding + Dashboard | 🟡 | Diagnóstico OK + Naming v1.1 aplicado. Falta Dashboard con datos reales (queda en S12). |
| **S2** | Rituales | ✅ | Pre-game · Los 5 Grandes · War Up Realtime · Cool Down + Reporte Semanal automático · Parking Lot · Config. |
| **S3** | Mi Equipo (DISC + LOS + Matriz) | ✅ | DISC + LOS + Matriz Autoridad + Cruces Peligrosos · rediseño RPG gamificado. |
| **S4** | Delegación | ✅ | Wizard Pase de Estafeta (5 puntos) · Kanban · Vista colaborador · Escudo Anti-Boomerang. |
| **S5** | Feedback S.E.C. | ✅ | Templates S/E/C por perfil DISC · Sesiones Escape · 3 Streaks. |
| **S6** | Plan 90D + BOS + Activos | 🟡 | Rocas + Leading Indicators + Disagree & Commit + L4 YoY. **Falta UI de "Activos del Sistema"** (tabla `process_assets` ya creada). |
| **S7** | Workbooks S1–S4 | ✅ | 4 sesiones digitalizadas + desbloqueo híbrido (7 días o "avance anticipado"). |
| **S8** | Workbooks S5–S8 | ✅ | 4 sesiones + 16 ejercicios + componente `counter_tracker` + vista "Mi Programa" (`/workbooks/mi-programa`) con timeline 8 sesiones + comparativa scorecard baseline vs último (Día 1 vs Hoy). |
| **S9** | Polish + Exportación + Super Coach | 🟡 | Exportación PDF parcial. **Falta Panel Super Coach 3 capas (CHANGELOG N1)** + notificaciones email (Resend). |
| **S10** | Beta cerrada | 🚫 | Tarea operativa, fuera de código. |
| **S11** | Tour guiado | ❌ | `driver.js` + steps + provider + flag `tour_completed` en `profiles`. |
| **S12** | Dashboard 100% funcional | ❌ | Hero Strip con datos reales (no hardcoded) + `/diagnostico` re-eval. |
| **S13** | Hero Strip interactivo | ❌ | Tiles clickeables + tooltips. Depende de S12. |
| **S14** | Búsqueda ⌘K + Notificaciones | ❌ | Command Palette (`cmdk`) + schema `notifications` + panel dropdown + generación en eventos. |

---

## CHANGELOG v1.1 — checklist específico

| Ref | Cambio | Estado | Sprint |
|---|---|---|---|
| I4 | Naming "Team Performance Scorecard" sólo para módulo S7 (KPI individual); el diagnóstico 8 áreas se llama "Diagnóstico Organizacional TBM" | ✅ | S1/S7 |
| I2/I3 | Los 5 Grandes = ritual nocturno (≠ Pre-game matutino) | ✅ | S2 |
| B3 | Módulo "Activos del Sistema" (repositorio de procesos) | 🟡 | S6 |
| B4 | Cool Down del viernes genera Reporte Semanal automático | ✅ | S2 |
| L1 | War Up en vivo (sala digital, Supabase Realtime) | ✅ | S2 |
| L3 | Desbloqueo híbrido de workbooks (7 días + botón anticipado) | ✅ | S7 |
| L4 | Indicador financiero YoY + ciclo continuo 90D | ✅ | S6 |
| N1 | Panel Super Coach 3 capas | ❌ | S9 |
| N2 | Tipo de acceso Alumno TBM vs Independiente | ✅ schema | S0 |

---

## Pendientes priorizados para beta

1. **S12 — Dashboard funcional con datos reales** (~4h) — quita el "se siente prototipo" del módulo más visitado.
2. **S14 — Notificaciones** (~10h) — sin esto la colaboración asincrónica no fluye.
3. **S6 — Activos del Sistema (UI)** (~2h) — pieza chica.
4. **S8 — Workbooks S5–S8** (~6h) — cierra el programa completo.
5. **S9 — Panel Super Coach** (~4h) — solo si hay coaches en la beta.
6. **S11 + S13** — UX polish (tour + tiles interactivas) — después de los anteriores.

---

## Migraciones SQL aplicadas

Orden de aplicación en Supabase (ver [`supabase/README.md`](supabase/README.md) para el detalle oficial):

| # | Archivo | Sprint cubierto |
|---|---|---|
| 0 | `schema.sql` | S0 — companies, profiles |
| 1 | `migration_sprint1.sql` | S1 — scorecards, kpis |
| 2 | `migration_sprint2.sql` | S2 — rituales + parking_lot + weekly_reports + Realtime |
| 3 | `migration_sprint3_disc.sql` | S3 — DISC public test |
| 4 | `migration_sprint4_disc_ux.sql` | S3 — DISC UX (cargo, scores) |
| 5 | `migration_sprint5_roles.sql` | misc — roles |
| 6 | `migration_sprint6_account.sql` | módulo Mi Cuenta (phone, bio, timezone) |
| 7 | `migration_sprint7_equipo.sql` | S3 — Matriz Autoridad + Cruces |
| 8 | `migration_sprint8_delegacion.sql` | S4 — tasks + task_updates |
| 9 | `migration_sprint9_feedback.sql` | S5 — feedbacks |
| 10 | `migration_sprint10_plan90d.sql` | S6 — rocks + process_assets + leading_indicators |
| 11 | `migration_sprint11_workbooks.sql` | S7 — workbook_responses + progress |

> ⚠️ **Numeración no coincide con sprint del plan** — los archivos se numeraron por orden de creación. Cruzá con esta tabla para saber qué cubre cada uno.

---

## Cómo actualizar este archivo

1. Cuando abrís un sprint → cambiá su fila a 🟡 con la nota "EN CURSO · <fecha>".
2. Cuando cerrás una pieza concreta → tachá la línea en "Notas" y/o cambiá el estado.
3. Cuando cerrás un sprint completo → ✅ y actualizá la fecha de "Última actualización" + el contador de completitud.
4. Si surge una pieza nueva fuera del plan → agregala como fila al final con `S?` y referenciala al CHANGELOG si aplica.

Commiteá los cambios al PROGRESS.md **en el mismo commit** que cierra/abre la pieza — no en uno aparte.
