import { createClient } from "@supabase/supabase-js";
import type { Database } from "@tbm/shared";

/**
 * Cliente service-role (server-only). NUNCA exponer al browser.
 * Devuelve null si falta la key — el caller debe manejarlo.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
