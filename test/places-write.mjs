/**
 * Guards the UPDATE that Google Places verification writes.
 *
 * ⛔ WHY THIS GUARD EXISTS. test/places-match.mjs guards WHICH provider a
 * Places result is allowed to touch. Nothing guarded WHAT it then writes -- and
 * the write path lands third-party data on rows curated by hand from the
 * clinics' own material. Of the three columns below, one rule was correct, one
 * was documented in a comment and not implemented, and one did not exist:
 *
 *   phone   -- coalesce, correct
 *   hours   -- BARE ASSIGNMENT. Places returns no opening hours for plenty of
 *              these businesses, in which case the statement read
 *              hours = null::jsonb and ERASED ours. 53 of 78 visible providers
 *              hold hours. A re-run would have deleted an unknown number of
 *              them, silently, on a directory whose job is opening times.
 *   website -- never written at all; the field was never even requested, which
 *              is why 52 of 78 visible providers hold no website and therefore
 *              no route to a price list.
 *
 * ⛔ These are asserted by DRIVING the real builder, not by scanning it for the
 * word "coalesce". A statement can contain that word and still overwrite the
 * column beside it.
 *
 * ⛔ This file is written with an editor, never a shell heredoc. The first
 * draft was written through one and every double backslash collapsed, so
 * '\\s*=' became '\s*=' -- which JavaScript reads as the literal "s*=" -- and
 * the helper below matched nothing while reporting the CODE as broken. It named
 * a real defect for the wrong reason, which is worse than staying quiet.
 */
import assert from 'node:assert';
import {
  buildProviderUpdate, placePhone, placeWebsite,
} from '../tools/verify/places-write.mjs';

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + e.message); }
};

// A place carrying every field, and one carrying none of them. Both shapes come
// back from the live API; the empty one is what exposed the hours defect.
const FULL = {
  id: 'ChIJfull',
  displayName: { text: 'Dental Artistry' },
  businessStatus: 'OPERATIONAL',
  internationalPhoneNumber: '+52 899 934 1234',
  websiteUri: 'https://dentalartistry.mx/precios',
  regularOpeningHours: { weekdayDescriptions: ['Monday: 9-6'] },
  location: { latitude: 26.09, longitude: -97.95 },
  rating: 4.8,
  userRatingCount: 120,
};
const EMPTY = {
  id: 'ChIJempty',
  displayName: { text: 'Quiet Clinic' },
  businessStatus: 'OPERATIONAL',
};

/**
 * The assignment made to one column, as written in the generated statement.
 *
 * ⛔ Comment lines are stripped FIRST. The statement deliberately quotes the
 * defect it fixes ("this read: hours = VALUE::jsonb"), so a scan that did not
 * strip comments would read the explanation as the code -- and the tempting fix
 * for that is to delete the explanation.
 */
function assignment(sql, column) {
  const lines = sql
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !l.startsWith('--'));
  const hit = lines.filter((l) => new RegExp('^' + column + '\\s*=').test(l));
  assert.strictEqual(
    hit.length, 1,
    column + ' is assigned ' + hit.length + ' times, expected exactly 1',
  );
  return hit[0].replace(/,$/, '');
}

// ⛔ A control. If the helper cannot find an assignment it KNOWS is there, every
// check built on it passes or fails for reasons that have nothing to do with the
// code -- which is exactly what happened to the first draft of this file.
check('the helper can find an assignment that is definitely present', () => {
  const a = assignment(buildProviderUpdate(FULL, 'p1'), 'verified');
  assert.strictEqual(a, 'verified = true');
  assert.throws(() => assignment(buildProviderUpdate(FULL, 'p1'), 'no_such_column_zzz'));
});

// ------------------------------------------ 1. fill a blank, never overwrite
for (const column of ['phone', 'website', 'hours']) {
  check('a populated ' + column + ' cannot be overwritten', () => {
    const a = assignment(buildProviderUpdate(FULL, 'p1'), column);
    const rhs = a.slice(a.indexOf('=') + 1);
    assert.ok(
      new RegExp('coalesce\\s*\\(\\s*(nullif\\s*\\(\\s*)?' + column + '\\b').test(rhs),
      column + ' assignment does not read the old row first: ' + a,
    );
  });

  // ⛔ The case the live defect was in. When Places is SILENT about a field the
  // generated value is the literal null, so a bare assignment blanks the column.
  check('an absent ' + column + ' from Places cannot blank ours', () => {
    const a = assignment(buildProviderUpdate(EMPTY, 'p1'), column);
    const rhs = a.slice(a.indexOf('=') + 1);
    assert.ok(
      new RegExp('\\b' + column + '\\b').test(rhs),
      column + ' would be set without reading the old row: ' + a,
    );
    assert.ok(
      !/^\s*null(::\w+)?\s*$/.test(rhs),
      column + ' is assigned a bare null and would ERASE a curated value: ' + a,
    );
  });
}

