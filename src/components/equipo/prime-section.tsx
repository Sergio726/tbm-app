"use client";

import { Sparkles } from "lucide-react";
import { Card, SectionTitle, Field, inputStyle } from "./primitives";
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
    <Card>
      <SectionTitle
        Icon={Sparkles}
        label="Plan PRIME & informe"
        color="#a78bfa"
        hint="El salto de crecimiento de esta persona y el informe DISC profesional en PDF."
      />
      <Field
        label="Plan PRIME"
        hint="el salto de crecimiento de esta persona"
      >
        <textarea
          value={draft.disc_prime_plan}
          disabled={!editable}
          onChange={(e) => patch({ disc_prime_plan: e.target.value })}
          placeholder="Del informe DISC: qué necesita para llegar a su PRIME."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>
      <PdfReportBox
        pdfPath={pdfPath}
        editable={editable}
        uploading={uploading}
        onUpload={onUploadPdf}
      />
    </Card>
  );
}
