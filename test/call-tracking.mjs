/**
 * Call tracking — one Twilio number for every clinic.
 *
 * ⛔ WHAT THIS IS PROTECTING. Every Call button on the site will dial OUR number
 * and send a 3-digit clinic code. Get any link in that chain wrong and a patient
 * who meant to reach their dentist is connected to a different clinic, with our
 * whisper vouching for it — or to nobody, while the button looks fine. And the
 * call log is the proof we show a clinic, so an unsigned webhook that can write
 * into it is a way to fabricate that proof.
 *
 * So everything decidable is EXECUTED here, not scanned for:
 *   - the link builder, against every real phone format in the table
 *   - the Twilio signature, against the official `twilio` library's own answer
 *   - the TwiML each webhook returns, including the refusals
 *   - readVerified(), driven with real Request objects
 * and the few things that only exist as source (the order of checks inside a
 * route, the schema telephone, the migration's never-reuse rule) are audited
 * with comments stripped, because every one of those files explains itself in
 * comments that quote the thing they forbid.
 *
 * Run: node --import ./test/_ts-alias-hook-register.mjs test/call-tracking.mjs
 */
import { readFileSync } from 'node:fs';
import { stripComments } from './_strip-comments.mjs';
import { toE164, callLink, isValidCode, trackingNumber, formatNational } from '../lib/call-link.ts';
import {
  expectedSignature,
  validSignature,
  publicUrl,
  gatherTwiml,
  parseCode,
  codeSource,
  unknownCodeTwiml,
  dialTwiml,
  whisperTwiml,
  statusTwiml,
  spokenDigits,
  xml,
  readVerified,
  WHISPER_TEXT,
} from '../lib/twilio-voice.ts';

let failures = 0;
const check = (cond, label) => {
  if (cond) console.log('  ok   ' + label);
  else {
    console.log('  FAIL ' + label);
    failures++;
  }
};
const src = (f) => stripComments(readFileSync(f, 'utf8'));

const OUR = '+19565550100';
const ON = { CALL_TRACKING: 'on', TWILIO_NUMBER: OUR };
const OFF = { TWILIO_NUMBER: OUR };

/* ── 1. phone normalisation, on the formats actually in the table ────────── */
console.log('1. toE164 against the real stored formats');
const real = [
  ['+1 956-363-9329', '+19563639329'],
  ['(956) 803-6029', '+19568036029'],
  ['956-742-8735', '+19567428735'],
  ['+52 899 937 0188', '+528999370188'],
  ['+52 81 8126 0000', '+528181260000'],
  ['011528999371000', '+528999371000'],
  ['+1 512-659-9297', '+15126599297'],
];
for (const [raw, want] of real) check(toE164(raw) === want, `${raw} -> ${want} (got ${toE164(raw)})`);
for (const bad of ['', '   ', null, undefined, '12345', '+52 1', 'call us']) {
  check(toE164(bad) === null, `unreadable ${JSON.stringify(bad)} -> null, never a guess`);
}

/* ── 2. the link ─────────────────────────────────────────────────────────── */
console.log('2. callLink');
const clinic = { phone: '956-742-8735', call_code: 114 };

const off = callLink(clinic, OFF);
check(off && off.href === 'tel:+19567428735' && !off.tracked && off.code === null, 'tracking off -> the clinic\'s own number');
check(off && off.display === '956-742-8735', 'tracking off -> shows the clinic number as stored');

const on = callLink(clinic, ON);
check(on && on.href === 'tel:+19565550100,,114', `tracking on -> our number, two pauses, the code (got ${on && on.href})`);
check(on && on.tracked && on.code === 114, 'tracking on -> marked tracked with its code');
check(on && on.display === '(956) 555-0100', 'tracking on -> SHOWS our number, the one the link dials');
check(on && !on.href.includes('#'), "no '#' in the href (a URL fragment would drop the code)");
check(on && !on.display.includes('742-8735'), 'tracked display never shows the clinic number over a link that dials ours');

