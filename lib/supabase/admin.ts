import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client for privileged server-side writes (bypasses RLS).
 * NEVER import from client components. Returns null when the key is not
 * configured (mock mode / local dev) so callers can fall back to the anon
 * client instead of crashing.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || key.startsWith('your_') || url.includes('placeholder')) {
    return null;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
