import * as THREE from 'three';

// People: house residents who wander their Repository Archive, and villagers who walk
// the town between houses. Both stop and turn to face the player who comes to talk.
const SKIN = [0xe2b48c, 0xc68e63, 0x8d5a3b, 0xf1c9a5, 0xa8714a];
const HAIR = [0x3b2a1e, 0x1d1d1d, 0x8a5a2b, 0xd8b26a, 0x6b3a2a, 0x9a9a9a];
const mats = new Map();
const mat = (c) => { if (!mats.has(c)) mats.set(c, new THREE.MeshLambertMaterial({ color: c })); return mats.get(c); };
const BOX = new THREE.BoxGeometry(1, 1, 1);
const BALL = new THREE.SphereGeometry(1, 10, 7);

function part(geo, color, sx, sy, sz, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat(color));
  m.scale.set(sx, sy, sz); m.position.set(x, y, z);
  parent.add(m);
  return m;
}

// A jointed figure: legs and arms hang from pivots so they can swing while walking.
export function makePerson(seed, shirt, trousers) {
  const g = new THREE.Group();
  const skin = SKIN[seed % SKIN.length], hair = HAIR[(seed >> 2) % HAIR.length];
  const limb = (x, y, color, len, w) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0); g.add(pivot);
    part(BOX, color, w, len, w, 0, -len / 2, 0, pivot);
    return pivot;
  };
  const legs = [limb(-0.11, 0.82, trousers, 0.8, 0.16), limb(0.11, 0.82, trousers, 0.8, 0.16)];
  part(BOX, shirt, 0.46, 0.62, 0.26, 0, 1.12, 0, g);
  const arms = [limb(-0.31, 1.4, shirt, 0.56, 0.12), limb(0.31, 1.4, shirt, 0.56, 0.12)];
  for (const a of arms) part(BALL, skin, 0.065, 0.065, 0.065, 0, -0.6, 0, a);
  const head = new THREE.Group(); head.position.set(0, 1.68, 0); g.add(head);
  part(BALL, skin, 0.17, 0.17, 0.17, 0, 0, 0, head);
  part(BALL, hair, 0.175, 0.1, 0.175, 0, 0.08, -0.02, head);
  for (const x of [-0.06, 0.06]) part(BALL, 0x1d1d1d, 0.025, 0.025, 0.025, x, 0.02, 0.155, head);
  return { group: g, legs, arms, head };
}

// Shared walking behaviour: follow waypoints, pause, look around; stop for the player.
export class Walker {
  constructor(person, pos, { speed = 1.3, name } = {}) {
    Object.assign(this, person);
    this.pos = pos;                 // shared with the interactable, so prompts follow the walker
    this.speed = speed; this.name = name;
    this.path = []; this.wait = 1 + Math.random() * 3; this.phase = Math.random() * 10;
    this.heading = Math.random() * Math.PI * 2; this.talking = false;
    this.group.position.copy(pos);
  }

  update(dt, t, player, planNext) {
    const toPlayer = Math.hypot(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
    const engaged = this.talking || toPlayer < 2.8;
    // The name tag would fill the screen up close; the on-screen prompt names them instead.
    if (this.tag) this.tag.visible = toPlayer > 3;
    let moving = false;
    if (engaged) {
      // Turn to face the visitor and wait.
      this.turnTo(Math.atan2(player.pos.x - this.pos.x, player.pos.z - this.pos.z), dt * 4);
    } else if (this.wait > 0) {
      this.wait -= dt;
      // Idle: glance around now and then.
      this.head.rotation.y = Math.sin(t * 0.7 + this.phase) * 0.5;
    } else if (this.path.length) {
      const target = this.path[0];
      const dx = target.x - this.pos.x, dz = target.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.15) { this.path.shift(); if (target.pause) this.wait = target.pause; }
      else {
        const step = Math.min(d, this.speed * dt);
        this.pos.x += (dx / d) * step; this.pos.z += (dz / d) * step;
        this.turnTo(Math.atan2(dx, dz), dt * 6);
        moving = true;
      }
    } else {
      this.path = planNext(this) || [];
      if (!this.path.length) this.wait = 2 + Math.random() * 4;
    }
    // Limbs swing while walking and settle when standing.
    const swing = moving ? Math.sin(t * 7 + this.phase) * 0.55 : 0;
    const ease = (r, v) => r + (v - r) * Math.min(1, dt * 10);
    this.legs[0].rotation.x = ease(this.legs[0].rotation.x, swing);
    this.legs[1].rotation.x = ease(this.legs[1].rotation.x, -swing);
    this.arms[0].rotation.x = ease(this.arms[0].rotation.x, -swing * 0.8);
    this.arms[1].rotation.x = ease(this.arms[1].rotation.x, swing * 0.8);
    if (moving || engaged) this.head.rotation.y = ease(this.head.rotation.y, 0);
    this.group.position.set(this.pos.x, moving ? Math.abs(Math.sin(t * 7 + this.phase)) * 0.04 : 0, this.pos.z);
    this.group.rotation.y = this.heading;
  }

