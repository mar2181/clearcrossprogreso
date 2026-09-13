/**
 * POST /api/voice/route — the caller's 3-digit code arrived. Find the clinic and
 * connect them.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { toE164 } from '@/lib/call-link';
import {
  attemptOf,
  codeSource,
  dialTwiml,
  parseCode,
  readVerified,
  twimlResponse,
  unavailableTwiml,
  unknownCodeTwiml,
} from '@/lib/twilio-voice';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const v = await readVerified(req, process.env.TWILIO_AUTH_TOKEN);
  if (!v.ok) return v.response;

  const attempt = attemptOf(v.url);
  const digits = v.params.Digits ?? null;
  const code = parseCode(digits);
  const callSid = v.params.CallSid;
  const caller = v.params.From ?? null;

  const admin = createAdminClient();
  if (!admin) return twimlResponse(unavailableTwiml());

  type Row = { id: string; phone: string | null };
  const provider: Row | null =
    code === null
      ? null
      : (((await admin.from('clearcross_providers').select('id, phone').eq('call_code', code).maybeSingle())
          .data as Row | null) ?? null);
  const clinic = provider ? toE164(provider.phone) : null;

  // ⛔ Logged whether or not the code resolved. A wrong code is also a call a
  // patient made because of this site, and an unlogged one is invisible.
  if (callSid) {
    await admin.from('clearcross_calls').upsert(
      {
        call_sid: callSid,
        provider_id: clinic ? provider!.id : null,
        caller,
        code_entered: digits,
        code_source: codeSource(attempt, clinic ? code : null),
      },
      { onConflict: 'call_sid' },
    );
  }

  // ⛔ An unknown code NEVER dials anything.
  if (!clinic || code === null) return twimlResponse(unknownCodeTwiml(attempt));
  return twimlResponse(dialTwiml(clinic, caller, code));
}
