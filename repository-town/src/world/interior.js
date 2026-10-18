import * as THREE from 'three';
import { Builder } from './builder.js';
import { PROPS } from './props.js';

const WALL_T = 0.2, DOOR_W = 1.6, DOOR_H = 2.5, ROOM_SCALE = 0.82;
const ART = [0xc8553d, 0x2e86ab, 0xf2a541, 0x5b8e7d, 0x8e5572, 0x3d5a80, 0xe0a458, 0x6b8f71];
// Props that read best in open floor space rather than against a wall.
const CENTRE = new Set(['table', 'roundTable', 'rug', 'chessboard', 'mapTable', 'diceTable', 'hologram', 'cafeTable', 'pond', 'sandpit',
  'campfire', 'fruitBowl', 'boardGame', 'cardTable', 'planetModel', 'reactor', 'cauldron', 'giraffe', 'horse', 'globe', 'tree', 'statue',
  'crystal', 'robot', 'robotArm', 'spaceship', 'drone', 'microscope', 'circuitBoard', 'oscilloscope', 'coinStack', 'well', 'tent',
  'wagon', 'monkey', 'smallCreature', 'treasureChest', 'cryoPod', 'printer3d', 'trophy', 'telescope', 'yogaMat', 'treadmill', 'pews',
  'rock', 'hay', 'mushroom', 'truck', 'van', 'bicycle', 'trolley', 'toyBlocks', 'rockingHorse', 'balloons', 'anvil', 'sofa', 'pinball', 'laptop', 'stool', 'chair', 'bench', 'drone']);

// Rooms are placed as rectangles; `parent` is the room each one opens into.
function placeRooms(rooms, layout) {
  // Briefs give generous sizes; rooms are built at 82% so props fill the space without crowding.
  const R = rooms.map((r) => ({ ...r, w: Math.max(6, (r.w || 8) * ROOM_SCALE), d: Math.max(6, (r.d || 8) * ROOM_SCALE) }));
  const put = (r, x0, z0) => { r.x0 = x0; r.z0 = z0; r.x1 = x0 + r.w; r.z1 = z0 + r.d; };
  const r0 = R[0];
  put(r0, -r0.w / 2, -r0.d); r0.parent = -1;
  if (layout === 'row') {
    let right = r0.x1, left = r0.x0, lastR = 0, lastL = 0;
    R.slice(1).forEach((r, k) => {
      const i = k + 1;
      if (k % 2 === 0) { put(r, right, -r.d); right = r.x1; r.parent = lastR; lastR = i; }
      else { put(r, left - r.w, -r.d); left = r.x0; r.parent = lastL; lastL = i; }
    });
  } else if (layout === 'deep') {
    let back = r0.z0;
    R.slice(1).forEach((r, k) => { put(r, -r.w / 2, back - r.d); back = r.z0; r.parent = k; });
  } else if (layout === 'hub') {
    const spots = [(r) => put(r, r0.x0 - r.w, r0.z0 + (r0.d - r.d) / 2), (r) => put(r, r0.x1, r0.z0 + (r0.d - r.d) / 2), (r) => put(r, -r.w / 2, r0.z0 - r.d)];
    R.slice(1).forEach((r, k) => {
      if (k < 3) { spots[k](r); r.parent = 0; }
      else { const p = R[3]; put(r, k === 3 ? p.x0 - r.w : p.x1, p.z0 + (p.d - r.d) / 2); r.parent = 3; }
    });
  } else if (layout === 'grid') {
    const cols = R.length > 4 ? 3 : 2;
    const cw = [], rd = [];
    R.forEach((r, i) => { const c = i % cols, row = Math.floor(i / cols); cw[c] = Math.max(cw[c] || 0, r.w); rd[row] = Math.max(rd[row] || 0, r.d); });
    const total = cw.reduce((a, v) => a + v, 0);
    R.forEach((r, i) => {
      const c = i % cols, row = Math.floor(i / cols);
      const x = -total / 2 + cw.slice(0, c).reduce((a, v) => a + v, 0) + (cw[c] - r.w) / 2;
      const z = -rd.slice(0, row + 1).reduce((a, v) => a + v, 0);
      put(r, x, z); r.parent = i === 0 ? -1 : c > 0 ? i - 1 : i - cols;
    });
    // Grid rooms may not be exactly adjacent when sizes differ; snap by stretching to column/row cells.
    R.forEach((r, i) => {
      const c = i % cols, row = Math.floor(i / cols);
      r.x0 = -total / 2 + cw.slice(0, c).reduce((a, v) => a + v, 0); r.x1 = r.x0 + cw[c]; r.w = cw[c];
      r.z1 = -rd.slice(0, row).reduce((a, v) => a + v, 0); r.z0 = r.z1 - rd[row]; r.d = rd[row];
    });
  } else if (layout === 'L') {
    R.slice(1).forEach((r, k) => {
      const p = R[k];
      if (k === 0) put(r, p.x0 + (p.w - r.w) / 2, p.z0 - r.d); else put(r, p.x1, p.z0 + (p.d - r.d) / 2);
      r.parent = k;
    });
  } else if (layout === 'gallery') {
    let zl = r0.z1, zr = r0.z1;
    R.slice(1).forEach((r, k) => {
      if (k % 2 === 0) { put(r, r0.x1, zr - r.d); zr = r.z0; } else { put(r, r0.x0 - r.w, zl - r.d); zl = r.z0; }
      r.parent = 0;
    });
    const need = Math.min(zl, zr);
    if (need < r0.z0) { r0.z0 = need; r0.d = r0.z1 - r0.z0; }
  } else throw new Error('Unknown layout ' + layout);
  return R;
}

