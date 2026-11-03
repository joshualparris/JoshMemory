// Draws the Mitchell Highway west from Repository Town and the real town of Narromine at its end
// (data: narromine-layout.js / narromine-osm-data.js, map data © OpenStreetMap contributors).
// Everything is merged per colour into a few meshes. The highway corridor is always drawn; the
// town is drawn only once the player has driven out west (update()), so it costs almost nothing
// while you are in Repository Town.
import * as THREE from 'three';
import { buildKieraths } from './narromine-kieraths.js';
import { HIGHWAY, HIGHWAY_Z, REGION, CORRIDOR_HALF, STREETS, BUILDINGS, AREAS, WATER, RAIL, PLACES, FILL_SHOPS, FILL_HOUSES, FRONTAGES, DETAILED, polyRect, nearTownStreet, boundaryColliders } from './narromine-layout.js';

const SHOW_WEST_OF = -1300;   // past Repository Town's last houses (x ≈ -1330)

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

const ROAD_COLOUR = { trunk: 0x45484b, primary: 0x46494c, secondary: 0x47494b, tertiary: 0x4a4c4e, unclassified: 0x4d4f50, residential: 0x4f5153, service: 0x5a5b5a, living_street: 0x55575a, track: 0x9b8566 };
const AREA_COLOUR = { park: 0x7fae64, pitch: 0x8cc06a, golf_course: 0x79ad5d, cemetery: 0x8a9a7a, school: 0xc7b88f, industrial: 0xa49c90, retail: 0xb9ada0, parking: 0x6a6b6c, sports_centre: 0x9fb8a6, swimming_pool: 0x5aa9d6, track: 0xb47a5a, farmyard: 0xb9a675, residential: null };
const BUILDING_STYLE = (b) => {
  const k = b.kind, base = b.levels ? b.levels * 3.4 : null;
  if (k === 'hangar') return [base || 7.5, 0xb8bcbf];
  if (k === 'church') return [base || 8, 0xc2a07a];
  if (k === 'hospital') return [base || 6, 0xd9d4c8];
  if (k === 'fire_station') return [base || 6, 0xb5463a];
  if (k === 'shed' || k === 'roof') return [base || 4, 0x9da3a6];
  if (k === 'commercial' || /pub|hotel|bank|supermarket|post/.test(b.amenity) || b.name) return [base || 5.2, 0xcdb994];
  return [base || 4.2, 0xbfae92];
};

