#!/usr/bin/env node
// NR-VQA-003: measure real WebGL screen-space *micro-motion* shimmer.
// Requires the paired A,A,B,B lossless captures from compare-video.mjs.
// Repeated poses (A→A, B→B) act as dynamic-scene negative controls.
// The A→B pose changes 6.4cm + 0.0009rad and can reveal unstable subpixel
// asphalt procedural detail. This is a proxy, NOT a claim to diagnose z-fighting.
// Reject weak/unaligned/low-coverage evidence instead of inventing improvement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { TEMPORAL_ROUTE_ID } from './compare-video.mjs';

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
export const METRIC_VERSION = 1;

export function decodePng(bytes) {
  assert(Buffer.isBuffer(bytes) && bytes.subarray(0, 8).equals(SIG), 'expected a lossless PNG file');
  let pos = 8, width = 0, height = 0, bitDepth = -1, colourType = -1, interlace = -1;
  const idat = [];
  while (pos + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(pos);
    assert(length <= bytes.length - pos - 12, 'truncated PNG chunk');
    const type = bytes.toString('ascii', pos + 4, pos + 8);
    const payload = bytes.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = payload.readUInt32BE(0); height = payload.readUInt32BE(4);
      bitDepth = payload[8]; colourType = payload[9]; interlace = payload[12];
    } else if (type === 'IDAT') idat.push(payload);
    pos += length + 12;
    if (type === 'IEND') break;
  }
  assert(width > 0 && width <= 4096 && height > 0 && height <= 4096,
    'invalid PNG dimensions');
  assert(bitDepth === 8 && (colourType === 2 || colourType === 6) && interlace === 0,
    'only 8-bit RGB/RGBA non-interlaced screenshot PNG is accepted');
  assert(idat.length > 0, 'no PNG image data');
  const channels = colourType === 2 ? 3 : 4, stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  assert.equal(raw.length, height * (stride + 1), 'PNG uncompressed size mismatch');
  const pixels = Buffer.alloc(width * height * 4);
  let previous = Buffer.alloc(stride), offset = 0, output = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++], current = Buffer.allocUnsafe(stride);
    assert(filter <= 4, 'unsupported PNG filter method');
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? current[i - channels] : 0;
      const above = previous[i];
      const upLeft = i >= channels ? previous[i - channels] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above
        : filter === 3 ? (left + above) >> 1 : paeth(left, above, upLeft);
      current[i] = (raw[offset++] + predictor) & 255;
    }
    for (let x = 0; x < width; x++) {
      const p = x * channels;
      pixels[output++] = current[p]; pixels[output++] = current[p + 1];
      pixels[output++] = current[p + 2];
      pixels[output++] = channels === 4 ? current[p + 3] : 255;
    }
    previous = current;
  }
  return { width, height, data: pixels };
}

function luma(p, i) { return (77 * p[i] + 150 * p[i + 1] + 29 * p[i + 2]) / 256; }
function asphaltColour(p, i) {
  const r = p[i], g = p[i + 1], b = p[i + 2], lum = luma(p, i);
  return lum >= 30 && lum <= 159 &&
    Math.max(r, g, b) - Math.min(r, g, b) <= 20 && p[i + 3] >= 250;
}
function mean(xs) { return xs.length ? xs.reduce((n, x) => n + x, 0) / xs.length : 0; }
function percentile(xs, p) {
  if (!xs.length) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * p)];
}
const num = x => Number(x.toFixed(4));