  turnTo(angle, rate) {
    let diff = angle - this.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.heading += diff * Math.min(1, rate);
  }
}

// Moves a person standing too close to furniture onto the nearest clear floor.
export function freeSpot(pos, world, r = 0.4) {
  if (!world.hits(pos.x, pos.z, r)) return pos;
  for (let ring = 0.3; ring <= 3; ring += 0.3) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x = pos.x + Math.cos(a) * ring, z = pos.z + Math.sin(a) * ring;
      if (!world.hits(x, z, r)) { pos.x = x; pos.z = z; return pos; }
    }
  }
  return pos;
}

// Indoor plan: wander to free points in the walker's own room, checking the way is clear.
export function roomWander(room, world) {
  return (w) => {
    for (let tries = 0; tries < 12; tries++) {
      const x = room.x0 + 1.1 + Math.random() * (room.x1 - room.x0 - 2.2);
      const z = room.z0 + 1.1 + Math.random() * (room.z1 - room.z0 - 2.2);
      const d = Math.hypot(x - w.pos.x, z - w.pos.z);
      if (d < 1.5) continue;
      let clear = true;
      for (let s = 0.4; s <= d && clear; s += 0.4) clear = !world.hits(w.pos.x + (x - w.pos.x) * (s / d), w.pos.z + (z - w.pos.z) * (s / d), 0.35);
      if (clear && !world.hits(x, z, 0.35)) return [{ x, z, pause: 2 + Math.random() * 5 }];
    }
    return [];
  };
}

// Town plan: from wherever the villager is, walk to the sidewalk, along it (via the
// nearest avenue when changing street) to another house's front path, and visit.
export function townRoutes(lots, LOT_Z) {
  const doors = [...lots.values()].map((l) => ({ coord: l.house.coordinate, x: l.doorPos.x, z: l.doorPos.z, row: l.lot.row }));
  const sidewalk = (row) => row * LOT_Z - 3.5 * LOT_Z + 16 - 5.3;
  const avenues = [-338, -208, -78, 52, 182, 312];
  return (w) => {
    const near = doors.filter((d) => Math.abs(d.row - w.row) <= 1 && d.coord !== w.at);
    const to = near[Math.floor(Math.random() * near.length)];
    if (!to) return [];
    const path = [];
    const sw = sidewalk(w.row);
    path.push({ x: w.pos.x, z: sw });
    if (to.row !== w.row) {
      const ave = avenues.reduce((a, b) => (Math.abs(b - w.pos.x) < Math.abs(a - w.pos.x) ? b : a));
      path.push({ x: ave, z: sw }, { x: ave, z: sidewalk(to.row) });
    }
    if (Math.random() < 0.35) path.push({ x: (path.at(-1).x + to.x) / 2, z: sidewalk(to.row), pause: 2 + Math.random() * 3 });
    path.push({ x: to.x, z: sidewalk(to.row) }, { x: to.x, z: to.z + 1.6, pause: 5 + Math.random() * 9 });
    w.row = to.row; w.at = to.coord;
    return path;
  };
}
