// Generates supabase/migrations/002_seed.sql from lib/mock-data.ts —
// the mock dataset (109 researched providers, 312 prices) is richer than the
// old hand-written 62-provider seed files. Deterministic UUIDv5 ids make the
// output idempotent across regenerations.
//
// Run: node scripts/generate-seed.mjs
// NOTE: fabricated per-patient reviews are deliberately NOT seeded — only
// patients who complete a quote can review (SOP integrity rule).

import { createHash } from 'crypto';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// mock-data.ts is plain data — strip the few TS-only tokens and import it
const tsSource = readFileSync(join(root, 'lib', 'mock-data.ts'), 'utf-8');
// Only the data arrays are needed — cut the file before the first typed
// function so no TS-only syntax reaches the JS loader.
const cutAt = tsSource.indexOf('export function');
const jsSource = (cutAt > 0 ? tsSource.slice(0, cutAt) : tsSource)
  .replace(/ as const/g, '')
  .replace(/: Record<string, number>/g, '');
const tmpFile = join(root, 'scripts', '.mock-data.tmp.mjs');
writeFileSync(tmpFile, jsSource);
const mock = await import(pathToFileURL(tmpFile).href);

const NS = 'clearcross-progreso-v1';
function uuid5(id) {
  const h = createHash('sha1').update(NS + ':' + id).digest('hex');
  // format as RFC-4122-shaped uuid (version 5 style)
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '5' + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join('-');
}

const q = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return "'" + String(v).replace(/'/g, "''") + "'";
};

let sql = `-- ============================================================
-- ClearCross Progreso — seed (GENERATED from lib/mock-data.ts)
-- Regenerate with: node scripts/generate-seed.mjs
-- Idempotent: deterministic UUIDs + ON CONFLICT upserts.
-- ============================================================

`;

// Categories
sql += '-- Categories\n';
for (const c of mock.categories) {
  sql += `INSERT INTO public.clearcross_categories (id, name, slug, icon, description, active, sort_order)
VALUES (${q(uuid5(c.id))}, ${q(c.name)}, ${q(c.slug)}, ${q(c.icon)}, ${q(c.description)}, ${q(c.active ?? true)}, ${q(c.sort_order ?? 0)})
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, active=EXCLUDED.active, sort_order=EXCLUDED.sort_order;\n`;
}

// Procedures
sql += '\n-- Procedures\n';
for (const p of mock.procedures) {
  sql += `INSERT INTO public.clearcross_procedures (id, category_id, name, slug, description, sort_order)
VALUES (${q(uuid5(p.id))}, ${q(uuid5(p.category_id))}, ${q(p.name)}, ${q(p.slug)}, ${q(p.description)}, ${q(p.sort_order ?? 0)})
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;\n`;
}

// Providers
sql += '\n-- Providers\n';
for (const p of mock.providers) {
  sql += `INSERT INTO public.clearcross_providers (id, category_id, name, slug, address, phone, whatsapp, website, description, logo_url, photo_url, graduation_year, verified, featured, plan, avg_rating, review_count, lat, lng)
VALUES (${q(uuid5(p.id))}, ${q(uuid5(p.category_id))}, ${q(p.name)}, ${q(p.slug)}, ${q(p.address)}, ${q(p.phone)}, ${q(p.whatsapp)}, ${q(p.website)}, ${q(p.description)}, ${q(p.logo_url)}, ${q(p.photo_url)}, ${q(p.graduation_year)}, ${q(p.verified ?? false)}, ${q(p.featured ?? false)}, ${q(p.plan ?? 'free')}, ${q(p.avg_rating ?? 0)}, ${q(p.review_count ?? 0)}, ${q(p.lat)}, ${q(p.lng)})
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp, website=EXCLUDED.website, description=EXCLUDED.description, logo_url=EXCLUDED.logo_url, photo_url=EXCLUDED.photo_url, graduation_year=EXCLUDED.graduation_year, verified=EXCLUDED.verified, featured=EXCLUDED.featured, plan=EXCLUDED.plan, avg_rating=EXCLUDED.avg_rating, review_count=EXCLUDED.review_count, lat=EXCLUDED.lat, lng=EXCLUDED.lng;\n`;
}

// Prices
sql += '\n-- Provider prices\n';
for (const pr of mock.providerPrices) {
  sql += `INSERT INTO public.clearcross_provider_prices (id, provider_id, procedure_id, price_usd, price_notes)
VALUES (${q(uuid5(pr.id))}, ${q(uuid5(pr.provider_id))}, ${q(uuid5(pr.procedure_id))}, ${q(pr.price_usd)}, ${q(pr.price_notes)})
ON CONFLICT (provider_id, procedure_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, price_notes=EXCLUDED.price_notes;\n`;
}

const out = join(root, 'supabase', 'migrations', '002_seed.sql');
writeFileSync(out, sql);
console.log(
  `Wrote ${out}: ${mock.categories.length} categories, ${mock.procedures.length} procedures, ${mock.providers.length} providers, ${mock.providerPrices.length} prices`
);
