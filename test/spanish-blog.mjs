/*
 * The Spanish blog: a translated body when one exists, an honest notice when
 * it does not, and none of the invented boilerplate that used to sit under
 * every article in both languages.
 *
 * WHAT THIS IS DEFENDING, AND WHY EACH HALF EXISTS
 *
 * 1. ⛔ A SPANISH URL MUST NOT QUIETLY SERVE ENGLISH. Fourteen /es/blog pages
 *    rendered the English body with a Spanish title on it. That is duplicate
 *    content, and to a reader it looks like a page that failed rather than an
 *    article nobody has translated. The notice and the body now read the SAME
 *    variable, so "Spanish body under an English-notice" and "English body
 *    with no notice" are both unreachable.
 *
 * 2. ⛔ THE INVENTED FIGURES ARE GONE AND MUST STAY GONE. Every post carried a
 *    "Total Savings Potential" band reading $7,350 / $3,150 / $9,280, a
 *    paragraph asserting US healthcare "risen 40%" and "27 million" uninsured,
 *    and a pull quote comparing implant prices. Nothing computed or sourced
 *    any of it. This site refuses to publish a price it cannot attribute --
 *    there is a guard for exactly that -- and then printed three of its own on
 *    fourteen live pages.
 *
 * 3. ⛔ THE REMAINING BLOCKS ARE GATED ON THE POST'S OWN TAGS. What was there
 *    before looked at nothing, so a guide about where to park rendered a
 *    dental savings calculator. Section 4 EXECUTES the shipped derivation
 *    against every real post rather than scanning for the word "topic" -- a
 *    string that exists somewhere is not a check, and this repo has shipped
 *    that mistake more than once.
 *
 * 4. ⛔ THE SPANISH TREE MUST NOT LINK INTO THE ENGLISH ONE. BlogContent is
 *    shared, so a bare href drops a Spanish reader into English on the first
 *    click. Same shape as the ProviderCard bug.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

let pass = 0
const fails = []
const chk = (cond, label) => {
  if (cond) { pass++; console.log('  ok   ' + label) }
  else { fails.push(label); console.log('  FAIL ' + label) }
}

const read = (f) => readFileSync(f, 'utf8')
const EN_DIR = 'content/blog'
const ES_DIR = join(EN_DIR, 'es')
const BLOG_LIB = 'lib/blog.ts'
const CONTENT = 'components/blog/BlogContent.tsx'
const ES_ROUTE = 'app/es/blog/[slug]/page.tsx'
const EN_ROUTE = 'app/blog/[slug]/page.tsx'
const ES_INDEX = 'app/es/blog/page.tsx'

// Comments quote the retired strings in order to explain them. A scan that
// reads them accuses its own explanation, and the tempting fix is to delete
// the explanation.
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')

const enFiles = readdirSync(EN_DIR).filter((f) => f.endsWith('.mdx'))
const esFiles = existsSync(ES_DIR) ? readdirSync(ES_DIR).filter((f) => f.endsWith('.mdx')) : []

const fm = (path) => {
  const s = read(path)
  const m = s.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!m) return null
  const out = { body: m[2] }
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1')
  }
  return out
}

console.log('')
console.log('1. the Spanish bodies are separate files, and the English index cannot see them')

chk(enFiles.length >= 14, 'control: the English corpus was found (' + enFiles.length + ' posts)')
chk(esFiles.length >= 1, 'control: at least one Spanish body exists (' + esFiles.length + ')')

// ⛔ THE FAILURE THIS CATCHES IS SILENT. getAllPosts() does readdirSync on
// content/blog and filters .mdx, so the directory entry "es" is dropped. Change
// that filter and every translation appears as an extra post on the ENGLISH
// index, in Spanish, and nothing goes red.
const libSrc = read(BLOG_LIB)
const libNoComments = stripComments(libSrc)
chk(/readdirSync\(blogsDirectory\)[\s\S]{0,200}?endsWith\('\.mdx'\)/.test(libNoComments),
  'getAllPosts still filters on .mdx, so the es/ subdirectory cannot become a post')
chk(!enFiles.includes('es'), 'control: "es" is not itself an .mdx entry')

console.log('')
console.log('2. every Spanish body belongs to a real post, and is actually Spanish')

for (const f of esFiles) {
  const slug = f.replace(/\.mdx$/, '')
  chk(enFiles.includes(f), slug + ': has an English counterpart (an orphan is a page nothing links to)')

  const es = fm(join(ES_DIR, f))
  const en = fm(join(EN_DIR, f))
  if (!es || !en) { chk(false, slug + ': both files have parseable frontmatter'); continue }

  chk(!!es.title && es.title !== en.title, slug + ': the title is translated, not the English one')
  chk(!!es.excerpt && es.excerpt !== en.excerpt, slug + ': the excerpt is translated')
  chk(es.date === en.date, slug + ': the date matches the English post')
  chk(es.tags === en.tags, slug + ': the tags match, so related-post matching still works')

  // ⛔ NOT "the bodies differ" -- changing one word satisfies that. Measure how
  // much of the English text survived. A real translation shares almost no
  // whole words with its source beyond names and numbers.
  const words = (t) => new Set(t.toLowerCase().match(/[a-zà-ÿ]{4,}/g) || [])
  const enW = words(en.body)
  const esW = words(es.body)
  const shared = [...esW].filter((w) => enW.has(w)).length
  const overlap = shared / esW.size
  chk(overlap < 0.35,
    slug + ': the body is a translation, not a copy (' + Math.round(overlap * 100) + '% of its words also appear in the English)')

  // Spanish function words the English body cannot supply.
  const marks = ['que', 'para', 'como', 'cuando', 'porque', 'pero', 'este', 'esta', 'antes', 'sobre']
  const found = marks.filter((w) => new RegExp('\\b' + w + '\\b', 'i').test(es.body)).length
  chk(found >= 4, slug + ': the body reads as Spanish (' + found + ' of ' + marks.length + ' markers)')

  // A Spanish page must not link into the English tree.
  const enLinks = [...es.body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]).filter((h) => !h.startsWith('/es'))
  chk(enLinks.length === 0,
    slug + ': every internal link stays in the Spanish tree' + (enLinks.length ? ' (found ' + enLinks.join(', ') + ')' : ''))
}

console.log('')
console.log('3. the notice and the body are one decision')

const esRoute = stripComments(read(ES_ROUTE))
// ⛔ SCOPED, NOT "the name appears somewhere". getSpanishPostBySlug is called
// TWICE in this file -- once in generateMetadata, once in the page -- so a
// check for the bare name passes while the PAGE has stopped calling it and is
// rendering English again. The mutation harness scored that as a MISS.
chk((esRoute.match(/getSpanishPostBySlug\(slug\)/g) || []).length === 2,
  'both generateMetadata and the page itself look for a Spanish body')
chk(/const es = getSpanishPostBySlug\(slug\);\s*const shown/.test(esRoute),
  'the page derives what it renders from that lookup')
chk(/const shown = es \?\? post/.test(esRoute), 'it renders the Spanish body when there is one, the English body otherwise')
chk(/\{!es && \(/.test(esRoute), 'the notice renders only when there is NO Spanish body')
chk(/<BlogContent post=\{shown\}[^>]*locale="es"/.test(esRoute), 'BlogContent gets the shown post and locale="es"')

// ⛔ BlogContent is a FULL-BLEED dark design. This route used to wrap it in
// `max-w-4xl mx-auto` on a white page, which rendered a full-viewport hero
// photograph as a narrow centred column -- so every Spanish article looked
// broken beside its English twin. No assertion could see it; it was found by
// looking at the page. The wrapper must not come back.
const afterNotice = esRoute.slice(esRoute.indexOf('<BlogContent'))
const beforeContent = esRoute.slice(esRoute.indexOf('return ('), esRoute.indexOf('<BlogContent'))
chk(beforeContent.length > 0 && afterNotice.length > 0, 'control: the render block was located')
chk(!/<BlogContent[\s\S]{0,400}?<\/div>\s*<\/div>\s*\);/.test(esRoute),
  'the article is not wrapped in a width-constraining container')
chk(!/max-w-4xl[\s\S]*?<BlogContent/.test(esRoute),
  'no max-w wrapper sits between the return and the article')
// The English route must NOT have been given the Spanish locale.
const enRoute = stripComments(read(EN_ROUTE))
chk(!/locale="es"/.test(enRoute), 'control: the English route is not passing locale="es"')

// The index prefers the translation over the hand-maintained map.
const esIndex = stripComments(read(ES_INDEX))
chk(/getSpanishPostBySlug\(p\.slug\) \?\? ES_COPY\[p\.slug\]/.test(esIndex),
  'the Spanish index prefers a real translation over the hand-written ES_COPY map')

console.log('')
console.log('4. the boilerplate is gated on the post, and the invented figures are gone')

const contentSrc = read(CONTENT)
const contentCode = stripComments(contentSrc)

// The retired figures and statistics. Each one was live on all 14 posts.
const RETIRED = [
  ['7,350', 'the invented "Dental Tourist" savings figure'],
  ['3,150', 'the invented "Pharmacy Runner" savings figure'],
  ['9,280', 'the invented "Full Makeover" savings figure'],
  ['Total Savings Potential', 'the savings band heading'],
  ['risen 40%', 'the unsourced US healthcare inflation statistic'],
  ['27 million', 'the unsourced uninsured statistic'],
  ['Why This Matters', 'the block that carried both statistics'],
  ['full mouth of work', 'the unsourced implant price comparison'],
]
for (const [needle, what] of RETIRED) {
  chk(!contentCode.includes(needle), 'gone from the rendered component: ' + what)
}
// CONTROL: the scan can see the file at all, and the comment explaining the
// removal is allowed to name them.
chk(contentCode.includes('compareHeading'), 'control: the scan is reading the real component')
chk(contentSrc.includes('7,350'), 'control: the comment recording the removal still names the figure')

// ⛔ EXECUTED, NOT SCANNED. Lift the shipped TOPICS array and the shipped
// derivation and run them against every real post's tags. A scan for the word
// "topic" passes against a component that ignores it.
const topicsSrc = contentSrc.match(/const TOPICS = (\[[\s\S]*?\]) as const/)
chk(!!topicsSrc, 'control: the TOPICS table was lifted out of the component')
if (topicsSrc) {
  const TOPICS = new Function('return ' + topicsSrc[1])()
  const topicFor = (tags) => TOPICS.find((x) => tags.includes(x.tag)) ?? null

  chk(/const topic = TOPICS\.find\(\(x\) => post\.tags\.includes\(x\.tag\)\) \?\? null/.test(contentCode),
    'the component derives the topic from the post it was given')

  let gated = 0
  for (const f of enFiles) {
    const p = fm(join(EN_DIR, f))
    const tags = JSON.parse((p.tags || '[]').replace(/'/g, '"'))
    const t = topicFor(tags)
    const isGuide = !tags.some((x) => ['dental', 'pharmacy', 'cosmetic'].includes(x))
    if (isGuide) {
      gated++
      chk(t === null, f.replace(/\.mdx$/, '') + ': a post with no clinical tag gets no band')
    } else {
      chk(t !== null, f.replace(/\.mdx$/, '') + ': a clinical post gets its own band (' + t?.key + ')')
    }
  }
  chk(gated >= 4, 'control: at least four posts exercise the no-band branch (' + gated + ')')

  chk(/\{topic && \(/.test(contentCode), 'the band renders only when the post has a topic')
  chk(/\{topic\?\.key === 'dental' && \(/.test(contentCode), 'the dental checklist is gated on the dental topic')
  chk(/\{topic\?\.key === 'pharmacy' && \(/.test(contentCode), 'the pharmacy checklist is gated on the pharmacy topic')

  // ⛔ The topic labels live in TOPICS, not COPY, so section 5's "every
  // string is translated" sweep cannot see them. Without this the band's own
  // button stays English on the Spanish page and nothing notices.
  chk(/\{locale === 'es' \? topic\.es : topic\.en\}/.test(contentCode),
    'the topic button label follows the locale')
  const untranslated = TOPICS.filter((x) => x.en === x.es)
  chk(untranslated.length === 0,
    'every topic label is actually translated' + (untranslated.length ? ' (' + untranslated.map((x) => x.key).join(', ') + ')' : ''))
}

console.log('')
console.log('5. the shared component speaks the language it was handed')

const copySrc = contentSrc.match(/const COPY = (\{[\s\S]*?\}) as const/)
chk(!!copySrc, 'control: the COPY table was lifted out of the component')
if (copySrc) {
  const COPY = new Function('return ' + copySrc[1])()
  const en = Object.keys(COPY.en).sort()
  const es = Object.keys(COPY.es).sort()
  chk(en.length >= 12, 'control: the table carries real copy (' + en.length + ' keys)')
  chk(JSON.stringify(en) === JSON.stringify(es), 'both languages carry the same keys')
  const same = en.filter((k) => JSON.stringify(COPY.en[k]) === JSON.stringify(COPY.es[k]))
  chk(same.length === 0, 'every string is actually translated' + (same.length ? ' (identical: ' + same.join(', ') + ')' : ''))
}

chk(/toLocaleDateString\(locale === 'es' \? 'es' : 'en-US'/.test(contentCode),
  'the date follows the locale')
// ⛔ timeZone UTC. An ISO date is UTC midnight; formatting it locally renders
// the previous day for every reader west of UTC, which is every reader here.
chk(/timeZone: 'UTC'/.test(contentCode), 'the date is still formatted in UTC')
chk(!/'es-MX'/.test(contentCode), 'the date tag is es, not es-MX (test/bilingual.mjs bans es-MX)')

// Links must not leave the Spanish tree.
const hrefs = [...contentCode.matchAll(/href=\{?["`]?(\/[a-z0-9\-/${}.`]*)/g)].map((m) => m[1])
const bare = hrefs.filter((h) => !h.startsWith('/es'))
chk(bare.length === 0,
  'every internal href goes through localizedPath' + (bare.length ? ' (bare: ' + [...new Set(bare)].join(', ') + ')' : ''))
chk((contentCode.match(/localizedPath\(/g) || []).length >= 4,
  'localizedPath is used on every link that can leave the page')

console.log('')
console.log('6. the readers refuse a slug they did not generate')

chk(/const SAFE_SLUG = /.test(libNoComments), 'a slug pattern exists')
chk((libNoComments.match(/if \(!SAFE_SLUG\.test\(slug\)\) return null;/g) || []).length === 2,
  'BOTH readers validate the slug, not just the new one')

console.log('')
if (fails.length) {
  console.log('FAIL - ' + fails.length + ' of ' + (pass + fails.length))
  for (const f of fails) console.log('  - ' + f)
  process.exit(1)
}
console.log('PASS - ' + pass + ' checks. The Spanish blog says what it is.')
