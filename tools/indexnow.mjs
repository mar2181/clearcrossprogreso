/**
 * Tell Bing (and every IndexNow engine: Yandex, Seznam, Naver, Yep, Amazon) that
 * the site's URLs exist or changed. Run it AFTER a deploy that adds or changes
 * pages:  node tools/indexnow.mjs            (dry run: prints what it would send)
 *         node tools/indexnow.mjs --send
 *
 * ⛔ GOOGLE DOES NOT READ INDEXNOW (indexnow.org/faq lists the participants and
 * Google is not one). For Google the levers are the sitemap and Search Console's
 * URL Inspection "Request indexing". Do not reach for Google's Indexing API
 * either: it is restricted to JobPosting / BroadcastEvent pages and abusing it
 * can revoke access.
 *
 * ⛔ The URL list is the LIVE sitemap, never a list built here, so this cannot
 * announce a URL the site does not serve. And it refuses to send until the key
 * file answers with the key: an engine that cannot fetch the key discards the
 * submission, and a 200 from the API would read as success anyway.
 */
import fs from 'node:fs';

const HOST = 'clearcrossprogreso.com';
const SEND = process.argv.includes('--send');

const keyFile = fs.readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error('no IndexNow key file in public/'); process.exit(2); }
const key = fs.readFileSync(`public/${keyFile}`, 'utf8').trim();
const keyLocation = `https://${HOST}/${keyFile}`;

const live = await fetch(keyLocation).then(async (r) => (r.ok ? (await r.text()).trim() : `HTTP ${r.status}`)).catch((e) => String(e));
if (live !== key) {
  console.error(`key file is not live yet at ${keyLocation} (got: ${live.slice(0, 60)}) — deploy first`);
  process.exit(3);
}

const xml = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(`https://${HOST}`));
if (urls.length === 0) { console.error('control: the live sitemap yielded no URLs'); process.exit(4); }
console.log(`${urls.length} URLs from the live sitemap; key file live`);

if (!SEND) { console.log('dry run — pass --send to submit'); process.exit(0); }

// IndexNow accepts up to 10,000 URLs per POST.
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow answered HTTP ${res.status} ${await res.text()}`);
// 200 = accepted, 202 = accepted pending key validation. Anything else failed.
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
