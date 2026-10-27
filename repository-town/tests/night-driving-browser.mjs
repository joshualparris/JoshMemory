// Real Chromium at night in the new neighbourhood: estate street lights are lit and feed the
// shared light pool, the player's car gets headlights (off by day, off after parking), and the
// car radio lists real Dubbo and world stations. Desktop and emulated phone.
//   node tests/night-driving-browser.mjs [--url u] [--shot file.png]
import { chromium, devices } from 'playwright';
const arg = (k, d) => process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d;
const URL = arg('--url', process.env.TOWN_URL || 'http://localhost:8091/'), SHOT = arg('--shot', null);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  for (const mobile of [false, true]) {
    const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1200, height: 800 } });
    const page = await ctx.newPage(), errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
    await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
    await page.route('**radio-browser.info/**', (r) => r.abort('connectionrefused'));
    await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
    const tag = mobile ? '[phone]' : '[desktop]';
    await page.evaluate(() => { window.__town.closePanel?.(); window.__town.cheats.run('t13'); window.__town.cheats.run('goNew'); window.__town.cheats.run('carHere'); });
    await page.waitForTimeout(600);
    let st = await page.evaluate(() => ({ driving: window.__town.state().driving, head: window.__town.driveHeadlights?.() }));
    step(st.driving && st.head === false, `${tag} by day the headlights stay off (driving ${!!st.driving})`);
    await page.evaluate(() => window.__town.cheats.run('t20'));
    await page.evaluate(() => window.__town.advanceSimulation?.(0));
    await page.waitForTimeout(1500);
    st = await page.evaluate(() => ({ head: window.__town.driveHeadlights?.(), lamps: window.__town.estateLighting?.() }));
    step(st.head === true, `${tag} after dark the headlights come on`);
    step(st.lamps && st.lamps.poles >= 60 && st.lamps.emissive > 0.5 && st.lamps.nearbyLit >= 1, `${tag} estate street lights lit: ${JSON.stringify(st.lamps)}`);
    const stations = await page.evaluate(() => { const names = []; const next = document.getElementById('drive-radio-next'); for (let i = 0; i < 20; i++) { next.click(); names.push(document.getElementById('drive-radio-station').textContent); } document.getElementById('drive-radio-power').click(); return names; });
    step(stations.some((n) => /Dubbo/.test(n)) && stations.some((n) => /BBC World Service/.test(n)) && stations.some((n) => /triple j/.test(n)), `${tag} radio lists real stations: ${[...new Set(stations.map((n) => n.split(' · ')[0]))].slice(3, 9).join(', ')}…`);
    const offline = stations.find((n) => /unavailable|tuning/.test(n));
    step(!!offline, `${tag} a live station with no network says so instead of failing (${offline})`);
    if (SHOT && mobile) { await page.evaluate(() => document.getElementById('drive-dash-toggle')?.click()); await page.waitForTimeout(400); await page.screenshot({ path: SHOT }); await page.evaluate(() => document.getElementById('drive-dash-toggle')?.click()); }
    await page.evaluate(() => window.__town.leaveVehicle());
    await page.waitForTimeout(300);
    step(await page.evaluate(() => window.__town.driveHeadlights?.()) === false, `${tag} headlights off after parking`);
    step(!errors.length, `${tag} no page errors ${errors.join('; ')}`);
    await ctx.close();
  }
} finally { await browser.close(); }
