import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ClearCross Progreso <noreply@clearcrossprogreso.com>';

// ── Quote confirmation sent to the patient ──────────────────────────
export async function sendQuoteConfirmation({
  patientEmail,
  patientName,
  providerName,
  procedureName,
  quoteId,
}: {
  patientEmail: string;
  patientName: string;
  providerName: string;
  procedureName: string;
  quoteId: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.log('[Email] Skipping — RESEND_API_KEY not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: patientEmail,
      subject: `Quote Request Received — ${procedureName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
            <p style="color: #5F5E5A; font-size: 14px;">Know the price before you cross.</p>
          </div>
          <p style="color: #2C2C2A;">Hi ${patientName},</p>
          <p style="color: #2C2C2A;">
            Your quote request for <strong>${procedureName}</strong> has been sent to
            <strong>${providerName}</strong>. They typically respond within 24 hours.
          </p>
          <div style="background: #F5F5F0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; color: #5F5E5A; font-size: 13px;">Quote ID</p>
            <p style="margin: 0; font-weight: 600; color: #2C2C2A;">${quoteId.slice(0, 8).toUpperCase()}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://clearcrossprogreso.com'}/quote/${quoteId}"
             style="display: inline-block; background: #1A5CB0; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            View Quote Status
          </a>
          <p style="color: #5F5E5A; font-size: 13px; margin-top: 32px;">
            If you didn't request this quote, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[Email] Failed to send quote confirmation:', error);
  }
}

// ── New quote alert sent to the provider ────────────────────────────
export async function sendProviderQuoteAlert({
  providerEmail,
  providerName,
  patientName,
  procedureName,
  description,
  quoteId,
}: {
  providerEmail: string;
  providerName: string;
  patientName: string;
  procedureName: string;
  description: string;
  quoteId: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.log('[Email] Skipping — RESEND_API_KEY not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: providerEmail,
      subject: `New Quote Request — ${procedureName}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
            <p style="color: #5F5E5A; font-size: 14px;">New quote request for your clinic</p>
          </div>
          <p style="color: #2C2C2A;">Hi ${providerName},</p>
          <p style="color: #2C2C2A;">
            <strong>${patientName}</strong> has requested a quote for <strong>${procedureName}</strong>.
          </p>
          <div style="background: #F5F5F0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; color: #5F5E5A; font-size: 13px;">Patient Description</p>
            <p style="margin: 0; color: #2C2C2A;">${description.slice(0, 300)}${description.length > 300 ? '...' : ''}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://clearcrossprogreso.com'}/provider/quotes"
             style="display: inline-block; background: #3A8B2F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Respond to Quote
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('[Email] Failed to send provider alert:', error);
  }
}

// ── Quote status update sent to the patient ─────────────────────────
export async function sendQuoteStatusUpdate({
  patientEmail,
  patientName,
  providerName,
  procedureName,
  status,
  quotedPrice,
  quoteId,
}: {
  patientEmail: string;
  patientName: string;
  providerName: string;
  procedureName: string;
  status: 'quoted' | 'accepted' | 'rejected';
  quotedPrice?: number | null;
  quoteId: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.log('[Email] Skipping — RESEND_API_KEY not configured');
    return;
  }

  const statusMessages: Record<string, { subject: string; body: string }> = {
    quoted: {
      subject: `You've Received a Quote — ${procedureName}`,
      body: `<strong>${providerName}</strong> has quoted <strong>$${quotedPrice?.toFixed(2) ?? '—'}</strong> for your <strong>${procedureName}</strong> request. Log in to accept or decline.`,
    },
    accepted: {
      subject: `Quote Accepted — ${procedureName}`,
      body: `Your quote for <strong>${procedureName}</strong> with <strong>${providerName}</strong> has been accepted and the price is now locked at <strong>$${quotedPrice?.toFixed(2) ?? '—'}</strong>.`,
    },
    rejected: {
      subject: `Quote Update — ${procedureName}`,
      body: `Your quote for <strong>${procedureName}</strong> with <strong>${providerName}</strong> was declined. You can request quotes from other providers anytime.`,
    },
  };

  const msg = statusMessages[status];
  if (!msg) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: patientEmail,
      subject: msg.subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
          </div>
          <p style="color: #2C2C2A;">Hi ${patientName},</p>
          <p style="color: #2C2C2A;">${msg.body}</p>
          <div style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://clearcrossprogreso.com'}/quote/${quoteId}"
               style="display: inline-block; background: #1A5CB0; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              View Quote Details
            </a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('[Email] Failed to send status update:', error);
  }
}
