/**
 * POST /api/voice/status — the <Dial> action. Records how the call ended and, if
 * the clinic did not answer, reads the caller the clinic's direct number.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { toE164 } from '@/lib/call-link';
import { parseCode, readVerified, statusTwiml, twimlResponse } from '@/lib/twilio-voice';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const v = await readVerified(req, process.env.TWILIO_AUTH_TOKEN);
  if (!v.ok) return v.response;

  const dialStatus = v.params.DialCallStatus ?? null;
  const seconds = Number(v.params.DialCallDuration);
  const code = parseCode(v.url.searchParams.get('code'));

  const admin = createAdminClient();
  let clinic: string | null = null;

  if (admin) {
    if (v.params.CallSid) {
      await admin
        .from('clearcross_calls')
        .update({
          dial_status: dialStatus,
          duration_sec: Number.isInteger(seconds) && seconds >= 0 ? seconds : null,
          ended_at: new Date().toISOString(),
        })
        .eq('call_sid', v.params.CallSid);
    }
    if (dialStatus !== 'completed' && code !== null) {
      const { data } = await admin
        .from('clearcross_providers')
        .select('phone')
        .eq('call_code', code)
        .maybeSingle();
      clinic = toE164((data as { phone: string | null } | null)?.phone ?? null);
    }
  }

  return twimlResponse(statusTwiml(dialStatus, clinic));
}
