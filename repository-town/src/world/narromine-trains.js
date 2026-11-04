// Narromine railway in 3D: sleepers and two steel rails on every mapped OSM line, and a drivable
// grain train parked in Narromine yard. Track logic lives in narromine-rail-network.js.
//
// The train is an original, unbranded model of the kind of train that really works Narromine: a
// six-axle diesel-electric locomotive hauling covered grain hopper wagons (see the evidence notes in
// narromine-rail-network.js). No operator livery or trademark is copied.
import * as THREE from 'three';
import { RAIL } from './narromine-layout.js';
import { buildRailNetwork, createTrainPath, RAIL_GAUGE_M, RAIL_TOP_Y } from './narromine-rail-network.js';

const SLEEPER_SPACING = 0.68;   // concrete sleepers, ~1,470 per km
const LOCO = { length: 22, width: 2.95, height: 4.25 };
const HOPPER = { length: 15.5, width: 2.95, height: 3.9 };
const HOPPERS = 6;
const COUPLER_GAP = 1.0;
export const CONSIST_LENGTH = LOCO.length + HOPPERS * (HOPPER.length + COUPLER_GAP);
const ACCEL = 0.32, SERVICE_BRAKE = 0.55, EMERGENCY_BRAKE = 1.1, RESISTANCE = 0.03, REVERSE_MAX = 15 / 3.6;

function trackMeshes(parent) {
  const sleepers = [], rails = [];
  for (const way of RAIL) {
    let carry = 0;
    for (let i = 1; i < way.pts.length; i++) {
      const [ax, az] = way.pts[i - 1], [bx, bz] = way.pts[i], len = Math.hypot(bx - ax, bz - az);
      if (len < 0.01) continue;
      const yaw = -Math.atan2(bz - az, bx - ax);
      for (let d = carry; d < len; d += SLEEPER_SPACING) sleepers.push([ax + (bx - ax) * d / len, az + (bz - az) * d / len, yaw]);
      carry = (carry - len) % SLEEPER_SPACING; if (carry < 0) carry += SLEEPER_SPACING;
      rails.push({ ax, az, bx, bz, len, yaw });
    }
  }
  const sleeperMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.24, 0.16, 2.5),
    new THREE.MeshLambertMaterial({ color: 0x9a948a }), sleepers.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  sleepers.forEach(([x, z, yaw], i) => { q.setFromAxisAngle(up, yaw); m.compose(new THREE.Vector3(x, 0.255, z), q, one); sleeperMesh.setMatrixAt(i, m); });
  sleeperMesh.name = 'Narromine railway sleepers'; parent.add(sleeperMesh);
  // Both rails of every segment in one merged geometry (one draw call).
  const pos = [], idx = [];
  const half = RAIL_GAUGE_M / 2 + 0.035, w = 0.035, y0 = 0.335, y1 = RAIL_TOP_Y;
  for (const r of rails) {
    const ux = (r.bx - r.ax) / r.len, uz = (r.bz - r.az) / r.len, nx = -uz, nz = ux;
    for (const side of [-1, 1]) {
      const ox = nx * half * side, oz = nz * half * side, base = pos.length / 3;
      for (const [s, t] of [[-w, y0], [w, y0], [w, y1], [-w, y1]]) {
        pos.push(r.ax + ox + nx * s, t, r.az + oz + nz * s, r.bx + ox + nx * s, t, r.bz + oz + nz * s);
      }
      // 4 long faces (bottom, outer, top, inner) between consecutive corner pairs.
      for (let f = 0; f < 4; f++) { const a = base + f * 2, b = base + ((f + 1) % 4) * 2; idx.push(a, a + 1, b + 1, a, b + 1, b); }
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const railMesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x8a8d90, side: THREE.DoubleSide })); railMesh.name = 'Narromine railway rails';
  parent.add(railMesh);
  return { sleepers: sleepers.length, railSegments: rails.length };
}

