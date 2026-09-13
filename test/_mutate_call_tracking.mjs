/**
 * Mutation harness for test/call-tracking.mjs.
 *
 * Each mutation is an edit somebody could plausibly make, and every one of them
 * either connects a patient to the wrong place, drops the whisper, or lets an
 * unsigned request write into the call log we show clinics as proof.
 *
 * ⛔ Same discipline as the other harnesses here: baseline proven GREEN first,
 * every anchor must match EXACTLY ONCE (an unapplied mutation is reported, never
 * scored), and the tree is restored from bytes captured before the run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LINK = 'lib/call-link.ts';
const TW = 'lib/twilio-voice.ts';
const PAGE = 'app/[category]/[provider]/page.tsx';

const MUTATIONS = [
  {
    name: "the code goes after a '#'",
    file: LINK,
    from: '      href: `tel:${ours},,${target.call_code}`,',
    to: '      href: `tel:${ours}#${target.call_code}`,',
  },
  {
    name: 'any truthy CALL_TRACKING switches it on',
    file: LINK,
    from: "  if (env.CALL_TRACKING !== 'on') return null;",
    to: '  if (!env.CALL_TRACKING) return null;',
  },
  {
    name: 'an out-of-range code is dialled',
    file: LINK,
    from: '  if (ours && isValidCode(target.call_code)) {',
    to: '  if (ours && target.call_code) {',
  },
  {
    name: 'the tracked display shows the clinic number',
    file: LINK,
    from: '      display: formatNational(ours),',
    to: '      display: String(raw).trim(),',
  },
  {
    name: 'the signature comparison always passes',
    file: TW,
    from: `  if (want.length !== got.length) return false;
  return timingSafeEqual(want, got);`,
    to: `  return true;`,
  },
  {
    name: 'a missing auth token is waved through',
    file: TW,
    from: '  if (!authToken || !header) return false;',
    to: '  if (!header) return false;',
  },
  {
    name: 'readVerified skips the check when unconfigured',
    file: TW,
    from: `    return { ok: false, response: new Response('call tracking is not configured', { status: 503 }) };`,
    to: `    return { ok: true, params: {}, url: new URL(req.url) };`,
  },
  {
    name: 'the whisper is dropped from the dial',
    file: TW,
    from: '      `<Number url="/api/voice/whisper" method="POST">${xml(clinicE164)}</Number>` +',
    to: '      `<Number>${xml(clinicE164)}</Number>` +',
  },
  {
    name: 'the whisper is spoken in English',
    file: TW,
    from: `  return wrap(\`<Say language="es-MX">\${xml(WHISPER_TEXT)}</Say>\`);`,
    to: `  return wrap(\`<Say language="en-US">\${xml(WHISPER_TEXT)}</Say>\`);`,
  },
  {
    name: 'the first gather talks over the auto-sent tones',
    file: TW,
    from: '      `<Gather input="dtmf" numDigits="3" timeout="6" action="/api/voice/route?attempt=1" method="POST"></Gather>` +',
    to: '      `<Gather input="dtmf" numDigits="3" timeout="6" action="/api/voice/route?attempt=1" method="POST"><Say language="es-MX">Marque el código.</Say></Gather>` +',
  },
  {
    name: "the clinic stops seeing the patient's number",
    file: TW,
    from: "  const callerAttr = callerId ? ` callerId=\"${xml(callerId)}\"` : '';",
    to: "  const callerAttr = '';",
  },
  {
    name: 'a no-answer ends silently',
    file: TW,
    from: "  if (dialStatus === 'completed') return wrap(`<Hangup/>`);",
    to: '  return wrap(`<Hangup/>`);',
  },
  {
    name: 'xml() stops escaping <',
    file: TW,
    from: `    .replace(/</g, '&lt;')`,
    to: `    .replace(/</g, '<')`,
  },
  {
    name: 'a status webhook runs without refusing a bad signature',
    file: 'app/api/voice/status/route.ts',
    from: `  if (!v.ok) return v.response;

  const dialStatus`,
    to: `
  const dialStatus`,
  },
  {
    name: 'an unknown code falls through to the dial',
    file: 'app/api/voice/route/route.ts',
    from: '  if (!clinic || code === null) return twimlResponse(unknownCodeTwiml(attempt));',
    to: '  if (false) return twimlResponse(unknownCodeTwiml(attempt));',
  },
  {
    name: 'the JSON-LD telephone becomes the tracked number',
    file: 'lib/schema.ts',
    from: '  if (provider.phone) business.telephone = provider.phone;',
    to: '  if (provider.phone) business.telephone = process.env.TWILIO_NUMBER ?? provider.phone;',
  },
  {
    name: 'the sticky bar goes back to a direct tel: link',
    file: PAGE,
    from: `              href={call.href}
              className="flex items-center gap-1.5 px-4 py-3`,
    to: `              href={\`tel:\${providerData.phone}\`}
              className="flex items-center gap-1.5 px-4 py-3`,
  },
  {
    name: 'the price embed stops selecting call_code',
    file: 'lib/data.ts',
    from: 'provider:provider_id(id, slug, name, verified, phone, call_code, whatsapp, avg_rating, review_count)',
    to: 'provider:provider_id(id, slug, name, verified, phone, whatsapp, avg_rating, review_count)',
  },
  {
    name: 'the code sequence wraps back to 100',
    file: 'supabase/migrations/006_call_tracking.sql',
    from: '  NO CYCLE;',
    to: '  CYCLE;',
  },
  {
    name: 'assignment renumbers clinics that already have a code',
    file: 'supabase/migrations/006_call_tracking.sql',
    from: '     WHERE id = r.id AND call_code IS NULL;',
    to: '     WHERE id = r.id;',
  },
];

const files = [...new Set(MUTATIONS.map((m) => m.file))];
const before = Object.fromEntries(files.map((f) => [f, readFileSync(f, 'utf8')]));

const runGuard = () => {
  try {
    execFileSync(process.execPath, ['--import', './test/_ts-alias-hook-register.mjs', 'test/call-tracking.mjs'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

console.log('baseline:');
if (!runGuard()) {
  console.log('  ⛔ THE GUARD IS ALREADY RED. Every mutation would score "caught" for free. Fix the tree first.');
  process.exit(1);
}
console.log('  ok   green before any mutation\n');

let caught = 0, missed = 0, skipped = 0;
for (const m of MUTATIONS) {
  const s = before[m.file];
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  const from = m.from.split('\n').join(eol);
  const n = s.split(from).length - 1;
  if (n !== 1) {
    console.log(`  SKIP ${m.name}\n       anchor matched ${n} times — mutation NOT applied, proves nothing`);
    skipped++;
    continue;
  }
  try {
    writeFileSync(m.file, s.replace(from, () => m.to.split('\n').join(eol)), 'utf8');
    if (runGuard()) { console.log(`  MISS ${m.name}`); missed++; }
    else { console.log(`  ok   caught: ${m.name}`); caught++; }
  } finally {
    writeFileSync(m.file, s, 'utf8');
  }
}

let dirty = 0;
for (const f of files) if (readFileSync(f, 'utf8') !== before[f]) { console.log(`  ⛔ NOT RESTORED: ${f}`); dirty++; }
console.log(`\n${caught} caught / ${missed} missed / ${skipped} skipped`);
console.log(dirty === 0 ? 'tree restored byte-identical' : `⛔ ${dirty} FILE(S) LEFT MUTATED`);
if (!runGuard()) { console.log('⛔ the guard is red on the restored tree'); process.exit(1); }
console.log('guard green on the restored tree');
process.exit(missed === 0 && skipped === 0 && dirty === 0 ? 0 : 1);
