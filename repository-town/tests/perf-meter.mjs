// Performance readout maths (src/ui/perf-meter.js): average fps, the "1% low", hitches over 50 ms
// and the Smooth / Playable / Stutters verdict shown after the 30-second phone check.
//   node tests/perf-meter.mjs
import assert from 'node:assert/strict';
import { frameStats, perfVerdict } from '../src/ui/perf-meter.js';

const steady = Array(1800).fill(1000 / 60);
let s = frameStats(steady);
assert(Math.abs(s.fps - 60) < 0.01 && Math.abs(s.low1 - 60) < 0.01 && s.stutters === 0 && Math.abs(s.seconds - 30) < 0.01);
assert.equal(perfVerdict(s), 'Smooth');
// The same average with a hitch every two seconds: the 1% low and the hitch count expose it.
const hitchy = steady.map((t, i) => (i % 120 === 0 ? 120 : t));
s = frameStats(hitchy);
assert(s.fps > 55 && s.low1 < 15 && s.stutters === 15 && s.worst === 120);
assert.equal(perfVerdict(s), 'Stutters');
assert.equal(perfVerdict(frameStats(Array(1000).fill(30))), 'Playable');   // a steady 33 fps
assert.deepEqual(frameStats([]), { fps: 0, low1: 0, p95: 0, worst: 0, stutters: 0, seconds: 0 });
console.log('PASS: perf readout: fps, 1% low, hitches and Smooth/Playable/Stutters verdict');
