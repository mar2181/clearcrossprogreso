/**
 * The live CBP border wait — /safety.
 *
 * ⛔ WHAT THIS IS PROTECTING. This panel prints a number a reader uses to decide
 * whether to get in the car, and the feed it reads is mostly SILENCE: measured
 * 2026-09-07 across all 85 ports, 494 of 595 lane records carry some form of
 * "we do not know" — "Update Pending" (287), "N/A" (146), "Lanes Closed" (61) —
 * and EVERY ONE of them carries `delay_minutes: ""`.
 *
 * An empty string coerces to 0. So the naive read turns the MAJORITY state of
 * the feed into "no wait", including the lanes CBP is explicitly telling us are
 * closed. Nothing on the screen would look wrong. That is the failure this file
 * exists for, and it is why every rule below is EXECUTED against fixtures
 * rather than scanned for in a component.
 *
 * The second failure is quieter: the feed carries TWO ports named "Progreso",
 * and the other one is the DONNA bridge with different hours ("6 am-10 pm" vs
 * "24 hrs/day"). The site's own safety page carried a garbled version of
 * Donna's hours until 2026-09-07. A loose match here would rebuild that same
 * error out of the authoritative source.
 *
 * Run: node --import ./test/_ts-alias-hook-register.mjs test/border-wait.mjs
 */
import { readFileSync } from 'node:fs';
import {
  readProgreso,
  PROGRESO_PORT_NUMBER,
  PROGRESO_CROSSING_NAME,
} from '../lib/border-wait.ts';
import { stripComments } from './_strip-comments.mjs';

let failures = 0;
const check = (cond, label) => {
  if (cond) console.log('  ok   ' + label);
  else {
    console.log('  FAIL ' + label);
    failures++;
  }
};

/* ── fixtures: the REAL shape, taken verbatim from the live feed ──────────── */

const lane = (status, delay, lanesOpen = '', updateTime = '') => ({
  standard_lanes: {
    update_time: updateTime,
    operational_status: status,
    delay_minutes: delay,
    lanes_open: lanesOpen,
  },
});

const port = (over = {}) => ({
  port_number: PROGRESO_PORT_NUMBER,
  border: 'Mexican Border',
  port_name: 'Progreso',
  crossing_name: PROGRESO_CROSSING_NAME,
  hours: '24 hrs/day',
  date: '9/7/2026',
  time: '00:32:25',
  port_status: 'Open',
  passenger_vehicle_lanes: lane('no delay', '5', '1', 'At Midnight CDT'),
  pedestrian_lanes: lane('Lanes Closed', ''),
  construction_notice: 'The Pedestrian Ready lanes will be open daily from 12noon to 5pm.',
  ...over,
});

/** The OTHER Progreso — a different bridge, different hours. Verbatim shape. */
const DONNA = {
  port_number: '230902',
  border: 'Mexican Border',
  port_name: 'Progreso',
  crossing_name: 'Donna International Bridge',
  hours: '6 am-10 pm',
  date: '9/7/2026',
  time: '00:32:25',
  port_status: 'Closed',
  passenger_vehicle_lanes: lane('Update Pending', ''),
  pedestrian_lanes: lane('Update Pending', ''),
  construction_notice: '',
};

console.log('\n1. it reads the right bridge');

{
  // ⛔ CONTROL FIRST. A reader that returns null for everything would pass every
  // "it refuses X" check below while the panel is permanently dead.
  const r = readProgreso([DONNA, port()]);
  check(r !== null, 'control: a well-formed feed produces a reading at all');
  check(r?.hours === '24 hrs/day',
    'takes Progreso hours "24 hrs/day", not Donna\'s "6 am-10 pm" (' + r?.hours + ')');
  check(r?.portOpen === true, 'reads port_status Open');
  check(r?.notice?.includes('Ready lanes') === true, 'carries CBP construction notice');
}

{
  // Donna FIRST in the array — a `find` on the wrong field takes whichever
  // comes first, so ordering is the thing that exposes it.
  const r = readProgreso([DONNA]);
  check(r === null, 'a feed containing ONLY the Donna bridge yields nothing');
}

{
  // ⛔ The port number is right but CBP renamed the crossing. Refuse rather
  // than print another bridge's wait under Progreso's heading.
  const r = readProgreso([port({ crossing_name: 'Some Other Bridge' })]);
  check(r === null, 'refuses when the port number no longer names Progreso');
}

console.log('\n2. an absent number is never zero');

