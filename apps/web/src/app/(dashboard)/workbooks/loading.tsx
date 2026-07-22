import { PageSkeleton } from "@/components/ui/skeleton";

export default function WorkbooksLoading() {
  return <PageSkeleton cards={8} lines={2} minColWidth={240} />;
}
