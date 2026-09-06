/**
 * Read the price lists the clinics publish on their own websites.
 *
 * MEASURE ONLY. This script never writes. It exists because the plan recorded
 * in STATE.md -- "Firecrawl against each clinic's own site is the route" to the
 * missing price lists -- was disproven on a 9-site sample (9 x HTTP 200, ONE
 * price, ZERO uses of the word price/precio/cost), and because our own research
 * file from March already says the same thing against one of the dentists:
 * "Official website available but no public price list posted."
 *
 * Now that Places has filled in more website addresses the sample can be widened,
 * so this re-runs the measurement across every provider whose site we hold. It
 * reports what it finds and stops there.
 *
 * ⛔ WHY IT DOES NOT INSERT. A price on this site is a number a patient drives
 * across an international border to act on. Everything a scraper can pull off a
 * marketing page is unlabelled -- "from $199" against no procedure, a finance
 * instalment, a US comparison figure the clinic quotes to look cheap, or last
 * year's promotion. clearcross_provider_prices.procedure_id is NOT NULL, so a
 * row cannot even exist without deciding which of the 23 dental procedures a
 * loose "$450" refers to. That decision is not a scraper's to make.
 *
 *   node tools/verify/price-harvest.mjs
 *   node tools/verify/price-harvest.mjs --all   # include providers that already have prices
 */
const PAT = process.env.SUPABASE_PAT;
const REF = 'svgsbaahxiaeljmfykzp';
const ALL = process.argv.includes('--all');

if (!PAT) {
  console.error('Need SUPABASE_PAT in the environment.');
  process.exit(1);
}

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
 * The pages a clinic actually puts a price list on. Tried in order after the
 * homepage; a 404 costs one request.
 */
export const PRICE_PATHS = [
  '/precios', '/prices', '/price-list', '/pricing', '/tarifas', '/costos',
  '/services', '/servicios', '/tratamientos', '/treatments', '/fees',
];

export function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Price-shaped strings with the words around them.
 *
 * ⛔ THE CONTEXT IS THE POINT, NOT THE NUMBER. A bare "$450" is worthless and
 * actively dangerous: it could be a procedure, a deposit, a monthly finance
 * instalment, or the US price the clinic is comparing itself against. The
 * surrounding words are the only thing that could ever make it attributable,
 * and reading them is a person's job.
 */
export function priceHits(text) {
  const out = [];
  const re = /\$\s?[\d][\d,\.]{1,9}/g;
  let m;
  while ((m = re.exec(text))) {
    const from = Math.max(0, m.index - 70);
    const to = Math.min(text.length, m.index + m[0].length + 50);
    out.push({ amount: m[0].replace(/\s/g, ''), context: text.slice(from, to).trim() });
    if (out.length >= 40) break;
  }
  return out;
}

/** Does the page even use the vocabulary of a price list? */
export function mentionsPricing(text) {
  return /\b(price|prices|pricing|precio|precios|cost|costo|costos|tarifa|tarifas|fee|fees)\b/i.test(text);
}

/**
 * A page that is a JavaScript shell tells us nothing -- its content never
 * arrives in a plain fetch, so "no prices" would be a statement about our
 * fetcher rather than about the clinic. Reported separately for that reason.
 */
export function looksLikeShell(html, text) {
  return html.length > 400 && text.length < 200;
}

async function get(url) {
  const c = AbortSignal.timeout(15000);
  const r = await fetch(url, {
    signal: c,
    redirect: 'follow',
    headers: {
      // A plain, honest UA. We are reading a public page a clinic published.
      'User-Agent': 'Mozilla/5.0 (compatible; ClearCrossProgreso/1.0; +https://clearcrossprogreso.com)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  const ct = r.headers.get('content-type') || '';
  const body = ct.includes('text') || ct.includes('html') ? await r.text() : '';
  return { status: r.status, ct, html: body };
}

const rows = await sql(`
  select p.id, p.name, p.website, c.slug as category,
         (select count(*)::int from clearcross_provider_prices x where x.provider_id = p.id) as price_rows
  from clearcross_providers p
  join clearcross_categories c on c.id = p.category_id
  where p.verified and coalesce(p.website, '') <> ''
  order by c.slug, p.name
`);
const targets = ALL ? rows : rows.filter((r) => r.price_rows === 0);

console.log(`${rows.length} verified providers hold a website; ${targets.length} of them have no prices.`);
console.log(`Reading ${targets.length} site(s). MEASURE ONLY -- nothing is written.\n`);

const report = [];
for (const p of targets) {
  let base;
  try { base = new URL(p.website); } catch { console.log(`  !  ${p.name}: unparseable website ${p.website}`); continue; }

  const pages = [];
  let shell = false;
  try {
    const home = await get(base.href);
    if (home.status < 400 && home.html) {
      const t = textOf(home.html);
      shell = looksLikeShell(home.html, t);
      pages.push({ url: base.href, status: home.status, text: t });
    } else {
      pages.push({ url: base.href, status: home.status, text: '' });
    }
  } catch (e) {
    console.log(`  !  ${p.name}: ${String(e.message).slice(0, 60)}`);
    report.push({ p, reachable: false, hits: [], mentions: false, shell: false, paths: 0 });
    continue;
  }

  // Only chase subpages if the homepage answered.
  if (pages[0].status < 400) {
    for (const path of PRICE_PATHS) {
      try {
        const r = await get(new URL(path, base).href);
        if (r.status < 400 && r.html) {
          const t = textOf(r.html);
          if (t.length > 200) pages.push({ url: path, status: r.status, text: t });
        }
      } catch { /* a missing price page is the normal case */ }
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  const joined = pages.map((x) => x.text).join(' ');
  const hits = priceHits(joined);
  const mentions = mentionsPricing(joined);
  report.push({ p, reachable: pages[0].status < 400, hits, mentions, shell, paths: pages.length - 1 });

  const flag = !pages[0].status || pages[0].status >= 400 ? `HTTP ${pages[0].status}`
    : shell ? 'JS SHELL'
    : `${hits.length} price(s), ${mentions ? 'says "price"' : 'never says "price"'}, ${pages.length - 1} extra page(s)`;
  console.log(`  ${hits.length ? '$' : ' '} [${p.category}] ${p.name.slice(0, 44).padEnd(45)} ${flag}`);
}

const reachable = report.filter((r) => r.reachable);
const withPrices = report.filter((r) => r.hits.length);
console.log('\n--- measured ---');
console.log(`  sites read           : ${report.length}`);
console.log(`  answered             : ${reachable.length}`);
console.log(`  javascript shells    : ${report.filter((r) => r.shell).length}   (a plain fetch cannot see their content)`);
console.log(`  use the word "price" : ${report.filter((r) => r.mentions).length}`);
console.log(`  carry ANY $ amount   : ${withPrices.length}`);

if (withPrices.length) {
  console.log('\nEvery price-shaped string found, with its surrounding words.');
  console.log('⛔ Nothing below is attributed to a procedure. Read them.\n');
  for (const r of withPrices) {
    console.log(`[${r.p.category}] ${r.p.name}`);
    console.log(`  ${r.p.website}`);
    for (const h of r.hits.slice(0, 25)) console.log(`    ${h.amount.padEnd(10)} ... ${h.context.slice(0, 130)}`);
    console.log('');
  }
}
