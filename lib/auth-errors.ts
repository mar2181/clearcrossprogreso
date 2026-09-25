// Supabase auth and Postgres errors carry codes meant for developers
// (invalid_credentials, weak_password, Postgres SQLSTATE 23505...) — never
// show err.message directly in the UI. This maps the cases a real patient
// or provider can actually hit to plain-language copy. The raw error still
// belongs in console.error at the call site, for us.
//
// Auth codes come from @supabase/auth-js's own error-codes.ts (stable field
// on AuthApiError since supabase-js ^2.45). Postgres codes are SQLSTATEs
// PostgREST passes through unchanged from the database.
type ErrorLike = {
  code?: string;
  message?: string;
};

const AUTH_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'That email or password is not right. Check them and try again.',
  email_not_confirmed: 'Please confirm your email first — check your inbox for the confirmation link.',
  user_already_exists: 'An account with that email already exists. Try signing in instead.',
  email_exists: 'An account with that email already exists. Try signing in instead.',
  identity_already_exists: 'An account with that email already exists. Try signing in instead.',
  weak_password: 'Choose a stronger password — at least 6 characters.',
  over_email_send_rate_limit: 'Too many attempts — please wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts — please wait a few minutes and try again.',
  over_sms_send_rate_limit: 'Too many attempts — please wait a few minutes and try again.',
  same_password: 'That is your current password — choose a different one.',
  user_not_found: "We couldn't find an account with that email.",
  signup_disabled: 'New sign-ups are temporarily unavailable. Please try again later.',
  user_banned: 'This account is not able to sign in. Contact support if you believe this is a mistake.',
  email_address_invalid: 'Please enter a valid email address.',
  email_address_not_authorized: 'Please enter a valid email address.',
  session_expired: 'Your session has expired — please sign in again.',
  refresh_token_not_found: 'Your session has expired — please sign in again.',
  refresh_token_already_used: 'Your session has expired — please sign in again.',
  captcha_failed: 'That verification failed — please try again.',
  validation_failed: 'Please check the information you entered and try again.',
};

// Postgres SQLSTATE codes PostgREST passes through as `.code` on a Supabase
// query error. These are the ones an ordinary sign-up/save can actually hit
// on this schema — not an exhaustive SQLSTATE list.
const POSTGRES_CODE_MESSAGES: Record<string, string> = {
  '23505': 'That name or email is already in use — try a different one.',
  '42501': "You don't have permission to do that.",
  '23503': "That request references something that doesn't exist.",
  '23502': 'Please fill in all required fields.',
  '22P02': 'One of the values entered was not valid — please check the form and try again.',
};

/**
 * Turn a raw Supabase auth or database error into copy a patient/provider
 * can act on. `fallback` should name the action that failed (e.g. "create
 * your account") so an unrecognised error still reads as a real sentence
 * rather than a generic dead end.
 */
export function friendlyAuthError(
  err: unknown,
  fallback: string = 'Something went wrong. Please try again.'
): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as ErrorLike;

  if (e.code && AUTH_CODE_MESSAGES[e.code]) return AUTH_CODE_MESSAGES[e.code];
  if (e.code && POSTGRES_CODE_MESSAGES[e.code]) return POSTGRES_CODE_MESSAGES[e.code];

  // Some paths (network failures, older SDK error shapes) don't carry a
  // stable code — fall back to matching the handful of message substrings
  // we know actually occur here, still never surfacing the raw text.
  const msg = (e.message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return AUTH_CODE_MESSAGES.invalid_credentials;
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return AUTH_CODE_MESSAGES.user_already_exists;
  }
  if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('least'))) {
    return AUTH_CODE_MESSAGES.weak_password;
  }
  if (msg.includes('rate limit')) return AUTH_CODE_MESSAGES.over_email_send_rate_limit;
  if (msg.includes('duplicate key')) return POSTGRES_CODE_MESSAGES['23505'];
  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return POSTGRES_CODE_MESSAGES['42501'];
  }
  if (msg.includes('network') || msg.includes('fetch failed')) {
    return "We couldn't reach the server — check your connection and try again.";
  }

  return fallback;
}
