"""Mutation harness for test/bilingual.mjs.

A guard that has never failed is not a guard. Each mutation below is a realistic
edit somebody would actually make — several of them are the exact state the tree
was in before this work — applied to the real files, with the guard run against
it. The tree is restored and every anchor re-verified afterwards.

⛔ Run this DETACHED or with a generous timeout. If it is killed between the write
and the restore, a mutated file is left on disk and every later check reads green
against broken code. That has happened in this estate before.
"""
import io
import os
import subprocess
import sys

HELPER = 'lib/hreflang.ts'
SITEMAP = 'app/sitemap.ts'
EN_HOME = 'app/page.tsx'
EN_BLOG = 'app/blog/page.tsx'

# (name, file, find, replace)
MUTATIONS = [
    # THE original bug: the English tree carries no hreflang, so the Spanish
    # tree's annotation is discarded by Google and nothing goes red.
    ('english tree loses its hreflang (the state this fixed)',
     EN_HOME, "  alternates: bilingualAlternates('/', 'en'),\n", ''),

    # es-MX excludes a Spanish speaker in McAllen, i.e. the actual audience.
    ('es-MX creeps back into the language keys',
     HELPER, "      es,\n", "      'es-MX': es,\n"),

    # x-default is what an unmatched visitor gets.
    ('x-default flipped to Spanish',
     HELPER, "      'x-default': en,\n", "      'x-default': es,\n"),

    # A page whose canonical is absent from its own alternate set is ignored.
    ('canonical stops self-referencing (always English)',
     HELPER, "    canonical: locale === 'es' ? es : en,", "    canonical: en,"),

    # Both trees collapsing to one URL is worse than no annotation.
    ('esUrl loses the /es prefix (both trees become the same page)',
     HELPER, "return `${BASE}/es${normalise(path)}`;", "return `${BASE}${normalise(path)}`;"),

    # A second source of truth. This is how the two sides drifted in the first place.
    ('a page hand-rolls its own languages map again',
     EN_BLOG, "  alternates: bilingualAlternates('/blog', 'en'),",
     "  alternates: { canonical: 'https://clearcrossprogreso.com/blog', languages: { en: 'https://clearcrossprogreso.com/blog' } },"),

    # An English-only sitemap entry: exactly the 114-vs-0 state.
    ('sitemap emits an English-only entry',
     SITEMAP, "  entries.push(...pair('/blog', { changeFrequency: 'weekly', priority: 0.8 }));",
     "  entries.push({ url: enUrl('/blog'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 });"),

    # Without per-entry alternates the static pages have no hreflang at all,
    # since they carry no metadata export.
    ('sitemap entries lose their hreflang',
     SITEMAP, "const alternates = { languages: bilingualAlternates(path, 'en').languages };",
     "const alternates = undefined as any;"),

    # A mutation aimed at the guard's OWN instrument: if the es-MX scan stops
    # stripping comments it fails on lib/hreflang.ts, whose comment explains why
    # es-MX was removed — and the tempting fix is to delete the explanation.
    ('guard self-check: the es-MX scan stops stripping comments',
     'test/bilingual.mjs',
     "  const code = src.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '').split('\\n').map((l) => l.replace(/^\\s*\\/\\/.*$/, '')).join('\\n')",
     "  const code = src"),
]


def run_guard():
    r = subprocess.run(['node', 'test/bilingual.mjs'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    # temp + replace: a direct open(p, 'w') truncates BEFORE an encode error.
    tmp = p + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8', newline='') as f:
        f.write(s)
    os.replace(tmp, p)


def main():
    baseline = run_guard()
    if baseline != 0:
        print('ABORT: baseline is already RED (exit %d). '
              'Every mutation would score a false catch.' % baseline)
        return 1

    caught = missed = 0
    for name, path, find, repl in MUTATIONS:
        src = read(path)
        n = src.count(find)
        if n != 1:
            # A mutation whose anchor does not match EXACTLY once proves nothing,
            # and a silent no-op scores as a catch. Report it as a miss.
            print('ANCHOR %d matches -- %s' % (n, name))
            missed += 1
            continue
        try:
            write(path, src.replace(find, repl, 1))
            rc = run_guard()
        finally:
            write(path, src)
        if rc != 0:
            print('caught   %s' % name)
            caught += 1
        else:
            print('MISSED   %s' % name)
            missed += 1

    final = run_guard()
    anchors_ok = all(read(p).count(f) == 1 for _, p, f, _ in MUTATIONS)
    print('\n%d caught, %d missed. tree restored: guard=%s anchors=%s'
          % (caught, missed, 'green' if final == 0 else 'RED', 'ok' if anchors_ok else 'DRIFTED'))
    return 0 if (missed == 0 and final == 0 and anchors_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
