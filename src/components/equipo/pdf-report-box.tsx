"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
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

  async function view() {
    if (!pdfPath) return;
    if (/^https?:\/\//.test(pdfPath)) {
      window.open(pdfPath, "_blank");
      return;
    }
    setOpening(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.storage
        .from("disc-reports")
        .createSignedUrl(pdfPath, 120);
      if (error || !data) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (e) {
      console.error("Error abriendo informe:", e);
      alert("No se pudo abrir el informe.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div
      className="flex items-center justify-between"
      style={{
        gap: 12,
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(167,139,250,0.06)",
        border: "1px solid rgba(167,139,250,0.20)",
        flexWrap: "wrap",
      }}
    >
      <div className="flex items-center" style={{ gap: 11 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(167,139,250,0.14)",
            border: "1px solid rgba(167,139,250,0.30)",
            color: "#a78bfa",
          }}
        >
          <FileText size={14} />
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
            Informe DISC profesional
          </div>
          {pdfPath ? (
            <button
              type="button"
              onClick={view}
              disabled={opening}
              style={{
                fontSize: 11.5,
                color: "#bcd0ff",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginTop: 2,
              }}
            >
              {opening ? "Abriendo…" : "Ver PDF →"}
            </button>
          ) : (
            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.5)",
                marginTop: 2,
              }}
            >
              Sin informe PDF cargado.
            </div>
          )}
        </div>
      </div>

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
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
            className="flex items-center"
            style={{
              gap: 6,
              fontSize: 12,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: uploading ? "default" : "pointer",
              background: "rgba(167,139,250,0.14)",
              border: "1px solid rgba(167,139,250,0.30)",
              color: "#c4b5fd",
              fontWeight: 600,
            }}
          >
            <Upload size={13} />{" "}
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