function box(group, mat, w, h, d, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); group.add(m); return m; }
function bogies(group, length, mat) {
  for (const z of [-length / 2 + 2.6, length / 2 - 2.6]) {
    box(group, mat, 2.4, 0.55, 3.4, 0, RAIL_TOP_Y + 0.55, z);
    for (const dz of [-1.2, 0, 1.2]) for (const side of [-1, 1]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.14, 12), mat);
      wh.rotation.z = Math.PI / 2; wh.position.set(side * (RAIL_GAUGE_M / 2), RAIL_TOP_Y + 0.46, z + dz); group.add(wh);
    }
  }
}
// Local axes: forward is -z, so a car's group.rotation.y = -heading - PI/2 aims it along the track.
function locomotive() {
  const g = new THREE.Group(), L = LOCO.length;
  const body = new THREE.MeshLambertMaterial({ color: 0x2f3b45 }), stripe = new THREE.MeshLambertMaterial({ color: 0xf2c230 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1d1f22 }), glass = new THREE.MeshLambertMaterial({ color: 0x9fc3d4 });
  const deck = RAIL_TOP_Y + 1.25;
  box(g, dark, LOCO.width, 0.35, L, 0, deck, 0);                                   // underframe and walkway
  box(g, dark, 2.2, 0.9, 6, 0, deck - 0.6, 0);                                      // fuel tank
  box(g, body, 2.3, 2.6, L - 7.5, 0, deck + 1.47, 2.6);                             // long hood
  box(g, body, LOCO.width - 0.1, 2.75, 3.6, 0, deck + 1.55, -L / 2 + 4.6);           // cab
  box(g, glass, LOCO.width - 0.2, 0.85, 0.06, 0, deck + 2.25, -L / 2 + 2.78);        // windscreen
  box(g, body, LOCO.width - 0.3, 1.35, 2.0, 0, deck + 0.85, -L / 2 + 1.8);          // short nose
  box(g, stripe, LOCO.width - 0.28, 0.32, 0.04, 0, deck + 0.75, -L / 2 + 0.79);      // high-visibility nose band
  box(g, stripe, LOCO.width, 0.12, L, 0, deck + 0.2, 0);                             // yellow sole bar
  for (const side of [-1, 1]) box(g, stripe, 0.04, 0.05, L - 1, side * (LOCO.width / 2 - 0.05), deck + 1.1, 0); // handrails
  box(g, dark, 0.6, 0.4, 1.0, 0, deck + 2.95, 6);                                   // exhaust stack
  const lamp = new THREE.MeshLambertMaterial({ color: 0xfff4c8, emissive: 0xfff0b0, emissiveIntensity: 0.8 });
  for (const side of [-0.6, 0.6]) box(g, lamp, 0.25, 0.25, 0.06, side, deck + 1.35, -L / 2 + 0.78);
  bogies(g, L, dark);
  g.name = 'Narromine grain train locomotive';
  return g;
}
function hopper(n) {
  const g = new THREE.Group(), L = HOPPER.length, deck = RAIL_TOP_Y + 1.15;
  const shell = new THREE.MeshLambertMaterial({ color: n % 3 === 1 ? 0xb9b4a9 : 0xc8c3b6 }), dark = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  box(g, dark, HOPPER.width - 0.2, 0.3, L, 0, deck, 0);
  box(g, shell, HOPPER.width, 2.3, L - 1.4, 0, deck + 1.5, 0);                     // covered hopper body
  box(g, shell, HOPPER.width - 0.5, 0.25, L - 1.6, 0, deck + 2.75, 0);              // roof with hatches
  for (const z of [-L / 4, 0, L / 4]) box(g, shell, 1.4, 0.9, 1.6, 0, deck - 0.35, z); // discharge chutes
  bogies(g, L, dark);
  g.name = 'Narromine covered grain hopper';
  return g;
}

