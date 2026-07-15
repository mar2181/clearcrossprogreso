import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cookieless anon client for PUBLIC catalog reads (categories, providers,
 * procedures, prices, reviews, flash discounts).
 *
 * These reads are anonymous and RLS-gated — they do NOT depend on the visitor's
 * auth session, so they must not go through the cookie-based SSR server client
 * (`createServerSupabaseClient`). That client calls `next/headers` `cookies()`,
 * which THROWS during static generation ("called outside a request scope") and
 * breaks `next build` once real Supabase env vars are present. A plain anon
 * client works at build time (SSG) and at request time alike.
 *
 * Falls back to placeholder values so `next build` never crashes when env is
 * absent (mock mode) — the mock-data toggle short-circuits before we get here.
 */
export function createPublicSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
