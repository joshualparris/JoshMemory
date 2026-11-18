// Plays Patch Tuesday through its real UI: arrow keys to move, the level-up cards chosen by key,
// pause and resume, game over and Play again, with Playwright's virtual clock running in fast time.
// Several runs with different movement styles give a rough difficulty reading, then a phone run
// drives the touch-drag joystick.   node tests/playtest-patch-tuesday.mjs [--base https://host] [--runs 4] [--auto-runs 6] [--shots dir]
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const base = arg('--base', null);
const url = base ? `${base.replace(/\/$/, '')}/games/patch-tuesday/index.html` : pathToFileURL(path.join(root, 'games/patch-tuesday/index.html')).href;
const RUNS = Number(arg('--runs', 4));
const shots = arg('--shots', null);

// Movement styles a casual player might use. Each entry: keys held, seconds.
const STYLES = {
  'small loops': [[['ArrowRight'], 1.6], [['ArrowDown'], 1.6], [['ArrowLeft'], 1.6], [['ArrowUp'], 1.6]],
  'wide loops': [[['ArrowRight'], 3], [['ArrowDown'], 3], [['ArrowLeft'], 3], [['ArrowUp'], 3]],
  'diagonal diamond': [[['ArrowRight', 'ArrowDown'], 2], [['ArrowLeft', 'ArrowDown'], 2], [['ArrowLeft', 'ArrowUp'], 2], [['ArrowRight', 'ArrowUp'], 2]],
  'long sweeps': [[['ArrowRight'], 5], [['ArrowDown'], 1.2], [['ArrowLeft'], 5], [['ArrowUp'], 1.2]],
};
const PREFER = ['Firewall', 'Antivirus Ring', 'Ping Flood', 'Patch Bolt', 'Hotfix', 'Multithreading', 'Rollback', 'Overclock', 'Bandwidth', 'Coffee'];

