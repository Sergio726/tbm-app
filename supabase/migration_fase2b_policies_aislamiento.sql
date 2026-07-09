-- ============================================================
-- FASE 2B — Aislamiento por comando + autoría (auditoria.md DB-4/5/6)
--
--   Las tablas de Plan 90D, Feedback y Workbooks tenían UNA sola policy
--   `company_isolation` SIN `FOR` (aplica a SELECT/INSERT/UPDATE/DELETE) que
--   solo filtraba por company_id ⇒ cualquier miembro podía suplantar autoría
--   al insertar (DB-5) y el destinatario/terceros veían borradores de feedback
--   a medio escribir (DB-6).
--
--   Este batch separa las policies por comando y:
--     · INSERT exige la autoría real (`user_id/proposed_by/from_user = auth.uid()`).
--       Verificado: el código YA setea esos campos → no rompe. (DB-5)
--     · Feedback: los borradores solo los ve su autor. (DB-6)
--     · Agrega DELETE para el arquitecto donde faltaba. (DB-22)
--     · Policies escritas con `(select …)` para que el planner las trate como
--       InitPlan (una evaluación por query, no por fila). (DB-10)
--
--   CONSERVADOR a propósito: el UPDATE se mantiene con aislamiento por empresa
--   (como hoy) salvo en feedback, porque endurecerlo a autor/arquitecto en
--   rocks/leading_indicators podría romper flujos legítimos (p. ej. el dueño de
--   un indicador actualiza su valor) que no se pueden verificar sin correr la
--   app. Endurecer eso queda para cuando se confirmen los flujos por rol.
--
--   Idempotente (drop policy if exists antes de cada create). Aplicar en el SQL
--   Editor. Las policies `coach_select` de super-coach quedan intactas (son OR).
-- ============================================================


-- ── rocks ────────────────────────────────────────────────────
drop policy if exists "company_isolation" on public.rocks;
drop policy if exists "rocks_select" on public.rocks;
drop policy if exists "rocks_insert" on public.rocks;
drop policy if exists "rocks_update" on public.rocks;
drop policy if exists "rocks_delete" on public.rocks;

create policy "rocks_select" on public.rocks for select
  using (company_id = (select public.auth_company_id()));
create policy "rocks_insert" on public.rocks for insert
  with check (company_id = (select public.auth_company_id()));
create policy "rocks_update" on public.rocks for update
  using (company_id = (select public.auth_company_id()))
  with check (company_id = (select public.auth_company_id()));
create policy "rocks_delete" on public.rocks for delete
  using ((select public.auth_is_arquitecto()) and company_id = (select public.auth_company_id()));
grant delete on public.rocks to authenticated;


-- ── rock_updates (autoría del check-in; no tiene UPDATE/DELETE) ──
drop policy if exists "company_isolation" on public.rock_updates;
drop policy if exists "rock_updates_select" on public.rock_updates;
drop policy if exists "rock_updates_insert" on public.rock_updates;

create policy "rock_updates_select" on public.rock_updates for select
  using (rock_id in (
    select id from public.rocks where company_id = (select public.auth_company_id())
  ));
create policy "rock_updates_insert" on public.rock_updates for insert
  with check (
    user_id = (select auth.uid())
    and rock_id in (
      select id from public.rocks where company_id = (select public.auth_company_id())
    )
  );


-- ── idea_parking ─────────────────────────────────────────────
drop policy if exists "company_isolation" on public.idea_parking;
drop policy if exists "idea_parking_select" on public.idea_parking;
drop policy if exists "idea_parking_insert" on public.idea_parking;
drop policy if exists "idea_parking_update" on public.idea_parking;
drop policy if exists "idea_parking_delete" on public.idea_parking;

create policy "idea_parking_select" on public.idea_parking for select
  using (company_id = (select public.auth_company_id()));
create policy "idea_parking_insert" on public.idea_parking for insert
  with check (proposed_by = (select auth.uid()) and company_id = (select public.auth_company_id()));
create policy "idea_parking_update" on public.idea_parking for update
  using (company_id = (select public.auth_company_id()))
  with check (company_id = (select public.auth_company_id()));
create policy "idea_parking_delete" on public.idea_parking for delete
  using ((select public.auth_is_arquitecto()) and company_id = (select public.auth_company_id()));
grant delete on public.idea_parking to authenticated;


