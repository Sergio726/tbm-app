-- Companies · el invitado puede leer la empresa que lo invitó (para el nombre)
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Las policies de companies solo dejaban leer al owner y a coaches → en
-- /accept-invite no se mostraba el nombre de la empresa (y daba 406). Se permite
-- al invitado (aún no miembro) leer SOLO la empresa a la que tiene una invitación,
-- matcheando por el email del JWT (auth.email()).

drop policy if exists "Invitado ve la empresa que lo invito" on public.companies;
create policy "Invitado ve la empresa que lo invito" on public.companies
  for select using (
    exists (
      select 1 from public.invitations i
      where i.company_id = companies.id
        and lower(i.email) = lower(auth.email())
    )
  );
