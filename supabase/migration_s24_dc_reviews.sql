-- ============================================================================
-- S24 · DC proactivo — log de intervenciones sobre formularios
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
-- Fecha: 2026-07-30
--
-- Dilio/Sebas (Meet 2026-07-25): "hoy la IA es pasiva, cuando yo la invoco recién
-- me contesta. Deberíamos hacerla más activa, que esté ahí acompañándole".
--
-- Por qué una tabla y no reusar `ai_messages`:
--   1. RATE LIMIT SEPARADO. El chat de DC topea 50 mensajes/usuario/hora contando
--      `ai_messages`. Un formulario puede generar muchas más evaluaciones que una
--      conversación, así que si compartieran contador el usuario se quedaría sin
--      chat por haber escrito una delegación. Contadores distintos, cuotas
--      distintas.
--   2. MEDIR EL COSTO. El riesgo dominante de S24 es el gasto en tokens: esto se
--      dispara desde un form, no desde un chat. Sin registro no hay forma de
--      saber cuánto suma por delegación creada.
--   3. No ensucia el historial de conversaciones (las reviews no son diálogo).
--
-- NO guarda el texto del usuario: solo el hash (`cache_key`) y su longitud. Es un
-- log de operación y costo, no de contenido.
--
-- IDEMPOTENTE: se puede correr entera y volver a correr.
-- ============================================================================

create table if not exists public.ai_reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  -- Nullable: un coach dedicado no tiene empresa.
  company_id uuid references public.companies(id) on delete cascade,

  kind       varchar(40) not null,   -- delegation_dod | delegation_why | workbook_answer | …
  verdict    varchar(10),            -- ok | weak | poor · null = el modelo devolvió basura
  cache_key  varchar(80),            -- hash del texto evaluado (NO el texto)
  model      text,
  chars_in   int,                    -- longitud del texto, para estimar costo

  created_at timestamptz not null default now()
);

-- El índice que sostiene el rate limit: (user_id, created_at) para el conteo de
-- la última hora.
create index if not exists idx_ai_reviews_user_created
  on public.ai_reviews (user_id, created_at desc);

-- Para el readout de costo por empresa en el admin.
create index if not exists idx_ai_reviews_company_created
  on public.ai_reviews (company_id, created_at desc);

alter table public.ai_reviews enable row level security;

-- Sin policies a propósito: solo service_role escribe y lee (el endpoint y el
-- panel de admin). Mismo criterio que `audit_log`. RLS habilitada sin policies
-- = nadie con JWT de usuario entra, ni para leer.
