export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendProviderClaimAlert } from '@/lib/email';
import { slugify } from '@/lib/utils';

// Called by the registration form before it decides whether to create a
// NEW provider listing. `clearcross_providers` is public-read already (see
// 001_clearcross_schema.sql), so this needs no elevated client — it only
// ever returns the id/name of a listing that anyone can already see on the
// site, never anything from clearcross_users or clearcross_quote_requests.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const clinicName = typeof body.clinicName === 'string' ? body.clinicName.trim() : '';
    const registrantName = typeof body.registrantName === 'string' ? body.registrantName.trim() : '';
    const registrantEmail = typeof body.registrantEmail === 'string' ? body.registrantEmail.trim() : '';
    const registrantPhone = typeof body.registrantPhone === 'string' ? body.registrantPhone.trim() : '';

    if (!clinicName) {
      return NextResponse.json({ error: 'clinicName is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const slug = slugify(clinicName);

    // Slug match first (exact, the same normalization the old create-flow
    // used to build the slug it inserted). Fall back to a loose name match
    // so "Dental Artistry" still finds "Dental Artistry / World Dental
    // Center" — a clinic rarely types their listing's name back verbatim.
    let match: { id: string; name: string } | null = null;

    const { data: bySlug } = await supabase
      .from('clearcross_providers')
      .select('id, name')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (bySlug) {
      match = bySlug;
    } else {
      const { data: byName } = await supabase
        .from('clearcross_providers')
        .select('id, name')
        .ilike('name', `%${clinicName}%`)
        .limit(1)
        .maybeSingle();
      match = byName ?? null;
    }

    if (!match) {
      return NextResponse.json({ matched: false });
    }

    let alerted = true;
    let alertReason: string | undefined;
    if (registrantEmail) {
      const result = await sendProviderClaimAlert({
        matchedProviderId: match.id,
        matchedProviderName: match.name,
        registrantName: registrantName || 'Unknown',
        registrantEmail,
        registrantPhone: registrantPhone || 'not given',
      });
      alerted = result.ok;
      alertReason = result.reason;
    }

    return NextResponse.json({
      matched: true,
      provider: match,
      alerted,
      ...(alertReason ? { alertReason } : {}),
    });
  } catch (error) {
    console.error('[providers/claim] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
