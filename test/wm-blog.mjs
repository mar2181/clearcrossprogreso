/**
 * GUARD — the webmaster blog reader (lib/wm-blog.ts), the revalidate route
 * (lib/revalidate.ts + app/api/revalidate/route.ts) and their wiring.
 *
 * Run:  node --import ./test/_ts-alias-hook-register.mjs test/wm-blog.mjs
 *
 * ⛔ HERMETIC. globalThis.fetch is replaced before anything reads the database,
 * so this never touches Supabase and runs the same with or without a network.
 * On 2026-09-21 the live table held ZERO clearcross_progreso rows in any status,
 * so the only way to prove the path end to end was a mocked fetch.
 *
 * ⛔ It EXECUTES the adapter, the fetch layer, the index merge and the real
 * sitemap function rather than reading their source, because a source scan
 * cannot tell an escape that works from one that returns its input.
 */
import { readFileSync, existsSync } from 'node:fs'
import { stripComments } from './_strip-comments.mjs'

let pass = 0
const failures = []
const check = (ok, label) => { if (ok) pass++; else failures.push(label) }

// ---------------------------------------------------------------- fetch stub
const calls = []
let responder = () => new Response('[]', { status: 200 })
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init })
  return responder(String(url), init)
}
const json = (rows) => () => new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json' } })

const wm = await import('../lib/wm-blog.ts')
const rv = await import('../lib/revalidate.ts')

