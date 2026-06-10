import { redirect } from "next/navigation";

// El módulo Multiplicador (fase B, diagnóstico de los 3 Pecados) no existe
// todavía. El proxy fase A vive en el tile del Dashboard y los datos del
// equipo en /equipo — redirigimos ahí en lugar de un 404.
export default function MultiplicadorRedirect() {
  redirect("/equipo");
}
