# Twilio call tracking — go-live runbook (for an agent)

> Written 2026-09-15. Hand this whole file to a Claude agent (Claude in Chrome for the
> console steps, Claude Code for the API/terminal steps). Do the phases **in order**.
> Every phase ends with a **CHECK**. If a check fails, **STOP** and report the exact
> output — do not improvise around it.
>
> Steps marked **[MARIO]** need a human: a login with 2FA, a credit card, or a
> physical phone. The agent prepares everything around them and waits.

---

## 0. What this switches on (read once)

The code is **already built and deployed, and switched off.** Nothing in this runbook
changes code or needs a `git push`.

- One Twilio number for the whole directory: **+1 956 586 6887** (to be confirmed, §1.4).
- Every clinic with a phone has a permanent 3-digit `call_code` (100–209 today) in
  `clearcross_providers.call_code`. Dental Artistry = **114**.
- With tracking on, every Call button on the site dials `tel:+19565866887,,114`:
  the phone dials Twilio, pauses twice, then sends the code by itself.
- Twilio flow, all served by the site:

  | Twilio requests | What it does |
  |---|---|
  | `POST /api/voice/incoming` | Silent 6 s wait for 3 digits. None → asks once (Spanish then English). |
  | `POST /api/voice/route` | Looks up the code, logs the call, dials the clinic with the **patient's own number as caller ID**. Unknown code → never dials. |
  | `POST /api/voice/whisper` | Played **to the clinic only** on pick-up: *"Paciente de ClearCross Progreso."* |
  | `POST /api/voice/status` | Logs how it ended. No answer / busy → reads the clinic's direct number to the patient. |

- Every call is a row in `clearcross_calls` (caller, code, auto/typed, dial status,
  duration). **Nothing is ever recorded** — there is no `<Record>` anywhere, and a guard
  fails the build if one appears.
- Every webhook checks Twilio's `X-Twilio-Signature` with `TWILIO_AUTH_TOKEN`. No token
  set → **503**. Bad signature → **403**.

**Vercel env vars the code reads (production only):**

| Variable | Value | Effect |
|---|---|---|
| `TWILIO_AUTH_TOKEN` | the (rotated) auth token | turns the 4 webhooks on (503 → working) |
| `TWILIO_NUMBER` | `+19565866887` | the number the Call buttons dial |
| `TWILIO_ACCOUNT_SID` | `ACb1fb…` | not read by code today; stored for ops/debugging |
| `CALL_TRACKING` | exactly `on` | flips every Call button to the tracked link. Anything else (`true`, `ON`, missing) = buttons dial clinics directly |

`SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` are **already set** on
production (verified 2026-09-15) — the webhooks need them to log calls.

**Where the secrets are:** `C:\Users\mario\.claude\projects\C--Users-mario\memory\api_keys_vault.md`,
section *"Twilio (ClearCross call tracking)"* and the *Vercel (API Tokens)* table.
⛔ Never write a token into this repo, a commit, a doc, or chat output.

**Fixed identifiers:**
- Vercel project `prj_f2wscBG6LFXvEmAWaVIvPcdpQajG`, team `team_svzrJ92gcLJoU6bZXTJPw7EG`
- Supabase project `svgsbaahxiaeljmfykzp` (tables `clearcross_providers`, `clearcross_calls`, `clearcross_categories`)
- Live site `https://clearcrossprogreso.com` — ⛔ **apex only.** `www.` answers **308** on
  POST (measured 2026-09-15); Twilio will not follow it and the signature URL would not match.

---

## 1. Twilio account — reactivate, fund, confirm, secure

### 1.1 Log in **[MARIO]**
1. Open `https://console.twilio.com` in Chrome.
2. Log in with the Twilio account that owns the SID in `credentials.md` (`ACb1fb…c2f74`)
   (check `credentials.md` for the login email and the full SID; 2FA code goes to Mario).
3. At the top-left account switcher, confirm the **Account SID shown matches `ACb1fb…c2f74`**.
   If a different account is selected, switch to that one.

### 1.2 Find out WHY it is not active
As of 2026-09-15 the API answers `401`, code `20003`, *"status 4 is not active"*.
1. Look for a red/yellow banner on the console home page. Screenshot it.
2. Go to **Admin (top-right person icon) → Account → Billing** (or
   `console.twilio.com/us1/billing/manage-billing/billing-overview`).
3. Report which case it is:
   - **Suspended — negative balance / failed card** → go to 1.3.
   - **Suspended — compliance / fraud review** → STOP. Report the banner text. Mario has
     to answer Twilio support; nothing below will work until they lift it.
   - **Closed** → STOP. A closed account cannot be reopened. Report it; the plan becomes
     "new Twilio account + new number", and every value in §0 changes.

