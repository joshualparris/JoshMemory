// Live WebGL browser verification in Chromium (Desktop 1280×800 + Mobile 393×852)
// for the North-West Dandaloo Street Heritage, Civic & Commercial Block
// (38–68 Dandaloo Street, Narromine NSW 2821 — comparison screenshots #31–#44 & #47–#50).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { positionAndMeasureInPage, startStaticServer } from '../tools/narromine-visual-qa/run.mjs';
import { compassHeadingToYaw } from '../tools/narromine-visual-qa/locations.mjs';

const onlyMobile = process.argv.includes('--mobile');
const folder = process.env.NW_DANDALOO_SCREENSHOT_DIR || 'test-results/nw-dandaloo';
fs.mkdirSync(folder, { recursive: true });

const localServer = await startStaticServer(path.resolve('dist/public'));
const url = localServer.url;

const hasSystemChrome = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || (hasSystemChrome ? 'chrome' : undefined),
  args: hasSystemChrome ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const degToYaw = (headingDeg) => -(headingDeg * Math.PI) / 180;

// Exact camera poses matched to the user's narromine-compare.html screenshots (#34..#50)
const MATCHED_VIEWPOINTS = [
  { id: 'frame34-68-dandaloo-wardi-bank', x: -4764.4, z: -974.0, headingDeg: 306, pitchDeg: 3, fov: 75 },
  { id: 'frame36-60-dandaloo-macquarie-clothing', x: -4762.5, z: -991.5, headingDeg: 306, pitchDeg: 3, fov: 75 },
  { id: 'frame38-56-dandaloo-mens-shed', x: -4760.2, z: -1010.8, headingDeg: 306, pitchDeg: 3, fov: 75 },
  { id: 'frame42-58-dandaloo-usmc', x: -4754.2, z: -1054.8, headingDeg: 306, pitchDeg: 3, fov: 75 },
  { id: 'frame44-52-dandaloo-cottage', x: -4751.8, z: -1072.5, headingDeg: 306, pitchDeg: 3, fov: 75 },
  { id: 'frame47-44-dandaloo-baptist-church', x: -4747.8, z: -1096.5, headingDeg: 300, pitchDeg: 3, fov: 75 },
  { id: 'frame49-42-dandaloo-battlers-mate', x: -4745.8, z: -1110.5, headingDeg: 300, pitchDeg: 3, fov: 75 },
  { id: 'frame50-38-dandaloo-aqua-west', x: -4742.5, z: -1131.5, headingDeg: 298, pitchDeg: 3, fov: 75 },
];

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
    window.__town.life.setTime(10.5 * 60);
  });

  // Trigger Narromine visibility and verify physical walkability along the West Dandaloo footpath
  await page.evaluate(() => window.__town.place(-4770.0, -980.0, 0));
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
  await page.waitForTimeout(300);

  // Walk along the footpath under Macquarie Clothing & Men's Shed verandahs
  const walkStatus = await page.evaluate(() => window.__town.walkTo(-4768.0, -996.0));
  assert.equal(walkStatus, null, `${tag}: walkTo along West Dandaloo footpath accepted`);
  await page.waitForFunction(
    () => !window.__town.autoWalk() && Math.hypot(window.__town.state().pos.x - (-4768.0), window.__town.state().pos.z - (-996.0)) < 0.8,
    null,
    { timeout: 20000 }
  );

  // Capture all 8 matched Street View comparison viewpoints facing NW (306°)
  for (const vp of MATCHED_VIEWPOINTS) {
    const yawRad = compassHeadingToYaw(vp.headingDeg);
    const pitchRad = (vp.pitchDeg * Math.PI) / 180;
    await positionAndMeasureInPage(page, {
      x: vp.x,
      z: vp.z,
      yawRad,
      pitchRad,
      eyeHeightM: 1.65,
      fovDeg: vp.fov,
      minute: 10.5 * 60,
      weather: 'clear',
      sampleFrames: 6,
      hideHud: false,
    });
    await page.screenshot({ path: `${folder}/${tag}-${vp.id}.png` });
  }

  assert.equal(errors.length, 0, `${tag}: zero page errors (${errors.join('; ')})`);
  await page.close();
  console.log(`PASS ${tag}: walked West Dandaloo footpath and captured ${MATCHED_VIEWPOINTS.length} matched comparison frames`);
}

try {
  if (!onlyMobile) await runViewport(false);
  await runViewport(true);
} finally {
  await browser.close();
  await localServer.close();
}
