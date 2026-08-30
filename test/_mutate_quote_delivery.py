"""Mutation harness for test/quote-delivery.mjs.

A guard that has never failed is not a guard. Several mutations below restore the
tree to exactly the state that let every quote this site ever took reach nobody.

⛔ Run DETACHED or with a generous timeout. Killed between the write and the
restore, it leaves a mutated file on disk and every later check reads green
against broken code.
"""
import io
import os
import subprocess
import sys

EMAIL = 'lib/email.ts'
ROUTE = 'app/api/quotes/route.ts'
STRIP = 'test/_strip-comments.mjs'

MUTATIONS = [
    # THE bug. The ClearCross alert goes back behind the provider check, so a
    # clinic with no account means nobody is told and nothing says so.
    ('the ClearCross alert goes back behind providerReached',
     ROUTE,
     "      sendClearCrossQuoteAlert({\n        providerName: provider.name,",
     "      providerReached ? Promise.resolve() : sendClearCrossQuoteAlert({\n        providerName: provider.name,"),

    # A silent missing account is how this survived for weeks.
    ('a missing provider account stops being logged',
     ROUTE,
     "        '[quotes] NO PROVIDER ACCOUNT for provider_id=%s (%s) — quote %s can only reach the ClearCross inbox',",
     "        '[quotes] provider lookup done',"),

    ('a quote that reached nobody stops saying so',
     ROUTE,
     "        '[quotes] QUOTE %s REACHED NOBODY AT CLEARCROSS: %s',",
     "        '[quotes] alert dispatched: %s %s',"),

    # Free text from a public form, raw, into an email carrying this business's
    # name. A link in it is phishing that a clinic has every reason to trust.
    ('the patient description goes back to being unescaped',
     EMAIL,
     "${esc(description.slice(0, 300))}",
     "${description.slice(0, 300)}"),

    # Escaping AFTER truncation is correct; the other order can cut an entity in
    # half. Pinned so a tidy-up cannot swap them.
    ('escape-then-truncate instead of truncate-then-escape',
     EMAIL,
     "${esc(description.slice(0, 300))}",
     "${esc(description).slice(0, 300)}"),

    # An invented default replaces a silent failure with a different silent one.
    ('the inbox gets an invented default address',
     EMAIL,
     "const CLEARCROSS_INBOX = process.env.QUOTE_NOTIFY_TO || '';",
     "const CLEARCROSS_INBOX = process.env.QUOTE_NOTIFY_TO || 'info@clearcrossprogreso.com';"),

    # Hardcoding FROM re-creates the trap: the domain is not verified in Resend,
    # so every send is rejected inside a catch that only logs.
    ('the FROM address is hardcoded again',
     EMAIL,
     "const FROM_EMAIL =\n  process.env.QUOTE_FROM_EMAIL || 'ClearCross Progreso <noreply@clearcrossprogreso.com>';",
     "const FROM_EMAIL = 'ClearCross Progreso <noreply@clearcrossprogreso.com>';"),

    # The two config checks disagreeing is what made a non-null assertion a lie.
    ('emailConfigured stops rejecting a "your_..." placeholder',
     EMAIL,
     "  return !!key && !key.startsWith('your_');",
     "  return !!key;"),

    # Telling a customer their request reached a clinic that was never contacted.
    ('the patient email claims the clinic was notified again',
     EMAIL,
     "            We have your request for <strong>${esc(procedureName)}</strong> and we are getting it\n            to <strong>${esc(providerName)}</strong>.",
     "            Your quote request for <strong>${esc(procedureName)}</strong> has been sent to\n            <strong>${esc(providerName)}</strong>."),

    # The guard's own instrument. Breaking the shared stripper must still be
    # caught here, because this guard scans a file whose comments quote the very
    # strings it forbids.
    ('the SHARED stripper loses string-awareness (guard self-check)',
     STRIP,
     """    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue }""",
     """    if (false) { quote = c; out += c; i++; continue }"""),
]


def run_guard():
    r = subprocess.run(['node', 'test/quote-delivery.mjs'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode


def read(p):
    return io.open(p, encoding='utf-8').read()


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
        if n != 1:
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
