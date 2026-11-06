// Real Chromium acceptance for the Quaternius rigged candidate:
//   1. the side-by-side comparison page loads both paths for the same identity;
//   2. animation buttons change the rigged state and the canvas renders;
//   3. the in-game Settings → Resident style "quaternius" path attaches rigged models
//      to nearby residents without page errors.
// Screenshots are written to test-results/resident-quaternius/ for human review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const folder = process.env.RESIDENT_QUATERNIUS_SCREENSHOT_DIR || 'test-results/resident-quaternius';
fs.mkdirSync(folder, { recursive: true });
const urlArg = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : '';
let server = null, base = urlArg;
if (!base) { server = await startStaticServer(path.resolve('dist/public')); base = server.url; }
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });

try {
  // ---------- comparison page ----------
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon/i.test(m.text())) errors.push(m.text()); });
  await page.goto(base + 'resident-compare.html');
  await page.waitForFunction(() => window.__residentCompare?.ready === true, null, { timeout: 90000 });
  await page.waitForFunction(() => window.__residentCompare.state().quaterniusLoaded === true, null, { timeout: 60000 });
  await page.waitForTimeout(800);
  const initial = await page.evaluate(() => window.__residentCompare.state());
  assert.equal(initial.webgl, true, 'comparison page uses WebGL');
  assert.ok(initial.proceduralMeshes > 100, 'procedural figure is detailed: ' + initial.proceduralMeshes);
  assert.ok(initial.quaterniusMeshes <= 8, 'rigged candidate is cheap: ' + initial.quaterniusMeshes);
  assert.ok(initial.calls < 220, 'draw calls bounded: ' + initial.calls);
  assert.ok(initial.triangles < 80000, 'triangles bounded: ' + initial.triangles);
  const identities = await page.evaluate(() => window.__residentCompare.identities());
  assert.equal(identities.length, 8);
  assert.equal(new Set(identities.map((x) => x.id)).size, 8);
  await page.screenshot({ path: `${folder}/compare-desktop-idle.png` });

  for (const anim of ['walk', 'talk', 'sit', 'idle']) {
    const s = await page.evaluate((a) => window.__residentCompare.animation(a), anim);
    assert.equal(s.animation, anim, 'animation state ' + anim);
    assert.equal(s.quaterniusState, anim, 'rigged state ' + anim);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${folder}/compare-desktop-${anim}.png` });
  }
  // Every roster identity must rebuild both paths without errors.
  for (let i = 0; i < 8; i++) {
    await page.evaluate((n) => window.__residentCompare.select(n), i);
    await page.waitForTimeout(120);
  }
  assert.deepEqual(errors, [], 'comparison page has zero errors: ' + errors.join('; '));
  await page.close();

  // ---------- mobile comparison ----------
  const mobile = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  mobile.on('pageerror', (e) => errors.push(e.message));
  await mobile.goto(base + 'resident-compare.html');
  await mobile.waitForFunction(() => window.__residentCompare?.ready === true, null, { timeout: 90000 });
  await mobile.waitForFunction(() => window.__residentCompare.state().quaterniusLoaded === true, null, { timeout: 60000 });
  await mobile.waitForTimeout(700);
  const mobileState = await mobile.evaluate(() => window.__residentCompare.state());
  assert.equal(mobileState.quaterniusLoaded, true, 'mobile comparison loads the rigged model');
  assert.ok(mobileState.calls < 220, 'mobile draw calls bounded: ' + mobileState.calls);
  await mobile.evaluate(() => window.__residentCompare.animation('walk'));
  await mobile.waitForTimeout(250);
  await mobile.screenshot({ path: `${folder}/compare-mobile-walk.png` });
  await mobile.close();

  // ---------- in-game style ----------
  const game = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  game.on('pageerror', (e) => errors.push(e.message));
  game.on('console', (m) => { if (m.type() === 'error' && !/npc-chat|favicon/i.test(m.text())) errors.push(m.text()); });
  await game.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await game.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await game.goto(base);
  await game.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await game.evaluate(() => { window.__town.closePanel?.(); window.__town.residentStyle('quaternius'); window.__town.life.setTime(8 * 60 + 20); window.__town.life.run(15); });
  const ready = await game.evaluate(() => window.__town.residentStyleReady());
  assert.equal(ready, true, 'Quaternius style loads in-game');
  const spot = await game.evaluate(() => {
    const ps = window.__town.state().people.filter((x) => !x.inside);
    let best = null, bn = 0;
    for (const a of ps) { const n = ps.filter((q) => Math.hypot(q.x - a.x, q.z - a.z) < 12).length; if (n > bn) { bn = n; best = a; } }
    return best && { x: best.x, z: best.z };
  });
  assert.ok(spot, 'found residents outdoors');
  await game.evaluate((s) => window.__town.place(s.x, s.z + 7, 0), spot);
  await game.waitForTimeout(4000);
  const style = await game.evaluate(() => window.__town.residentStyle());
  assert.equal(style.style, 'quaternius');
  assert.ok(style.wearing > 0, 'nearby residents wear the rigged model: ' + style.wearing);
  await game.screenshot({ path: `${folder}/game-quaternius-residents.png` });
  assert.deepEqual(errors, [], 'zero page errors across comparison and game: ' + errors.join('; '));
  console.log(`PASS Quaternius resident comparison and in-game style: procedural ${initial.proceduralMeshes} meshes vs rigged ${initial.quaterniusMeshes}; ${initial.calls} calls/${initial.triangles} triangles; ${style.wearing} in-game models; screenshots in ${folder}/`);
} finally {
  await browser.close();
  if (server) await server.close();
}
