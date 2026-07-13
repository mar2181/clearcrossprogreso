import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client that won't throw during build
    return createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
  }

  // Next 15: cookies() returns a Promise — await it inside the async cookie
  // methods so this factory can stay synchronous for its many call sites.
  const cookieStorePromise = cookies();
  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        return (await cookieStorePromise).getAll();
      },
      async setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          const cookieStore = await cookieStorePromise;
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — ignore
        }
      },
    },
  });
}
