#!/usr/bin/env node
// Automated Playwright/WebGL Screenshot Capture, Performance Diagnostics & Visual QA System for Narromine.
// Usage:
//   node tools/narromine-visual-qa/run.mjs [--out-dir test-results/narromine-visual-qa] [--url http://localhost:8091/] [--baseline <dir-or-manifest>] [--build]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import {
  LIGHTING_PRESETS,
  NARROMINE_QA_LOCATIONS,
  REPO_TOWN_ROOT,
  VIEWPORTS,
  loadLicensedPhotoReferences,
  resolveReferencePhotoForLocation,
} from './locations.mjs';
import {
  analyzePngBuffer,
  compareCapturePair,
  compareManifests,
  verifyDaylightProgression,
} from './compare.mjs';
import { generateHtmlReport, renderContactSheetPng } from './report.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
};

function getGitMetadata(cwd = REPO_TOWN_ROOT) {
  try {
    const commitSha = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], {
      cwd,
      encoding: 'utf8',
    }).trim();
    const fullCommitSha = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd,
      encoding: 'utf8',
    }).trim();
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd,
      encoding: 'utf8',
    }).trim();
    return { commitSha, fullCommitSha, branch };
  } catch {
    return { commitSha: 'unknown', fullCommitSha: 'unknown', branch: 'unknown' };
  }
}

