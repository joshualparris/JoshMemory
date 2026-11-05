#!/usr/bin/env node
// NR-VQA-001: controlled, real-WebGL video evidence for the PR #408 material shader.
// No scene/game files are modified. Both variants run the SAME built game, with only
// the one shader module response swapped at request time, in isolated browser contexts.
// Usage: node tools/narromine-visual-qa/compare-video.mjs --viewports desktop,mobile
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { NARROMINE_QA_LOCATIONS, REPO_TOWN_ROOT, VIEWPORTS } from './locations.mjs';
import { positionAndMeasureInPage, resolveChromiumExecutable, startStaticServer } from './run.mjs';

export const BASELINE_SHA = 'ec085dd824be4ee0e931968e5e2e9abef5e43c38';
export const CANDIDATE_SHA = 'f2810b93242d6b2174198c65748e95e10d126809';
export const DEFAULT_ROUTE_ID = 'coles-kieraths-dandaloo';
const SHADER_PATH = 'repository-town/src/world/narromine-surface-materials.js';
const ROUTE_MIN_STEPS = 24;

function digest(input) {
  return createHash('sha256').update(input).digest('hex');
}

export function cameraRoute(location, count = 36) {
  assert(location?.camera && Number.isInteger(count) && count >= ROUTE_MIN_STEPS && count <= 120,
    'a known camera location and 24–120 real render steps are required');
  const cam = location.camera;
  return Array.from({ length: count }, (_, frame) => {
    const fraction = frame / (count - 1);
    return {
      frame,
      x: Number(cam.x.toFixed(6)),
      z: Number((cam.z - 6 + 12 * fraction).toFixed(6)),
      yawRad: Number((cam.yawRad + 0.07 * Math.sin(2 * Math.PI * fraction)).toFixed(7)),
      pitchRad: cam.pitchRad,
      eyeHeightM: cam.eyeHeightM,
      fovDeg: cam.fovDeg,
    };
  });
}

export function checkPairContract(baseline, candidate) {
  assert.equal(baseline.variant, 'baseline');
  assert.equal(candidate.variant, 'candidate');
  assert.equal(baseline.instrumentedMainSha256, candidate.instrumentedMainSha256,
    'both versions must run identical QA-only camera instrumentation');
  assert.equal(baseline.buildRevision, candidate.buildRevision,
    'both variants MUST use identical game assets');
  assert.notEqual(baseline.shaderSha256, candidate.shaderSha256,
    'shader variants must have different source content');
  assert.deepEqual(baseline.settings, candidate.settings, 'environment and viewport differ');
  assert.deepEqual(baseline.route, candidate.route, 'camera path or frame count differs');
  assert.equal(baseline.recordedSteps, baseline.route.length, 'baseline incomplete');
  assert.equal(candidate.recordedSteps, candidate.route.length, 'candidate incomplete');
  assert(baseline.videoBytes > 10000 && candidate.videoBytes > 10000,
    'both WebGL videos must contain actual encoded output');
  assert(baseline.sampleImages.length >= 8 && candidate.sampleImages.length >= 8);
  assert.equal(baseline.sampleImages.length, candidate.sampleImages.length,
    'comparison screenshot samples do not align');
  assert.equal(baseline.narromineVisible, true);
  assert.equal(candidate.narromineVisible, true);
  assert(baseline.triangles > 1200 && candidate.triangles > 1200,
    'actual Narromine geometry must render');
  assert.deepEqual(baseline.errors, [], 'baseline browser page errors');
  assert.deepEqual(candidate.errors, [], 'candidate browser page errors');
  return true;
}

function shaderAtRevision(revision) {
  assert.match(revision, /^[a-f0-9]{40}$/, 'require full pinned source SHA');
  const checkoutRoot = path.resolve(REPO_TOWN_ROOT, '..');
  return execFileSync('git', ['show', revision + ':' + SHADER_PATH], {
    cwd: checkoutRoot, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
  });
}

function currentRevision() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: path.resolve(REPO_TOWN_ROOT, '..'), encoding: 'utf8',
  }).trim();
}

function parseArguments(argv) {
  const options = { out: 'test-results/narromine-video-qa', viewports: 'desktop,mobile',
    route: DEFAULT_ROUTE_ID, steps: 36, baselineSha: BASELINE_SHA,
    candidateSha: CANDIDATE_SHA, skipBuild: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--out') options.out = argv[++i];
    else if (flag === '--viewports') options.viewports = argv[++i];
    else if (flag === '--route') options.route = argv[++i];
    else if (flag === '--steps') options.steps = Number(argv[++i]);
    else if (flag === '--baseline-sha') options.baselineSha = argv[++i];
    else if (flag === '--candidate-sha') options.candidateSha = argv[++i];
    else if (flag === '--skip-build') options.skipBuild = true;
    else throw new Error('Unsupported NR-VQA-001 option: ' + flag);
  }
  return options;
}

