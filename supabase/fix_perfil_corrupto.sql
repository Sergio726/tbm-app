-- ============================================================
-- Limpieza de perfil corrupto (secuela del bug de accept-invite)
-- Un perfil ("Sebastian") quedó renombrado a "Theo" y/o con un DISC
-- que no le corresponde, porque accept-invite escribía sobre el usuario
-- logueado. El bug de fondo ya está corregido (accept-invite endurecido).
-- CORRER en el SQL Editor. Filtramos por EMAIL (no hace falta copiar UUID).
-- ============================================================

-- 0) PRE-REQUISITO: aplicar antes migration_sprint5_roles.sql (arregla roles).

-- 1) VER el perfil corrupto y su email real (confirmá que es la cuenta de Sebastian)
select id, email, full_name, role, company_id, disc_status, disc_letters, disc_profile_key
from public.profiles
where full_name ilike '%theo%';

-- 2) CORREGIR: poné el EMAIL real (de la fila de arriba) y el nombre correcto.
--    Esto renombra y limpia el DISC mal asignado.
update public.profiles set
  full_name        = 'Sebastian',                 -- <-- nombre correcto
  disc_status      = 'pendiente',
  disc_letters     = null,
  disc_name        = null,
  disc_icon        = null,
  disc_profile_key = null,
  disc_scores      = null
where email = 'EMAIL_DE_SEBASTIAN@ejemplo.com';   -- <-- email real (de la fila del paso 1)

-- 3) (Opcional) borrar los tests DISC cruzados sobre ese perfil
-- delete from public.disc_assessments
-- where profile_id = (select id from public.profiles where email = 'EMAIL_DE_SEBASTIAN@ejemplo.com');

-- 4) Verificar
-- select id, email, full_name, role, disc_status, disc_letters
-- from public.profiles where email = 'EMAIL_DE_SEBASTIAN@ejemplo.com';
