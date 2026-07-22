import { PageSkeleton } from "@/components/ui/skeleton";

// El tablero Kanban tiene 4 columnas → grilla ancha de placeholders.
export default function DelegacionLoading() {
  return <PageSkeleton cards={4} lines={4} minColWidth={240} />;
}