{
  const r = readProgreso([port()]);
  check(r?.pedestrian.kind === 'closed',
    'pedestrian "Lanes Closed" + empty delay reads CLOSED, not 0 min');
  check(!('minutes' in (r?.pedestrian ?? {})),
    'a closed lane carries no minutes field at all');
}

for (const status of ['Update Pending', 'N/A', '', 'Something New CBP Invents']) {
  const r = readProgreso([port({ pedestrian_lanes: lane(status, '') })]);
  check(r?.pedestrian.kind === 'unknown',
    `"${status || '(empty)'}" + empty delay reads UNKNOWN, not 0 min`);
}

{
  // The nastiest one: CBP says "delay" but sends no number.
  const r = readProgreso([port({ pedestrian_lanes: lane('delay', '') })]);
  check(r?.pedestrian.kind === 'unknown',
    'status "delay" with NO number reads unknown, not 0 min');
}

/*
 * ⛔ THE STATE THAT DISTINGUISHES THE TWO RULES, AND WHY IT IS HERE.
 *
 * Measured on the live feed 2026-09-07: a non-reporting status never carries a
 * number — all 494 of them send delay_minutes: "". So over real data the status
 * check and the "an empty delay is not zero" check catch exactly the same rows,
 * and the mutation harness scored a MISS on removing either one alone. They are
 * defence in depth, and neither is provable from a real sample.
 *
 * These fixtures are the state CBP COULD send and the one that would hurt: a
 * lane it has stopped reporting on, still carrying the last number it saw.
 * Without the status rule that renders as a live wait. With it, we say we do
 * not know — which is true.
 */
for (const status of ['Update Pending', 'N/A']) {
  const r = readProgreso([port({ pedestrian_lanes: lane(status, '20') })]);
  check(r?.pedestrian.kind === 'unknown',
    `"${status}" carrying a stale 20 still reads UNKNOWN, not a 20-minute wait`);
}

console.log('\n3. a real reading survives');

{
  const r = readProgreso([port()]);
  const v = r?.vehicle;
  check(v?.kind === 'reported', 'vehicle "no delay" + "5" is a reported reading');
  check(v?.kind === 'reported' && v.minutes === 5, 'reports 5 minutes');
  check(v?.kind === 'reported' && v.lanesOpen === 1, 'reports 1 lane open');
}

{
  // ⛔ A GENUINE ZERO MUST STILL REPORT. Refusing every zero to dodge the empty
  // string would throw away the most common good reading on the feed.
  const r = readProgreso([port({ pedestrian_lanes: lane('no delay', '0') })]);
  check(r?.pedestrian.kind === 'reported',
    'a genuine "0" is a reading, not a refusal');
  check(r?.pedestrian.kind === 'reported' && r.pedestrian.minutes === 0, 'reports 0 minutes');
}

console.log('\n4. the timestamp is CBP\'s, and it is mandatory');

{
  const r = readProgreso([port()]);
  check(r?.observedAt === '9/7/2026 00:32:25', 'observedAt is the feed\'s own date + time');
  check(readProgreso([port({ date: '' })]) === null, 'no date -> no reading');
  check(readProgreso([port({ time: '' })]) === null, 'no time -> no reading');
}

console.log('\n5. junk in never becomes a number out');

for (const junk of [null, undefined, 0, '', 'nope', [], {}, { ports: [] }, [{}], [{ port_number: 1 }]]) {
  let out, threw = false;
  try { out = readProgreso(junk); } catch { threw = true; }
  check(!threw && out === null, `${JSON.stringify(junk)} -> null, and does not throw`);
}

console.log('\n6. the route never dresses a failure as a reading');