// Finds the shared wall between two rooms and returns a doorway centre on it.
function sharedOpening(a, b) {
  const ox0 = Math.max(a.x0, b.x0), ox1 = Math.min(a.x1, b.x1), oz0 = Math.max(a.z0, b.z0), oz1 = Math.min(a.z1, b.z1);
  const eps = 0.01;
  if (Math.abs(a.x1 - b.x0) < eps || Math.abs(b.x1 - a.x0) < eps) {
    if (oz1 - oz0 < DOOR_W + 0.6) return null;
    return { axis: 'x', at: Math.abs(a.x1 - b.x0) < eps ? a.x1 : a.x0, c: (oz0 + oz1) / 2 };
  }
  if (Math.abs(a.z1 - b.z0) < eps || Math.abs(b.z1 - a.z0) < eps) {
    if (ox1 - ox0 < DOOR_W + 0.6) return null;
    return { axis: 'z', at: Math.abs(a.z1 - b.z0) < eps ? a.z1 : a.z0, c: (ox0 + ox1) / 2 };
  }
  return null;
}

// Wall along one edge of a room with doorway gaps. Collision gets the solid pieces only.
const SKIRT = 0x5a4a3c;
function wall(b, colliders, axis, at, from, to, h, color, openings) {
  const cuts = openings.filter((o) => o.axis === axis && Math.abs(o.at - at) < 0.01 && o.c - DOOR_W / 2 > from && o.c + DOOR_W / 2 < to).map((o) => [o.c - DOOR_W / 2, o.c + DOOR_W / 2]).sort((p, q) => p[0] - q[0]);
  let cursor = from;
  const seg = (s, e, y0, y1) => {
    if (e - s < 0.01) return;
    const len = e - s, mid = (s + e) / 2, hh = y1 - y0;
    if (axis === 'z') { b.box(color, len, hh, WALL_T, mid, y0 + hh / 2, at); if (y0 === 0) { colliders.push({ x0: s, x1: e, z0: at - WALL_T, z1: at + WALL_T }); b.box(SKIRT, len, 0.14, WALL_T + 0.06, mid, 0.07, at); } }
    else { b.box(color, WALL_T, hh, len, at, y0 + hh / 2, mid); if (y0 === 0) { colliders.push({ x0: at - WALL_T, x1: at + WALL_T, z0: s, z1: e }); b.box(SKIRT, WALL_T + 0.06, 0.14, len, at, 0.07, mid); } }
  };
  for (const [s, e] of cuts) { seg(cursor, s, 0, h); seg(s, e, DOOR_H, h); cursor = e; }
  seg(cursor, to, 0, h);
  return cuts;
}

