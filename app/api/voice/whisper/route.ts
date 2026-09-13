/**
 * POST /api/voice/whisper — played to the CLINIC when they pick up, before the
 * patient is joined. The patient never hears it.
 */
import { readVerified, twimlResponse, whisperTwiml } from '@/lib/twilio-voice';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const v = await readVerified(req, process.env.TWILIO_AUTH_TOKEN);
  if (!v.ok) return v.response;
  return twimlResponse(whisperTwiml());
}
