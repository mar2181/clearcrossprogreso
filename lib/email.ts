import { Resend } from 'resend';

// Lazy singleton — Resend v4 throws if constructed without a key, which would
// crash the build during page-data collection. Only construct when actually sending.

/** Escape user-provided strings before interpolating into email HTML. */
export function esc(v: string | null | undefined): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('your_')) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

/**
 * The address mail is sent FROM.
 *
 * MUST be on a domain verified in Resend, and this one is not. Measured
 * 2026-08-29: the only verified sending domain on the available Resend account
 * is petbuddyconcierge.com. So setting RESEND_API_KEY alone would NOT make
 * quotes work -- every send would be rejected, inside a catch that only
 * console.errors, i.e. silently. Env-driven so it can be corrected without a
 * code change. See docs/QUOTE_DELIVERY.md.
 */
const FROM_EMAIL =
  process.env.QUOTE_FROM_EMAIL || 'ClearCross Progreso <noreply@clearcrossprogreso.com>';

/**
 * Where a quote goes when the clinic has no account here -- which today is every
 * clinic, because provider registration sat behind a broken link until
 * 2026-08-29.
 *
 * NO DEFAULT, DELIBERATELY. Guessing an address that may not be a real mailbox
 * replaces one silent failure with another, and this change exists precisely
 * because a lead reached nobody and nothing said so. Unset produces a loud error
 * naming the variable.
 */
const CLEARCROSS_INBOX = process.env.QUOTE_NOTIFY_TO || '';

/**
 * One place decides whether mail can be sent at all.
 *
 * The three call sites used to test `=== 'your_resend_api_key'` while
 * getResend() tested `startsWith('your_')`. So a placeholder like
 * `your_key_here` passed the guard and then getResend() returned null, which
 * made the non-null assertion on the very next line a lie.
 */
