/**
 * Provision (or update) this site's concierge row on the Pet Buddy platform.
 *
 * ⛔ WHY THIS EXISTS AT ALL — no shipped tool on the platform can do it.
 *   - `petconcierge/scripts/provision_live_agent_local.py` hard-requires a
 *     live-agent BUILD JOB (`state.json` in Supabase Storage). Dr. Leo was
 *     built by a different path and has no job, so the script cannot run.
 *   - `POST /api/build-live-agent-provision` hardcodes `business_url` to
 *     petbuddyconcierge.com — so the token mint 403s on the client's own
 *     domain — and writes `kb_markdown: null`, so the agent knows nothing.
 *   - The onboarding wizard mints against its own site, not this one.
 * So: a direct service-role write, shaped like the working rows.
 *
 * ⛔ `business_url` IS THE ENTIRE ORIGIN ALLOWLIST and it is SINGLE-VALUED
 * (`petconcierge/lib/cors.ts embedOriginAllowedForAgent`: exact host, www<->apex,
 * or a subdomain of the same apex). A mismatch is
 * `403 "This pet is not enabled for this site"`, which in a browser looks like
 * a concierge who renders perfectly and never speaks.
 *
 * ⛔ THE TWO EXISTING "Dr. Leo" ROWS BELONG TO petbuddyconcierge.com.
 * Do not reuse them and do not PATCH them — they serve the Pet Buddy marketing
 * site. ClearCross gets its own row. Passing `--agent-id` targets one row and
 * one row only; without it this tool CREATES.
 *
 * Usage:
 *   node tools/provision-concierge.mjs --character leo --dry-run
 *   node tools/provision-concierge.mjs --character leo
 *   node tools/provision-concierge.mjs --character leo --agent-id agent_xxx   # update
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const DRY = process.argv.includes("--dry-run");
const CHARACTER = arg("--character", "leo").toLowerCase();
const ENV_FILE = arg("--env-file", join(ROOT, "..", "petconcierge", ".env"));

/*
 * ⛔ The site config is read as TEXT, not imported. `lib/concierge.ts` is a
 * TypeScript module and this repo is on a Node whose type-stripping is not
 * guaranteed; a failed import here would be indistinguishable from a missing
 * config. Three fields, three anchored regexes, and a loud failure if any is
 * absent — so a rename cannot silently provision against a default.
 */
const cfgSrc = readFileSync(join(ROOT, "lib", "concierge.ts"), "utf8");
const field = (name) => {
  const m = cfgSrc.match(new RegExp(`\\b${name}:\\s*'([^']*)'`));
  if (!m) {
    console.error(`REFUSING — could not read "${name}" from lib/concierge.ts.`);
    process.exit(1);
  }
  return m[1];
};
const SITE_URL = field("siteUrl");
const BUSINESS_NAME = field("businessName");
const CONTACT_EMAIL = field("fallbackEmail");
const PLATFORM = field("origin");

if (!/^https:\/\//.test(SITE_URL)) {
  console.error(`REFUSING — siteUrl is "${SITE_URL}", which cannot be an origin allowlist.`);
  process.exit(1);
}

