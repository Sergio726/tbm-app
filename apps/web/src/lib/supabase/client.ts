import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import type { Database } from "@/types/database";
import { readRememberClient, sessionizeIfNeeded } from "./remember";

export function createBrowserClient() {
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Adapter de cookies idéntico al default de @supabase/ssr (parse/serialize de
      // "cookie"), pero respetando "Recordarme": si está apagado, las cookies de auth
      // se escriben como cookies de SESIÓN (se borran al cerrar el navegador).
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          const parsed = parse(document.cookie);
          return Object.keys(parsed).map((name) => ({ name, value: parsed[name] ?? "" }));
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          const remember = readRememberClient();
          for (const { name, value, options } of cookiesToSet) {
            document.cookie = serialize(name, value, sessionizeIfNeeded(options, value, remember));
          }
        },
      },
    }
  );
}

export const createClient = createBrowserClient;