export function emailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  // `!!key` narrows; `Boolean(key)` does not — TypeScript caught that.
  return !!key && !key.startsWith('your_');
}

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
  if (!emailConfigured()) {
    console.error('[Email] NOT SENT — RESEND_API_KEY is not configured');
    return;
  }

  try {
    await getResend()!.emails.send({
      from: FROM_EMAIL,
      to: patientEmail,
      subject: `Quote Request Received — ${esc(procedureName)}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
            <p style="color: #5F5E5A; font-size: 14px;">Know the price before you cross.</p>
          </div>
          <p style="color: #2C2C2A;">Hi ${esc(patientName)},</p>
          <p style="color: #2C2C2A;">
            We have your request for <strong>${esc(procedureName)}</strong> and we are getting it
            to <strong>${esc(providerName)}</strong>. They typically respond within 24 hours.
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
  if (!emailConfigured()) {
    console.error('[Email] NOT SENT — RESEND_API_KEY is not configured');
    return;
  }

  try {
    await getResend()!.emails.send({
      from: FROM_EMAIL,
      to: providerEmail,
      subject: `New Quote Request — ${esc(procedureName)}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
            <p style="color: #5F5E5A; font-size: 14px;">New quote request for your clinic</p>
          </div>
          <p style="color: #2C2C2A;">Hi ${esc(providerName)},</p>
          <p style="color: #2C2C2A;">
            <strong>${esc(patientName)}</strong> has requested a quote for <strong>${esc(procedureName)}</strong>.
          </p>
          <div style="background: #F5F5F0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; color: #5F5E5A; font-size: 13px;">Patient Description</p>
            <p style="margin: 0; color: #2C2C2A;">${esc(description.slice(0, 300))}${description.length > 300 ? '...' : ''}</p>
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

// ── Quote alert to ClearCross itself ────────────────────────────────
/**
 * Fires on EVERY quote, whether or not the clinic has an account here.
 *
 * ⛔ WHY. The provider alert was wrapped in `if (providerUser?.email)` with no
 * else. No provider had an account — registration sat behind a broken link until
 * 2026-08-29 — so the branch never ran: no mail, no log, no error. Meanwhile the
 * patient was emailed "your request has been sent to <clinic>". A false statement
 * to a customer, on every quote this site has ever taken, invisibly.
 *
 * ⛔ RETURNS A RESULT rather than swallowing. The caller has to be able to say
 * whether a human was actually told; a function that cannot fail visibly is how
 * this went unnoticed in the first place.
 */
export async function sendClearCrossQuoteAlert({
  providerName,
  providerReached,
  patientName,
  patientEmail,
  patientPhone,
  procedureName,
  description,
  quoteId,
}: {
  providerName: string;
  providerReached: boolean;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  procedureName: string;
  description: string;
  quoteId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!emailConfigured()) return { ok: false, reason: 'RESEND_API_KEY is not configured' };
  if (!CLEARCROSS_INBOX) return { ok: false, reason: 'QUOTE_NOTIFY_TO is not configured' };

  // The operationally useful half: whoever opens this needs to know instantly
  // whether the clinic has already been told or whether they have to forward it.
  const banner = providerReached
    ? '<p style="margin:0;color:#3A8B2F;font-weight:600;">The clinic was emailed directly as well.</p>'
    : '<p style="margin:0;color:#B00020;font-weight:600;">This clinic has NO account here — nobody at the clinic has been told. Forward this manually.</p>';

  try {
    await getResend()!.emails.send({
      from: FROM_EMAIL,
      to: CLEARCROSS_INBOX,
      replyTo: patientEmail,
      subject: `[Quote] ${esc(procedureName)} — ${esc(providerName)}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="color:#1A5CB0;font-size:20px;margin:0 0 16px;">New quote request</h1>
          <div style="background:#F5F5F0;border-radius:8px;padding:16px;margin-bottom:16px;">${banner}</div>
          <table style="width:100%;border-collapse:collapse;color:#2C2C2A;font-size:14px;">
            <tr><td style="padding:4px 0;color:#5F5E5A;width:110px;">Clinic</td><td>${esc(providerName)}</td></tr>
            <tr><td style="padding:4px 0;color:#5F5E5A;">Procedure</td><td>${esc(procedureName)}</td></tr>
            <tr><td style="padding:4px 0;color:#5F5E5A;">Patient</td><td>${esc(patientName)}</td></tr>
            <tr><td style="padding:4px 0;color:#5F5E5A;">Email</td><td>${esc(patientEmail)}</td></tr>
            <tr><td style="padding:4px 0;color:#5F5E5A;">Phone</td><td>${esc(patientPhone)}</td></tr>
            <tr><td style="padding:4px 0;color:#5F5E5A;">Quote ID</td><td>${esc(quoteId)}</td></tr>
          </table>
          <div style="background:#F5F5F0;border-radius:8px;padding:16px;margin-top:16px;">
            <p style="margin:0 0 4px;color:#5F5E5A;font-size:13px;">What they wrote</p>
            <p style="margin:0;color:#2C2C2A;">${esc(description.slice(0, 1000))}${description.length > 1000 ? '…' : ''}</p>
          </div>
        </div>
      `,
    });
    return { ok: true };
  } catch (error) {
    console.error('[Email] Failed to send the ClearCross quote alert:', error);
    return { ok: false, reason: String(error).slice(0, 200) };
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
  if (!emailConfigured()) {
    console.error('[Email] NOT SENT — RESEND_API_KEY is not configured');
    return;
  }

  const statusMessages: Record<string, { subject: string; body: string }> = {
    quoted: {
      subject: `You've Received a Quote — ${esc(procedureName)}`,
      body: `<strong>${esc(providerName)}</strong> has quoted <strong>$${quotedPrice?.toFixed(2) ?? '—'}</strong> for your <strong>${esc(procedureName)}</strong> request. Log in to accept or decline.`,
    },
    accepted: {
      subject: `Quote Accepted — ${esc(procedureName)}`,
      body: `Your quote for <strong>${esc(procedureName)}</strong> with <strong>${esc(providerName)}</strong> has been accepted and the price is now locked at <strong>$${quotedPrice?.toFixed(2) ?? '—'}</strong>.`,
    },
    rejected: {
      subject: `Quote Update — ${esc(procedureName)}`,
      body: `Your quote for <strong>${esc(procedureName)}</strong> with <strong>${esc(providerName)}</strong> was declined. You can request quotes from other providers anytime.`,
    },
  };

  const msg = statusMessages[status];
  if (!msg) return;

  try {
    await getResend()!.emails.send({
      from: FROM_EMAIL,
      to: patientEmail,
      subject: msg.subject,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1A5CB0; font-size: 24px; margin: 0;">ClearCross Progreso</h1>
          </div>
          <p style="color: #2C2C2A;">Hi ${esc(patientName)},</p>
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
