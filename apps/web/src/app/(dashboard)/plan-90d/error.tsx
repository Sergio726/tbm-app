"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function Plan90dError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} label="tu Plan 90D" />;
}
