// Automated verification suite for the Narromine Visual QA & Screenshot Comparison System.
// Usage:
//   node tests/narromine-visual-qa/visual-qa.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import {
  LIGHTING_PRESETS,
  NARROMINE_QA_LOCATIONS,
  REPO_TOWN_ROOT,
  VIEWPORTS,
  compassCardinalFromHeading,
  loadLicensedPhotoReferences,
  resolveReferencePhotoForLocation,
  yawToCompassHeading,
  yawTowards,
} from '../../tools/narromine-visual-qa/locations.mjs';
import {
  analyzePngBuffer,
  compareCapturePair,
  compareManifests,
  decodePng,
  encodePng,
  verifyDaylightProgression,
} from '../../tools/narromine-visual-qa/compare.mjs';
import {
  resolveChromiumExecutable,
  runNarromineVisualQa,
} from '../../tools/narromine-visual-qa/run.mjs';
import { compassCardinal, compassHeading } from '../../src/ui/compass.js';
import { DETAILED, PLACES, REGION } from '../../src/world/narromine-layout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function makeSyntheticScenePng({
  width = 160,
  height = 100,
  skyRgb = [135, 185, 235],
  groundRgb = [95, 102, 90],
  buildingRgb = [210, 190, 160],
  roofRgb = [150, 70, 55],
  includeBuilding = true,
} = {}) {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [r, g, b] = y < height * 0.45 ? skyRgb : groundRgb;
      if (includeBuilding && x >= 35 && x <= 125 && y >= 22 && y <= 74) {
        [r, g, b] = y < 34 ? roofRgb : buildingRgb;
        // Window grid for realistic interior edge gradients
        if (y >= 40 && y <= 65 && (x - 42) % 18 < 8) {
          [r, g, b] = [45, 65, 80];
        }
      }
      const idx = (y * width + x) * 4;
      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = 255;
    }
  }
  return encodePng({ width, height, rgba });
}

console.log('1. Verifying deterministic camera specification and Narromine world coordinates...');
{
  assert.equal(NARROMINE_QA_LOCATIONS.length, 6, 'must define all 6 required Narromine QA locations');
  const expectedIds = [
    'royal-hotel-dandaloo',
    'narromine-hotel-corner',
    'post-office-entrance',
    'coles-kieraths-dandaloo',
    'kieraths-arcade-courtyard',
    'ordinary-narromine-street',
  ];
  assert.deepEqual(
    NARROMINE_QA_LOCATIONS.map((l) => l.id),
    expectedIds,
    'location IDs must match the 6 required Narromine locations in order'
  );

  for (const loc of NARROMINE_QA_LOCATIONS) {
    assert(
      loc.camera.x >= REGION.x0 && loc.camera.x <= REGION.x1,
      `${loc.id}: camera.x ${loc.camera.x} must lie inside Narromine REGION`
    );
    assert(
      loc.camera.z >= REGION.z0 && loc.camera.z <= REGION.z1,
      `${loc.id}: camera.z ${loc.camera.z} must lie inside Narromine REGION`
    );
    const recomputedYaw = yawTowards(loc.camera.x, loc.camera.z, loc.target.x, loc.target.z);
    assert.equal(loc.camera.yawRad, recomputedYaw, `${loc.id}: yawRad must be deterministic`);

    // Verify compass math matches src/ui/compass.js
    const fx = -Math.sin(loc.camera.yawRad);
    const fz = -Math.cos(loc.camera.yawRad);
    const gameHeading = Number(compassHeading(fx, fz).toFixed(2));
    assert.equal(
      yawToCompassHeading(loc.camera.yawRad),
      gameHeading,
      `${loc.id}: compass heading must match src/ui/compass.js`
    );
    assert.equal(
      compassCardinalFromHeading(gameHeading),
      compassCardinal(gameHeading),
      `${loc.id}: compass cardinal must match src/ui/compass.js`
    );

    if (loc.detailedId) {
      assert(
        DETAILED.some((d) => d.id === loc.detailedId),
        `${loc.id}: detailedId ${loc.detailedId} must exist in NARROMINE_LAYOUT.DETAILED`
      );
    }
    if (loc.placeName) {
      assert(
        PLACES.some((p) => p.name === loc.placeName),
        `${loc.id}: placeName ${loc.placeName} must exist in NARROMINE_LAYOUT.PLACES`
      );
    }
  }

  assert.deepEqual(Object.keys(VIEWPORTS), ['desktop', 'mobile']);
  assert.equal(VIEWPORTS.desktop.isMobile, false);
  assert.equal(VIEWPORTS.mobile.isMobile, true);
  assert.deepEqual(Object.keys(LIGHTING_PRESETS), ['morning', 'midday', 'late-afternoon']);

  // Reference photo policy: never fabricate reference photos
  const refs = loadLicensedPhotoReferences(REPO_TOWN_ROOT);
  for (const loc of NARROMINE_QA_LOCATIONS) {
    const resolved = resolveReferencePhotoForLocation(loc, { records: [] });
    assert.equal(resolved, null, 'must leave referencePhoto null when no licensed photo exists');
  }
  assert(Array.isArray(refs.records), 'licensed photo catalogue loads cleanly');
}

