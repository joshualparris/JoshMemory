// Narromine main-street physiotherapy screenshot acceptance for desktop/mobile.
// Run after npm run build: node tests/narromine-mainstreet-physio-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const target = [-4760.8, -1086.0]; // surveyed OSM:186 Dandaloo-facing frontage
const view = [-4751.3, -1078.2]; // comparison screenshot #45 game camera
const lookAtYaw = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));
const outdir = process.env.PHYSIO_SCREENSHOT_DIR || 'test-results/narromine-physio';
fs.mkdirSync(outdir, { recursive: true });
const argUrl = process.argv.indexOf('--url');
const providedUrl = argUrl > -1 ? process.argv[argUrl + 1] : process.env.TOWN_URL;
const server = providedUrl ? null : await startStaticServer(path.resolve('dist/public'));
const baseUrl = providedUrl || server.url;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  for (const [tag, options] of [
    ['desktop', { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }],
    ['mobile', { viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ]) {
    const page = await browser.newPage(options);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
    await page.route('**/api/npc-chat', route => route.abort('connectionrefused'));
    await page.goto(baseUrl);
    await page.waitForFunction(() => window.__town && document.getElementById('loading')?.hidden, null, { timeout: 90000 });
    await page.evaluate(() => {
      window.__town.life.setTime(12.5 * 60);
      const toggle = document.getElementById('btn-hud-toggle');
      if (toggle && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    });
    await page.evaluate(([x, z, tx, tz, yaw]) => window.__town.place(x, z, yaw),
      [...view, ...target, lookAtYaw(...view, ...target)]);
    await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
    await page.waitForTimeout(850);
    const shot = path.join(outdir, tag + '-physiotherapy.png');
    await page.screenshot({ path: shot });
    assert.ok(fs.statSync(shot).size > 20000, tag + ' screenshot contains a rendered frame');
    assert.deepEqual(pageErrors, [], tag + ' has no browser errors');
    await page.close();
  }
  console.log('PASS physiotherapy photo-matched street façade browser smoke test: desktop + mobile screenshots, no page errors');
} finally {
  await browser.close();
  if (server) await server.close();
}
