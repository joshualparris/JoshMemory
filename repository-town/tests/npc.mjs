// Residents and villagers: replies come from the town's AI proxy (a Cloudflare Worker
// that holds the Groq key — stubbed here, so no network is needed); when the proxy is
// down they answer offline from the house's facts and the town's life. No key is ever
// stored in the browser.   node tests/npc.mjs [--url u] [--house H1]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const HOUSE = opt('--house', 'H1');
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 }, locale: 'en-US' });
const calls = [];
let proxyUp = false;
// Stand-in for the npc-chat proxy: down at first, then answering.
await page.route('**/api/npc-chat', async (route) => {
  const body = JSON.parse(route.request().postData() || '{}');
  calls.push(body);
  if (!proxyUp) return route.abort('connectionrefused');
  return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ reply: 'STUB REPLY from the resident.' }) });
});
await page.route('https://api.groq.com/**', (route) => { calls.push({ direct: true }); return route.abort(); });

async function openResident() {
  await page.evaluate((c) => window.__town.travel(c), HOUSE);
  await page.waitForTimeout(600);
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__town.state().mode === 'house', null, { timeout: 20000 });
  await page.keyboard.up('w');
  const npc = (await page.evaluate(() => window.__town.state())).interactables.find((x) => x.do === 'npc');
  check(!!npc, `${HOUSE} has a resident (${npc?.label})`);
  await page.evaluate((k) => window.__town.approach(k), npc.key);
  await page.waitForFunction((k) => window.__town.state().near === k, npc.key, { timeout: 8000 });
  await page.keyboard.press('e');
  await page.waitForSelector('#panel .chat-input', { timeout: 8000 });
}
const say = async (text) => {
  const before = await page.locator('#panel .chat-log .npc:not(.thinking)').count();
  await page.fill('#panel .chat-input', text); await page.press('#panel .chat-input', 'Enter');
  await page.waitForFunction((n) => document.querySelectorAll('#panel .chat-log .npc:not(.thinking)').length > n, before, { timeout: 15000 });
  return page.locator('#panel .chat-log .npc:not(.thinking)').last().innerText();
};

await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
await page.evaluate(() => { localStorage.setItem('repository-town.groq-keys', '["gsk_old"]'); localStorage.removeItem('repository-town.npc-chats'); });
await page.reload();
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
check(await page.evaluate(() => localStorage.getItem('repository-town.groq-keys') === null), 'old browser-stored Groq keys are purged on load');

// 1. Proxy down: the resident still answers, from the house's facts.
await openResident();
const r1 = await say('hello');
check(/(I'm \w+|\w+'s the name)/.test(r1) && /Offline/.test(r1), `offline greeting: "${r1.slice(0, 80)}"`);
const r2 = await say('what games can I play?');
check(r2.length > 20, `offline games answer: "${r2.slice(0, 70)}"`);
const r3 = await say('what did you eat today?');
check(/bread|Bakery|eggs/.test(r3), `offline town-life answer: "${r3.slice(0, 80)}"`);

// 2. Proxy up: the reply comes from it, carrying the house facts and the town's life.
proxyUp = true;
const r4 = await say('Tell me about this place');
check(r4.includes('STUB REPLY'), `proxy reply shown: "${r4.slice(0, 60)}"`);
const last = calls.at(-1);
check(last?.resident?.coordinate === HOUSE && last.resident.houseName && Array.isArray(last.resident.rooms), 'request carries the house facts');
check(/Right now at home/.test(last?.resident?.personality || '') && /It is \d\d:\d\d, day \d+/.test(last?.resident?.social?.gossip || ''), 'request carries the town clock, news and what the resident is doing');
check(!calls.some((c) => c.direct), 'the browser never calls Groq directly');
console.log('request:', JSON.stringify(last?.resident).length, 'chars');
await page.click('#panel-close');

// 3. A villager out in town: their job and last meal reach the proxy too.
// Pick a villager with no street character close by, so E talks to the villager.
for (let i = 0; i < 12; i++) {
  await page.evaluate((i) => window.__town.meetVillager(i), i);
  const ok = await page.waitForFunction(() => /^villager:/.test(window.__town.state().nearPerson || '') && !window.__town.state().nearNPC, null, { timeout: 3000 }).catch(() => null);
  if (ok) break;
}
await page.keyboard.press('e');
await page.waitForSelector('#panel .chat-input', { timeout: 8000 });
await say('hi');
check(/Right now: .*Last meal: /.test(calls.at(-1)?.resident?.personality || '') && calls.at(-1)?.resident?.role === 'villager', `villager context: "${(calls.at(-1)?.resident?.personality || '').slice(0, 120)}"`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll resident checks passed.');
process.exit(fails.length ? 1 : 0);