// ---------------------------------------------------------------- 1. hostile text renders as text
const HOSTILE = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
  "' onmouseover='alert(1)",
  '**bold** and *em*',
  '| a | b |',
  '## a fake heading',
  '![x](https://evil.example/x.png)',
  '- a fake list item',
  '1. a fake ordered item',
  '&lt;already-escaped&gt;',
]
const BUCKET_IMG = wm.IMAGE_BUCKET_PREFIX + 'blog/photo.jpg'
const hostileRow = {
  slug: 'hostile-post', title: '<b>Title</b>', excerpt: '<i>x</i>', status: 'published',
  client_key: 'clearcross_progreso', category: 'dental care', author: 'Vera',
  date: '2026-09-20T00:00:00+00:00', image: 'https://evil.example/hero.jpg',
  images: [
    { ref: 'ok', url: BUCKET_IMG, alt: 'alt [with] (brackets) <b>' },
    { ref: 'evil', url: 'https://evil.example/x.png', alt: 'x' },
    { ref: 'otherbucket', url: 'https://svgsbaahxiaeljmfykzp.supabase.co/storage/v1/object/public/ariss-estates-images/a.jpg', alt: 'x' },
    { ref: 'hero_video', url: wm.IMAGE_BUCKET_PREFIX + 'v.mp4' },
  ],
  content: JSON.stringify([
    ...HOSTILE.map((t) => ({ type: 'paragraph', text: t })),
    { type: 'heading', text: '<script>h</script>' },
    { type: 'stat_strip', stats: [{ value: '<b>90%</b>', label: '<i>less</i>' }] },
    { type: 'cards', cards: [{ title: '<script>c</script>', text: '## card body' }] },
    { type: 'pullquote', text: '<q>', attribution: '<a href=x>' },
    { type: 'checklist', heading: 'H', items: HOSTILE },
    { type: 'faq', qa: [{ q: '<script>q</script>', a: '| cell |' }] },
    { type: 'callout', heading: 'C', paras: ['<p>one</p>', '- two'] },
    { type: 'cta_band', heading: 'Go', text: '<a href=javascript:alert(1)>x</a>' },
    { type: 'image', image_ref: 'ok', caption: 'cap <b>x</b>' },
    { type: 'image', image_ref: 'evil', caption: 'must vanish' },
    { type: 'image', image_ref: 'otherbucket', caption: 'must vanish too' },
    { type: 'image', image_ref: 'hero_video', caption: 'video is not a picture' },
    { type: 'split', image_ref: 'missing', heading: 'S', text: 'split body' },
    { type: 'totally-unknown', text: '<script>unknown</script>' },
  ]),
}
const p = wm.shape(hostileRow)
check(p !== null, 'control: the hostile post shapes into a post')
if (p) {
  const c = p.content
  check(!/[<>]/.test(c.replace(/!\[[^\]]*\]\([^)]*\)/g, '')), 'no raw < or > survives anywhere in the rendered text')
  check(c.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'a <script> paragraph is present as escaped TEXT (not dropped, not live)')
  check(!c.includes('*'), 'no raw asterisk survives, so post text cannot make its own <strong>/<em>')
  check(c.includes('&#42;&#42;bold&#42;&#42;'), 'the **bold** paragraph is kept as literal asterisks')
  const lines = c.split('\n').filter(Boolean)
  const ours = /^(## |### |- |!\[)/
  const bad = lines.filter((l) => !ours.test(l) && /^([#|!-]|\d+\.)/.test(l))
  check(bad.length === 0, `no post text begins with block markup RichContent would obey (${bad.slice(0, 2).join(' / ')})`)
  check(lines.includes('&#35;# a fake heading'), 'a "## fake heading" paragraph stays a paragraph (leading # encoded)')
  check(lines.includes('&#124; a &#124; b &#124;') || lines.some((l) => l.startsWith('&#124;')), 'a "| a | b |" paragraph cannot become a table')
  check(lines.some((l) => l.startsWith('&#45; a fake list item')), 'a "- item" paragraph cannot become a list')
  check(lines.some((l) => l.startsWith('1&#46; a fake ordered item')), 'a "1. item" paragraph cannot become an ordered list')
  check(lines.some((l) => l.startsWith('&#33;[x]')), 'a pasted ![x](evil) paragraph cannot become an image')
  const imgs = lines.filter((l) => l.startsWith('!['))
  check(imgs.length === 1, `exactly ONE image line survives (the bucket one) — found ${imgs.length}`)
  check(imgs[0] === `![cap bx b](${BUCKET_IMG})` || (imgs[0] || '').endsWith(`](${BUCKET_IMG})`), 'the surviving image is this client\'s bucket URL')
  check(!/\]\([^)]*\([^)]*\)/.test(imgs[0] || '') && !/\[[^\]]*[\[\]][^\]]*\]\(/.test(imgs[0] || ''), 'alt text cannot break the image line')
  check(!imgs.some((l) => /evil\.example|ariss-estates-images|\.mp4/.test(l)) && !c.includes('ariss-estates-images') && !c.includes('.mp4'), 'foreign-host, other-bucket and video URLs never reach next/image')
  check(!c.includes('unknown'), 'an unknown block type is dropped, never rendered raw')
  check(c.includes('split body') && !lines.some((l) => l.includes('missing')), 'a split with no picture degrades to its text')
  check(p.coverImage === '', 'a hero on a foreign host is dropped (next/image would throw)')
  check(p.tags.includes('dental'), 'category "dental care" maps to the site topic tag "dental"')
  check(p.date === '2026-09-20', 'date is the ISO day')
  check(/^\d+ min read$/.test(p.readingTime), 'reading time is in the site\'s format')
}

// ---------------------------------------------------------------- 2. image rules
check(wm.safeImage('/images/heroes/dentists-hero.jpg') === '/images/heroes/dentists-hero.jpg', 'a site-relative hero is accepted')
check(wm.safeImage('https://clearcrossprogreso.com/images/heroes/dentists-hero.jpg') === '/images/heroes/dentists-hero.jpg', 'an absolute hero on our own domain becomes relative')
check(wm.safeImage(BUCKET_IMG) === BUCKET_IMG, 'this client\'s bucket is accepted')
for (const bad of ['/images/../secret', '//evil.example/x.jpg', 'javascript:alert(1)', '/images/a b.jpg', wm.IMAGE_BUCKET_PREFIX + '../x', 'https://clearcrossprogreso.com.evil.example/images/x.jpg', 42, null])
  check(wm.safeImage(bad) === null, `image refused: ${String(bad)}`)

