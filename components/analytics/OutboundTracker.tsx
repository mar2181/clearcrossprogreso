'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'
import { classify } from '@/lib/outbound'

/**
 * Counts the only conversions this site actually has.
 *
 * ⛔ WHY THIS EXISTS. Before it, the ONLY measurable event in the entire product
 * was a pageview. A grep for `gtag(|track(|dataLayer.push` outside the GA4
 * component returned nothing: no handler on a single `tel:` link, no handler on
 * a single `wa.me` link, nothing on the quote form's success path. And on
 * roughly two-thirds of provider pages the phone and WhatsApp buttons are the
 * ONLY working way to reach the clinic -- phone is populated on 37 of 104
 * providers, WhatsApp on 10. So the site's entire conversion surface was
 * invisible, and the question a clinic will eventually ask -- "how many patients
 * did you send me?" -- had no answer, not even a partial one.
 *
 * ⛔ A DELEGATED LISTENER, NOT A PROP ON EACH LINK. These links are rendered in
 * at least eight components, several of them server components, and two of them
 * are being rewritten for the Spanish tree. Threading an onClick through all of
 * them creates eight places to forget. One listener on the document catches
 * every one of them, including links that do not exist yet.
 *
 * ⛔ CAPTURE PHASE. A handler somewhere else calling stopPropagation would
 * otherwise silently cost us the event, and the loss would look exactly like
 * "nobody clicked" -- which is the failure mode this whole component exists to
 * end.
 *
 * ⛔ FIRES BOTH SINKS, AND NEITHER IS REQUIRED. Vercel `track()` is a no-op when
 * Web Analytics is off; `window.gtag` is simply absent until NEXT_PUBLIC_GA_ID
 * is set. So this is safe to ship before either is switched on, and starts
 * reporting the moment one of them is -- with no second deploy.
 */

export function OutboundTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as Element | null
      const a = el && typeof el.closest === 'function' ? el.closest('a') : null
      if (!a) return

      const kind = classify(a.getAttribute('href') || '', window.location.hostname)
      if (!kind) return

      // Where the click happened, so a clinic can be credited. The path is the
      // provider's own URL on a provider page, which is what we want; we do not
      // send the href, because a phone number is the clinic's, not ours to log.
      const path = window.location.pathname
      const parts = path.split('/').filter(Boolean)
      const locale = parts[0] === 'es' ? 'es' : 'en'
      const rest = locale === 'es' ? parts.slice(1) : parts
      const payload = {
        kind,
        path,
        locale,
        category: rest[0] || '',
        provider: rest[1] || '',
      }

      try {
        track(kind, payload)
      } catch {
        // Measurement must never break a click that reaches a clinic.
      }
      try {
        window.gtag?.('event', kind, payload)
      } catch {
        /* same */
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
