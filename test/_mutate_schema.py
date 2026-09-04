#!/usr/bin/env python3
"""
Mutation harness for test/schema.mjs.

A guard that passes on its first run has proved nothing -- and this one passed
1804 checks first time, which is exactly when to distrust it.

Every mutation below is a realistic edit. Most are the shape of "make the markup
richer" or "simplify this": emit the list price instead of the discounted one,
reuse the rating column that is already sitting in the database, collapse eight
schema types into one LocalBusiness. Each of them, shipped, would put a figure in
front of Google that the page does not show -- which is the violation this site
has already committed once, with an aggregateRating of 4.2/27 above a panel
reading "No reviews yet".

⛔ MULTI-FILE ON PURPOSE. The price logic lives in lib/pricing.ts and the markup
in lib/schema.ts. A harness with a single FILE constant would leave every
pricing mutation unapplied and still print a clean score.

⛔ SLOW BY NECESSITY. The guard reads the prerendered HTML, so each mutation
needs a real `next build` (~45s). That is the price of testing the artifact
rather than the function, and the artifact is the only thing that can catch
drift between the markup and the page.

Run:  python test/_mutate_schema.py
"""
import io, os, subprocess, sys, time

PRICING = os.path.join('lib', 'pricing.ts')
SCHEMA = os.path.join('lib', 'schema.ts')
GUARD = os.path.join('test', 'schema.mjs')

# (label, file, anchor, replacement)
MUTATIONS = [
    (
        # ⛔ THE LINK, NOT THE SHARED FUNCTION. Mutating effectivePrice()
        # moves the table AND the markup together, so they still agree and the
        # guard is right to stay green -- that is the whole point of one source
        # of truth. The realistic regression is somebody "simplifying" the
        # schema builder to read the raw column, which is what this does.
        # The first version of this inlined an object literal with no
        # wasAmount/validUntil, so later property reads failed typecheck and it
        # was correctly scored SKIP -- a mutation that cannot build proves
        # nothing. This breaks the same link and is a likelier slip anyway: the
        # builder simply forgets to pass the live discount through.
        'the schema builder forgets to pass the flash discount to effectivePrice',
        SCHEMA,
        "  const offers = priceOffers(prices, flashDiscount);",
        "  const offers = priceOffers(prices, null);",
    ),
    (
        # Caught by the Free-row floor, not by consistency: this moves both
        # sides, so every figure still matches -- there are simply no Free rows
        # left anywhere on the site.
        'a Free row is priced at 99 instead of 0',
        PRICING,
        "  if (base === 0) return { amount: 0 };",
        "  if (base === 0) return { amount: 99 };",
    ),
    (
        # Same shape as the discount case: a discount that computes to zero
        # renders the same figure twice, in the table and in the markup.
        'the discount arithmetic returns the list price, so nothing is discounted',
        PRICING,
        "  if (flash.discount_type === 'percentage') {\n    return Math.round(price * (1 - flash.discount_value / 100) * 100) / 100;\n  }\n  return Math.max(0, price - flash.discount_value);",
        "  return price;",
    ),
    (
        'every business collapses to a generic LocalBusiness',
        SCHEMA,
        "    '@type': CATEGORY_SCHEMA_TYPE[category] || 'LocalBusiness',",
        "    '@type': 'LocalBusiness',",
    ),
    (
        # ⛔ Again the LINK. Editing CATEGORY_LABEL_PLURAL moves the visible
        # trail too, because the page reads the same map -- which is the design.
        # The realistic error is the markup reaching for the wrong map.
        'the BreadcrumbList uses the singular label while the trail shows plural',
        SCHEMA,
        "        name: CATEGORY_LABEL_PLURAL[category] || category,",
        "        name: CATEGORY_LABEL[category] || category,",
    ),
    (
        'priceValidUntil is stamped on every Offer, discounted or not',
        SCHEMA,
        "    if (priced.validUntil) offer.priceValidUntil = priced.validUntil;",
        "    offer.priceValidUntil = priced.validUntil || '2027-01-01';",
    ),
    (
        'the price catalogue is dropped from the markup entirely',
        SCHEMA,
        "  if (offers.length > 0) {\n    business.hasOfferCatalog = {",
        "  if (false) {\n    business.hasOfferCatalog = {",
    ),
    (
        'lat and lng are swapped, putting every provider in the wrong hemisphere',
        SCHEMA,
        "    business.geo = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng };",
        "    business.geo = { '@type': 'GeoCoordinates', latitude: lng, longitude: lat };",
    ),
]

