/**
 * What a Call button dials.
 *
 * With call tracking OFF this returns the clinic's own number, which is what
 * every button did before this file existed. With it ON, and a clinic that has a
 * code, it returns OUR single Twilio number followed by two pauses and the
 * clinic's 3-digit code: `tel:+19565550100,,104`. The phone dials us, waits, and
 * sends 104 on its own; app/api/voice/* does the rest.
 *
 * ⛔ A PLAIN MODULE WITH NO IMPORTS, SO THE GUARD CAN EXECUTE IT. A guard that
 * greps a page for "tel:" cannot tell a correct link from one that dials the
 * wrong clinic.
 *
 * ⛔ THE ENVIRONMENT IS PASSED IN, NEVER READ HERE. A default of process.env
 * would make the kill switch untestable without mutating global state.
 */

export const CODE_MIN = 100;
export const CODE_MAX = 999;

export interface CallEnv {
  CALL_TRACKING?: string;
  TWILIO_NUMBER?: string;
  // Lets process.env be passed straight in (it has only an index signature).
  [key: string]: string | undefined;
}

export interface CallTarget {
  phone?: string | null;
  call_code?: number | null;
}

export interface CallLink {
  href: string;
  /** The number the visitor sees. ⛔ Always the number the link actually dials. */
  display: string;
  /** Shown beside the number when tracked, so a visitor can type it by hand. */
  code: number | null;
  tracked: boolean;
}

/**
 * Normalise a stored phone to E.164, or null when it cannot be done safely.
 *
 * The table holds every shape people write a number in — measured 2026-09-13:
 * "+1 956-363-9329", "(956) 803-6029", "956-742-8735", "+52 81 8126 0000" and
 * "011528999371000". A number we cannot read with confidence returns null rather
 * than a guess, because a guessed digit dials somebody else.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s) return null;
  let digits = s.replace(/\D/g, '');
  if (!digits) return null;
  let international = s.startsWith('+');

  // 011 is the US international prefix; 00 is everyone else's.
  if (!international && digits.startsWith('011')) {
    digits = digits.slice(3);
    international = true;
  } else if (!international && digits.startsWith('00')) {
    digits = digits.slice(2);
    international = true;
  }

  if (international) {
    return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export function isValidCode(code: unknown): code is number {
  return typeof code === 'number' && Number.isInteger(code) && code >= CODE_MIN && code <= CODE_MAX;
}

/** Our Twilio number, or null when tracking is off or misconfigured. */
export function trackingNumber(env: CallEnv): string | null {
  // ⛔ Exactly 'on'. A typo, 'true', or 'ON' leaves every button direct — the
  // failure is a missed measurement, never a dead Call button.
  if (env.CALL_TRACKING !== 'on') return null;
  return toE164(env.TWILIO_NUMBER);
}

/** "+19565550100" -> "(956) 555-0100". Anything else is shown as given. */
export function formatNational(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export function callLink(target: CallTarget, env: CallEnv): CallLink | null {
  const raw = target.phone ?? null;
  if (!raw || !String(raw).trim()) return null;

  const ours = trackingNumber(env);
  if (ours && isValidCode(target.call_code)) {
    // ⛔ COMMAS, NEVER '#'. In a URL a '#' starts a fragment, so everything after
    // it is dropped before the dialer ever sees it: the code would silently never
    // be sent. Fixed 3-digit codes need no finish key.
    return {
      href: `tel:${ours},,${target.call_code}`,
      display: formatNational(ours),
      code: target.call_code,
      tracked: true,
    };
  }

  const direct = toE164(raw) ?? String(raw).replace(/[^0-9+]/g, '');
  if (!direct) return null;
  return { href: `tel:${direct}`, display: String(raw).trim(), code: null, tracked: false };
}
