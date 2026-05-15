export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendQuoteConfirmation, sendProviderQuoteAlert } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const providerId = formData.get('provider_id') as string;
    const procedureId = formData.get('procedure_id') as string;
    const description = formData.get('description') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const photo = formData.get('photo') as File | null;

    // Validation
    if (!providerId || !procedureId || !description || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (description.length < 20 || description.length > 2000) {
      return NextResponse.json(
        { error: 'Description must be between 20 and 2000 characters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify the provider exists
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, name')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch the procedure name for emails
    const { data: procedure } = await supabase
      .from('procedures')
      .select('name')
      .eq('id', procedureId)
      .single();

    // Get or create user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId = existingUser?.id;

    if (!userId) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
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

    // Upload photo if provided
    let photoUrl: string | null = null;
    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('quote_photos')
        .upload(fileName, photo);

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        // Continue without photo rather than failing the entire request
      } else {
        const { data: publicUrl } = supabase.storage
          .from('quote_photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrl.publicUrl;
      }
    }

    // Create quote request
    const { data: quoteRequest, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        provider_id: providerId,
        user_id: userId,
        procedure_id: procedureId,
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

    const procedureName = procedure?.name || 'Custom Procedure';

    // Send email notifications (non-blocking — don't fail the request if emails fail)
    await Promise.allSettled([
      sendQuoteConfirmation({
        patientEmail: email,
        patientName: name,
        providerName: provider.name,
        procedureName,
        quoteId: quoteRequest.id,
      }),
      // Fetch provider's user email for the alert
      (async () => {
        const { data: providerUser } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('provider_id', providerId)
          .eq('role', 'provider')
          .single();

        if (providerUser?.email) {
          await sendProviderQuoteAlert({
            providerEmail: providerUser.email,
            providerName: provider.name,
            patientName: name,
            procedureName,
            description,
            quoteId: quoteRequest.id,
          });
        }
      })(),
    ]);

    return NextResponse.json({ id: quoteRequest.id }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
