#!/usr/bin/env node
// NR-VQA-002: compare source-pinned real WebGL screenshots at six fixed pedestrian poses.
// A screenshot change is REVIEW REQUIRED, not automatically a physical or visual regression.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NARROMINE_QA_LOCATIONS, VIEWPORTS, LIGHTING_PRESETS } from './locations.mjs';
import { compareManifests } from './compare.mjs';

export const APPROVED_BASELINE_SHA = '614c9af27821746df7f3e95978dea177b0fad921';
export const FIXED_POSE_IDS = Object.freeze([
  'royal-hotel-dandaloo',
  'narromine-hotel-corner',
  'post-office-entrance',
  'coles-kieraths-dandaloo',
  'kieraths-arcade-courtyard',
  'ordinary-narromine-street',
]);
export const FIXED_VIEWPORT_IDS = Object.freeze(['desktop', 'mobile']);
export const FIXED_LIGHTING_ID = 'midday';
export const REQUIRED_CAPTURES = Object.freeze(
  FIXED_VIEWPORT_IDS.flatMap(v => FIXED_POSE_IDS.map(l => l + '__' + v + '__' + FIXED_LIGHTING_ID))
);
const sourceLocations = new Map(NARROMINE_QA_LOCATIONS.map(l => [l.id, l]));
const same = (a, b, tolerance = 0.0001) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
const validSha = sha => typeof sha === 'string' && /^[0-9a-f]{40}$/.test(sha);

/**
 * Fail closed on missing, duplicate, misplaced, blank or error-producing screenshots.
 * This is a structural evidence gate, separate from judging whether imagery looks real.
 */
export function validateFixedPoseManifest(manifest, expectedSha) {
  const errors = [];
  const fail = msg => errors.push(msg);
  if (!validSha(expectedSha) || !validSha(manifest?.fullCommitSha) || manifest.fullCommitSha !== expectedSha)
    fail('source commit missing or incorrect');
  if (manifest?.summary?.passed !== true) fail('the underlying actual WebGL capture suite did not pass');
  if (!Array.isArray(manifest?.captures)) return [...errors, 'capture array missing'];
  if (manifest.captures.length !== REQUIRED_CAPTURES.length)
    fail('expected exactly ' + REQUIRED_CAPTURES.length + ' fixed-pose captures');
  const seen = new Set();
  for (const capture of manifest.captures) {
    const key = capture?.id;
    if (!REQUIRED_CAPTURES.includes(key) || seen.has(key)) { fail('unexpected or duplicate capture: ' + key); continue; }
    seen.add(key);
    const loc = sourceLocations.get(capture.locationId);
    const vp = VIEWPORTS[capture.viewport];
    const light = LIGHTING_PRESETS[FIXED_LIGHTING_ID];
    if (!loc || !FIXED_POSE_IDS.includes(loc.id) || key !== loc.id + '__' + capture.viewport + '__midday')
      fail(key + ': non-canonical location');
    if (!vp || !FIXED_VIEWPORT_IDS.includes(capture.viewport) ||
        capture.viewportSize?.width !== vp?.width ||
        capture.viewportSize?.height !== vp?.height ||
        capture.viewportSize?.deviceScaleFactor !== vp?.deviceScaleFactor)
      fail(key + ': viewport/DPR mismatch');
    if (capture.lighting !== 'midday' || capture.minute !== light.minute || capture.weather !== light.weather)
      fail(key + ': time or weather mismatch');
    if (loc && (!same(capture.camera?.x, loc.camera.x, 0.15) ||
        !same(capture.camera?.z, loc.camera.z, 0.15) ||
        !same(capture.camera?.yawRad, loc.camera.yawRad, 0.004) ||
        !same(capture.camera?.pitchRad, loc.camera.pitchRad, 0.004) ||
        !same(capture.camera?.eye, loc.camera.eyeHeightM, 0.15) ||
        !same(capture.camera?.fovDeg, loc.camera.fovDeg, 0.1)))
      fail(key + ': pose/eye height/FOV mismatch');
    if (!capture.diagnostics?.passed || !capture.diagnostics?.screenshotValid ||
        !capture.diagnostics?.narromineVisible || capture.diagnostics?.missingGeometry ||
        (capture.diagnostics?.browserErrors?.length || 0) ||
        (capture.diagnostics?.consoleErrors?.length || 0))
      fail(key + ': blank, missing geometry, errors or failed 3D capture');
    if (!Number.isFinite(capture.metrics?.triangles) || capture.metrics.triangles < (loc?.minExpectedTriangles || 1000))
      fail(key + ': insufficient actual rendered geometry');
    if (!capture.image?.relativePath ||
        !/^screenshots\/[a-z0-9-]+__(desktop|mobile)__midday\.png$/.test(capture.image.relativePath))
      fail(key + ': unsafe or invalid image path');
  }
  for (const id of REQUIRED_CAPTURES) if (!seen.has(id)) fail('missing pose: ' + id);
  return errors;
}

