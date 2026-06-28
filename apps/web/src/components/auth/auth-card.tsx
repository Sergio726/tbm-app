/**
 * AuthCard — frame centrado con brand mark.
 * Usado por /register y /accept-invite. /login tiene su propio split-screen.
 */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-tbm-bg">
      {/* Fondo radial sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--elevated)_0%,_var(--bg)_60%)]"
      />

      {/* Card centrado */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-gradient text-sm font-bold text-fg">
              TBM
            </div>
            <span className="text-lg font-semibold text-tbm-text-primary">
              The Business Multiplier
            </span>
          </div>
          <p className="text-sm text-tbm-text-muted">
            Sistema Operativo de tu Negocio
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
