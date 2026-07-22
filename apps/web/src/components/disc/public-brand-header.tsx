/**
 * Encabezado de marca para las pantallas públicas del test DISC
 * (`/disc/[token]`). Las ven personas que NO son usuarias de la app → es la
 * cara visible de la marca. Antes solo había un emoji; esto pone el wordmark
 * "THE BUSINESS MULTIPLIER" (el mismo del encabezado del PDF) en pantalla.
 * Server-safe.
 */
export function PublicBrandHeader() {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-[13px]"
        style={{
          background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
          boxShadow: "0 4px 14px rgba(54,114,255,0.4)",
        }}
      >
        🧭
      </span>
      <span
        className="text-[11.5px] font-bold uppercase text-tbm-text-secondary"
        style={{ letterSpacing: "0.16em" }}
      >
        The Business Multiplier
      </span>
    </div>
  );
}