export function measureCycle(b, c, options = {}) {
  assert.equal(b.length, 4); assert.equal(c.length, 4);
  const width = b[0].width, height = b[0].height;
  for (const f of [...b, ...c]) {
    assert.equal(f.width, width, 'pixel width changed');
    assert.equal(f.height, height, 'pixel height changed');
  }
  const minX = Math.floor(width * (options.x0 ?? 0.25));
  const maxX = Math.floor(width * (options.x1 ?? 0.75));
  const minY = Math.floor(height * (options.y0 ?? 0.58));
  const maxY = Math.floor(height * (options.y1 ?? 0.92));
  let total = 0, considered = 0, rejectedStatic = 0, rejectedMotion = 0;
  let motionB = 0, motionC = 0, staticB = 0, staticC = 0;
  const bDiffs = [], cDiffs = [];
  const bp = b.map(f => f.data), cp = c.map(f => f.data);
  const plausible = (arr, idx) => asphaltColour(arr[0], idx) &&
    asphaltColour(arr[2], idx);
  // Sample on a stable 2px lattice, exclude likely cars, markings and texture
  // edges with a conservative near-neutral asphalt heuristic. A/B use the
  // *same* accepted pixel locations; don't silently give one a larger mask.
  for (let y = minY; y < maxY; y += 2) for (let x = minX; x < maxX; x += 2) {
    total++;
    const i = (y * width + x) * 4;
    if (!plausible(bp, i) || !plausible(cp, i)) continue;
    considered++;
    const v = a => a.map(img => luma(img, i));
    const vb = v(bp), vc = v(cp);
    const sb = (Math.abs(vb[0] - vb[1]) + Math.abs(vb[2] - vb[3])) / 2;
    const sc = (Math.abs(vc[0] - vc[1]) + Math.abs(vc[2] - vc[3])) / 2;
    if (sb > 9 || sc > 9) { rejectedStatic++; continue; }
    const db = Math.abs(vb[1] - vb[2]), dc = Math.abs(vc[1] - vc[2]);
    if (db > 60 || dc > 60) { rejectedMotion++; continue; }
    staticB += sb; staticC += sc; motionB += db; motionC += dc;
    bDiffs.push(db); cDiffs.push(dc);
  }
  const usable = bDiffs.length;
  return {
    width, height, roi: [num(minX / width), num(minY / height),
      num(maxX / width), num(maxY / height)],
    tested: total, greyCandidates: considered, usable, rejectedStatic, rejectedMotion,
    maskCoverage: num(total ? usable / total : 0),
    baseline: {
      motion: num(usable ? motionB / usable : 0),
      static: num(usable ? staticB / usable : 0),
      excess: num(usable ? Math.max(0, (motionB - staticB) / usable) : 0),
      p95Motion: num(percentile(bDiffs, 0.95)),
    },
    candidate: {
      motion: num(usable ? motionC / usable : 0),
      static: num(usable ? staticC / usable : 0),
      excess: num(usable ? Math.max(0, (motionC - staticC) / usable) : 0),
      p95Motion: num(percentile(cDiffs, 0.95)),
    },
  };
}

export function classifyTemporalMetrics(cycles, settings = {}) {
  const valid = cycles.filter(c => c.usable >= (settings.minPixels ?? 1000) &&
    c.maskCoverage >= (settings.minCoverage ?? 0.035));
  const baseline = mean(valid.map(c => c.baseline.excess));
  const candidate = mean(valid.map(c => c.candidate.excess));
  const delta = candidate - baseline;
  const ratio = baseline > 0 ? candidate / baseline : null;
  const lower = valid.filter(c => c.candidate.excess < c.baseline.excess).length;
  const higher = valid.filter(c => c.candidate.excess > c.baseline.excess).length;
  const enough = valid.length >= (settings.minCycles ?? 12);
  const significant = Math.abs(delta) >= 0.3 && baseline > 0 &&
    Math.abs(delta / baseline) >= 0.15;
  const consensus = valid.length && Math.max(lower, higher) / valid.length >= 0.7;
  const status = !enough || baseline < 0.6 ? 'unverified'
    : significant && consensus && delta < 0 ? 'improved'
    : significant && consensus && delta > 0 ? 'regressed'
    : 'unchanged';
  return {
    status, validCycles: valid.length, totalCycles: cycles.length,
    baselineExcessMean: num(baseline), candidateExcessMean: num(candidate),
    delta: num(delta), ratio: ratio === null ? null : num(ratio),
    baselineStaticMean: num(mean(valid.map(c => c.baseline.static))),
    candidateStaticMean: num(mean(valid.map(c => c.candidate.static))),
    baselineP95Motion: num(percentile(valid.map(c => c.baseline.p95Motion), 0.95)),
    candidateP95Motion: num(percentile(valid.map(c => c.candidate.p95Motion), 0.95)),
    lowerCycles: lower, higherCycles: higher,
    note: 'Controlled micro-motion road-colour proxy, not a direct human perceptual judgement or proof of road geometry fidelity',
    limitation: 'Asphalt mask is colour-inferred; dynamic traffic/occlusion can remain. Physical GPU/phone and depth-buffer layer tests are separate.',
    reason: !enough ? 'too few stable colour-inferred road cycles'
      : baseline < 0.6 ? 'too little measurable baseline motion aliasing; cannot infer efficacy'
      : status === 'unchanged' ? 'difference is below meaningful amplitude/consensus threshold'
      : 'paired controlled AABB road-motion proxy with static-repeat negative controls',
  };
}

