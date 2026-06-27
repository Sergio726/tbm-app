import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

/**
 * Intercambia el token del magic link (email de invitación) por una sesión
 * en cookies SSR. Sin esta ruta, el colaborador llega a /accept-invite sin
 * sesión y ve "No hay sesión activa".
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  const supabase = await createServerClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Resiliencia: si la verificación falló PERO ya hay sesión en este navegador
  // (ej. el link se abrió dos veces y el 1er verify ya creó la sesión), seguimos
  // al destino en vez de mostrar "link inválido".
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Error real: preservar el `company` (viene DENTRO de `next`, no como query
  // top-level) para no perder el contexto de la empresa en /accept-invite.
  const errorUrl = new URL("/accept-invite", origin);
  errorUrl.searchParams.set("error", "invalid_link");
  let company = searchParams.get("company");
  if (!company) {
    try {
      company = new URL(next, origin).searchParams.get("company");
    } catch {
      /* next no parseable → sin company */
    }
  }
  if (company) errorUrl.searchParams.set("company", company);
  return NextResponse.redirect(errorUrl);
}