// ---------------------------------------------------------------- 3. drafts and other tenants never become posts
const base = { slug: 'ok-post', title: 'T', content: '[]', date: '2026-09-01' }
check(wm.shape({ ...base, status: 'draft', client_key: 'clearcross_progreso' }) === null, 'a DRAFT row never becomes a post, even if RLS and the filter were lost')
check(wm.shape({ ...base, status: 'published', client_key: 'ariss_estates' }) === null, 'another client\'s row never becomes a post')
check(wm.shape({ ...base, status: 'published', client_key: 'clearcross_progreso' }) !== null, 'control: a published row for this client does')
check(wm.shape({ ...base, slug: '../etc' }) === null, 'a row with an unsafe slug is refused')
check(wm.shape({ ...base, title: '' }) === null, 'a row with no title is refused')
check(wm.shape({ ...base, content: 'not json <b>' })?.content === 'not &lt;b&gt;'.replace('not', 'not json'), 'non-JSON content degrades to one escaped paragraph')

// ---------------------------------------------------------------- 4. the query
calls.length = 0
responder = json([
  { ...base, slug: 'published-one', status: 'published', client_key: 'clearcross_progreso', date: '2026-09-02' },
  { ...base, slug: 'a-draft', status: 'draft', client_key: 'clearcross_progreso' },
  { ...base, slug: 'foreign', status: 'published', client_key: 'sugar_shack' },
  { ...base, slug: 'first-time-in-nuevo-progreso-checklist', status: 'published', client_key: 'clearcross_progreso' },
])
const listed = await wm.wmPosts(['first-time-in-nuevo-progreso-checklist'])
check(calls.length === 1, 'wmPosts makes exactly one request')
const q = calls[0] || { url: '', init: {} }
check(q.url.startsWith('https://svgsbaahxiaeljmfykzp.supabase.co/rest/v1/wm_blogs?'), 'reads wm_blogs on the shared project')
check(q.url.includes('&client_key=eq.clearcross_progreso'), 'the query is scoped to client_key=clearcross_progreso')
check(q.url.includes('&status=eq.published'), 'the query carries an explicit status=eq.published')
const auth = q.init?.headers?.Authorization || ''
const role = (() => { try { return JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString()).role } catch { return null } })()
check(role === 'anon', `reads with the ANON key so RLS applies (role=${role})`)
check(q.init?.headers?.apikey === wm.SUPABASE_ANON_KEY, 'apikey header is the anon key')
check(q.init?.next?.revalidate === 3600 && (q.init?.next?.tags || []).includes('wm-blogs'), 'cached an hour under the wm-blogs tag')
check(q.init?.cache !== 'no-store', 'not cache: no-store')
check(listed.map((x) => x.slug).join(',') === 'published-one', `only the published, own-client, non-colliding post is listed (got ${listed.map((x) => x.slug)})`)

// ---------------------------------------------------------------- 5. slug validation before the query
calls.length = 0
for (const s of ['../x', 'a/b', 'A-Upper', 'x&status=eq.draft', 'x,y', '', '-lead', 'a'.repeat(121), 42, null])
  check((await wm.wmPostBySlug(s)) === null, `wmPostBySlug refuses ${JSON.stringify(s)}`)
check(calls.length === 0, 'a refused slug never reaches the database')
responder = json([{ ...base, slug: 'good-one', status: 'published', client_key: 'clearcross_progreso' }])
const one = await wm.wmPostBySlug('good-one')
check(one?.slug === 'good-one', 'control: a valid slug is fetched')
check((calls.at(-1)?.url || '').includes('&slug=eq.good-one'), 'the slug filter is on the query')

// ---------------------------------------------------------------- 6. failure degrades, never throws
responder = () => new Response('boom', { status: 500 })
check((await wm.wmPosts()).length === 0, 'a 500 from the database is no webmaster posts, not a crash')
responder = () => { throw new Error('network down') }
check((await wm.wmPosts()).length === 0, 'an unreachable database is no webmaster posts, not a crash')
check((await wm.wmPostBySlug('good-one')) === null, 'an unreachable database 404s a post rather than throwing')
responder = () => new Response('{"not":"an array"}', { status: 200 })
check((await wm.wmPosts()).length === 0, 'a non-array body is no posts')

