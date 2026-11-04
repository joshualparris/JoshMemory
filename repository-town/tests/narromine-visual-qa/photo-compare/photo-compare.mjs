// Automated unit and Playwright browser test suite for the Narromine Real-World
// Photo Matching, Coordinate-Synced Street View Workspace, API Cost Ledger, and
// Architectural Discrepancy Register.
// Usage:
//   node tests/narromine-visual-qa/photo-compare/photo-compare.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

import {
  NARROMINE_PHOTO_LOCATIONS,
  REPO_TOWN_ROOT,
  STREET_VIEW_API_PRICING,
  buildGoogleMapsStreetViewUrl,
  compassHeadingToYaw,
  createApiCostLedger,
  fovToStreetViewZoom,
  geoToWorldCoords,
  streetViewZoomToFov,
  syncPoseFromGameToReal,
  syncPoseFromRealToGame,
  worldToGeoCoords,
  yawToCompassHeading,
} from '../../../tools/narromine-visual-qa/photo-compare/geo-sync.mjs';
import { auditPhotoProvenance } from '../../../tools/narromine-visual-qa/photo-compare/photo-provenance.mjs';
import {
  ARCHITECTURAL_DISCREPANCIES,
  DISCREPANCY_CLASSIFICATIONS,
  buildPrioritisedFidelityBacklog,
} from '../../../tools/narromine-visual-qa/photo-compare/discrepancy-register.mjs';
import { runNarrominePhotoCompare } from '../../../tools/narromine-visual-qa/photo-compare/run-photo-compare.mjs';
import { startPhotoCompareServer } from '../../../tools/narromine-visual-qa/photo-compare/server.mjs';
import { resolveChromiumExecutable } from '../../../tools/narromine-visual-qa/run.mjs';
import { REGION, geoToWorld } from '../../../src/world/narromine-layout.js';

