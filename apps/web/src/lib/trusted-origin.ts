/**
 * Origin de confianza para construir links que embeben tokens de auth
 * (magic links de invitación, /auth/confirm?token_hash=...).
 *
 * NUNCA usar el `origin` que manda el cliente sin validarlo: si termina dentro
 * del link del email, un host atacante (`origin: "https://evil.com"`) recibe el
 * token OTP de la víctima y le roba la sesión (auditoria.md §1 T2).
 *
 * Prioridad:
 *   1. NEXT_PUBLIC_APP_URL (env de confianza) — fuente primaria en producción.
 *   2. El origin del cliente SOLO si es localhost (comodidad de dev).
 *   3. null → el caller debe abortar con un error claro (no adivinar un host).
 */

function normalizeOrigin(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

const ENV_ORIGIN = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);

function isLocalhost(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Devuelve un origin de confianza, o `null` si no hay ninguno seguro.
 * El `clientOrigin` recibido del navegador se ignora salvo que sea localhost.
 */
export function trustedOrigin(clientOrigin?: unknown): string | null {
  if (ENV_ORIGIN) return ENV_ORIGIN;
  const client = normalizeOrigin(clientOrigin);
  if (client && isLocalhost(client)) return client;
  return null;
}
