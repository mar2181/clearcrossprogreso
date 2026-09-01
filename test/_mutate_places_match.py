#!/usr/bin/env python3
"""
Mutation harness for test/places-match.mjs.

A guard that passes on its first run has proved nothing. Each mutation below is
a realistic edit -- the kind someone makes to raise the match rate when 41 of
104 providers come back unmatched and the pressure is to "just get the pages
live". Every one of them, shipped, would put a Google-cited verification badge
on a business nobody checked.

Run:  python test/_mutate_places_match.py
"""
import io, os, subprocess, sys

SRC = os.path.join('tools', 'verify', 'places-match.mjs')
GUARD = os.path.join('test', 'places-match.mjs')

# (label, anchor, replacement)
MUTATIONS = [
    (
        'locality gate deleted -- any candidate anywhere is accepted',
        "  const local = candidates.filter(\n"
        "    (c) => inNuevoProgreso(c.formattedAddress) && withinNuevoProgreso(c.location),\n"
        "  );",
        "  const local = candidates;",
    ),
    (
        'town/postcode requirement deleted -- the gate stops naming the town at all',
        "  if (!named && !postcoded) return false;",
        "  // locality requirement removed",
    ),
    (
        # The realistic loosening: someone chasing the remaining false negatives
        # decides "any Tamaulipas postcode is close enough". It is not -- it
        # readmits Reynosa (88630) and Río Bravo city (88959), both of which are
        # real addresses this guard already holds.
        'postcode arm widened to any 88xxx -- Reynosa and Rio Bravo city get in',
        "  const postcoded = new RegExp('\\\\b' + NP_POSTCODE + '\\\\b').test(a);",
        "  const postcoded = /\\b88\\d{3}\\b/.test(a);",
    ),
    (
        'coordinate gate dropped -- a corrupt address carrying 88810 is accepted',
        "    (c) => inNuevoProgreso(c.formattedAddress) && withinNuevoProgreso(c.location),",
        "    (c) => inNuevoProgreso(c.formattedAddress),",
    ),
    (
        'coordinate box widened to the whole region -- Reynosa and Weslaco fit',
        "export const NP_BOUNDS = { minLat: 26.03, maxLat: 26.09, minLng: -97.99, maxLng: -97.92 };",
        "export const NP_BOUNDS = { minLat: 25.5, maxLat: 26.5, minLng: -98.5, maxLng: -97.5 };",
    ),
    (
        'a missing coordinate is treated as being outside -- real matches lost',
        "    return true;\n  }\n  const { latitude: la, longitude: ln } = location;",
        "    return false;\n  }\n  const { latitude: la, longitude: ln } = location;",
    ),
    (
        'locality gate drops the state check -- Guatemala/Hidalgo get through',
        "  if (!/\\btamps\\b|\\btamaulipas\\b/.test(a)) return false;",
        "  // state check removed",
    ),
    (
        'threshold lowered to 0.3 to raise the match rate',
        "export const NAME_THRESHOLD = 0.6;",
        "export const NAME_THRESHOLD = 0.3;",
    ),
    (
        'threshold lowered to 0.1',
        "export const NAME_THRESHOLD = 0.6;",
        "export const NAME_THRESHOLD = 0.1;",
    ),
    (
        'generic-word list emptied -- shared words like "pharmacy" start counting',
        "  return tokens(s).filter((t) => t.length > 1 && !GENERIC.has(t));",
        "  return tokens(s).filter((t) => t.length > 1);",
    ),
    (
        'similarity computed on the WHOLE name, not the distinctive part '
        '(American Pharmacy vs Linda Pharmacy)',
        "  const a = distinctive(ourName).join('');\n  const b = distinctive(theirName).join('');",
        "  const a = normalize(ourName).replace(/ /g, '');\n  const b = normalize(theirName).replace(/ /g, '');",
    ),
    (
        'a name with nothing distinctive scores 1 instead of 0',
        "  if (ours.length === 0) return 0;   // nothing distinctive -> cannot be matched",
        "  if (ours.length === 0) return 1;",
    ),
    (
        'permanently-closed businesses are published',
        "  if (best.c.businessStatus === 'CLOSED_PERMANENTLY') {",
        "  if (false && best.c.businessStatus === 'CLOSED_PERMANENTLY') {",
    ),
    (
        'a rejected candidate is handed back anyway, so a caller can use it',
        "      reason: 'name-mismatch',\n      score: best.score,\n      detail: best.c.displayName?.text,",
        "      reason: 'name-mismatch',\n      score: best.score,\n      place: best.c,\n      detail: best.c.displayName?.text,",
    ),
]


