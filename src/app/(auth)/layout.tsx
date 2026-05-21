export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tbm-bg">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#162238_0%,_#0A1628_60%)] pointer-events-none" />

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-gradient flex items-center justify-center text-white font-bold text-sm">
              TBM
            </div>
            <span className="text-tbm-text-primary font-semibold text-lg">
              The Business Multiplier
            </span>
          </div>
          <p className="text-tbm-text-muted text-sm">
            Sistema Operativo de tu Negocio
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
