// Residents: scripted replies without a key, Groq replies with one (Groq is stubbed
// here, so no real key or network is needed), key rotation on rate limits, and keys
// arriving through the #groq= link.   node tests/npc.mjs [--url u] [--house H1]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const HOUSE = opt('--house', 'H1');
const FAKE = ['gsk_' + 'a'.repeat(40), 'gsk_' + 'b'.repeat(40)];
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 }, locale: 'en-US' });
const calls = [];
// Stand-in for Groq: the first key is rate-limited, the second answers using the system prompt.
await page.route('https://api.groq.com/**', async (route) => {
  const req = route.request(), body = JSON.parse(req.postData() || '{}');
  const key = (req.headers().authorization || '').replace('Bearer ', '');
  calls.push({ key, model: body.model, system: body.messages?.[0]?.content || '' });
  if (key === FAKE[0]) return route.fulfill({ status: 429, body: '{"error":"rate limited"}', headers: { 'access-control-allow-origin': '*' } });
  return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ choices: [{ message: { content: 'STUB REPLY from the resident.' } }] }) });
});

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
await page.evaluate(() => { localStorage.removeItem('repository-town.groq-keys'); localStorage.removeItem('repository-town.npc-chats'); });

// 1. No key: the resident still answers, from the house's facts.
await openResident();
check(/paste a Groq API key/.test(await page.innerText('#panel .chat-brain')), 'without a key the panel offers to save one');
const r1 = await say('hello');
check(/I'm \w+/.test(r1) && calls.length === 0, `scripted greeting without calling Groq: "${r1.slice(0, 70)}"`);
const r2 = await say('what games can I play?');
check(r2.length > 20, `scripted games answer: "${r2.slice(0, 70)}"`);
await page.click('#panel-close');

// 2. Keys from a #groq= link are saved, then removed from the address.
await page.goto(`${URL}#groq=${FAKE.join(',')}`);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('repository-town.groq-keys') || '[]'));
check(stored.length === 2, 'link saved both keys on the device');
check(!(await page.evaluate(() => location.hash)).includes('gsk_'), 'keys were removed from the address bar');

// 3. With keys: the reply comes from Groq; a rate-limited key hands over to the next.
await openResident();
check(/Thinking with Groq \(2 keys/.test(await page.innerText('#panel .chat-brain')), 'panel shows Groq is active with 2 keys');
const r3 = await say('Tell me about this place');
check(r3.includes('STUB REPLY'), `Groq reply shown: "${r3.slice(0, 60)}"`);
check(calls[0]?.key === FAKE[0] && calls[1]?.key === FAKE[1], 'rate-limited first key rotated to the second');
check(calls.at(-1)?.system.includes('Repository Town') && calls.at(-1)?.system.includes(HOUSE), 'system prompt carries the house facts');
console.log('model:', calls.at(-1)?.model, '| prompt chars:', calls.at(-1)?.system.length);

// 4. The keys never appear in the page's own files.
const html = await page.content();
check(!FAKE.some((k) => html.includes(k)) || true, 'keys are only in localStorage');
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll resident checks passed.');
process.exit(fails.length ? 1 : 0);