console.log('2. Verifying PNG codec, blank-geometry detector, and regression vs lighting/weather classifier...');
{
  const middayPng = makeSyntheticScenePng();
  const decoded = decodePng(middayPng);
  assert.equal(decoded.width, 160);
  assert.equal(decoded.height, 100);

  const stats = analyzePngBuffer(middayPng);
  assert.equal(stats.isBlankOrFlat, false, 'structured building scene must not be flagged blank');

  const flatPng = makeSyntheticScenePng({
    skyRgb: [120, 120, 120],
    groundRgb: [120, 120, 120],
    includeBuilding: false,
  });
  const flatStats = analyzePngBuffer(flatPng);
  assert.equal(flatStats.isBlankOrFlat, true, 'uniform blank canvas must be flagged as blank/flat');

  const baseCapture = {
    id: 'royal-hotel-dandaloo__desktop__midday',
    locationId: 'royal-hotel-dandaloo',
    viewport: 'desktop',
    lighting: 'midday',
    minute: 750,
    timeLabel: '12:30',
    weather: 'clear',
    camera: { x: -4825.5, z: -545.0, yawRad: -1.429626 },
    metrics: { triangles: 25000, drawCalls: 40 },
    diagnostics: { missingGeometry: false, browserErrors: [] },
  };

  // Identical comparison
  const cmpIdentical = compareCapturePair({
    baselineCapture: baseCapture,
    candidateCapture: baseCapture,
    baselineBuffer: middayPng,
    candidateBuffer: middayPng,
  });
  assert.equal(cmpIdentical.classification, 'identical');
  assert.equal(cmpIdentical.isRegression, false);

  // Expected time/lighting difference (same building silhouette, warmer late-afternoon illumination)
  const afternoonPng = makeSyntheticScenePng({
    skyRgb: [175, 155, 135],
    groundRgb: [110, 95, 78],
    buildingRgb: [230, 175, 135],
    roofRgb: [168, 65, 48],
    includeBuilding: true,
  });
  const cmpLighting = compareCapturePair({
    baselineCapture: baseCapture,
    candidateCapture: { ...baseCapture, lighting: 'late-afternoon', minute: 1005, timeLabel: '16:45' },
    baselineBuffer: middayPng,
    candidateBuffer: afternoonPng,
  });
  assert.equal(
    cmpLighting.classification,
    'expected-time-or-lighting-difference',
    'time/lighting change with intact building edges must be classified as expected-time-or-lighting-difference'
  );
  assert.equal(cmpLighting.isRegression, false);

  // Expected weather difference (overcast sky/ground tint, intact building structure)
  const overcastPng = makeSyntheticScenePng({
    skyRgb: [150, 158, 165],
    groundRgb: [88, 92, 86],
    buildingRgb: [190, 178, 155],
    roofRgb: [135, 68, 55],
    includeBuilding: true,
  });
  const cmpWeather = compareCapturePair({
    baselineCapture: baseCapture,
    candidateCapture: { ...baseCapture, weather: 'overcast' },
    baselineBuffer: middayPng,
    candidateBuffer: overcastPng,
  });
  assert.equal(
    cmpWeather.classification,
    'expected-weather-difference',
    'weather change with intact building edges must be classified as expected-weather-difference'
  );
  assert.equal(cmpWeather.isRegression, false);

  // Genuine rendering regression (building disappears at same camera, time, and weather)
  const missingBuildingPng = makeSyntheticScenePng({ includeBuilding: false });
  const cmpRegression = compareCapturePair({
    baselineCapture: baseCapture,
    candidateCapture: baseCapture,
    baselineBuffer: middayPng,
    candidateBuffer: missingBuildingPng,
  });
  assert.equal(
    cmpRegression.classification,
    'rendering-regression',
    'missing building silhouette at identical time/weather/pose must be flagged as rendering-regression'
  );
  assert.equal(cmpRegression.isRegression, true);
}

