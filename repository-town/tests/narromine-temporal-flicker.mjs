// NR-VQA-003 independent numerical/decoder contract (no fake browser evidence).
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { decodePng, measureCycle, classifyTemporalMetrics } from '../tools/narromine-visual-qa/temporal-flicker.mjs';
import { TEMPORAL_ROUTE_ID, locateCameraRoute, cameraRoute } from '../tools/narromine-visual-qa/compare-video.mjs';

function crc32(buffer) {
  let c = -1;
  for (const x of buffer) {
    c ^= x;
    for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ -1) >>> 0;
}
function chunk(type, payload) {
  const t = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(payload.length); crc.writeUInt32BE(crc32(Buffer.concat([t, payload])));
  return Buffer.concat([length, t, payload, crc]);
}
function makeFrame(shade, width = 256, height = 256) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6; // 8-bit RGBA, no interlace
  const scan = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const start = y * (1 + width * 4);
    for (let x = 0; x < width; x++) {
      const i = start + 1 + x * 4;
      scan[i] = shade; scan[i + 1] = shade; scan[i + 2] = shade; scan[i + 3] = 255;
    }
  }
  return decodePng(Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scan)),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}

const dark = makeFrame(72);
const bright = makeFrame(84);
const filtered = makeFrame(75);
assert.equal(dark.width, 256); assert.equal(dark.height, 256);
assert.deepEqual([...dark.data.subarray(0, 4)], [72, 72, 72, 255]);

const cycle = measureCycle([dark, dark, bright, bright], [dark, dark, filtered, filtered]);
assert(cycle.usable >= 1000, 'expected sufficient neutral road mask');
assert.equal(cycle.baseline.motion, 12);
assert.equal(cycle.candidate.motion, 3);
assert.equal(cycle.baseline.static, 0);
assert.equal(cycle.candidate.static, 0);
assert.equal(classifyTemporalMetrics(Array.from({ length: 16 }, () => cycle)).status, 'improved');
assert.equal(classifyTemporalMetrics([cycle]).status, 'unverified', 'too few cycles MUST be unverified');

const noEffect = measureCycle([dark, dark, dark, dark], [dark, dark, dark, dark]);
assert.equal(classifyTemporalMetrics(Array.from({ length: 16 }, () => noEffect)).status,
  'unverified', 'zero baseline signal MUST NOT claim fix works');
const worse = measureCycle([dark, dark, filtered, filtered], [dark, dark, bright, bright]);
assert.equal(classifyTemporalMetrics(Array.from({ length: 16 }, () => worse)).status, 'regressed');
const movingTraffic = measureCycle([dark, bright, dark, dark], [dark, bright, dark, dark]);
assert.equal(movingTraffic.usable, 0, 'changes during repeated pose must be masked');
assert.equal(classifyTemporalMetrics(Array.from({ length: 16 }, () => movingTraffic)).status, 'unverified');

const loc = locateCameraRoute(TEMPORAL_ROUTE_ID);
assert(loc);
const poses = cameraRoute(loc, 72);
assert.equal(poses.length, 72);
for (let i = 0; i < poses.length; i += 4) {
  assert.equal(poses[i].x, poses[i + 1].x);
  assert.equal(poses[i + 2].x, poses[i + 3].x);
  assert.notEqual(poses[i + 1].x, poses[i + 2].x);
  assert.equal(poses[i].z, poses[i + 3].z);
  assert.equal(poses[i].pitchRad, poses[i + 3].pitchRad);
}
assert.throws(() => cameraRoute(loc, 35), /four-frame/);
console.log('PASS NR-VQA-003: lossless PNG decoder, camera AABB motion, static negative control, quantitative verdict gates');
