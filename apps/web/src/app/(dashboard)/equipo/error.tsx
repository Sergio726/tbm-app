"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function EquipoError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} label="Mi Equipo" />;
}