export function createNarromineTrains(parent) {
  const net = buildRailNetwork(RAIL), track = trackMeshes(parent);
  // Park facing south-east on the Narromine yard loop (OSM way 2), clear of the main line.
  const yard = RAIL[2].pts;
  const start = [];
  for (const p of yard) start.push(net.nodes.find(n => Math.hypot(n.x - p[0], n.z - p[1]) < 1.6).id);
  const lengths = start.slice(1).reduce((a, id, i) => a.concat(a[i] + Math.hypot(net.nodes[id].x - net.nodes[start[i]].x, net.nodes[id].z - net.nodes[start[i]].z)), [0]);
  const startS = Math.min(lengths.at(-1) - 5, CONSIST_LENGTH + 40);
  const path = createTrainPath(net, start, startS);
  const cars = [locomotive(), ...Array.from({ length: HOPPERS }, (_, i) => hopper(i))];
  const offsets = []; let off = 0;
  for (const c of cars) { const L = c === cars[0] ? LOCO.length : HOPPER.length; offsets.push([off, L]); off += L + COUPLER_GAP; parent.add(c); }
  let speed = 0, driving = false, pref = 'straight', message = '', penalty = false, horn = 0;
  function place() {
    const out = [];
    cars.forEach((c, i) => {
      const [o, L] = offsets[i], f = path.pointAt(path.s - o - 2.6), r = path.pointAt(path.s - o - L + 2.6), mid = path.pointAt(path.s - o - L / 2);
      const heading = Math.atan2(f.z - r.z, f.x - r.x);
      c.position.set(mid.x, 0, mid.z); c.rotation.y = -heading - Math.PI / 2;
      out.push({ x: mid.x, z: mid.z, heading, L });
    });
    return out;
  }
  let placed = place();
  const head = () => path.pointAt(path.s);
  function limitKmh() { const p = head(); return net.limitKmh(p.a, p.b); }
  // Collision: each car's true rotated outline, so the train blocks only where it is.
  function colliders() {
    return placed.map(({ x, z, heading, L }) => {
      const c = Math.cos(heading), s = Math.sin(heading), hw = LOCO.width / 2, hl = L / 2;
      const poly = [[hl, hw], [-hl, hw], [-hl, -hw], [hl, -hw]].map(([a, b]) => [x + a * c - b * s, z + a * s + b * c]);
      const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
      return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), poly, train: true };
    });
  }
  function cab() { const p = placed[0]; return { x: p.x + Math.cos(p.heading) * (LOCO.length / 2 - 4.6), z: p.z + Math.sin(p.heading) * (LOCO.length / 2 - 4.6), heading: p.heading }; }
  function near(pos, range = 5) { const c = cab(); return !driving && Math.hypot(pos.x - c.x, pos.z - c.z) < range; }
  function board() {
    driving = true; speed = 0; penalty = false; pref = 'straight';
    const p = head();
    return 'You are in the cab on the ' + net.lineName(p.a, p.b) + '. W/S or joystick forward/back: power and brake (hold back when stopped to reverse slowly). A/D or the junction buttons choose the route at the next junction. E to step down when stopped.';
  }
  function exit(player) {
    if (Math.abs(speed) > 0.3) return 'Stop the train completely before stepping down.';
    driving = false; speed = 0;
    const c = cab(), side = 3.2, nx = -Math.sin(c.heading), nz = Math.cos(c.heading);
    player?.place(c.x + nx * side, c.z + nz * side, 0);
    return 'Handbrake applied. You stepped down from the locomotive beside the track.';
  }
  function setRoute(p) { pref = p; message = 'Next junction: ' + (p === 'straight' ? 'straight on' : 'take the ' + p); return message; }
  function update(dt, input) {
    if (driving && input) {
      const m = input.movement(); input.takeLook();
      if (m.x < -0.5) setRoute('left'); else if (m.x > 0.5) setRoute('right');
      const thr = -m.z, limit = limitKmh() / 3.6;
      if (penalty) { speed = Math.max(0, speed - EMERGENCY_BRAKE * dt); if (speed === 0) { penalty = false; message = 'Train stopped. Penalty brake released.'; } }
      else if (speed > 0.05 || (speed >= -0.05 && thr > 0)) {
        if (thr > 0) speed += thr * ACCEL * dt; else if (thr < 0) speed = Math.max(0, speed + thr * SERVICE_BRAKE * dt);
        else speed = Math.max(0, speed - RESISTANCE * dt);
      } else if (speed <= 0.05) {          // stopped or reversing: back = slow reverse, forward = brake
        if (thr < 0) speed = Math.max(-REVERSE_MAX, speed + thr * ACCEL * 0.5 * dt);
        else speed = Math.min(0, speed + (thr > 0 ? SERVICE_BRAKE : RESISTANCE) * dt);
      }
      // Train protection: a penalty brake applies well over the limit, as on real Australian lines.
      if (speed > limit + 15 / 3.6 && !penalty) { penalty = true; message = 'Overspeed! Penalty brake applied. Limit ' + Math.round(limit * 3.6) + ' km/h.'; }
      else if (speed > limit + 2 / 3.6 && !penalty) message = 'Over the ' + Math.round(limit * 3.6) + ' km/h limit — ease off.';
    }
    if (Math.abs(speed) > 0.001) {
      const r = path.move(speed * dt, CONSIST_LENGTH, pref);
      if (r.junction && pref !== 'straight') pref = 'straight';
      if (r.blocked) { speed = 0; message = r.blocked === 'end' ? 'End of the line: buffer stop ahead. Reverse to continue.' : 'The rear of the train reached the end of the track.'; }
      placed = place();
    }
    if (horn > 0) horn -= dt;
    return driving;
  }
  function state() {
    const p = head();
    return { driving, speedKmh: Math.round(speed * 3.6), limitKmh: limitKmh(), route: pref, line: net.lineName(p.a, p.b),
      head: { x: p.x, z: p.z }, cab: cab(), cars: cars.length, length: Math.round(CONSIST_LENGTH), track, penalty };
  }
  return {
    update, board, exit, near, cab, colliders, setRoute, state,
    sound() { horn = 1.2; return 'Horn: two long blasts.'; },
    get driving() { return driving; }, get message() { return message; }, clearMessage() { message = ''; },
    network: net,
  };
}
