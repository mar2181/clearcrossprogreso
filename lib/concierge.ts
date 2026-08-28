/**
 * The concierge's identity, in one place.
 *
 * ⛔ THE FOUR FIELDS MOVE TOGETHER OR NOT AT ALL. `agentId` chooses the database
 * row (and therefore the VOICE and the knowledge base), `avatar` chooses the
 * video body, `name` is what both script tags display and what the row's
 * `pet_name` must equal. A face arriving without its voice — or Vera's body on
 * Dr. Leo's row — is the failure this grouping exists to prevent, and
 * `tools/concierge-preflight.mjs` fails on exactly that disagreement.
 *
 * ⛔ `url` IS THE ENTIRE ORIGIN ALLOWLIST on the platform side and it is
 * SINGLE-VALUED (`petconcierge/lib/cors.ts embedOriginAllowedForAgent`: exact
 * host, www <-> apex, or a subdomain of the same apex). A mismatch is
 * `403 "This pet is not enabled for this site"`, which in a browser looks like
 * a concierge who renders perfectly and never makes a sound. If this site ever
 * moves domain, the row's `business_url` must move in the same change.
 */
export const concierge = {
  /** Flip to false to remove him completely; the two script tags never load. */
  enabled: true,

  /** The platform that serves embed.js, live-agent.js and the token mint. */
  origin: 'https://petconcierge.vercel.app',

  /** ⛔ Must equal the row's `business_url` exactly. See the note above. */
  siteUrl: 'https://clearcrossprogreso.com',

  businessName: 'ClearCross Progreso',

  /**
   * ⛔ Set by `tools/provision-concierge.mjs` — do not hand-edit. Null means
   * "not provisioned yet", and the component renders nothing rather than
   * loading tags that would 403.
   */
  agentId: 'agent_clearcrossprogreso938b30ece5' as string | null,

  /**
   * ⛔ `leo`, not the platform default. `live-agent.js` line 56 falls back to
   * `'vera'` when `data-avatar` is absent — so a forgotten attribute renders a
   * woman in a blazer on a dentist's demo, with nothing anywhere reporting it.
   */
  avatar: 'leo',
  name: 'Dr. Leo',

  /** The number a visitor gets if his voice is down. */
  fallbackEmail: 'info@clearcrossprogreso.com',
} as const;
