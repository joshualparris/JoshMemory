// NR-REAL-001 — physically walk both outer footpaths of northern dual-carriageway Dandaloo Street.
// This verifies the changed northern streetscape, not the separate NW heritage frontages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { STREETS } from '../src/world/narromine-layout.js';
import { findDandalooCarriageways, roadXAtZ } from '../src/world/narromine-dandaloo-streetscape-data.js';
import { positionAndMeasureInPage, startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const [west, east] = findDandalooCarriageways(STREETS);
const folder = process.env.NORTH_DANDALOO_SCREENSHOT_DIR || 'test-results/north-dandaloo';
const onlyMobile = process.argv.includes('--mobile');
const segments = [
  { id: 'upper-west', street: west, side: -1, from: -886, to: -899 },
  { id: 'upper-east', street: east, side: 1, from: -886, to: -899 },
  { id: 'lower-west', street: west, side: -1, from: -1002, to: -1015 },
  { id: 'lower-east', street: east, side: 1, from: -1002, to: -1015 },
];
const footpath = (s, z) => ({
  x: roadXAtZ(s.street, z) + s.side * (s.street.width / 2 + 1.25),
  z,
});
for (const s of segments) {
  assert(Number.isFinite(footpath(s, s.from).x) && Number.isFinite(footpath(s, s.to).x),
    'both road-edge footpath poses must exist in the actual OSM street data');
}
fs.mkdirSync(folder, { recursive: true });
const server = await startStaticServer(path.resolve('dist/public'));
const hasSystemChrome = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || (hasSystemChrome ? 'chrome' : undefined),
  args: hasSystemChrome ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
async function runViewport(mobile) {
  const tag = mobile ? 'phone' : 'desktop';
  const page = await browser.newPage(mobile
    ? { viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
    : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', r => r.abort('connectionrefused'));
  try {
    await page.goto(server.url);
    await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden,
      null, { timeout: 90000 });
    await page.evaluate(() => {
      const toggle = document.getElementById('btn-hud-toggle');
      if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
      window.__town.life.setTime(630);
    });
    for (const segment of segments) {
      const a = footpath(segment, segment.from), b = footpath(segment, segment.to);
      await page.evaluate(({ x, z }) => window.__town.place(x, z, 0), a);
      await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 20000 });
      const response = await page.evaluate(({ x, z }) => window.__town.walkTo(x, z), b);
      assert.equal(response, null, tag + ' ' + segment.id + ': walkTo accepted');
      await page.waitForFunction(({ x, z }) => {
        const state = window.__town.state();
        return !window.__town.autoWalk()
          && Math.hypot(state.pos.x - x, state.pos.z - z) < 1.25;
      }, b, { timeout: 35000 });
      await positionAndMeasureInPage(page, {
        x: b.x, z: b.z, yawRad: -Math.PI / 2, pitchRad: 0.025,
        eyeHeightM: 1.65, fovDeg: 75, minute: 630, weather: 'clear',
        sampleFrames: 5, hideHud: false,
      });
      await page.screenshot({ path: path.join(folder, tag + '-' + segment.id + '.png') });
      console.log('PASS ' + tag + ' walked ' + segment.id + ': '
        + Math.hypot(b.x - a.x, b.z - a.z).toFixed(1) + 'm');
    }
    assert.equal(errors.length, 0, tag + ': no page errors: ' + errors.join('; '));
  } finally { await page.close(); }
}
try {
  if (!onlyMobile) await runViewport(false);
  await runViewport(true);
} finally {
  await browser.close();
  await server.close();
}