function doorLeaf(group, axis, at, c, color) {
  const hinge = new THREE.Group();
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.05, 0.08), new THREE.MeshLambertMaterial({ color }));
  leaf.position.set((DOOR_W - 0.05) / 2, (DOOR_H - 0.05) / 2, 0);
  hinge.add(leaf);
  if (axis === 'z') hinge.position.set(c - DOOR_W / 2, 0, at);
  else { hinge.position.set(at, 0, c + DOOR_W / 2); hinge.rotation.y = Math.PI / 2; }
  hinge.userData = { baseRot: hinge.rotation.y, open: 0, centre: axis === 'z' ? new THREE.Vector3(c, 0, at) : new THREE.Vector3(at, 0, c) };
  group.add(hinge);
  return hinge;
}

// Wall-run slot allocator: props fill walls in turn, avoiding doorway gaps.
function makeSlots(r, gaps) {
  const runs = [
    { axis: 'z', at: r.z0 + WALL_T, from: r.x0 + 0.4, to: r.x1 - 0.4, rot: 0 },
    { axis: 'x', at: r.x0 + WALL_T, from: r.z0 + 0.4, to: r.z1 - 0.4, rot: Math.PI / 2 },
    { axis: 'x', at: r.x1 - WALL_T, from: r.z0 + 0.4, to: r.z1 - 0.4, rot: -Math.PI / 2 },
    { axis: 'z', at: r.z1 - WALL_T, from: r.x0 + 0.4, to: r.x1 - 0.4, rot: Math.PI },
  ].map((run) => ({ ...run, used: gaps.filter((g) => g.axis === run.axis && Math.abs(g.at - run.at) < WALL_T * 1.6).map((g) => [g.c - DOOR_W / 2 - 0.9, g.c + DOOR_W / 2 + 0.9]) }));
  let turn = 0;
  return {
    wall(w) {
      for (let k = 0; k < runs.length; k++) {
        const run = runs[(turn + k) % runs.length];
        let pos = run.from;
        const used = run.used.slice().sort((a, b) => a[0] - b[0]);
        for (const [s, e] of used) { if (pos + w <= s) break; pos = Math.max(pos, e); }
        if (pos + w <= run.to) {
          run.used.push([pos, pos + w + 0.25]);
          turn = (turn + k + 1) % runs.length;
          const c = pos + w / 2;
          return run.axis === 'z' ? { x: c, z: run.at + (run.rot === 0 ? 1 : -1) * 0.02, rot: run.rot } : { x: run.at, z: c, rot: run.rot };
        }
      }
      return null;
    },
  };
}

function centreGrid(r) {
  const cells = [];
  const cols = Math.max(1, Math.floor((r.w - 3) / 2.6)), rows = Math.max(1, Math.floor((r.d - 3) / 2.6));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cells.push({ x: r.x0 + 1.5 + (i + 0.5) * (r.w - 3) / cols, z: r.z0 + 1.5 + (j + 0.5) * (r.d - 3) / rows });
  // Start from the middle so a lone centrepiece sits where visitors look.
  const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
  return cells.sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz));
}

