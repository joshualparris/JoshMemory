// Draws the Mitchell Highway west from Repository Town and the town of Narromine at its end
// (layout and facts: narromine-layout.js). Everything is merged per colour into a few meshes,
// and the whole of it is hidden while the player is in Repository Town (update()), so the
// extra town costs almost nothing until you drive out.
import * as THREE from 'three';
import { HIGHWAY, HIGHWAY_Z, REGION, CORRIDOR_HALF, STREETS, BUILDINGS, MEMORIAL, buildingRect, buildingDoor, boundaryColliders } from './narromine-layout.js';

const SHOW_WEST_OF = -1300;   // past Repository Town's last houses (x ≈ -1330)

// Simple canvas sign: coloured board with up to three lines of text.
function boardTexture(lines, { bg = '#0b5a2d', fg = '#ffffff', w = 512, h = 256, border = '#ffffff' } = {}) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const size = Math.floor((h - 40) / Math.max(lines.length, 1) * 0.62);
  lines.forEach((t, i) => { let s = size; g.font = `bold ${s}px Arial`; while (g.measureText(t).width > w - 40 && s > 12) g.font = `bold ${--s}px Arial`; g.fillText(t, w / 2, 20 + (i + 0.5) * (h - 40) / lines.length); });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
function speedTexture(n) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(14, 2, 100, 124); x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeRect(14, 2, 100, 124);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.strokeStyle = '#c8102e'; x.lineWidth = 9; x.beginPath(); x.arc(64, 58, 36, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#000'; x.font = `bold ${n >= 100 ? 30 : 36}px Arial`; x.fillText(String(n), 64, 60); x.font = 'bold 14px Arial'; x.fillText('km/h', 64, 110);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildNarromine(parent, makeLabel = null) {
  const root = new THREE.Group(); root.name = 'Mitchell Highway and Narromine';
  // Merge boxes of one colour into a single mesh: thousands of fence posts and trees cost one draw call each colour.
  // Two buckets: the highway corridor is always drawn (one mesh per colour, cheap); the town
  // block is drawn only when the player is out there. `bucket` switches where boxes go.
  const town = new THREE.Group(); town.name = 'Narromine town'; root.add(town);
  const buckets = { road: new Map(), town: new Map() }; let bucket = buckets.road, target = root;
  const box = (c, w, h, d, x, y, z, ry = 0) => {
    const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z);
    if (!bucket.has(c)) bucket.set(c, []); bucket.get(c).push(g);
  };
  const plane = (tex, w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex ? new THREE.MeshLambertMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.3 }) : new THREE.MeshLambertMaterial({ color: 0x0b5a2d }));
    m.position.set(x, y, z); m.rotation.y = ry; target.add(m); return m;
  };
  const z = HIGHWAY_Z, L = HIGHWAY.x1 - HIGHWAY.x0, cx = (HIGHWAY.x0 + HIGHWAY.x1) / 2;

  // Ground: paddocks along the corridor and the town block.
  box(0x8fa86a, L, 0.1, CORRIDOR_HALF * 2 + 20, cx, -0.12, z);
  bucket = buckets.town; target = town;
  box(0x93b073, REGION.x1 - REGION.x0, 0.1, REGION.z1 - REGION.z0, (REGION.x0 + REGION.x1) / 2, -0.12, (REGION.z0 + REGION.z1) / 2);
  // Highway: two lanes, sealed shoulders, broken centre line, guide posts every 50 m.
  box(0x4a4d50, L, 0.03, HIGHWAY.width, cx, 0.06, z);   // sits just above Repository Town's ground layers
  for (let x = HIGHWAY.x0 + 6; x < HIGHWAY.x1 - 4; x += 12) box(0xf0ead2, 4, 0.035, 0.14, x, 0.08, z);
  for (const s of [-1, 1]) box(0xf0ead2, L, 0.034, 0.12, cx, 0.08, z + s * (HIGHWAY.width / 2 - 0.3));
  for (let x = HIGHWAY.x0 + 20; x < -1350; x += 50) for (const s of [-1, 1]) { box(0xeeeeee, 0.12, 1.0, 0.12, x, 0.5, z + s * 6.2); box(s < 0 ? 0xd23a2a : 0xe8e8e8, 0.13, 0.12, 0.13, x, 0.9, z + s * 6.2); }

  // Paddocks: alternating wheat stubble/crop (gold), cotton (green with white bolls) and fallow, both sides.
  const crops = [0xc9b25d, 0x6f9a52, 0xa98e62, 0xd3bd6c, 0x7ea35a];
  for (let x = HIGHWAY.x0 + 40, i = 0; x < -1360; x += 120, i++) for (const s of [-1, 1]) {
    const c = crops[(i + (s > 0 ? 2 : 0)) % crops.length];
    box(c, 112, 0.05, CORRIDOR_HALF - 12, x + 56, -0.05, z + s * (CORRIDOR_HALF / 2 + 6));
    if (c === 0x6f9a52) for (let k = 0; k < 24; k++) box(0xf4f2ea, 0.5, 0.4, 0.5, x + 6 + (k * 37) % 104, 0.25, z + s * (14 + (k * 13) % 26));
  }
  // Wire fences on the paddock line.
  for (const s of [-1, 1]) { box(0x8a8a8a, L - 30, 0.04, 0.04, cx, 1.0, z + s * 11); for (let x = HIGHWAY.x0 + 10; x < -1350; x += 8) box(0x6b5236, 0.1, 1.2, 0.1, x, 0.6, z + s * 11); }
  // Red gums along the river side (north) and a centre-pivot irrigator every so often (south).
  for (let x = HIGHWAY.x0 + 30, i = 0; x < -1360; x += 26 + (i * 7) % 15, i++) {
    const tz = z - 36 - (i * 5) % 7, h = 9 + (i % 4) * 1.5;
    box(0xd9d2c4, 0.6, h, 0.6, x, h / 2, tz);
    box(0x5f7d4a, 6 + (i % 3), 4, 6 + (i % 2), x, h + 1, tz); box(0x6d8a55, 4, 3, 4, x + 1.5, h - 1, tz + 1);
  }
  for (let x = HIGHWAY.x0 + 300; x < -1500; x += 520) {
    box(0x9aa4aa, 60, 0.3, 0.3, x, 3.2, z + 30, 0.35);
    for (let k = -2; k <= 2; k++) { const px = x + k * 13 * Math.cos(0.35), pz = z + 30 - k * 13 * Math.sin(0.35); box(0x7f8a90, 0.25, 3.2, 0.25, px, 1.6, pz); box(0x33363a, 0.9, 0.9, 0.3, px, 0.45, pz); }
  }
  // Main Western railway alongside (south): ballast, two rails, sleepers.
  box(0x8c7f72, L, 0.25, 3.2, cx, 0.05, z + 22);
  for (const s of [-1, 1]) box(0x6d6a66, L, 0.14, 0.08, cx, 0.3, z + 22 + s * 0.72);
  for (let x = HIGHWAY.x0; x < -1350; x += 3) box(0x5b4632, 0.25, 0.1, 2.4, x, 0.22, z + 22);

  // Dandaloo Street (wide main street with kerbs and footpaths) and Burraway Street.
  for (const s of STREETS) {
    const horiz = s.a.z === s.b.z, len = horiz ? Math.abs(s.b.x - s.a.x) : Math.abs(s.b.z - s.a.z), mx = (s.a.x + s.b.x) / 2, mz = (s.a.z + s.b.z) / 2;
    box(0x47494b, horiz ? len : s.width, 0.03, horiz ? s.width : len, mx, 0.013, mz);
    for (const k of [-1, 1]) { const off = s.width / 2 + 1.5;
      box(0xbdb6a8, horiz ? len : 3, 0.1, horiz ? 3 : len, mx + (horiz ? 0 : k * off), 0.05, mz + (horiz ? k * off : 0)); }
  }
  // Angle-parking bays along Dandaloo Street.
  for (let x = -3230; x < -2870; x += 3.2) for (const s of [-1, 1]) box(0xf0ead2, 0.1, 0.035, 4.6, x, 0.03, z + s * 4.3, s * 0.5);

  // Buildings: walls, parapet, street veranda on posts; the 1901 hotel has a second storey with iron lace.
  const colliders = [...boundaryColliders()], spots = [];
  for (const b of [...BUILDINGS]) {
    const r = buildingRect(b), w = r.x1 - r.x0, d = r.z1 - r.z0, mx = (r.x0 + r.x1) / 2, mz = (r.z0 + r.z1) / 2, h = b.storeys * 3.8;
    box(b.colour, w, h, d, mx, h / 2, mz);
    box(0xece3cf, w + 0.3, 0.6, d + 0.3, mx, h + 0.3, mz);
    colliders.push({ ...r });
    const door = buildingDoor(b);
    const facing = b.side === 'north' ? 1 : b.side === 'south' ? -1 : 0;   // +1: front faces +z
    if (b.veranda && b.side !== 'burraway') {
      const vz = facing > 0 ? r.z1 + 1.4 : r.z0 - 1.4;
      box(0x7d6a55, w, 0.12, 2.8, mx, 3.2, vz);
      for (let x = r.x0 + 0.3; x <= r.x1; x += 4) box(0x8a7a66, 0.14, 3.2, 0.14, x, 1.6, vz + facing * 1.2);
      if (b.ironLace) { box(0x6b5f52, w, 0.1, 2.8, mx, h + 0.05, vz); for (let x = r.x0 + 0.2; x <= r.x1; x += 0.6) box(0x2f2a26, 0.04, 1.0, 0.04, x, 4.4, vz + facing * 1.3); box(0x2f2a26, w, 0.08, 0.06, mx, 4.95, vz + facing * 1.3); }
    }
    // Windows and door on the frontage.
    const fz = b.side === 'north' ? r.z1 + 0.03 : b.side === 'south' ? r.z0 - 0.03 : null;
    if (fz != null) { for (let x = r.x0 + 3; x < r.x1 - 2; x += 5) box(0x3a4a58, 2.2, 1.6, 0.06, x, 1.7, fz); box(0x4a3424, 1.4, 2.3, 0.08, b.x, 1.15, fz); }
    else { box(0x4a3424, 0.08, 2.3, 1.4, r.x1 + 0.03, 1.15, b.z); }
    // Business name board above the veranda / door.
    const tex = boardTexture([b.name.toUpperCase()], { bg: '#f1e7cf', fg: '#3a2a1e', border: '#3a2a1e', w: 1024, h: 160 });
    box(0xece3cf, fz != null ? Math.min(w - 2, 12) + 0.4 : 0.3, 1.6, fz != null ? 0.3 : Math.min(d - 2, 10) + 0.4, fz != null ? b.x : r.x1, h + 1.1, fz != null ? fz - facing * 0.15 : b.z);
    if (fz != null) plane(tex, Math.min(w - 2, 12), 1.4, b.x, h + 1.1, fz + facing * 0.03, facing > 0 ? 0 : Math.PI);
    else plane(tex, Math.min(d - 2, 10), 1.4, r.x1 + 0.18, h + 1.1, b.z, Math.PI / 2);
    spots.push({ key: 'narromine:' + b.id, label: b.name, pos: new THREE.Vector3(door.x, 0, door.z), text: b.fact });
  }
  // Soldiers' Wall memorial: a low brick wall with a plaque.
  box(0x9a5b45, MEMORIAL.w, 1.6, 0.6, MEMORIAL.x, 0.8, MEMORIAL.z); box(0xc7b27a, 3, 0.9, 0.08, MEMORIAL.x, 1.0, MEMORIAL.z - 0.33);
  colliders.push({ x0: MEMORIAL.x - MEMORIAL.w / 2, x1: MEMORIAL.x + MEMORIAL.w / 2, z0: MEMORIAL.z - 0.3, z1: MEMORIAL.z + 0.3 });
  spots.push({ key: 'narromine:' + MEMORIAL.id, label: MEMORIAL.name, pos: new THREE.Vector3(MEMORIAL.x, 0, MEMORIAL.z - 1.4), text: MEMORIAL.fact });

  bucket = buckets.road; target = root;
  // Road signs: leaving Repository Town, the distance board, speed limits, and the town welcome.
  const pole = (x, zz, h = 2.6) => box(0x8a8f94, 0.08, h, 0.08, x, h / 2, zz);
  const facingEast = -Math.PI / 2, facingWest = Math.PI / 2;   // faces drivers heading west / east
  pole(-420, z + 7); plane(speedTexture(100), 0.8, 0.8, -420, 2.45, z + 7, facingEast + Math.PI);
  pole(-470, z + 8, 3.4); pole(-470, z + 11, 3.4);
  plane(boardTexture(['Mitchell Highway  A32', 'Narromine  40 km', '(real distance)']), 4.4, 2.2, -470, 3.1, z + 9.5, facingEast + Math.PI);
  pole(-2840, z + 7); plane(speedTexture(50), 0.8, 0.8, -2840, 2.45, z + 7, facingEast + Math.PI);
  pole(-2800, z + 9, 3); pole(-2800, z + 13, 3);
  plane(boardTexture(['Welcome to', 'NARROMINE'], { bg: '#1e4f86' }), 5, 2.4, -2800, 2.9, z + 11, facingEast + Math.PI);
  pole(-2880, z - 7); plane(speedTexture(100), 0.8, 0.8, -2880, 2.45, z - 7, facingWest + Math.PI);
  pole(-2900, z - 9, 3.4); pole(-2900, z - 12, 3.4);
  plane(boardTexture(['Dubbo  40 km', 'Repository Town']), 4.4, 2.2, -2900, 3.1, z - 10.5, facingWest + Math.PI);
  if (makeLabel) for (const s of STREETS) { const l = makeLabel(s.name, 'street'); town.add(l); l.position.set(s.a.z === s.b.z ? -2990 : s.a.x + 7, 3.6, s.a.z === s.b.z ? z + 9 : -30); }

  for (const [name, map] of Object.entries(buckets)) for (const [c, geos] of map) {
    const mesh = new THREE.Mesh(mergeGeos(geos), new THREE.MeshLambertMaterial({ color: c })); mesh.matrixAutoUpdate = false;
    (name === 'town' ? town : root).add(mesh);
  }
  town.visible = false;
  parent.add(root);
  // The town is drawn only once the player has driven past Repository Town's western houses.
  const update = (pos) => { const show = pos.x < SHOW_WEST_OF; if (town.visible !== show) town.visible = show; };
  return { group: town, root, colliders, spots, update };
}

// Minimal geometry merge (position + normal), avoiding a dependency on BufferGeometryUtils here.
function mergeGeos(geos) {
  let n = 0; for (const g of geos) n += g.index ? g.index.count : g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g0 of geos) {
    const g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position.array, q = g.attributes.normal.array;
    pos.set(p, o); nor.set(q, o); o += p.length; g.dispose(); if (g !== g0) g0.dispose();
  }
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return m;
}