export function assessFixedPoseComparison(baseline, candidate, comparison) {
  const failures = validateFixedPoseManifest(baseline, APPROVED_BASELINE_SHA);
  failures.push(...validateFixedPoseManifest(candidate, candidate?.fullCommitSha));
  if (candidate?.fullCommitSha === baseline?.fullCommitSha) failures.push('candidate must be a different source revision');
  const b = new Map((baseline?.captures || []).map(x => [x.id, x]));
  for (const x of candidate?.captures || []) {
    const old = b.get(x.id);
    if (!old) continue;
    if (!same(old.camera.x, x.camera.x, 0.15) ||
        !same(old.camera.z, x.camera.z, 0.15) ||
        !same(old.camera.yawRad, x.camera.yawRad, 0.004) ||
        old.minute !== x.minute || old.weather !== x.weather ||
        old.viewportSize.width !== x.viewportSize.width ||
        old.viewportSize.height !== x.viewportSize.height)
      failures.push(x.id + ': baseline/candidate scene or camera not aligned');
  }
  if (!comparison || comparison.totalCompared !== REQUIRED_CAPTURES.length ||
      !Array.isArray(comparison.results) || comparison.results.length !== REQUIRED_CAPTURES.length)
    failures.push('not all fixed-pose PNGs were compared');
  const review = (comparison?.results || []).filter(x =>
    x.isRegression || !['identical', 'minor-render-noise'].includes(x.classification) ||
    !x.metrics || x.metrics.changedRatio > 0.008 || x.metrics.rmse > 2 ||
    x.metrics.edgeCorrelation < 0.96
  ).map(x => ({ id: x.id, classification: x.classification, metrics: x.metrics }));
  return {
    schemaVersion: 1,
    task: 'NR-VQA-002',
    baselineSha: baseline?.fullCommitSha,
    candidateSha: candidate?.fullCommitSha,
    captureCount: comparison?.totalCompared || 0,
    status: failures.length ? 'invalid' : review.length ? 'review-required' : 'pixel-stable',
    evidenceValid: failures.length === 0,
    photographicAccuracyVerified: false,
    physicalHandsetTested: false,
    tolerance: { maxChangedPixelRatio: 0.008, maxRmse: 2, minEdgeCorrelation: 0.96 },
    failures,
    review,
    results: comparison?.results || [],
  };
}

function manifestAt(directory) {
  const m = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  for (const c of m.captures || []) {
    const rel = c.image?.relativePath;
    if (typeof rel !== 'string' || !/^screenshots\/[a-z0-9-]+__(desktop|mobile)__midday\.png$/.test(rel) ||
        !fs.statSync(path.join(directory, rel)).isFile())
      throw new Error('Missing or unsafe real screenshot: ' + String(rel));
  }
  return m;
}

export function runFixedPoseCli(args) {
  const index = key => args.indexOf(key);
  const arg = key => index(key) >= 0 ? args[index(key) + 1] : null;
  const baselineDir = arg('--baseline'), candidateDir = arg('--candidate');
  if (!baselineDir || !candidateDir) throw new Error('Usage: fixed-pose-regression.mjs --baseline DIR --candidate DIR');
  const baseline = manifestAt(path.resolve(baselineDir));
  const candidate = manifestAt(path.resolve(candidateDir));
  const errors = validateFixedPoseManifest(baseline, APPROVED_BASELINE_SHA)
    .concat(validateFixedPoseManifest(candidate, candidate.fullCommitSha));
  let comparison = null;
  if (!errors.length) comparison = compareManifests({
    baselinePath: path.resolve(baselineDir),
    candidateManifest: candidate,
    candidateDir: path.resolve(candidateDir),
    writeDiffs: true,
  });
  const result = assessFixedPoseComparison(baseline, candidate, comparison);
  fs.writeFileSync(path.join(path.resolve(candidateDir), 'fixed-pose-review.json'), JSON.stringify(result, null, 2) + '\n');
  console.log('NR-VQA-002 fixed-pose: ' + result.status + '; ' +
    result.captureCount + ' real WebGL comparisons; ' + result.review.length + ' need review');
  if (!result.evidenceValid) throw new Error(result.failures.join('; '));
  // A visually changed scene needs human review, not automatic acceptance or a false failure label.
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runFixedPoseCli(process.argv.slice(2)); } catch (error) { console.error(error); process.exitCode = 1; }
}