# Mutations recorded as UNPROVABLE, with the measured reason, rather than left as
# a permanent MISSED that people learn to scroll past.
#
# The harness FAILS if one becomes provable -- that means the data changed and
# the reasoning below has gone stale, which is precisely when nobody would
# otherwise notice.
KNOWN_SAFE = [
    (
        'aggregateRating is taken from the SEEDED avg_rating column',
        SCHEMA,
        """  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
    };
  }""",
        """  const seeded = (provider as { avg_rating?: number; review_count?: number });
  if (seeded.avg_rating && seeded.avg_rating > 0) {
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(seeded.avg_rating),
      reviewCount: seeded.review_count || 1,
    };
  }""",
        'measured on this build: ZERO of 104 provider pages render a star row, so '
        'avg_rating is null on every provider and there is no seeded value for the '
        'mutation to read. The gate stays because the column still exists and a '
        'single backfilled rating would make it load-bearing again. NOTE: this '
        'also retires the standing "60 providers carry a seeded avg_rating" item.',
    ),
    (
        'an Offer is invented for a procedure the page prices as "Request a quote"',
        PRICING,
        "  if (base === null || base === undefined) return null;",
        "  if (base === null || base === undefined) return { amount: 1 };",
        'measured on this build: 312 of 312 rendered rows carry a price and ZERO '
        'render a quote link, so there is no null price for the mutation to '
        'invent. The check stays because the null path is real in the schema and '
        'one unpriced row would make it load-bearing again.',
    ),
]


def run(cmd):
    # errors='replace': the Next build output carries a byte cp1252 cannot
    # decode, which crashed subprocess's reader thread on every single run of
    # the first version. Verdicts survived (the returncode is separate) but a
    # real build failure would have been unreadable.
    return subprocess.run(cmd, shell=True, capture_output=True, text=True,
                          encoding='utf-8', errors='replace')


def build_and_guard():
    b = run('npx next build')
    if b.returncode != 0:
        return 'BUILD_FAILED', (b.stdout or '') + (b.stderr or '')
    g = run('node ' + GUARD)
    return ('PASS' if g.returncode == 0 else 'FAIL'), (g.stdout or '') + (g.stderr or '')


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    tmp = p + '.tmp'
    io.open(tmp, 'w', encoding='utf-8', newline='').write(s)
    os.replace(tmp, p)


def main():
    # Optional substring filter: `python test/_mutate_schema.py discount` runs
    # only the mutations whose label matches. Each mutation costs a full
    # `next build`, so re-proving one after a fix should not cost twelve.
    only = sys.argv[1].lower() if len(sys.argv) > 1 else None
    originals = {PRICING: read(PRICING), SCHEMA: read(SCHEMA)}

    # A harness whose baseline is already red scores every mutation as "caught"
    # for free. Prove green first.
    t0 = time.time()
    verdict, out = build_and_guard()
    if verdict != 'PASS':
        print('BASELINE IS NOT GREEN (%s) -- every mutation would score as caught.' % verdict)
        print(out[-2000:])
        return 1
    print('baseline green (%.0fs)\n' % (time.time() - t0))

    caught = missed = skipped = 0
    try:
        for label, path_, anchor, repl in MUTATIONS:
            if only and only not in label.lower():
                continue
            src = originals[path_]
            n = src.count(anchor)
            if n != 1:
                print('SKIP    anchor matched %d times (proves nothing): %s' % (n, label))
                skipped += 1
                continue
            write(path_, src.replace(anchor, repl))
            verdict, out = build_and_guard()
            write(path_, src)
            if verdict == 'BUILD_FAILED':
                print('SKIP    mutation does not compile (proves nothing): %s' % label)
                skipped += 1
            elif verdict == 'FAIL':
                first = next((l for l in out.splitlines() if l.startswith('FAIL')), '')
                print('caught  %s\n          %s' % (label, first[:150]))
                caught += 1
            else:
                print('MISSED  %s' % label)
                missed += 1

        for label, path_, anchor, repl, why in KNOWN_SAFE:
            if only and only not in label.lower():
                continue
            src = originals[path_]
            n = src.count(anchor)
            if n != 1:
                print('SKIP    known-safe anchor matched %d times: %s' % (n, label))
                skipped += 1
                continue
            write(path_, src.replace(anchor, repl))
            verdict, _ = build_and_guard()
            write(path_, src)
            if verdict == 'PASS':
                print('known-safe  %s\n            (unprovable: %s)' % (label, why))
            else:
                print('NOW PROVABLE -- the recorded reason is stale: %s' % label)
                missed += 1
    finally:
        for p, s in originals.items():
            write(p, s)

    # A killed run can leave a mutation on disk, after which every later check
    # reads green against broken code. Verify the tree, not the intention.
    for p, s in originals.items():
        if read(p) != s:
            print('\nTREE NOT RESTORED (%s) -- fix before trusting anything.' % p)
            return 1
    verdict, out = build_and_guard()
    if verdict != 'PASS':
        print('\nrestored tree is NOT green (%s) -- something else broke.' % verdict)
        print(out[-1500:])
        return 1

    scope = (' [FILTERED on "%s" -- NOT a full run]' % only) if only else ''
    print('\n%d caught, %d missed, %d skipped -- tree restored and green%s'
          % (caught, missed, skipped, scope))
    return 1 if (missed or skipped) else 0


if __name__ == '__main__':
    sys.exit(main())
