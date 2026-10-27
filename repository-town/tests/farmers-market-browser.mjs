// Real Chromium: on a market Saturday the stalls stand in Market Square and you can buy from a
// stallholder; on other days the square is open with a notice board, and nothing takes you
// "inside" the square. Desktop and emulated phone.
//   node tests/farmers-market-browser.mjs [--url u] [--shot file.png]
import { chromium, devices } from 'playwright';
const arg = (k, d) => process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d;
const URL = arg('--url', process.env.TOWN_URL || 'http://localhost:8091/'), SHOT = arg('--shot', null);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1200, height: 800 } });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
    const tag = mobile ? '[phone]' : '[desktop]';
    await page.evaluate(() => { window.__town.closePanel?.(); const L = window.__town.life; L.setDay(13); L.setTime(9 * 60 + 30); });
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => window.__town.market());
    step(m.standing, `${tag} stalls stand on Saturday 7 November at 9:30`);
    if (SHOT && mobile) { const sq = m.spots.find((s) => s.key === 'market:info'); await page.evaluate((p) => window.__town.place(p.x + 1, p.z + 7, 0.15), sq); await page.waitForTimeout(900); await page.screenshot({ path: SHOT }); }
    const veg = m.spots.find((s) => s.key === 'market:veg');
    await page.evaluate((p) => window.__town.place(p.x, p.z + 0.6, 0), veg);
    await page.waitForTimeout(500);
    const prompt = await page.evaluate(() => document.getElementById('prompt').textContent);
    step(/Macquarie Flats Growers/.test(prompt), `${tag} walking up to the fruit and veg stall: "${prompt}"`);
    await page.evaluate(() => window.__town.closePanel?.());
    if (mobile) await page.tap('#t-use'); else { await page.click('canvas'); await page.keyboard.press('e'); }
    await page.waitForFunction(() => /Macquarie Flats/.test(document.getElementById('panel-title').textContent) && !document.getElementById('panel').hidden, null, { timeout: 4000 }).catch(() => {});
    const before = await page.evaluate(() => window.__town.life.ledger().civic.player.wallet);
    const bought = await page.evaluate(() => { const b = [...document.querySelectorAll('#panel-actions button')].find((x) => /Tomatoes/.test(x.textContent)); b?.click(); return !!b; });
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ w: window.__town.life.ledger().civic.player.wallet, body: document.getElementById('panel-body').textContent }));
    step(bought && Math.abs(before - after.w - 6) < 0.01 && /Trish/.test(after.body), `${tag} bought tomatoes for $6 (${before} → ${after.w}): ${after.body.trim().slice(0, 70)}`);
    // A Sunday: stalls gone, the notice board says when the next market is, and the square has no door.
    await page.evaluate(() => { window.__town.closePanel?.(); const L = window.__town.life; L.setDay(14); L.setTime(10 * 60); });
    const packed = await page.waitForFunction(() => !window.__town.market().standing, null, { timeout: 5000 }).then(() => true).catch(() => false);
    step(packed, `${tag} packed away on Sunday`);
    const board = await page.evaluate(() => { const s = window.__town.shops().find((x) => x.id === 'square'); return s.door; });
    // The notice board stands on the footpath at the front of the square (street-8 lots centre z 161 + 10.4).
    await page.evaluate((d) => window.__town.place(d.x, 161 + 11.6, 0), board);
    await page.waitForTimeout(400);
    if (mobile) await page.tap('#t-use'); else { await page.click('canvas'); await page.keyboard.press('e'); }
    await page.waitForFunction(() => /notice board/.test(document.getElementById('panel-title').textContent), null, { timeout: 4000 }).catch(() => {});
    const s = await page.evaluate(() => ({ mode: window.__town.state().mode, title: document.getElementById('panel-title').textContent, body: document.getElementById('panel-body').textContent }));
    step(s.mode === 'town' && /notice board/.test(s.title) && /Saturday 21 November 2026/.test(s.body), `${tag} notice board, not a door: ${s.body.trim().slice(0, 80)}`);
    step(!errors.length, `${tag} no page errors ${errors.join('; ')}`);
    await ctx.close();
  }
} finally { await browser.close(); }