let passed = 0;
function ok(name, cond, msg) {
  assert(cond, msg || name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('═══ Narromine Photo-Matching & Coordinate-Synced Street View Suite ═══');

// 1. Exact bidirectional coordinate math
{
  const testPts = [
    [-32.235436, 148.238908], // Royal Hotel Wikimedia Commons GPS
    [-32.232833, 148.239319], // Dandaloo St Wikimedia Commons GPS
    [-32.236704, 148.239179], // Narromine Hotel corner
  ];
  for (const [lat, lon] of testPts) {
    const [layoutX, layoutZ] = geoToWorld(lat, lon);
    const { x, z } = geoToWorldCoords(lat, lon);
    assert(
      Math.abs(x - layoutX) < 0.01 && Math.abs(z - layoutZ) < 0.01,
      `geoToWorldCoords(${lat}, ${lon}) must match narromine-layout.js geoToWorld`
    );
    const back = worldToGeoCoords(x, z);
    assert(
      Math.abs(back.lat - lat) < 1e-5 && Math.abs(back.lon - lon) < 1e-5,
      `worldToGeoCoords must invert geoToWorldCoords accurately`
    );
  }
  ok(
    'Bidirectional WGS84 (lat, lon) <-> Repository Town (x, z) matches narromine-layout.js geoToWorld',
    true
  );

  for (const h of [0, 45, 90, 149.0, 180, 270, 310.7, 359.5]) {
    const yaw = compassHeadingToYaw(h);
    const roundTrip = yawToCompassHeading(yaw);
    assert(Math.abs(roundTrip - h) < 0.05, `heading ${h} -> yaw ${yaw} -> ${roundTrip}`);
  }
  ok('Bidirectional compass heading (0..360°) <-> game yaw (radians) round-trips accurately', true);

  const zoom72 = fovToStreetViewZoom(72);
  const fovBack = streetViewZoomToFov(zoom72);
  assert(Math.abs(fovBack - 72) < 0.2, `FOV 72 -> zoom ${zoom72} -> ${fovBack}`);
  ok('Street View zoom <-> camera FOV conversion round-trips accurately', true);

  const gPose = syncPoseFromRealToGame({
    lat: -32.235436,
    lon: 148.238908,
    headingDeg: 118.5,
    pitchDeg: 3.5,
    fovDeg: 75,
    eyeHeightM: 2.45,
  });
  const rPose = syncPoseFromGameToReal(gPose);
  assert(Math.abs(rPose.lat - -32.235436) < 1e-5);
  assert(Math.abs(rPose.headingDeg - 118.5) < 0.05);
  assert(Math.abs(rPose.pitchDeg - 3.5) < 0.05);
  const gmapsUrl = buildGoogleMapsStreetViewUrl(rPose);
  assert(
    gmapsUrl.includes('map_action=pano') &&
      gmapsUrl.includes('-32.23543') &&
      gmapsUrl.includes('148.23890')
  );
  ok('syncPoseFromRealToGame <-> syncPoseFromGameToReal and external Google Maps URL builder work', true);
}

// 2. Verify all 8 priority Narromine locations & palm-tree clearance
{
  assert.equal(NARROMINE_PHOTO_LOCATIONS.length, 8, 'must define all 8 priority locations');
  for (const loc of NARROMINE_PHOTO_LOCATIONS) {
    assert(
      loc.camera.x >= REGION.x0 && loc.camera.x <= REGION.x1,
      `${loc.id} camera.x inside REGION`
    );
    assert(
      loc.camera.z >= REGION.z0 && loc.camera.z <= REGION.z1,
      `${loc.id} camera.z inside REGION`
    );
    assert(Number.isFinite(loc.camera.lat) && Number.isFinite(loc.camera.lon));
  }
  const kieraths = NARROMINE_PHOTO_LOCATIONS.find((l) => l.id === 'kieraths-street-frontage');
  // The median palm tree is at x = -4770.7; camera must sit west of it (x < -4773) looking west
  assert(
    kieraths.camera.x < -4773.0,
    `Kierath's frontage camera (${kieraths.camera.x}) must sit west of the median palm tree (-4770.7)`
  );
  ok(
    "All 8 priority Narromine locations have synced WGS84 + world poses and clear the Kierath's median palm tree",
    true
  );
}

// 3. Verify Per-Call Google Maps Street View API Cost Ledger & Budget Guard
{
  const ledger = createApiCostLedger({ budgetCapUsd: 0.03 });
  const c1 = ledger.recordCall('maps_js_script_load', {
    lat: -32.235436,
    lon: 148.238908,
    reason: 'bootstrap',
  });
  assert.equal(c1.blockedByBudget, false);
  assert.equal(c1.billedUsd, 0);
  assert.equal(c1.conservativeUsd, 0);

  const c2 = ledger.recordCall('streetview_panorama_instantiate', {
    lat: -32.235436,
    lon: 148.238908,
    reason: 'init',
  });
  assert.equal(c2.blockedByBudget, false);
  assert.equal(c2.billedUsd, 0.014);
  assert.equal(c2.conservativeUsd, 0.014);
  assert(c2.bannerMessage.includes('GOOGLE API CALL #2'));
  assert(c2.bannerMessage.includes('$0.0140 USD'));

  const c3 = ledger.recordCall('streetview_set_position', {
    lat: -32.236704,
    lon: 148.239179,
    reason: 'move',
  });
  assert.equal(c3.blockedByBudget, false);
  assert.equal(c3.cumulativeBilledUsd, 0.014);
  assert.equal(c3.cumulativeConservativeUsd, 0.028);

  // Next 0.014 call would push worst-case to 0.042 > 0.030 cap -> must block!
  const c4 = ledger.recordCall('streetview_set_position', {
    lat: -32.233635,
    lon: 148.239305,
    reason: 'over-cap',
  });
  assert.equal(c4.blockedByBudget, true);
  assert(c4.message.includes('BLOCKED BY BUDGET GUARD'));
  ok(
    'Street View API Cost Ledger logs exact USD/AUD SKU and worst-case costs per call and enforces budget cap',
    true
  );
}

// 4. Verify Photograph Provenance Audit on Fedora
{
  const prov = auditPhotoProvenance(REPO_TOWN_ROOT);
  assert.equal(prov.summary.verifiedLocalFiles, 3, '3 NSW Spatial Services CC BY 4.0 aerials exist locally');
  assert.equal(prov.summary.verifiedExternalCommonsUrls, 2, '2 Wikimedia Commons CC BY 3.0 URLs exist');
  assert.equal(
    prov.summary.missingFromFedoraFilesystem,
    4,
    '4 remote Claude/ChatGPT session Street View frames (including 102255.014.jpg & 102253.251.jpg) are recorded as missing'
  );
  const f102255 = prov.records.find((r) => r.originalFilename === '102255.014.jpg');
  assert.equal(f102255.availabilityStatus, 'missing-from-fedora-filesystem');
  assert.equal(f102255.localExists, false);
  ok(
    'Photograph Provenance Audit verifies local CC BY 4.0 orthophotos and honestly marks 102255.014.jpg / 102253.251.jpg as missing from Fedora disk',
    true
  );
}

// 5. Verify Architectural Discrepancy Register & Priority Ranking
{
  const backlog = buildPrioritisedFidelityBacklog();
  assert(backlog.discrepancies.length >= 10, 'must include comprehensive discrepancy register');
  for (const d of backlog.discrepancies) {
    assert(
      DISCREPANCY_CLASSIFICATIONS.includes(d.classification),
      `invalid classification ${d.classification}`
    );
    assert(d.buildingId && d.locationId && d.observedDiscrepancy && d.suggestedCorrection);
  }
  assert.equal(
    backlog.highestPriorityBuilding.buildingId,
    'NR-SITE-royal-hotel',
    'Royal Hotel (123 Dandaloo Street) is identified as the highest-priority building'
  );
  ok(
    'Architectural Discrepancy Register categorises findings and identifies Royal Hotel (NR-SITE-royal-hotel) as #1 priority',
    true
  );
}

// 6. Full Playwright End-to-End Verification (HUD-clean capture + Interactive Workspace UI on Desktop & Mobile)
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'narromine-photo-compare-test-'));
let serverHandle = null;
let browser = null;