# Mutations recorded as UNPROVABLE, with the reason, rather than dressed up as
# passes or left as a permanent MISSED that people learn to scroll past.
#
# The harness FAILS if one of these ever becomes provable -- that means the note
# below has gone stale and the reasoning needs re-reading, which is exactly the
# moment nobody would otherwise notice.
KNOWN_SAFE = [
    (
        'US rejection removed -- defence in depth, redundant given town+state',
        "  if (/\\busa\\b|\\btx\\b|\\btexas\\b/.test(a)) return false;",
        "  // rejection removed",
        # The Weslaco address that motivated this line -- "1919 US, E Expressway
        # 83 Ste 200, Weslaco, TX 78596, USA" -- is already rejected twice over:
        # it contains neither "nuevo progreso" nor "tamaulipas". For this line to
        # be load-bearing a formattedAddress would have to name the Mexican town
        # AND the Mexican state AND sit in the United States, which Places does
        # not produce. It stays because it costs nothing and closes the case if
        # Places ever changes how it renders border addresses -- but it is
        # honestly unprovable today, and pretending otherwise would mean writing
        # a test that asserts a coincidence.
        'requires an address naming Nuevo Progreso AND Tamaulipas AND the USA',
    ),
]


def run_guard():
    r = subprocess.run([node(), GUARD], capture_output=True, text=True)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def node():
    return 'node'


def main():
    original = io.open(SRC, encoding='utf-8').read()

    # A harness whose baseline is already red scores every mutation as "caught"
    # for free. Prove green first.
    code, out = run_guard()
    if code != 0:
        print('BASELINE IS RED -- every mutation would score as caught. Aborting.')
        print(out)
        return 1
    print('baseline green\n')

    caught = missed = skipped = 0
    try:
        for label, anchor, replacement in MUTATIONS:
            n = original.count(anchor)
            if n != 1:
                print('SKIP    anchor matched %d times (proves nothing): %s' % (n, label))
                skipped += 1
                continue
            mutated = original.replace(anchor, replacement)
            tmp = SRC + '.tmp'
            io.open(tmp, 'w', encoding='utf-8', newline='').write(mutated)
            os.replace(tmp, SRC)
            code, _ = run_guard()
            if code != 0:
                print('caught  %s' % label)
                caught += 1
            else:
                print('MISSED  %s' % label)
                missed += 1
        # Known-safe layers: assert they are still unprovable. If one starts
        # being caught, the recorded reasoning is stale and must be re-read.
        for label, anchor, replacement, why in KNOWN_SAFE:
            n = original.count(anchor)
            if n != 1:
                print('SKIP    known-safe anchor matched %d times: %s' % (n, label))
                skipped += 1
                continue
            tmp = SRC + '.tmp'
            io.open(tmp, 'w', encoding='utf-8', newline='').write(
                original.replace(anchor, replacement))
            os.replace(tmp, SRC)
            code, _ = run_guard()
            if code == 0:
                print('known-safe (unprovable: %s)\n        %s' % (why, label))
            else:
                print('NOW PROVABLE -- the recorded reason is stale: %s' % label)
                missed += 1
    finally:
        tmp = SRC + '.tmp'
        io.open(tmp, 'w', encoding='utf-8', newline='').write(original)
        os.replace(tmp, SRC)

    # Verify the tree really is restored -- a killed run can leave a mutation on
    # disk, after which every later check reads green against broken code.
    restored = io.open(SRC, encoding='utf-8').read()
    if restored != original:
        print('\nTREE NOT RESTORED -- fix before trusting anything.')
        return 1
    code, _ = run_guard()
    if code != 0:
        print('\nrestored tree is RED -- something else broke.')
        return 1

    print('\n%d caught, %d missed, %d skipped -- tree restored and green'
          % (caught, missed, skipped))
    return 1 if (missed or skipped) else 0


if __name__ == '__main__':
    sys.exit(main())
