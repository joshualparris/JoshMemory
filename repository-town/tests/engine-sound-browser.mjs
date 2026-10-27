// Real Chromium with sound on: getting into a car cranks and starts the engine, the engine note's
// firing frequency rises with revs as the car accelerates, the gearbox shifts up (dashboard D1→D2…),
// tyre and wind layers come in with speed, and parking switches the engine off. Desktop keyboard.
//   node tests/engine-sound-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { localStorage.setItem('repository-town.sound', 'on'); sessionStorage.setItem('town-cheats', '1'); });
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.click('canvas');   // a user gesture starts the town's audio
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.cheats.run('goNew'); });
  const snd = () => page.evaluate(() => ({ ...window.__town.engineSound(), dash: document.getElementById('drive-gear')?.textContent }));
  step((await snd()).phase !== 'running', 'engine silent on foot');
  await page.evaluate(() => window.__town.cheats.run('carHere'));
  await page.waitForTimeout(150);
  const crank = await snd();
  step(crank.phase === 'cranking' && crank.rpm === 0, `getting in cranks the starter (${crank.phase})`);
  await page.waitForTimeout(2200);
  const idle = await snd();
  step(idle.phase === 'running' && idle.rpm < 900 && idle.firingHz > 15 && idle.firingHz < 40, `engine catches and idles: ${idle.rpm} rpm, ${idle.firingHz} Hz firing`);
  // The headless browser renders slowly, so drive with the game's own fixed-step hook (it also voices
  // the engine): 5 s at 30 Hz with the accelerator held, then coast to a stop with it released.
  await page.click('canvas'); await page.keyboard.down('w');
  const drive = await page.evaluate(() => { const out = []; for (let i = 0; i < 150; i++) { window.__town.stepVehicle(1 / 30); out.push({ ...window.__town.engineSound(), kmh: document.getElementById('drive-speed')?.textContent }); } return out; });
  await page.keyboard.up('w');
  await page.evaluate(() => { for (let i = 0; i < 90; i++) window.__town.stepVehicle(1 / 30); });
  const peak = drive.reduce((m, x) => x.firingHz > m.firingHz ? x : m, drive[0]);
  step(peak.firingHz > idle.firingHz * 1.8, `note rises with revs: ${idle.firingHz} Hz idle → ${peak.firingHz} Hz at ${peak.rpm} rpm`);
  const pullAway = drive.slice(0, 20).reduce((m, x) => Math.max(m, x.rpm), 0);
  step(pullAway > 1400, `revs flare through the converter pulling away (${pullAway} rpm)`);
  const gearsSeen = [...new Set(drive.map((x) => x.gear))];
  step(gearsSeen.length >= 3, `gearbox shifts up while accelerating: gears ${gearsSeen.join('→')}`);
  step(drive.some((x, i) => i > 3 && x.gear > drive[i - 1].gear && drive.slice(i, i + 8).some((y) => y.rpm < drive[i - 1].rpm - 200)), 'the note drops at each upshift');
  const samples = drive;
  step(samples.some((x) => x.layers.tyres) && samples.some((x) => x.layers.intake), 'tyre noise and intake roar join in on the move');
  await page.evaluate(() => window.__town.leaveVehicle());
  // Headless frames are slow, so wait for the next frames rather than a fixed delay.
  const runDown = await page.waitForFunction(() => { const e = window.__town.engineSound(); return e.phase === 'stopping' ? e : null; }, null, { timeout: 5000, polling: 20 }).then((h) => h.jsonValue()).catch(() => null);
  step(!!runDown && runDown.rpm < 750, `parking switches the engine off with a run-down (${runDown ? runDown.rpm + ' rpm' : 'no run-down seen'})`);
  await page.waitForFunction(() => window.__town.engineSound().phase === 'off', null, { timeout: 8000 }).catch(() => {});
  step((await snd()).phase === 'off', 'engine silent after run-down');
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
