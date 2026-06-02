-- ============================================================
-- Limpieza de perfil corrupto (secuela del bug de accept-invite)
-- Un perfil ("Sebastian") quedó renombrado a "Theo" y/o con un DISC
-- que no le corresponde, porque accept-invite escribía sobre el usuario
-- logueado. El bug de fondo ya está corregido (accept-invite endurecido).
-- Esto repara los datos que quedaron mal. CORRER en el SQL Editor.
-- ============================================================

-- 0) PRE-REQUISITO: aplicar antes migration_sprint5_roles.sql (arregla roles).

-- 1) Identificar el/los perfiles corruptos (ajustá el filtro)
select id, email, full_name, role, company_id, disc_status, disc_letters, disc_profile_key
from public.profiles
where full_name ilike '%theo%';
-- (anotá el id del perfil a corregir para el paso 2)

-- 2) Corregir nombre + LIMPIAR el DISC mal asignado.
--    Reemplazá <ID_DEL_PERFIL> y el nombre correcto.
update public.profiles set
  full_name        = 'Sebastian',            -- <-- nombre correcto
  disc_status      = 'pendiente',
  disc_letters     = null,
  disc_name        = null,
  disc_icon        = null,
  disc_profile_key = null,
  disc_scores      = null
where id = '<ID_DEL_PERFIL>';

-- 3) (Opcional) borrar los tests DISC que escribieron sobre ese perfil,
--    para que no quede historial cruzado.
-- delete from public.disc_assessments where profile_id = '<ID_DEL_PERFIL>';

-- 4) Verificar
-- select id, email, full_name, role, disc_status, disc_letters
-- from public.profiles where id = '<ID_DEL_PERFIL>';