export function buildNarromine(parent, makeLabel = null) {
  const root = new THREE.Group(); root.name = 'Mitchell Highway and Narromine';
  const town = new THREE.Group(); town.name = 'Narromine town (OpenStreetMap)'; root.add(town);
  const buckets = { road: new Map(), town: new Map() }; let bucket = buckets.road, target = root;
  // Town geometry is grouped by colour AND 300 m tile, so each tile's mesh can be skipped when it
  // is off-screen or beyond the fog (one huge mesh would always be drawn).
  const TILE = 300;
  const push = (c, g) => {
    let k = c;
    if (bucket === buckets.town) { g.computeBoundingBox(); const b = g.boundingBox; k = c + '|' + Math.floor((b.min.x + b.max.x) / 2 / TILE) + ',' + Math.floor((b.min.z + b.max.z) / 2 / TILE); }
    if (!bucket.has(k)) bucket.set(k, []); bucket.get(k).push(g);
  };
  const box = (c, w, h, d, x, y, z, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d); if (ry) g.rotateY(ry); g.translate(x, y, z); push(c, g); };
  // A flat strip along a segment (a road, footpath, river or rail piece); pieces overlap at joints.
  const strip = (c, ax, az, bx, bz, width, y, h = 0.03) => {
    const len = Math.hypot(bx - ax, bz - az); if (len < 0.05) return;
    box(c, len + width * 0.5, h, width, (ax + bx) / 2, y, (az + bz) / 2, -Math.atan2(bz - az, bx - ax));
  };
  const flatPoly = (c, pts, y) => {
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); push(c, g);
  };
  const plane = (tex, w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex ? new THREE.MeshLambertMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.3 }) : new THREE.MeshLambertMaterial({ color: 0x0b5a2d }));
    m.position.set(x, y, z); m.rotation.y = ry; target.add(m); return m;
  };
  const z = HIGHWAY_Z, L = HIGHWAY.x1 - HIGHWAY.x0, cx = (HIGHWAY.x0 + HIGHWAY.x1) / 2;

  // ── The drive (always drawn) ────────────────────────────────────────────
  box(0x8fa86a, L, 0.1, CORRIDOR_HALF * 2 + 20, cx, -0.12, z);
  box(0x4a4d50, L, 0.03, HIGHWAY.width, cx, 0.06, z);   // sits just above Repository Town's ground layers
  for (let x = HIGHWAY.x0 + 6; x < HIGHWAY.x1 - 4; x += 12) box(0xf0ead2, 4, 0.035, 0.14, x, 0.08, z);
  for (const s of [-1, 1]) box(0xf0ead2, L, 0.034, 0.12, cx, 0.08, z + s * (HIGHWAY.width / 2 - 0.3));
  for (let x = HIGHWAY.x0 + 20; x < -1350; x += 50) for (const s of [-1, 1]) { box(0xeeeeee, 0.12, 1.0, 0.12, x, 0.5, z + s * 6.2); box(s < 0 ? 0xd23a2a : 0xe8e8e8, 0.13, 0.12, 0.13, x, 0.9, z + s * 6.2); }
  const crops = [0xc9b25d, 0x6f9a52, 0xa98e62, 0xd3bd6c, 0x7ea35a];
  for (let x = HIGHWAY.x0 + 40, i = 0; x < -1360; x += 120, i++) for (const s of [-1, 1]) {
    const c = crops[(i + (s > 0 ? 2 : 0)) % crops.length];
    box(c, 112, 0.05, CORRIDOR_HALF - 12, x + 56, -0.05, z + s * (CORRIDOR_HALF / 2 + 6));
    if (c === 0x6f9a52) for (let k = 0; k < 24; k++) box(0xf4f2ea, 0.5, 0.4, 0.5, x + 6 + (k * 37) % 104, 0.25, z + s * (14 + (k * 13) % 26));
  }
  for (const s of [-1, 1]) { box(0x8a8a8a, L - 30, 0.04, 0.04, cx, 1.0, z + s * 11); for (let x = HIGHWAY.x0 + 10; x < -1350; x += 8) box(0x6b5236, 0.1, 1.2, 0.1, x, 0.6, z + s * 11); }
  for (let x = HIGHWAY.x0 + 30, i = 0; x < -1360; x += 26 + (i * 7) % 15, i++) {
    const tz = z - 36 - (i * 5) % 7, h = 9 + (i % 4) * 1.5;
    box(0xd9d2c4, 0.6, h, 0.6, x, h / 2, tz);
    box(0x5f7d4a, 6 + (i % 3), 4, 6 + (i % 2), x, h + 1, tz); box(0x6d8a55, 4, 3, 4, x + 1.5, h - 1, tz + 1);
  }
  for (let x = HIGHWAY.x0 + 300; x < -1500; x += 520) {
    box(0x9aa4aa, 60, 0.3, 0.3, x, 3.2, z + 30, 0.35);
    for (let k = -2; k <= 2; k++) { const px = x + k * 13 * Math.cos(0.35), pz = z + 30 - k * 13 * Math.sin(0.35); box(0x7f8a90, 0.25, 3.2, 0.25, px, 1.6, pz); box(0x33363a, 0.9, 0.9, 0.3, px, 0.45, pz); }
  }
  box(0x8c7f72, L, 0.25, 3.2, cx, 0.05, z + 22);
  for (const s of [-1, 1]) box(0x6d6a66, L, 0.14, 0.08, cx, 0.3, z + 22 + s * 0.72);
  for (let x = HIGHWAY.x0; x < -1350; x += 3) box(0x5b4632, 0.25, 0.1, 2.4, x, 0.22, z + 22);
  // Signs (Australia drives on the left: westbound drivers' left is +z).
  const pole = (x, zz, h = 2.6) => box(0x8a8f94, 0.08, h, 0.08, x, h / 2, zz);
  const W = Math.PI / 2, Eb = -Math.PI / 2;   // faces seen by westbound / eastbound drivers
  pole(-420, z + 7); plane(speedTexture(100), 0.8, 0.8, -420, 2.45, z + 7, W);
  pole(-470, z + 8, 3.4); pole(-470, z + 11, 3.4);
  plane(boardTexture(['Mitchell Highway  A32', 'Narromine  40 km', '(real distance)']), 4.4, 2.2, -470, 3.1, z + 9.5, W);
  pole(-2700, z + 9, 3); pole(-2700, z + 13, 3);
  plane(boardTexture(['Welcome to', 'NARROMINE'], { bg: '#1e4f86' }), 5, 2.4, -2700, 2.9, z + 11, W);
  pole(-2660, z - 9, 3.4); pole(-2660, z - 12, 3.4);
  plane(boardTexture(['Dubbo  40 km', 'Repository Town']), 4.4, 2.2, -2660, 3.1, z - 10.5, Eb);

  // ── The town (drawn only out west) ──────────────────────────────────────
  bucket = buckets.town; target = town;
  box(0xa3b07a, REGION.x1 - REGION.x0, 0.1, REGION.z1 - REGION.z0, (REGION.x0 + REGION.x1) / 2, -0.12, (REGION.z0 + REGION.z1) / 2);
  for (const a of AREAS) { const c = AREA_COLOUR[a.kind]; if (c) flatPoly(c, a.pts, a.kind === 'swimming_pool' ? 0.02 : 0.004); }
  for (const w of WATER) {
    if (w.closed) flatPoly(0x4f88a8, w.pts, 0.01);
    else for (let i = 1; i < w.pts.length; i++) strip(w.kind === 'river' ? 0x4f88a8 : 0x5c94b0, ...w.pts[i - 1], ...w.pts[i], w.kind === 'river' ? 40 : 5, 0.008, 0.02);
  }
  for (const r of RAIL) for (let i = 1; i < r.pts.length; i++) { strip(0x8c7f72, ...r.pts[i - 1], ...r.pts[i], 3.2, 0.05, 0.25); strip(0x6d6a66, ...r.pts[i - 1], ...r.pts[i], 1.6, 0.22, 0.12); }
  for (const s of STREETS) {
    const c = ROAD_COLOUR[s.kind] ?? 0x4f5153, kerbed = /trunk|primary|secondary|tertiary|residential|unclassified/.test(s.kind);
    for (let i = 1; i < s.pts.length; i++) {
      const [ax, az] = s.pts[i - 1], [bx, bz] = s.pts[i];
      if (kerbed) strip(0xbdb6a8, ax, az, bx, bz, s.width + 5, 0.03, 0.06);   // footpaths either side
      strip(c, ax, az, bx, bz, s.width, 0.06);
    }
  }
  // Real buildings, raised from their mapped outlines.
  const colliders = [...boundaryColliders()], spots = [];
  for (const b of BUILDINGS) {
    const [h, colour] = BUILDING_STYLE(b);
    const shape = new THREE.Shape(b.pts.map(([x, zz]) => new THREE.Vector2(x, -zz)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); push(colour, g);
    // Collide with the outline's box, unless the outline is very irregular or the box covers a street.
    const r = polyRect(b.pts), area = Math.abs(b.pts.reduce((s, p, i) => { const q = b.pts[(i + 1) % b.pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
    if (area > 0.55 * (r.x1 - r.x0) * (r.z1 - r.z0) && !nearTownStreet((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, 0)) colliders.push(r);
  }
  // Stand-ins where the map has no outline (see narromine-layout.js): shopfronts with a street
  // veranda at named places, and houses with hipped roofs along residential streets.
  const roofGeo = () => { const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); g.rotateY(Math.PI / 4); return g; };
  const placeBox = (c, w, h, d, cx, y, cz, yaw) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateY(yaw); g.translate(cx, y, cz); push(c, g); };
  for (const f of FILL_SHOPS) {
    placeBox(0xc9b793, f.w, 4.6, f.d, f.x, 2.3, f.z, f.yaw); placeBox(0xece3cf, f.w + 0.3, 0.7, f.d + 0.3, f.x, 4.95, f.z, f.yaw);
    // Veranda over the footpath, between the shop front and the kerb.
    const [fx, fz] = f.front, vx = (fx + f.x) / 2 + (fx - f.x) * 0.25, vz = (fz + f.z) / 2 + (fz - f.z) * 0.25;
    placeBox(0x7d6a55, f.w, 0.12, 3, vx, 3.1, vz, f.yaw);
    colliders.push({ ...f.rect });
  }
  const HOUSE_WALLS = [0xd8cdb6, 0xc9a98a, 0xbfc4bd, 0xd6c9a4, 0xa98a74], HOUSE_ROOFS = [0x6e3b32, 0x5a5f66, 0x8a8f8c, 0x7a4a3a, 0x4f5a52];
  for (const h of FILL_HOUSES) {
    placeBox(HOUSE_WALLS[h.tone], h.w, 3.0, h.d, h.x, 1.5, h.z, h.yaw);
    const r = roofGeo(); r.scale(h.w + 0.8, 2.2, h.d + 0.8); r.rotateY(h.yaw); r.translate(h.x, 4.1, h.z); push(HOUSE_ROOFS[h.tone], r);
    colliders.push({ ...h.rect });
  }
  // Verandas, posts, windows and name boards on mapped main-street frontages.
  for (const f of FRONTAGES) {
    const [ax, az] = f.a, [bx, bz] = f.b, len = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const tl = Math.hypot(...f.toward) || 1, ox = f.toward[0] / tl, oz = f.toward[1] / tl, yaw = -Math.atan2(bz - az, bx - ax);
    const depth = Math.min(3, Math.max(1.5, f.d - 1));
    placeBox(0x7d6a55, len, 0.12, depth, mx + ox * depth / 2, 3.1, mz + oz * depth / 2, yaw);
    for (let t = 0.5; t < len; t += 4) { const px = ax + (bx - ax) * t / len + ox * (depth - 0.2), pz = az + (bz - az) * t / len + oz * (depth - 0.2); box(0x8a7a66, 0.14, 3.1, 0.14, px, 1.55, pz); }
    for (let t = 2.5; t < len - 1.5; t += 4.5) { const px = ax + (bx - ax) * t / len + ox * 0.05, pz = az + (bz - az) * t / len + oz * 0.05; placeBox(0x34434f, 2.2, 1.6, 0.06, px, 1.7, pz, yaw); }
    if (f.name) {
      const tex = boardTexture([f.name.toUpperCase()], { bg: '#f1e7cf', fg: '#3a2a1e', border: '#3a2a1e', w: 1024, h: 160 });
      const m = plane(tex, Math.min(len - 1, 11), 1.2, mx + ox * (depth + 0.05), 3.75, mz + oz * (depth + 0.05), Math.atan2(ox, oz));
    }
  }
  // ── Detailed buildings (traced quads from NSW aerial imagery; see narromine-buildings-data.js) ──
  // Each part is an oriented quad: walls are a box along its first edge, roofs are built in that frame.
  const frame = (pts) => { const [a, b, , d] = pts, L = Math.hypot(b[0] - a[0], b[1] - a[1]), Wd = Math.hypot(d[0] - a[0], d[1] - a[1]);
    const cx = pts.reduce((s, p) => s + p[0], 0) / 4, cz = pts.reduce((s, p) => s + p[1], 0) / 4; return { L, W: Wd, cx, cz, yaw: -Math.atan2(b[1] - a[1], b[0] - a[0]) }; };
  const hipRoof = (c, pts, wallH, pitch = 0.42) => {
    const { L, W: w2, cx, cz, yaw } = frame(pts), alongX = L >= w2, half = Math.min(L, w2) / 2, h = half * Math.tan(pitch);
    const x0 = -L / 2, x1 = L / 2, z0 = -w2 / 2, z1 = w2 / 2, y0 = wallH, y1 = wallH + h;
    const ra = alongX ? [x0 + half, 0] : [0, z0 + half], rb = alongX ? [x1 - half, 0] : [0, z1 - half];
    const A = [x0, y0, z0], B = [x1, y0, z0], C = [x1, y0, z1], D = [x0, y0, z1], P = [ra[0], y1, ra[1]], Q = [rb[0], y1, rb[1]];
    const tris = alongX ? [A, P, Q, A, Q, B, B, Q, C, C, Q, P, C, P, D, D, P, A] : [A, B, P, B, Q, P, B, C, Q, C, D, Q, D, P, Q, D, A, P];
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3)); g.rotateY(yaw); g.translate(cx, 0, cz); g.computeVertexNormals(); push(c, g);
  };
  // Coles: a proper two-plane pitched roof with bright triangular gable ends,
  // unlike the old generic flat/shallow shed volumes. Ridge runs along quad edge 0→1.
  const gableRoof = (c, pts, wallH, pitch = 0.23) => {
    const { L, W: w, cx, cz, yaw } = frame(pts), y1 = wallH + w * 0.5 * Math.tan(pitch);
    const xl = -L / 2, xr = L / 2, zn = -w / 2, zs = w / 2, y0 = wallH;
    const roofVerts = [
      xl,y0,zn, xr,y0,zn, xr,y1,0, xl,y0,zn, xr,y1,0, xl,y1,0,
      xl,y1,0, xr,y1,0, xr,y0,zs, xl,y1,0, xr,y0,zs, xl,y0,zs
    ];
    const gbVerts = [
      xl,y0,zn, xl,y0,zs, xl,y1,0,
      xr,y0,zs, xr,y0,zn, xr,y1,0
    ];
    for (const [colour, verts] of [[c, roofVerts], [0xf2f0eb, gbVerts]]) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.rotateY(yaw); geo.translate(cx, 0, cz); geo.computeVertexNormals(); push(colour, geo);
    }
  };
  // Wall features placed along one edge of a part, from street photos: t runs 0..1 from pts[edge[0]]
  // to pts[edge[1]], y is height in metres, and everything sits just proud of the wall.
  const along = (p, edge) => {
    const A = p.pts[edge[0]], B = p.pts[edge[1]], fr = frame(p.pts), ex = B[0] - A[0], ez = B[1] - A[1], len = Math.hypot(ex, ez);
    const mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2, ol = Math.hypot(mx - fr.cx, mz - fr.cz) || 1, ox = (mx - fr.cx) / ol, oz = (mz - fr.cz) / ol;
    return { len, yaw: -Math.atan2(ez, ex), face: Math.atan2(ox, oz), at: (t, out = 0.06) => [A[0] + ex * t + ox * out, A[1] + ez * t + oz * out], ox, oz };
  };
  const grid = (e, t0, t1, y0, y1, cols, rows, glass, frameC, out) => {
    const w = e.len * (t1 - t0), [x, z] = e.at((t0 + t1) / 2, out), h = y1 - y0;
    placeBox(glass, w, h, 0.08, x, y0 + h / 2, z, e.yaw);
    for (let i = 0; i <= cols; i++) { const [qx, qz] = e.at(t0 + (t1 - t0) * i / cols, out + 0.03); placeBox(frameC, 0.09, h, 0.1, qx, y0 + h / 2, qz, e.yaw); }
    for (let j = 0; j <= rows; j++) placeBox(frameC, w, 0.09, 0.1, x + e.ox * 0.03, y0 + h * j / rows, z + e.oz * 0.03, e.yaw);
  };
  const feature = (p, F) => {
    const e = along(p, F.edge), t = F.t;
    if (F.kind === 'glazing') grid(e, t[0], t[1], F.y[0], F.y[1], F.cols, F.rows, 0x1f272d, 0x2b2f33, 0.06);
    if (F.kind === 'band') grid(e, t[0], t[1], F.y[0], F.y[1], F.panes, 1, 0x9fb3c2, 0xf4f4f0, 0.08);
    if (F.kind === 'panel') { const [x, z] = e.at((t[0] + t[1]) / 2, 0.07), h = F.y[1] - F.y[0]; placeBox(F.colour, e.len * (t[1] - t[0]), h, 0.08, x, F.y[0] + h / 2, z, e.yaw); }
    if (F.kind === 'window') { const [x, z] = e.at(t, 0.07), h = F.y[1] - F.y[0], w = F.w || 1.0;
      placeBox(0xf4f4f0, w + 0.2, h + 0.2, 0.08, x, F.y[0] + h / 2, z, e.yaw); const [gx, gz] = e.at(t, 0.1); placeBox(0x9fb3c2, w, h, 0.06, gx, F.y[0] + h / 2, gz, e.yaw);
      if (F.ac) { const [ax, az] = e.at(t, 0.35); placeBox(0xe6e6e2, w * 0.7, 0.45, 0.6, ax, F.y[1] - 0.35, az, e.yaw); } }
    if (F.kind === 'pier') { const [x, z] = e.at(t, F.out ?? 0.15), h = F.y[1] - F.y[0]; placeBox(0xbdb6ad, F.w || 0.55, h, F.w || 0.55, x, F.y[0] + h / 2, z, e.yaw); }
    if (F.kind === 'sign' && typeof document !== 'undefined') {
      const tex = boardTexture(F.text, { bg: F.bg, fg: F.fg, border: F.bg, w: F.px || 1024, h: Math.round((F.px || 1024) * F.h / F.w) });
      if (F.blade) { const [x, z] = e.at(t, F.out); box(F.bgHex, 0.12, F.h, F.w, x, F.y, z, e.yaw + Math.PI / 2);
        plane(tex, F.w, F.h, x + Math.sin(e.yaw + Math.PI / 2) * 0.07, F.y, z + Math.cos(e.yaw + Math.PI / 2) * 0.07, e.face + Math.PI / 2); plane(tex, F.w, F.h, x - Math.sin(e.yaw + Math.PI / 2) * 0.07, F.y, z - Math.cos(e.yaw + Math.PI / 2) * 0.07, e.face - Math.PI / 2); }
      else { const [x, z] = e.at(t, F.out ?? 0.1); plane(tex, F.w, F.h, x, F.y, z, e.face); }
    }
  };
  const GROUND = { asphalt: [0x3f4244, 0.05], grass: [0x7fa65d, 0.03], paving: [0xb8ac98, 0.055], gravel: [0xa89a84, 0.045] };
  for (const d of DETAILED) {
    const ROOF = 0xc8cac6, WALL = 0xe3d8c2;   // galvanised roofs as in the aerial; wall colour assumed (cream render/paint)
    for (const g of d.ground) flatPoly(GROUND[g.kind][0], g.pts, GROUND[g.kind][1]);
    for (const p of d.parts) {
      const f = frame(p.pts), wallH = p.wall || (p.storeys === 2 ? 7.6 : 3.8);
      box(p.wallColour ?? WALL, f.L, wallH, f.W, f.cx, wallH / 2, f.cz, f.yaw);
      for (const F of p.features || []) feature(p, F);
      if (p.fascia) box(0xf4f4f0, f.L + 0.5, 0.35, f.W + 0.5, f.cx, wallH - 0.05, f.cz, f.yaw);   // white roof edge
      if (p.mast) { box(0xb0b2b4, 0.1, 4, 0.1, f.cx, wallH + 2, f.cz); box(0xb0b2b4, 1.4, 0.06, 0.06, f.cx, wallH + 3.4, f.cz); }
      if (p.roof === 'hip') hipRoof(ROOF, p.pts, wallH, p.pitch);
      else if (p.roof === 'gable') gableRoof(ROOF, p.pts, wallH, p.pitch);
      else box(ROOF, f.L + 0.4, 0.1, f.W + 0.4, f.cx, wallH + 0.1, f.cz, f.yaw);
      if (p.storeys === 2 && !p.features) for (const side of [-1, 1]) for (let t = -f.L / 2 + 1.5; t < f.L / 2 - 1; t += 3) { // upper-floor windows on the long faces
        const ox = Math.cos(-f.yaw) * t - Math.sin(-f.yaw) * side * (f.W / 2 + 0.03), oz = Math.sin(-f.yaw) * t + Math.cos(-f.yaw) * side * (f.W / 2 + 0.03);
        box(0x34434f, 1.0, 1.6, 0.06, f.cx + ox, 5.6, f.cz + oz, f.yaw); }
      colliders.push(polyRect(p.pts));
      if (p.roofText && typeof document !== 'undefined') {
        // Painted on the street-facing (west) slope, as seen from the air (axis-aligned front block).
        const r = polyRect(p.pts), fh = (r.x1 - r.x0) / 2 * Math.tan(0.42);
        const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g2 = c.getContext('2d');
        g2.fillStyle = '#8e2a26'; g2.font = 'bold 150px Arial'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(p.roofText, 512, 135);
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const slope = Math.hypot((r.x1 - r.x0) / 2, fh), m = new THREE.Mesh(new THREE.PlaneGeometry((r.z1 - r.z0) * 0.8, slope * 0.75), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false }));
        m.position.set(r.x0 + (r.x1 - r.x0) / 4 - 0.02, wallH + fh / 2 + 0.05, (r.z0 + r.z1) / 2);
        m.rotation.set(0, -Math.PI / 2, 0); m.rotateX(-(Math.PI / 2 - Math.atan2(fh, (r.x1 - r.x0) / 2)));
        town.add(m);
      }
    }
    // Verandahs: posts along the outer (kerb) edge; two-level ones get a balcony floor, balustrade and iron-lace frieze.
    for (const v of d.verandahs) {
      const f = frame(v.pts), [oa, ob] = [v.pts[v.outer[0]], v.pts[v.outer[1]]], top = v.levels === 2 ? 7.0 : 3.25;
      const vRoof = v.lace ? 0x8a6a52 : ROOF, POST = v.lace ? 0xeae6dc : 0x6f6a62;   // painted posts and lace assumed
      if (v.cantilever) { box(0xf2f0ea, f.L, 0.3, f.W, f.cx, v.height, f.cz, f.yaw); continue; }   // thin concrete awning, no posts
      box(vRoof, f.L, 0.1, f.W, f.cx, top, f.cz, f.yaw);
      const ex = ob[0] - oa[0], ez = ob[1] - oa[1], len = Math.hypot(ex, ez), n = Math.max(2, Math.round(len / 3.2));
      const ix = (f.cx - (oa[0] + ob[0]) / 2), iz = (f.cz - (oa[1] + ob[1]) / 2), il = Math.hypot(ix, iz) || 1, inX = ix / il * 0.25, inZ = iz / il * 0.25;
      const eyaw = -Math.atan2(ez, ex), mx = (oa[0] + ob[0]) / 2 + inX, mz = (oa[1] + ob[1]) / 2 + inZ;
      for (let i = 0; i <= n; i++) { const t = i / n; box(POST, 0.14, top, 0.14, oa[0] + ex * t + inX, top / 2, oa[1] + ez * t + inZ); }
      if (v.levels === 2) {
        box(0x7d6a55, f.L, 0.2, f.W, f.cx, 3.6, f.cz, f.yaw);                       // balcony floor
        box(POST, len, 0.06, 0.06, mx, 4.65, mz, eyaw); box(POST, len, 0.9, 0.03, mx, 4.2, mz, eyaw); // balustrade rail and panel
      }
      if (v.lace) { box(POST, len, 0.45, 0.03, mx, top - 0.3, mz, eyaw); box(POST, len, 0.35, 0.03, mx, 3.25, mz, eyaw); } // upper and lower lace friezes
    }
    for (const g of d.ground) if (g.tables) { const cy = polyRect(g.pts);
      for (let i = 0; i < g.tables; i++) { const tx = cy.x0 + 2 + i * 3.2, tz = (cy.z0 + cy.z1) / 2; box(0x5c4632, 1.6, 0.06, 0.8, tx, 0.75, tz); box(0x5c4632, 1.6, 0.05, 0.3, tx, 0.45, tz - 0.75); box(0x5c4632, 1.6, 0.05, 0.3, tx, 0.45, tz + 0.75); } }
    for (const pr of d.props) {
      if (pr.kind === 'postbox') { const [x, z] = pr.at; box(0xd4202f, 0.55, 1.3, 0.45, x, 0.65, z); box(0xd4202f, 0.6, 0.1, 0.5, x, 1.35, z); box(0xffffff, 0.3, 0.3, 0.02, x, 1.05, z + 0.24); colliders.push({ x0: x - 0.3, x1: x + 0.3, z0: z - 0.3, z1: z + 0.3 }); }
      if (pr.kind === 'pier') { const [x, z] = pr.at; box(0xbdb6ad, 0.55, pr.h, 0.55, x, pr.h / 2, z); colliders.push({ x0: x - 0.3, x1: x + 0.3, z0: z - 0.3, z1: z + 0.3 }); }
      if (pr.kind === 'lamp') { const [x, z] = pr.at; box(0x2f4a3c, 0.16, 6, 0.16, x, 3, z); const dx = pr.dx ?? 0.6, dz = pr.dz ?? 0; box(0x2f4a3c, 0.1 + Math.abs(dx) * 2, 0.1, 0.1 + Math.abs(dz) * 2, x + dx, 6.1, z + dz); box(0x2f4a3c, 0.5, 0.25, 0.5, x + dx * 2, 5.85, z + dz * 2); }
      if (pr.kind === 'hedge') { const f = frame(pr.pts); flatPoly(0x8a3b2c, pr.pts, 0.06); box(0x55752f, f.L - 0.6, pr.h || 0.8, f.W - 0.6, f.cx, (pr.h || 0.8) / 2, f.cz, f.yaw); }
      if (pr.kind === 'steps') { const f = frame(pr.pts); for (let i = 0; i < 3; i++) box(0xcfc9be, f.L, 0.15 * (i + 1), f.W * (1 - i / 3), f.cx, 0.075 * (i + 1), f.cz, f.yaw); }
      if (pr.kind === 'fence' || pr.kind === 'rail') { const [ax, az] = pr.a, [bx, bz] = pr.b, l = Math.hypot(bx - ax, bz - az), y = -Math.atan2(bz - az, bx - ax), c = pr.kind === 'fence' ? 0xc8352e : 0xb8bcbf;
        placeBox(c, l, 0.06, 0.06, (ax + bx) / 2, 1.0, (az + bz) / 2, y); placeBox(c, l, 0.05, 0.05, (ax + bx) / 2, 0.5, (az + bz) / 2, y);
        for (let k = 0; k <= Math.ceil(l / (pr.kind === 'fence' ? 0.15 : 1.5)); k++) { const q = k / Math.ceil(l / (pr.kind === 'fence' ? 0.15 : 1.5)); box(c, 0.04, 1.0, 0.04, ax + (bx - ax) * q, 0.5, az + (bz - az) * q); } }
      if (pr.kind === 'planter') { const f = frame(pr.pts); box(0x9c8f7c, f.L, 0.45, f.W, f.cx, 0.22, f.cz, f.yaw); box(0x5f8a3f, f.L - 0.2, 0.08, f.W - 0.2, f.cx, 0.47, f.cz, f.yaw); }
    }
    for (const [tx, tz] of d.trees) { box(0x8f8577, 0.5, 4, 0.5, tx, 2, tz); const g3 = new THREE.SphereGeometry(4.2, 8, 6); g3.scale(1, 0.7, 1); g3.translate(tx, 6.5, tz); push(0x5d7d43, g3); }
  }
  // Main-thread batch-merged geometry; the arcade is present in the actual live scene.
  buildKieraths({ box, push, strip, flatPoly, plane, boardTexture, colliders, spots });
  // Named places: a sign over each, and an E-prompt with what it is, its address and any history.
  for (const p of PLACES) {
    if (makeLabel) { const l = makeLabel(p.name, 'interactive'); l.position.set(p.x, 5.4, p.z); l.scale.multiplyScalar(0.8); town.add(l); }
    const text = [p.kindLabel + (p.address ? ' · ' + p.address : ''), p.fact].filter(Boolean).join(' — ');
    spots.push({ key: 'narromine:' + p.name, label: p.name, pos: new THREE.Vector3(p.x, 0, p.z), text });
  }
  pole(-2742, z - 9, 2.4); plane(boardTexture(['Map data', '© OpenStreetMap contributors'], { bg: '#ffffff', fg: '#222222', border: '#222222' }), 2.6, 1.3, -2742, 2.2, z - 9, Eb);

  const materials = new Map();
  const material = (c, side) => { const k = c + ':' + side; if (!materials.has(k)) materials.set(k, new THREE.MeshLambertMaterial({ color: c, side })); return materials.get(k); };
  for (const [name, map] of Object.entries(buckets)) for (const [k, geos] of map) {
    const c = typeof k === 'string' ? Number(k.split('|')[0]) : k, geo = mergeGeos(geos); geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material(c, name === 'town' ? THREE.DoubleSide : THREE.FrontSide));
    mesh.matrixAutoUpdate = false; (name === 'town' ? town : root).add(mesh);
  }
  town.visible = false;
  parent.add(root);
  const update = (pos) => { const show = pos.x < SHOW_WEST_OF; if (town.visible !== show) town.visible = show; };
  return { group: town, root, colliders, spots, update };
}

// Minimal geometry merge (position + normal), avoiding a dependency on BufferGeometryUtils here.
function mergeGeos(geos) {
  let n = 0; for (const g of geos) n += g.index ? g.index.count : g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g0 of geos) {
    const g = g0.index ? g0.toNonIndexed() : g0; if (!g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position.array, q = g.attributes.normal.array;
    pos.set(p, o); nor.set(q, o); o += p.length; g.dispose(); if (g !== g0) g0.dispose();
  }
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return m;
}
