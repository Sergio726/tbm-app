import { redirect } from "next/navigation";

/**
 * Registro público CERRADO (Fase 0).
 * El alta de cuentas es solo por invitación (flujo /accept-invite).
 * Cualquier visita a /register se redirige a /login.
 *
 * El formulario `./register-form` se conserva en disco (no se importa acá)
 * para reuso futuro del panel admin ("crear líder" — Fase 2 / A1·adm).
 */
export default function RegisterPage() {
  redirect("/login");
}
