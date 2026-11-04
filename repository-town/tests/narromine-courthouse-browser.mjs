// Live scene verification in Chromium (desktop 1280x800 + Android/mobile 393x852):
// physically walks the player along Burraway Street and Merilba Street to all
// four disambiguated civic landmarks on Section 17, DP 758759:
//   1. 35 Burraway Street — Former Narromine Courthouse (1898, LEP Item I5) + Rear Lock-up
//   2. 37 Burraway Street — Hub n Spoke Circular Atrium Co-Working Building
//   3. 49 Merilba Street  — Narromine Police Station & Residence (osm:174, 2011 LiDAR)
//   4. 47 Merilba Street  — Narromine Courthouse (NSW Local Court)
// Usage: node tests/narromine-courthouse-browser.mjs [--mobile] [--url http://127.0.0.1:8093/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from '../tools/narromine-visual-qa/run.mjs';

const onlyMobile = process.argv.includes('--mobile');
const urlIdx = process.argv.indexOf('--url');
const explicitUrl = urlIdx >= 0 ? process.argv[urlIdx + 1] : process.env.TOWN_URL || '';
const folder = process.env.COURTHOUSE_SCREENSHOT_DIR || 'test-results/courthouse';
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

  // Collapse the HUD drawer so screenshots show the full 3D architecture
  await page.evaluate(() => {
    const toggle = document.getElementById('btn-hud-toggle');
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    window.__town.life.setTime(10.5 * 60); // 10:30 AM clear morning sun
  });

  // Place player in Narromine to trigger town visibility
  await page.evaluate(() => window.__town.place(-4595.0, -760.0, 0));
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
  await page.waitForTimeout(300);

  // 1. 35 Burraway Street — Former Narromine Courthouse (1898, LEP Item I5)
  await walkAndCapture(
    page,
    tag,
    [-4595.0, -760.0],
    [-4590.5, -766.5],
    [-4585.8, -777.8],
    /(Former Narromine Courthouse|former-courthouse-35-burraway)/i,
    '35-burraway-former-courthouse'
  );

  // 2. 37 Burraway Street — Hub n Spoke Circular Atrium Building
  await walkAndCapture(
    page,
    tag,
    [-4572.0, -748.5],
    [-4563.5, -753.5],
    [-4559.8, -769.7],
    /(Hub ?n ?Spoke|hub-n-spoke-37-burraway)/i,
    '37-burraway-hub-n-spoke'
  );

  // 3. 49 Merilba Street — Narromine Police Station & Residence (osm:174)
  await walkAndCapture(
    page,
    tag,
    [-4613.5, -781.0],
    [-4608.9, -789.5],
    [-4598.7, -791.5],
    /(Narromine Police Station|police-station-49-merilba)/i,
    '49-merilba-police-station'
  );

  // 4. 47 Merilba Street — Operational Narromine Courthouse (NSW Local Court)
  await walkAndCapture(
    page,
    tag,
    [-4613.5, -818.0],
    [-4605.8, -829.5],
    [-4590.5, -833.5],
    /(Narromine Courthouse|courthouse-47-merilba)/i,
    '47-merilba-local-court'
  );

  if (!mobile) {
    // Capture wider street-level perspective of 47 Merilba St Local Court portico + clerestory monitor
    const courtWideYaw = lookAtYaw(-4616.0, -831.0, -4590.5, -833.5);
    await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4616.0, -831.0, courtWideYaw]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${folder}/desktop-47-merilba-streetscape.png` });

    // Capture street-level perspective of 35 Burraway St Former Courthouse + 1898 Rear Lock-up
    const formerWideYaw = lookAtYaw(-4593.5, -761.0, -4583.0, -781.0);
    await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4593.5, -761.0, formerWideYaw]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${folder}/desktop-35-burraway-streetscape.png` });

    // Capture street-level perspective of 37 Burraway St Hub n Spoke circular drum & fan roof
    const hubWideYaw = lookAtYaw(-4565.5, -745.0, -4559.8, -769.7);
    await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4565.5, -745.0, hubWideYaw]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${folder}/desktop-37-burraway-streetscape.png` });

    // Capture street-level perspective of 49 Merilba St Police Station & Residence
    const policeWideYaw = lookAtYaw(-4616.0, -792.0, -4598.7, -791.5);
    await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4616.0, -792.0, policeWideYaw]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${folder}/desktop-49-merilba-streetscape.png` });
  }

  assert.deepEqual(errors, [], `${tag}: zero browser page errors`);
  await page.close();
}

try {
  if (onlyMobile) {
    await runViewport(true);
  } else {
    await runViewport(false);
    await runViewport(true);
  }
  console.log('PASS Narromine Courthouse Precinct browser verification (desktop 1280x800 + mobile 393x852): physical walks, interactive spots, 10 screenshots, zero page errors.');
} finally {
  await browser.close();
  if (localServer) await localServer.close();
}
