/**
 * What kind of contact does this link represent, if any?
 *
 * ⛔ A PLAIN .ts MODULE ON PURPOSE. It lives here rather than inside
 * components/analytics/OutboundTracker.tsx so a guard can IMPORT AND EXECUTE it.
 * A guard that only greps the tracker's source cannot tell a working classifier
 * from one that returns null for everything -- and "returns null for everything"
 * is indistinguishable, in the data, from "nobody clicked". That is the exact
 * failure this measurement work exists to end, so it must be executable.
 */

export type ContactKind = 'contact_phone' | 'contact_whatsapp' | 'contact_website'

export function classify(href: string, siteHost: string): ContactKind | null {
  if (!href) return null
  const h = href.trim()

  if (h.toLowerCase().startsWith('tel:')) return 'contact_phone'

  let url: URL
  try {
    // The base makes a relative href resolve to OUR host, so it is correctly
    // classified as internal (null) rather than as a clinic's website.
    url = new URL(h, `https://${siteHost}`)
  } catch {
    return null
  }

  // mailto:, sms:, javascript: and friends are not clinic contact clicks.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  if (host === 'wa.me' || host === 'whatsapp.com' || host.endsWith('.whatsapp.com')) {
    return 'contact_whatsapp'
  }

  const ours = (siteHost || '').toLowerCase().replace(/^www\./, '')
  if (host && ours && host !== ours) return 'contact_website'

  return null
}
