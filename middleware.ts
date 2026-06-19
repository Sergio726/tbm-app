import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de autenticación.
 * - Rutas públicas: /login, /accept-invite, /disc/ — accesibles sin sesión.
 * - Registro público CERRADO: /register NO es pública → un usuario sin sesión que
 *   la visite se redirige a /login. El alta es solo por invitación (/accept-invite).
 * - Rutas protegidas: todo lo demás → redirige a /login si no hay sesión.
 * - Si hay sesión y el usuario va a /login o /register → redirige a /dashboard.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar sesión (importante: no quitar este await)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas. /api/* se autentican solas (el cron valida CRON_SECRET en el
  // handler), así que NO deben pasar por el redirect de sesión: sin este carve-out,
  // el middleware 307-redirige /api/cron/daily a /login en producción (Edge) y el
  // cron programado de Vercel nunca llega a ejecutarse.
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/accept-invite") ||
    pathname.startsWith("/disc/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/ingest") ||
    pathname === "/favicon.ico";

  // Si no tiene sesión y está en ruta protegida → /login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Si tiene sesión y está en /login o /register → /dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas EXCEPTO archivos estáticos y API de Supabase
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)",
  ],
};
