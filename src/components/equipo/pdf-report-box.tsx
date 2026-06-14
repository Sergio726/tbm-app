"use client";

import { useRef, useState } from "react";
import { ScrollText, Upload } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export function PdfReportBox({
  pdfPath,
  editable,
  uploading,
  onUpload,
}: {
  pdfPath: string | null;
  editable: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [opening, setOpening] = useState(false);
  const [openErr, setOpenErr] = useState("");

  async function view() {
    if (!pdfPath) return;
    if (/^https?:\/\//.test(pdfPath)) {
      window.open(pdfPath, "_blank");
      return;
    }
    setOpening(true);
    setOpenErr("");
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.storage
        .from("disc-reports")
        .createSignedUrl(pdfPath, 120);
      if (error || !data) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (e) {
      console.error("Error abriendo informe:", e);
      setOpenErr("No se pudo abrir el informe. Intentá de nuevo.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-[#a78bfa]/30 bg-[#a78bfa]/[0.14] text-[#a78bfa]">
          <ScrollText size={16} strokeWidth={1.9} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white/85">
            Informe DISC profesional
          </div>
          <div className="text-[11.5px] text-white/45">
            {pdfPath ? (
              <button
                type="button"
                onClick={view}
                disabled={opening}
                className="text-[#bcd0ff] hover:underline"
              >
                {opening ? "Abriendo…" : "Ver PDF →"}
              </button>
            ) : (
              "Sin informe PDF cargado."
            )}
          </div>
          {openErr && (
            <div className="mt-1 text-[11.5px] text-[#f87171]">{openErr}</div>
          )}
        </div>
      </div>

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#a78bfa]/35 bg-[#a78bfa]/[0.14] px-3.5 py-2 text-[12.5px] font-semibold text-[#c4b5fd] transition hover:bg-[#a78bfa]/[0.22] disabled:cursor-default"
          >
            <Upload size={14} strokeWidth={2} />
            {uploading
              ? "Subiendo…"
              : pdfPath
                ? "Reemplazar PDF"
                : "Subir informe PDF"}
          </button>
        </>
      )}
    </div>
  );
}
