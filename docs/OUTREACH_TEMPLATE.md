# Provider activation outreach — reusable template

⛔ **Internal working document.** Nothing here has been sent. Per Track 3 of
`~/.claude/plans/cryptic-wobbling-trinket.md`: send **ONE** real message from
this template to a single provider first, confirm it actually *delivered*
(Resend delivered status for email, or a real read receipt/reply for
WhatsApp/SMS — not just a 200 from the send call), before batch-sending to the
rest of the confirmed-contact list.

## The one rule this whole template follows

**Never say "we built you a new website."** Every provider in the directory
already has a page — `clearcrossprogreso.com/<category>/<slug>` — whether
they've logged in or not. The message is always: *your listing is already
live, here's how to get into it.* That's true today for all 152 providers, it
costs nothing to say, and it's a stronger door-opener than a cold "we made you
something" pitch to a stranger.

Consistent with `docs/HONEST_CLAIMS.md`: no invented numbers, no "verified" or
"guaranteed" language on their behalf, nothing they haven't confirmed
themselves. If a number changes (provider count, price count), pull it live —
don't hardcode what's below into a mail-merge and reuse it for months.

## What the message offers, and what it deliberately holds back

| in this round | held back |
|---|---|
| Their listing is live and getting seen | — |
| Log in, edit their profile (phone, hours, description, prices) | — |
| Post a time-limited special (flash discount) that shows on their public page | — |
| — | **Photos.** Upload exists in the codebase but the public gallery still reads from a static file, not the DB — a provider who uploads today sees nothing change. Don't offer it until that's wired. If a provider asks, say it's "coming soon." |

---

## Email — English

**Subject:** Your listing on ClearCross Progreso is live — here's how to manage it

```
Hi {{contact_name}},

{{provider_name}}'s listing is already live on ClearCross Progreso, the
directory Valley residents use to compare dentists, pharmacies, and clinics in
Nuevo Progreso before they cross the bridge:

  https://clearcrossprogreso.com/{{category_slug}}/{{provider_slug}}

We've set up a free login so you can manage it directly — no design work, no
web developer needed:

  • Keep your phone number, hours, and description current
  • Update your own prices
  • Post a time-limited special (a flash discount) that shows right on your
    page for as long as you want it up

Login: {{login_email}}
{{password_delivery_line}}

Sign in here: https://clearcrossprogreso.com/auth/login

This listing costs you nothing. If you'd rather we make a change for you than
log in yourself, just reply to this email or call/text {{ops_phone}} and
we'll take care of it.

— ClearCross Progreso
```

### `{{password_delivery_line}}` — pick one

There is no self-service "forgot password" flow yet
(`scripts/provision-provider.mjs`'s own header says not to send a generated
password by email in plain text if it can be avoided). Two honest options:

- **Preferred, when there's a phone number on file:** omit the password from
  the email entirely and use:
  `We'll text/call you the password separately — watch for a message from
  {{ops_phone}}.`
  Then actually follow up by phone/WhatsApp with just the password, no other
  context needed.
- **If email or WhatsApp is the ONLY channel** (no working phone number) and
  a one-time credential has to travel in the same message: say so plainly and
  tell them to change it —
  `Temporary password: {{temp_password}} — you can change it once you're in.`

---

## Email — Spanish

**Subject:** Su listado en ClearCross Progreso ya está activo — así lo administra

```
Hola {{contact_name}},

El listado de {{provider_name}} ya está activo en ClearCross Progreso, el
directorio que usan los residentes del Valle para comparar dentistas,
farmacias y clínicas en Nuevo Progreso antes de cruzar el puente:

  https://clearcrossprogreso.com/{{category_slug}}/{{provider_slug}}

Le creamos un acceso gratuito para que lo administre usted mismo — sin
diseñador ni programador:

  • Mantenga actualizado su teléfono, horario y descripción
  • Actualice usted mismo sus precios
  • Publique una promoción por tiempo limitado que se muestra directamente
    en su página mientras usted la deje activa

Usuario: {{login_email}}
{{password_delivery_line_es}}

Inicie sesión aquí: https://clearcrossprogreso.com/auth/login

Este listado no le cuesta nada. Si prefiere que nosotros hagamos el cambio en
lugar de entrar usted mismo, solo responda este correo o llame/mande mensaje
al {{ops_phone}} y lo hacemos por usted.

— ClearCross Progreso
```

### `{{password_delivery_line_es}}` — igual que arriba

- `Le enviaremos la contraseña por mensaje/llamada aparte — espere un mensaje
  de {{ops_phone}}.`
- `Contraseña temporal: {{temp_password}} — puede cambiarla en cuanto entre.`

---

## SMS / WhatsApp — short variant (English)

For contacts where phone/WhatsApp is the only real channel (several in the
confirmed-contact list have no email at all — see `docs/INTERNAL_CONTACTS.md`).
Keep it under ~300 characters; no password in this one, ever — it's the
follow-up channel *for* the password when email carries the main message, so
doubling up here defeats the point.

```
Hi, this is ClearCross Progreso. {{provider_name}}'s listing is already live
on our site — clearcrossprogreso.com/{{category_slug}}/{{provider_slug}}. We
set up a free login so you can update your info or post a special yourself.
Can we call you with the login details?
```

## SMS / WhatsApp — short variant (Spanish)

```
Hola, le escribe ClearCross Progreso. El listado de {{provider_name}} ya está
en nuestro sitio — clearcrossprogreso.com/{{category_slug}}/{{provider_slug}}.
Le dejamos un acceso gratis para que actualice su información o publique una
promoción usted mismo. ¿Le podemos llamar para darle el acceso?
```

---

## Sending checklist (per the plan's verification step)

1. Pick ONE provider from the confirmed-contact list with a real, working
   contact channel (a phone number already on file in the DB is stronger
   signal than a scraped email).
2. `node scripts/provision-provider.mjs --provider-id=<uuid> --email=<their real email> --name="<front desk contact>" [--phone=...]` —
   dry run first, read the output, then `--apply`.
3. Send that ONE provider the real message (email via Resend, or the
   SMS/WhatsApp variant).
4. Confirm actual delivery — not just that the send call returned 200:
   - Email: check the message's status in Resend directly (`delivered`, not
     `sent`/`queued`/`bounced`).
   - SMS/WhatsApp: a reply, a read receipt, or a follow-up call confirming
     they got it.
5. Only after that one confirmed delivery, provision + send the rest of the
   confirmed-contact list, one at a time or in small batches — never a bulk
   blast on the first run of a new template.

## Scope reminder

Per the original instruction on this project: contact info gathered is **for
our use only for now**. This template is for ClearCross-initiated outreach to
providers *about their own free listing* — it is not a basis for sharing
contact data with any third party, and nothing in this file authorizes
sending anything until Mario says go on a specific batch.
