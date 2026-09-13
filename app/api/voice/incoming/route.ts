/**
 * POST /api/voice/incoming — Twilio calls this when somebody dials our number.
 * Point the Twilio number's "A call comes in" webhook here.
 */
import { attemptOf, gatherTwiml, readVerified, twimlResponse } from '@/lib/twilio-voice';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const v = await readVerified(req, process.env.TWILIO_AUTH_TOKEN);
  if (!v.ok) return v.response;
  return twimlResponse(gatherTwiml(attemptOf(v.url)));
}
