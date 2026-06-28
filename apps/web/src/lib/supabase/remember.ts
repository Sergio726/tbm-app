// "Recordarme" (persistencia de sesión). La auth es por cookies (@supabase/ssr),
// que por defecto setea cookies PERSISTENTES (400 días). Para que "no recordarme"
// signifique "cerrar sesión al cerrar el navegador" convertimos esas cookies en
// cookies de SESIÓN (sin Max-Age/Expires) cuando la preferencia está apagada.
//
// La preferencia vive en una cookie propia (REMEMBER_COOKIE) para que la lean tanto
// el browser como el server/middleware y el comportamiento sea consistente.

import { parse, serialize } from "cookie";

export const REMEMBER_COOKIE = "tbm-remember";
const ONE_YEAR = 400 * 24 * 60 * 60;

/** Default true: si nunca se eligió, se comporta como antes (sesión persistente). */
export function isRemembered(value: string | undefined | null): boolean {
  return value !== "0";
}

/** Browser: lee la preferencia desde document.cookie. */
export function readRememberClient(): boolean {
  if (typeof document === "undefined") return true;
  return isRemembered(parse(document.cookie)[REMEMBER_COOKIE]);
}

/** Browser: persiste la preferencia (cookie larga; solo guarda la elección). */
export function writeRememberClient(remember: boolean): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

/**
 * Si remember=false, devuelve las opciones sin Max-Age/Expires → cookie de sesión.
 * NO toca borrados (value vacío) para no romper el logout (que usa maxAge:0).
 */
export function sessionizeIfNeeded<T extends { maxAge?: number; expires?: Date }>(
  options: T,
  value: string,
  remember: boolean
): T {
  if (remember || !value) return options;
  const next = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next;
}
