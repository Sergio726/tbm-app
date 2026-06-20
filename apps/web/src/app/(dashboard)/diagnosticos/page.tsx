import { redirect } from "next/navigation";

// El item "Diagnósticos" del sidebar apuntaba a una ruta inexistente (404).
// La re-evaluación del Diagnóstico Organizacional vive en /diagnostico (S12).
export default function DiagnosticosRedirect() {
  redirect("/diagnostico");
}
