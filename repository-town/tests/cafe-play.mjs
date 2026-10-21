// Café service in the real browser build, played like a player: start the café shift, take a real
// villager's order at the till, pick the ticket's milk jug, work every preparation step (assisted
// skill and latte-art panels) at whichever station the game asks for, collect the tray and deliver
// it to the right table. Desktop by default; --mobile emulates an Android phone.
//   node tests/cafe-play.mjs [--mobile] [--url u]
import { chromium } from 'playwright';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext(mobile ? { viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1100, height: 700 } });
const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/api/npc-chat', (route) => route.abort('connectionrefused'));
await page.goto(arg('--url', 'http://localhost:8091/'));
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
const T = (f, a) => page.evaluate(f, a), st = () => T(() => window.__town.state());
const press = async (k) => { for (let i = 0; i < 3; i++) { await page.keyboard.down(k); await page.waitForTimeout(120); await page.keyboard.up(k); if (k !== 'e' || await page.waitForFunction(() => window.__town.state().panel || window.__town.state().mode === 'house', null, { timeout: 3000 }).catch(() => null)) break; } await page.waitForTimeout(250); };
const click = async (re) => { const ok = await page.waitForFunction((src) => { const r = new RegExp(src, 'i'); const btn = [...document.querySelectorAll('#panel-actions button, #panel-body button')].find((x) => r.test(x.textContent)); if (btn) { btn.click(); return true; } return false; }, re.source, { timeout: 4000 }).then(() => true).catch(() => false); await page.waitForTimeout(350); return ok; };
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
const go = async (key) => { await T(() => window.__town.closePanel?.()); await page.waitForTimeout(200); await T((k) => window.__town.approach(k), key); await page.waitForTimeout(400); await press('e'); return st(); };
const status = () => T(() => document.getElementById('status')?.innerText || '');
const ticketOf = (id) => T((id) => window.__town.state().workplay.cafe.tickets.find((o) => o.id === id), id);
await T(() => window.__town.closePanel?.());
// Villagers come in for lunch from about midday.
await T(() => window.__town.life.setTime(11 * 60 + 30));
const staffed = () => T(() => window.__town.state().people.some((q) => { const r = window.__town.life.route(q.name); return r?.step?.kind === 'work' && r.step.at === 'cafe' && !r.path.length; }));
for (let i = 0; i < 24 && !(await staffed()); i++) await T(() => window.__town.life.run(5));
await T(() => window.__town.goPlace('cafe'));
await page.waitForFunction(() => /^place:cafe$/.test(window.__town.state().nearPerson || ''), null, { timeout: 15000 }).catch(() => {});
await press('e');
let s = await st(); step(s.mode === 'house', 'entered Commit Café');
const desk = s.interactables.find((x) => x.do === 'civic-ledger');
let msg = '';
for (let tries = 0; tries < 12 && !/Shift started/.test(msg); tries++) {
  await T(() => window.__town.closePanel?.()); await T((k) => window.__town.approach(k), desk.key); await page.waitForTimeout(300); await press('e');
  await click(/work a shift/); await click(/^Start .*café/i); msg = (await st()).panel?.text || '';
  if (!/Shift started/.test(msg)) await T(() => window.__town.life.run(15));
}
step(/Shift started/.test(msg), 'started the café all-rounder shift');
await T(() => window.__town.closePanel?.());
const queued = () => T(() => (window.__town.state().workplay?.cafe?.tickets || []).some((o) => o.state === 'queue'));
for (let i = 0; i < 60 && !(await queued()); i++) await T(() => window.__town.life.run(2));
step(await queued(), 'a real villager is queuing to order');
await go('workplay:cafe:orders'); const said = await status();
const id = await T(() => window.__town.state().workplay.cafe.selected);
let ticket = await ticketOf(id);
step(ticket && ticket.state === 'accepted', 'took the order: ' + said.slice(0, 120));
let station = 'barista', art = false, milk = false;
for (let n = 0; n < 40 && (ticket = await ticketOf(id)).state !== 'ready'; n++) {
  s = await go('workplay:cafe:' + station);
  const title = s.panel?.title || '';
  if (/milk/i.test(title) && !/skill|latte/i.test(title)) { milk = await click(new RegExp('^' + (ticket.milk === 'dairy' ? 'Full-cream' : ticket.milk), 'i')); continue; }
  if (/latte-art/i.test(title)) { art = true; await T(() => document.getElementById('latte-assist')?.click()); await page.waitForTimeout(350); continue; }
  if (/skill challenge/i.test(title)) { await T(() => document.getElementById('work-skill-assisted')?.click()); await page.waitForTimeout(350); continue; }
  if (/kitchen station/i.test(await status())) station = 'kitchen'; else if (/barista station/i.test(await status())) station = 'barista'; else station = station === 'barista' ? 'kitchen' : 'barista';
}
step(ticket.state === 'ready', 'every item ready: ' + (ticket.items || []).join(' + ') + (milk ? ' · ' + ticket.milk + ' milk chosen' : '') + (art ? ' · latte art' : ''));
await go('workplay:cafe:pass'); step(/Carrying/.test(await status()), 'collected the tray at the pass');
let paid = false;
for (let i = 0; i < 12 && !paid; i++) { await go('workplay:cafe:table-' + ticket.table); paid = /paid to the café/.test(await status()); if (!paid) await T(() => window.__town.life.run(1)); }
step(paid, 'delivered to table ' + ticket.table + ': ' + (await status()).slice(0, 120));
const hud = await T(() => document.getElementById('workplay-hud')?.innerText || '');
step(/served/.test(hud), 'HUD: ' + hud.replace(/\n/g, ' | '));
step(!errors.length, 'no page errors ' + errors.join('; '));
await b.close();
console.log(process.exitCode ? 'Cafe play FAILED' : 'All cafe-play checks passed (' + (mobile ? 'mobile' : 'desktop') + ').');
