/**
 * The Twilio side of call tracking: signature checks and the TwiML each webhook
 * answers with. Server-only.
 *
 * ⛔ EVERYTHING DECIDABLE LIVES HERE, SO IT CAN BE EXECUTED. The four route files
 * under app/api/voice/ read a request, call these, and write one database row.
 * A guard that only scanned the routes could not tell a whisper that plays from
 * one that is written and never reached.
 *
 * ⛔ NOTHING HERE RECORDS A CALL. There is no <Record> verb and no `record`
 * attribute anywhere in this file, and the guard fails the build if one appears.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isValidCode, toE164 } from './call-link';

/* ── signatures ────────────────────────────────────────────────────────────── */

/**
 * Twilio's documented X-Twilio-Signature: HMAC-SHA1 over the full URL Twilio
 * requested, followed by every POST parameter sorted by name as name+value,
 * base64. Checked against the official `twilio` library (validateRequest) with a
 * fixture that lives in test/call-tracking.mjs.
 */
export function expectedSignature(authToken: string, url: string, params: Record<string, string>): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  return createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
}

export function validSignature(
  authToken: string | undefined,
  url: string,
  params: Record<string, string>,
  header: string | null | undefined,
): boolean {
  // ⛔ No token means we CANNOT check, and cannot check is a refusal. An
  // unverified webhook lets anybody write invented calls into the log that is
  // shown to a clinic as proof.
  if (!authToken || !header) return false;
  const want = Buffer.from(expectedSignature(authToken, url, params));
  const got = Buffer.from(header);
  if (want.length !== got.length) return false;
  return timingSafeEqual(want, got);
}

/**
 * The URL Twilio signed. Behind Vercel the request can arrive with an internal
 * host or protocol, so the forwarded headers win when present. The path and the
 * query string are signed too, so both are kept verbatim.
 */
export function publicUrl(requestUrl: string, header: (name: string) => string | null): string {
  const u = new URL(requestUrl);
  const proto = (header('x-forwarded-proto') ?? u.protocol.replace(':', '')).split(',')[0].trim();
  const host = (header('x-forwarded-host') ?? header('host') ?? u.host).split(',')[0].trim();
  return `${proto}://${host}${u.pathname}${u.search}`;
}

/* ── TwiML ─────────────────────────────────────────────────────────────────── */

export function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const wrap = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;

export const SITE_SPOKEN = 'clear cross progreso punto com';
export const WHISPER_TEXT = 'Paciente de ClearCross Progreso.';

/**
 * First contact. Attempt 1 is SILENT on purpose: the visitor's phone is already
 * sending the code after its pauses, and a prompt talking over those tones would
 * only make the caller think they have to do something. Only when no digits
 * arrived does attempt 2 ask, Spanish first — most people crossing to Progreso
 * are Spanish speakers, and so is every front desk the call goes to.
 */
export function gatherTwiml(attempt: number): string {
  if (attempt <= 1) {
    return wrap(
      `<Gather input="dtmf" numDigits="3" timeout="6" action="/api/voice/route?attempt=1" method="POST"></Gather>` +
        `<Redirect method="POST">/api/voice/incoming?attempt=2</Redirect>`,
    );
  }
  return wrap(
    `<Gather input="dtmf" numDigits="3" timeout="8" action="/api/voice/route?attempt=2" method="POST">` +
      `<Say language="es-MX">Marque el código de tres dígitos de la clínica que aparece en la página.</Say>` +
      `<Say language="en-US">Please enter the three digit clinic code shown on the page.</Say>` +
      `</Gather>` +
      `<Say language="es-MX">No recibimos un código. Visite ${SITE_SPOKEN}. Adiós.</Say>` +
      `<Hangup/>`,
  );
}

export function parseCode(digits: string | null | undefined): number | null {
  if (!digits || !/^\d{3}$/.test(digits)) return null;
  const n = Number(digits);
  return isValidCode(n) ? n : null;
}

/** Digits that arrived before any prompt were sent by the phone itself. */
export function codeSource(attempt: number, code: number | null): 'auto' | 'typed' | 'none' {
  if (code === null) return 'none';
  return attempt <= 1 ? 'auto' : 'typed';
}