export function analyseComparison(root, manifest) {
  assert.equal(manifest.routeId, TEMPORAL_ROUTE_ID, 'wrong measurement route');
  const modeResults = [];
  for (const viewport of [...new Set(manifest.records.map(r => r.settings.viewport))]) {
    const b = manifest.records.find(r => r.variant === 'baseline' && r.settings.viewport === viewport);
    const c = manifest.records.find(r => r.variant === 'candidate' && r.settings.viewport === viewport);
    assert(b && c && b.shaderSha256 !== c.shaderSha256, 'both distinct shader variants required');
    assert.deepEqual(b.route, c.route, 'camera paths differ across variants');
    assert.deepEqual(b.settings, c.settings, 'capture settings differ across variants');
    assert(b.sampleImages.length >= 48 && b.sampleImages.length === b.route.length,
      'must save every frame of at least 48 steps');
    assert.deepEqual(
      b.route.map(p => [p.x, p.z, p.yawRad]),
      c.route.map(p => [p.x, p.z, p.yawRad]),
      'physical camera mismatch');
    const cycles = [];
    for (let start = 0; start < b.route.length; start += 4) {
      const poses = b.route.slice(start, start + 4);
      assert.equal(poses.length, 4, 'incomplete AABB cycle');
      assert.equal(poses[0].x, poses[1].x); assert.equal(poses[2].x, poses[3].x);
      assert.notEqual(poses[1].x, poses[2].x, 'no true micro camera movement');
      const read = record => record.sampleImages.slice(start, start + 4)
        .map(filename => decodePng(fs.readFileSync(path.join(root, filename))));
      cycles.push({ index: start / 4, ...measureCycle(read(b), read(c)) });
    }
    modeResults.push({ viewport, ...classifyTemporalMetrics(cycles), cycles });
  }
  const statuses = modeResults.map(x => x.status);
  const status = statuses.length >= 2 &&
    statuses.every(s => s === statuses[0]) && statuses[0] !== 'unverified'
    ? statuses[0] : 'unverified';
  return {
    task: 'NR-VQA-003', metricVersion: METRIC_VERSION, status,
    buildRevision: manifest.buildRevision, routeId: manifest.routeId,
    shaderSha256: manifest.shaderSha256, modes: modeResults,
    acceptance: 'never replace source hash, screenshot or WebGL existence with perceptual improvement proof',
    reason: status === 'unverified' ?
      'Insufficient or inconsistent desktop/emulated-mobile evidence. Shader effect must remain unverified.' :
      'Matched controlled micro-motion colour mask measurement; manual inspection still required before product quality claim.',
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--dir');
  assert(i >= 0 && process.argv[i + 1], 'usage: node temporal-flicker.mjs --dir test-results/narromine-temporal-qa');
  const root = path.resolve(process.argv[i + 1]);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'comparison.json'), 'utf8'));
  const report = analyseComparison(root, manifest);
  fs.writeFileSync(path.join(root, 'temporal-report.json'), JSON.stringify(report, null, 2) + '\n');
  for (const mode of report.modes) {
    fs.writeFileSync(path.join(root, 'temporal-' + mode.viewport + '.csv'),
      'cycle,usable,coverage,baselineMotion,baselineStatic,baselineExcess,candidateMotion,candidateStatic,candidateExcess\n' +
      mode.cycles.map(c => [c.index, c.usable, c.maskCoverage, c.baseline.motion, c.baseline.static,
        c.baseline.excess, c.candidate.motion, c.candidate.static, c.candidate.excess].join(',')).join('\n') + '\n');
    console.log('TEMPORAL ' + mode.viewport + ' ' + JSON.stringify({
      status: mode.status, valid: mode.validCycles, total: mode.totalCycles,
      base: mode.baselineExcessMean, candidate: mode.candidateExcessMean,
      ratio: mode.ratio, reason: mode.reason,
    }));
  }
  console.log('NR-VQA-003 verdict: ' + report.status + '. See temporal-report.json; manual review still required.');
}
