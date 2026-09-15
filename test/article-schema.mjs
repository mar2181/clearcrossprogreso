/**
 * BlogPosting on blog posts, WebSite + Organization on the home page.
 *
 * ⛔ READS THE BUILT HTML AND THE MDX FRONTMATTER, never the page source. The
 * failure this site has already shipped once is well-formed markup that says
 * something the page does not (an aggregateRating over "No reviews yet"). So
 * every field is compared with what a reader sees or with the file it came from.
 *
 * Runs after `next build` in `npm run verify`.
 */
import fs from 'node:fs';
import path from 'node:path';

const APP = '.next/server/app';
const SITE = 'https://clearcrossprogreso.com';
let pass = 0;
const failures = [];
const check = (ok, label) => { if (ok) pass++; else failures.push(label); };

const decode = (s) => s
  .replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function graphs(html) {
  return (html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []).map((t) => {
    try { return JSON.parse(t.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')); }
    catch { return 'INVALID'; }
  });
}

function frontmatter(src, key) {
  const m = src.match(new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*$`, 'm'));
  return m ? m[1].replace(/\\"/g, '"') : null;
}

// ⛔ Fails loudly with no build rather than passing on nothing.
if (!fs.existsSync(APP)) {
  console.error(`FAIL  ${APP} does not exist — run next build first`);
  process.exit(1);
}

// ── Blog posts ──────────────────────────────────────────────────────────────
const slugs = fs.readdirSync('content/blog').filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
check(slugs.length > 0, 'control: content/blog has posts');
let checked = 0;

for (const slug of slugs) {
  const src = fs.readFileSync(`content/blog/${slug}.mdx`, 'utf8');
  const file = path.join(APP, 'blog', slug + '.html');
  if (!fs.existsSync(file)) { failures.push(`${slug}: not prerendered`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const gs = graphs(html);
  const posts = gs.filter((g) => g && g['@type'] === 'BlogPosting');
  check(!gs.includes('INVALID'), `${slug}: every JSON-LD tag parses`);
  check(posts.length === 1, `${slug}: exactly one BlogPosting (found ${posts.length})`);
  const p = posts[0];
  if (!p) continue;

  const title = frontmatter(src, 'title');
  const date = frontmatter(src, 'date');
  const author = frontmatter(src, 'author');
  const cover = frontmatter(src, 'coverImage');
  const h1 = (html.match(/<h1[^>]*>([^<]*)/) || [])[1];

  check(p.headline === title, `${slug}: headline "${p.headline}" is not the frontmatter title`);
  check(h1 !== undefined && decode(h1).trim() === p.headline, `${slug}: headline is not the H1 the page renders`);
  check(p.datePublished === date, `${slug}: datePublished ${p.datePublished} is not the frontmatter date ${date}`);
  check(p.mainEntityOfPage === `${SITE}/blog/${slug}`, `${slug}: mainEntityOfPage points elsewhere`);
  check(p.author?.name === author && html.includes(`>${author}<`), `${slug}: author is not the byline the page shows`);
  if (cover) {
    check(p.image === SITE + cover, `${slug}: image is not the cover image`);
    check(fs.existsSync(path.join('public', cover)), `${slug}: marked-up image ${cover} does not exist`);
  }
  // ⛔ No review or rating markup on an editorial post, ever.
  check(!/aggregateRating|"Review"|FAQPage/.test(JSON.stringify(p)), `${slug}: carries review, rating or FAQ markup`);
  checked++;
}
check(checked === slugs.length, `only ${checked} of ${slugs.length} posts were checked`);

// ── Home page ───────────────────────────────────────────────────────────────
const homeFile = path.join(APP, 'index.html');
check(fs.existsSync(homeFile), 'home page was prerendered');
if (fs.existsSync(homeFile)) {
  const nodes = graphs(fs.readFileSync(homeFile, 'utf8')).flatMap((g) => (g && g['@graph']) || [g]);
  const site = nodes.find((n) => n && n['@type'] === 'WebSite');
  const org = nodes.find((n) => n && n['@type'] === 'Organization');
  check(site && site.url === SITE && site.name === 'ClearCross Progreso', 'home: WebSite names the site at its canonical URL');
  check(org && org.url === SITE && org.name === 'ClearCross Progreso', 'home: Organization names ClearCross Progreso');
  const logo = org?.logo?.url || org?.logo;
  check(typeof logo === 'string' && fs.existsSync(path.join('public', logo.replace(SITE, ''))), 'home: Organization logo exists in public/');
  // ⛔ The sitelinks search box was retired in 2024; a SearchAction is dead weight.
  check(!JSON.stringify(site || {}).includes('SearchAction'), 'home: no retired SearchAction');
}

for (const f of failures) console.log('FAIL  ' + f);
console.log(`\narticle-schema: ${checked} posts\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length === 0 ? 0 : 1);