export function unknownCodeTwiml(attempt: number): string {
  if (attempt <= 1) {
    return wrap(
      `<Say language="es-MX">No encontramos ese código.</Say>` +
        `<Redirect method="POST">/api/voice/incoming?attempt=2</Redirect>`,
    );
  }
  return wrap(
    `<Say language="es-MX">No encontramos ese código. Visite ${SITE_SPOKEN}. Adiós.</Say><Hangup/>`,
  );
}

export function unavailableTwiml(): string {
  return wrap(
    `<Say language="es-MX">Lo sentimos, no podemos conectar su llamada en este momento. Visite ${SITE_SPOKEN}.</Say><Hangup/>`,
  );
}

/**
 * Connect to the clinic. The <Number url> is what the CLINIC hears when it picks
 * up, before the two sides are joined — the patient never hears it.
 *
 * ⛔ callerId IS THE PATIENT'S OWN NUMBER when Twilio gave us a usable one, so the
 * clinic can call them back. A blocked or malformed caller is left out and Twilio
 * shows our number instead; sending garbage there fails the whole dial.
 */
export function dialTwiml(clinicE164: string, caller: string | null | undefined, code: number): string {
  const callerId = toE164(caller ?? null);
  const callerAttr = callerId ? ` callerId="${xml(callerId)}"` : '';
  return wrap(
    `<Dial${callerAttr} timeout="25" answerOnBridge="true" action="/api/voice/status?code=${code}" method="POST">` +
      `<Number url="/api/voice/whisper" method="POST">${xml(clinicE164)}</Number>` +
      `</Dial>`,
  );
}

export function whisperTwiml(): string {
  return wrap(`<Say language="es-MX">${xml(WHISPER_TEXT)}</Say>`);
}

/** "+528999370188" -> "5 2, 8 9 9, 9 3 7, 0 1 8 8" so a voice reads it digit by digit. */
export function spokenDigits(e164: string): string {
  const d = e164.replace(/\D/g, '');
  const groups: string[] = [];
  let rest = d;
  while (rest.length > 4) {
    groups.push(rest.slice(0, 3));
    rest = rest.slice(3);
  }
  groups.push(rest);
  return groups.map((g) => g.split('').join(' ')).join(', ');
}

/**
 * After the dial. A completed call just ends. Anything else — no answer, busy,
 * failed — tells the caller so and reads the clinic's own number, because the
 * worst outcome here is a patient who tried to call a clinic and got silence.
 */
export function statusTwiml(dialStatus: string | null | undefined, clinicE164: string | null): string {
  if (dialStatus === 'completed') return wrap(`<Hangup/>`);
  const number = clinicE164
    ? ` <Say language="es-MX">El número directo de la clínica es ${xml(spokenDigits(clinicE164))}.</Say>` +
      `<Say language="en-US">The clinic's direct number is ${xml(spokenDigits(clinicE164))}.</Say>`
    : '';
  return wrap(
    `<Say language="es-MX">La clínica no contestó.</Say><Say language="en-US">The clinic did not answer.</Say>${number}<Hangup/>`,
  );
}

export function twimlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/**
 * Read a Twilio webhook and refuse it unless it is signed.
 *
 * ⛔ Every route under app/api/voice/ calls this FIRST, before it looks anything
 * up or writes anything. The guard checks that order in the source.
 */
export async function readVerified(
  req: Request,
  authToken: string | undefined,
): Promise<{ ok: true; params: Record<string, string>; url: URL } | { ok: false; response: Response }> {
  if (!authToken) {
    return { ok: false, response: new Response('call tracking is not configured', { status: 503 }) };
  }
  const params: Record<string, string> = {};
  try {
    const form = await req.formData();
    form.forEach((v, k) => {
      params[k] = String(v);
    });
  } catch {
    return { ok: false, response: new Response('bad request', { status: 400 }) };
  }
  const url = publicUrl(req.url, (n) => req.headers.get(n));
  if (!validSignature(authToken, url, params, req.headers.get('x-twilio-signature'))) {
    return { ok: false, response: new Response('invalid signature', { status: 403 }) };
  }
  return { ok: true, params, url: new URL(url) };
}

export function attemptOf(url: URL): number {
  return url.searchParams.get('attempt') === '2' ? 2 : 1;
}
