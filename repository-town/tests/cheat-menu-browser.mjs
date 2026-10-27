// Real Chromium: the hidden cheat menu unlocks only with the gesture and password, then
// teleports to the new neighbourhood, summons a car, drives it along Wattle Street, buys a
// property outright and adds money. Desktop (keyboard) and emulated phone (taps).
//   node tests/cheat-menu-browser.mjs [--url u]
import { chromium, devices } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1200, height: 800 } });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
    const tag = mobile ? '[phone]' : '[desktop]';
    await page.evaluate(() => { window.__town.closePanel?.(); window.__town.meetGuide?.(); window.__town.closePanel?.(); });
    const menu = () => page.evaluate(() => { const m = document.getElementById('cheat-menu'); return { open: !m.hidden, text: m.innerText }; });

    step(!(await menu()).open, `${tag} cheat menu hidden by default`);
    const tapTitle = async () => { const r = await page.evaluate(() => { const b = document.querySelector('#hud h1').getBoundingClientRect(); return { x: b.left + 30, y: b.top + b.height / 2 }; }); for (let i = 0; i < 5; i++) await page.touchscreen.tap(r.x, r.y); };
    if (mobile) await tapTitle();
    else { await page.click('canvas'); for (let i = 0; i < 3; i++) await page.keyboard.press('Backquote'); }
    let m = await menu();
    step(m.open && /Password|Developer/i.test(m.text) && !/Summon/.test(m.text), `${tag} secret gesture opens a password prompt, not the menu`);
    await page.fill('#cheat-password', 'wrong'); await page.click('#cheat-unlock');
    step(/Wrong password/.test((await menu()).text), `${tag} wrong password refused`);
    await page.fill('#cheat-password', 'CHEAT123'); await page.click('#cheat-unlock');
    m = await menu();
    step(/Summon car/.test(m.text), `${tag} CHEAT123 unlocks the cheat menu`);

    const run = (a) => page.evaluate((a) => document.querySelector(`#cheat-menu button[data-a="${a}"]`).click(), a);
    await run('goNew'); await page.waitForTimeout(300);
    let s = await page.evaluate(() => window.__town.state());
    step(Math.abs(s.pos.z - 270.5) < 1 && Math.abs(s.pos.x + 150) < 1, `${tag} teleported to Wattle Street (${s.pos.x.toFixed(0)}, ${s.pos.z.toFixed(0)})`);

    await run('carHere'); await page.waitForTimeout(500);
    s = await page.evaluate(() => ({ st: window.__town.state(), status: document.getElementById('status')?.innerText || '' }));
    const driving = await page.evaluate(() => !!document.querySelector('#cheat-menu') && window.__town.state().driving);
    step(driving || /Driving|driver|Drive/i.test(s.status), `${tag} summoned a car and got in: ${s.status.slice(0, 80)}`);
    const before = (await page.evaluate(() => window.__town.state())).pos;
    if (!mobile) {
      await page.click('canvas'); await page.keyboard.down('w');
      for (let i = 0; i < 60; i++) { await page.waitForTimeout(150); const p = (await page.evaluate(() => window.__town.state())).pos; if (Math.hypot(p.x - before.x, p.z - before.z) > 12) break; }
      await page.keyboard.up('w');
      const after = (await page.evaluate(() => window.__town.state())).pos;
      step(Math.hypot(after.x - before.x, after.z - before.z) > 6 && Math.abs(after.z - 277) < 5, `${tag} drove the car along Wattle Street (${before.x.toFixed(0)} → ${after.x.toFixed(0)}, z ${after.z.toFixed(1)})`);
    }

    if (!(await menu()).open) { if (mobile) await tapTitle(); else for (let i = 0; i < 3; i++) await page.keyboard.press('Backquote'); }
    step(/Summon car/.test((await menu()).text), `${tag} menu reopens already unlocked this session`);
    const wallet0 = await page.evaluate(() => window.__town.life.ledger().civic.player.wallet);
    await run('money');
    const wallet1 = await page.evaluate(() => window.__town.life.ledger().civic.player.wallet);
    step(wallet1 - wallet0 === 10000, `${tag} +$10,000 (${wallet0} → ${wallet1})`);
    await page.fill('#cheat-prop', 'A1'); await run('buyKey');
    const owned = await page.evaluate(() => window.__town.life.ledger().civic.property.parcels['H:A1'].owner);
    step(owned === 'visitor', `${tag} owned house A1 outright: ${(await menu()).text.split('\n').pop()}`);
    await page.fill('#cheat-prop', '2 Wattle Street'); await run('buyKey');
    const newHome = await page.evaluate(() => window.__town.life.ledger().civic.property.parcels['P:home-0-0-0']);
    step(newHome?.owner === 'visitor', `${tag} owned a new master-plan home: ${newHome?.name}`);
    await run('map');
    step(await page.evaluate(() => window.__town.townMap.isOpen()), `${tag} cheat menu opens the town map`);
    step(!errors.length, `${tag} no page errors ${errors.join('; ')}`);
    await ctx.close();
  }
} finally { await browser.close(); }