try {
  console.log('  … running HUD-clean Playwright capture smoke test (2 locations × desktop/mobile × midday)...');
  const runRes = await runNarrominePhotoCompare({
    outDir: tmpDir,
    locations: 'royal-hotel-dandaloo,kieraths-street-frontage',
    viewports: 'desktop,mobile',
    times: 'midday',
    sampleFrames: 6,
  });

  ok(
    'HUD-clean photo-compare capture completed with 4/4 valid captures and 0 errors',
    runRes.manifest.summary.passedCaptures === 4 && runRes.manifest.summary.failedCaptures === 0
  );
  ok(
    'All captured frames record hudHidden=true and synced WGS84 lat/lon',
    runRes.manifest.captures.every(
      (c) => c.camera.hudHidden === true && Number.isFinite(c.camera.lat) && Number.isFinite(c.camera.lon)
    )
  );

  serverHandle = await startPhotoCompareServer({
    port: 0,
    reportDir: tmpDir,
  });

  const executablePath = resolveChromiumExecutable();
  browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  // Exercise Workspace UI on Desktop (1280x800) and Mobile (393x852)
  for (const vp of [
    { name: 'desktop', width: 1280, height: 800, isMobile: false },
    { name: 'mobile', width: 393, height: 852, isMobile: true },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    // Provide a deterministic mock google.maps.StreetViewPanorama before page load so we can
    // test the live API call & cost banner without making external paid requests in CI.
    await page.addInitScript(() => {
      window.google = {
        maps: {
          StreetViewPanorama: class MockStreetViewPanorama {
            constructor(container, opts) {
              this.pos = opts.position;
              this.pov = opts.pov;
              this.zoom = opts.zoom;
              this.listeners = {};
              container.innerHTML = '<div id="mock-sv-canvas" style="color:#38bdf8;padding:20px;">Mock Official Street View Panorama Active</div>';
            }
            addListener(evt, fn) {
              this.listeners[evt] = fn;
            }
            getPosition() {
              return { lat: () => this.pos.lat, lng: () => this.pos.lng };
            }
            getPov() {
              return this.pov;
            }
            setPosition(p) {
              this.pos = p;
            }
            setPov(pov) {
              this.pov = pov;
            }
            setZoom(z) {
              this.zoom = z;
            }
          },
        },
      };
    });

    await page.goto(serverHandle.url, { waitUntil: 'domcontentloaded' });

    // Verify initial $0.00 cost banner
    const initCalls = await page.locator('#cost-total-calls').textContent();
    assert.equal(initCalls, '0', `${vp.name}: initial API calls must be 0`);

    // Verify local reference photo is displayed on Location 1 (Royal Hotel)
    const leftImgVis = await page.locator('#left-ref-img').isVisible();
    assert.equal(leftImgVis, true, `${vp.name}: Royal Hotel local CC BY 4.0 orthophoto must be visible`);

    // Switch to Location 5 (Kierath's Street Frontage — no local street photo on disk) and verify clear missing status
    await page.locator('.loc-tab').nth(4).click();
    const missingVis = await page.locator('#left-missing-notice').isVisible();
    assert.equal(missingVis, true, `${vp.name}: missing local photo must show clear status notice, not fabricated comparison`);

    // Adjust camera heading slider and verify coordinates update reproducibly
    await page.locator('#slider-cam-heading').fill('255');
    await page.locator('#slider-cam-heading').dispatchEvent('input');
    const headingText = await page.locator('#lbl-cam-heading').textContent();
    assert(headingText.includes('255.0°'), `${vp.name}: camera heading control updates label`);

    // Switch to Overlay mode and Structural Edge Difference mode
    await page.locator('button[data-viewmode="overlay"]').click();
    assert.equal(await page.locator('#stage-overlay').isVisible(), true);
    await page.locator('button[data-viewmode="difference"]').click();
    assert.equal(await page.locator('#stage-difference').isVisible(), true);
    await page.locator('button[data-viewmode="side-by-side"]').click();

    // Test Google Street View API connection & per-call cost banner
    await page.locator('#input-gmaps-key').fill('MOCK-ONLY-NO-REAL-API-CREDENTIAL');
    await page.locator('#btn-manual-sync-sv').click();

    const afterCalls = await page.locator('#cost-total-calls').textContent();
    const billedUsd = await page.locator('#cost-billed-usd').textContent();
    const bannerText = await page.locator('#api-call-banner-text').textContent();
    assert.equal(afterCalls, '1', `${vp.name}: API call count must increment to 1`);
    assert.equal(billedUsd, '$0.0140 USD', `${vp.name}: billed USD must show $0.0140 USD`);
    assert(
      bannerText.includes('GOOGLE API CALL #1 MADE') && bannerText.includes('$0.0140 USD'),
      `${vp.name}: live banner must clearly announce API call #1 and its exact cost`
    );

    // Record a new architectural discrepancy annotation interactively
    await page.locator('details summary').click();
    await page.locator('#disc-observed').fill('Test discrepancy annotation from Playwright');
    await page.locator('#disc-correction').fill('Test correction spec');
    await page.locator('#form-add-discrepancy button[type="submit"]').click();
    const firstRowText = await page.locator('#discrepancy-tbody tr').first().textContent();
    assert(firstRowText.includes('Test discrepancy annotation from Playwright'));

    assert.equal(pageErrors.length, 0, `${vp.name}: zero browser page errors`);
    ok(`Interactive Workspace verified in Chromium (${vp.name} ${vp.width}×${vp.height}): side-by-side, overlay, edge-diff, missing-photo notice, API cost banner, and discrepancy annotation work`, true);
    await ctx.close();
  }
} finally {
  if (browser) await browser.close();
  if (serverHandle) await serverHandle.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, 0 failed`);