for (const env of [{ CALL_TRACKING: 'ON', TWILIO_NUMBER: OUR }, { CALL_TRACKING: 'true', TWILIO_NUMBER: OUR }, { CALL_TRACKING: 'on' }, { CALL_TRACKING: 'on', TWILIO_NUMBER: 'not a number' }]) {
  const l = callLink(clinic, env);
  check(l && !l.tracked && l.href === 'tel:+19567428735', `misconfigured ${JSON.stringify(env)} -> direct, never a dead button`);
}
for (const code of [null, undefined, 99, 1000, 114.5, '114', 0, -114]) {
  const l = callLink({ phone: clinic.phone, call_code: code }, ON);
  check(l && !l.tracked, `code ${JSON.stringify(code)} is not usable -> direct`);
}
check(callLink({ phone: null, call_code: 114 }, ON) === null, 'no phone -> no Call button at all, even with a code');
check(isValidCode(100) && isValidCode(999) && !isValidCode(1000), 'code range is 100..999');
check(trackingNumber(OFF) === null && trackingNumber(ON) === OUR, 'trackingNumber follows the switch');
check(formatNational('+528999370188') === '+528999370188', 'a non-US number is shown as given');

/* ── 3. the Twilio signature, against the official library ───────────────── */
console.log('3. X-Twilio-Signature');
// Computed with twilio@5 getExpectedTwilioSignature + validateRequest (true),
// 2026-09-13. An independent oracle: re-deriving it with the same algorithm here
// would only prove this file agrees with itself.
const FIX = {
  token: 'fixture-auth-token-0123456789ab',
  url: 'https://clearcrossprogreso.com/api/voice/route?attempt=1',
  params: {
    CallSid: 'CA00000000000000000000000000000001',
    Digits: '104',
    From: '+19565550100',
    To: '+19565550199',
    AccountSid: 'AC00000000000000000000000000000001',
  },
  sig: 'Ny91N99uUc8T02WAxAexr22jMNs=',
};
check(expectedSignature(FIX.token, FIX.url, FIX.params) === FIX.sig, 'matches the official twilio library');
check(validSignature(FIX.token, FIX.url, FIX.params, FIX.sig), 'a correct signature is accepted');
check(!validSignature(FIX.token, FIX.url, { ...FIX.params, Digits: '105' }, FIX.sig), 'a changed Digits is refused');
check(!validSignature(FIX.token, FIX.url.replace('attempt=1', 'attempt=2'), FIX.params, FIX.sig), 'a changed query string is refused');
check(!validSignature('another-token', FIX.url, FIX.params, FIX.sig), 'the wrong auth token is refused');
check(!validSignature(undefined, FIX.url, FIX.params, FIX.sig), 'no auth token configured -> refused, never waved through');
check(!validSignature(FIX.token, FIX.url, FIX.params, null), 'a missing header is refused');
check(!validSignature(FIX.token, FIX.url, FIX.params, 'short'), 'a wrong-length header is refused without throwing');

const hdr = (h) => (n) => h[n] ?? null;
check(
  publicUrl('http://internal:3000/api/voice/route?attempt=1', hdr({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'clearcrossprogreso.com' })) === FIX.url,
  'publicUrl rebuilds the URL Twilio signed from the forwarded headers',
);

/* ── 4. readVerified, driven with real requests ──────────────────────────── */
console.log('4. readVerified');
const signedReq = (sig, params = FIX.params, url = FIX.url) =>
  new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', ...(sig ? { 'x-twilio-signature': sig } : {}) },
    body: new URLSearchParams(params).toString(),
  });
{
  const r = await readVerified(signedReq(FIX.sig), FIX.token);
  check(r.ok && r.params.Digits === '104', 'a signed webhook is read');
  const bad = await readVerified(signedReq('Ny91N99uUc8T02WAxAexr22jMNt='), FIX.token);
  check(!bad.ok && bad.response.status === 403, 'a bad signature -> 403');
  const none = await readVerified(signedReq(null), FIX.token);
  check(!none.ok && none.response.status === 403, 'no signature -> 403');
  const unconf = await readVerified(signedReq(FIX.sig), undefined);
  check(!unconf.ok && unconf.response.status === 503, 'no TWILIO_AUTH_TOKEN -> 503, fails closed');
}

