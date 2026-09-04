export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendQuoteConfirmation,
  sendProviderQuoteAlert,
  sendClearCrossQuoteAlert,
} from '@/lib/email';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  QUOTE_PHOTO_BUCKET,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
} from '@/lib/quote-photo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    // Best-effort abuse protection: quote creation writes rows, uploads files
    // and sends two emails per call — cap it per IP.
    const ip = clientIp(request);
    const { allowed } = rateLimit(`quotes:${ip}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many quote requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const providerId = formData.get('provider_id') as string;
    const procedureId = formData.get('procedure_id') as string;
    const description = formData.get('description') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const photo = formData.get('photo') as File | null;

    // Validation
    // procedureId is deliberately NOT required. The procedure <select> only
    // renders for providers that publish prices, so demanding it here rejected
    // every quote from the majority of provider pages. See section 5 of
    // test/quote-delivery.mjs.
    if (!providerId || !description || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (description.length < 20 || description.length > 2000) {
      return NextResponse.json(
        { error: 'Description must be between 20 and 2000 characters' },
        { status: 400 }
      );
    }

    // Photo validation — medical images: strict type + size limits
    if (photo && photo.size > 0) {
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          { error: 'Photo must be smaller than 10 MB' },
          { status: 400 }
        );
      }
      if (!ALLOWED_PHOTO_TYPES[photo.type]) {
        return NextResponse.json(
          { error: 'Photo must be a JPEG, PNG, WebP, or HEIC image' },
          { status: 400 }
        );
      }
    }

    const supabase = createServerSupabaseClient();
    // Privileged writes go through the service-role client (RLS does not allow
    // anonymous inserts into users/quote_requests). Falls back to the anon
    // client in local/mock setups without the key.
    const admin = createAdminClient();
    const db = admin ?? supabase;

    // Verify the provider exists
    const { data: provider, error: providerError } = await supabase
      .from('clearcross_providers')
      .select('id, name')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch the procedure name for emails, only when one was supplied.
    //
    // Conditional on purpose. Comparing a uuid column against an empty string
    // is a cast error, and this destructure discards it -- which is precisely
    // how the old failure stayed invisible in the logs while the insert below
    // threw for the same reason.
    const { data: procedure } = procedureId
      ? await supabase
          .from('clearcross_procedures')
          .select('name')
          .eq('id', procedureId)
          .single()
      : { data: null };

    // Get or create user
    const { data: existingUser } = await db
      .from('clearcross_users')
      .select('id')
      .eq('email', email)
      .single();

    let userId = existingUser?.id;

    if (!userId) {
      const { data: newUser, error: userError } = await db
        .from('clearcross_users')
        .insert({
          email,
          full_name: name,
          phone,
          role: 'patient',
        })
        .select('id')
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Upload photo if provided — PRIVATE bucket; we store the storage path and
    // generate short-lived signed URLs at display time (medical imagery must
    // never live behind a permanent public URL).
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      const fileExt = ALLOWED_PHOTO_TYPES[photo.type];
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await db.storage
        .from(QUOTE_PHOTO_BUCKET)
        .upload(fileName, photo, { contentType: photo.type });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        // Continue without photo rather than failing the entire request
      } else {
        photoUrl = fileName;
      }
    }

    // Create quote request
    const { data: quoteRequest, error: quoteError } = await db
      .from('clearcross_quote_requests')
      .insert({
        provider_id: providerId,
        user_id: userId,
        procedure_id: procedureId || null,
        description,
        photo_url: photoUrl,
        status: 'pending',
      })
      .select('id')
      .single();

    if (quoteError) {
      console.error('Error creating quote request:', quoteError);
      return NextResponse.json(
        { error: 'Failed to create quote request' },
        { status: 500 }
      );
    }

    const procedureName = procedure?.name || 'General enquiry';

    // ── Tell somebody ────────────────────────────────────────────────────
    // ⛔ THE BUG THIS REPLACES: the provider alert below used to be wrapped in
    // `if (providerUser?.email)` with NO ELSE. No clinic has an account here —
    // registration sat behind a broken navbar link until 2026-08-29 — so the
    // branch never ran. No email, no log, no error, and the patient was told
    // "your request has been sent to <clinic>". Every quote this site has ever
    // taken reached nobody, and nothing anywhere said so.
    //
    // Non-blocking by design: the row is already saved, so a mail failure must
    // never cost the lead. But it must be VISIBLE, which is the part that was
    // missing.
    const { data: providerUser } = await db
      .from('clearcross_users')
      .select('email, full_name')
      .eq('provider_id', providerId)
      .eq('role', 'provider')
      .single();

    const providerReached = Boolean(providerUser?.email);
    if (!providerReached) {
      console.error(
        '[quotes] NO PROVIDER ACCOUNT for provider_id=%s (%s) — quote %s can only reach the ClearCross inbox',
        providerId,
        provider.name,
        quoteRequest.id
      );
    }

    const [, , clearcross] = await Promise.allSettled([
      sendQuoteConfirmation({
        patientEmail: email,
        patientName: name,
        providerName: provider.name,
        procedureName,
        quoteId: quoteRequest.id,
      }),
      providerReached
        ? sendProviderQuoteAlert({
            providerEmail: providerUser!.email,
            providerName: provider.name,
            patientName: name,
            procedureName,
            description,
            quoteId: quoteRequest.id,
          })
        : Promise.resolve(),
      // ⛔ UNCONDITIONAL. This is the whole point: a human at ClearCross hears
      // about every quote regardless of whether the clinic is onboarded.
      sendClearCrossQuoteAlert({
        providerName: provider.name,
        providerReached,
        patientName: name,
        patientEmail: email,
        patientPhone: phone,
        procedureName,
        description,
        quoteId: quoteRequest.id,
      }),
    ]);

    // A quote nobody was told about is the failure this route exists to prevent,
    // so it is logged at error level with the reason, not left to be inferred.
    const alert = clearcross.status === 'fulfilled' ? clearcross.value : null;
    if (!alert?.ok) {
      console.error(
        '[quotes] QUOTE %s REACHED NOBODY AT CLEARCROSS: %s',
        quoteRequest.id,
        alert?.reason ?? (clearcross.status === 'rejected' ? String(clearcross.reason) : 'unknown')
      );
    }

    return NextResponse.json({ id: quoteRequest.id }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
