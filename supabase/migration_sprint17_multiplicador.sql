-- ============================================================
-- THE BUSINESS MULTIPLIER APP — Migración Sprint 17
-- Módulo M8 — Multiplicador de Liderazgo
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: multiplicador_diagnostics
-- Diagnóstico ROI de Talento — Los 3 Pecados del Disminuidor
-- (3 pecados × 3 preguntas, escala 1–4 → total /36)
-- Bandas (derivadas en cliente): 🟢 ≤15 / 🟡 16–24 / 🔴 ≥25
-- ============================================================
create table public.multiplicador_diagnostics (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,

  -- Pregunta de entrada: % de capacidad mental/creativa del equipo en uso (0–100)
  team_capacity_pct smallint check (team_capacity_pct between 0 and 100),

  -- 🚨 El Rescatista
  rescatista_q1 smallint check (rescatista_q1 between 1 and 4),
  rescatista_q2 smallint check (rescatista_q2 between 1 and 4),
  rescatista_q3 smallint check (rescatista_q3 between 1 and 4),

  -- ⚡ El Marcapasos
  marcapasos_q1 smallint check (marcapasos_q1 between 1 and 4),
  marcapasos_q2 smallint check (marcapasos_q2 between 1 and 4),
  marcapasos_q3 smallint check (marcapasos_q3 between 1 and 4),

  -- 💬 El Respuesta-Rápida
  respuesta_q1  smallint check (respuesta_q1 between 1 and 4),
  respuesta_q2  smallint check (respuesta_q2 between 1 and 4),
  respuesta_q3  smallint check (respuesta_q3 between 1 and 4),

  -- Score total calculado (/36)
  total_score   smallint generated always as (
    coalesce(rescatista_q1, 0) + coalesce(rescatista_q2, 0) + coalesce(rescatista_q3, 0) +
    coalesce(marcapasos_q1, 0) + coalesce(marcapasos_q2, 0) + coalesce(marcapasos_q3, 0) +
    coalesce(respuesta_q1, 0)  + coalesce(respuesta_q2, 0)  + coalesce(respuesta_q3, 0)
  ) stored,

  notes         text,
  created_at    timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- (mismo patrón que scorecards — aislamiento por empresa)
-- ============================================================
alter table public.multiplicador_diagnostics enable row level security;

create policy "Miembros de empresa ven los diagnósticos del Multiplicador"
  on public.multiplicador_diagnostics for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = multiplicador_diagnostics.company_id
    )
  );

create policy "Usuario inserta su propio diagnóstico del Multiplicador"
  on public.multiplicador_diagnostics for insert
  with check (auth.uid() = user_id);

create policy "Usuario actualiza su propio diagnóstico del Multiplicador"
  on public.multiplicador_diagnostics for update
  using (auth.uid() = user_id);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_multiplicador_company_id on public.multiplicador_diagnostics(company_id);
create index idx_multiplicador_user_id    on public.multiplicador_diagnostics(user_id);
create index idx_multiplicador_created_at on public.multiplicador_diagnostics(created_at);
