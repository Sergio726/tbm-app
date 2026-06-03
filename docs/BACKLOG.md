# BACKLOG — Estado del sistema TBM

Tablero único de estado. Roadmap original: `docs/SPRINTS.md` (S0–S10).
Última actualización: 2026-06-03. Trabajo activo en rama **`dev`**.

## Estado por sprint

| Sprint | Módulo | Estado | Qué falta |
|---|---|---|---|
| **S0** | Setup & Auth | ✅ | `access_type` (mentored/independent) |
| **S1** | Onboarding + Dashboard | 🟡 | Dashboard tiene tiles **placeholder** (Plan 90D, Multiplicador, "Equipo hoy" con datos falsos) — se conectan en S6 |
| **S2** | Rituales | ✅ | — |
| **S3** | Mi Equipo (DISC + LOS) | 🟡 | **Matriz de Autoridad** y **Detector de Cruces Peligrosos**. (DISC sobre-entregado: test, IA, informe, email, gestión) |
| **S4** | Delegación (Pase de Estafeta) | ❌ | Todo. `/delegacion` 404 |
| **S5** | Feedback S.E.C. | ❌ | Todo. `/feedback` 404 |
| **S6** | Plan 90D + BOS + Activos | ❌ | Todo. `/plan-90d` 404 |
| **S7** | Workbooks S1–S4 | ❌ | Todo. `/workbooks` 404 |
| **S8** | Workbooks S5–S8 | ❌ | Todo |
| **S9** | Polish + Exportación + Super Coach | 🟡 | PDF/Resend solo para DISC ✅. Faltan: notificaciones (cron), exportes PDF (diagnóstico/plan/equipo), gráficas/históricos, **Panel Super Coach** |
| **S10** | Beta + comercial | ❌ | Stripe, Posthog, Sentry, onboarding beta |

**Módulos del sidebar que aún dan 404:** Delegación, Feedback S.E.C., Plan 90D, Workbooks, Multiplicador, Diagnósticos.

## Orden recomendado de implementación

1. **Cerrar S3** — Matriz de Autoridad + Detector de Cruces Peligrosos *(en curso)*.
2. **S4 Delegación** — módulo central (wizard 5 puntos, anti-boomerang, 72h, kanban).
3. **S5 Feedback S.E.C.** — constructor + tono por DISC + Sesiones de Escape.
4. **S6 Plan 90D / BOS** — Rocas, Leading Indicators, Parking de Ideas, Activos (conecta placeholders del Dashboard).
5. **S7/S8 Workbooks** — engine + 8 sesiones que alimentan los módulos.
6. **S9 Polish / Super Coach** — notificaciones, exportes, gráficas, panel de Dilio.

> Una fase a la vez, cada una a `dev` con su migración + verificación. Recomendado: promover `dev→main` y desplegar **después de cerrar S3**.

## Pendientes de despliegue / configuración

- [x] Migraciones DISC sprint 3 y 4 aplicadas.
- [x] Migraciones sprint 5 (roles) y 6 (cuenta) aplicadas.
- [ ] **Promover `dev → main`** (Vercel deploya de `main`; hoy `main` está atrás).
- [ ] **Env vars en Vercel**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (obligatorias — sin ellas el middleware tira 500). Opcionales: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`+`RESEND_FROM`.
- [ ] **Supabase Auth → URL Configuration**: Site URL + Redirect URLs del dominio (magic links).
- [ ] (Opcional) Crear cuenta Resend + verificar dominio para el envío de emails.

> Orden de aplicación de migraciones: `supabase/README.md`. Detalle del módulo DISC: `docs/MODULO_DISC.md`.
