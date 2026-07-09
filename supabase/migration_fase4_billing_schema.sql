-- ============================================================
-- FASE 4 — Schema de billing para Stripe (auditoria.md PAY-4 / §10)
--
--   Andamiaje que hay que tener ANTES de escribir código de Stripe para no
--   rehacer el motor de créditos. NO integra Stripe todavía: crea las tablas
--   sobre las que se apoyará el webhook. Aditivo (tablas nuevas) → no toca ni
--   rompe nada existente.
--
--   Depende de: migration_fase2c_ledger.sql (grant_credits idempotente por
--   request_id — el webhook lo reusa con event.id como request_id).
--
--   Patrón de seguridad: webhook_events y las escrituras de purchases/customers
--   las hace SOLO el service-role (el handler del webhook), fuera de RLS. Las
--   policies de abajo son de LECTURA para el arquitecto / el catálogo público.
--
--   Idempotente. Aplicar en el SQL Editor.
-- ============================================================

-- ── webhook_events: idempotencia de los webhooks de Stripe ──
-- Insertar-primero con el event.id como PK = candado de idempotencia. Los
-- reintentos de Stripe (mismo event.id) chocan con la PK → no-op.
create table if not exists public.webhook_events (
  id           text primary key,            -- Stripe event.id (evt_...)
  type         text,
  payload      jsonb,
  status       text not null default 'received'
               check (status in ('received', 'processed', 'error')),
  error        text,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.webhook_events enable row level security;
-- Sin policies: solo el service-role (el handler) accede.

-- ── billing_customers: empresa ↔ Stripe customer (test/live separados) ──
create table if not exists public.billing_customers (
  company_id         uuid primary key references public.companies(id) on delete cascade,
  stripe_customer_id text unique,
  livemode           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table public.billing_customers enable row level security;
drop policy if exists "billing_customer_own" on public.billing_customers;
create policy "billing_customer_own" on public.billing_customers for select
  using (company_id = (select public.auth_company_id()) and (select public.auth_is_arquitecto()));
grant select on public.billing_customers to authenticated;

-- ── credit_packages: catálogo precio → créditos (mapping en DB, no hardcode) ──
-- El webhook resuelve stripe_price_id → credits sin deploy.
create table if not exists public.credit_packages (
  id              uuid primary key default gen_random_uuid(),
  stripe_price_id text unique not null,
  name            text not null,
  credits         int not null check (credits > 0),
  amount_cents    int not null check (amount_cents >= 0),
  currency        text not null default 'usd',
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
alter table public.credit_packages enable row level security;
drop policy if exists "credit_packages_active_read" on public.credit_packages;
create policy "credit_packages_active_read" on public.credit_packages for select
  using (active = true);
grant select on public.credit_packages to authenticated;

-- ── purchases: órdenes (conciliación pago ↔ créditos es un JOIN) ──
create table if not exists public.purchases (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  package_id        uuid references public.credit_packages(id) on delete set null,
  stripe_session_id text unique,
  amount_cents      int,
  currency          text,
  credits           int,
  status            text not null default 'pending'
                    check (status in ('pending', 'paid', 'refunded', 'failed')),
  credit_tx_id      uuid references public.credit_transactions(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_purchases_company on public.purchases(company_id, created_at desc);
alter table public.purchases enable row level security;
drop policy if exists "purchases_own" on public.purchases;
create policy "purchases_own" on public.purchases for select
  using (company_id = (select public.auth_company_id()) and (select public.auth_is_arquitecto()));
grant select on public.purchases to authenticated;

-- ── product en el ledger (DB-12): permitir coexistir créditos DISC e IA ──
-- ALTER barato hoy; migración de datos dolorosa después. El saldo por-product
-- (company_credits) se modela cuando efectivamente haya créditos de IA.
alter table public.credit_transactions
  add column if not exists product text not null default 'disc';
