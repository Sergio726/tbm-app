import { redirect } from "next/navigation";

// Ruta raíz → redirige al dashboard
// El middleware se encarga de verificar la sesión
export default function RootPage() {
  redirect("/dashboard");
}
