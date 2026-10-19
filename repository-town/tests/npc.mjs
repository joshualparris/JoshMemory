// Residents: scripted replies without an access code, server-side proxy replies with
// an access code (/api/npc-chat stubbed here), 401 access-code rejection recovery,
// and automatic purging of any legacy localStorage Groq keys.
//   node tests/npc.mjs [--url u] [--house H1]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const URL = opt('--url', 'http://localhost:8091/');
const HOUSE = opt('--house', 'H1');
const VALID_CODE = 'playtest-pin-2026';
const fails = [];
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) fails.push(what); };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 }, locale: 'en-US' });
const calls = [];
let directGroqCalls = 0;
await page.route('https://api.groq.com/**', async (route) => {
  directGroqCalls++;
  return route.abort();
});
await page.route('**/api/npc-chat', async (route) => {
  const req = route.request(), body = JSON.parse(req.postData() || '{}');
  const code = req.headers()['x-npc-code'] || '';
  calls.push({ code, npcId: body.npcId, resident: body.resident, messages: body.messages });
  if (code !== VALID_CODE) {
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Incorrect access code.' }) });
  }
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ npcId: body.npcId, reply: 'STUB REPLY from the server proxy.' }) });
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

// Seed a legacy localStorage Groq key before loading to verify it gets purged on startup.
await page.addInitScript(() => {
  if (!sessionStorage.getItem('__seeded_legacy')) {
    localStorage.setItem('repository-town.groq-keys', JSON.stringify(['gsk_' + 'x'.repeat(40)]));
    sessionStorage.setItem('__seeded_legacy', '1');
  }
});

await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
check((await page.evaluate(() => localStorage.getItem('repository-town.groq-keys'))) === null, 'legacy localStorage Groq keys are purged on load');
await page.evaluate(() => { sessionStorage.removeItem('town-npc-code'); localStorage.removeItem('repository-town.npc-chats'); });

// 1. No access code: the resident answers from the house's facts without calling the proxy.
await openResident();
check(/Enter playtest access code/.test(await page.innerText('#panel .chat-brain')), 'without an access code the panel offers to save one');
const r1 = await say('hello');
check(/I'm \w+/.test(r1) && calls.length === 0, `scripted greeting without calling proxy: "${r1.slice(0, 70)}"`);
const r2 = await say('what games can I play?');
check(r2.length > 20, `scripted games answer: "${r2.slice(0, 70)}"`);

// 2. Saving a valid access code in the resident panel stores it in sessionStorage and proxies through /api/npc-chat.
await page.fill('#panel .chat-key', VALID_CODE);
await page.click('#panel .chat-save');
check(/Live AI enabled via server proxy/.test(await page.innerText('#panel .chat-brain')), 'panel shows server proxy is active');
check((await page.evaluate(() => sessionStorage.getItem('town-npc-code'))) === VALID_CODE, 'access code stored in sessionStorage only');
const r3 = await say('Tell me about this place');
check(r3.includes('STUB REPLY'), `proxy reply shown: "${r3.slice(0, 60)}"`);
check(calls.length === 1 && calls[0].code === VALID_CODE, 'proxy called with x-npc-code header');
check(calls[0].resident?.coordinate === HOUSE && Array.isArray(calls[0].resident?.rooms), 'proxy payload carries structured house context');

// 3. An invalid access code (401) is cleared and falls back to scripted dialogue.
await page.evaluate(() => sessionStorage.setItem('town-npc-code', 'wrong-pin'));
const r4 = await say('hello');
check(r4.includes('Incorrect access code') && (await page.evaluate(() => sessionStorage.getItem('town-npc-code'))) === null, '401 clears invalid access code and falls back to scripted reply');
check(directGroqCalls === 0, 'browser never called api.groq.com directly');

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nAll resident checks passed.');
process.exit(fails.length ? 1 : 0);
