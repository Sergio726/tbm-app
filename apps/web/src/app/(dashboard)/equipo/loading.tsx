import { PageSkeleton } from "@/components/ui/skeleton";

export default function EquipoLoading() {
  return <PageSkeleton cards={6} lines={3} maxWidth={1500} />;
}
