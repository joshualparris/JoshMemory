// NR-VQA-002 pure contract tests. Real screenshots are captured in scoped Chromium CI.
import assert from 'node:assert/strict';
import {
  APPROVED_BASELINE_SHA, FIXED_POSE_IDS, FIXED_VIEWPORT_IDS,
  REQUIRED_CAPTURES, validateFixedPoseManifest, assessFixedPoseComparison,
} from '../tools/narromine-visual-qa/fixed-pose-regression.mjs';
import { NARROMINE_QA_LOCATIONS, VIEWPORTS, LIGHTING_PRESETS } from '../tools/narromine-visual-qa/locations.mjs';
const baselineSHA = APPROVED_BASELINE_SHA;
const candidateSHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
assert.match(baselineSHA, /^[0-9a-f]{40}$/);
assert.equal(FIXED_POSE_IDS.length, 6);
assert.equal(FIXED_VIEWPORT_IDS.length, 2);
assert.equal(REQUIRED_CAPTURES.length, 12);
assert(new Set(REQUIRED_CAPTURES).size === 12);
assert(FIXED_POSE_IDS.includes('royal-hotel-dandaloo'));
assert(FIXED_POSE_IDS.includes('post-office-entrance'));
assert(FIXED_POSE_IDS.includes('coles-kieraths-dandaloo'));
const locationMap = new Map(NARROMINE_QA_LOCATIONS.map(x => [x.id, x]));
function manifest(sha) {
  const captures = FIXED_VIEWPORT_IDS.flatMap(v => FIXED_POSE_IDS.map(id => {
    const loc = locationMap.get(id), vp = VIEWPORTS[v], light = LIGHTING_PRESETS.midday;
    return {
      id: id + '__' + v + '__midday',
      locationId: id, viewport: v,
      viewportSize: { width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor },
      lighting: 'midday', minute: light.minute, weather: light.weather,
      camera: { x: loc.camera.x, z: loc.camera.z, yawRad: loc.camera.yawRad,
        pitchRad: loc.camera.pitchRad, eye: loc.camera.eyeHeightM, fovDeg: loc.camera.fovDeg },
      metrics: { triangles: loc.minExpectedTriangles + 50 },
      image: { relativePath: 'screenshots/' + id + '__' + v + '__midday.png' },
      diagnostics: { passed: true, screenshotValid: true, narromineVisible: true,
        missingGeometry: false, browserErrors: [], consoleErrors: [] },
    };
  }));
  return { fullCommitSha: sha, summary: { passed: true }, captures };
}
const base = manifest(baselineSHA), cand = manifest(candidateSHA);
const cmp = { totalCompared: 12, results: REQUIRED_CAPTURES.map(id => ({
  id, classification: 'identical', isRegression: false,
  metrics: { changedRatio: 0, rmse: 0, edgeCorrelation: 1 },
})) };
assert.deepEqual(validateFixedPoseManifest(base, baselineSHA), []);
assert.deepEqual(validateFixedPoseManifest(cand, candidateSHA), []);
const stable = assessFixedPoseComparison(base, cand, cmp);
assert.equal(stable.status, 'pixel-stable');
assert.equal(stable.photographicAccuracyVerified, false);
assert.equal(stable.physicalHandsetTested, false);
const changed = structuredClone(cmp);
changed.results[0].metrics.changedRatio = 0.025;
assert.equal(assessFixedPoseComparison(base, cand, changed).status, 'review-required');
const geometry = structuredClone(cmp);
geometry.results[0].isRegression = true;
geometry.results[0].classification = 'rendering-regression';
assert.equal(assessFixedPoseComparison(base, cand, geometry).status, 'review-required');
const missing = structuredClone(base);
missing.captures.pop();
assert.match(validateFixedPoseManifest(missing, baselineSHA).join(' '), /expected exactly 12/);
const duplicate = structuredClone(cand);
duplicate.captures[0] = duplicate.captures[1];
assert.match(validateFixedPoseManifest(duplicate, candidateSHA).join(' '), /duplicate/);
const wrongPose = structuredClone(cand);
wrongPose.captures[0].camera.x += 1;
assert.match(validateFixedPoseManifest(wrongPose, candidateSHA).join(' '), /pose/);
const wrongDpr = structuredClone(cand);
wrongDpr.captures[0].viewportSize.deviceScaleFactor = 2;
assert.match(validateFixedPoseManifest(wrongDpr, candidateSHA).join(' '), /DPR/);
const wrongTime = structuredClone(cand);
wrongTime.captures[0].minute = 1;
assert.match(validateFixedPoseManifest(wrongTime, candidateSHA).join(' '), /time or weather/);
const blank = structuredClone(cand);
blank.captures[0].diagnostics.screenshotValid = false;
assert.match(validateFixedPoseManifest(blank, candidateSHA).join(' '), /blank/);
const nonWebgl = structuredClone(cand);
nonWebgl.captures[0].metrics.triangles = 0;
assert.match(validateFixedPoseManifest(nonWebgl, candidateSHA).join(' '), /geometry/);
const unsafe = structuredClone(cand);
unsafe.captures[0].image.relativePath = '../outside.png';
assert.match(validateFixedPoseManifest(unsafe, candidateSHA).join(' '), /unsafe/);
assert.equal(assessFixedPoseComparison(base, wrongPose, cmp).status, 'invalid');
assert.equal(assessFixedPoseComparison(base, cand, { totalCompared: 11, results: cmp.results }).status, 'invalid');
assert.equal(assessFixedPoseComparison(base, manifest(baselineSHA), cmp).status, 'invalid');
console.log('PASS NR-VQA-002: 12 source-pinned eye-level WebGL frames; missing/blank/misaligned evidence rejected; visual change requires review');
