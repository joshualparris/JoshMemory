// Real Chromium with sound on: getting into a car cranks the starter and the engine catches, the
// note climbs with revs and opens up under throttle (intake roar), and parking runs the engine
// down instead of cutting it. Reads ambience.debug.vehicle through __town.soundscape().
//   node tests/engine-sound-browser.mjs [--url u]
import { chromium } from 'playwright';
const URL = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : (process.env.TOWN_URL || 'http://localhost:8091/');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const step = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) process.exitCode = 1; };
const waitPhase = (page, phase, ms = 6000) => page.waitForFunction((ph) => { const v = window.__town.soundscape().vehicle; return v && v.phase === ph ? v : null; }, phase, { timeout: ms, polling: 20 }).then((h) => h.jsonValue()).catch(() => null);
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { localStorage.setItem('repository-town.sound', 'on'); sessionStorage.setItem('town-cheats', '1'); });
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(URL); await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.click('canvas');
  // Arm the phase listener BEFORE starting the engine: the 600ms starter
  // can finish during a slow headless browser round trip on software WebGL.
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.cheats.open(); window.__town.cheats.run('goNew'); });
  // Start and observe the short starter phase in the same browser round trip.
  // A slow software-rendered CI frame can otherwise exhaust the 600ms crank
  // before the external Playwright polling callback starts.
  const crank = await page.evaluate(async () => {
    window.__town.cheats.run('carHere'); window.__town.cheats.close();
    const until=performance.now()+5000;
    while(performance.now()<until){
      const v=window.__town.soundscape().vehicle;
      if(v?.phase==='cranking')return v;
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    return null;
  });
  step(!!crank, 'getting in cranks the starter');
  const idle = await waitPhase(page, 'running');
  step(!!idle && idle.rpm <= idle.idle + 50, `engine catches and settles to idle (${idle?.rpm} rpm, ${idle?.frequency?.toFixed(1)} Hz)`);
  // Headless frames are slow: advance the car with the game's fixed-step hook, accelerator held,
  // then let real frames voice it while the pedal is still down.
  await page.click('canvas'); await page.keyboard.down('w');
  await page.evaluate(() => { for (let i = 0; i < 90; i++) window.__town.stepVehicle(1 / 30); });
  const pulling = await page.waitForFunction(() => { const v = window.__town.soundscape().vehicle; return v && v.load > 0.5 && v.speedKmh > 10 ? v : null; }, null, { timeout: 6000, polling: 20 }).then((h) => h.jsonValue()).catch(() => null);
  await page.keyboard.up('w');
  step(!!pulling && pulling.frequency > idle.frequency * 1.3, `note climbs with revs: ${idle?.frequency?.toFixed(1)} → ${pulling?.frequency?.toFixed(1)} Hz at ${pulling?.rpm} rpm, gear ${pulling?.gear}, ${pulling?.speedKmh?.toFixed(0)} km/h`);
  step(!!pulling && pulling.load > 0.5, `engine under load while accelerating (load ${pulling?.load})`);
  await page.evaluate(() => { for (let i = 0; i < 120; i++) window.__town.stepVehicle(1 / 30); });
  // The entire run-down must be queued on the WebAudio clock, independently
  // of visual frame rate. On software WebGL, a 1.2 s shutdown may span only
  // ONE rendered frame; inspecting that single RPM sample is not sufficient.
  // Spy only on real AudioParam scheduling calls (without changing their
  // parameters), and still require an actual 'off' state afterwards.
  const shutdown = await page.evaluate(async () => {
    const samples = [], automation = [];
    const proto = AudioParam.prototype;
    const originalFrequency = proto.exponentialRampToValueAtTime;
    const originalGain = proto.linearRampToValueAtTime;
    proto.exponentialRampToValueAtTime = function(value, end) {
      automation.push({ type: 'frequency', from: this.value, to: value, end });
      return originalFrequency.call(this, value, end);
    };
    proto.linearRampToValueAtTime = function(value, end) {
      automation.push({ type: 'gain', from: this.value, to: value, end });
      return originalGain.call(this, value, end);
    };
    const deadline = performance.now() + 8000;
    try {
      const phase = await new Promise(resolve => {
        const sample = () => {
          const v = window.__town.soundscape().vehicle;
          if (v?.phase === 'stopping')
            samples.push({ rpm: v.rpm, idle: v.idle });
          if (v?.phase === 'off' || performance.now() > deadline) {
            resolve(v?.phase);
            return;
          }
          requestAnimationFrame(sample);
        };
        window.__town.leaveVehicle();
        requestAnimationFrame(sample);
      });
      return { samples, phase, automation };
    } finally {
      proto.exponentialRampToValueAtTime = originalFrequency;
      proto.linearRampToValueAtTime = originalGain;
    }
  });
  const down = shutdown.samples.find(v => Number.isFinite(v.rpm) && v.rpm < v.idle * .9);
  const toneRamps = shutdown.automation.filter(v =>
    v.type === 'frequency' && Number.isFinite(v.from) && Number.isFinite(v.to) &&
    v.from >= 6 && v.to <= v.from * .5 && v.end > 0);
  const gainRamps = shutdown.automation.filter(v =>
    v.type === 'gain' && Number.isFinite(v.from) && v.from >= 0 && v.to === 0 && v.end > 0);
  const scheduledRealShutdown = toneRamps.length >= 3 && gainRamps.length >= 1;
  step(!!down || scheduledRealShutdown,
    `parking runs the engine down (${down?.rpm?.toFixed?.(0) ?? 'frame skipped'} rpm, ${shutdown.samples.length} observed stopping frames, ${toneRamps.length} real frequency ramps, ${gainRamps.length} real gain ramps)`);
  step(shutdown.phase === 'off', 'engine silent after the run-down');
  step(!errors.length, `no page errors ${errors.join('; ')}`);
} finally { await browser.close(); }