/* ── 5. the menu ─────────────────────────────────────────────────────────── */
console.log('5. gather + code parsing');
const g1 = gatherTwiml(1);
check(/numDigits="3"/.test(g1) && !/finishOnKey/.test(g1), 'attempt 1 gathers exactly 3 digits, no finish key');
check(!/<Say/.test(g1), 'attempt 1 is SILENT — the phone is already sending the code');
check(/attempt=2/.test(g1), 'attempt 1 falls through to a prompted second try');
const g2 = gatherTwiml(2);
check(/<Say language="es-MX">/.test(g2) && g2.indexOf('es-MX') < g2.indexOf('en-US'), 'attempt 2 prompts in Spanish first');
check(/<Hangup\/>/.test(g2), 'attempt 2 ends the call when nothing arrives');
check(parseCode('114') === 114 && parseCode('099') === null && parseCode('11#') === null && parseCode('1144') === null && parseCode(null) === null, 'parseCode accepts only 3 real code digits');
check(codeSource(1, 114) === 'auto' && codeSource(2, 114) === 'typed' && codeSource(1, null) === 'none', 'codeSource: auto before any prompt, typed after');

/* ── 6. connecting ───────────────────────────────────────────────────────── */
console.log('6. dial + whisper');
const d = dialTwiml('+528999370188', '+19565551234', 114);
check(/<Number url="\/api\/voice\/whisper" method="POST">\+528999370188<\/Number>/.test(d), 'dials the clinic with the whisper on pickup');
check(/callerId="\+19565551234"/.test(d), "the clinic sees the patient's own number");
check(/action="\/api\/voice\/status\?code=114"/.test(d), 'the dial reports back to status with its code');
check(!/callerId=/.test(dialTwiml('+528999370188', 'anonymous', 114)), 'a blocked caller is left out rather than sent as garbage');
check(!/callerId=/.test(dialTwiml('+528999370188', '"/><Hangup/>', 114)), 'an injected caller never reaches the XML');
const w = whisperTwiml();
check(/<Say language="es-MX">/.test(w) && /Paciente/.test(w) && /ClearCross Progreso/.test(w), 'the whisper is Spanish and names ClearCross Progreso');
check(WHISPER_TEXT.length <= 40, 'the whisper is short enough not to sound like a robocall');
check(!/<Dial/.test(unknownCodeTwiml(1)) && !/<Dial/.test(unknownCodeTwiml(2)), 'an unknown code NEVER dials anything');
check(/<Hangup\/>/.test(unknownCodeTwiml(2)), 'a second unknown code ends the call');
check(xml(`<a href="x">&'`) === '&lt;a href=&quot;x&quot;&gt;&amp;&apos;', 'xml() escapes every special character');

console.log('7. after the dial');
check(statusTwiml('completed', '+528999370188') === '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', 'a completed call just ends');
for (const s of ['no-answer', 'busy', 'failed', 'canceled', null]) {
  const t = statusTwiml(s, '+528999370188');
  check(t.includes(spokenDigits('+528999370188')), `${s} -> the caller is read the clinic's direct number`);
}
check(!statusTwiml('no-answer', null).includes('undefined'), 'no clinic number -> says so without reading garbage');
check(spokenDigits('+528999370188') === '5 2 8, 9 9 9, 3 7 0, 1 8 8', `spokenDigits reads digit by digit (got ${spokenDigits('+528999370188')})`);

