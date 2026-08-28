/**
 * Is Dr. Leo actually going to work on this site? Run this before a demo.
 *
 * ⛔ A 200 FROM THE MINT IS NOT A WORKING VOICE, and that is the whole reason
 * this file exists. On an account whose credits are gone the mint returns HTTP
 * 200 with a real, correctly signed ephemeral token — because minting one
 * spends nothing — and the socket then closes without ever completing setup.
 * Every check below is behavioural, and the last one opens a real socket.
 *
 * ⛔ EVERY POSITIVE CHECK HAS A CONTROL. A CDN with a catch-all rewrite answers
 * 200 for a filename that does not exist; a permissive CORS config answers 200
 * for any origin. Without a control whose answer is already known, both read as
 * perfect health.
 *
 * Exit codes are distinct so this can gate a script:
 *   0 all good · 2 config · 3 row · 4 origin allowlist · 5 clips · 6 voice dead
 *
 * Usage: node tools/concierge-preflight.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = readFileSync(join(ROOT, "lib", "concierge.ts"), "utf8");
const field = (n) => (cfg.match(new RegExp(`\\b${n}:\\s*'([^']*)'`)) || [])[1];

const AGENT = field("agentId");
const SITE = field("siteUrl");
const PLATFORM = field("origin");
const AVATAR = field("avatar");
const NAME = field("name");

let bad = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m, code) => {
  console.log(`  FAIL  ${m}`);
  bad = bad || code;
};

console.log(`concierge preflight — ${NAME} (${AVATAR}) on ${SITE}\n`);

/* 1. config ─────────────────────────────────────────────────────────────── */
if (!AGENT) {
  console.log("  FAIL  lib/concierge.ts has no agentId — run tools/provision-concierge.mjs");
  process.exit(2);
}
if (!/^https:\/\//.test(SITE || "")) {
  console.log(`  FAIL  siteUrl "${SITE}" cannot be an origin allowlist`);
  process.exit(2);
}
ok(`config: ${AGENT}`);

/* 2. the character exists on the platform ───────────────────────────────── */
const manifest = await fetch(`${PLATFORM}/live-agents/manifest.json`).then((r) => (r.ok ? r.json() : null));
const character = manifest
  ? (Array.isArray(manifest) ? manifest : manifest.agents).find((a) => a.slug === AVATAR)
  : null;
if (!character) fail(`"${AVATAR}" is not a character on the platform`, 5);
else ok(`character ${AVATAR} — ${character.name}, voice ${character.geminiVoice}`);

/* 3. the body is really on the CDN, with a control ──────────────────────── */
const clips = ["walk", "idle", "talk"].flatMap((m) => [`${AVATAR}-${m}.webm`, `${AVATAR}-${m}.pak.mp4`]);
const statuses = await Promise.all(
  [...clips, `${AVATAR}-control-does-not-exist.webm`].map((f) =>
    fetch(`${PLATFORM}/live-agents/${AVATAR}/${f}`, { method: "HEAD" }).then((r) => r.status).catch(() => 0),
  ),
);
const control = statuses.pop();
if (control === 200) fail("the CDN answers 200 for a filename that does not exist — clip checks are meaningless", 5);
else if (statuses.some((s) => s !== 200)) fail(`a clip is missing (${statuses.join(",")})`, 5);
else ok(`6/6 clips on the CDN (control 404s)`);

/* 4. the mint, from the real origin AND from a control origin ───────────── */
const mint = (origin) =>
  fetch(`${PLATFORM}/api/voice-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ token: AGENT }),
  });

const real = await mint(SITE);
const bogus = await mint("https://not-this-site.example.com");

if (real.status !== 200) fail(`mint from ${SITE} returned ${real.status} (expected 200)`, 4);
if (bogus.status === 200)
  fail("mint from an UNRELATED origin also returned 200 — the allowlist is not doing anything", 4);
if (real.status === 200 && bogus.status !== 200) ok(`origin allowlist holds (real 200, control ${bogus.status})`);

let session = null;
if (real.status === 200) {
  session = await real.json();

  /*
   * ⛔ THE ROW MUST AGREE WITH THE TAGS. `pet_name` is what the platform speaks
   * and displays; `data-name` in the component is what the site displays. A
   * disagreement is a face arriving under someone else's name, and nothing
   * anywhere reports it.
   */
  if (session.pet_name !== NAME) fail(`row says pet_name "${session.pet_name}", the site says "${NAME}"`, 3);
  else ok(`name agrees: ${NAME}`);

  if (character && session.voice !== character.geminiVoice)
    fail(`row voice "${session.voice}" is not ${AVATAR}'s registered voice "${character.geminiVoice}"`, 3);
  else if (character) ok(`voice agrees: ${session.voice}`);

  // A persona with no facts does not go quiet — it invents, in the client's voice.
  const sys = session.system || "";
  if (sys.length < 2000) fail(`system prompt is only ${sys.length} chars — the knowledge base is not reaching him`, 3);
  else ok(`system prompt ${sys.length} chars`);
}

/* 5. THE ONE THAT MATTERS: does the socket reach setupComplete? ─────────── */
/*
 * ⛔ The setup payload must mirror embed.js's own (its line ~5622). An empty
 * `{setup:{}}` closes 1007 "token-based requests cannot use project-scoped
 * features", which reads exactly like a dead account and is really a malformed
 * probe. Both service names are tried, as embed.js does.
 */
if (session?.token) {
  const HOST = "wss://generativelanguage.googleapis.com/ws/";
  const PATHS = [
    "google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained",
    "google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent",
  ];
  const payload = {
    setup: {
      model: "models/" + (session.model || "gemini-3.1-flash-live-preview"),
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: session.voice || "Kore" } } },
      },
      systemInstruction: { parts: [{ text: session.system || "" }] },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  };
  const attempt = (i) =>
    new Promise((resolve) => {
      const ws = new WebSocket(`${HOST}${PATHS[i]}?access_token=${encodeURIComponent(session.token)}`);
      const t = setTimeout(() => {
        try { ws.close(); } catch {}
        resolve({ ok: false, why: "timeout 25s" });
      }, 25000);
      ws.onopen = () => ws.send(JSON.stringify(payload));
      ws.onmessage = async (ev) => {
        const txt = typeof ev.data === "string" ? ev.data : await ev.data.text();
        if (txt.includes("setupComplete")) {
          clearTimeout(t);
          try { ws.close(); } catch {}
          resolve({ ok: true });
        }
      };
      ws.onclose = (e) => { clearTimeout(t); resolve({ ok: false, why: `closed ${e.code} ${e.reason || ""}` }); };
      ws.onerror = () => {};
    });

  let alive = false;
  let why = "";
  for (let i = 0; i < PATHS.length && !alive; i++) {
    const r = await attempt(i);
    alive = r.ok;
    why = r.why || why;
  }
  if (alive) ok("the voice session reaches setupComplete — he can actually speak");
  else fail(`the socket never completed setup (${why}) — he will render and stay silent`, 6);
}

console.log(bad ? `\nPREFLIGHT FAILED (exit ${bad})` : `\nPREFLIGHT PASSED — ${NAME} is ready on ${SITE}`);
process.exit(bad);
