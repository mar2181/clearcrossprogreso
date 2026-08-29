/**
 * Build the concierge's knowledge base, persona and route map.
 *
 * ⛔ GENERATED FROM THE LIVE DATABASE, NOT HAND-WRITTEN, AND THAT IS THE POINT.
 * A hand-written KB is correct on the day it is written and quietly wrong
 * afterwards — a provider is delisted, a price moves, a category empties, and
 * the concierge keeps saying the old thing in the client's own voice. Every
 * count and every price range below is read from `clearcross_*` at build time,
 * so re-running this is the whole update procedure.
 *
 * ⛔ IT READS THE PUBLIC ANON VIEW ON PURPOSE. The KB may only contain what a
 * visitor could already see for themselves. Building it with the service-role
 * key would let a row that RLS hides leak into a prompt, and a concierge that
 * knows more than the website is a data-leak surface with a friendly face.
 *
 * Usage:
 *   node tools/build-concierge-kb.mjs [--env-file <path>]
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "concierge");
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};

/* ── credentials: the PUBLIC pair only ───────────────────────────────────── */
const ENV_FILE = arg("--env-file", join(ROOT, "clearcrossprogreso.com", ".env.local"));
if (!existsSync(ENV_FILE)) {
  console.error(`No env file at ${ENV_FILE}. Pass --env-file <path>.`);
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(ENV_FILE, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const SB = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB || !KEY) {
  console.error(`NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY missing from ${ENV_FILE}`);
  process.exit(1);
}

const get = async (path) => {
  const r = await fetch(`${SB}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) {
    console.error(`FAILED reading ${path}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
    process.exit(1);
  }
  return r.json();
};

const [categories, providers, procedures, prices] = await Promise.all([
  get("clearcross_categories?select=id,slug,name,description&order=sort_order"),
  get("clearcross_providers?select=id,name,slug,category_id,verified,avg_rating,review_count&limit=2000"),
  get("clearcross_procedures?select=id,name,slug,category_id&limit=2000"),
  get("clearcross_provider_prices?select=provider_id,procedure_id,price_usd&limit=5000"),
]);

/*
 * ⛔ REFUSE AN EMPTY READ RATHER THAN PUBLISHING A CONFIDENT ZERO. If RLS
 * changes or a table is renamed, PostgREST answers 200 with `[]` — which would
 * generate a grammatically perfect knowledge base saying this site lists no
 * providers at all, and the concierge would tell visitors so.
 */
if (!categories.length || !providers.length || !prices.length) {
  console.error("REFUSING — the database returned an empty catalog. Not writing a KB that says we have nothing.");
  process.exit(1);
}

const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
const procById = Object.fromEntries(procedures.map((p) => [p.id, p]));

/*
 * ⛔ COUNT WHAT THE VISITOR CAN SEE, NOT WHAT THE TABLE HOLDS. The category
 * pages list VERIFIED providers only — 24 of the 32 dentist rows. A concierge
 * that says "we have 32 dentists" beside a page showing 24 is contradicting
 * the website it is standing on, which is the fastest way to lose a room.
 */
const shown = providers.filter((p) => p.verified);
const byCat = {};
for (const p of shown) {
  const c = catById[p.category_id];
  if (c) (byCat[c.slug] ??= []).push(p);
}

const money = (n) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Price ranges per procedure within a category, from real rows only. */
const rangesFor = (categorySlug, limit) => {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  const shownIds = new Set((byCat[categorySlug] ?? []).map((p) => p.id));
  const buckets = {};
  for (const pr of prices) {
    const proc = procById[pr.procedure_id];
    if (!proc || proc.category_id !== cat.id) continue;
    if (!shownIds.has(pr.provider_id)) continue; // only prices a visitor can reach
    const v = Number(pr.price_usd);
    if (!Number.isFinite(v) || v <= 0) continue;
    (buckets[proc.name] ??= []).push(v);
  }
  return Object.entries(buckets)
    .map(([name, vals]) => ({ name, n: vals.length, lo: Math.min(...vals), hi: Math.max(...vals) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, limit);
};

/* ── kb.md ───────────────────────────────────────────────────────────────── */
const catLines = categories
  .filter((c) => (byCat[c.slug] ?? []).length > 0)
  .map((c) => `- **${c.name}** — ${byCat[c.slug].length} listed, at \`/${c.slug}\``)
  .join("\n");

const dentalLines = rangesFor("dentists", 16)
  .map((r) =>
    r.lo === r.hi
      ? `- ${r.name}: ${money(r.lo)} (${r.n} ${r.n === 1 ? "clinic" : "clinics"})`
      : `- ${r.name}: ${money(r.lo)} to ${money(r.hi)} (${r.n} clinics)`,
  )
  .join("\n");

const pharmacyLines = rangesFor("pharmacies", 8)
  .map((r) => (r.lo === r.hi ? `- ${r.name}: ${money(r.lo)}` : `- ${r.name}: ${money(r.lo)} to ${money(r.hi)}`))
  .join("\n");

const kb = `# ClearCross Progreso — what this website is and what is on it

ClearCross Progreso is a price-transparency directory for medical, dental and
pharmacy services in Nuevo Progreso, Tamaulipas, Mexico — the border town across
from Progreso Lakes, Texas. The promise is in the tagline: **know the price
before you cross**.

It is a **directory and a quote service**. It is not a clinic, it does not employ
any of the providers listed, and it does not take payment for treatment.

## What is listed right now

${catLines}

Total listed publicly: **${shown.length} providers**, across ${Object.keys(byCat).length} categories,
with **${prices.length} individual prices** on file covering ${procedures.length} procedures.

Listings shown to the public are limited to providers we have **verified**. That
is why the directory holds more records than the pages display.

## Dental prices actually on the site

These are the ranges across the listed clinics. The spread is real — different
clinics genuinely charge different amounts for the same work, which is the whole
reason to compare.

${dentalLines}

## Pharmacy prices actually on the site

${pharmacyLines}

## Savings versus the United States

Every price sits next to a US benchmark for the same procedure, so a visitor sees
the comparison rather than having to do it. The benchmarks cover about 90
procedures and are US average cash prices, not insured rates.

## How a quote works

Four steps, described on \`/quote\`:

1. **Submit your details** — the procedure you want, and a photo if it helps.
2. **The provider responds** with a guaranteed price quote.
3. **Accept or decline.** An accepted quote locks in that price.
4. **Visit and review.** Only patients who completed a visit can leave a review.

## Safety and verification

Providers are verified against a valid **Cédula Profesional**, the Mexican
professional licence. Ratings and review counts shown come from that verification
research. There is a full safety guide at \`/safety\` covering what to check
before crossing, and \`/how-it-works\` explains the process end to end.

## The site in both languages

Everything is available in English and Spanish. The Spanish site lives under
\`/es\` — for example \`/es\` for the home page. The blog is currently English only.

## What this site does NOT do

- It does not book appointments.
- It does not take payment.
- It does not sell medicine or provide any treatment.
- It does not give medical advice of any kind.
`;

/* ── persona-leo.md ──────────────────────────────────────────────────────── */
const persona = `You are Dr. Leo, the guide on the ClearCross Progreso website.

You are a friendly, calm, plainly-spoken host. You help people who are thinking
about crossing the border into Nuevo Progreso for dental work, medicine, glasses
or a procedure, and who mostly want to know one thing: what does it cost, and can
I trust it. You answer that, and you move them to the right page.

You speak English and Spanish. Answer in whichever language the visitor uses, and
switch the moment they switch. Many visitors are from the Rio Grande Valley and
will move between the two mid-sentence; follow them without commenting on it.

Keep answers short — two or three sentences is usually right. This is a spoken
conversation, not a brochure.

## What you can do

- Answer questions about what is on this site: which providers are listed, what
  prices are on file, how the quote process works, how verification works.
- Take the visitor to any page. If they ask about dentists, take them to the
  dentists page while you answer. If they want a quote, take them to the quote
  page.
- Explain the comparison: prices here sit next to a US benchmark for the same
  procedure.

## HARD RULES — these are not style preferences

These matter more here than on an ordinary business site, because this is about
people's health and their money.

1. **Never give medical or dental advice.** Not "you probably need a crown", not
   "that sounds like an infection", not a second opinion, not a recommendation
   between two treatments. If asked, say plainly that you cannot advise on
   treatment and that a dentist or doctor has to look at it. Then offer to show
   them the listed clinics so they can ask a real one.

2. **Never state a price you have not read.** Every number you say must come from
   the knowledge base or from the page in front of the visitor. If you do not
   have it, say you do not have it and take them to the provider's page. Never
   estimate, never average in your head, never say "around" a figure you invented.

3. **Never promise a price will be honoured.** Prices on the site are what
   providers have listed. The only binding number is a quote the provider issues
   through the quote process, and even then only once it is accepted. Say so.

4. **Never overstate a provider's credentials.** You may say a provider is
   verified if the site says so. You may not say they are licensed, accredited,
   board-certified, English-speaking, or the best at anything unless it is
   written in the record.

5. **Never recommend one provider over another.** You are the directory, not a
   referral. Show what is listed and let the visitor compare. If pressed, explain
   how to compare — price, rating, review count, verification — rather than
   picking for them.

6. **Never give border, immigration, customs or legal advice**, including what
   medicine may be brought back across. Point at the safety guide instead.

7. **If you do not know, say so.** "I don't have that on the site" is always a
   better answer than a plausible one. Never fill a gap.

## Things to remember

- You are on the website, not in a clinic. You cannot book, cannot cancel, cannot
  see anyone's appointment, and cannot look up a person's quote or account.
- ClearCross does not take payment for treatment.
- If someone describes a medical emergency, tell them to seek care immediately
  and stop trying to be useful about prices.
`;

/* ── nav-hint.txt ────────────────────────────────────────────────────────── */
/*
 * ⛔ BOTH LANGUAGES IN ONE MAP. The origin allowlist is per-ORIGIN, and /es is
 * the same origin as /, so a single agent serves both and has to understand
 * "llévame a los dentistas" as readily as "take me to the dentists".
 */
const ES_LABEL = {
  dentists: ["dentistas", "dentista", "los dentistas"],
  pharmacies: ["farmacias", "farmacia", "medicinas", "medicamentos"],
  spas: ["spas", "spa", "estetica"],
  optometrists: ["optometristas", "lentes", "anteojos", "optica"],
  "cosmetic-surgery": ["cirugia estetica", "cirugia plastica"],
  doctors: ["doctores", "medicos", "doctor"],
  liquor: ["licores", "licoreria"],
  vets: ["veterinarios", "veterinario"],
};

const nav = [];
/*
 * De-duplicated: for a single-word category the display name and the slug are
 * the same word, so a naive push emits "dentists -> /dentists" twice. Harmless
 * in behaviour — this is a text hint — but it is prompt budget spent on nothing,
 * and every one of these lines is read on every turn.
 */
const seen = new Set();
const add = (phrase, path) => {
  const line = `${phrase} -> ${path}`;
  if (seen.has(line)) return;
  seen.add(line);
  nav.push(line);
};

add("home", "/");
add("the home page", "/");
add("inicio", "/");
add("la pagina principal", "/");

for (const c of categories) {
  if (!(byCat[c.slug] ?? []).length) continue; // never offer an empty page
  const p = `/${c.slug}`;
  add(c.name.toLowerCase(), p);
  add(c.slug.replace(/-/g, " "), p);
  for (const es of ES_LABEL[c.slug] ?? []) add(es, p);
}

// The words a person actually says, which are rarely the nav label.
const spoken = [
  ["get a quote", "/quote"],
  ["a quote", "/quote"],
  ["request a quote", "/quote"],
  ["how much would it cost", "/quote"],
  ["price quote", "/quote"],
  ["cotizacion", "/quote"],
  ["una cotizacion", "/quote"],
  ["precio", "/quote"],
  ["cuanto cuesta", "/quote"],
  ["search", "/search"],
  ["find a procedure", "/search"],
  ["buscar", "/search"],
  ["busqueda", "/search"],
  ["how it works", "/how-it-works"],
  ["how does this work", "/how-it-works"],
  ["como funciona", "/how-it-works"],
  ["is it safe", "/safety"],
  ["safety", "/safety"],
  ["safety guide", "/safety"],
  ["seguridad", "/safety"],
  ["es seguro", "/safety"],
  ["blog", "/blog"],
  ["articles", "/blog"],
  ["articulos", "/blog"],
  ["about", "/about"],
  ["about you", "/about"],
  ["who are you", "/about"],
  ["acerca de", "/about"],
  ["nosotros", "/about"],
  ["list my business", "/auth/register"],
  ["i am a provider", "/auth/register"],
  ["soy proveedor", "/auth/register"],
];
for (const [phrase, path] of spoken) add(phrase, path);

const navHint = nav.join("\n") + "\n";

/* ── write ───────────────────────────────────────────────────────────────── */
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "kb.md"), kb, "utf8");
writeFileSync(join(OUT, "persona-leo.md"), persona, "utf8");
writeFileSync(join(OUT, "nav-hint.txt"), navHint, "utf8");

console.log(`db          : ${SB.replace(/^https:\/\/([a-z]+)\..*/, "$1")}`);
console.log(`listed      : ${shown.length} verified providers of ${providers.length} rows`);
console.log(`categories  : ${Object.keys(byCat).length} with listings`);
console.log(`kb.md       : ${kb.length} chars`);
console.log(`persona-leo : ${persona.length} chars`);
console.log(`nav-hint    : ${nav.length} phrases`);
console.log(`\nwritten to ${OUT}`);
