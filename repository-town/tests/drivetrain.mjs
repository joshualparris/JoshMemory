// Automatic drivetrain: revs follow road speed through gear, final drive and tyre size; the box
// shifts up through the gears as the car accelerates (later with more throttle), revs fall at each
// upshift, it shifts down as the car slows, and diesels rev lower than petrols.
//   node tests/drivetrain.mjs
import assert from 'node:assert/strict';
import { DRIVETRAINS, drivetrainFor, roadRpm, stepDrivetrain } from '../src/world/drivetrain.js';

const sedan = drivetrainFor('sedan');
// 50 km/h in top gear on a 0.32 m tyre: wheel ~414 rpm × 0.71 × 3.72 ≈ 1095 rpm.
assert(Math.abs(roadRpm(sedan, 50 / 3.6, 5) - 1094) < 5, 'road rpm from speed, ratio, final drive and tyre');

function accelerate(spec, throttle, seconds, accel = 2.5) {
  let s = null, v = 0; const trace = [];
  for (let t = 0; t < seconds; t += 1 / 60) { v = Math.min(v + accel / 60, 30); s = stepDrivetrain(spec, s, v, throttle, 1 / 60); trace.push({ v, ...s }); }
  return trace;
}
const firm = accelerate(sedan, 0.3, 14), light = accelerate(sedan, 0.1, 14), full = accelerate(sedan, 1, 14);
const gears = [...new Set(full.map((x) => x.gear))];
assert.deepEqual(gears, [1, 2, 3, 4, 5], 'shifts up through every gear in order');
const shiftSpeed = (trace, g) => trace.find((x) => x.gear === g).v;
assert(shiftSpeed(light, 2) < shiftSpeed(firm, 2) && shiftSpeed(firm, 2) < shiftSpeed(full, 2), 'more throttle holds each gear longer');
for (let i = 1; i < full.length; i++) if (full[i].shifted === 1) {
  const before = full[i - 1].rpm, after = full.slice(i, i + 30).reduce((m, x) => Math.min(m, x.rpm), Infinity);
  assert(after < before - 300, `revs drop after the upshift into ${full[i].gear} (${Math.round(before)} -> ${Math.round(after)})`);
}
assert(firm.every((x) => x.rpm >= sedan.idle - 1 && x.rpm <= sedan.redline), 'revs stay between idle and redline');
// Torque converter: standing still with throttle the engine runs above idle, not at zero.
const held = stepDrivetrain(sedan, { gear: 1, rpm: sedan.idle }, 0, 1, 1);
assert(held.rpm > sedan.idle + 400 && held.gear === 1, 'stalled converter lets revs rise at a standstill');
// Town cars top out near 45 km/h: full throttle reaches 3rd by then.
assert(full.find((x) => x.v >= 12.5).gear >= 3, 'third gear by 45 km/h at full throttle');
// Slowing down shifts back down.
let s = full.at(-1); for (let v = 30; v > 0.5; v -= 0.1) s = stepDrivetrain(sedan, s, v, 0, 1 / 30);
assert.equal(s.gear, 1, 'shifts back down to first as the car stops');
// Reverse uses first gear's ratio; diesels idle and redline lower.
assert.equal(stepDrivetrain(sedan, { gear: 3, rpm: 2000 }, -2, 0.5, 0.1).gear, 1, 'reverse');
assert(DRIVETRAINS.truck.redline < DRIVETRAINS.sedan.redline && DRIVETRAINS.truck.idle < DRIVETRAINS.sedan.idle, 'diesel truck revs lower');
assert.equal(drivetrainFor('unknown'), DRIVETRAINS.hatch);
console.log(`PASS: drivetrain shifts 1-5 (2nd at ${(shiftSpeed(light, 2) * 3.6).toFixed(0)} / ${(shiftSpeed(firm, 2) * 3.6).toFixed(0)} / ${(shiftSpeed(full, 2) * 3.6).toFixed(0)} km/h light / moderate / full), revs drop on upshift, converter, downshift, reverse`);
