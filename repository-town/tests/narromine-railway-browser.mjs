// Live scene verification in Chromium (desktop 1280x800 + mobile 393x852):
// physically walks the player along Narromine Station Access road into the
// station forecourt, verifies the Narromine Railway Station & NSW TrainLink
// Coach Stop interactive spots, and physically walks along Platform 1.
// Usage: node tests/narromine-railway-browser.mjs [--mobile] [--url http://127.0.0.1:8092/]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const onlyMobile = process.argv.includes('--mobile');
const urlIdx = process.argv.indexOf('--url');
const url = urlIdx >= 0 ? process.argv[urlIdx + 1] : process.env.TOWN_URL || 'http://127.0.0.1:8092/';
const folder = process.env.RAILWAY_SCREENSHOT_DIR || 'test-results/railway';
fs.mkdirSync(folder, { recursive: true });

const hasSystemChrome = fs.existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe');
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || (hasSystemChrome ? 'chrome' : undefined),
  args: hasSystemChrome ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const lookAtYaw = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));

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

  // Collapse the HUD drawer if open so screenshots clearly show the full 3D architecture
  await page.evaluate(() => {
    const toggle = document.getElementById('btn-hud-toggle');
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
  });

  // 1. Place player on Narromine Station Access road approaching the forecourt from WSW
  const approachYaw = lookAtYaw(-4722.0, -711.5, -4706.8, -714.2);
  await page.evaluate(
    ([x, z, yaw]) => {
      window.__town.closePanel?.();
      window.__town.life.setTime(10.5 * 60); // 10:30 AM clear morning sun
      window.__town.place(x, z, yaw);
    },
    [-4722.0, -711.5, approachYaw]
  );
  await page.waitForFunction(() => window.__town.narromineVisible(), null, { timeout: 15000 });
  await page.waitForTimeout(300);

  const start = await page.evaluate(() => ({
    visible: window.__town.narromineVisible(),
    state: window.__town.state(),
  }));
  assert(start.visible, `${tag}: Narromine scene is visible`);
  assert(start.state.triangles > 1000, `${tag}: live WebGL scene rendered geometry (${start.state.triangles} triangles)`);
  await page.screenshot({ path: `${folder}/${tag}-forecourt-approach.png` });

  // 2. Physically walk along Narromine Station Access road into the station forecourt spot
  const roadWaypoints = [
    [-4712.4, -710.8], // NSW TrainLink Coach Stop spot
    [-4708.8, -710.2], // Narromine Railway Station forecourt spot
    [-4700.0, -705.0], // East end of Narromine Station Access forecourt
  ];
  for (let i = 0; i < roadWaypoints.length; i++) {
    const dest = roadWaypoints[i];
    const status = await page.evaluate(([x, z]) => window.__town.walkTo(x, z), dest);
    assert.equal(status, null, `${tag}: walkTo road waypoint ${i} accepted (${status})`);
    await page.waitForFunction(
      ([x, z]) => {
        const p = window.__town.state().pos;
        return Math.hypot(p.x - x, p.z - z) < 1.1;
      },
      dest,
      { timeout: 25000 }
    );
    if (i === 1) {
      // Face the main brick station building portico from the forecourt spot
      const porticoYaw = lookAtYaw(dest[0], dest[1], -4705.2, -714.6);
      await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [dest[0], dest[1], porticoYaw]);
      await page.waitForTimeout(300);
      const nearSpot = await page.evaluate(() => window.__town.state().nearPerson);
      assert(nearSpot && /Narromine Railway Station/i.test(typeof nearSpot === 'string' ? nearSpot : nearSpot.label || nearSpot.text || ''), `${tag}: forecourt near-spot is Narromine Railway Station (${JSON.stringify(nearSpot)})`);
      await page.screenshot({ path: `${folder}/${tag}-station-forecourt.png` });
    }
  }

  // 3. Place player on the SW end of Platform 1 and physically walk along Platform 1 past the brick pavilion & heritage signboard
  const platWestYaw = lookAtYaw(-4722.5, -732.0, -4704.0, -720.5);
  await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4722.5, -732.0, platWestYaw]);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${folder}/${tag}-platform-west.png` });

  const platformWaypoints = [
    [-4703.2, -723.5], // Platform 1 spot opposite the projecting brick pavilion
    [-4690.0, -712.0], // NE end of Platform 1 toward the eastern goods office
  ];
  for (let i = 0; i < platformWaypoints.length; i++) {
    const dest = platformWaypoints[i];
    const status = await page.evaluate(([x, z]) => window.__town.walkTo(x, z), dest);
    assert.equal(status, null, `${tag}: walkTo platform waypoint ${i} accepted (${status})`);
    await page.waitForFunction(
      ([x, z]) => {
        const p = window.__town.state().pos;
        return Math.hypot(p.x - x, p.z - z) < 1.1;
      },
      dest,
      { timeout: 25000 }
    );
  }
  const platBackYaw = lookAtYaw(-4684.0, -708.5, -4705.2, -718.5);
  await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4684.0, -708.5, platBackYaw]);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${folder}/${tag}-platform-looking-back.png` });

  if (!mobile) {
    // Also capture a desktop view of the eastern goods office (osm:28) and passing loop
    const goodsYaw = lookAtYaw(-4658.0, -666.0, -4636.2, -657.1);
    await page.evaluate(([x, z, yaw]) => window.__town.place(x, z, yaw), [-4658.0, -666.0, goodsYaw]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${folder}/desktop-goods-office.png` });
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
  console.log('PASS Narromine Railway Station browser verification (desktop 1280x800 + mobile 393x852): live WebGL, physical road & platform walks, forecourt prompt, screenshots, zero page errors.');
} finally {
  await browser.close();
}
