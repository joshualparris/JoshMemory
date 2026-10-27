// Real Chromium: a torch waits at the Town Guide kiosk; picking it up puts it in your bag and in
// your hand; F switches its light on and off; the bag (🎒 / I) lists it with hold, put away and
// drop actions, alongside food from the farmers' market. Desktop keyboard.
//   node tests/inventory-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  const inv = () => page.evaluate(() => window.__town.inventory());
  await page.evaluate(() => window.__town.closePanel?.());
  step((await inv()).items.length === 0, 'start with an empty bag');
  // Stand beside the kiosk torch, facing it, and pick it up.
  await page.evaluate(() => { window.__town.meetGuide(); window.__town.closePanel?.(); const p = window.__town.state().pos; window.__town.place(p.x + 1.4, p.z - 0.4, Math.PI); });
  await page.waitForFunction(() => /Pick up the torch/.test(document.getElementById('prompt').textContent), null, { timeout: 5000 }).catch(() => {});
  step(/Pick up the torch/.test(await page.evaluate(() => document.getElementById('prompt').textContent)), 'the kiosk torch offers "Pick up the torch"');
  await page.click('canvas'); await page.keyboard.press('e');
  await page.waitForFunction(() => window.__town.inventory().items.includes('torch'), null, { timeout: 4000 }).catch(() => {});
  let s = await inv();
  step(s.items.includes('torch') && s.held === 'torch' && !s.torchOn, `picked up and holding the torch (${JSON.stringify(s)})`);
  await page.keyboard.press('f'); await page.waitForTimeout(300);
  s = await inv();
  step(s.torchOn && s.light > 0, `F switches the torch on (light ${s.light})`);
  await page.keyboard.press('f'); await page.waitForTimeout(300);
  step(!(await inv()).torchOn, 'F switches it off again');
  await page.keyboard.press('i');
  await page.waitForFunction(() => /Your bag/.test(document.getElementById('panel-title').textContent) && !document.getElementById('panel').hidden, null, { timeout: 4000 }).catch(() => {});
  const bag = await page.evaluate(() => ({ body: document.getElementById('panel-body').textContent, actions: [...document.querySelectorAll('#panel-actions button')].map((b) => b.textContent) }));
  step(/Torch/.test(bag.body) && bag.actions.some((a) => /Switch torch on/.test(a)) && bag.actions.some((a) => /Put away/.test(a)), `I opens the bag: ${bag.actions.join(' | ')}`);
  await page.evaluate(() => [...document.querySelectorAll('#panel-actions button')].find((b) => /Put away/.test(b.textContent)).click());
  await page.waitForTimeout(200);
  step((await inv()).held === null, 'put the torch away (still in the bag)');
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
