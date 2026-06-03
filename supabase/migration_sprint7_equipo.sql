-- ============================================================
-- Sprint 7 (cierre S3) — Mi Equipo: Matriz de Autoridad
--   3 montos que definen cuánto puede gastar/decidir cada colaborador
--   sin aprobación. Una fila por empresa.
-- Reusa helpers: auth_company_id(), auth_is_arquitecto().
-- ============================================================

create table if not exists public.authority_matrix (
  company_id   uuid primary key references public.companies(id) on delete cascade,
  n1_amount    numeric,   -- autonomía total: hasta este monto, no pregunta
  n2_min       numeric,   -- táctica: desde
  n2_max       numeric,   -- táctica: hasta (avisa)
  n3_threshold numeric,   -- por encima: requiere aprobación del Arquitecto
  currency     text default 'ARS',
  updated_at   timestamptz default now()
);

alter table public.authority_matrix enable row level security;

drop policy if exists "Miembros ven la matriz de su empresa" on public.authority_matrix;
create policy "Miembros ven la matriz de su empresa"
  on public.authority_matrix for select
  using (company_id = public.auth_company_id());

drop policy if exists "Arquitecto crea la matriz" on public.authority_matrix;
create policy "Arquitecto crea la matriz"
  on public.authority_matrix for insert
  with check (public.auth_is_arquitecto() and company_id = public.auth_company_id());

drop policy if exists "Arquitecto actualiza la matriz" on public.authority_matrix;
create policy "Arquitecto actualiza la matriz"
  on public.authority_matrix for update
  using (public.auth_is_arquitecto() and company_id = public.auth_company_id());
