#!/usr/bin/env node
/**
 * Guard: every internal link on the site resolves.
 *
 * ⛔ WHY THIS EXISTS. The navbar's user menu linked to `/login` and `/register`
 * while the pages live at `/auth/login` and `/auth/register` — two 404s reachable
 * from every page on the site, for weeks. And "List Your Business" pointed at
 * `/quote`, the PATIENT quote form, so a dentist who wanted to be listed was
 * asked which treatment they were shopping for. Every one of those was a valid
 * `<Link href>` to a route that does not exist; nothing type-checks that, and
 * nothing went red. They were found by a human clicking.
 *
 * ⛔ NO BROWSER, ON PURPOSE. Playwright is not a dependency of this repo, so a
 * browser-based version could only ever run on one laptop. Next server-renders
 * its client components, so the navbar and footer are in the HTML and plain fetch
 * can see them — which means this runs in CI, which is the whole point.
 *
 * Usage: BASE=http://localhost:3100 node test/links.mjs
 */
const BASE = (process.env.BASE || 'http://localhost:3100').replace(/\/$/, '')

// One of every route SHAPE, both trees. Provider and blog-post URLs are
// discovered from the sitemap so this cannot go stale as content is added.
const SEEDS = ['/', '/es', '/dentists', '/es/dentists', '/blog', '/es/blog', '/about', '/es/about']

let failures = 0
const fail = (m) => { console.error('FAIL  ' + m); failures++ }
const pass = (m) => console.log('ok    ' + m)

async function get(path) {
  try {
    const r = await fetch(BASE + path, { redirect: 'follow' })
    // ⛔ Read XML as well as HTML. An earlier draft gated on `text/html` alone, so
    // /sitemap.xml (application/xml) came back as an empty string and the URL
    // sample was silently zero — which would have reported "all links resolve"
    // having checked nothing. The <50 control below caught it; keep both.
    const ct = r.headers.get('content-type') || ''
    const textual = ct.includes('text/') || ct.includes('xml') || ct.includes('json')
    return { status: r.status, html: textual ? await r.text() : '' }
  } catch (e) {
    return { status: 0, html: '', err: String(e).slice(0, 80) }
  }
}

// ---- seed a couple of real content URLs out of the sitemap -------------------
const sm = await get('/sitemap.xml')
if (sm.status !== 200) {
  console.error(`FAIL  could not read /sitemap.xml from ${BASE} (status ${sm.status}${sm.err ? ', ' + sm.err : ''})`)
  console.error('      Is the server running? This guard needs one: BASE=http://localhost:PORT')
  process.exit(1)
}
const locs = [...sm.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/')
// ⛔ A control. An empty seed list makes every check below vacuously pass — the
// guard would report all-green having tested nothing.
if (locs.length < 50) { console.error(`FAIL  sitemap yielded only ${locs.length} URLs; refusing to run on a suspiciously small set`); process.exit(1) }
pass(`control: sitemap yielded ${locs.length} URLs to sample from`)

const firstProvider = locs.find((u) => /^\/[a-z-]+\/[a-z0-9-]+$/.test(u) && !u.startsWith('/es') && !u.startsWith('/blog'))
const firstPost = locs.find((u) => u.startsWith('/blog/'))
for (const extra of [firstProvider, firstPost, firstProvider && '/es' + firstProvider, firstPost && '/es' + firstPost]) {
  if (extra && !SEEDS.includes(extra)) SEEDS.push(extra)
}

// ---- collect every internal link on those pages ------------------------------
const found = new Map() // path -> Set(pages it was found on)
for (const seed of SEEDS) {
  const { status, html } = await get(seed)
  if (status !== 200) { fail(`seed page ${seed} returned ${status}`); continue }
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    let href = m[1]
    // Next emits preload/manifest hrefs too; those are assets, not navigation.
    if (href.startsWith('/_next/') || href.startsWith('/api/')) continue
    if (/\.(png|jpg|jpeg|svg|ico|webp|css|js|xml|txt|json)$/i.test(href)) continue
    href = href.replace(/\/$/, '') || '/'
    if (!found.has(href)) found.set(href, new Set())
    found.get(href).add(seed)
  }
}
pass(`control: found ${found.size} distinct internal links across ${SEEDS.length} seed pages`)
if (found.size < 15) fail(`only ${found.size} internal links found — the extractor is probably not seeing the nav`)

// ---- and check each one actually resolves ------------------------------------
const broken = []
for (const [href, pages] of found) {
  const { status } = await get(href)
  if (status >= 400 || status === 0) broken.push({ href, status, pages: [...pages] })
}

if (broken.length === 0) {
  pass(`all ${found.size} internal links resolve`)
} else {
  for (const b of broken) fail(`${b.href} -> ${b.status}   (linked from: ${b.pages.join(', ')})`)
}

// ---- the two specific regressions this was written for -----------------------
// Named explicitly so a future reader sees WHAT broke, not just that something did.
for (const [path, why] of [
  ['/auth/login', 'the navbar user menu links here'],
  ['/auth/register', '"List Your Business" links here'],
]) {
  const { status } = await get(path)
  if (status === 200) pass(`${path} resolves — ${why}`)
  else fail(`${path} -> ${status} — ${why}`)
}

// "List Your Business" must not point at the patient quote form. A dentist who
// clicks it should be asked for their clinic, not for the treatment they want.
//
// ⛔ SCOPED TO THE CTA BLOCK. An earlier draft tested the whole page for
// /auth/register?role=provider — and passed against a broken CTA, because the
// FOOTER carries the same link on every page. The mutation harness caught it:
// "points back at the patient quote form" scored MISSED. A check satisfied by
// the string existing somewhere on the page is not a check.
const catHtml = (await get('/dentists')).html
const anchor = catHtml.indexOf('Are you a provider')
if (anchor < 0) {
  fail('could not locate the provider CTA block on /dentists — the check below would be vacuous')
} else {
  const block = catHtml.slice(anchor, anchor + 1200)
  if (/href="\/auth\/register\?role=provider"/.test(block)) {
    pass('the provider CTA points at provider registration')
  } else {
    fail('the provider CTA does not point at /auth/register?role=provider')
  }
  if (/href="\/(es\/)?quote"/.test(block)) {
    fail('the provider CTA still points at the PATIENT quote form')
  } else {
    pass('the provider CTA does not send a clinic to the patient quote form')
  }
}

console.log(failures === 0
  ? `\nPASS — ${found.size} internal links, none broken.`
  : `\nFAILED — ${failures} check(s).`)
process.exit(failures === 0 ? 0 : 1)
