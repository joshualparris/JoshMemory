// Exploratory playtest: plays like a person (keys, mouse, touch), screenshots each step.
import { chromium, devices } from 'playwright';
const [url, out, mode = 'desktop'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext(mode === 'mobile' ? { ...devices['Pixel 7'], locale: 'en-US' } : { viewport: { width: 1280, height: 760 }, locale: 'en-US' });
const page = await ctx.newPage();
const notes = [];
page.on('pageerror', (e) => notes.push('PAGEERROR ' + e.message));
page.on('console', (m) => m.type() === 'error' && notes.push('CONSOLE ' + m.text().slice(0, 160)));
let n = 0;
const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: `${out}-${mode}-${String(++n).padStart(2, '0')}-${name}.png` }); };
const st = () => page.evaluate(() => window.__town.state());
const t0 = Date.now();
await page.goto(url);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 60000 });
notes.push(`loaded in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await shot('spawn');
const hold = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };
if (mode === 'desktop') {
  // Look around with the mouse, walk the street, run.
  await page.mouse.move(640, 380); await page.mouse.down(); await page.mouse.move(900, 380, { steps: 10 }); await page.mouse.up();
  await shot('look-right');
  await hold('w', 1500); await page.keyboard.down('Shift'); await hold('w', 1500); await page.keyboard.up('Shift');
  await shot('walked');
  await page.keyboard.press('m'); await shot('birds-eye'); await page.keyboard.press('m');
  // Search for a house, go there, walk in.
  for (const q of ['Whispering', 'carl', 'JoshHub']) {
    await page.fill('#search', q); await page.press('#search', 'Enter'); await page.waitForTimeout(900);
    await shot(`at-${q}`);
    await hold('w', 2500);
    let s = await st();
    notes.push(`${q}: after walking forward mode=${s.mode} house=${s.coordinate}`);
    if (s.mode !== 'house') { await hold('w', 3000); s = await st(); notes.push(`${q}: second try mode=${s.mode}`); }
    if (s.mode === 'house') {
      await shot(`inside-${q}`);
      const games = s.interactables.filter((x) => x.do === 'game');
      const pick = games[0] || s.interactables[0];
      await page.evaluate((k) => window.__town.approach(k), pick.key);
      await page.waitForTimeout(500);
      await shot(`facing-${pick.label}`);
      await page.keyboard.press('e'); await page.waitForTimeout(600);
      await shot(`panel-${pick.label}`);
      if (pick.do === 'game') {
        await page.click('#panel-actions button.play'); await page.waitForTimeout(5000);
        await shot(`game-${pick.label}`);
        const frame = page.frames().find((f) => f.url().includes('/games/'));
        if (frame && (await frame.$('#cmd'))) {
          for (const c of ['look', 'help', 'n']) { await frame.fill('#cmd', c); await frame.press('#cmd', 'Enter'); await page.waitForTimeout(700); }
          await shot(`game-typed-${pick.label}`);
        } else if (frame) {
          await page.click('#game-frame', { position: { x: 400, y: 300 } }).catch(() => {});
          await page.keyboard.press('Enter'); await page.waitForTimeout(1500); await shot(`game-clicked-${pick.label}`);
        }
        await page.click('#game-exit'); await page.waitForTimeout(500);
        notes.push(`${q}: back from game, playing=${(await st()).playing}`);
      } else await page.keyboard.press('Escape');
      // Use the dice tray and README in the archive.
      for (const want of ['dice', 'readme']) {
        const x = (await st()).interactables.find((i) => i.do === want);
        if (!x) continue;
        await page.evaluate((k) => window.__town.approach(k), x.key); await page.waitForTimeout(400);
        await page.keyboard.press('e'); await page.waitForTimeout(800); await shot(`archive-${want}`);
        await page.click('#panel-close');
      }
      await page.click('#btn-exit').catch(() => {}); await page.waitForTimeout(600);
      notes.push(`${q}: Exit house → mode=${(await st()).mode}`);
    }
  }
} else {
  // Phone: joystick walk, look-drag, buttons.
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const vw = page.viewportSize();
  const stickWalk = async (ms, dx = 0, dy = -60) => {
    const x = vw.width * 0.18, y = vw.height * 0.8;
    await touch('touchStart', [{ x, y, id: 1 }]);
    for (let t = 0; t < ms; t += 100) { await touch('touchMove', [{ x: x + dx, y: y + dy, id: 1 }]); await page.waitForTimeout(100); }
    await touch('touchEnd', []);
  };
  await stickWalk(1500); await shot('stick-walk');
  await page.fill('#search', 'Whispering'); await page.press('#search', 'Enter'); await page.waitForTimeout(900);
  await shot('at-house');
  await stickWalk(4000);
  let s = await st(); notes.push(`phone: walked into ${s.mode} ${s.coordinate}`);
  if (s.mode === 'house') {
    await shot('inside');
    const g = s.interactables.find((x) => x.do === 'game');
    if (g) {
      await page.evaluate((k) => window.__town.approach(k), g.key); await page.waitForTimeout(500);
      await page.tap('#t-use'); await page.waitForTimeout(700); await shot('cabinet-panel');
      await page.tap('#panel-actions button.play'); await page.waitForTimeout(6000); await shot('game');
      const frame = page.frames().find((f) => f.url().includes('/games/'));
      if (frame && (await frame.$('#cmd'))) { await frame.tap('#cmd'); await frame.fill('#cmd', 'look'); await frame.press('#cmd', 'Enter'); await page.waitForTimeout(800); await shot('game-typed'); }
      await page.tap('#game-exit'); await page.waitForTimeout(500); await shot('back');
    }
  }
}
console.log(notes.join('\n'));
await b.close();
