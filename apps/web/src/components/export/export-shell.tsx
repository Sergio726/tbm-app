import type { ReactNode } from "react";

/** Marco visual "documento" de todas las exportaciones (claro, imprimible). */
export function ExportShell({
  title,
  subtitle,
  companyName,
  children,
}: {
  title: string;
  subtitle: string;
  companyName: string;
  children: ReactNode;
}) {
  return (
    <div className="tbm-export" style={{ color: "#1f2937" }}>
      <header
        className="mb-6 border-b pb-5"
        style={{ borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div
              className="mb-1 text-[11px] font-bold uppercase tracking-[1.4px]"
              style={{ color: "#2563EB" }}
            >
              The Business Multiplier · {companyName}
            </div>
            <h1 className="m-0 text-[24px] font-extrabold text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>
          </div>
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            TBM
          </div>
        </div>
      </header>

      {children}

      <footer
        className="mt-8 border-t pt-4 text-center text-[11px] text-slate-400"
        style={{ borderColor: "#e2e8f0" }}
      >
        Generado el{" "}
        {new Date().toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · The Business Multiplier · método de Dilio Donado
      </footer>
    </div>
  );
}

export function ExportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6" style={{ breakInside: "avoid" }}>
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[1.2px] text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

export const SCORE_EXPORT_COLORS = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#059669"];
export const SCORE_EXPORT_LABELS = ["Crítico", "Bajo", "Regular", "Bien", "Excelente"];
