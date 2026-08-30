"""Mutation harness for test/links.mjs.

⛔ This one REBUILDS between mutations, because the guard reads served HTML — a
mutation to source that is never built is a mutation the guard cannot observe,
and it would score as a false catch or a false miss depending on which way the
wind blows. That mistake is on record in this estate (a guard serving from dist/
while the harness mutated src/, scoring 0/5 and looking like a broken guard).

Usage:  a server must ALREADY be running on $PORT serving a build of this tree.
        python test/_mutate_links.py
        The harness rebuilds and restarts it for each mutation.

⛔ Run DETACHED or with a generous timeout. Killed between the write and the
restore, it leaves a mutated file on disk and every later check reads green
against broken code.
"""
import io
import os
import subprocess
import sys
import time
import urllib.request

PORT = os.environ.get('PORT', '3211')
BASE = 'http://localhost:%s' % PORT

NAVBAR = 'components/layout/Navbar.tsx'
CATEGORY = 'app/[category]/page.tsx'
GETLOCALE = 'lib/i18n/get-locale.ts'

MUTATIONS = [
    # The exact state production is in right now: a 404 in the user menu of
    # every page on the site.
    ('navbar points at /login again (the live 404)',
     NAVBAR, "href={localizedPath('/auth/login', locale)}", "href={localizedPath('/login', locale)}"),

    ('navbar points at /register again',
     NAVBAR, "href={localizedPath('/auth/register', locale)}", "href={localizedPath('/register', locale)}"),

    # A dentist asked which treatment they are shopping for.
    ('"List Your Business" points back at the patient quote form',
     CATEGORY, 'href="/auth/register?role=provider"', 'href="/quote"'),

    # Without the english-only rule, /es/auth/login is a 404 reachable from every
    # Spanish page — the same bug, one tree over.
    ('localizedPath localises auth routes again (breaks the Spanish tree only)',
     GETLOCALE, "  if (ENGLISH_ONLY.some((prefix) => path.startsWith(prefix))) return path;\n", ''),
]


def read(p):
    return io.open(p, encoding='utf-8').read()


def write(p, s):
    tmp = p + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8', newline='') as f:
        f.write(s)
    os.replace(tmp, p)


def sh(cmd):
    # ⛔ BASE must be handed to the child. The harness starts its server on $PORT
    # while test/links.mjs defaults to :3100 — so without this the guard talked to
    # a port with nothing on it, failed to read the sitemap, and the harness
    # reported "baseline is not green" about a perfectly healthy tree. A confident
    # red from the instrument, not the product.
    env = dict(os.environ, BASE=BASE)
    return subprocess.run(cmd, shell=True, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', env=env)


def kill_server():
    sh('powershell -NoProfile -Command "Get-CimInstance Win32_Process | '
       'Where-Object { $_.CommandLine -like \'*next*start*%s*\' } | '
       'ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"' % PORT)
    time.sleep(2)


def start_server():
    subprocess.Popen('npx next start -p %s' % PORT, shell=True,
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(40):
        time.sleep(1)
        try:
            with urllib.request.urlopen(BASE + '/', timeout=3) as r:
                if r.status == 200:
                    return True
        except Exception:
            pass
    return False


def rebuild_and_run():
    b = sh('npx next build')
    if b.returncode != 0:
        # A build failure is NOT a caught mutation — the guard never ran.
        return 'BUILD-FAILED'
    kill_server()
    if not start_server():
        return 'SERVER-FAILED'
    r = sh('node test/links.mjs')
    return r.returncode


def main():
    print('baseline: rebuilding and running the guard on the clean tree...')
    base = rebuild_and_run()
    if base != 0:
        print('ABORT: baseline is not green (%s). Every mutation would score a false catch.' % base)
        return 1
    print('baseline green.\n')

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
            rc = rebuild_and_run()
        finally:
            write(path, src)
        if rc == 'BUILD-FAILED' or rc == 'SERVER-FAILED':
            print('INCONCLUSIVE (%s)  %s' % (rc, name))
            missed += 1
        elif rc != 0:
            print('caught   %s' % name)
            caught += 1
        else:
            print('MISSED   %s' % name)
            missed += 1

    final = rebuild_and_run()
    anchors_ok = all(read(p).count(f) == 1 for _, p, f, _ in MUTATIONS)
    print('\n%d caught, %d missed. tree restored: guard=%s anchors=%s'
          % (caught, missed, 'green' if final == 0 else 'RED', 'ok' if anchors_ok else 'DRIFTED'))
    return 0 if (missed == 0 and final == 0 and anchors_ok) else 1


if __name__ == '__main__':
    sys.exit(main())
