// Automatic drivetrain for the player's car: engine revs follow road speed through the selected
// gear, final drive and tyre size, with a torque converter that lets revs rise above that at low
// speed; the gearbox shifts up on revs (later under more throttle, as kick-down logic does) and
// down when revs fall. Pure logic, no three.js or audio: player-driving.js steps it, the dashboard
// shows it and engine-audio.js voices it. Figures are typical of each class, not one vehicle.
export const DRIVETRAINS = Object.freeze({
  hatch:  { fuel: 'petrol', cylinders: 4, idle: 780, redline: 6200, ratios: [3.31, 1.84, 1.24, 0.92, 0.72], final: 4.06, tyreRadius: 0.30 },
  sedan:  { fuel: 'petrol', cylinders: 4, idle: 750, redline: 6000, ratios: [3.54, 2.06, 1.40, 1.00, 0.71], final: 3.72, tyreRadius: 0.32 },
  ute:    { fuel: 'diesel', cylinders: 4, idle: 720, redline: 4200, ratios: [3.73, 2.05, 1.36, 1.00, 0.82], final: 3.73, tyreRadius: 0.38 },
  van:    { fuel: 'diesel', cylinders: 4, idle: 700, redline: 4200, ratios: [4.17, 2.34, 1.52, 1.14, 0.87], final: 3.92, tyreRadius: 0.34 },
  truck:  { fuel: 'diesel', cylinders: 6, idle: 600, redline: 2800, ratios: [6.0, 3.4, 2.1, 1.4, 1.0], final: 4.63, tyreRadius: 0.48 },
});
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function drivetrainFor(model) { return DRIVETRAINS[model] || DRIVETRAINS.hatch; }

// Revs the road drives the engine at in a gear (no slip).
export function roadRpm(spec, speedMs, gear) {
  const wheelRpm = Math.abs(speedMs) / (2 * Math.PI * spec.tyreRadius) * 60;
  return wheelRpm * spec.ratios[gear - 1] * spec.final;
}

// One step. state: { gear, rpm, shiftTimer }. throttle 0..1 (accelerator), reverse when speed < 0.
export function stepDrivetrain(spec, state, speedMs, throttle, dt) {
  const s = { gear: state?.gear || 1, rpm: state?.rpm || spec.idle, shiftTimer: Math.max(0, (state?.shiftTimer || 0) - dt), shifted: 0 };
  const t = clamp(throttle, 0, 1), reverse = speedMs < -0.05;
  if (reverse) s.gear = 1;
  // Light throttle shifts early, full throttle holds the gear to 40% of redline: town cars top out
  // near 45 km/h, so this keeps the box working through 1st-3rd rather than sitting in 1st.
  const upAt = spec.idle * 2.3 + (spec.redline * 0.4 - spec.idle * 2.3) * t;
  const downAt = spec.idle * 1.45 + spec.idle * 0.9 * t;
  if (!reverse && s.shiftTimer === 0) {
    if (s.gear < spec.ratios.length && roadRpm(spec, speedMs, s.gear) > upAt) { s.gear++; s.shiftTimer = 0.45; s.shifted = 1; }
    else if (s.gear > 1 && roadRpm(spec, speedMs, s.gear) < downAt) { s.gear--; s.shiftTimer = 0.35; s.shifted = -1; }
  }
  // Torque converter: at low road speed the engine can run up towards a stall speed with throttle.
  const stall = spec.idle + (spec.redline * 0.38 - spec.idle) * t;
  const coupled = roadRpm(spec, speedMs, s.gear);
  // Converter slip fades out as road speed rises (locked up by about 25 km/h).
  const slip = spec.idle + (stall - spec.idle) * clamp(1 - Math.abs(speedMs) / 7, 0, 1);
  const target = clamp(Math.max(coupled, slip), spec.idle, spec.redline);
  // Revs dip during a shift, then the engine catches up; free revving is quick, load slows it.
  s.rpm = s.rpm + (target - s.rpm) * Math.min(1, dt * (s.shiftTimer > 0.2 ? 4 : 9));
  s.load = clamp(t * 0.85 + (Math.abs(speedMs) > 0.3 ? 0.15 : 0), 0, 1);
  return s;
}