// QA-only instance hook runs inside the served main module before the render loop.
// This is needed because wrapping THREE.WebGLRenderer.prototype after bootstrap is
// not reliable when the renderer has already bound its own render function.
export function instrumentMainForQa(main) {
  const marker = 'const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.15, 185);';
  assert.equal(main.split(marker).length, 2, 'expected unique Three.js game camera setup');
  const hook = [
    'window.__qaCamera = camera;',
    'const __narromineQaOriginalRender = renderer.render.bind(renderer);',
    'renderer.render = function(scene, camera, ...args) {',
    '  window.__qaCamera = camera;',
    '  window.__qaRendererHookHits = (window.__qaRendererHookHits || 0) + 1;',
    '  const ov = window.__qaCameraOverride;',
    '  if (ov && camera && camera.isPerspectiveCamera) {',
    '    if (Number.isFinite(ov.eyeHeightM)) camera.position.y = ov.eyeHeightM;',
    "    camera.rotation.set(ov.pitchRad, ov.yawRad, 0, 'YXZ');",
    '    if (Number.isFinite(ov.fovDeg) && Math.abs(camera.fov - ov.fovDeg) > 0.001) {',
    '      camera.fov = ov.fovDeg;',
    '      camera.updateProjectionMatrix();',
    '    }',
    '  }',
    '  return __narromineQaOriginalRender(scene, camera, ...args);',
    '};',
  ].join('\n');
  return main.replace(marker, marker + '\n' + hook);
}

function fileRelative(outDir, absolute) {
  return path.relative(outDir, absolute).split(path.sep).join('/');
}

async function startCanvasRecorder(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas#scene');
    if (!canvas || typeof canvas.captureStream !== 'function' ||
        typeof MediaRecorder === 'undefined') throw new Error('Canvas MediaRecorder not supported');
    const mime = ['video/webm;codecs=vp8', 'video/webm'].find(x => MediaRecorder.isTypeSupported(x));
    if (!mime) throw new Error('WebM MediaRecorder codec unavailable');
    const stream = canvas.captureStream(15);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1500000 });
    const chunks = [];
    recorder.addEventListener('dataavailable', event => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.start();
    window.__narromineQaRecorder = { recorder, stream, chunks };
    return { mimeType: recorder.mimeType, width: canvas.width, height: canvas.height };
  });
}

async function stopCanvasRecorder(page) {
  return page.evaluate(async () => {
    const active = window.__narromineQaRecorder;
    if (!active || active.recorder.state !== 'recording') throw new Error('No running QA recorder');
    const { recorder, stream, chunks } = active;
    const stopped = new Promise((resolve, reject) => {
      recorder.addEventListener('error', event => reject(new Error('Video encoding failed: ' + event.message)), { once: true });
      recorder.addEventListener('stop', async () => {
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const dataUrl = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = () => rej(reader.error);
            reader.readAsDataURL(blob);
          });
          resolve({ bytes: blob.size, mimeType: blob.type, base64: String(dataUrl).split(',')[1] });
        } catch (error) { reject(error); }
      }, { once: true });
    });
    recorder.stop();
    const result = await stopped;
    for (const track of stream.getTracks()) track.stop();
    delete window.__narromineQaRecorder;
    return result;
  });
}

