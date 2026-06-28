import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { REMEMBER_COOKIE, isRemembered, sessionizeIfNeeded } from "./remember";

export async function createClient() {
  const cookieStore = await cookies();

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // "Recordarme" off → cookies de sesión (no persistentes).
            const remember = isRemembered(cookieStore.get(REMEMBER_COOKIE)?.value);
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, sessionizeIfNeeded(options, value, remember))
            );
          } catch {
            // En Server Components no se pueden setear cookies.
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  );
}

export const createServerClient = createClient;
