"use client";

import type { Profile } from "@/types/database";
import { MemberHero } from "./member-hero";
import { DiscSection } from "./disc-section";
import { LosSection } from "./los-section";
import { AlignmentSection } from "./alignment-section";
import { PrimeSection } from "./prime-section";
import type { ChecklistItem, DiscScoresShape, Draft } from "./types";

export function MemberDetail({
  member,
  draft,
  patch,
  editable,
  checklist,
  scores,
  testToken,
  testStatus,
  onGenerateLink,
  generating,
  onUploadPdf,
  uploadingPdf,
}: {
  member: Profile;
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  editable: boolean;
  checklist: ChecklistItem[];
  scores: DiscScoresShape;
  testToken: string | null;
  testStatus: string | null;
  onGenerateLink: () => void;
  generating: boolean;
  onUploadPdf: (file: File) => void;
  uploadingPdf: boolean;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <MemberHero member={member} draft={draft} checklist={checklist} />

      <DiscSection
        member={member}
        draft={draft}
        patch={patch}
        editable={editable}
        scores={scores}
        testToken={testToken}
        testStatus={testStatus}
        onGenerateLink={onGenerateLink}
        generating={generating}
      />

      <LosSection draft={draft} patch={patch} editable={editable} />

      <AlignmentSection draft={draft} patch={patch} editable={editable} />

      <PrimeSection
        draft={draft}
        patch={patch}
        editable={editable}
        pdfPath={member.disc_pdf_url}
        uploading={uploadingPdf}
        onUploadPdf={onUploadPdf}
      />
    </div>
  );
}