// ---------------------------------------------------------------- 7. the index merge
const merged = wm.mergeBlogIndex(
  [{ slug: 'mdx-a', date: '2026-01-01' }, { slug: 'dup', date: '2026-02-01' }],
  [{ slug: 'wm-new', date: '2026-09-01' }, { slug: 'dup', date: '2026-09-02' }, { slug: 'wm-bad-date', date: '' }],
)
check(merged.map((x) => x.slug).join(',') === 'wm-new,dup,mdx-a,wm-bad-date', `index = newest first, MDX wins a collision (got ${merged.map((x) => x.slug)})`)
check(merged.filter((x) => x.slug === 'dup').length === 1 && merged.find((x) => x.slug === 'dup').date === '2026-02-01', 'the colliding slug is the MDX copy, listed once')

// ---------------------------------------------------------------- 8. the REAL sitemap includes published DB posts, English only
responder = (url) => url.includes('/rest/v1/wm_blogs')
  ? json([
      { ...base, slug: 'vera-sitemap-post', status: 'published', client_key: 'clearcross_progreso', date: '2026-09-15' },
      { ...base, slug: 'vera-draft-post', status: 'draft', client_key: 'clearcross_progreso' },
      { ...base, slug: 'first-time-in-nuevo-progreso-checklist', status: 'published', client_key: 'clearcross_progreso' },
    ])()
  : new Response('[]', { status: 200 })
let sitemapFn = null
try { sitemapFn = (await import('../app/sitemap.ts')).default } catch (e) { failures.push(`app/sitemap.ts could not be loaded: ${e.message}`) }
if (sitemapFn) {
  const sm = await sitemapFn()
  const urls = sm.map((e) => e.url)
  check(urls.filter((u) => u === 'https://clearcrossprogreso.com/blog/vera-sitemap-post').length === 1, 'the sitemap lists a published webmaster post exactly once')
  check(!urls.some((u) => u.includes('/es/blog/vera-sitemap-post')), 'the sitemap does NOT advertise a Spanish twin for it')
  check(!sm.find((e) => e.url.endsWith('/blog/vera-sitemap-post'))?.alternates, 'its sitemap entry carries no hreflang pair')
  check(!urls.some((u) => u.includes('vera-draft-post')), 'a draft never reaches the sitemap')
  check(urls.filter((u) => u === 'https://clearcrossprogreso.com/blog/first-time-in-nuevo-progreso-checklist').length === 1, 'a webmaster post colliding with an MDX slug is not listed twice (MDX wins)')
  check(urls.includes('https://clearcrossprogreso.com/es/blog/first-time-in-nuevo-progreso-checklist'), 'control: MDX posts keep their Spanish pair')
}

// ---------------------------------------------------------------- 9. revalidate module + route
check(rv.BLOG_TAG === wm.BLOG_TAG, 'the revalidate tag matches the tag on the read')
check(String(rv.SLUG_RE) === String(wm.SLUG_RE), 'the revalidate slug rule matches the reader\'s')
check(JSON.stringify(rv.pathsFor('good-one')) === JSON.stringify(['/blog/good-one', '/blog', '/sitemap.xml']), 'a publish purges the post, the index and the sitemap')
for (const s of ['../x', 'a/b', 'x?y', '', 42, null, undefined, 'A'])
  check(rv.pathsFor(s) === null, `pathsFor refuses ${JSON.stringify(s)}`)

