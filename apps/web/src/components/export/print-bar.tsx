"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

/** Barra superior de las vistas de exportación. Se oculta al imprimir. */
export function PrintBar({ backHref, title }: { backHref: string; title: string }) {
  return (
    <div
      className="no-print sticky top-0 z-10 mb-6 flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
      style={{ borderColor: "#e2e8f0", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        Volver
      </Link>
      <span className="text-[13px] font-semibold text-slate-700">{title}</span>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-fg"
        style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
      >
        <Printer size={14} />
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