/* ── 8. source audits ────────────────────────────────────────────────────── */
console.log('8. no recording, anywhere');
const ROUTES = ['incoming', 'route', 'whisper', 'status'].map((r) => `app/api/voice/${r}/route.ts`);
for (const f of ['lib/twilio-voice.ts', ...ROUTES]) {
  check(!/<Record|record\s*[:=]|recordingStatusCallback/i.test(src(f)), `${f} records nothing`);
}

console.log('9. every webhook checks the signature before anything else');
for (const f of ROUTES) {
  const s = src(f);
  const verify = s.indexOf('await readVerified(req, process.env.TWILIO_AUTH_TOKEN)');
  const refuse = s.indexOf('if (!v.ok) return v.response;');
  const firstWork = Math.min(...['createAdminClient()', 'twimlResponse('].map((k) => (s.indexOf(k) === -1 ? Infinity : s.indexOf(k))));
  check(verify !== -1 && refuse > verify && refuse < firstWork, `${f}: verify -> refuse -> then work`);
}
{
  const s = src('app/api/voice/route/route.ts');
  const guard = s.indexOf('if (!clinic || code === null) return twimlResponse(unknownCodeTwiml(attempt));');
  check(guard !== -1 && guard < s.indexOf('dialTwiml('), 'route.ts refuses an unknown code before it can reach the dial');
}

console.log('10. the pages');
for (const f of ['app/[category]/[provider]/page.tsx', 'app/prices/[procedure]/page.tsx']) {
  const s = src(f);
  check(!/tel:\$\{/.test(s), `${f}: no hand-built tel: link left`);
  check(/callLink\(/.test(s) && /href=\{call\.href\}/.test(s), `${f}: Call buttons use callLink`);
}
{
  const s = src('app/[category]/[provider]/page.tsx');
  check((s.match(/href=\{call\.href\}/g) || []).length === 3, 'provider page: all three Call buttons use the one link');
  check(/\{call\.display\}/.test(s) && !/\{providerData\.phone\}\s*<\/a>/.test(s), 'provider page: the visible number is the dialled number');
}
{
  const s = src('lib/schema.ts');
  check(/if \(provider\.phone\) business\.telephone = provider\.phone;/.test(s), "JSON-LD telephone stays the clinic's real number");
  check(!/TWILIO|call_code|callLink/.test(s), 'the schema builder knows nothing about tracking');
}
{
  const s = src('lib/data.ts');
  check(/provider:provider_id\(id, slug, name, verified, phone, call_code,/.test(s), 'the price comparison embed selects call_code');
}
check(/pCallCode: 'code \{n\}'/.test(readFileSync('lib/i18n/dictionaries/en.ts', 'utf8')) && /pCallCode: 'código \{n\}'/.test(readFileSync('lib/i18n/dictionaries/es.ts', 'utf8')), 'the code label exists in both languages');

console.log('11. the migration never reuses a code');
{
  const m = readFileSync('supabase/migrations/006_call_tracking.sql', 'utf8').replace(/--[^\n]*/g, '');
  check(/MAXVALUE 999/.test(m) && /\bNO CYCLE\b/.test(m), 'the code sequence stops at 999 and never wraps');
  check(/WHERE call_code IS NULL/.test(m) && /AND call_code IS NULL/.test(m), 'assignment only ever touches rows with no code');
  check(/CHECK \(call_code IS NULL OR call_code BETWEEN 100 AND 999\)/.test(m) && /UNIQUE \(call_code\)/.test(m), 'codes are unique and in range at the database');
  check(/ENABLE ROW LEVEL SECURITY/.test(m) && /REVOKE ALL ON TABLE public\.clearcross_calls FROM anon, authenticated/.test(m), 'the call log is service-role only');
  check(!/recording/i.test(m), 'the call log has no recording column');
}

console.log(failures === 0 ? '\nPASS call-tracking' : `\n${failures} FAILURE(S) call-tracking`);
process.exit(failures === 0 ? 0 : 1);
