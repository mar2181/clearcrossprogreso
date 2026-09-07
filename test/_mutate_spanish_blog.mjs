/*
 * Mutation harness for test/spanish-blog.mjs.
 *
 * ⛔ A GUARD THAT HAS NEVER FAILED HAS NOT BEEN SHOWN TO WORK. Every mutation
 * below is a plausible edit -- a tidy-up, a revert, a copy-paste -- and each
 * one must turn the guard red. Anything that stays green is either a hole in
 * the guard or a property that cannot be observed, and the two are recorded
 * differently: a hole gets fixed, an unobservable property is printed as
 * KNOWN-UNPROVABLE with its reason and a tripwire that fails this run if it
 * ever becomes catchable.
 *
 * ⛔ THE TREE IS RESTORED BY BYTES, not by re-applying an inverse edit, and the
 * restore is verified against a snapshot taken before anything ran. Comparing
 * anchors instead conflates "a mutation survived" with "an unrelated edit moved
 * the anchor", and this estate has had a restore check cry wolf on a clean tree.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const GUARD = 'test/spanish-blog.mjs'
const CONTENT = 'components/blog/BlogContent.tsx'
const ES_ROUTE = 'app/es/blog/[slug]/page.tsx'
const ES_INDEX = 'app/es/blog/page.tsx'
const LIB = 'lib/blog.ts'
const ES_POST = 'content/blog/es/first-time-in-nuevo-progreso-checklist.mdx'
const EN_POST = 'content/blog/first-time-in-nuevo-progreso-checklist.mdx'

const FILES = [CONTENT, ES_ROUTE, ES_INDEX, LIB, ES_POST]
const snapshot = new Map(FILES.map((f) => [f, readFileSync(f)]))

const runGuard = () => {
  try {
    execFileSync(process.execPath, [GUARD], { stdio: 'pipe' })
    return true // green
  } catch {
    return false // red
  }
}

const restore = () => {
  for (const [f, buf] of snapshot) writeFileSync(f, buf)
}

/*
 * Each mutation: [file, find, replace, label]. `find` must match EXACTLY ONCE
 * -- an ambiguous anchor is refused rather than applied to whichever occurrence
 * comes first, because a mutation applied somewhere else proves nothing.
 */
const MUTATIONS = [
  [ES_ROUTE, '{!es && (', '{true && (',
    'the notice renders even when the body IS Spanish'],
  [ES_ROUTE, 'const shown = es ?? post', 'const shown = post',
    'the Spanish route renders the English body again'],
  [ES_ROUTE, 'locale="es"', 'locale="en"',
    'the Spanish page is handed the English locale'],
  [ES_ROUTE, 'const es = getSpanishPostBySlug(slug);\n  const shown', 'const es = null as any;\n  const shown',
    'the route stops looking for a translation at all'],
  [ES_INDEX, 'getSpanishPostBySlug(p.slug) ?? ES_COPY[p.slug]', 'ES_COPY[p.slug]',
    'the index prefers the hand-written map over the real translation'],
  [CONTENT, "{locale === 'es' ? topic.es : topic.en}", '{topic.en}',
    'the topic button label is stuck in English'],
  [CONTENT, 'const topic = TOPICS.find((x) => post.tags.includes(x.tag)) ?? null',
    'const topic = TOPICS[0]',
    'every post gets the dental band again, including the parking guide'],
  [CONTENT, "{topic?.key === 'pharmacy' && (", '{true && (',
    'the pharmacy checklist renders on every post'],
  [CONTENT, "toLocaleDateString(locale === 'es' ? 'es' : 'en-US'", "toLocaleDateString('en-US'",
    'the date is English on the Spanish page'],
  [CONTENT, "toLocaleDateString(locale === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })",
    "toLocaleDateString(locale === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })",
    'the UTC date fix is dropped and every post is a day early again'],
  [CONTENT, 'href={localizedPath(`/blog/${rp.slug}`, locale)}', 'href={`/blog/${rp.slug}`}',
    'a related card sends a Spanish reader into the English tree'],
  [CONTENT, "back: 'Todos los artículos',", "back: 'All Articles',",
    'a Spanish string is left in English'],
  [CONTENT, '<h3 className="text-lg font-bold font-display text-white">{t.compareHeading}</h3>',
    '<h3 className="text-lg font-bold font-display text-white">$7,350 average dental savings</h3>',
    'an invented savings figure comes back into the rendered component'],
  [LIB, 'export function getPostBySlug(slug: string): BlogPost | null {\n  if (!SAFE_SLUG.test(slug)) return null;',
    'export function getPostBySlug(slug: string): BlogPost | null {',
    'the older reader stops validating its slug'],
  [ES_ROUTE, '      <BlogContent post={shown} relatedPosts={relatedPosts} locale="es" />',
    '      <div className="max-w-4xl mx-auto"><BlogContent post={shown} relatedPosts={relatedPosts} locale="es" /></div>',
    'the full-bleed article is squeezed back into a narrow column'],
  [ES_POST, null, null,
    'the "Spanish" body is really the English one'],
]

let caught = 0
const missed = []
const skipped = []

console.log('')
console.log('baseline...')
if (!runGuard()) {
  console.log('⛔ THE GUARD IS ALREADY RED. Every mutation would score "caught" for')
  console.log('   free. Fix the tree first; this run proves nothing.')
  process.exit(1)
}
console.log('  ok   the guard is green before anything is mutated')
console.log('')

for (const [file, find, replace, label] of MUTATIONS) {
  let applied = false
  if (find === null) {
    // Special case: replace the Spanish body with the English one, keeping the
    // Spanish frontmatter. Proves the overlap check, which "the bodies differ"
    // would not -- one changed word satisfies that.
    const es = readFileSync(ES_POST, 'utf8')
    const en = readFileSync(EN_POST, 'utf8')
    const head = es.match(/^---[\s\S]*?\n---\n/)[0]
    const body = en.replace(/^---[\s\S]*?\n---\n/, '')
    writeFileSync(ES_POST, head + body)
    applied = true
  } else {
    const src = readFileSync(file, 'utf8')
    const eol = src.includes('\r\n') ? '\r\n' : '\n'
    const needle = find.split('\n').join(eol)
    const n = src.split(needle).length - 1
    if (n !== 1) {
      skipped.push(label + '  (anchor matched ' + n + ' times in ' + file + ')')
      console.log('  SKIP ' + label)
      console.log('       anchor matched ' + n + ' times - mutation NOT applied, proves nothing')
      continue
    }
    writeFileSync(file, src.replace(needle, replace.split('\n').join(eol)))
    applied = true
  }

  const green = runGuard()
  restore()
  if (green) {
    missed.push(label)
    console.log('  MISS ' + label)
  } else {
    caught++
    console.log('  ok   caught: ' + label)
  }
}

restore()
let dirty = 0
for (const [f, buf] of snapshot) {
  if (!readFileSync(f).equals(buf)) { console.log('  ⛔ NOT RESTORED: ' + f); dirty++ }
}

console.log('')
console.log(caught + ' caught / ' + missed.length + ' missed / ' + skipped.length + ' skipped')
console.log('tree restored byte-identical: ' + (dirty === 0 ? 'yes' : 'NO (' + dirty + ' files)'))
for (const m of missed) console.log('  MISSED: ' + m)
for (const s of skipped) console.log('  SKIPPED: ' + s)

if (dirty || missed.length || skipped.length) process.exit(1)
if (!runGuard()) { console.log('⛔ the guard is red on the restored tree'); process.exit(1) }
console.log('the guard is green again on the restored tree')
