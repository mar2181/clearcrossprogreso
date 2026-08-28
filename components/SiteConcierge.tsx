'use client'

/**
 * Dr. Leo — the AI concierge who walks out of the bottom-right corner, answers
 * questions about what is on this site, and moves the visitor to the right page.
 *
 * ⛔ NOTHING ABOUT HIM IS BUILT HERE. He is two script tags from the Pet Buddy
 * platform: `embed.js` (the brain, the voice state machine, the page driving)
 * and `live-agent.js` (the body — walk/idle/talk alpha video, plus a WebGL
 * compositor for iPhone, which drops the alpha channel from VP9 webm). Every
 * knob — his voice, his persona, everything he knows — lives on his database
 * row, not in this file. Deleting the two tags reverts the page completely.
 *
 * Regenerate what he knows with `node tools/build-concierge-kb.mjs`, then push
 * it with `node tools/provision-concierge.mjs --character leo --agent-id <id>`.
 * ⛔ A `git push` does NOT update him — his knowledge lives in a database row.
 *
 * Four things this component exists to do, each earned by a past failure:
 *
 *   1. LOAD LATE. The platform scripts are ~376 KB combined and fetch a sitemap
 *      on boot. Loading them during first paint competes with the hero and the
 *      provider imagery. We wait for `load`, then for an idle callback — which
 *      is also when he is least in the way.
 *
 *   2. STAY OFF THE BOTTOM BARS. He mounts `position: fixed` at z-index
 *      2,147,483,600 in a ~360x520 box whose outer div takes pointer events.
 *      This site has THREE fixed bottom elements — the mobile nav
 *      (`MobileBottomNav.tsx:76`, a floating bar at bottom-4), the compare
 *      drawer (`CompareDrawer.tsx:53`) and the provider-page mobile CTA
 *      (`app/[category]/[provider]/page.tsx:516`). On a previous client that
 *      exact geometry made a shopping cart unclickable for real customers.
 *      He is lifted clear in globals.css.
 *      ⛔ Lift him; do not lower his z-index. It comes from a stylesheet
 *      `live-agent.js` injects (line 176), so a lower value would only let page
 *      content paint OVER an element that is still swallowing the clicks — it
 *      does not give the taps back. Moving him up does.
 *
 *   3. DRIVE NAVIGATION AS AN SPA PUSH. Without `__PetConciergeNavigate` the
 *      platform does a full document load, which tears down the audio context
 *      and ends the call — he takes you to the page and stops existing.
 *
 *   4. FAIL HONESTLY. See below.
 *
 * ── WHY WE DETECT A DEAD VOICE THE WAY WE DO ─────────────────────────────────
 * The obvious check — call the session endpoint and see if it succeeds — does
 * not work, and believing it is how a demo gets shipped mute. On an account
 * whose credits are gone the mint returns HTTP 200 with a real, correctly
 * signed ephemeral token, because minting one spends nothing. The socket then
 * closes without ever completing setup.
 *
 * So the only honest signal is behavioural: he was asked to speak and no sound
 * ever came. We listen on the platform's public event API — `PetConcierge.on`,
 * the same one `live-agent.js` uses to drive his mouth, so the handlers sit
 * alongside rather than replacing anything.
 *
 * ⛔ The notice is deliberately NOT rendered until that happens. A permanent
 * "voice may be unavailable" banner on a client's site is worse than the
 * problem it describes.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { concierge } from '@/lib/concierge'

/** How long a started session may stay silent before we call it dead. */
const SILENCE_MS = 9000

type PetConcierge = {
  on?: (event: string, cb: (arg?: unknown) => void) => void
  off?: (event: string, cb: (arg?: unknown) => void) => void
}

declare global {
  interface Window {
    PetConcierge?: PetConcierge
    __PetConciergeNav?: Record<string, string>
    __PetConciergeNavigate?: (path: string) => void
    __PetConciergeRoutes?: { match: RegExp; label: string }[]
    // ⛔ requestIdleCallback is NOT redeclared here: lib.dom already has it, and a
    // second declaration with different optionality is a hard TS error.
  }
}

/**
 * The pages he can take a visitor to, and what they are called.
 *
 * ⛔ CATEGORIES THAT SHOW NOTHING ARE DELIBERATELY ABSENT. `/spas`, `/doctors`
 * and `/liquor` are in the site's own navigation and every one of them renders
 * "0 verified providers" — the category pages list VERIFIED providers only.
 * Teaching him to offer a page that turns out to be empty is a promise broken
 * on the first click, so this list is the pages that actually have something on
 * them. It is kept in step with `concierge/nav-hint.txt`, which the KB builder
 * generates from the live database for exactly the same reason.
 */