async function captureVersion(browser, url, outDir, config, version, shader, instrumentedMain, vp, route) {
  const destDir = path.join(outDir, version.name, vp.id);
  fs.mkdirSync(destDir, { recursive: true });
  const settings = {
    viewport: vp.id, width: vp.width, height: vp.height,
    deviceScaleFactor: vp.deviceScaleFactor, mobileEmulation: vp.isMobile,
    minute: 750, day: 57, weather: 'clear', sunShadows: 'off',
    routeId: config.route, cameraHeightMetres: route[0].eyeHeightM,
    fovDeg: route[0].fovDeg, recordingCadenceTargetMs: 90,
  };
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch,
  });
  const errors = [], external = [];
  let shaderRequests = 0, mainRequests = 0, finishDone = false;
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error.message || error)));
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('town-cheats', '1');
        localStorage.setItem('repository-town.sun-shadows.v1', 'off');
      } catch {}
    });
    const allowedOrigin = new URL(url).origin;
    await page.route('**/*', routeRequest => {
      const req = routeRequest.request().url();
      if (new URL(req).origin !== allowedOrigin) {
        external.push(req);
        return routeRequest.abort('blockedbyclient');
      }
      if (new URL(req).pathname === '/api/npc-chat') return routeRequest.abort('blockedbyclient');
      return routeRequest.continue();
    });
    await page.route('**/world/narromine-surface-materials.js', routeRequest => {
      shaderRequests++;
      return routeRequest.fulfill({
        status: 200, contentType: 'text/javascript; charset=utf-8',
        body: shader,
      });
    });
    await page.route('**/main.js', request => {
      mainRequests++;
      return request.fulfill({
        status: 200, contentType: 'text/javascript; charset=utf-8',
        body: instrumentedMain,
      });
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => Boolean(window.__town) && document.getElementById('loading')?.hidden,
      null, { timeout: 90000 }
    );
    assert.equal(shaderRequests, 1, 'the intended shader module MUST be loaded exactly once');
    assert.equal(mainRequests, 1, 'the QA-instrumented source module MUST be loaded exactly once');
    await page.evaluate(() => window.__town.life.setDay(57));
    const first = route[0];
    await positionAndMeasureInPage(page, {
      x: first.x, z: first.z, yawRad: first.yawRad,
      pitchRad: first.pitchRad, eyeHeightM: first.eyeHeightM, fovDeg: first.fovDeg,
      minute: settings.minute, weather: settings.weather, sampleFrames: 4,
    });
    const live = await page.evaluate(() => ({
      visible: window.__town.narromineVisible(),
      state: window.__town.state(),
      gpu: window.__town.perf?.().gpu || 'unknown',
      canvas: Boolean(window.__qaCamera?.isPerspectiveCamera),
    }));
    assert(live.canvas && await page.evaluate(() => window.__qaRendererHookHits > 0),
      'QA-only camera instance hook did not render a Three.js perspective frame');
    assert(live.visible && live.state.triangles > 1200,
      'real Narromine WebGL geometry was not displayed');
    const recorded = await startCanvasRecorder(page);
    assert(recorded.width > 0 && recorded.height > 0, 'WebGL canvas is empty');

    const sampleImages = [];
    for (let i = 0; i < route.length; i++) {
      const pose = route[i];
      const actual = await page.evaluate(async cameraPose => {
        const t = window.__town;
        t.place(cameraPose.x, cameraPose.z, cameraPose.yawRad);
        window.__qaCameraOverride = {
          yawRad: cameraPose.yawRad, pitchRad: cameraPose.pitchRad,
          eyeHeightM: cameraPose.eyeHeightM, fovDeg: cameraPose.fovDeg,
        };
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        const state = t.state();
        return { x: state.pos.x, z: state.pos.z, visible: t.narromineVisible() };
      }, pose);
      assert(actual.visible && Math.hypot(actual.x - pose.x, actual.z - pose.z) < 0.05,
        'player failed to match the recorded deterministic camera waypoint ' + i);
      await page.waitForTimeout(settings.recordingCadenceTargetMs);
      if (i % 2 === 0 || i === route.length - 1) {
        const jpegPath = path.join(destDir, 'frame-' + String(i).padStart(3, '0') + '.jpg');
        const shot = await page.locator('canvas#scene').screenshot({
          path: jpegPath, type: 'jpeg', quality: 82,
        });
        assert(shot.length > 5000, 'blank or missing real WebGL frame ' + i);
        sampleImages.push(fileRelative(outDir, jpegPath));
      }
    }
    const rawVideo = await stopCanvasRecorder(page);
    finishDone = true;
    const videoBuffer = Buffer.from(rawVideo.base64 || '', 'base64');
    assert(videoBuffer.length > 10000 && videoBuffer.subarray(0, 4).toString('hex') === '1a45dfa3',
      'WebM encoder produced no playable-looking video bytes');
    const videoFile = path.join(destDir, 'narromine-' + version.name + '.webm');
    fs.writeFileSync(videoFile, videoBuffer);
    assert.deepEqual(errors, [], 'browser page errors while recording');
    return {
      variant: version.name, shaderRevision: version.revision,
      shaderSha256: digest(shader), instrumentedMainSha256: digest(instrumentedMain),
      buildRevision: config.buildRevision,
      recordedSteps: route.length, videoBytes: videoBuffer.length,
      videoFile: fileRelative(outDir, videoFile), sampleImages,
      route, settings, narromineVisible: live.visible,
      triangles: live.state.triangles, drawCalls: live.state.calls,
      renderer: { browserVersion: browser.version(), gpu: live.gpu,
        canvasWidth: recorded.width, canvasHeight: recorded.height,
        mimeType: rawVideo.mimeType },
      externalRequestsBlocked: external.length, shaderRequests, mainRequests,
      errors,
    };
  } finally {
    // Browser abort/cleanup must not accidentally mark unfinished recordings successful.
    if (!finishDone) {
      try {
        const pages = context.pages();
        for (const page of pages) await page.evaluate(() => {
          const active = window.__narromineQaRecorder;
          if (active?.recorder?.state === 'recording') active.recorder.stop();
          active?.stream?.getTracks().forEach(track => track.stop());
        });
      } catch {}
    }
    await context.close();
  }
}