const route = stripComments(readFileSync('app/api/revalidate/route.ts', 'utf8'))
check(/if \(!secret\)[\s\S]{0,200}status: 503/.test(route), 'the route fails CLOSED (503) with no REVALIDATE_SECRET')
check(/req\.headers\.get\('x-revalidate-secret'\)/.test(route), 'the secret is read from the x-revalidate-secret header')
check(!/searchParams|nextUrl|\.search\b|new URL\(req/.test(route), 'the secret is never read from the query string')
check(/timingSafeEqual/.test(route), 'constant-time compare')
check(/const paths = pathsFor\(slug\);\s*if \(!paths\)/.test(route), 'the slug is validated before anything is revalidated')
check(route.indexOf('pathsFor(slug)') < route.indexOf('revalidatePath('), 'validation happens before revalidatePath')
check(!/fetch\(|from '@\/lib\/supabase|createClient|\.from\('/.test(route), 'the route reads and writes no database')
check(/export async function GET[\s\S]{0,120}405/.test(route), 'GET answers 405, not 404')

// ---------------------------------------------------------------- 10. wiring (source)
const slugPage = stripComments(readFileSync('app/blog/[slug]/page.tsx', 'utf8'))
check(/const mdx = getPostBySlug\(slug\);\s*if \(mdx\)/.test(slugPage) && slugPage.indexOf('getPostBySlug(slug)') < slugPage.indexOf('wmPostBySlug(slug)'), 'the post route asks MDX FIRST, the database only when no file exists')
check(/if \(!found\) notFound\(\)/.test(slugPage), 'a missing post is a real 404 (notFound), not a 200 soft 404')
check(!/Post Not Found<\/h1>/.test(slugPage), 'the soft-404 page body is gone')
check(/if \(webmaster\) \{\s*return \{ \.\.\.base, alternates: \{ canonical: enUrl\(`\/blog\/\$\{slug\}`\) \} \};/.test(slugPage), 'a webmaster post gets a canonical and NO hreflang pair')
check(/export const revalidate = 3600/.test(slugPage) && !/dynamicParams\s*=\s*false/.test(slugPage), 'post route is ISR with dynamicParams left on')
const indexPage = stripComments(readFileSync('app/blog/page.tsx', 'utf8'))
check(/wmPosts\(mdxPosts\.map\(\(p\) => p\.slug\)\)/.test(indexPage) && /mergeBlogIndex\(mdxPosts, webmaster\)/.test(indexPage), 'the /blog index lists published webmaster posts, MDX excluded from the DB set')
check(/export const revalidate = 3600/.test(indexPage), 'the index is ISR')
const esIndex = readFileSync('app/es/blog/page.tsx', 'utf8')
const esPost = readFileSync('app/es/blog/[slug]/page.tsx', 'utf8')
check(!/wm-blog/.test(esIndex + esPost), 'no /es copy of a webmaster post exists')
const cfg = readFileSync('next.config.js', 'utf8')
for (const r of ["'/blog'", "'/blog/[slug]'", "'/sitemap.xml'"])
  check(new RegExp(`${r.replace(/[[\]/.]/g, '\\$&')}:\\s*\\['\\./content/blog/\\*\\*/\\*'\\]`).test(cfg), `content/blog is traced into ${r} (ISR regenerates at runtime)`)
const lib = stripComments(readFileSync('lib/wm-blog.ts', 'utf8'))
check(!/no-store/.test(lib), 'the reader does not opt out of caching')
check(!/service_role|SERVICE_ROLE|SUPABASE_SERVICE/.test(lib), 'the reader never touches the service key')
const mw = readFileSync('middleware.ts', 'utf8')
check(/'\/api\/revalidate'/.test(mw), 'the password gate lets the brain reach /api/revalidate (the route enforces its own secret)')

// ---------------------------------------------------------------- 11. built trace (only if a build exists)
const nft = '.next/server/app/blog/[slug]/page.js.nft.json'
if (existsSync(nft)) {
  for (const f of ['.next/server/app/blog/[slug]/page.js.nft.json', '.next/server/app/blog/page.js.nft.json', '.next/server/app/sitemap.xml/route.js.nft.json']) {
    if (!existsSync(f)) { failures.push(`${f} missing from the build`); continue }
    const files = JSON.parse(readFileSync(f, 'utf8')).files || []
    check(files.some((x) => /content[\\/]blog[\\/][^\\/]+\.mdx$/.test(x)), `the build traces the MDX files into ${f.replace('.next/server/app/', '')}`)
  }
} else {
  console.log('SKIP  section 11 — no .next build to read the file trace from')
}

// ---------------------------------------------------------------- report
if (failures.length) {
  for (const f of failures) console.log(`FAIL  ${f}`)
  console.log(`\nwm-blog: ${pass} passed, ${failures.length} FAILED`)
  process.exit(1)
}
console.log(`wm-blog: PASS — ${pass} checks`)