### 1.3 Add funds **[MARIO enters the card]**
1. **Billing → Add funds** (or *Payment methods → Add card* first if none is on file).
2. Add **$20** one time. That covers the number for months plus all testing.
3. **Auto-recharge: leave OFF** for now (turn it on only after a few weeks of real call
   volume shows what a month costs).
4. Wait until the banner disappears and the account reads **Active**.

**CHECK 1.3 (agent, terminal)** — use `curl`, not `twilio-pp-cli`, because
⛔ *the CLI exits 0 on a 401* and would report a dead account as fine:
```bash
SID='<Account SID from vault, ACb1fb…c2f74>'
TOK='<auth token from vault>'
curl -s -u "$SID:$TOK" "https://api.twilio.com/2010-04-01/Accounts/$SID.json" | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('status'), d.get('code'), d.get('message'))"
curl -s -u "$SID:$TOK" "https://api.twilio.com/2010-04-01/Accounts/$SID/Balance.json"
```
Pass = `active None None` and a positive `balance`.
Control (must FAIL, proves the check can fail): same first command with the token
changed by one character → must print a 401/20003.

### 1.4 Confirm the phone number still exists
A long-suspended account can have its numbers released.
1. Console → **Phone Numbers → Manage → Active numbers**.
2. Look for **+1 956 586 6887**. Confirm **Capabilities** shows **Voice**.
3. Note its **SID** (starts with `PN…`).

**CHECK 1.4 (agent, terminal):**
```bash
curl -s -u "$SID:$TOK" "https://api.twilio.com/2010-04-01/Accounts/$SID/IncomingPhoneNumbers.json?PhoneNumber=%2B19565866887" | python -c "import sys,json;d=json.load(sys.stdin);[print(n['sid'],n['phone_number'],n['capabilities'],n['voice_url']) for n in d['incoming_phone_numbers']] or print('NOT FOUND')"
```
- Found with `'voice': True` → record the `PN…` SID, continue.
- **NOT FOUND** → STOP and ask Mario before buying anything. If he says buy:
  **Phone Numbers → Buy a number → Country US → Number contains `956` → Capabilities:
  Voice → Buy** (a local 956 number, not toll-free). Then the new number replaces
  `+19565866887` everywhere below, including the vault.

### 1.5 Allow calls to Mexico
Every clinic is in Nuevo Progreso, Mexico. Twilio blocks outbound calls to Mexico by default
on many accounts; if blocked, every call dies after the code with error **13227 / 32205**.
1. Console → **Voice → Settings → Geo permissions**
   (`console.twilio.com/us1/develop/voice/settings/geo-permissions`).
2. Tab **Low risk** → section **North America** → tick **Mexico**.
   If Mexico is listed under **High risk** instead, tick it there and read the warning out
   to Mario before saving.
3. Confirm **United States** is also ticked (a few clinics use US numbers).
4. Click **Save**. Screenshot the saved state.
5. Do **not** enable any other countries.

### 1.6 Rotate the auth token (it was pasted in chat on 2026-09-13)
⛔ Do this **before** §3, or you will set a token on Vercel and then break it.
1. Console → **Admin → Account management → API keys & tokens**
   (`console.twilio.com/us1/account/keys-credentials/api-keys`) → **Auth tokens** section.
2. Click **Request a secondary token** (or *Create secondary auth token*). Copy it.
3. Click **Promote to primary**. Confirm. The old token (`3059…`) stops working.
4. Update the vault entry *"Auth token:"* with the new value and today's date, and delete
   the "pasted in chat — ROTATE" note.

**CHECK 1.6:** re-run CHECK 1.3 with the **new** token → `active`. Re-run with the **old**
token → must now fail with 401. Both results must be reported.

⛔ Do not create any API keys (`SK…`) — nothing in the code uses them.

---

## 2. Point the number at the site

### 2.1 Console path (agent may do this in Chrome)
1. Console → **Phone Numbers → Manage → Active numbers → click +1 956 586 6887**.
2. Tab **Configure** → section **Voice Configuration**:
   - **Configure with:** `Webhook, TwiML Bin, Function, Studio Flow, Proxy Service`
   - **A call comes in:** `Webhook`
   - **URL:** `https://clearcrossprogreso.com/api/voice/incoming`
   - **HTTP:** `HTTP POST`
   - **Primary handler fails:** leave **empty**
   - **Call status changes:** leave **empty** (the site already gets status via `/api/voice/status`)
   - **Caller Name Lookup (CNAM):** **Disabled**
   - Do **not** touch the **Messaging** section.
