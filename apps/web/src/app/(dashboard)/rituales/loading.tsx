import { PageSkeleton } from "@/components/ui/skeleton";

export default function RitualesLoading() {
  return <PageSkeleton cards={3} lines={4} minColWidth={280} />;
}