{
  const route = stripComments(readFileSync('app/api/border-wait/route.ts', 'utf8'));
  check(/readProgreso/.test(route), 'the route reads through lib/border-wait');
  check(/if\s*\(!reading\)/.test(route),
    'an unreadable feed is refused rather than returned as an empty shape');
  // Every failure path must be ok:false AND uncached; a cached failure outlives
  // the outage that caused it.
  const failures_ = route.match(/ok:\s*false/g) ?? [];
  check(failures_.length >= 3, `every failure path returns ok:false (${failures_.length} found)`);
  const noStore = route.match(/no-store/g) ?? [];
  check(noStore.length === failures_.length,
    `each failure is uncached (${noStore.length} no-store vs ${failures_.length} failures)`);
  check(/AbortSignal\.timeout/.test(route), 'the upstream fetch is bounded');
  check(/next:\s*\{\s*revalidate/.test(route),
    'the UPSTREAM FETCH is what is cached, so one call serves every visitor');
}

console.log('\n7. the panel cannot render a stale or unsourced number');

{
  const ui = stripComments(readFileSync('components/safety/BorderWait.tsx', 'utf8'));

  // ⛔ There must be no "last known" path. A wait time with no way to tell how
  // old it is, is worse than none.
  check(!/localStorage|sessionStorage/.test(ui),
    'no client-side cache — there is no stale reading to fall back to');
  check(/phase:\s*'failed'/.test(ui), 'a failed call has its own visible state');
  check(/waitUnavailable/.test(ui), 'the failed state renders copy saying so');

  // The number and its provenance ship together.
  check(/waitObserved/.test(ui) && /observedAt/.test(ui),
    'a rendered reading carries CBP\'s own timestamp');
  check(/waitSource/.test(ui), 'a rendered reading names CBP as the source');

  /*
   * ⛔ THE BRANCH IS LIFTED OUT OF THE SHIPPED COMPONENT AND EXECUTED.
   *
   * The first version of this check asserted that the string `kind === 'unknown'`
   * appears in the file. The mutation harness walked straight past it: keep the
   * string, change what it RETURNS, and "CBP is not reporting" renders as "no
   * delay" — the exact lie this whole module exists to prevent, with a green
   * line printed over it. A source scan cannot tell a mapping from a mention.
   */
  const body = ui.match(/const laneText = \(lane: LaneReading\): string => \{([\s\S]*?)\n  \};/);
  check(!!body, 'control: laneText was found in the shipped component');
  if (body) {
    const laneText = new Function('lane', 'd', body[1]);
    const D = {
      waitClosed: 'CLOSED', waitUnknown: 'UNKNOWN',
      waitNoDelay: 'NODELAY', waitMinutes: 'MIN',
    };
    const out = {
      closed: laneText({ kind: 'closed' }, D),
      unknown: laneText({ kind: 'unknown', status: 'N/A' }, D),
      zero: laneText({ kind: 'reported', minutes: 0 }, D),
      seven: laneText({ kind: 'reported', minutes: 7 }, D),
    };
    check(out.closed === 'CLOSED', 'a closed lane renders the CLOSED copy');
    check(out.unknown === 'UNKNOWN',
      'an unreported lane renders the UNKNOWN copy, not "no delay" (' + out.unknown + ')');
    check(out.zero === 'NODELAY', 'a genuine zero renders "no delay"');
    check(out.seven === '7 MIN', 'a real wait renders its number');
    check(new Set(Object.values(out)).size === 4,
      'all four states render differently — none is collapsed into another');
  }

  /*
   * ⛔ THE CHAIN, NOT THE PRESENCE. On 2026-09-07 the client body moved into
   * SafetyClient.tsx so the route could own its metadata, and this check went
   * red — correctly. Repointing it at the new file would have been the weaker
   * repair: it proves the panel exists somewhere, not that the ROUTE reaches
   * it. A panel mounted in an orphaned component passes that forever while the
   * page renders nothing.
   */
  const client = stripComments(readFileSync('app/safety/SafetyClient.tsx', 'utf8'));
  check(/<BorderWait\s*\/>/.test(client), 'SafetyClient mounts the panel');
  for (const route of ['app/safety/page.tsx', 'app/es/safety/page.tsx']) {
    const src = stripComments(readFileSync(route, 'utf8'));
    check(/<SafetyClient\s*\/>/.test(src), route + ' :: renders SafetyClient');
  }
}

console.log('\n8. the new copy exists in both languages');

{
  const KEYS = [
    'waitTitle', 'waitLoading', 'waitUnavailable', 'waitPedestrian', 'waitVehicle',
    'waitNoDelay', 'waitMinutes', 'waitClosed', 'waitUnknown', 'waitObserved',
    'waitSource', 'waitHours',
  ];
  const grab = (file) => {
    const src = readFileSync(file, 'utf8');
    const out = {};
    for (const k of KEYS) {
      const m = src.match(new RegExp('^\\s*' + k + ": '([^']*)',", 'm'));
      if (m) out[k] = m[1];
    }
    return out;
  };
  const en = grab('lib/i18n/dictionaries/en.ts');
  const es = grab('lib/i18n/dictionaries/es.ts');

  const missingEn = KEYS.filter((k) => !en[k]);
  const missingEs = KEYS.filter((k) => !es[k]);
  check(missingEn.length === 0, 'every key is in en.ts' + (missingEn.length ? ' — missing ' + missingEn : ''));
  check(missingEs.length === 0, 'every key is in es.ts' + (missingEs.length ? ' — missing ' + missingEs : ''));
  const same = KEYS.filter((k) => en[k] && en[k] === es[k]);
  check(same.length === 0, 'the Spanish is Spanish' + (same.length ? ' — identical: ' + same : ''));
}

console.log('\n9. the logistics facts match what the sources actually say');

{
  /*
   * ⛔ THESE ARE FACTS A READER CAN CHECK WHILE STANDING AT THE BRIDGE, which
   * is the whole reason this page can win its SERP and the whole reason a wrong
   * number here is worse than no page. All four were wrong until 2026-09-07:
   *
   *   "Bridge toll is $0.50"        — every source says ~$1.00 to walk IN; the
   *                                   turnstile takes four quarters. A reader
   *                                   with two quarters could not cross.
   *   "open 6:00 AM to midnight"    — CBP says "24 hrs/day". The 6am figure is
   *                                   the DONNA bridge's.
   *   parking "$3-5/day"            — observed $2 to $4, and it varies by lot.
   *   waits "typically 5-15 minutes"— an average we cannot stand behind, now
   *                                   replaced by the live CBP figure.
   */
  for (const [file, label] of [['lib/i18n/dictionaries/en.ts', 'en'], ['lib/i18n/dictionaries/es.ts', 'es']]) {
    const src = readFileSync(file, 'utf8');
    check(!/Bridge toll is \$0\.50|peaje del puente es \$0\.50/.test(src),
      `${label}: the flat "$0.50 toll" is gone`);
    check(!/6:00 AM to midnight|6:00 AM a medianoche/.test(src),
      `${label}: the Donna-bridge hours are gone`);
    check(/24 hours a day|24 horas/.test(src), `${label}: says CBP's 24 hrs/day`);
    check(/\$1 per person|\$1 por persona/.test(src), `${label}: states the real walk-in toll`);
  }
}


console.log('\n10. /safety owns its own title in both languages');

{
  /*
   * ⛔ WHY THIS IS HERE AND NOT IN A PHASE-4 FILE OF ITS OWN. The page is only
   * worth a title because of what is now on it. Until 2026-09-07 it inherited
   * the ROOT LAYOUT's "Best Dentists & Medical Services in Nuevo Progreso
   * Mexico | ClearCross" — a directory title, shared verbatim with nine other
   * URLs, on the page about parking and bridge tolls. The logistics queries are
   * the one field around Nuevo Progreso that no aggregator holds; this is the
   * page that answers them, and it was invisible to that query by its title.
   */
  const ROOT_TITLE = 'Best Dentists & Medical Services in Nuevo Progreso Mexico';
  const titleOf = (f) => {
    const m = readFileSync(f, 'utf8').match(/^\s*title: '([^']*)',/m);
    return m ? m[1] : null;
  };
  const en = titleOf('app/safety/page.tsx');
  const es = titleOf('app/es/safety/page.tsx');

  check(!!en, 'control: /safety declares a title at all');
  check(!!es, 'control: /es/safety declares a title at all');
  check(en !== ROOT_TITLE + ' | ClearCross', '/safety does not reuse the root layout title');
  check(es !== ROOT_TITLE + ' | ClearCross', '/es/safety does not reuse the root layout title');
  check(en !== es, 'the Spanish title is not the English one');

  // ⛔ A server component or it cannot export metadata at all — which is the
  // entire reason the split exists.
  for (const f of ['app/safety/page.tsx', 'app/es/safety/page.tsx']) {
    const raw = readFileSync(f, 'utf8');
    check(!/^'use client'/m.test(raw), f + ' :: is a server component');
    check(/export const metadata/.test(raw), f + ' :: exports metadata');
  }

  // ⛔ The Spanish route must not go back to inheriting the English metadata.
  // COMMENTS STRIPPED FIRST. The first version of this check read the raw file
  // and fired on the page own comment, which QUOTES the banned re-export line
  // in order to explain why it is gone. A guard that accuses its own
  // explanation gets fixed by deleting the explanation.
  const esRaw = stripComments(readFileSync('app/es/safety/page.tsx', 'utf8'));
  check(!/export \{ default \} from '@\/app\/safety\/page'/.test(esRaw),
    '/es/safety does not blind-re-export the English route');
  check(/estacionar|peaje|espera/i.test(es ?? ''), 'the Spanish title is actually Spanish');
}
console.log(failures === 0
  ? `\nPASS — the panel tells the truth or says nothing.`
  : `\nFAILED — ${failures} check(s).`);
process.exit(failures === 0 ? 0 : 1);
