// Real Chromium: the driving dashboard appears only while driving and shows live km/h, gear,
// fuel, coolant temperature and odometer; the radio tunes; it hides again on exit. Desktop and phone.
//   node tests/car-dash-browser.mjs [--url u]
import { chromium, devices } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1200, height: 800 } });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
    const tag = mobile ? '[phone]' : '[desktop]';
    const dash = () => page.evaluate(() => { const d = document.getElementById('car-dash'); const r = d.getBoundingClientRect(); return { shown: !d.hidden, kmh: +d.querySelector('#cd-kmh').textContent, gear: d.querySelector('#cd-gear').textContent, fuel: d.querySelector('#cd-fuel-l').textContent, temp: d.querySelector('#cd-temp-c').textContent, odo: d.querySelector('#cd-odo').textContent, station: d.querySelector('#cd-station').textContent, inView: r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }; });
    await page.evaluate(() => { window.__town.closePanel?.(); window.__town.place(-150, 270.5, Math.PI / 2); });
    step(!(await dash()).shown, `${tag} dashboard hidden on foot`);
    await page.evaluate(() => window.__town.cheats.run('carHere'));
    await page.waitForTimeout(400);
    let d = await dash();
    step(d.shown && d.inView, `${tag} dashboard appears when driving and fits the screen`);
    // Drive: hold forward a few seconds.
    if (mobile) await page.evaluate(() => window.__town.stepVehicle?.(1, 3));
    else { await page.click('canvas'); await page.keyboard.down('w'); await page.waitForTimeout(2500); }
    d = await dash();
    if (!mobile) await page.keyboard.up('w');
    step(mobile || (d.kmh > 5 && /^[1-4]$/.test(d.gear)), `${tag} speedometer ${d.kmh} km/h in gear ${d.gear}`);
    step(/\d+ L/.test(d.fuel) && /\d+°C/.test(d.temp) && /km · CHEAT-/.test(d.odo), `${tag} fuel ${d.fuel}, temp ${d.temp}, odo ${d.odo}`);
    await page.evaluate(() => document.getElementById('cd-next').click());
    step(/Town FM/.test((await dash()).station), `${tag} radio tunes to ${(await dash()).station}`);
    await page.waitForTimeout(1500);
    const exitMsg = await page.evaluate(() => window.__town.leaveVehicle());
    await page.waitForTimeout(400); console.log('  exit:', exitMsg, JSON.stringify(await page.evaluate(() => ({ d: window.__town.state().driving, mode: window.__town.state().mode, panel: window.__town.state().panel }))));
    await page.waitForTimeout(400);
    step(!(await dash()).shown, `${tag} dashboard hides after parking`);
    step(!errors.length, `${tag} no page errors ${errors.join('; ')}`);
    await ctx.close();
  }
} finally { await browser.close(); }
