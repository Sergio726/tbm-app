"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function DashboardError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} label="tu inicio" />;
}
