"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Panel — contenedor con hairline de acento arriba.
 * Reemplaza la antigua Card; replica el "Panel" del diseño.
 */
export function Panel({
  icon,
  iconColor = "#9fb9ff",
  title,
  sub,
  accent = "#5b8aff",
  badge,
  children,
}: {
  icon: ReactNode;
  iconColor?: string;
  title: string;
  sub?: string;
  accent?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] px-6 pb-6 pt-[22px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.006))",
      }}
    >
      {/* hairline de acento arriba */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70"
        style={{
          background: `linear-gradient(90deg, ${accent}, transparent 60%)`,
        }}
      />
      <div className="mb-[18px] flex items-start gap-3">
        <div
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] border"
          style={{
            background: `${iconColor}1c`,
            borderColor: `${iconColor}38`,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3
              className="m-0 text-[17px] font-bold tracking-tight text-white"
              style={{ letterSpacing: -0.2 }}
            >
              {title}
            </h3>
            {badge}
          </div>
          {sub && (
            <p className="mt-1 text-[12.5px] leading-[1.5] text-white/50">
              {sub}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Label de campo con hint opcional a la derecha. */
export function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-[7px] flex items-baseline justify-between">
      <label className="text-[11.5px] font-semibold tracking-[0.2px] text-white/60">
        {children}
      </label>
      {hint && (
        <span className="text-[11px] text-white/35">{hint}</span>
      )}
    </div>
  );
}

/** Input con focus ring (acento azul). */
export function TextInput({
  className,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        // Read-only/colaborador: en vez de atenuar todo el campo al 60% (ilegible),
        // se mantiene el texto legible (white/75) con cursor por defecto.
        "w-full rounded-[11px] border border-white/[0.09] bg-white/[0.035] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#5b8aff]/60 focus:ring-2 focus:ring-[#5b8aff]/20 disabled:cursor-default disabled:text-white/75",
        className
      )}
      style={style}
    />
  );
}

/** Textarea con mismo styling que TextInput. */
export function TextAreaInput({
  className,
  style,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        // Mismo criterio de legibilidad en read-only que TextInput.
        "min-h-[76px] w-full resize-y rounded-[11px] border border-white/[0.09] bg-white/[0.035] px-3.5 py-3 text-sm leading-relaxed text-white outline-none transition focus:border-[#5b8aff]/60 focus:ring-2 focus:ring-[#5b8aff]/20 disabled:cursor-default disabled:text-white/75",
        className
      )}
      style={style}
    />
  );
}