// -------------------------------------------- 1b. the contact gate reaches here
/**
 * ⛔ THE HARNESS FOUND THIS HOLE. contactWritable can refuse a match perfectly
 * and the builder can write the number anyway -- a report that says "refused"
 * over a statement that writes is the worst of both, because it LOOKS checked.
 * Nothing drove the builder with the gate closed until this existed.
 */
check("a refused contact write suppresses phone and website", () => {
  const sql = buildProviderUpdate(FULL, "p1", { contact: false });
  assert.ok(!sql.includes("+52 899 934 1234"), "the phone was written despite the gate: " + sql);
  assert.ok(!sql.includes("dentalartistry.mx"), "the website was written despite the gate");
});

check("a refused contact write still verifies and still stores hours", () => {
  // Refusing a contact detail must not cost the provider its listing.
  const sql = buildProviderUpdate(FULL, "p1", { contact: false });
  assert.ok(/verified = true/.test(sql), "the provider lost its listing");
  assert.ok(sql.includes("Monday: 9-6"), "hours were suppressed too");
  assert.ok(sql.includes("google_rating"), "Google columns were suppressed too");
});

check("the gate defaults to OPEN only when not specified", () => {
  assert.ok(buildProviderUpdate(FULL, "p1").includes("+52 899 934 1234"));
  assert.ok(buildProviderUpdate(FULL, "p1", {}).includes("+52 899 934 1234"));
  assert.ok(!buildProviderUpdate(FULL, "p1", { contact: false }).includes("+52 899 934 1234"));
});

// --------------------------------------------------------- 2. the website field
check('the website is actually stored', () => {
  const sql = buildProviderUpdate(FULL, 'p1');
  assert.ok(/website\s*=/.test(sql), 'the UPDATE never writes website');
  assert.ok(sql.includes('dentalartistry.mx'), 'the website value is not in the statement');
});

check('an aggregator or social URL is not stored as the clinic website', () => {
  // ⛔ Storing one of these points a visitor at a competitor, or back at us.
  for (const u of [
    'https://www.facebook.com/dentalartistry',
    'https://www.whatclinic.com/dentists/mexico/dental-artistry',
    'https://clearcrossprogreso.com/dentists/dental-artistry',
    'https://instagram.com/dentalartistry',
    'https://wa.me/528999341234',
  ]) {
    assert.strictEqual(placeWebsite({ websiteUri: u }), null, u + ' should be refused');
  }
});

check('a real clinic site is kept, including on an unfamiliar TLD', () => {
  for (const u of [
    'https://dentalartistry.mx/',
    'http://clinicasonrisa.com.mx/precios',
    'https://sonrisa.dental',
  ]) {
    assert.strictEqual(placeWebsite({ websiteUri: u }), u, u + ' should be kept');
  }
});

check('a malformed website is dropped rather than stored or thrown', () => {
  for (const u of ['', '   ', 'not a url', 'javascript:alert(1)']) {
    assert.doesNotThrow(() => placeWebsite({ websiteUri: u }));
    const got = String(placeWebsite({ websiteUri: u }) || '');
    assert.ok(!/^https?:/i.test(got), JSON.stringify(u) + ' produced a stored URL');
  }
  assert.strictEqual(placeWebsite({}), null);
});

// --------------------------------------------------------------- 3. the phone
check('the international number wins, because the audience dials across a border', () => {
  assert.strictEqual(
    placePhone({ internationalPhoneNumber: '+52 899 934 1234', nationalPhoneNumber: '899 934 1234' }),
    '+52 899 934 1234',
  );
  assert.strictEqual(placePhone({ nationalPhoneNumber: '899 934 1234' }), '899 934 1234');
  assert.strictEqual(placePhone({}), null);
});

// ------------------------------------------------------------ 4. safety rails
check('the statement is scoped to exactly one provider id', () => {
  const sql = buildProviderUpdate(FULL, "p'1");
  const code = sql
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !l.startsWith('--'))
    .join('\n');
  assert.ok(/where id = 'p''1'\s*$/.test(code.trim()), 'id is not quoted/scoped: ' + code.slice(-80));
  assert.strictEqual(code.split(/\bwhere\b/).length - 1, 1, 'more than one where clause');
});

check("Google's rating never reaches the columns the page renders", () => {
  const sql = buildProviderUpdate(FULL, 'p1');
  for (const col of ['avg_rating', 'review_count']) {
    assert.ok(
      !new RegExp('(^|[^_])\\b' + col + '\\s*=').test(sql),
      col + ' is written from Places -- it would render as an unattributed star row',
    );
  }
  assert.ok(/google_rating\s*=/.test(sql) && /google_review_count\s*=/.test(sql));
});

check('a quote in a place value cannot break out of the statement', () => {
  const sql = buildProviderUpdate({ ...FULL, id: "Ch'IJ", businessStatus: "OPE'RATIONAL" }, 'p1');
  assert.ok(sql.includes("'Ch''IJ'") && sql.includes("'OPE''RATIONAL'"), 'a quote was not escaped');
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
