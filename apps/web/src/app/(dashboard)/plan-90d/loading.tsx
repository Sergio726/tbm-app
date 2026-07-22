import { PageSkeleton } from "@/components/ui/skeleton";

export default function Plan90dLoading() {
  return <PageSkeleton cards={4} lines={4} minColWidth={260} />;
}
