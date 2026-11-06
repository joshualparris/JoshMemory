// Real Chromium acceptance for the Resident Studio: desktop 1280×800 and Pixel 7-sized
// 393×852. It checks the identity set, every animation, the clothing contexts, the three
// LOD levels and the 12-person crowd, and saves screenshots for human inspection.
//   node tests/resident-showcase-browser.mjs [--url http://127.0.0.1:PORT/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const folder = process.env.RESIDENT_SCREENSHOT_DIR || 'test-results/resident-visual';
fs.mkdirSync(folder, { recursive: true });
const explicitUrl = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : process.env.TOWN_URL || '';
let server = null, url = explicitUrl;
if (!url) { server = await startStaticServer(path.resolve('dist/public')); url = server.url; }
// Prefer Playwright's installed Chromium (CI and most Linux desktops); fall back to the
// system Chrome channel on machines where the Playwright browser is not downloaded.
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
  .catch(() => chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] }));

async function run(tag, viewport, mobile) {
  const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url + 'residents.html');
  await page.waitForFunction(() => window.__residentStudio?.ready === true, null, { timeout: 30000 });
  await page.waitForTimeout(400);

  const ids = await page.evaluate(() => window.__residentStudio.identities());
  assert.equal(ids.length, 16, tag + ': 16 identities');
  assert.equal(new Set(ids.map((x) => x.signature)).size, 16, tag + ': every identity is visually distinct');
  assert(ids.every((x) => x.name && x.age > 0 && x.occupation), tag + ': identities have name/age/occupation');
  assert(new Set(ids.map((x) => x.occupation)).size >= 8, tag + ': varied occupations');
  assert(new Set(ids.map((x) => x.age)).size >= 6, tag + ': varied ages');
  for (const person of ids.filter((x) => x.age < 18)) assert.equal(person.occupation, 'student', tag + ': school-age resident is a student, not staff: ' + person.name);

  const initial = await page.evaluate(() => window.__residentStudio.state());
  assert.equal(initial.animation, 'idle');
  assert.equal(initial.context, 'home');
  assert.equal(initial.lod, 0);
  assert(initial.identity?.signature, tag + ': selected identity');
  assert(initial.visibleMeshes > 80, tag + ': detailed figure is on stage: ' + initial.visibleMeshes);
  const data = await page.evaluate(() => document.getElementById('stage').toDataURL('image/png'));
  assert(data.startsWith('data:image/png') && data.length > 30000, tag + ': WebGL canvas renders actual pixels');

  // Every animation must be selectable and leave the figure posed without errors.
  for (const a of initial.animations) {
    const s = await page.evaluate((id) => window.__residentStudio.animation(id), a);
    assert.equal(s.animation, a, tag + ': animation ' + a);
    await page.waitForTimeout(120);
  }
  assert.deepEqual(errors, [], tag + ': no page errors during all animations');

  // Clothing contexts are visibly different garment sets.
  const outfitKeys = new Set();
  for (const c of initial.contexts) {
    const s = await page.evaluate((id) => window.__residentStudio.context(id), c);
    assert.equal(s.context, c, tag + ': context ' + c);
    outfitKeys.add(s.identity.outfit);
    await page.waitForTimeout(120);
    await page.evaluate(() => window.__residentStudio.animation('idle'));
    await page.screenshot({ path: `${folder}/${tag}-context-${c}.png` });
  }
  assert(outfitKeys.size >= 4, tag + ': home/work/rain/night/exercise produce different outfits: ' + outfitKeys.size);

  // LOD levels must actually reduce work and then restore the detailed body.
  await page.evaluate(() => window.__residentStudio.context('work'));
  await page.evaluate(() => window.__residentStudio.animation('idle'));
  const near = await page.evaluate(() => window.__residentStudio.lod(0));
  const mid = await page.evaluate(() => window.__residentStudio.lod(1));
  const far = await page.evaluate(() => window.__residentStudio.lod(3));
  assert(near.visibleMeshes > mid.visibleMeshes, tag + ': mid LOD is cheaper than near');
  assert(far.visibleMeshes < near.visibleMeshes * .75, tag + ': far LOD is materially cheaper: ' + near.visibleMeshes + ' → ' + far.visibleMeshes);
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.evaluate(() => window.__residentStudio.lod(0));
  await settle();
  const nearShot = await page.locator('#stage').screenshot();
  await page.screenshot({ path: `${folder}/${tag}-lod-near.png` });
  await page.evaluate(() => window.__residentStudio.lod(3));
  await settle();
  const farShot = await page.locator('#stage').screenshot();
  const pixelDiff = await page.evaluate(async ({ a, b }) => {
    const decode = async (base64) => {
      const blob = await (await fetch('data:image/png;base64,' + base64)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    const [na, fa] = await Promise.all([decode(a), decode(b)]);
    let changed = 0, total = 0;
    for (let i = 0; i < na.data.length; i += 4) {
      if (Math.abs(na.data[i] - fa.data[i]) > 5 || Math.abs(na.data[i + 1] - fa.data[i + 1]) > 5 || Math.abs(na.data[i + 2] - fa.data[i + 2]) > 5) changed++;
      total++;
    }
    return changed / total;
  }, { a: nearShot.toString('base64'), b: farShot.toString('base64') });
  assert(pixelDiff > .02, tag + ': far LOD changes rendered pixels meaningfully: ' + (pixelDiff * 100).toFixed(2) + '%');
  await page.screenshot({ path: `${folder}/${tag}-lod-far.png` });
  await page.evaluate(() => window.__residentStudio.lod(0));

  // Screenshots for the key poses at desktop and mobile.
  for (const a of ['idle', 'walk', 'sit', 'eat', 'carry', 'work', 'sleep', 'talk']) {
    await page.evaluate((id) => window.__residentStudio.animation(id), a);
    await page.waitForTimeout(140);
    await page.screenshot({ path: `${folder}/${tag}-anim-${a}.png` });
  }
  await page.evaluate(() => window.__residentStudio.animation('idle'));

  // The crowd demonstrates variation and distance LOD together.
  const crowd = await page.evaluate(() => window.__residentStudio.crowd(true));
  assert.equal(crowd.crowd, true);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${folder}/${tag}-crowd.png` });
  await page.evaluate(() => window.__residentStudio.crowd(false));
  await page.waitForTimeout(250);

  // Changing resident must change identity, not just labels.
  const first = await page.evaluate(() => window.__residentStudio.state().identity.signature);
  const next = await page.evaluate(() => window.__residentStudio.next());
  assert.notEqual(next.identity.signature, first, tag + ': next resident is a different person');

  assert.deepEqual(errors, [], tag + ': zero page errors');
  await page.close();
}

try {
  await run('desktop', { width: 1280, height: 800 }, false);
  await run('mobile', { width: 393, height: 852 }, true);
  console.log(`PASS Resident Studio browser acceptance (desktop 1280×800 + mobile 393×852): 16 identities, all animations, clothing contexts, LOD and crowd; screenshots in ${folder}/`);
} finally {
  await browser.close();
  if (server) await server.close();
}
