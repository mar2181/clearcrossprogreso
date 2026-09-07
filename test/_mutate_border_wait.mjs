/**
 * Mutation harness for test/border-wait.mjs.
 *
 * ⛔ WHY. The guard passed on its first run, and in this repo that is the shape
 * that hides a vacuous check — "a string that exists somewhere is not a check"
 * is written into three separate files here after three separate incidents. A
 * guard is only worth its green line if something can make it red.
 *
 * Each mutation below is a plausible edit somebody would actually make, and
 * every one of them ships a lie about a border crossing.
 *
 * ⛔ Discipline: the baseline is proven GREEN first (a guard that is red for an
 * unrelated reason scores every mutation as "caught" for free), each anchor
 * must match EXACTLY ONCE, and the tree is restored from bytes captured before
 * the run — not by re-searching for anchors, which cannot tell a failed restore
 * from an anchor that legitimately moved.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LIB = 'lib/border-wait.ts';
const ROUTE = 'app/api/border-wait/route.ts';
const UI = 'components/safety/BorderWait.tsx';
const EN = 'lib/i18n/dictionaries/en.ts';
const ES = 'lib/i18n/dictionaries/es.ts';

const MUTATIONS = [
  {
    name: 'selects the port by NAME substring (matches Donna too)',
    file: LIB,
    from: `    (p) => p && typeof p === 'object' && str((p as RawPort).port_number) === PROGRESO_PORT_NUMBER,`,
    to: `    (p) => p && typeof p === 'object' && str((p as RawPort).port_name).includes('Progreso'),`,
  },
  {
    name: 'an empty delay coerces to 0 instead of null',
    file: LIB,
    from: `  if (s === '') return null;`,
    to: `  if (s === '') return 0;`,
  },
  {
    name: 'every status is treated as a reading',
    file: LIB,
    from: `  if (!REPORTING_STATUSES.has(status)) return { kind: 'unknown', status: status || 'no status' };`,
    to: `  if (false) return { kind: 'unknown', status: status || 'no status' };`,
  },
  {
    name: 'closed lanes collapse into "unknown"',
    file: LIB,
    from: `  if (status === 'Lanes Closed') return { kind: 'closed' };`,
    to: `  if (false) return { kind: 'closed' };`,
  },
  {
    name: 'a renamed crossing is accepted at the same port number',
    file: LIB,
    from: `  if (str(port.crossing_name) !== PROGRESO_CROSSING_NAME) return null;`,
    to: `  if (false) return null;`,
  },
  {
    name: 'a reading with no CBP timestamp is served anyway',
    file: LIB,
    from: `  if (!date || !time) return null;`,
    to: `  if (false) return null;`,
  },
  {
    name: 'a status of "delay" with no number reports zero',
    file: LIB,
    from: `  if (minutes === null) return { kind: 'unknown', status };`,
    to: `  if (false) return { kind: 'unknown', status };`,
  },
  {
    name: 'the route returns an unreadable feed as a reading',
    file: ROUTE,
    from: `  if (!reading) {`,
    to: `  if (false) {`,
  },
  {
    name: 'the route caches its failures',
    file: ROUTE,
    from: `        { status: 200, headers: { 'cache-control': 'no-store' } },
      );
    }
    payload = await res.json();`,
    to: `        { status: 200 },
      );
    }
    payload = await res.json();`,
  },
  {
    name: 'the panel falls back to a stale cached reading',
    file: UI,
    from: `        setState(j?.ok && j.reading ? { phase: 'ok', reading: j.reading } : { phase: 'failed' });`,
    to: `        const last = localStorage.getItem('bw');
        setState(j?.ok && j.reading ? { phase: 'ok', reading: j.reading } : last ? { phase: 'ok', reading: JSON.parse(last) } : { phase: 'failed' });`,
  },
  {
    name: 'the panel collapses "CBP is not reporting" into "no delay"',
    file: UI,
    from: `    if (lane.kind === 'unknown') return d.waitUnknown;`,
    to: `    if (lane.kind === 'unknown') return d.waitNoDelay;`,
  },
  {
    name: 'the flat $0.50 toll comes back',
    file: EN,
    from: `walking into Mexico is about $1 per person`,
    to: `Bridge toll is $0.50 and walking into Mexico is about one dollar per person`,
  },
  {
    name: 'the Donna-bridge hours come back',
    file: ES,
    from: `abierto las 24 horas`,
    to: `abierto de 6:00 AM a medianoche y las 24 horas`,
  },
  {
    name: 'the Spanish copy is left as English',
    file: ES,
    from: `    waitPedestrian: 'A pie',`,
    to: `    waitPedestrian: 'On foot',`,
  },
  {
    name: 'the Spanish route goes back to inheriting English metadata',
    file: 'app/es/safety/page.tsx',
    from: `export default function SafetyPageEs() {
  return <SafetyClient />;
}`,
    to: `export { default } from '@/app/safety/page';`,
  },
  {
    name: '/safety goes back to the root layout title',
    file: 'app/safety/page.tsx',
    from: `  title: 'Crossing to Nuevo Progreso: Toll, Parking & Live Border Wait | ClearCross',`,
    to: `  title: 'Best Dentists & Medical Services in Nuevo Progreso Mexico | ClearCross',`,
  },
  {
    name: 'the route stops rendering the client body (panel orphaned)',
    file: 'app/safety/page.tsx',
    from: `  return <SafetyClient />;`,
    to: `  return null;`,
  },
];

const files = [...new Set(MUTATIONS.map((m) => m.file))];
const before = Object.fromEntries(files.map((f) => [f, readFileSync(f, 'utf8')]));

const runGuard = () => {
  try {
    execFileSync(
      process.execPath,
      ['--import', './test/_ts-alias-hook-register.mjs', 'test/border-wait.mjs'],
      { stdio: 'pipe' },
    );
    return true; // green
  } catch {
    return false; // red
  }
};

console.log('baseline:');
if (!runGuard()) {
  console.log('  ⛔ THE GUARD IS ALREADY RED. Every mutation would score "caught" for');
  console.log('     free and prove nothing. Fix the tree first.');
  process.exit(1);
}
console.log('  ok   green before any mutation\n');

let caught = 0, missed = 0, skipped = 0;

for (const m of MUTATIONS) {
  const src = before[m.file];
  const eol = (src.match(/\r\n/g) || []).length > 0 ? '\r\n' : '\n';
  const from = m.from.split('\n').join(eol);
  const n = src.split(from).length - 1;

  if (n !== 1) {
    // ⛔ Reported, never scored. A mutation that was not applied proves nothing,
    // and counting it as a catch is how a harness credits itself with work it
    // never did.
    console.log(`  SKIP ${m.name}`);
    console.log(`       anchor matched ${n} times — mutation NOT applied, proves nothing`);
    skipped++;
    continue;
  }

  writeFileSync(m.file, src.replace(from, m.to.split('\n').join(eol)), 'utf8');
  const green = runGuard();
  writeFileSync(m.file, src, 'utf8');

  if (green) { console.log(`  MISS ${m.name}`); missed++; }
  else { console.log(`  ok   caught: ${m.name}`); caught++; }
}

// ⛔ Restore verified from the bytes captured before the run.
let dirty = 0;
for (const f of files) {
  if (readFileSync(f, 'utf8') !== before[f]) { console.log(`  ⛔ NOT RESTORED: ${f}`); dirty++; }
}

console.log(`\n${caught} caught / ${missed} missed / ${skipped} skipped`);
console.log(dirty === 0 ? 'tree restored byte-identical' : `⛔ ${dirty} FILE(S) LEFT MUTATED`);
if (!runGuard()) { console.log('⛔ the guard is red on the restored tree'); process.exit(1); }
console.log('guard green on the restored tree');
process.exit(missed === 0 && skipped === 0 && dirty === 0 ? 0 : 1);