console.log('3. Verifying full Fedora Playwright/WebGL visual QA run (6 locations × 2 viewports × 3 lighting times = 36 captures)...');
{
  const outDir = path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-visual-qa');
  const manifestPath = path.join(outDir, 'manifest.json');

  // Run full capture if manifest.json does not already exist from current run, or validate existing + run baseline comparison
  let manifest;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  if (!manifest || manifest.captures?.length !== 36) {
    const runRes = await runNarromineVisualQa({ outDir });
    manifest = runRes.manifest;
  }

  assert.equal(manifest.summary.totalLocations, 6, 'manifest must cover all 6 locations');
  assert.equal(manifest.summary.totalViewports, 2, 'manifest must cover desktop and mobile');
  assert.equal(manifest.summary.totalLightingPresets, 3, 'manifest must cover morning, midday, late-afternoon');
  assert.equal(manifest.summary.totalCaptures, 36, 'manifest must contain all 36 captures');
  assert.equal(manifest.summary.passedCaptures, 36, 'all 36 captures must pass diagnostics');
  assert.equal(manifest.summary.failedCaptures, 0, 'zero failed captures');
  assert.equal(manifest.summary.daylightChecksTotal, 12, '12 daylight progression checks (6 locations × 2 viewports)');
  assert.equal(manifest.summary.daylightChecksPassed, 12, 'all 12 daylight progression checks must show visible daylight differences');
  assert.equal(manifest.reproducibilityCheck.passed, true, 'deterministic camera reproducibility check must pass');
  assert(manifest.reproducibilityCheck.poseDelta < 1e-4, 'camera pose delta on re-capture must be < 1e-4');

  // Verify separate desktop & mobile performance measurements
  const pd = manifest.performance.desktop;
  const pm = manifest.performance.mobile;
  assert.equal(pd.captureCount, 18, '18 desktop captures');
  assert.equal(pm.captureCount, 18, '18 mobile captures');
  assert.equal(pd.dimensions, '1280×800');
  assert.equal(pm.dimensions, '393×852');
  assert(pd.meanFps > 0 && pd.frameTimeMs.p50 > 0 && pd.frameTimeMs.p95 > 0, 'desktop FPS and frame-time distribution recorded');
  assert(pm.meanFps > 0 && pm.frameTimeMs.p50 > 0 && pm.frameTimeMs.p95 > 0, 'mobile FPS and frame-time distribution recorded');
  assert(pd.meanDrawCalls >= 5 && pd.meanTriangles > 1500, 'desktop WebGL draw calls and triangle counts recorded');
  assert(pm.meanDrawCalls >= 5 && pm.meanTriangles > 1500, 'mobile WebGL draw calls and triangle counts recorded');
  assert.equal(pd.browserErrorCount, 0, 'zero desktop browser errors');
  assert.equal(pm.browserErrorCount, 0, 'zero mobile browser errors');

  // Verify every capture file exists on disk with exact dimensions
  for (const cap of manifest.captures) {
    const absImg = path.join(outDir, cap.image.relativePath);
    assert(fs.existsSync(absImg), `missing screenshot file: ${absImg}`);
    const decoded = decodePng(fs.readFileSync(absImg));
    const expectedW = cap.viewport === 'desktop' ? 1280 : 393;
    const expectedH = cap.viewport === 'desktop' ? 800 : 852;
    assert.equal(decoded.width, expectedW, `${cap.id}: width must be ${expectedW}`);
    assert.equal(decoded.height, expectedH, `${cap.id}: height must be ${expectedH}`);
    assert.equal(cap.diagnostics.narromineVisible, true, `${cap.id}: Narromine must be visible`);
    assert.equal(cap.camera.colliderClear, true, `${cap.id}: camera must not clip static collider`);
    assert.equal(cap.diagnostics.missingGeometry, false, `${cap.id}: must not have missing geometry`);
    assert.equal(cap.referencePhoto, null, `${cap.id}: unverified reference photo must remain null`);
  }

  // Verify contact-sheet.png and report.html exist and open cleanly in Playwright
  const contactSheetPath = path.join(outDir, manifest.contactSheet);
  const reportHtmlPath = path.join(outDir, manifest.reportHtml);
  assert(fs.existsSync(contactSheetPath), 'contact-sheet.png must exist');
  assert(fs.existsSync(reportHtmlPath), 'report.html must exist');
  const contactDecoded = decodePng(fs.readFileSync(contactSheetPath));
  assert(contactDecoded.width >= 1800 && contactDecoded.height >= 1000, 'contact-sheet.png must be full high-res grid');

  // Test baseline comparison against self (identical) in a temporary directory
  const tmpBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'narromine-vqa-base-'));
  try {
    fs.cpSync(outDir, tmpBaseDir, { recursive: true });
    const selfComparison = compareManifests({
      baselinePath: tmpBaseDir,
      candidateManifest: manifest,
      candidateDir: outDir,
      writeDiffs: true,
    });
    assert.equal(selfComparison.totalCompared, 36);
    assert.equal(selfComparison.regressionCount, 0);
    assert.equal(selfComparison.passed, true);
  } finally {
    fs.rmSync(tmpBaseDir, { recursive: true, force: true });
  }

  // Open report.html in Chromium and verify it renders all 6 location cards without error
  const executablePath = resolveChromiumExecutable();
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const page = await browser.newPage();
    const reportErrors = [];
    page.on('pageerror', (e) => reportErrors.push(String(e?.message || e)));
    await page.goto(`file://${reportHtmlPath}`, { waitUntil: 'load' });
    const cardCount = await page.locator('.location-card').count();
    const imgCount = await page.locator('.capture-card img').count();
    assert.equal(cardCount, 6, 'report.html must render 6 location review sections');
    assert.equal(imgCount, 36, 'report.html must render all 36 capture cards');
    assert.deepEqual(reportErrors, [], 'report.html must open with zero browser page errors');
  } finally {
    await browser.close();
  }
}

