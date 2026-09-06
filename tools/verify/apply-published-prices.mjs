/**
 * Publish prices a clinic states on its own website.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 * ⛔ THE DECISIONS LIVE IN THIS FILE, NOT IN A SCRAPER. Every row below was read
 * off the clinic's own page by a person, checked against a second page on the
 * same site, and mapped to one of our procedures by name. That is deliberate:
 * tools/verify/price-harvest.mjs measured 19 provider websites and showed why no
 * scraper may write here unattended.
 *
 *   19 sites read, 16 answered, 7 carried a $ amount -- and reading the words
 *   around them, only ONE was a real price list:
 *
 *     Aury Dental Clinic   an unfinished template still carrying the theme's demo
 *                          content -- "Flight London to Bratislava - $55", "4 to 5
 *                          nights in Hungary", "innovate open-source
 *                          infrastructures via inexpensive materials"
 *     ALMITAS SPA          Fresha's OWN SaaS pricing ($19.95/month per team
 *     Erika's Salon Spa    member, 2.79% + $0.20 per transaction, card terminals
 *                          from $139) -- the booking host's footer, not the salon
 *     Similares            "$ 0.00" -- an empty shopping cart
 *     Dr. De Leon Cantu    a bundled consultation package, not a listed procedure
 *
 * Three of seven would have published another company's subscription fees or a
 * Hungarian dental-tourism demo as Nuevo Progreso medical prices. None of that is
 * detectable from the number; only the surrounding words give it away.
 *
 * ⛔ AND THE FLATTENED TEXT COULD NOT SAFELY BE READ EVEN ON THE GOOD SITE. The
 * homepage renders as "...Empezando desde $3,000 USD Tummy Tuck Empezando desde
 * $2,990 USD Implantes de Seno...", which reads equally well as the price coming
 * BEFORE or AFTER its label -- two plausible readings, one position apart, on a
 * $3,000 operation. The pairing was resolved from the markup, where each price
 * and its label sit in links sharing one href, and then CONFIRMED against each
 * procedure's own page.
 *
 *   node tools/verify/apply-published-prices.mjs
 *   node tools/verify/apply-published-prices.mjs --apply
 */
const PAT = process.env.SUPABASE_PAT;
const REF = 'svgsbaahxiaeljmfykzp';
const APPLY = process.argv.includes('--apply');

if (!PAT) {
  console.error('Need SUPABASE_PAT in the environment.');
  process.exit(1);
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`Management API ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

/**
 * ⛔ EVERY PRICE HERE IS A "FROM" PRICE AND SAYS SO. The clinic writes
 * "Empezando desde $X USD" / "Desde $X USD" -- starting from. Publishing a
 * starting price as if it were the price is the single most misleading thing
 * this table can do, so the wording travels with the number into price_notes
 * and is rendered beside it.
 *
 * ⛔ REFUSED, AND RECORDED HERE SO NOBODY RE-DERIVES IT:
 *   Liposucción  the homepage carries TWO prices under the same href ($4,000 and
 *                $2,990) and the procedure's own page carries two more ($2,990
 *                and $3,500). The clinic itself lists more than one; we do not
 *                get to pick.
 *   Mastopexia $4,500, Bichectomía $400, Rinoplastia $2,800, Blefaroplastia
 *                $1,200 -- real, unambiguous, published prices with NO matching
 *                procedure in clearcross_procedures. Inventing a procedure row to
 *                hold a price is how a category's vocabulary stops meaning
 *                anything; adding them is a decision about the product.
 */
const ROWS = [
  {
    providerSlug: 'state-of-art-medical-center',
    procedure: 'Tummy Tuck',
    usd: 3000,
    label: 'Tummy Tuck',
    source: 'https://plasticsurgery956.com/procedimientos/tummy/',
  },
  {
    providerSlug: 'state-of-art-medical-center',
    procedure: 'Breast Augmentation',
    usd: 2990,
    label: 'Implantes de Seno',
    source: 'https://plasticsurgery956.com/procedimientos/implantes/',
  },
  {
    providerSlug: 'state-of-art-medical-center',
    procedure: 'Facelift',
    usd: 5000,
    label: 'Estiramiento Facial',
    source: 'https://plasticsurgery956.com/procedimientos/levantamiento-facial/',
  },
  {
    providerSlug: 'state-of-art-medical-center',
    procedure: 'Mommy Makeover',
    usd: 5800,
    label: 'Mommy Makeover',
    source: 'https://plasticsurgery956.com/procedimientos/mommy-makeover/',
  },
];

const NOTE = (r) => `Starting price for "${r.label}" published by the provider on their own website (${r.source}), read 2026-09-05. The clinic states this as a "from" price -- the final price depends on the case.`;

const providers = await sql(`
  select p.id, p.name, p.slug, p.category_id, c.slug as category
  from clearcross_providers p join clearcross_categories c on c.id = p.category_id
`);
const procedures = await sql('select id, name, category_id from clearcross_procedures');

console.log(`${ROWS.length} hand-verified price(s) | ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

const planned = [];
for (const r of ROWS) {
  const prov = providers.find((p) => p.slug === r.providerSlug);
  if (!prov) { console.error(`REFUSING: no provider with slug ${r.providerSlug}`); process.exit(1); }
  // ⛔ The procedure must belong to the PROVIDER'S OWN category. Procedure names
  // repeat across categories, and a price hung on another category's row would
  // render under a heading the provider does not work in.
  const proc = procedures.find((x) => x.name === r.procedure && x.category_id === prov.category_id);
  if (!proc) {
    console.error(`REFUSING: ${prov.name} is in "${prov.category}" and has no procedure named "${r.procedure}" there`);
    process.exit(1);
  }
  // ⛔ Idempotent by (provider, procedure). The table deliberately allows several
  // rows per pair -- a pharmacy lists nine GLP-1 pens under one procedure -- so
  // re-running without this check silently doubles every price.
  const existing = await sql(`
    select id, price_usd from clearcross_provider_prices
    where provider_id = ${q(prov.id)} and procedure_id = ${q(proc.id)}
  `);
  planned.push({ r, prov, proc, existing });
  const mark = existing.length ? 'SKIP ' : ' +   ';
  console.log(`${mark} ${prov.name}  ${r.procedure.padEnd(22)} $${String(r.usd).padStart(6)}  ${existing.length ? `(already has ${existing.length} row(s))` : ''}`);
}

const toWrite = planned.filter((p) => !p.existing.length);
console.log(`\n${toWrite.length} to insert, ${planned.length - toWrite.length} already present.`);

if (!APPLY) {
  console.log('\nDRY RUN -- nothing written. Re-run with --apply.');
  process.exit(0);
}

for (const { r, prov, proc } of toWrite) {
  await sql(`
    insert into clearcross_provider_prices (provider_id, procedure_id, price_usd, price_notes, updated_at)
    values (${q(prov.id)}, ${q(proc.id)}, ${r.usd}, ${q(NOTE(r))}, now())
  `);
}
console.log(`\ninserted ${toWrite.length} price(s).`);
