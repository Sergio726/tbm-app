"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function WorkbooksError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} label="tus Workbooks" />;
}