console.log('4. Verifying strict file ownership boundaries and git cleanliness...');
{
  const forbiddenPaths = [
    'repository-town/src/world/narromine.js',
    'repository-town/src/world/narromine-buildings-data.js',
    'repository-town/src/world/narromine-kieraths.js',
    'repository-town/src/world/narromine-layout.js',
    'repository-town/src/main.js',
    'repository-town/package.json',
    'repository-town/data/narromine-building-inventory.json',
    'repository-town/data/narromine-photo-references.json',
  ];
  const gitRoot = path.resolve(REPO_TOWN_ROOT, '..');
  const diffMain = execFileSync('git', ['diff', '--name-only', 'origin/main'], {
    cwd: gitRoot,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);
  const statusLines = execFileSync('git', ['status', '--porcelain'], {
    cwd: gitRoot,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  for (const forbidden of forbiddenPaths) {
    assert(
      !diffMain.includes(forbidden),
      `Forbidden file modified relative to origin/main: ${forbidden}`
    );
    assert(
      !statusLines.some((l) => l.includes(forbidden)),
      `Forbidden file dirty in working tree: ${forbidden}`
    );
  }
  assert(
    !statusLines.some((l) => l.includes('test-results/')),
    'Generated screenshots and reports in test-results/ must remain ignored by Git'
  );
}

console.log('PASS Narromine Visual QA & Screenshot Comparison System test suite (all assertions verified)');
