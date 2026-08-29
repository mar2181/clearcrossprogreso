'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * GA4, wired for the App Router.
 *
 * ⛔ INERT WITHOUT THE ENV VAR. No measurement id means this renders null — no
 * script tag, no dataLayer, no beacon to `G-undefined`. A half-configured
 * analytics tag is worse than none: it produces a page that LOOKS instrumented
 * and reports nothing, which is exactly the failure this whole change exists to
 * end.
 *
 * ⛔ `usePathname` ONLY — deliberately NOT `useSearchParams`. That hook forces
 * the nearest Suspense boundary into client-side rendering, so a crawler gets a
 * loading fallback instead of the page. This is a directory whose entire value
 * is server-rendered HTML that Google can read; trading that for query-string
 * fidelity in a pageview would be a catastrophic bargain. The query string is
 * still captured, by reading `window.location` inside the effect, which costs
 * nothing at render time.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const pathname = usePathname()

  useEffect(() => {
    if (!gaId || typeof window === 'undefined' || !window.gtag) return
    // Read the live location rather than a hook, per the note above.
    const page_path = window.location.pathname + window.location.search
    window.gtag('event', 'page_view', {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [gaId, pathname])

  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // send_page_view stays ON for the first load; the effect above covers
          // client-side navigations, which gtag cannot see on its own.
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