const browser = await chromium.launch();
const errors = [];
const results = [];
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} console: ${m.text()}`); });
};

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
watch(page, 'desktop');
await page.clock.install();
await page.goto(url);
await page.clock.runFor(500);
const visible = (sel) => page.evaluate((s) => !document.querySelector(s).hidden, sel);

async function pickCard(picks) {
  const cards = await page.$$eval('#cards .card', (cs) => cs.map((c) => c.querySelector('.name').textContent));
  let best = 0;
  for (let i = 0; i < cards.length; i++) if (PREFER.indexOf(cards[i]) < PREFER.indexOf(cards[best])) best = i;
  picks.push(cards[best]);
  await page.clock.runFor(300); // the cards ignore input for the first quarter second
  await page.keyboard.press(String(best + 1));
  await page.clock.runFor(50);
}

const styleNames = Object.keys(STYLES);
for (let r = 0; r < RUNS; r++) {
  const style = styleNames[r % styleNames.length];
  if (r === 0) await page.click('#startBtn');
  else await page.click('#againBtn');
  await page.clock.runFor(100);
  const picks = [];
  const held = new Set();
  let t = 0, stepIdx = 0, stepLeft = 0, outcome = null, paused = false;
  while (t < 300) {
    if (stepLeft <= 0) {
      const [keys, secs] = STYLES[style][stepIdx % STYLES[style].length];
      stepIdx++;
      stepLeft = secs;
      for (const k of [...held]) if (!keys.includes(k)) { await page.keyboard.up(k); held.delete(k); }
      for (const k of keys) if (!held.has(k)) { await page.keyboard.down(k); held.add(k); }
    }
    await page.clock.runFor(250);
    t += 0.25; stepLeft -= 0.25;
    if (r === 0 && !paused && t >= 10) {
      await page.keyboard.press('p');
      await page.clock.runFor(100);
      const p1 = await visible('#pauseScreen');
      await page.keyboard.press('p');
      await page.clock.runFor(100);
      const p2 = await visible('#pauseScreen');
      if (!p1 || p2) errors.push(`pause: P opened=${p1}, P again closed=${!p2}`);
      paused = true;
    }
    while (await visible('#levelScreen')) await pickCard(picks);
    if (await visible('#endScreen')) {
      outcome = await page.evaluate(() => ({
        heading: document.querySelector('#endHeading').textContent,
        line: document.querySelector('#endLine').textContent,
        stats: [...document.querySelectorAll('#endStats div')].map((d) => `${d.querySelector('dt').textContent} ${d.querySelector('dd').textContent}`).join(' · '),
      }));
      break;
    }
  }
  for (const k of held) await page.keyboard.up(k);
  if (!outcome) {
    outcome = { heading: 'Still alive at the 5:00 cap', line: '', stats: '' };
    if (shots) await page.screenshot({ path: path.join(shots, `patch-tuesday-run${r + 1}.png`) });
    await page.reload();
    await page.clock.runFor(500);
    await page.click('#startBtn');
  }
  const counts = picks.reduce((m, p) => ((m[p] = (m[p] || 0) + 1), m), {});
  results.push({ run: r + 1, style, ...outcome, levelUps: picks.length, picks: counts });
  console.log(`Run ${r + 1} (${style}): ${outcome.heading}. ${outcome.line} ${outcome.stats}`);
  console.log(`   upgrades taken: ${Object.entries(counts).map(([k, v]) => `${k}×${v}`).join(', ') || 'none'}`);
}

// Reactive player model: the game's own autopilot steers away from nearby threats and bullets,
// collects pickups and takes random cards, with no invincibility (?demo test mode only).
const AUTORUNS = Number(arg('--auto-runs', 6));
const auto = await browser.newPage({ viewport: { width: 1280, height: 800 } });
watch(auto, 'autopilot');
await auto.clock.install();
await auto.goto(`${url}?demo`);
let autoRuns = [];
for (let s = 0; s < 1500 && autoRuns.length < AUTORUNS; s += 5) {
  await auto.clock.runFor(5000);
  autoRuns = await auto.evaluate(() => window.__pt().runs);
}
await auto.close();
const fmtT = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
autoRuns.forEach((r, i) => console.log(`Autopilot run ${i + 1}: ${r.kind === 'win' ? 'WON, Zero-Day removed' : 'died'} at ${fmtT(r.t)}, level ${r.level}, ${r.kills} threats patched`));
const autoWins = autoRuns.filter((r) => r.kind === 'win').length;
const reachedBoss = autoRuns.filter((r) => r.t >= 180).length;
console.log(`Autopilot: ${autoWins}/${autoRuns.length} won, ${reachedBoss}/${autoRuns.length} reached the 3:00 boss.`);

// Phone: start by tap, then hold a touch-drag joystick in a loop for 40 seconds.
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const mp = await phone.newPage();
watch(mp, 'phone');
try {
  await mp.clock.install();
  await mp.goto(url);
  await mp.clock.runFor(500);
  await mp.tap('#startBtn');
  await mp.clock.runFor(200);
  const cdp = await phone.newCDPSession(mp);
  const cx = 195, cy = 600;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
  let levelUps = 0;
  for (let i = 0; i < 160; i++) {
    const a = (i / 20) * Math.PI * 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + Math.cos(a) * 45, y: cy + Math.sin(a) * 45 }] });
    await mp.clock.runFor(250);
    if (await mp.evaluate(() => !document.querySelector('#levelScreen').hidden)) {
      await mp.clock.runFor(300);
      await mp.tap('#cards .card');
      levelUps++;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    }
    if (await mp.evaluate(() => !document.querySelector('#endScreen').hidden)) break;
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const state = await mp.evaluate(() => (!document.querySelector('#endScreen').hidden ? document.querySelector('#endLine').textContent : 'still playing'));
  console.log(`Phone (touch joystick, 40 s): ${levelUps} level-ups picked by tap; ${state}`);
  if (shots) await mp.screenshot({ path: path.join(shots, 'patch-tuesday-phone.png') });
} catch (e) {
  errors.push(`phone: ${e.message}`);
}

await browser.close();
const wins = results.filter((r) => r.heading === 'Patch deployed').length;
console.log(`\nSummary: ${wins}/${results.length} desktop runs won.`);
console.log(errors.length ? `PROBLEMS:\n- ${errors.join('\n- ')}` : 'PASS: no page or console errors; pause, level-ups, game over and Play again all worked');
process.exitCode = errors.length ? 1 : 0;
