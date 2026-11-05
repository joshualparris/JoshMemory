// NR-VQA-001: deterministic camera path and compare-contract regression.
// This does not pretend to be a visual test; the real WebGL workflow must run too.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NARROMINE_QA_LOCATIONS, VIEWPORTS } from '../tools/narromine-visual-qa/locations.mjs';
import {
  BASELINE_SHA, CANDIDATE_SHA, DEFAULT_ROUTE_ID, cameraRoute, checkPairContract,
} from '../tools/narromine-visual-qa/compare-video.mjs';

assert.match(BASELINE_SHA, /^[a-f0-9]{40}$/);
assert.match(CANDIDATE_SHA, /^[a-f0-9]{40}$/);
assert.notEqual(BASELINE_SHA, CANDIDATE_SHA, 'two historical shader revisions');
assert(VIEWPORTS.desktop && VIEWPORTS.mobile);
const coles = NARROMINE_QA_LOCATIONS.find(x => x.id === DEFAULT_ROUTE_ID);
assert(coles, 'use canonical 3D Narromine camera location');
const route = cameraRoute(coles, 36);
assert.deepEqual(route, cameraRoute(coles, 36), 'no camera-path randomness');
assert.equal(route.length, 36, '36 rendered waypoints');
assert(route.every(x => x.eyeHeightM === 1.65 && x.fovDeg === 72), 'pedestrian eye and FOV');
assert(route.every(x => Number.isFinite(x.x) && Number.isFinite(x.z) &&
  Number.isFinite(x.yawRad)), 'finite render pose');
assert.equal(route[0].z, coles.camera.z - 6);
assert.equal(route.at(-1).z, coles.camera.z + 6);
assert(route.some((x, i) => i > 0 && x.yawRad !== route[0].yawRad),
  'controlled camera motion and parallax, not a frozen screenshot');
assert.throws(() => cameraRoute(coles, 10), /24/);
assert.throws(() => cameraRoute({ id: 'invalid' }, 36), /known camera/);
const settings = { viewport: 'desktop', width: 1280, height: 800,
  day: 57, minute: 750, weather: 'clear' };
const createResult = variant => ({
  variant, buildRevision: 'abc123', shaderSha256: variant === 'baseline' ? 'old' : 'new',
  settings, route, recordedSteps: route.length, videoBytes: 30000,
  sampleImages: Array(19).fill('sample.jpg'), narromineVisible: true,
  triangles: 3000, errors: [],
});
const base = createResult('baseline'), candidate = createResult('candidate');
assert.equal(checkPairContract(base, candidate), true, 'valid matched pair');
for (const [field, value] of [
  ['buildRevision', 'different'], ['shaderSha256', 'old'],
  ['settings', { ...settings, weather: 'rain' }], ['route', route.slice(1)],
  ['recordedSteps', 3], ['videoBytes', 0], ['sampleImages', []],
  ['narromineVisible', false], ['triangles', 1], ['errors', ['WebGL failed']],
]) {
  const mismatched = { ...candidate, [field]: value };
  assert.throws(() => checkPairContract(base, mismatched),
    'the comparison must reject mismatched ' + field);
}
const source = fs.readFileSync(
  new URL('../tools/narromine-visual-qa/compare-video.mjs', import.meta.url), 'utf8');
assert(source.includes('canvas.captureStream(15)'), 'real canvas is recorded, not simulated PNGs');
assert(source.includes('new MediaRecorder('), 'must create an actual WebM capture');
assert(source.includes("page.locator('canvas#scene').screenshot"),
  'real WebGL frames are evidence, not static source-derived images');
assert(source.includes("page.route('**/world/narromine-surface-materials.js'"),
  'same game assets with one shader module swapped in isolated browser contexts');
assert(source.includes("status: 'unverified'"),
  'video capture alone cannot declare flicker improved');
assert(!source.includes('maps.googleapis.com'), 'no paid Google calls');
console.log('PASS NR-VQA-001: deterministic 36-frame moving camera, pinned shader pair and strict A/B evidence contract');
