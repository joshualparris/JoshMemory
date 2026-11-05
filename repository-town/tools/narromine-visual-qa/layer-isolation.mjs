#!/usr/bin/env node
// NR-VQA-005: real Chrome/WebGL layer isolation, never modifies playable sources.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { VIEWPORTS, REPO_TOWN_ROOT } from './locations.mjs';
import { ROAD_HORIZON_ROUTE_ID, locateCameraRoute, instrumentMainForQa } from './compare-video.mjs';
import { resolveChromiumExecutable, startStaticServer, positionAndMeasureInPage } from './run.mjs';
import { ABLATION_LAYERS, ablateNarromineSource, ablateSurfaceShader,
  pixelDifference, ablationVerdict } from './layer-ablation.mjs';

const digest = s => createHash('sha256').update(s).digest('hex');
const save = (file, payload) => fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');

export async function captureLayerAblations(options = {}) {
  const config = { out: 'test-results/narromine-layer-qa',
    viewports: 'desktop,mobile', layers: ABLATION_LAYERS, ...options };
  const out = path.resolve(REPO_TOWN_ROOT, config.out);
  fs.mkdirSync(out, { recursive: true });
  let server = null, browser = null;
  try {
    const build = path.join(REPO_TOWN_ROOT, 'dist/public');
    if (!config.skipBuild || !fs.existsSync(path.join(build, 'index.html'))) {
      execFileSync(process.execPath, [path.join(REPO_TOWN_ROOT, 'tools/build.mjs')], {
        cwd: REPO_TOWN_ROOT, stdio: 'inherit',
      });
    }
    const world = fs.readFileSync(path.join(build, 'world/narromine.js'), 'utf8');
    const shader = fs.readFileSync(path.join(build, 'world/narromine-surface-materials.js'), 'utf8');
    const main = instrumentMainForQa(fs.readFileSync(path.join(build, 'main.js'), 'utf8'));
    const layers = typeof config.layers === 'string' ? config.layers.split(',') : config.layers;
    assert(layers.includes('normal') && layers.includes('reference-repeat'),
      'must include two independent normal-scene captures as noise floor');
    assert(layers.length === new Set(layers).size, 'duplicate layer');
    for (const layer of layers) assert(ABLATION_LAYERS.includes(layer), 'unsupported ablation');
    const viewports = String(config.viewports).split(',');
    for (const vp of viewports) assert(VIEWPORTS[vp], 'unknown viewport');
    const location = locateCameraRoute(ROAD_HORIZON_ROUTE_ID);
    server = await startStaticServer(build);
    const browserPath = resolveChromiumExecutable();
    browser = await chromium.launch({ headless: true,
      ...(browserPath ? { executablePath: browserPath } : {}),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
    const report = {
      task: 'NR-VQA-005', status: 'layer-evidence-captured',
      source: { builtMain: digest(main), narromine: digest(world), material: digest(shader) },
      camera: location.camera,
      caveats: ['A layer deletion is not a flicker improvement test.',
        'Isolated runs can differ from ordinary moving cars/NPCs; compare with second normal run.',
        'Terrain ablation removes the map background but not water or detailed landmark ground.',
        'The noise ablation flattens derivative-filtered surface noise, not geometric z-fighting.'],
      records: [], comparisons: [],
    };
    for (const viewport of viewports) {
      const v = VIEWPORTS[viewport];
      for (const layer of layers) {
        const worldResponse = ablateNarromineSource(world, layer);
        const shaderResponse = ablateSurfaceShader(shader, layer);
        const context = await browser.newContext({
          viewport: { width: v.width, height: v.height },
          deviceScaleFactor: v.deviceScaleFactor,
          isMobile: v.isMobile, hasTouch: v.hasTouch,
        });
        try {
          const page = await context.newPage();
          const errors = []; let worldHits = 0, shaderHits = 0, mainHits = 0;
          page.on('pageerror', e => errors.push(String(e.message || e)));
          await page.addInitScript(() => {
            try { localStorage.setItem('repository-town.sun-shadows.v1', 'off'); } catch {}
          });
          const allowedOrigin = new URL(server.url).origin;
          await page.route('**/*', request => {
            if (new URL(request.request().url()).origin !== allowedOrigin) {
              return request.abort('blockedbyclient');
            }
            return request.continue();
          });
          await page.route('**/world/narromine.js', req => {
            worldHits++;
            return req.fulfill({ status: 200, contentType: 'text/javascript', body: worldResponse });
          });
          await page.route('**/world/narromine-surface-materials.js', req => {
            shaderHits++;
            return req.fulfill({ status: 200, contentType: 'text/javascript', body: shaderResponse });
          });
          await page.route('**/main.js', req => {
            mainHits++;
            return req.fulfill({ status: 200, contentType: 'text/javascript', body: main });
          });
          await page.goto(server.url, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(
            () => Boolean(window.__town) && document.getElementById('loading')?.hidden,
            null, { timeout: 90000 });
          assert.equal(worldHits, 1, 'world source injection did not load exactly once');
          assert.equal(shaderHits, 1, 'surface shader injection did not load exactly once');
          assert.equal(mainHits, 1, 'QA renderer injection did not load exactly once');
          await page.evaluate(() => window.__town.life.setDay(57));
          const dir = path.join(out, viewport);
          fs.mkdirSync(dir, { recursive: true });
          const images = [];
          for (let frame = 0; frame < 2; frame++) {
            const x = location.camera.x + (frame ? .032 : -.032);
            const yawRad = frame ? 0.00045 : -0.00045;
            const pose = {
              x, z: location.camera.z, yawRad,
              pitchRad: location.camera.pitchRad,
              eyeHeightM: location.camera.eyeHeightM,
              fovDeg: location.camera.fovDeg,
            };
            await positionAndMeasureInPage(page, { ...pose,
              minute: 750, weather: 'clear', hideHud: true, sampleFrames: 3 });
            assert(await page.evaluate(() => window.__qaRendererHookHits > 0 &&
              window.__town.narromineVisible() && window.__town.state().triangles > 1200),
            'Narromine scene and actual Three.js WebGL renderer not active');
            const filename = path.join(dir, layer + '-' + frame + '.png');
            const screenshot = await page.locator('canvas#scene').screenshot({
              path: filename, type: 'png',
            });
            assert(screenshot.length > 5000, 'no real WebGL pixel evidence');
            images.push(path.relative(out, filename).split(path.sep).join('/'));
          }
          assert.deepEqual(errors, [], 'page exceptions during ' + viewport + ' ' + layer);
          report.records.push({ viewport, layer, images, errors, frames: images.length,
            shaderHash: digest(shaderResponse), worldHash: digest(worldResponse) });
          save(path.join(out, 'layer-report.json'), report);
          console.log('CAPTURE ' + viewport + ' ' + layer + ' frames=' + images.length);
        } finally {
          await context.close();
        }
      }
    }
    for (const viewport of viewports) {
      const rec = layer => report.records.find(x => x.viewport === viewport && x.layer === layer);
      const normal = rec('normal'), repeat = rec('reference-repeat');
      const image = (r, i) => fs.readFileSync(path.join(out, r.images[i]));
      for (const layer of layers.filter(x => !['normal', 'reference-repeat'].includes(x))) {
        const variant = rec(layer);
        const baselineNoise = [0, 1].map(i => pixelDifference(image(normal, i), image(repeat, i)));
        const actualEffect = [0, 1].map(i => pixelDifference(image(normal, i), image(variant, i)));
        const avg = xs => xs.reduce((n, x) => n + x.roadRegionChangedPct, 0) / xs.length;
        report.comparisons.push({ viewport, layer, baselineNoise, actualEffect,
          ...ablationVerdict({ roadRegionChangedPct: avg(baselineNoise) },
            { roadRegionChangedPct: avg(actualEffect) }) });
      }
    }
    save(path.join(out, 'layer-report.json'), report);
    console.log('PASS NR-VQA-005: real WebGL layer-ablation screenshots, source fingerprints and independent normal repeat.');
    return report;
  } catch (error) {
    save(path.join(out, 'failure.json'), {
      task: 'NR-VQA-005', status: 'unverified', error: String(error.stack || error),
    });
    throw error;
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (key, fallback) => {
    const i = process.argv.indexOf(key);
    return i >= 0 ? process.argv[i + 1] : fallback;
  };
  await captureLayerAblations({
    out: arg('--out', 'test-results/narromine-layer-qa'),
    viewports: arg('--viewports', 'desktop,mobile'),
    skipBuild: process.argv.includes('--skip-build'),
  });
}