3. Click **Save configuration** at the bottom.

### 2.2 API alternative (same result)
```bash
PN='<PN… SID from 1.4>'
curl -s -u "$SID:$TOK" -X POST "https://api.twilio.com/2010-04-01/Accounts/$SID/IncomingPhoneNumbers/$PN.json" \
  --data-urlencode "VoiceUrl=https://clearcrossprogreso.com/api/voice/incoming" \
  --data-urlencode "VoiceMethod=POST" \
  --data-urlencode "VoiceFallbackUrl=" \
  --data-urlencode "StatusCallback="
```

**CHECK 2:** re-run the CHECK 1.4 command → the last column must read exactly
`https://clearcrossprogreso.com/api/voice/incoming` (no `www`, no trailing slash).

---

## 3. Stage A — turn the webhooks on, buttons STILL direct

Only the three Twilio variables. ⛔ **Do NOT set `CALL_TRACKING` yet.** After this stage the
Twilio number works if dialled by hand, but no visitor is routed through it.

### 3.1 Set the env vars (production only, encrypted)
```bash
VT='<Vercel token from vault>'
P=prj_f2wscBG6LFXvEmAWaVIvPcdpQajG; T=team_svzrJ92gcLJoU6bZXTJPw7EG
setenv () {
  curl -s -X POST "https://api.vercel.com/v10/projects/$P/env?teamId=$T&upsert=true" \
    -H "Authorization: Bearer $VT" -H "Content-Type: application/json" \
    -d "{\"key\":\"$1\",\"value\":\"$2\",\"type\":\"encrypted\",\"target\":[\"production\"]}" \
    | python -c "import sys,json;d=json.load(sys.stdin);print('$1', 'OK' if 'created' in d or 'key' in d else d)"
}
setenv TWILIO_AUTH_TOKEN  '<NEW rotated token>'
setenv TWILIO_NUMBER      '+19565866887'
setenv TWILIO_ACCOUNT_SID '<Account SID from vault, ACb1fb…c2f74>'
```
⛔ `production` only — a preview deploy holding a live telephony token is an unwatched door.

**CHECK 3.1 — read each value BACK.** The LIST endpoint returns no value for encrypted vars
and will look empty even when correct; read each one individually:
```bash
curl -s -H "Authorization: Bearer $VT" "https://api.vercel.com/v9/projects/$P/env?teamId=$T" \
 | python -c "import sys,json;[print(e['id'],e['key'],e['target']) for e in json.load(sys.stdin)['envs'] if e['key'].startswith(('TWILIO','CALL_'))]"
curl -s -H "Authorization: Bearer $VT" "https://api.vercel.com/v1/projects/$P/env/<ENV_ID>?teamId=$T" \
 | python -c "import sys,json;d=json.load(sys.stdin);v=d.get('value','');print(d['key'],len(v),v[:4]+'…')"
```
Pass = all three present, target `['production']`, token length 32, number `+195…`.
There must be **no** `CALL_TRACKING` row yet.

### 3.2 Redeploy (env is snapshotted at build time — values alone do nothing)
```bash
DPL=$(curl -s -H "Authorization: Bearer $VT" "https://api.vercel.com/v6/deployments?projectId=$P&teamId=$T&target=production&state=READY&limit=1" | python -c "import sys,json;print(json.load(sys.stdin)['deployments'][0]['uid'])")
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$T&forceNew=1" \
  -H "Authorization: Bearer $VT" -H "Content-Type: application/json" \
  -d "{\"name\":\"clearcrossprogreso\",\"deploymentId\":\"$DPL\",\"target\":\"production\"}" \
  | python -c "import sys,json;d=json.load(sys.stdin);print(d.get('id'),d.get('readyState'),d.get('error'))"
```
Poll `https://api.vercel.com/v13/deployments/<new id>?teamId=$T` until `readyState` = `READY`.
If it reads `ERROR`, STOP and fetch the build logs.