export async function runComparison(options = {}) {
  const config = { ...parseArguments([]), ...options };
  const outDir = path.resolve(REPO_TOWN_ROOT, config.out);
  fs.mkdirSync(outDir, { recursive: true });
  let server, browser;
  try {
    const baseline = shaderAtRevision(config.baselineSha);
    const candidate = shaderAtRevision(config.candidateSha);
    assert(!baseline.includes('nrFilteredNoise('), 'the pinned baseline is already filtered');
    assert(candidate.includes('float nrFilteredNoise(') &&
      candidate.includes('narromine-world-surface-v2'), 'candidate does not include PR #408 material fix');
    assert.notEqual(digest(baseline), digest(candidate), 'source pair is identical');
    const location = NARROMINE_QA_LOCATIONS.find(x => x.id === config.route);
    assert(location, 'unknown Narromine camera route ID');
    const route = cameraRoute(location, config.steps);
    const chosen = String(config.viewports).split(',').map(x => x.trim());
    assert(chosen.length > 0 && new Set(chosen).size === chosen.length,
      'duplicate or missing viewport');
    for (const view of chosen) assert(VIEWPORTS[view], 'unknown viewport ' + view);
    config.buildRevision = currentRevision();
    if (!config.skipBuild || !fs.existsSync(path.join(REPO_TOWN_ROOT, 'dist/public/index.html'))) {
      execFileSync(process.execPath, [path.join(REPO_TOWN_ROOT, 'tools/build.mjs')], {
        cwd: REPO_TOWN_ROOT, stdio: 'inherit',
      });
    }
    const originalMain = fs.readFileSync(path.join(REPO_TOWN_ROOT, 'dist/public/main.js'), 'utf8');
    const instrumentedMain = instrumentMainForQa(originalMain);
    server = await startStaticServer(path.join(REPO_TOWN_ROOT, 'dist/public'));
    const executablePath = resolveChromiumExecutable();
    browser = await chromium.launch({
      headless: true, ...(executablePath ? { executablePath } : {}),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
    });
    const result = {
      task: 'NR-VQA-001', status: 'unverified',
      reason: 'Videos recorded successfully; a matched temporal flicker metric and visual review are still required.',
      buildRevision: config.buildRevision,
      variants: { baseline: config.baselineSha, candidate: config.candidateSha },
      shaderSha256: { baseline: digest(baseline), candidate: digest(candidate) },
      routeId: config.route, records: [],
    };
    for (const name of chosen) {
      const vp = VIEWPORTS[name];
      const baselineCapture = await captureVersion(browser, server.url, outDir, config,
        { name: 'baseline', revision: config.baselineSha }, baseline, instrumentedMain, vp, route);
      const candidateCapture = await captureVersion(browser, server.url, outDir, config,
        { name: 'candidate', revision: config.candidateSha }, candidate, instrumentedMain, vp, route);
      checkPairContract(baselineCapture, candidateCapture);
      result.records.push(baselineCapture, candidateCapture);
      fs.writeFileSync(path.join(outDir, 'comparison.json'), JSON.stringify(result, null, 2) + '\n');
    }
    console.log('PASS real WebGL paired videos: ' + chosen.join(', ') +
      '; identical ' + route.length + '-point camera paths; recorded outputs; flicker verdict UNVERIFIED.');
    return result;
  } catch (error) {
    fs.writeFileSync(path.join(outDir, 'failure.json'), JSON.stringify({
      task: 'NR-VQA-001', status: 'unverified',
      error: String(error.stack || error),
      message: 'No before/after visual improvement claim is permitted.',
    }, null, 2) + '\n');
    throw error;
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runComparison(parseArguments(process.argv.slice(2))).catch(error => {
    console.error('NR-VQA-001 failed (UNVERIFIED): ' + String(error.stack || error));
    process.exitCode = 1;
  });
}
