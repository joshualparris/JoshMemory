// General Store batches in the real browser build, played like a player: start a shift at the
// counter, collect a dated carton, choose its rotation at the shelf, read the shelf dates and run a
// date check at the returns station. Desktop by default; --mobile emulates an Android phone.
//   node tests/store-play.mjs [--mobile] [--url u]
import { chromium } from 'playwright';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const mobile = process.argv.includes('--mobile');
const ctx = await b.newContext(mobile ? { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1100, height: 700 } });
const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(arg('--url', 'http://localhost:8091/'));
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
const T = (f, a) => page.evaluate(f, a), st = () => T(() => window.__town.state());
const press = async (k) => { for (let i = 0; i < 3; i++) { await page.keyboard.down(k); await page.waitForTimeout(120); await page.keyboard.up(k); if (k !== 'e' || await page.waitForFunction(() => window.__town.state().panel || window.__town.state().mode === 'house', null, { timeout: 3000 }).catch(() => null)) break; } await page.waitForTimeout(250); };
const click = async (re) => { const ok = await page.waitForFunction((src) => { const r = new RegExp(src, 'i'); const btn = [...document.querySelectorAll('#panel-actions button')].find((x) => r.test(x.textContent)); if (btn) { btn.click(); return true; } return false; }, re.source, { timeout: 4000 }).then(() => true).catch(() => false); await page.waitForTimeout(350); return ok; };
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
await T(() => window.__town.closePanel?.());
await T(() => { window.__town.life.setTime(10 * 60); });
const staffed = () => T(() => window.__town.state().people.some((q) => { const r = window.__town.life.route(q.name); return r?.step?.kind === 'work' && r.step.at === 'store' && !r.path.length; }));
for (let i = 0; i < 24 && !(await staffed()); i++) await T(() => window.__town.life.run(5));
await T(() => window.__town.goPlace('store'));
await page.waitForFunction(() => /^place:store$/.test(window.__town.state().nearPerson || window.__town.state().near || ''), null, { timeout: 15000 }).catch(() => {});
await press('e');
let s = await st();
step(s.mode === 'house', 'entered the General Store');
const desk = s.interactables.find((x) => x.do === 'civic-ledger');
await T((k) => window.__town.approach(k), desk.key); await page.waitForTimeout(400); await press('e');
step(await click(/work a shift/i), 'opened the job board');
step(await click(/^Start .*·/), 'started a shift: ' + JSON.stringify((await st()).panel?.text?.slice(0,90)));
await T(() => window.__town.closePanel?.());
const go = async (key) => { await T(() => window.__town.closePanel?.()); await page.waitForTimeout(200); await T((k) => window.__town.approach(k), key); await page.waitForTimeout(400); await press('e'); return st(); };
s = await go('workplay:store:receiving'); step(/receiving/i.test(s.panel?.title || ''), 'receiving bay panel');
const picked = await click(/Pick up Coffee/) || await click(/Pick up Tea/);
s = await st(); step(picked && s.workplay?.store?.carton, 'carrying a dated carton: ' + JSON.stringify(s.workplay?.store?.carton?.lots?.map((l) => l.useBy)));
s = await go('workplay:store:dry'); step(/Stock rotation/.test(s.panel?.title || '') && /use by day/.test(s.panel?.text || ''), 'shelf asks where the carton goes, with use-by dates');
await click(/Behind the stock/); s = await st();
step(!s.workplay.store.carton && s.workplay.store.fefo.right >= 1, 'shelved behind older stock; rotation recorded');
s = await go('workplay:store:dates'); step(/Dates, damage and supplier returns/.test(s.panel?.title || '') && /use by day|shelf empty/.test(s.panel?.text || ''), 'date and returns station lists shelf dates');
await click(/Date check/); s = await st(); step(/out-of-date|still in date/.test(await T(() => document.body.innerText)), 'date check reports');
const hud = await T(() => document.getElementById('workplay-hud')?.innerText || '');
step(/Rotation: \d+ right/.test(hud), 'HUD shows rotation record: ' + hud.replace(/\n/g, ' | '));
step(!errors.length, 'no page errors ' + errors.join('; '));
await b.close();
console.log(process.exitCode ? 'Store play FAILED' : 'All store-play checks passed (' + (mobile ? 'mobile' : 'desktop') + ').');
