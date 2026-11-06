// NR-VQA-005 source-contract checks run before expensive real WebGL captures.
// No production sources or geometry may be written by the QA harness.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ABLATION_LAYERS, ablateNarromineSource, ablateSurfaceShader,
  ablationVerdict, pixelDifference } from '../tools/narromine-visual-qa/layer-ablation.mjs';
import { deflateSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/world/narromine.js'), 'utf8');
const shader = fs.readFileSync(path.join(root, 'src/world/narromine-surface-materials.js'), 'utf8');
assert.equal(ABLATION_LAYERS.length, 7);
assert.equal(ablateNarromineSource(source, 'normal'), source);
assert.equal(ablateNarromineSource(source, 'reference-repeat'), source);
assert.equal(ablateSurfaceShader(shader, 'normal'), shader);
for (const layer of ABLATION_LAYERS.filter(x => !['normal', 'reference-repeat'].includes(x))) {
  const w = ablateNarromineSource(source, layer);
  const s = ablateSurfaceShader(shader, layer);
  assert(w !== source || s !== shader, 'layer must alter only the isolated source');
  assert(w.includes('buildDisjointRoadSurfaces'), 'original world build preserved');
  assert.equal(s.includes('narromine-world-surface-v2'), true);
}
const asphalt = ablateNarromineSource(source, 'asphalt');
assert(!asphalt.includes('for (const s of roadSurfaces.asphalt) flatPoly'), 'road layer was removed');
assert(!asphalt.includes('for (const s of roadSurfaces.fillets) flatPoly'), 'kerb asphalt was removed');
assert(ablateNarromineSource(source, 'paint').includes('if (false) { // QA: all generated/mapped road paint hidden'));
assert(ablateNarromineSource(source, 'footpaths').includes('if (false) { // QA: mapped footway ablation'));
assert(!ablateNarromineSource(source, 'terrain').includes('box(0xa3b07a, REGION.x1'));
const flat = ablateSurfaceShader(shader, 'noise');
assert(flat.includes('float nrFilteredNoise(vec2 p) { return 0.5; }'));
assert(shader.includes('float pixelFootprint = max(fwidth(p.x), fwidth(p.y));'));
assert.throws(() => ablateNarromineSource(source, 'invented'), /unknown/);
assert.throws(() => ablateSurfaceShader(shader, 'invented'), /unknown/);
assert.throws(() => ablateNarromineSource('foo', 'asphalt'), /marker/);
assert.equal(ablationVerdict({ roadRegionChangedPct: 3 },
  { roadRegionChangedPct: 40 }).status, 'visible-effect');
assert.equal(ablationVerdict({ roadRegionChangedPct: 3 },
  { roadRegionChangedPct: 4 }).status, 'review-required');

// Decode actual PNG bytes with the exact same screenshot comparison path.
function crc32(b) { let c = -1; for (const v of b) {
  c ^= v; for (let i = 0; i < 8; i++) c = c & 1 ? c >>> 1 ^ 0xedb88320 : c >>> 1;
} return (c ^ -1) >>> 0; }
function chunk(t, data) {
  const label = Buffer.from(t), len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([label, data])));
  return Buffer.concat([len, label, data, crc]);
}
function png(color) {
  const w = 64, h = 64, header = Buffer.alloc(13), rows = Buffer.alloc(h * (1 + w * 4));
  header.writeUInt32BE(w); header.writeUInt32BE(h, 4); header[8] = 8; header[9] = 6;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * (1 + w * 4) + 1 + x * 4;
    rows[i] = color; rows[i + 1] = color; rows[i + 2] = color; rows[i + 3] = 255;
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
const diff = pixelDifference(png(60), png(75));
assert.equal(diff.wholeChangedPct, 100);
assert.equal(diff.roadRegionChangedPct, 100);
const unchanged = pixelDifference(png(60), png(60));
assert.equal(unchanged.wholeChangedPct, 0);
assert.equal(unchanged.roadRegionChangedPct, 0);
assert.equal(unchanged.roadRegionAnyChangedPct, 0);
assert.equal(unchanged.roadMeanMaxChannelDelta, 0);
const subPixel = pixelDifference(png(60), png(61));
assert.equal(subPixel.roadRegionChangedPct, 0, '3-level significance threshold is unchanged');
assert.equal(subPixel.roadRegionAnyChangedPct, 100,
  'low-amplitude 1-level shader variations must remain visible in report');
assert.equal(subPixel.roadMeanMaxChannelDelta, 1);
assert.equal(subPixel.roadMaximumDelta, 1);
console.log('PASS NR-VQA-005: exact isolated layer source markers, unchanged normal source, screenshot pixel metrics and no threshold weakening');