### 3.3 CHECK Stage A — the webhook moved from 503 to 403
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://clearcrossprogreso.com/api/voice/incoming < /dev/null
```
- Before Stage A this printed **503** (no token).
- Now it must print **403** (token present, unsigned request refused).
- Still 503 → the redeploy did not pick up the env. Do not continue.

### 3.4 CHECK Stage A — a correctly signed request gets real TwiML
Only `/incoming` and `/whisper` — they write nothing to the database.
```bash
cat > /tmp/sign.mjs <<'EOF'
import { createHmac } from 'node:crypto';
const [,, token, url] = process.argv;
const params = { CallSid: 'CAtest0000000000000000000000000000', From: '+19565550100' };
const data = Object.keys(params).sort().reduce((a, k) => a + k + params[k], url);
const sig = createHmac('sha1', token).update(Buffer.from(data, 'utf-8')).digest('base64');
const r = await fetch(url, { method: 'POST', headers: { 'x-twilio-signature': sig, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
console.log(r.status, (await r.text()).slice(0, 300));
EOF
node /tmp/sign.mjs '<NEW token>' https://clearcrossprogreso.com/api/voice/incoming
node /tmp/sign.mjs '<NEW token>' https://clearcrossprogreso.com/api/voice/whisper
node /tmp/sign.mjs 'wrong-token-0000000000000000000' https://clearcrossprogreso.com/api/voice/incoming
```
Pass:
- `/incoming` → `200 <?xml … <Gather input="dtmf" numDigits="3" timeout="6" action="/api/voice/route?attempt=1" …`
- `/whisper` → `200 … <Say language="es-MX">Paciente de ClearCross Progreso.</Say>`
- wrong token → `403 invalid signature` (the control).
Delete `/tmp/sign.mjs` afterwards (it had the token on its command line, not in the file,
but clear your shell history if it saved the command).

---

## 4. Create a private test clinic that rings Mario's cell

⛔ Never test against a real clinic. The test row is **`verified = false`**, so it never
appears on the site. Its code is used once and never reused (by design).

Needed from Mario: **the cell number that should ring** (the "clinic"), and a **second,
different phone** to place the call from (the "patient"). The patient phone must not be the
same as the clinic phone.

Run in the Supabase SQL editor for project `svgsbaahxiaeljmfykzp`, or via the Management API
(`reference_supabase_management_api_ddl` in memory — read the result back, the runner prints
`[]` either way):
```sql
INSERT INTO public.clearcross_providers (category_id, name, slug, phone, verified, description)
SELECT id, 'ZZ INTERNAL CALL TEST — do not publish', 'zz-internal-call-test',
       '<MARIO CELL, e.g. +19565551234>', false, 'Internal Twilio test row. Delete after testing.'
  FROM public.clearcross_categories WHERE slug = 'dentists'
RETURNING id, slug, phone, verified, call_code;
```
**CHECK 4:** the returned row has `verified = false` and a **non-null `call_code`** (the
trigger assigns it, expected 210 or higher). Write the code down as `TESTCODE`.
Confirm it is invisible: `https://clearcrossprogreso.com/dentists/zz-internal-call-test` must
**not** show the listing (404 or not-found).

---

## 5. Real phone tests **[MARIO holds the phones; agent watches the logs]**

How to put pauses in a number:
- **iPhone:** type `9565866887`, then long-press `*` until a **comma (,)** appears — twice —
  then the code. Result `9565866887,,210`. Press call.
- **Android (Google Phone / Samsung):** type the number, tap **⋮ → Add 2-sec pause** twice,
  then the code. Press call.

Run each test from the **patient phone**. Record the result of each in a table.

| # | Dial | Expected on patient phone | Expected on Mario's cell |
|---|---|---|---|
| T1 | `+19565866887,,TESTCODE` (iPhone) | ringing, then connected | rings; caller ID = **patient's number**; on answer hears *"Paciente de ClearCross Progreso"*, then both can talk |
| T2 | same, from an **Android** | same | same |
| T3 | `+19565866887,,TESTCODE`, Mario **declines / lets it ring out** | *"La clínica no contestó. The clinic did not answer."* then the clinic's direct number read digit by digit, then hang up | missed call |
| T4 | `+19565866887` with **no code**, wait | ~6 s silence, then Spanish + English prompt to enter the 3-digit code; then type `TESTCODE` on the keypad | rings like T1 |
| T5 | `+19565866887,,999` | *"No encontramos ese código"* then the prompt again; hang up | **must NOT ring** |
| T6 | `+19565866887` from a phone with **caller ID blocked** (`*67` first) | connects | rings; caller ID shows the **Twilio number** instead (expected) |

Caller ID note: some carriers replace a passed-through caller ID with the Twilio number or
"Unknown". If T1 shows the Twilio number instead of the patient's, report it — it is a
carrier behaviour, not a failure of the flow.

### CHECK 5 — every test left a correct log row
```sql
SELECT started_at, caller, code_entered, code_source, dial_status, duration_sec,
       (SELECT slug FROM clearcross_providers p WHERE p.id = c.provider_id) AS clinic
  FROM public.clearcross_calls c
 ORDER BY started_at DESC
 LIMIT 10;
```
Expected:
- T1/T2: `code_source = auto`, `dial_status = completed`, `duration_sec > 0`, clinic `zz-internal-call-test`
- T3: `dial_status` = `no-answer` or `busy`
- T4: `code_source = typed`
- T5: `code_entered = 999`, `code_source = none`, clinic null, **no dial_status**

Also open Twilio **Monitor → Logs → Errors** (`console.twilio.com/us1/monitor/logs/debugger/errors`)
for the test window. Any of these = STOP and report:
- **11200** HTTP retrieval failure (site unreachable / wrong URL)
- **12300** invalid content type
- **13227 / 32205** destination blocked → §1.5 not saved
- **21212 / 13214** invalid caller ID

T1 and T2 must both pass before Stage B. If only one OS passes (a phone that doesn't send
the paused digits), T4's typed path still works, but report it to Mario before continuing.

---

## 6. Stage B — switch the site on **[needs Mario's explicit "turn it on"]**

### 6.1 Set the switch and redeploy
```bash
setenv CALL_TRACKING on
```
Read it back (as CHECK 3.1: value must be exactly `on`, 2 characters, production only),
then redeploy exactly as §3.2 and wait for `READY`.

### 6.2 CHECK Stage B on the live site
```bash
curl -s https://clearcrossprogreso.com/dentists/dental-artistry | grep -o 'tel:[+0-9,]*' | sort | uniq -c
```
Pass:
- Every Call link reads `tel:+19565866887,,114`.
- ⛔ There must be **no** `tel:+19567428735` (Dental Artistry's direct number) left in a Call
  button.
- The JSON-LD `"telephone"` on the same page must still be the **clinic's real number**
  (that is deliberate — Google keeps the real number):
  ```bash
  curl -s https://clearcrossprogreso.com/dentists/dental-artistry | grep -o '"telephone":"[^"]*"'
  ```
- Spot-check one more clinic and one `/prices/dental-implant` row the same way.
- A clinic with **no phone** must still show no Call button.

### 6.3 One live end-to-end tap
The test clinic is hidden from the site, so it has no Call button to tap. Instead, text the
link `tel:+19565866887,,TESTCODE` to the patient phone, tap it, confirm Mario's cell rings,
and confirm a new `clearcross_calls` row appears. ⛔ Do not tap a real clinic's button unless
Mario says so.

---

## 7. Clean up and record

1. Delete the test data, then **re-read** to prove it is gone:
   ```sql
   DELETE FROM public.clearcross_calls
    WHERE provider_id = (SELECT id FROM clearcross_providers WHERE slug='zz-internal-call-test')
       OR code_entered = '999';
   DELETE FROM public.clearcross_providers WHERE slug = 'zz-internal-call-test' RETURNING slug, call_code;
   SELECT count(*) FROM clearcross_providers WHERE slug='zz-internal-call-test';   -- must be 0
   ```
   (Its code is never reused, by design — that is fine.)
2. Vault (`api_keys_vault.md`, Twilio section): new token + date, number **verified**, status
   **ACTIVE**, geo permission Mexico **on**, webhook URL, "CALL_TRACKING on since <date>".
3. `STATE.md` in this repo: add a dated section with every CHECK result and the test table.
4. Send Mario the voice memo + text summary.

---

## 8. Rollback (any time, ~2 minutes)

Something wrong with live calls → turn the buttons back to direct dialing:
```bash
# find the CALL_TRACKING env id (CHECK 3.1 list command), then:
curl -s -X DELETE "https://api.vercel.com/v9/projects/$P/env/<CALL_TRACKING_ENV_ID>?teamId=$T" -H "Authorization: Bearer $VT"
```
Redeploy (§3.2), wait for `READY`, confirm Dental Artistry's Call button is back to
`tel:+19567428735`. Leave the Twilio variables in place — with `CALL_TRACKING` gone they are
inert, and anyone who already has the tracked number in their call history still gets
connected.

---

## 9. Never do

- ⛔ Never add call **recording**, voicemail, or transcription.
- ⛔ Never set `CALL_TRACKING` before T1 and T2 pass.
- ⛔ Never use the `www.` URL for the webhook.
- ⛔ Never enable SMS, buy extra numbers, create API keys, or turn on auto-recharge without Mario.
- ⛔ Never test by calling a real clinic.
- ⛔ Never change or renumber a clinic's `call_code`.
- ⛔ Never trust `twilio-pp-cli`'s exit code (it exits 0 on a 401) — read the JSON.
- ⛔ Never put a token in the repo, a commit, a screenshot, or chat.
- ⛔ `clearcross_calls.caller` is a patient's phone number — never export it or show it anywhere public.
- No code change and no `git push` is part of this runbook. If something seems to need one, STOP and ask.
