"""Mutation harness for test/honest-claims.mjs.

A guard that has never failed is not a guard. Every mutation below restores a
claim that was live in production until 2026-08-30.

The last four are the ones that matter most: they attack the guard's own
CONTROL. Section 5 asserts that honest advice using the same vocabulary
survived, and a deny-list that is too broad would delete it. If any of those
four is MISSED, the guard is free to eat the useful half of the page while
reporting green.

Run DETACHED or with a generous timeout. Killed between the write and the
restore, it leaves a mutated file on disk and every later check reads green
against broken code.
"""
import io
import os
import subprocess
import sys

EN = 'lib/i18n/dictionaries/en.ts'
ES = 'lib/i18n/dictionaries/es.ts'
PROV = 'app/[category]/[provider]/page.tsx'
FEAT = 'components/home/FeaturedProviders.tsx'
PRICE = 'components/providers/PriceTable.tsx'
SOCIAL = 'components/home/SocialProofBar.tsx'

TIP = ('ClearCross lists this provider and has checked the listing details. '
       'We have not inspected the clinic or checked professional licences - '
       'ask to see the Cedula Profesional at your appointment.')

MUTATIONS = [
    # -- Class A: the sterilization claim comes back ---------------------
    ('the provider-page tooltip claims we checked sterilization',
     PROV, 'title="' + TIP + '"',
     'title="Cedula Profesional verified. Credentials current as of 2026. '
     'Clinic conditions and sterilization protocols checked by ClearCross."'),

    ('the featured-card tooltip claims we checked sterilization',
     FEAT, 'title="' + TIP + '"',
     'title="Cedula Profesional verified. Clinic conditions and '
     'sterilization protocols checked."'),

    ('the badge sub-line claims credentials were checked by ClearCross',
     PROV, 'Listing details checked. Clinic and licences not inspected.',
     'Credentials checked by ClearCross'),

    ('the English advantage copy claims we check clinic conditions',
     EN, 'ClearCross does not inspect clinics or verify licences',
     'We check credentials, clinic conditions, and sterilization protocols'),

    ('the Spanish advantage copy claims we inspect consultorios',
     ES, 'ClearCross no inspecciona consultorios ni verifica licencias',
     'Revisamos credenciales, condiciones del consultorio y protocolos de '
     'esterilizacion'),

    # -- Class B: the price guarantee comes back -------------------------
    ('the price table guarantees the price on the provider behalf',
     PRICE,
     'These are the prices the provider gave ClearCross. Ask for a written '
     'quote before any work begins, and take it with you.',
     'Prices listed here are final and guaranteed. Providers agree that '
     'quoted prices will not change upon arrival.'),

    ('the English quote copy calls a quote binding',
     EN, 'A quote comes from the provider, not from ClearCross.',
     'Our quotes are guaranteed and binding once accepted.'),

    ('the Spanish quote copy calls a quote binding',
     ES, 'La cotizacion viene del proveedor, no de ClearCross.'.replace(
         'cotizacion', 'cotización'),
     'Nuestras cotizaciones son garantizadas y vinculantes una vez aceptadas.'),

    # -- Class C: an invented customer comes back ------------------------
    ('an invented customer is added back to the en dictionary',
     EN, "  socialProof: {",
     "  testimonials: {\r\n"
     "    t1Name: 'Robert M.',\r\n"
     "    t1Location: 'San Antonio, TX',\r\n"
     "    t1Text: 'I saved thousands. Incredible.',\r\n"
     "  },\r\n"
     "  socialProof: {"),

    # -- Class D: a counter goes back to being typed ---------------------
    ('the Americans-served counter is hardcoded again',
     SOCIAL, "      value: String(providerCount),",
     "      value: '10,000',"),

    # The FIRST version of this mutation renamed SocialProofBarProps, and was
    # MISSED -- correctly. Removing the props entirely is a TypeScript error
    # (both call sites pass them), so the type system already defends that
    # direction and a source guard adding a second opinion proves nothing.
    # The realistic regression that COMPILES is someone hardcoding one of the
    # two numbers back while leaving the props in place, so that is what this
    # mutates now. It attacks the price counter; #10 attacks the provider one.
    ('the price counter is hardcoded back over the real one',
     SOCIAL, "      value: priceCount.toLocaleString('en-US'),",
     "      value: '312',"),

    # -- THE CONTROL: an over-broad rule must be caught by section 5 -----
    # These four delete the honest ADVICE while leaving every claim removed.
    # A guard whose deny-list is too broad would go green on all of them,
    # which is how the useful half of a page quietly disappears.
    ('the en Cedula ADVICE is deleted (over-broad deny-list)',
     EN, 'must hold a valid Cedula Profesional', 'must hold a valid permit'),

    ('the en sterilization ADVICE is deleted (over-broad deny-list)',
     EN, "asking about sterilization and safety protocols",
     "asking about safety"),

    ('the es Cedula ADVICE is deleted (over-broad deny-list)',
     ES, 'deben tener una Cédula Profesional', 'deben tener un permiso'),

    ('the es sterilization ADVICE is deleted (over-broad deny-list)',
     ES, 'protocolos de esterilización', 'protocolos de seguridad'),

    # -- The badge must not simply vanish --------------------------------
    ('the confirmed-listing badge is deleted rather than corrected',
     PROV, 'providerData.verified', 'false && providerData.notVerified'),
]


def run_guard():
    r = subprocess.run(['node', 'test/honest-claims.mjs'],
                       capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    return r.returncode


def read(p):
    return io.open(p, encoding='utf-8', newline='').read()


def write(p, s):
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
        if n < 1:
            print('ANCHOR 0 matches -- %s' % name)
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
    anchors_ok = all(read(p).count(f) >= 1 for _, p, f, _ in MUTATIONS)
    print('\n%d caught, %d missed. tree restored: guard=%s anchors=%s'
          % (caught, missed, 'green' if final == 0 else 'RED',
             'ok' if anchors_ok else 'DRIFTED'))
    return 0 if (missed == 0 and final == 0 and anchors_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