/* ── credentials ─────────────────────────────────────────────────────────── */
if (!existsSync(ENV_FILE)) {
  console.error(`No env file at ${ENV_FILE}. Pass --env-file <path>.`);
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(ENV_FILE, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const SB = env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB || !KEY) {
  console.error(`SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from ${ENV_FILE}`);
  process.exit(1);
}

const rest = (path, init = {}) =>
  fetch(`${SB}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers || {}),
    },
  });

/*
 * ⛔ PROVE THIS IS PRODUCTION BEFORE WRITING. `petconcierge/.env` has pointed at
 * a retired Supabase project before, and a row written to the wrong one produces
 * a token that 401s on the client's page with nothing anywhere explaining why.
 * The test is a known-live agent, not the URL.
 */
const canary = await rest(
  "petbuddy_agents?agent_id=eq.agent_juniorsupermarkets68ccf908ff&select=agent_id",
);
const canaryRows = canary.ok ? await canary.json() : [];
if (canaryRows.length !== 1) {
  console.error(`REFUSING — ${SB} does not contain the known-live canary agent.`);
  console.error("  This is probably not the production project. Check petconcierge/.env.");
  process.exit(1);
}
console.log(`db          : ${SB.replace(/^https:\/\/([a-z]+)\..*/, "$1")}  (canary found)`);

/* ── the character, checked against the live platform, not assumed ───────── */
const manifestRes = await fetch(`${PLATFORM}/live-agents/manifest.json`);
if (!manifestRes.ok) {
  console.error("Could not read the platform's character manifest.");
  process.exit(1);
}
const roster = await manifestRes.json();
const character = (Array.isArray(roster) ? roster : roster.agents).find((a) => a.slug === CHARACTER);
if (!character) {
  console.error(`REFUSING — "${CHARACTER}" is not a character on the platform.`);
  process.exit(1);
}
const NAME = character.name;
const VOICE = character.geminiVoice;
if (!VOICE) {
  console.error(`REFUSING — "${CHARACTER}" has no geminiVoice in the manifest.`);
  console.error("  An unmapped voice falls through to another character's — a bug you can only hear.");
  process.exit(1);
}
console.log(`character   : ${CHARACTER} / ${NAME} / voice ${VOICE}`);

/*
 * ⛔ THE BODY MUST ACTUALLY EXIST ON THE CDN. The manifest is a list of
 * intentions; a character can be listed and have no clips, and the failure is a
 * concierge who never appears while every log stays clean. Six files, and a
 * control filename that MUST 404 — without the control, a CDN that answers 200
 * for everything (a catch-all rewrite) would read as perfect health.
 */
const clips = ["walk", "idle", "talk"].flatMap((m) => [
  `${CHARACTER}-${m}.webm`,
  `${CHARACTER}-${m}.pak.mp4`,
]);
const heads = await Promise.all(
  [...clips, `${CHARACTER}-control-does-not-exist.webm`].map((f) =>
    fetch(`${PLATFORM}/live-agents/${CHARACTER}/${f}`, { method: "HEAD" }).then((r) => r.status),
  ),
);
const control = heads.pop();
if (heads.some((s) => s !== 200) || control === 200) {
  console.error(`REFUSING — clip check failed. statuses=${heads.join(",")} control=${control}`);
  console.error(control === 200 ? "  The control returned 200: this CDN answers 200 for anything." : "  A clip is missing.");
  process.exit(1);
}
console.log(`clips       : 6/6 present on the CDN (control 404s)`);

/* ── the generated content ───────────────────────────────────────────────── */
const read = (f) => {
  const p = join(ROOT, "concierge", f);
  if (!existsSync(p)) {
    console.error(`Missing ${p} — run: node tools/build-concierge-kb.mjs`);
    process.exit(1);
  }
  return readFileSync(p, "utf8");
};
const kb = read("kb.md");
const persona = read(`persona-${CHARACTER}.md`);
const navHint = read("nav-hint.txt");

/*
 * ⛔ REFUSE A THIN KB. `lib/composePrompt.ts` drops a grounding section under
 * 40 chars ENTIRELY, so a thin KB ships a concierge with a persona and no facts
 * — which does not go quiet, it invents, in the client's voice. On a medical
 * price site that is the worst thing this can do.
 */
if (kb.trim().length < 400) {
  console.error("REFUSING — the knowledge base is too thin to ground anything.");
  process.exit(1);
}

/* ── the row ─────────────────────────────────────────────────────────────── */
const existingId = arg("--agent-id", null);

/*
 * ⛔ NEVER PATCH ANOTHER SITE'S ROW. Two "Dr. Leo" rows already exist on
 * petbuddyconcierge.com. If an --agent-id is passed, check whose it is before
 * writing — an update aimed at the wrong row silently repoints a live agent on
 * a different website at this one's knowledge base.
 */
if (existingId) {
  const owner = await rest(
    `petbuddy_agents?agent_id=eq.${encodeURIComponent(existingId)}&select=agent_id,business_url,pet_name`,
  );
  const [row] = owner.ok ? await owner.json() : [];
  if (!row) {
    console.error(`REFUSING — no row with agent_id ${existingId}.`);
    process.exit(1);
  }
  if (row.business_url && row.business_url !== SITE_URL) {
    console.error(`REFUSING — ${existingId} belongs to ${row.business_url}, not ${SITE_URL}.`);
    console.error("  Updating it would repoint another site's live concierge. Create a new row instead.");
    process.exit(1);
  }
}

const mintId = () =>
  `agent_${BUSINESS_NAME.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24)}${randomUUID().replace(/-/g, "").slice(0, 10)}`;

const greeting = `Hi, I'm ${NAME} — I can answer questions about ClearCross or show you around the site.`;

/*
 * ⛔ `live_avatar` MAY NOT EXIST IN THIS PROJECT, and today it does not.
 * With the column absent, `/api/live-avatar` answers null, `live-agent.js`
 * fails open, and the body is chosen entirely by `data-avatar` on the tag.
 * ⛔ This is a PROBE, not an assumption in either direction: the day that
 * migration lands, the column starts OVERRIDING the tag, and a row that omits
 * it would silently serve the platform default (Vera) instead of Dr. Leo.
 */
const probe = await rest("petbuddy_agents?select=live_avatar&limit=1");
const HAS_LIVE_AVATAR = probe.ok;
console.log(
  `live_avatar : ${HAS_LIVE_AVATAR ? "column present — writing it (it overrides data-avatar)" : "column ABSENT — the body comes from data-avatar"}`,
);

const row = {
  ...(HAS_LIVE_AVATAR ? { live_avatar: CHARACTER } : {}),
  business_name: BUSINESS_NAME,
  business_url: SITE_URL,
  backend: "geminilive",
  product: "site",
  pet_name: NAME,
  live_voice: VOICE,
  greeting,
  base_prompt: persona,
  kb_markdown: kb,
  nav_hint: navHint,
  voice_id: VOICE.toLowerCase(),
  contact_email: CONTACT_EMAIL,
};

console.log(`business_url: ${SITE_URL}`);
console.log(`kb          : ${kb.length} chars   persona: ${persona.length}   nav: ${navHint.trim().split("\n").length} lines`);

if (DRY) {
  console.log("\n--dry-run: nothing written. Row would be:");
  console.log(
    JSON.stringify(
      { ...row, base_prompt: `<persona ${persona.length}c>`, kb_markdown: `<kb ${kb.length}c>`, nav_hint: `<nav>` },
      null,
      2,
    ),
  );
  process.exit(0);
}

let res, verb;
if (existingId) {
  verb = "updated";
  res = await rest(`petbuddy_agents?agent_id=eq.${encodeURIComponent(existingId)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
} else {
  verb = "created";
  row.agent_id = mintId();
  row.owner_token = randomUUID().replace(/-/g, "");
  res = await rest("petbuddy_agents", { method: "POST", body: JSON.stringify(row) });
}

const body = await res.text();
if (!res.ok) {
  console.error(`FAILED HTTP ${res.status}: ${body.slice(0, 500)}`);
  process.exit(1);
}
const [saved] = JSON.parse(body);
if (!saved) {
  // A PATCH that matches no row returns 200 with [] — a phantom success.
  console.error(`FAILED — no row matched ${existingId}. Nothing was written.`);
  process.exit(1);
}

console.log(`\n${verb}: ${saved.agent_id}`);
if (verb === "created") console.log(`owner_token (the client's dashboard credential): ${saved.owner_token}`);
console.log(`\nNow set in lib/concierge.ts:  agentId: "${saved.agent_id}"`);
