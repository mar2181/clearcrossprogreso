# A quote request reaching a human

## What was wrong

A visitor filled in the quote form. The row was written to the database. Then:

```js
if (providerUser?.email) {
  await sendProviderQuoteAlert({ ... })
}
```

**No else.** No clinic has an account here — provider registration sat behind a
broken navbar link until 2026-08-29 — so that branch never ran. No email, no log,
no error. The route returned `201`, the form said thank you, and **nobody was ever
told**.

⛔ And the patient was emailed *"Your quote request for X **has been sent to** Y.
They typically respond within 24 hours."* A false statement to a customer, on
every quote this site has ever taken.

## ⛔ Setting `RESEND_API_KEY` does NOT fix this

The plan listed the fix as "set `RESEND_API_KEY`". Measured 2026-08-29 against the
live Resend account: **the only verified sending domain is `petbuddyconcierge.com`.**
`lib/email.ts` sent from `noreply@clearcrossprogreso.com`, which Resend would
reject on **every** send — inside a `catch` that only `console.error`s. We would
have switched the key on, seen no errors anywhere we look, and believed it fixed.

Three env vars, and all three matter:

| variable | why |
|---|---|
| `RESEND_API_KEY` | without it nothing sends, loudly |
| `QUOTE_FROM_EMAIL` | **must be on a domain verified in Resend** |
| `QUOTE_NOTIFY_TO` | the ClearCross inbox quotes fall back to |

⛔ **`QUOTE_NOTIFY_TO` has NO default, deliberately.** Guessing an address that may
not be a real mailbox replaces one silent failure with a different one, and this
whole change exists because a lead reached nobody and nothing said so. Unset
returns a reason naming the variable.

### What is needed, and from whom

1. **Verify `clearcrossprogreso.com` in Resend** (a couple of DNS records) and set
   `QUOTE_FROM_EMAIL` to an address on it. Sending client-facing quote mail from
   `petbuddyconcierge.com` works but is the wrong name on the envelope.
2. **Decide the inbox.** The footer publishes `info@clearcrossprogreso.com`; it was
   not used as a default because nobody has confirmed it is a real mailbox.

## What changed

- **`sendClearCrossQuoteAlert` fires on EVERY quote**, unconditionally, whether or
  not the clinic is onboarded. It **returns a result** rather than swallowing —
  the caller has to be able to say whether a human was told, which is the entire
  point. Its body states in red whether the clinic was emailed too or whether
  somebody has to forward it.
- **A missing provider account is logged at ERROR level**, naming the provider and
  the quote id. It used to be the quietest possible no-op.
- **A quote that reached nobody says so**, with the reason.
- **The patient email no longer asserts the clinic was notified** — *"We have your
  request … and we are getting it to Y"* is true in both branches.
- **One `emailConfigured()`** replaces three copy-pasted checks that tested
  `=== 'your_resend_api_key'` while `getResend()` tested `startsWith('your_')` — so
  `your_key_here` passed the guard and made the non-null assertion below it a lie.

### 🔴 An escaping hole, found while reading

`sendProviderQuoteAlert` interpolated the patient's `description` **raw** into the
email HTML. Every sibling field on the same line used `esc()`. That is free text
typed by an anonymous visitor into a public form, landing in a branded email a
clinic has every reason to trust — so `<a href="…">Respond here</a>` in the
description is a phishing link wearing ClearCross's name. Escaped now, and
truncated *before* escaping so an entity cannot be cut in half.

## The guard

`npm run verify:quotes` — in CI and in `npm run verify`. It **executes** `esc` and
`emailConfigured` against real payloads rather than scanning for them, and asserts
the ClearCross alert is structurally **unconditional** while the provider alert
remains conditional.

Mutation harness: `python test/_mutate_quote_delivery.py` — 10 mutations, 10
caught, including restoring the exact silent-failure state.

## Traps recorded

⛔ **"the pattern exists somewhere in the file" is not a check** — and it appeared
**five times** in one session. The escape-order check passed against a mutation
because there are *two* `esc(description.slice(...))` sites and only one was
mutated; it counts both now. And the over-strip control matched
`noreply@clearcrossprogreso.com`, which has no `//` in front of it, so it survived
the very mangling it was meant to detect — the needle must be the full
`https://…`. Both were caught by the harness, not by review.

⛔ **The shared comment stripper had a real bug.** `lib/email.ts` contains
`.replace(/'/g, '&#39;')`. Treated as division, the apostrophe *inside* that regex
opened a string that never closed, so every block comment after that line survived
— and the guard reported a violation that was only its own explanatory comment.
`test/_strip-comments.mjs` understands regex literals now, and
`npm run verify:strip` runs first because three other guards depend on it.

⚠️ **Not fixed, recorded:** `POST /api/quotes` with an empty body returns **500**,
not 400 — `request.formData()` throws and the outer catch turns it into "Internal
server error".

⚠️ **Unverifiable here:** no email has actually been sent. There is no
`RESEND_API_KEY` in this environment, and the domain is unverified, so delivery is
proven only as far as the code path. Nothing claims otherwise.
