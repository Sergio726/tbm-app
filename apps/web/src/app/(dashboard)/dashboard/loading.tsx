import { PageSkeleton } from "@/components/ui/skeleton";

// Estado de carga del dashboard (pulido pre-beta): reemplaza la pantalla en
// blanco mientras resuelven las queries del server component.
export default function DashboardLoading() {
  return <PageSkeleton cards={6} lines={3} maxWidth={1600} />;
}
