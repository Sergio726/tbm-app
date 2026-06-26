-- DC-2 · Personalización de DC desde el super-admin
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Amplía ai_config (fila scope='platform') con la "persona" editable de DC:
-- nombre, tono, mensaje de bienvenida, prompts sugeridos y flags de features.
-- Los defaults NULL → la app aplica sus defaults ("DC", tono cercano, etc.), así
-- que sin configurar nada el comportamiento es el actual.
-- RLS ya bloquea anon/authenticated (solo service-role accede) → sin policies nuevas.

alter table public.ai_config add column if not exists persona_name      text;
alter table public.ai_config add column if not exists tone              text;   -- cercano | formal | directo
alter table public.ai_config add column if not exists welcome           text;
alter table public.ai_config add column if not exists suggested_prompts jsonb;  -- array de strings
alter table public.ai_config add column if not exists features          jsonb not null default '{"rag": true}'::jsonb;
