-- Invitaciones · fix RLS — el invitado puede ver y aceptar su propia invitación
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf
--
-- Bug: las policies de `invitations` eran SOLO para el Arquitecto (ver/insertar/
-- actualizar). El colaborador invitado, que todavía NO es miembro de la empresa,
-- no podía leer su propia invitación en /accept-invite → "No encontramos una
-- invitación para tu email en esta empresa". Se agrega visibilidad + update de la
-- PROPIA invitación, matcheando por el email del JWT (auth.email()).

drop policy if exists "Invitado ve su propia invitacion" on public.invitations;
create policy "Invitado ve su propia invitacion" on public.invitations
  for select using (lower(email) = lower(auth.email()));

drop policy if exists "Invitado acepta su propia invitacion" on public.invitations;
create policy "Invitado acepta su propia invitacion" on public.invitations
  for update using (lower(email) = lower(auth.email()))
  with check (lower(email) = lower(auth.email()));