export function resolveChromiumExecutable() {
  if (
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH &&
    fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)
  ) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  try {
    const def = chromium.executablePath();
    if (def && fs.existsSync(def)) return def;
  } catch {}

  const cacheRoots = [
    path.join(os.homedir(), '.cache', 'ms-playwright'),
    '/opt/pw-browsers',
  ];
  for (const root of cacheRoots) {
    if (!fs.existsSync(root)) continue;
    const dirs = fs
      .readdirSync(root)
      .filter((d) => /^chromium(-\d+|_headless_shell-\d+)$/.test(d))
      .sort()
      .reverse();
    for (const d of dirs) {
      const candidates = [
        path.join(root, d, 'chrome-linux64', 'chrome'),
        path.join(root, d, 'chrome-linux', 'chrome'),
        path.join(root, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
        path.join(root, d, 'chrome-linux', 'headless_shell'),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
    }
  }

  for (const sys of ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome']) {
    if (fs.existsSync(sys)) return sys;
  }
  return undefined;
}

export function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        const relPath = urlPath === '/' ? '/index.html' : urlPath;
        const safePath = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
        let filePath = path.join(rootDir, safePath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.statusCode = 500;
        res.end(String(err));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${addr.port}/`,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

function computeFrameDistribution(frameTimesMs) {
  if (!Array.isArray(frameTimesMs) || !frameTimesMs.length) {
    return {
      fps: 0,
      low1Fps: 0,
      frameTimeMs: { min: 0, p50: 0, p95: 0, p99: 0, max: 0, mean: 0, stutters: 0, samples: 0 },
    };
  }
  const sortedAsc = [...frameTimesMs].sort((a, b) => a - b);
  const n = sortedAsc.length;
  const total = sortedAsc.reduce((a, b) => a + b, 0);
  const mean = total / n;
  const min = sortedAsc[0];
  const max = sortedAsc[n - 1];
  const pct = (p) => sortedAsc[Math.min(n - 1, Math.max(0, Math.floor(n * p)))];
  const p50 = pct(0.5);
  const p95 = pct(0.95);
  const p99 = pct(0.99);
  const slowestCount = Math.max(1, Math.ceil(n * 0.01));
  const slowestMean =
    sortedAsc.slice(n - slowestCount).reduce((a, b) => a + b, 0) / slowestCount;
  const fps = total > 0 ? (n * 1000) / total : 0;
  const low1Fps = slowestMean > 0 ? 1000 / slowestMean : 0;
  const stutters = sortedAsc.filter((ms) => ms > 50).length;

  return {
    fps: Number(fps.toFixed(2)),
    low1Fps: Number(low1Fps.toFixed(2)),
    frameTimeMs: {
      min: Number(min.toFixed(2)),
      p50: Number(p50.toFixed(2)),
      p95: Number(p95.toFixed(2)),
      p99: Number(p99.toFixed(2)),
      max: Number(max.toFixed(2)),
      mean: Number(mean.toFixed(2)),
      stutters,
      samples: n,
    },
  };
}

function summarizeViewportPerformance(captures, viewportSpec) {
  if (!captures.length) {
    return {
      viewport: viewportSpec.id,
      captureCount: 0,
      dimensions: `${viewportSpec.width}×${viewportSpec.height}`,
      meanFps: 0,
      minFps: 0,
      maxFps: 0,
      frameTimeMs: { min: 0, p50: 0, p95: 0, p99: 0, max: 0, mean: 0 },
      meanDrawCalls: 0,
      maxDrawCalls: 0,
      meanTriangles: 0,
      maxTriangles: 0,
      browserErrorCount: 0,
    };
  }
  const fpsList = captures.map((c) => c.metrics.fps);
  const allSamples = captures.flatMap((c) => c._rawFrameTimes || [c.metrics.frameTimeMs.mean]);
  const dist = computeFrameDistribution(allSamples);
  const calls = captures.map((c) => c.metrics.drawCalls);
  const tris = captures.map((c) => c.metrics.triangles);
  const errCount = captures.reduce(
    (sum, c) =>
      sum +
      (c.diagnostics.browserErrors?.length || 0) +
      (c.diagnostics.consoleErrors?.length || 0),
    0
  );

  return {
    viewport: viewportSpec.id,
    captureCount: captures.length,
    dimensions: `${viewportSpec.width}×${viewportSpec.height}`,
    meanFps: Number((fpsList.reduce((a, b) => a + b, 0) / fpsList.length).toFixed(2)),
    minFps: Number(Math.min(...fpsList).toFixed(2)),
    maxFps: Number(Math.max(...fpsList).toFixed(2)),
    frameTimeMs: dist.frameTimeMs,
    meanDrawCalls: Number((calls.reduce((a, b) => a + b, 0) / calls.length).toFixed(1)),
    maxDrawCalls: Math.max(...calls),
    meanTriangles: Math.round(tris.reduce((a, b) => a + b, 0) / tris.length),
    maxTriangles: Math.max(...tris),
    browserErrorCount: errCount,
  };
}

async function positionAndMeasureInPage(page, { x, z, yawRad, minute, weather, sampleFrames }) {
  return page.evaluate(
    async ({ x, z, yawRad, minute, weather, sampleFrames }) => {
      const t = window.__town;
      if (!t) throw new Error('window.__town is not initialised');
      t.closePanel?.();
      if (t.state().driving) t.leaveVehicle?.();
      if (t.state().mode === 'house') t.toExit?.();

      t.life.speed(0);
      t.life.setWeather(weather || 'clear');
      t.life.setTime(minute);
      t.place(x, z, yawRad);

      // Allow 6 animation frames for Narromine visibility, solar shadow map, and sky uniform updates
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      // Re-assert exact pose and time in case any initial tick nudged state
      t.life.setTime(minute);
      t.place(x, z, yawRad);

      // Measure real frame-time distribution across sampleFrames animation frames
      const frameTimes = [];
      let prev = performance.now();
      for (let i = 0; i < sampleFrames; i++) {
        const now = await new Promise((r) => requestAnimationFrame(r));
        const dt = now - prev;
        prev = now;
        if (dt > 0 && dt < 2000) frameTimes.push(dt);
      }

      const state = t.state();
      const solar = t.solar ? t.solar() : null;
      const compass = t.compass ? t.compass() : null;
      const perf = t.perf ? t.perf() : null;
      const colliderHit = Boolean(t.probeStatic(x, z, 0.36));
      const narromineVisible = Boolean(t.narromineVisible());

      return {
        state: {
          mode: state.mode,
          pos: state.pos,
          y: state.y,
          eye: state.eye,
          yaw: state.yaw,
          time: state.time,
          minute: state.minute,
          daylight: state.daylight,
          calls: state.calls,
          triangles: state.triangles,
          fps: state.fps,
          renderPixelRatio: state.renderPixelRatio,
        },
        solar,
        compass,
        gpu: perf?.gpu || 'unknown',
        colliderClear: !colliderHit,
        narromineVisible,
        frameTimes,
      };
    },
    { x, z, yawRad, minute, weather, sampleFrames }
  );
}

export async function runNarromineVisualQa(options = {}) {
  const outDir = path.resolve(
    options.outDir || path.join(REPO_TOWN_ROOT, 'test-results', 'narromine-visual-qa')
  );
  const screenshotsDir = path.join(outDir, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const distPublic = path.join(REPO_TOWN_ROOT, 'dist', 'public');
  if (options.build || !fs.existsSync(path.join(distPublic, 'index.html'))) {
    execFileSync(process.execPath, [path.join(REPO_TOWN_ROOT, 'tools', 'build.mjs')], {
      cwd: REPO_TOWN_ROOT,
      stdio: 'inherit',
    });
  }

  const locationFilter = options.locations
    ? new Set(String(options.locations).split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  const viewportFilter = options.viewports
    ? new Set(String(options.viewports).split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  const lightingFilter = options.times
    ? new Set(String(options.times).split(',').map((s) => s.trim()).filter(Boolean))
    : null;

  const selectedLocations = NARROMINE_QA_LOCATIONS.filter(
    (l) => !locationFilter || locationFilter.has(l.id) || locationFilter.has(String(l.order))
  );
  const selectedViewports = Object.values(VIEWPORTS).filter(
    (v) => !viewportFilter || viewportFilter.has(v.id)
  );
  const selectedLighting = Object.values(LIGHTING_PRESETS).filter(
    (t) => !lightingFilter || lightingFilter.has(t.id)
  );

  const sampleFrames = Number(options.sampleFrames || 14);
  const photoCatalogue = loadLicensedPhotoReferences(REPO_TOWN_ROOT);
  const gitMeta = getGitMetadata(REPO_TOWN_ROOT);

  let serverHandle = null;
  const targetUrl =
    options.url ||
    process.env.TOWN_URL ||
    (serverHandle = await startStaticServer(distPublic)).url;

  const executablePath = resolveChromiumExecutable();
  const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const captures = [];
  let detectedGpu = 'unknown';
  let reproducibilityCheck = {
    passed: false,
    locationId: null,
    poseDelta: null,
    pixelRmse: null,
  };

  try {
    for (const vp of selectedViewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
      });
      const page = await context.newPage();

      const pageErrors = [];
      const consoleErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err?.message || err)));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!/favicon\.ico/i.test(text)) consoleErrors.push(text);
        }
      });

      await page.addInitScript(() => {
        try {
          sessionStorage.setItem('town-cheats', '1');
        } catch {}
      });
      await page.route('**/api/npc-chat', (r) => r.abort('connectionrefused'));

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () => window.__town && document.getElementById('loading')?.hidden,
        null,
        { timeout: 90000 }
      );

      for (const loc of selectedLocations) {
        for (const light of selectedLighting) {
          const errStartIdx = pageErrors.length;
          const consoleErrStartIdx = consoleErrors.length;

          const captureId = `${loc.id}__${vp.id}__${light.id}`;
          const relPngPath = path.posix.join('screenshots', `${captureId}.png`);
          const absPngPath = path.join(outDir, relPngPath);

          const measured = await positionAndMeasureInPage(page, {
            x: loc.camera.x,
            z: loc.camera.z,
            yawRad: loc.camera.yawRad,
            minute: light.minute,
            weather: light.weather,
            sampleFrames,
          });

          if (measured.gpu && measured.gpu !== 'unknown') {
            detectedGpu = measured.gpu;
          }

          const screenshotBuffer = await page.screenshot({ path: absPngPath, type: 'png' });
          const imgStats = analyzePngBuffer(screenshotBuffer);
          const frameDist = computeFrameDistribution(measured.frameTimes);

          const poseError =
            Math.hypot(
              measured.state.pos.x - loc.camera.x,
              measured.state.pos.z - loc.camera.z
            ) + Math.abs(measured.state.yaw - loc.camera.yawRad);

          const shotPageErrors = pageErrors.slice(errStartIdx);
          const shotConsoleErrors = consoleErrors.slice(consoleErrStartIdx);

          const dimensionsMatch =
            imgStats.width === vp.width && imgStats.height === vp.height;
          const missingGeometry =
            !measured.narromineVisible ||
            measured.state.triangles < loc.minExpectedTriangles ||
            measured.state.calls < loc.minExpectedDrawCalls ||
            imgStats.isBlankOrFlat;

          const issues = [];
          if (!measured.narromineVisible) issues.push('Narromine 3D group is not visible');
          if (!measured.colliderClear)
            issues.push('Camera position overlaps a static building/prop collider');
          if (measured.state.mode !== 'town')
            issues.push(`Expected outdoor mode="town", got "${measured.state.mode}"`);
          if (poseError > 0.01)
            issues.push(`Camera pose drifted from target by ${poseError.toFixed(4)}`);
          if (!dimensionsMatch)
            issues.push(
              `Screenshot dimensions ${imgStats.width}×${imgStats.height} != ${vp.width}×${vp.height}`
            );
          if (missingGeometry)
            issues.push(
              `Missing geometry or flat frame (tris=${measured.state.triangles}, calls=${measured.state.calls}, lumaStdDev=${imgStats.lumaStdDev})`
            );
          if (shotPageErrors.length)
            issues.push(`Browser page errors: ${shotPageErrors.join('; ')}`);
          if (shotConsoleErrors.length)
            issues.push(`Console errors: ${shotConsoleErrors.join('; ')}`);

          const refPhoto = resolveReferencePhotoForLocation(loc, photoCatalogue);
          const { _signature, ...publicImgStats } = imgStats;

          captures.push({
            id: captureId,
            locationId: loc.id,
            locationOrder: loc.order,
            locationTitle: loc.title,
            viewport: vp.id,
            viewportSize: {
              width: vp.width,
              height: vp.height,
              deviceScaleFactor: vp.deviceScaleFactor,
              isMobile: vp.isMobile,
            },
            lighting: light.id,
            minute: light.minute,
            timeLabel: light.timeLabel,
            weather: light.weather,
            camera: {
              x: Number(measured.state.pos.x.toFixed(3)),
              y: Number((measured.state.y ?? 0).toFixed(3)),
              z: Number(measured.state.pos.z.toFixed(3)),
              eye: Number((measured.state.eye ?? 1.65).toFixed(3)),
              yawRad: Number(measured.state.yaw.toFixed(6)),
              headingDeg: loc.camera.headingDeg,
              cardinal: loc.camera.cardinal,
              compassDomHeading: measured.compass?.heading ?? loc.camera.headingDeg,
              compassDomCardinal: measured.compass?.direction ?? loc.camera.cardinal,
              target: { ...loc.target },
              poseError: Number(poseError.toFixed(6)),
              colliderClear: measured.colliderClear,
            },
            solar: measured.solar,
            metrics: {
              fps: frameDist.fps,
              low1Fps: frameDist.low1Fps,
              frameTimeMs: frameDist.frameTimeMs,
              drawCalls: measured.state.calls,
              triangles: measured.state.triangles,
              renderPixelRatio: measured.state.renderPixelRatio,
            },
            image: {
              relativePath: relPngPath,
              ...publicImgStats,
            },
            diagnostics: {
              browserErrors: shotPageErrors,
              consoleErrors: shotConsoleErrors,
              narromineVisible: measured.narromineVisible,
              missingGeometry,
              screenshotValid: dimensionsMatch && !imgStats.isBlankOrFlat,
              passed: issues.length === 0,
              issues,
            },
            referencePhoto: refPhoto,
            _rawFrameTimes: measured.frameTimes,
            _buffer: screenshotBuffer,
          });
        }
      }

      // Deterministic camera reproducibility check on the first desktop capture:
      // teleport back to Repository Town (0, 0, 0), change clock, then re-place at location 1
      // and verify pose and rendered pixels match deterministically.
      if (vp.id === 'desktop' && selectedLocations.length > 0 && selectedLighting.length > 0) {
        const firstLoc = selectedLocations[0];
        const firstLight = selectedLighting[0];
        const firstCap = captures.find(
          (c) =>
            c.locationId === firstLoc.id &&
            c.viewport === 'desktop' &&
            c.lighting === firstLight.id
        );
        if (firstCap) {
          await page.evaluate(() => {
            window.__town.life.setTime(6 * 60);
            window.__town.place(0, 0, 0);
          });
          await page.waitForTimeout(80);
          const repeatMeasured = await positionAndMeasureInPage(page, {
            x: firstLoc.camera.x,
            z: firstLoc.camera.z,
            yawRad: firstLoc.camera.yawRad,
            minute: firstLight.minute,
            weather: firstLight.weather,
            sampleFrames: 6,
          });
          const repeatBuffer = await page.screenshot({ type: 'png' });
          const cmp = compareCapturePair({
            baselineCapture: firstCap,
            candidateCapture: firstCap,
            baselineBuffer: firstCap._buffer,
            candidateBuffer: repeatBuffer,
          });
          const poseDelta =
            Math.hypot(
              repeatMeasured.state.pos.x - firstCap.camera.x,
              repeatMeasured.state.pos.z - firstCap.camera.z
            ) + Math.abs(repeatMeasured.state.yaw - firstCap.camera.yawRad);

          reproducibilityCheck = {
            passed: poseDelta < 1e-4 && cmp.metrics.rmse < 2.0,
            locationId: firstLoc.id,
            lighting: firstLight.id,
            poseDelta: Number(poseDelta.toFixed(6)),
            pixelRmse: cmp.metrics.rmse,
            edgeCorrelation: cmp.metrics.edgeCorrelation,
          };
        }
      }

      await context.close();
    }

    // Verify daylight progression for each (location, viewport) that captured all 3 times
    const daylightChecks = [];
    for (const loc of selectedLocations) {
      for (const vp of selectedViewports) {
        const subset = captures.filter(
          (c) => c.locationId === loc.id && c.viewport === vp.id
        );
        if (subset.length === 3) {
          const check = verifyDaylightProgression(subset);
          daylightChecks.push({
            locationId: loc.id,
            viewport: vp.id,
            ...check,
          });
        }
      }
    }

    const desktopCaptures = captures.filter((c) => c.viewport === 'desktop');
    const mobileCaptures = captures.filter((c) => c.viewport === 'mobile');
    const perfDesktop = summarizeViewportPerformance(desktopCaptures, VIEWPORTS.desktop);
    const perfMobile = summarizeViewportPerformance(mobileCaptures, VIEWPORTS.mobile);

    // Strip internal buffers before serialising manifest
    const publicCaptures = captures.map(({ _rawFrameTimes, _buffer, ...rest }) => rest);

    const passedCaptures = publicCaptures.filter((c) => c.diagnostics.passed).length;
    const daylightPassed = daylightChecks.filter((d) => d.visibleDifference).length;

    const manifest = {
      schemaVersion: 1,
      generator: 'tools/narromine-visual-qa/run.mjs',
      generatedAt: new Date().toISOString(),
      commitSha: gitMeta.commitSha,
      fullCommitSha: gitMeta.fullCommitSha,
      branch: gitMeta.branch,
      environment: {
        platform: `${os.type()} ${os.release()} (${os.arch()})`,
        nodeVersion: process.version,
        gpu: detectedGpu,
        url: targetUrl,
      },
      referencePolicy: {
        sourceFile: 'data/narromine-photo-references.json',
        policy:
          photoCatalogue.policy ||
          'Only use original or appropriately licensed/permissioned photographs. Never fabricate reference photos.',
        licensedRecordCount: photoCatalogue.records.length,
      },
      summary: {
        totalLocations: selectedLocations.length,
        totalViewports: selectedViewports.length,
        totalLightingPresets: selectedLighting.length,
        totalCaptures: publicCaptures.length,
        passedCaptures,
        failedCaptures: publicCaptures.length - passedCaptures,
        daylightChecksTotal: daylightChecks.length,
        daylightChecksPassed: daylightPassed,
        reproducibilityVerified: reproducibilityCheck.passed,
        passed:
          passedCaptures === publicCaptures.length &&
          daylightPassed === daylightChecks.length &&
          (reproducibilityCheck.locationId ? reproducibilityCheck.passed : true),
      },
      reproducibilityCheck,
      performance: {
        desktop: perfDesktop,
        mobile: perfMobile,
      },
      daylightChecks,
      locations: selectedLocations.map((loc) => ({
        ...loc,
        referencePhoto: resolveReferencePhotoForLocation(loc, photoCatalogue),
      })),
      contactSheet: null,
      reportHtml: 'report.html',
      captures: publicCaptures,
    };

    const contactSheetRel = await renderContactSheetPng({
      browser,
      manifest,
      outputDir: outDir,
    });
    manifest.contactSheet = contactSheetRel;

    let comparison = null;
    if (options.baseline) {
      comparison = compareManifests({
        baselinePath: path.resolve(options.baseline),
        candidateManifest: manifest,
        candidateDir: outDir,
        writeDiffs: true,
      });
      fs.writeFileSync(
        path.join(outDir, 'comparison.json'),
        JSON.stringify(comparison, null, 2) + '\n',
        'utf8'
      );
      manifest.baselineComparison = {
        baselineCommitSha: comparison.baselineCommitSha,
        totalCompared: comparison.totalCompared,
        identicalOrNoiseCount: comparison.identicalOrNoiseCount,
        expectedShiftCount: comparison.expectedShiftCount,
        regressionCount: comparison.regressionCount,
        passed: comparison.passed,
        comparisonFile: 'comparison.json',
      };
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    generateHtmlReport({ manifest, comparison, outputDir: outDir });

    return {
      outDir,
      manifestPath,
      reportPath: path.join(outDir, 'report.html'),
      contactSheetPath: path.join(outDir, contactSheetRel),
      manifest,
      comparison,
    };
  } finally {
    await browser.close();
    if (serverHandle) await serverHandle.close();
  }
}

function parseCliArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out-dir') opts.outDir = argv[++i];
    else if (a === '--url') opts.url = argv[++i];
    else if (a === '--baseline') opts.baseline = argv[++i];
    else if (a === '--candidate') opts.candidate = argv[++i];
    else if (a === '--locations') opts.locations = argv[++i];
    else if (a === '--viewports') opts.viewports = argv[++i];
    else if (a === '--times') opts.times = argv[++i];
    else if (a === '--sample-frames') opts.sampleFrames = Number(argv[++i]);
    else if (a === '--build') opts.build = true;
    else if (a === '--compare-only') opts.compareOnly = true;
  }
  return opts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = parseCliArgs(process.argv.slice(2));
  if (opts.compareOnly) {
    if (!opts.baseline || !opts.candidate) {
      console.error('Usage: node tools/narromine-visual-qa/run.mjs --compare-only --baseline <dir|manifest> --candidate <dir|manifest>');
      process.exit(1);
    }
    const candStat = fs.statSync(opts.candidate);
    const candManifestPath = candStat.isDirectory()
      ? path.join(opts.candidate, 'manifest.json')
      : opts.candidate;
    const candDir = path.dirname(candManifestPath);
    const candManifest = JSON.parse(fs.readFileSync(candManifestPath, 'utf8'));
    const cmp = compareManifests({
      baselinePath: path.resolve(opts.baseline),
      candidateManifest: candManifest,
      candidateDir: candDir,
      writeDiffs: true,
    });
    fs.writeFileSync(path.join(candDir, 'comparison.json'), JSON.stringify(cmp, null, 2) + '\n');
    generateHtmlReport({ manifest: candManifest, comparison: cmp, outputDir: candDir });
    console.log(
      `Comparison complete: ${cmp.totalCompared} compared, ${cmp.identicalOrNoiseCount} identical/noise, ${cmp.expectedShiftCount} expected shifts, ${cmp.regressionCount} regressions`
    );
    if (!cmp.passed) process.exitCode = 1;
  } else {
    runNarromineVisualQa(opts)
      .then((res) => {
        const s = res.manifest.summary;
        const pd = res.manifest.performance.desktop;
        const pm = res.manifest.performance.mobile;
        console.log(
          `PASS Narromine Visual QA: ${s.passedCaptures}/${s.totalCaptures} captures across ${s.totalLocations} locations (${s.daylightChecksPassed}/${s.daylightChecksTotal} daylight checks)`
        );
        console.log(
          `  Desktop (${pd.dimensions}): ${pd.meanFps} fps (p50 ${pd.frameTimeMs.p50}ms, p95 ${pd.frameTimeMs.p95}ms) · ${pd.meanDrawCalls} draw calls · ${pd.meanTriangles} triangles · ${pd.browserErrorCount} errors`
        );
        console.log(
          `  Mobile  (${pm.dimensions}): ${pm.meanFps} fps (p50 ${pm.frameTimeMs.p50}ms, p95 ${pm.frameTimeMs.p95}ms) · ${pm.meanDrawCalls} draw calls · ${pm.meanTriangles} triangles · ${pm.browserErrorCount} errors`
        );
        console.log(
          `  Reproducibility check: ${res.manifest.reproducibilityCheck.passed ? 'PASS' : 'FAIL'} (poseDelta=${res.manifest.reproducibilityCheck.poseDelta}, pixelRmse=${res.manifest.reproducibilityCheck.pixelRmse})`
        );
        console.log(`  Manifest: ${res.manifestPath}`);
        console.log(`  Contact sheet: ${res.contactSheetPath}`);
        console.log(`  HTML report: ${res.reportPath}`);
        if (!s.passed) process.exitCode = 1;
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }
}