-- ── decisions ────────────────────────────────────────────────
drop policy if exists "company_isolation" on public.decisions;
drop policy if exists "decisions_select" on public.decisions;
drop policy if exists "decisions_insert" on public.decisions;
drop policy if exists "decisions_update" on public.decisions;
drop policy if exists "decisions_delete" on public.decisions;

create policy "decisions_select" on public.decisions for select
  using (company_id = (select public.auth_company_id()));
create policy "decisions_insert" on public.decisions for insert
  with check (user_id = (select auth.uid()) and company_id = (select public.auth_company_id()));
create policy "decisions_update" on public.decisions for update
  using (company_id = (select public.auth_company_id()))
  with check (company_id = (select public.auth_company_id()));
create policy "decisions_delete" on public.decisions for delete
  using ((select public.auth_is_arquitecto()) and company_id = (select public.auth_company_id()));
grant delete on public.decisions to authenticated;


-- ── leading_indicators (owner_id es asignación, no autoría) ──
drop policy if exists "company_isolation" on public.leading_indicators;
drop policy if exists "leading_indicators_select" on public.leading_indicators;
drop policy if exists "leading_indicators_insert" on public.leading_indicators;
drop policy if exists "leading_indicators_update" on public.leading_indicators;
drop policy if exists "leading_indicators_delete" on public.leading_indicators;

create policy "leading_indicators_select" on public.leading_indicators for select
  using (company_id = (select public.auth_company_id()));
create policy "leading_indicators_insert" on public.leading_indicators for insert
  with check (company_id = (select public.auth_company_id()));
create policy "leading_indicators_update" on public.leading_indicators for update
  using (company_id = (select public.auth_company_id()))
  with check (company_id = (select public.auth_company_id()));
create policy "leading_indicators_delete" on public.leading_indicators for delete
  using ((select public.auth_is_arquitecto()) and company_id = (select public.auth_company_id()));
grant delete on public.leading_indicators to authenticated;


-- ── feedbacks: autoría en INSERT + borradores privados (DB-5/DB-6) ──
drop policy if exists "company_isolation" on public.feedbacks;
drop policy if exists "feedbacks_select" on public.feedbacks;
drop policy if exists "feedbacks_insert" on public.feedbacks;
drop policy if exists "feedbacks_update" on public.feedbacks;
drop policy if exists "feedbacks_delete" on public.feedbacks;

-- Un borrador (is_draft) solo lo ve su autor; los entregados, la empresa.
create policy "feedbacks_select" on public.feedbacks for select
  using (
    company_id = (select public.auth_company_id())
    and (is_draft = false or from_user = (select auth.uid()))
  );
create policy "feedbacks_insert" on public.feedbacks for insert
  with check (from_user = (select auth.uid()) and company_id = (select public.auth_company_id()));
-- Marcar entregado / editar: el autor o el arquitecto.
create policy "feedbacks_update" on public.feedbacks for update
  using (
    company_id = (select public.auth_company_id())
    and (from_user = (select auth.uid()) or (select public.auth_is_arquitecto()))
  )
  with check (company_id = (select public.auth_company_id()));
create policy "feedbacks_delete" on public.feedbacks for delete
  using ((select public.auth_is_arquitecto()) and company_id = (select public.auth_company_id()));
grant delete on public.feedbacks to authenticated;


-- ── workbook_responses (personales del usuario) ──────────────
drop policy if exists "company_isolation" on public.workbook_responses;
drop policy if exists "workbook_responses_select" on public.workbook_responses;
drop policy if exists "workbook_responses_insert" on public.workbook_responses;
drop policy if exists "workbook_responses_update" on public.workbook_responses;

create policy "workbook_responses_select" on public.workbook_responses for select
  using (company_id = (select public.auth_company_id()));
create policy "workbook_responses_insert" on public.workbook_responses for insert
  with check (user_id = (select auth.uid()) and company_id = (select public.auth_company_id()));
create policy "workbook_responses_update" on public.workbook_responses for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));


-- ── workbook_progress (personal del usuario) ─────────────────
drop policy if exists "company_isolation" on public.workbook_progress;
drop policy if exists "workbook_progress_select" on public.workbook_progress;
drop policy if exists "workbook_progress_insert" on public.workbook_progress;
drop policy if exists "workbook_progress_update" on public.workbook_progress;

create policy "workbook_progress_select" on public.workbook_progress for select
  using (company_id = (select public.auth_company_id()));
create policy "workbook_progress_insert" on public.workbook_progress for insert
  with check (user_id = (select auth.uid()) and company_id = (select public.auth_company_id()));
create policy "workbook_progress_update" on public.workbook_progress for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
