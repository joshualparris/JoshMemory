// Real furniture models load in the browser and appear in houses and civic interiors.
//   node tests/furniture.mjs [--url http://localhost:8091/]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const i = process.argv.indexOf('--url');
const URL = i >= 0 ? process.argv[i + 1] : 'http://localhost:8091/';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
const bad = [];
page.on('pageerror', (e) => bad.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/allowfullscreen/.test(m.text())) bad.push(m.text()); });
await page.goto(URL);
await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });
const r = await page.evaluate(async () => {
  const f = await import('/world/furniture.js');
  await f.loadFurniture();
  const names = f.FURNITURE.filter((n) => !f.modelGeometry(n, { w: 1 }));
  const g = f.modelGeometry('chair_A_wood', { w: 0.5, d: 0.5, h: 0.9 });
  g.computeBoundingBox();
  return { ready: f.furnitureReady(), missing: names, h: +(g.boundingBox.max.y - g.boundingBox.min.y).toFixed(2), floor: +g.boundingBox.min.y.toFixed(2), attrs: Object.keys(g.attributes).sort().join() };
});
assert.equal(r.ready, true, 'furniture loaded');
assert.deepEqual(r.missing, [], 'every listed model loads');
assert.equal(r.h, 0.9); assert.equal(r.floor, 0);
assert.equal(r.attrs, 'color,normal,position,uv');
// A house with a bed and the civic interiors build with models and without console errors.
for (const id of ['cafe', 'pub', 'clinic', 'hall']) { await page.evaluate((x) => { window.__town.enterShop(x); }, id); await page.waitForTimeout(300); await page.evaluate(() => window.__town.exitShop()); }
assert.deepEqual(bad, [], 'no console errors');
await browser.close();
console.log('PASS: ' + 'furniture models load, fit to size, stand on the floor and build into interiors');