const LIVE_CATEGORIES: { slug: string; en: string; es: string[] }[] = [
  { slug: 'dentists', en: 'Dentists', es: ['dentistas', 'dentista'] },
  { slug: 'pharmacies', en: 'Pharmacies', es: ['farmacias', 'farmacia', 'medicinas'] },
  { slug: 'optometrists', en: 'Optometrists', es: ['optometristas', 'lentes', 'optica'] },
  { slug: 'cosmetic-surgery', en: 'Cosmetic Surgery', es: ['cirugia estetica', 'cirugia plastica'] },
  { slug: 'vets', en: 'Vets', es: ['veterinarios', 'veterinario'] },
]

const STATIC_PAGES: { path: string; en: string; es: string[] }[] = [
  { path: '/', en: 'Home', es: ['inicio'] },
  { path: '/quote', en: 'Get a Quote', es: ['cotizacion', 'precio'] },
  { path: '/search', en: 'Search', es: ['buscar'] },
  { path: '/how-it-works', en: 'How It Works', es: ['como funciona'] },
  { path: '/safety', en: 'Safety Guide', es: ['seguridad'] },
  { path: '/blog', en: 'Blog', es: ['articulos'] },
  { path: '/about', en: 'About', es: ['nosotros'] },
]

/**
 * The phrase -> path map he resolves `navigate_to` against.
 *
 * Both languages are published together on purpose: the origin allowlist is
 * per-ORIGIN, and /es is the same origin as /, so one agent serves both and has
 * to understand "llévame a los dentistas" as readily as "take me to the
 * dentists".
 */
const navMap = (): Record<string, string> => {
  const m: Record<string, string> = {}
  for (const c of LIVE_CATEGORIES) {
    const p = `/${c.slug}`
    m[c.en.toLowerCase()] = p
    m[c.slug.replace(/-/g, ' ')] = p
    for (const es of c.es) m[es] = p
  }
  for (const s of STATIC_PAGES) {
    m[s.en.toLowerCase()] = s.path
    for (const es of s.es) m[es] = s.path
  }
  // The words a person actually says, which are rarely the nav label.
  Object.assign(m, {
    'a quote': '/quote',
    'request a quote': '/quote',
    'how much would it cost': '/quote',
    'cuanto cuesta': '/quote',
    'find a procedure': '/search',
    'is it safe': '/safety',
    'how does this work': '/how-it-works',
    'the home page': '/',
  })
  return m
}

/**
 * ⛔ THE SHAPE HERE IS LOAD-BEARING: `{ match: RegExp, label }`, nothing else.
 * `embed.js`'s `labelForPath` calls `all[i].match.test(pathname)` inside a
 * try/catch, so ANY other shape throws and is silently swallowed — the entry
 * becomes a no-op and nothing anywhere reports it. That exact bug sat live on
 * another client's site for weeks.
 *
 * Each page is matched under both `/x` and `/es/x`, because the Spanish tree is
 * the same origin and the same agent.
 */
const routeLabels = (): { match: RegExp; label: string }[] => {
  const esc = (p: string) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const out: { match: RegExp; label: string }[] = []
  const add = (path: string, label: string) => {
    out.push({ match: new RegExp(`^${esc(path)}/?$`), label })
    out.push({ match: new RegExp(`^/es${esc(path === '/' ? '' : path)}/?$`), label })
  }
  for (const s of STATIC_PAGES) add(s.path, s.en)
  for (const c of LIVE_CATEGORIES) {
    add(`/${c.slug}`, c.en)
    // A provider profile, so he can say where the visitor already is.
    out.push({ match: new RegExp(`^(?:/es)?/${esc(c.slug)}/[^/]+/?$`), label: `${c.en} — provider profile` })
  }
  return out
}

