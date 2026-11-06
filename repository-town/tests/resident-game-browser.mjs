// Real Chromium verification that the detailed resident figures actually render inside the
// full game: Repository Town villagers, a Narromine household, and Coles Narromine. Uses the
// system Chrome (like the other local suites); not a replacement for Playwright's own browser
// where that is installed. Saves screenshots for human review.
//   node tests/resident-game-browser.mjs [--url http://127.0.0.1:PORT/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const folder = process.env.RESIDENT_SCREENSHOT_DIR || 'test-results/resident-game';
const mobile = process.argv.includes('--mobile');
const tag = mobile ? 'phone-' : 'desktop-';
fs.mkdirSync(folder, { recursive: true });
const explicitUrl = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : process.env.TOWN_URL || '';
let server = null, url = explicitUrl;
if (!url) { server = await startStaticServer(path.resolve('dist/public')); url = server.url; }
// Prefer Playwright's installed Chromium (CI and most Linux desktops); fall back to the
// system Chrome channel on machines where the Playwright browser is not downloaded.
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
  .catch(() => chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] }));

try {
  const page = await browser.newPage(mobile ? { viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 } : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/npc-chat|favicon|WebGL context could not/i.test(m.text())) errors.push(m.text()); });
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(url);
  await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
  await page.waitForFunction(() => window.__town.state().triangles > 1000, null, { timeout: 30000 });

  // Repository Town villagers carry the new detailed figure.
  await page.evaluate(() => { window.__town.closePanel?.(); window.__town.residentStyle('classic'); window.__town.life.setTime(8 * 60 + 20); window.__town.life.run(15); });
  const spot = await page.evaluate(() => {
    const ps = window.__town.state().people.filter((x) => !x.inside);
    let best = null, bn = 0;
    for (const a of ps) { const n = ps.filter((q) => Math.hypot(q.x - a.x, q.z - a.z) < 12).length; if (n > bn) { bn = n; best = a; } }
    return best && { x: best.x, z: best.z };
  });
  assert.ok(spot, 'found Repository Town villagers outdoors at 08:35');
  await page.evaluate((s) => window.__town.place(s.x, s.z + 8, 0), spot);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${folder}/${tag}repo-town-villagers.png` });
  const townFigureCount = await page.evaluate(() => window.__town.townFigures().filter((f) => f.visible).length);
  assert.ok(townFigureCount > 0, 'Repository Town villagers are drawn');

  // A Narromine household at dinner time, with its residents home and dressed for the meal.
  await page.evaluate(() => { window.__town.life.setTime(19 * 60); window.__town.place(-4595, -760, 0); });
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
  const doors = await page.evaluate(() => window.__town.narromineHomeDoors());
  assert.ok(doors.length > 0, 'Narromine home doors are available');
  const enteredHome = await page.evaluate((id) => window.__town.enterNarromineHome(id), doors[0].id);
  assert.equal(enteredHome, true, 'entered a Narromine household');
  await page.waitForTimeout(400);
  const homeInfo = await page.evaluate(() => window.__town.insideInfo());
  assert.ok(homeInfo && homeInfo.occupants, 'household interior built with occupants');
  assert.ok(homeInfo.figureIds?.length > 0, 'home interior exposes rendered resident ids');
  assert.equal(new Set(homeInfo.figureIds).size, homeInfo.figureIds.length, 'home resident ids are unique');
  await page.screenshot({ path: `${folder}/${tag}narromine-home.png` });
  const homeFigure = homeInfo.figurePositions[0];
  if (homeFigure) {
    await page.evaluate((f) => window.__town.place(f.x, f.z + 1.25, Math.atan2(0, -1)), homeFigure);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${folder}/${tag}narromine-home-closeup.png` });
  }
  await page.evaluate(() => document.getElementById('btn-exit').click());
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });

  // Coles Narromine with staff and shoppers in activity clothing.
  await page.evaluate(() => { window.__town.life.setTime(11 * 60); window.__town.place(-4820, -880, 0); });
  await page.waitForTimeout(300);
  const enteredColes = await page.evaluate(() => window.__town.enterNarromineColes());
  assert.equal(enteredColes, true, 'entered Coles Narromine');
  await page.waitForTimeout(500);
  const colesInfo = await page.evaluate(() => window.__town.insideInfo());
  assert.ok(colesInfo?.figureIds?.length > 0, 'Coles exposes rendered staff/shopper ids');
  assert.equal(new Set(colesInfo.figureIds).size, colesInfo.figureIds.length, 'Coles figure ids are unique');
  await page.screenshot({ path: `${folder}/${tag}narromine-coles.png` });
  const colesFigure = colesInfo.figurePositions[0];
  if (colesFigure) {
    await page.evaluate((f) => window.__town.place(f.x, f.z + 1.3, Math.atan2(0, -1)), colesFigure);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${folder}/${tag}narromine-coles-closeup.png` });
  }

  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  assert(hasCanvas, 'game canvas present');
  assert.deepEqual(errors, [], 'zero page errors during game verification: ' + errors.join('; '));
  console.log(`PASS Resident figures in-game (${mobile ? 'Pixel 7-size' : 'desktop'}): Repo Town villagers, Narromine home, Coles; rendered WebGL screenshots in ${folder}/`);
} finally {
  await browser.close();
  if (server) await server.close();
}
