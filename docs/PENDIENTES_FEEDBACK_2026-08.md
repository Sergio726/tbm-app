# Feedback pendiente — round ago-2026

> **Estado:** ❌ **PENDIENTE — sin implementar.** Documento de registro, no de plan cerrado.
> **Registrado:** 2026-08-03.
> **Cruce contra el código:** 2026-08-03, contra `main` **post-S25** (incluye S22 rol/progresión,
> S23 despertador, S24 DC proactivo, S25 cascada de KPIs). Ver §Estado hoy.
> Relacionado: [`../PROGRESS.md`](../PROGRESS.md) ·
> [`OBSERVACIONES_DILIO_2026-07.md`](OBSERVACIONES_DILIO_2026-07.md) (round anterior) ·
> [`OBSERVACIONES_DILIO_2026-06.md`](OBSERVACIONES_DILIO_2026-06.md) ·
> [`PENDIENTES_REVISION.md`](PENDIENTES_REVISION.md) (decisiones abiertas).
>
> **No duplica el round de julio:** se revisó `OBSERVACIONES_DILIO_2026-07.md` y ninguno de sus
> bloques (A despertador · B delegación · C super coach · D SOP en PDF · E KPIs en cascada ·
> F sprints calendario · G DC proactivo) pide gráficas por área, envío del informe al líder de área
> ni una zona de informes para un rol gerencial. Es **feedback nuevo**. Sí hay **vecindad** con
> C5 (mensajería coach→líder), D2 (informe en PDF) y E (cascada de KPIs) — conviene diseñarlo
> mirando esos tres para no construir dos veces lo mismo.

---

## F1 · "Update": gráficas por área + envío del informe + zona del Gerente + próximos pasos — ❌ Pendiente

### Feedback recibido (textual)

> Que debemos hacer el **Update**:
> 1. que muestre **gráficas de cada área**
> 2. que pueda **enviar el informe al líder de área** y que la empresa/el **Gerente** tenga
>    acceso a la **Zona de informe y gráficas** y que **genere un "próximos pasos"** para esa
>    compañía.

### Desglose en piezas

| # | Pieza | Qué pide | Tipo |
|---|---|---|---|
| **F1.1** | **Gráficas por área** | El Update muestra una gráfica por cada área (no solo el número/semáforo agregado). | UI / visualización |
| **F1.2** | **Envío del informe al líder de área** | Poder mandar el informe generado al responsable de cada área. | Email + permisos |
| **F1.3** | **Zona de informes y gráficas para el Gerente** | Un rol de nivel gerencial de la empresa con acceso a una sección donde ve informes + gráficas. | Rol nuevo + RLS + nueva sección |
| **F1.4** | **"Próximos pasos" generados** | A partir del informe, la app genera recomendaciones de próximos pasos **para esa compañía**. | IA (DC / `ai-report`) |

### Estado hoy (verificado en código, 2026-08-03)

Lo que **ya existe** y sirve de base:

- **Diagnóstico por áreas:** `/diagnostico` (8 áreas, re-evaluación pre-cargada) y **tendencia
  histórica real por área** en el dashboard (cerrado en S12). O sea, el **dato por área ya está**;
  falta la **visualización por área** que pide F1.1.
- **Zona de informes embrionaria:** `/export/[tipo]` (`diagnostico`, `plan-90d`, `equipo`, `semana`)
  con vista documento + print stylesheet (`components/export/`). Es el punto de partida natural de
  la "Zona de informe y gráficas" de F1.3, pero hoy es **exportación**, no una zona con permisos
  propios.
- **Email operativo:** Resend + `send.stlabs.ar` verificado; `lib/email.ts` lee de `email_config`
  con fallback a env. F1.2 **no requiere infraestructura nueva de correo**, solo el flujo y el
  destinatario.
- **IA para síntesis:** `ai-report.ts` + DC (contexto real de empresa/equipo + RAG del método).
  F1.4 se apoya acá. Además **S24** ya dejó a DC **proactivo** (patrón de intervención + gate en
  delegación) → el "próximos pasos" puede colgar de ese patrón en vez de inventar uno nuevo.
- **Precedente de "responsable" asignado:** **S25** (cascada de KPIs) modeló el aporte de un
  **responsable por Roca** (`plan-90d/cascade-actions.ts`, `owner_id` con `onConflict rock_id,owner_id`
  y validación de que pertenezca a la empresa). **Ojo:** es responsable **de una Roca**, no de un
  **área** — pero es el patrón a imitar si se decide modelar áreas con dueño (P2).
- **Ficha de rol:** **S22** agregó ficha de rol con derechos + insignia de nivel. Es sobre los
  **Niveles de Delegación** (Cadete→Socio), **no** sobre roles de autenticación → **no aporta** el
  rol "Gerente" de F1.3.

Lo que **no existe** y hay que construir:

- ⚠️ **No existe el rol "Gerente" ni "líder de área".** Los roles del sistema son
  **arquitecto / colaborador / coach** (+ `platform_admin` en el panel). El "cargo" (ej. "Gerente
  de Operaciones") es **texto libre** de perfil, sin ningún efecto en permisos ni RLS.
  → F1.2 y F1.3 requieren **modelar áreas y su responsable**, y un **rol/permiso nuevo**, con su
  migración + policies RLS. Es la pieza más pesada del pedido.
- ❌ No hay gráficas por área individual (solo agregados/tendencia).
- ❌ No hay generación de "próximos pasos" a partir del informe.
- ❌ No hay envío de informes por email (el correo hoy cubre invitaciones, digest del cron y DISC).

### Preguntas abiertas (bloquean el diseño)

1. **¿Qué es "el Update" acá?** Dos lecturas posibles y llevan a features distintas:
   - **(a) El pulso ARQI de 72h** — la "reunión de 30 minutos" cada 72h del método canónico
     (`METODO_TBM_CANONICO.md` §5: U = Update). Sería un **módulo de ritual nuevo** que cierra con
     informe.
   - **(b) La actualización/re-evaluación del diagnóstico** — el flujo que ya existe en
     `/diagnostico` (re-eval pre-cargada). Sería **enriquecer un módulo existente**.
   - **(c)** Un tercer significado propio del cliente.
2. **¿Qué es un "área"?** ¿Las **8 áreas del Diagnóstico Organizacional TBM** (ya modeladas), o
   áreas organizacionales de la empresa (Ventas, Operaciones…) que **hoy no existen como entidad**?
   Si es lo segundo, hace falta una tabla de áreas + asignación de responsable.
3. **¿"Gerente" es un rol nuevo o el Arquitecto?** ¿Es un cuarto rol entre arquitecto y
   colaborador (ve informes de toda la empresa pero no administra), o el pedido se cubre con el
   arquitecto actual?
4. **¿El "líder de área" recibe el informe completo o solo el de su área?** Define el alcance de la
   RLS.
5. **¿"Próximos pasos" es por IA o por reglas del método?** ¿Y se persiste (historial, marcar como
   hecho) o es texto de un solo uso?

> **Recomendación:** resolver P1 y P2 antes de estimar. Si "área" = las 8 del diagnóstico y
> "Gerente" = arquitecto, esto es **medio** (gráficas + informe + email + IA sobre datos que ya
> existen). Si hay que **modelar áreas de la empresa con responsables y un rol nuevo**, es un
> **sprint completo** con migración y repaso de RLS.

### Dependencias

- F1.1 es independiente → se puede hacer primero, sin bloqueo.
- F1.2 y F1.3 dependen de **P2 (qué es un área)** y **P3 (rol Gerente)**.
- F1.4 depende de que el informe exista como objeto (F1.1 + estructura del informe).
