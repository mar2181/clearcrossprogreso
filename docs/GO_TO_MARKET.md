# ClearCross — Go-to-market: what we turn on, and when

> Decided 2026-09-06 with Mario. This settles a question that had been open since launch.
> ⛔ Re-read this before proposing that we "build the booking flow" or "start charging".

## The decision, in one line

**Run it as a free, phone-first directory. Measure every outbound contact. Sell a flat
featured placement to the first clinic we can PROVE we sent calls to. Only then, and only
with a Texas healthcare attorney, consider per-patient commission.**

Mario's instinct was to get people using it first and monetize at a milestone. That is
correct, and the evidence is stronger than the instinct.

---

## Why phone-first, and why the quote form is the part that is broken

The quote form promises a price **from the clinic**. Read that promise against reality:

| | |
|---|---|
| Clinics signed to respond to a quote | **0** |
| Quote requests received, all time | **1** |
| Quote requests answered | **0** |
| Days the one real lead sat unanswered | **7** (LaTonya Glaze, 2026-08-30, `status: pending`) |
| Providers with a working phone number | **110 of 152** |

⛔ **A form whose promise depends on a party who has not agreed to anything is worse than no
form.** It is not a neutral placeholder — it is a broken promise made to somebody choosing
where to have their teeth removed. At one submission a month that is embarrassing. At the
traffic we are trying to build, it is the thing that makes people never come back.

The phone path, by contrast, **works today, for 110 providers, with zero dependencies on
anybody signing anything.** It is not a fallback. For this stage it is the product.

### What we do NOT do: take the appointment ourselves

Booking on the patient's behalf makes us responsible for a medical appointment — scheduling,
changes, no-shows, and the patient's expectation that we vouched for the clinic. That is a
large operational and liability step to take **for demand we have not yet proven exists**.
Build it when the traffic justifies it, not before.

### What we do NOT do: delete the quote form

A phone call is anonymous. The form is the only thing that captures a lead **we own** and can
follow up. So it stays — but the promise changes:

- **Now:** implies the clinic will quote you. Nobody does. ⇒ broken.
- **Change to:** *we* help you find the right clinic and the right price, and **we** answer it.

That is a manual concierge. It does not scale and does not need to — at 1-5 a month, Mario or
an assistant answers each one by hand. That is also the cheapest possible way to learn what
people actually want before we automate anything.

---

## The milestone: the number that flips the switch

⛔ **Not pageviews.** Pageviews do not pay, and a clinic does not care about them.

The number that matters is the one we can put in front of a clinic owner:

> **Tracked outbound contacts — `tel:` taps, WhatsApp taps, website clicks — delivered to ONE
> clinic in a rolling 30 days.**

| signal | threshold | what it unlocks |
|---|---|---|
| **Contacts to a single clinic / 30d** | **25+** | 🎯 **That clinic is the first sales call.** |
| Total outbound contacts / 30d | 40+ | The site is genuinely working, not noise |
| Sessions / 30d | 250+ | There is an audience to sell against |

**Why 25 and not 5.** One or two calls is noise a front desk never notices. Twenty-five in a
month is roughly one every weekday — enough that the clinic has *felt* something change. That
is what makes the sales call land, because we are confirming something they already suspect
rather than making a claim they have to take on faith.

⭐ **The tracked click IS the inventory.** Without it we have nothing to sell a clinic, and no
way to price it. This is why analytics is a revenue dependency here, not housekeeping.

---

## What we sell first: flat featured placement, not commission

⛔ **This is the single most important sequencing point on the page.**

| model | legal gate | verdict |
|---|---|---|
| **Flat listing / featured placement** | none | ✅ **Start here.** |
| Per-patient commission | 🚨 **Texas Patient Solicitation Act** — broader than the federal AKS and **not limited to government programs** | ⛔ Attorney first, no exceptions |

A flat monthly fee for position in a category is compensation for **advertising**, not for
delivering a patient — so it does not trip the statute, needs no legal opinion, and can be
invoiced the day a clinic says yes.

⚠️ **Suggested opening price: $99–199/month** for featured position in one category. Flagged
as a **proposal, not a decision** — no clinic has been asked. The first three clinics are
**proof, not profit**: their value is the case study and the reference, so price them to say
yes easily and raise it once the traffic number is undeniable.

---

## Sequence

1. **Now — measurement on.** GA4 + Search Console. Nothing else is decidable without it.
2. **Now — the site stays open, free, indexable.** No gate, no signup wall, no friction.
3. **Next — flip the conversion hierarchy.** Make **Call** the primary CTA on a provider page
   and **Get a Quote** the secondary. Today the provider page says "Get a Quote" 8 times and
   "Call" once, which is exactly backwards for the only path that works. *(Not yet done —
   needs Mario's OK, it is a product change.)*
4. **Next — re-word the quote form** so the promise is ours to keep, and answer every one.
5. **30 days — read the numbers.** Which categories, which clinics, EN vs ES, phone vs web.
6. **At 25 contacts to one clinic — the first sales call.** Flat featured placement.
7. **Later, with counsel — commission**, and only if the flat fee proves too small.

---

## ⛔ Open, and honestly still open

- **Nobody has been asked to pay anything yet.** Every number above is a plan, not a pipeline.
- **67% of visible providers still have no prices** (84 of 126). Prices are the moat and it is
  a third built; a directory that beats the aggregators on price has to actually have prices.
- **The concierge (Dr. Leo) is live and unmeasured** — we do not know if anyone talks to him.
- **`POST /api/quotes` returns 500 on a malformed body** instead of 400. Minor, but it means a
  broken client fails opaquely on the one route that captures a lead.