export function buildInterior(house, makeLabel) {
  const spec = house.int;
  const b = new Builder();
  const colliders = [];
  const rooms = placeRooms(spec.rooms, spec.layout);
  const h = spec.height || 3.6;
  const openings = [];
  rooms.forEach((r, i) => { if (r.parent >= 0) { const o = sharedOpening(rooms[r.parent], r); if (!o) throw new Error(`${house.repo}: room ${i} not adjacent to parent`); openings.push({ ...o, rooms: [r.parent, i] }); } });
  const ex = (rooms[0].x0 + rooms[0].x1) / 2;
  const entrance = { axis: 'z', at: rooms[0].z1, c: ex };
  openings.push(entrance);
  // Porch slab outside the entrance so the doorway never looks onto the void.
  b.box(0xb9b2a4, 3, 0.1, 1.6, ex, -0.05, rooms[0].z1 + 0.8);

  const group = new THREE.Group();
  const doors = [];
  const labels = [];
  rooms.forEach((r, i) => {
    const floor = r.floor || spec.floor, walls = r.walls || spec.walls;
    b.box(floor, r.w, 0.1, r.d, (r.x0 + r.x1) / 2, -0.05, (r.z0 + r.z1) / 2);
    b.box(spec.ceiling || 0xf2efe8, r.w, 0.1, r.d, (r.x0 + r.x1) / 2, h + 0.05, (r.z0 + r.z1) / 2);
    b.cyl(0xfff4d8, 0.35, 0.06, (r.x0 + r.x1) / 2, h - 0.03, (r.z0 + r.z1) / 2);
    const inset = (axis, edge, to) => openings.map((o) => (o.axis === axis && Math.abs(o.at - edge) < 0.01 ? { ...o, at: to } : o));
    wall(b, colliders, 'z', r.z0 + WALL_T / 2, r.x0, r.x1, h, walls, inset('z', r.z0, r.z0 + WALL_T / 2));
    wall(b, colliders, 'z', r.z1 - WALL_T / 2, r.x0, r.x1, h, walls, inset('z', r.z1, r.z1 - WALL_T / 2));
    wall(b, colliders, 'x', r.x0 + WALL_T / 2, r.z0, r.z1, h, walls, inset('x', r.x0, r.x0 + WALL_T / 2));
    wall(b, colliders, 'x', r.x1 - WALL_T / 2, r.z0, r.z1, h, walls, inset('x', r.x1, r.x1 - WALL_T / 2));
    // z0 walls of rooms whose back opens into another room need the cut too.
    if (r.name) labels.push({ text: r.name, pos: new THREE.Vector3((r.x0 + r.x1) / 2, h - 0.45, r.z0 + 0.25), room: i, kind: 'room' });
  });
  for (const o of openings) if (o !== entrance) doors.push(doorLeaf(group, o.axis, o.at, o.c, spec.doors || 0x7a5a3c));
  const exitDoor = doorLeaf(group, 'z', entrance.at, entrance.c, spec.doors || 0x7a5a3c);
  exitDoor.userData.exit = true;
  doors.push(exitDoor);

  const interactables = [];
  const placedProps = [];
  rooms.forEach((r, ri) => {
    const roomGaps = openings.filter((o) => (o.axis === 'z' && (Math.abs(o.at - r.z0) < 0.3 || Math.abs(o.at - r.z1) < 0.3) && o.c > r.x0 && o.c < r.x1) || (o.axis === 'x' && (Math.abs(o.at - r.x0) < 0.3 || Math.abs(o.at - r.x1) < 0.3) && o.c > r.z0 && o.c < r.z1))
      .map((o) => ({ axis: o.axis, at: o.axis === 'z' ? (Math.abs(o.at - r.z0) < 0.3 ? r.z0 + WALL_T : r.z1 - WALL_T) : (Math.abs(o.at - r.x0) < 0.3 ? r.x0 + WALL_T : r.x1 - WALL_T), c: o.c }));
    const slots = makeSlots(r, roomGaps);
    const cells = centreGrid(r);
    const doorZones = roomGaps.map((g) => (g.axis === 'z' ? { x: g.c, z: g.at } : { x: g.at, z: g.c }));
    (r.props || []).forEach((entry, pi) => {
      const [type, label, act] = typeof entry === 'string' ? [entry] : entry;
      const prop = PROPS[type];
      if (!prop) throw new Error(`${house.repo}: unknown prop ${type}`);
      const want = act?.at || (CENTRE.has(type) ? 'center' : 'wall');
      let spot = null;
      if (Array.isArray(want)) spot = { x: (r.x0 + r.x1) / 2 + want[0], z: (r.z0 + r.z1) / 2 + want[1], rot: want[2] || 0 };
      else if (want === 'center') {
        while (cells.length && !spot) { const c = cells.shift(); if (doorZones.every((dz) => Math.hypot(dz.x - c.x, dz.z - c.z) > 3.2)) spot = { ...c, rot: 0 }; }
      }
      if (!spot) spot = slots.wall(Math.max(prop.w, 0.6)) || (cells.length ? { ...cells.shift(), rot: 0 } : null);
      if (!spot) throw new Error(`${house.repo}: no room for ${type} in "${r.name}" — enlarge the room`);
      const key = act && act.do ? `${house.coordinate}:${ri}:${pi}` : null;
      b.at(spot.x, 0, spot.z, spot.rot, () => prop.build(b, { c: act?.c, a: act?.a, key }));
      const sideways = Math.abs(Math.sin(spot.rot)) > 0.5;
      const fw = sideways ? prop.d : prop.w, fd = sideways ? prop.w : prop.d;
      if (prop.solid) colliders.push({ x0: spot.x - fw / 2, x1: spot.x + fw / 2, z0: spot.z - fd / 2, z1: spot.z + fd / 2 });
      placedProps.push({ type, room: ri });
      const pos = new THREE.Vector3(spot.x, 0, spot.z);
      if (label) labels.push({ text: label, pos: new THREE.Vector3(spot.x, Math.min(h - 0.35, Math.max(propTop(type) + 0.4, 2.35)), spot.z), room: ri, kind: key ? 'interactive' : 'prop' });
      if (key) interactables.push({ key, type, label: label || prop.label, act, room: ri, pos, roomName: r.name });
    });
    // Decoration only: a rug where the floor would otherwise be empty, and framed
    // pictures on leftover wall space. Repository-specific content comes from the brief.
    if (!(r.props || []).some((p) => CENTRE.has(typeof p === 'string' ? p : p[0])) && cells.length) {
      const c = cells.shift(); b.at(c.x, 0, c.z, 0, () => PROPS.rug.build(b, { c: ART[(ri * 3 + r.w) % ART.length], a: 0xe8dcc0 }));
    }
    for (let k = 0; k < 3; k++) {
      const spot = slots.wall(1.1); if (!spot) break;
      const col = ART[(ri + k * 5 + Math.round(r.d)) % ART.length];
      b.at(spot.x, 0, spot.z, spot.rot, () => { b.box(0x3a2a1e, 1.0, 0.75, 0.05, 0, 1.75, -0.02); b.box(col, 0.84, 0.59, 0.03, 0, 1.75, 0.01); b.box(0xf2efe6, 0.3, 0.2, 0.031, -0.18, 1.85, 0.012); });
    }
  });

  // Lights: one warm fill per room plus a hemisphere for the whole interior.
  const light = new THREE.Group();
  light.add(new THREE.HemisphereLight(0xffffff, 0x554a40, 1.6));
  rooms.slice(0, 5).forEach((r) => { const p = new THREE.PointLight(spec.light || 0xffe6c0, 22, Math.max(r.w, r.d) * 1.6, 1.6); p.position.set((r.x0 + r.x1) / 2, h - 0.5, (r.z0 + r.z1) / 2); light.add(p); });

  const built = b.build();
  group.add(built, light);
  for (const l of labels) { const sprite = makeLabel(l.text, l.kind); sprite.position.copy(l.pos); sprite.userData.labelKind = l.kind; group.add(sprite); }
  const dynamics = built.children.filter((c) => c.userData.anim);
  return {
    group, colliders, doors, interactables, dynamics, rooms, placedProps,
    spawn: new THREE.Vector3(ex, 0, rooms[0].z1 - 1.6),
    exitZone: { x0: ex - DOOR_W / 2, x1: ex + DOOR_W / 2, z0: rooms[0].z1 + 0.1, z1: rooms[0].z1 + 1.2 },
    bounds: rooms.reduce((a, r) => ({ x0: Math.min(a.x0, r.x0), x1: Math.max(a.x1, r.x1), z0: Math.min(a.z0, r.z0), z1: Math.max(a.z1, r.z1) }), { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity }),
  };
}

// Approximate prop heights so labels float just above them.
const TALL = { bookshelf: 2.2, wardrobe: 2.2, serverRack: 2.1, clock: 2.1, giraffe: 3.2, portal: 3.0, tree: 3.4, pottedTree: 2.6, robotArm: 2.2, monitorWall: 1.8, throne: 2.4, banner: 2.5, stage: 2.8, cryoPod: 2.3, reactor: 2.2, antenna: 2.7, flag: 3.0, horse: 2.0, lantern: 2.8, statue: 1.9, fridge: 1.9, arcadeCabinet: 1.9, pantry: 2.0, scrollRack: 1.8, timelineWall: 2.0, familyTree: 2.3, monkey: 2.4, dungeonDoor: 2.6, airlock: 2.6, gearWall: 2.3, ladder: 2.6, tent: 1.8, well: 2.7, toolWall: 1.9, partsBins: 1.6 };
function propTop(type) { return TALL[type] || 1.3; }
