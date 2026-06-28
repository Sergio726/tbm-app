-- N2 (audit fix) · Restringir la LECTURA de credit_requests al arquitecto.
-- Antes: cualquier miembro de la empresa podía leer los pedidos (dato inocuo, pero
-- por mínimo privilegio solo el arquitecto los gestiona). El admin lee por service-role.
-- Proyecto ACTIVO: fozhnfxehbbgqaerprgf

drop policy if exists "ve_pedidos_de_su_empresa" on public.credit_requests;

create policy "arquitecto_ve_pedidos_de_su_empresa" on public.credit_requests
  for select using (
    company_id = public.auth_company_id() and public.auth_is_arquitecto()
  );
