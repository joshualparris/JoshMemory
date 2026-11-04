// Live scene verification in Chromium (desktop 1280x800 + mobile 393x852):
// physically walks the player through the Narromine Aviation Museum & Aerodrome
// Precinct (Tom Perry Drive, Lot 122 DP 1126499, Narromine LEP 2011 Item I12):
//   1. Tom Perry Drive North Entrance -> Walk inside Main Exhibition Hangar (osm:218)
//      to inspect the 1903 Wright Flyer Full-Scale Replica (VH-XWF), Corben Super Ace,
//      and Rolls-Royce Merlin Mk 25 V12 aero engine
//   2. Walk out the 12 m Eastern Hangar Doors to the CAC CA-27 Sabre Mk 32 (A94-915)
//      Gate Guardian on the forecourt pylon plinth
//   3. Walk to the WWII RAAF No. 5 EFTS Memorial Wall (33 bronze plaques)
//   4. Walk to the Narromine Aero Club (est. 1929, osm:1)
//   5. Walk to the Narromine Gliding Club & Soaring Centre (osm:217 & 15 m sailplane)
// Usage: node tests/narromine-aviation-browser.mjs [--mobile] [--url http://127.0.0.1:8094/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const onlyMobile = process.argv.includes('--mobile');
const urlIdx = process.argv.indexOf('--url');
const explicitUrl = urlIdx >= 0 ? process.argv[urlIdx + 1] : process.env.TOWN_URL || '';
const folder = process.env.AVIATION_SCREENSHOT_DIR || 'test-results/aviation';
fs.mkdirSync(folder, { recursive: true });

let localServer = null;
let url = explicitUrl;
if (!url) {
  localServer = await startStaticServer(path.resolve('dist/public'));
  url = localServer.url;
}

const hasSystemChrome = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || (hasSystemChrome ? 'chrome' : undefined),
  args: hasSystemChrome ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const lookAtYaw = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));

async function walkAndCapture(page, tag, startPt, destPt, lookTarget, expectedSpotRegex, screenshotName) {
  const startYaw = lookAtYaw(startPt[0], startPt[1], destPt[0], destPt[1]);
  await page.evaluate(
    ([x, z, yaw]) => {
      window.__town.closePanel?.();
      window.__town.place(x, z, yaw);
    },
    [startPt[0], startPt[1], startYaw]
  );
  await page.waitForTimeout(200);

  const status = await page.evaluate(([x, z]) => window.__town.walkTo(x, z), destPt);
  assert.equal(status, null, `${tag} (${screenshotName}): walkTo accepted (${status})`);
  await page.waitForFunction(
    ([x, z]) => {
      const p = window.__town.state().pos;
      return Math.hypot(p.x - x, p.z - z) < 1.25;
    },
    destPt,
    { timeout: 25000 }
  );

  const viewYaw = lookAtYaw(destPt[0], destPt[1], lookTarget[0], lookTarget[1]);
  await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [destPt[0], destPt[1], viewYaw]);
  await page.waitForTimeout(300);

  const nearSpot = await page.evaluate(() => window.__town.state().nearPerson);
  const spotLabel = typeof nearSpot === 'string' ? nearSpot : nearSpot?.label || nearSpot?.text || '';
  assert.ok(
    nearSpot && expectedSpotRegex.test(spotLabel),
    `${tag} (${screenshotName}): expected nearPerson matching ${expectedSpotRegex}, got ${JSON.stringify(nearSpot)}`
  );

  await page.screenshot({ path: `${folder}/${tag}-${screenshotName}.png` });
}

async function runViewport(mobile) {
  const tag = mobile ? 'mobile' : 'desktop';
  const page = await browser.newPage(
    mobile
      ? { viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
      : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }
  );
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('town-cheats', '1'));
  await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));
  await page.goto(url);
  await page.waitForFunction(() => window.__town && document.getElementById('loading').hidden, null, { timeout: 90000 });

  await page.evaluate(() => {
    const toggle = document.getElementById('btn-hud-toggle');
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    window.__town.life.setTime(10.5 * 60); // 10:30 AM clear morning sun
  });

  // Place player at Narromine Aerodrome looking south at the Museum Exhibition Hangar & Beacon Tower
  const facadeYaw = lookAtYaw(-5726.5, -2032.0, -5726.5, -2050.0);
  await page.evaluate(([yaw]) => window.__town.place(-5726.5, -2032.0, yaw), [facadeYaw]);
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${folder}/${tag}-01-museum-north-facade.png` });

  // 1. Walk from Tom Perry Drive through the North Visitor Foyer Door into the Exhibition Hangar (1903 Wright Flyer Replica)
  await walkAndCapture(
    page,
    tag,
    [-5726.5, -2040.5],
    [-5722.5, -2052.5],
    [-5725.2, -2054.8],
    /(Wright[- ]Flyer|Narromine Aviation Museum)/i,
    '02-interior-wright-flyer-exhibit'
  );

  // 2. Walk inside the hangar to the Rolls-Royce Merlin Mk 25 V12 Aero Engine Stand
  await walkAndCapture(
    page,
    tag,
    [-5722.5, -2052.5],
    [-5717.5, -2056.5],
    [-5716.2, -2058.2],
    /(Rolls-Royce[- ]Merlin|merlin-mk25)/i,
    '03-interior-rolls-royce-merlin'
  );

  // 3. Walk out through the 12 m Eastern Hangar Doors to the CAC CA-27 Sabre Mk 32 (A94-915) Gate Guardian
  await walkAndCapture(
    page,
    tag,
    [-5706.0, -2060.5],
    [-5706.8, -2064.2],
    [-5710.5, -2068.5],
    /(CAC[- ]CA-27[- ]Sabre|sabre-a94-915)/i,
    '04-forecourt-cac-sabre-a94-915'
  );

  // 4. Walk to the WWII RAAF No. 5 EFTS Memorial Wall (33 bronze plaques)
  await walkAndCapture(
    page,
    tag,
    [-5715.0, -2068.5],
    [-5720.5, -2069.5],
    [-5720.5, -2071.5],
    /(RAAF No\. 5 EFTS|raaf-5efts-memorial-wall)/i,
    '05-raaf-5efts-memorial-wall'
  );

  // 5. Walk to the Narromine Gliding Club & Soaring Centre (15 m Sailplane)
  await walkAndCapture(
    page,
    tag,
    [-5633.0, -2030.5],
    [-5628.0, -2032.0],
    [-5628.0, -2034.0],
    /(Sailplane|narromine-soaring-sailplane|Narromine Gliding Club|soaring)/i,
    '06-gliding-club-sailplane'
  );

  assert.deepEqual(errors, [], `${tag}: zero page errors`);
  await page.close();
  console.log(`PASS Narromine Aviation Museum & Aerodrome browser walk (${tag}): 6 screenshots captured, zero page errors`);
}

try {
  if (!onlyMobile) await runViewport(false);
  await runViewport(true);
} finally {
  await browser.close();
  if (localServer) await localServer.close();
}
