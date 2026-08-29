"""Mutation harness for test/measurement.mjs.

A guard that has never failed is not a guard. Each mutation below is a realistic
edit somebody would actually make, applied to the real tree, with the guard run
against it. The tree is restored and re-verified by anchor afterwards.

⛔ Run this DETACHED or with a generous timeout. If it is killed between the write
and the restore, a mutated file is left on disk and every later check reads green
against broken code.
"""
import io
import os
import subprocess
import sys

LAYOUT = 'app/layout.tsx'
GA = 'components/analytics/GoogleAnalytics.tsx'

# (name, file, find, replace)
MUTATIONS = [
    ('analytics unmounted (a refactor drops the tag)',
     LAYOUT, '        <Analytics />\n', ''),
    ('speed insights unmounted',
     LAYOUT, '        <SpeedInsights />\n', ''),
    ('GA component unmounted',
     LAYOUT, '        <GoogleAnalytics />\n', ''),
    ('the inert branch is deleted (fires at G-undefined)',
     GA, '  if (!gaId) return null\n', ''),
    ('id hardcoded instead of read from env',
     GA, "const gaId = process.env.NEXT_PUBLIC_GA_ID",
         "const gaId = 'G-ABC123XYZ'"),
    ('useSearchParams added to "also capture query params"',
     GA, "import { usePathname } from 'next/navigation'",
         "import { usePathname, useSearchParams } from 'next/navigation'"),
    ('verification hardcoded instead of env-gated',
     LAYOUT, 'process.env.GOOGLE_SITE_VERIFICATION && {',
             'true && {'),
    # A mutation aimed at the guard's own instrument: if the comment stripper
    # stops being string-aware it truncates at the gtag URL, and every check
    # downstream becomes meaningless. The controls must catch that.
    ('stripper loses string-awareness (guard self-check)',
     'test/measurement.mjs',
     "if (c === '\"' || c === \"'\" || c === '`') { quote = c; out += c; i++; continue }",
     "if (false) { quote = c; out += c; i++; continue }"),
]


def run_guard():
    r = subprocess.run([sys.executable and 'node', 'test/measurement.mjs'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    tmp = p + '.tmp'
    io.open(tmp, 'w', encoding='utf-8', newline='').write(s)
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
        if src.count(find) != 1:
            print('ANCHOR NOT FOUND (%d matches) -- %s' % (src.count(find), name))
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

    # Restore proof: the guard must be green again, and every anchor back in place.
    final = run_guard()
    anchors_ok = all(read(p).count(f) == 1 for _, p, f, _ in MUTATIONS)
    print('\n%d caught, %d missed. tree restored: guard=%s anchors=%s'
          % (caught, missed, 'green' if final == 0 else 'RED', 'ok' if anchors_ok else 'DRIFTED'))
    return 0 if (missed == 0 and final == 0 and anchors_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