export default function SiteConcierge() {
  const [voiceDown, setVoiceDown] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const spokeRef = useRef(false)
  const router = useRouter()

  const { enabled, origin, agentId, avatar, name, fallbackEmail } = concierge

  /* ── 1. Publish the page-driving globals BEFORE the tags load ──────────
   *
   * ⛔ ORDER MATTERS. `embed.js` reads these when it boots, and it boots on
   * load. Publishing them in a later effect gives him a session in which he
   * knows about no pages at all — which does not error, it just quietly turns
   * "take me to the dentists" into an apology.
   */
  useEffect(() => {
    if (!enabled || !agentId) return
    window.__PetConciergeNav = navMap()
    window.__PetConciergeRoutes = routeLabels()
    window.__PetConciergeNavigate = (path: string) => {
      try {
        router.push(path)
      } catch {
        window.location.assign(path)
      }
    }
  }, [enabled, agentId, router])

  /* ── 2. Inject the two platform tags, once, after the page has settled ── */
  useEffect(() => {
    if (!enabled || !agentId) return

    let cancelled = false

    const inject = () => {
      if (cancelled) return

      // Idempotent: React StrictMode double-invokes effects in development, and
      // embed.js warns-and-bails on a second load rather than erroring, so
      // without this the console carries a warning that looks like our bug.
      const add = (src: string, attrs: Record<string, string>) => {
        if (document.querySelector(`script[src="${src}"]`)) return
        const s = document.createElement('script')
        s.src = src
        s.defer = true
        for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
        document.body.appendChild(s)
      }

      add(`${origin}/embed.js`, {
        'data-token': agentId,
        'data-backend': 'geminilive',
        'data-pet': avatar,
        'data-name': name,
        // ⛔ Without this, embed.js ALSO renders its own 2D sprite launcher
        // beside the human. There is no sprite atlas for a live-agent
        // character, so it degrades to a bare emoji glyph — two concierges on
        // one page, one of them an emoji.
        'data-sprite-src': 'none',
      })

      add(`${origin}/live-agent.js`, {
        // ⛔ `live-agent.js:56` defaults to 'vera' when this is absent. Forget
        // it and a dentist's demo renders a woman in a blazer.
        'data-avatar': avatar,
        // ⛔ Omitting this printed "Talk to Junior-supermarkets" on a client's
        // live site: the default display name is the slug, title-cased.
        'data-name': name,
      })
    }

    const schedule = () => {
      const ric = window.requestIdleCallback
      if (typeof ric === 'function') ric(inject, { timeout: 2500 })
      else window.setTimeout(inject, 800)
    }

    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', schedule)
    }
  }, [enabled, agentId, avatar, name, origin])

  /* ── 3. Watch for a session that starts and never makes a sound ── */
  useEffect(() => {
    if (!enabled || !agentId) return

    let timer: number | undefined
    let tries = 0
    let poll: number | undefined
    let bound: PetConcierge | undefined

    const onMode = (m?: unknown) => {
      if (m && typeof m === 'object' && (m as { speaking?: boolean }).speaking) {
        spokeRef.current = true
        window.clearTimeout(timer)
        setVoiceDown(false)
      }
    }
    const onStart = () => {
      spokeRef.current = false
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        // He was asked to talk and produced no audio. That is the only
        // observable difference between a working session and a bankrupt one.
        if (!spokeRef.current) setVoiceDown(true)
      }, SILENCE_MS)
    }
    const onEnd = () => window.clearTimeout(timer)
    const onError = (m?: unknown) => {
      window.clearTimeout(timer)
      if (m != null && m !== '' && m !== 'null') setVoiceDown(true)
    }

    // The platform script loads late by design, so wait for it rather than
    // assuming it is there. 50 x 200ms mirrors live-agent.js's own poll.
    const bind = () => {
      const pc = window.PetConcierge
      if (pc?.on) {
        pc.on('start', onStart)
        pc.on('end', onEnd)
        pc.on('error', onError)
        pc.on('mode', onMode)
        bound = pc
        return
      }
      if (tries++ < 50) poll = window.setTimeout(bind, 200)
    }
    bind()

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(poll)
      // off() with no registered handler is a documented no-op in every known
      // version, but a missing off() is not — guard the whole thing.
      try {
        bound?.off?.('start', onStart)
        bound?.off?.('end', onEnd)
        bound?.off?.('error', onError)
        bound?.off?.('mode', onMode)
      } catch {
        /* platform version without off(); handlers die with the page */
      }
    }
  }, [enabled, agentId])

  if (!enabled || !agentId || !voiceDown || dismissed) return null

  return (
    <div className="concierge-notice" role="status" aria-live="polite">
      <p>
        {name}&rsquo;s voice is offline right now. Email{' '}
        <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a> and a person will
        get back to you.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss this notice"
      >
        &times;
      </button>
    </div>
  )
}
