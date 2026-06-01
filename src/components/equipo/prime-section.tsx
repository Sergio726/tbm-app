"use client";

import { ScrollText } from "lucide-react";
import { Panel, FieldLabel, TextAreaInput } from "./primitives";
import { PdfReportBox } from "./pdf-report-box";
import type { Draft } from "./types";

export function PrimeSection({
  draft,
  patch,
  editable,
  pdfPath,
  uploading,
  onUploadPdf,
}: {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
  pdfPath: string | null;
  uploading: boolean;
  onUploadPdf: (file: File) => void;
}) {
  return (
    <Panel
      icon={<ScrollText size={18} strokeWidth={1.9} />}
      iconColor="#a78bfa"
      accent="#a78bfa"
      title="Plan PRIME & informe"
      sub="El salto de crecimiento de esta persona y el informe DISC profesional en PDF."
    >
      <FieldLabel hint="el salto de crecimiento de esta persona">Plan PRIME</FieldLabel>
      <TextAreaInput
        value={draft.disc_prime_plan}
        disabled={!editable}
        onChange={(e) => patch({ disc_prime_plan: e.target.value })}
        placeholder="Del informe DISC: qué necesita para llegar a su PRIME."
        rows={3}
        className="min-h-[96px]"
      />
      <PdfReportBox
        pdfPath={pdfPath}
        editable={editable}
        uploading={uploading}
        onUpload={onUploadPdf}
      />
    </Panel>
  );
}
