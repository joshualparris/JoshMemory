import * as THREE from 'three';
import {
  NARROMINE_COURTHOUSE_DISAMBIGUATION,
  NARROMINE_COURTHOUSE_CADASTRAL_LOTS,
  NARROMINE_COURTHOUSE_BUILDINGS,
  NARROMINE_COURTHOUSE_ACCESS,
  NARROMINE_COURTHOUSE_INTEGRATION_SPEC,
} from './narromine-courthouse-evidence.js';

function mergeGeometries(geos) {
  let verts = 0;
  let indices = 0;
  for (const g of geos) {
    verts += g.attributes.position.count;
    indices += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(verts * 3);
  const norm = new Float32Array(verts * 3);
  const uv = new Float32Array(verts * 2);
  const idx = new Uint32Array(indices);
  let vOff = 0;
  let iOff = 0;
  for (const g of geos) {
    const p = g.attributes.position.array;
    const n = g.attributes.normal.array;
    const u = g.attributes.uv ? g.attributes.uv.array : null;
    const c = g.attributes.position.count;
    pos.set(p, vOff * 3);
    norm.set(n, vOff * 3);
    if (u) uv.set(u, vOff * 2);
    if (g.index) {
      const gi = g.index.array;
      for (let i = 0; i < gi.length; i++) idx[iOff + i] = gi[i] + vOff;
      iOff += gi.length;
    } else {
      for (let i = 0; i < c; i++) idx[iOff + i] = vOff + i;
      iOff += c;
    }
    vOff += c;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

const DEFAULT_MATS = () => ({
  heritageWeatherboard: new THREE.MeshStandardMaterial({ color: 0xede6d6, roughness: 0.78 }),
  heritageTrim: new THREE.MeshStandardMaterial({ color: 0x5c2f24, roughness: 0.72 }),
  brickPlinth: new THREE.MeshStandardMaterial({ color: 0x7c3f32, roughness: 0.86 }),
  galvRoof: new THREE.MeshStandardMaterial({ color: 0x9aa2a8, roughness: 0.56, metalness: 0.34 }),
  lockupWall: new THREE.MeshStandardMaterial({ color: 0xdfd7c6, roughness: 0.82 }),
  policeBrick: new THREE.MeshStandardMaterial({ color: 0x8e4c3b, roughness: 0.84 }),
  policeUpperWall: new THREE.MeshStandardMaterial({ color: 0xe9e2d2, roughness: 0.78 }),
  policeRoof: new THREE.MeshStandardMaterial({ color: 0x6c757d, roughness: 0.58, metalness: 0.28 }),
  policeBlue: new THREE.MeshStandardMaterial({ color: 0x163e73, roughness: 0.52 }),
  courtBuffBrick: new THREE.MeshStandardMaterial({ color: 0xc8a982, roughness: 0.82 }),
  courtDarkBrick: new THREE.MeshStandardMaterial({ color: 0x7a5c43, roughness: 0.86 }),
  courtFascia: new THREE.MeshStandardMaterial({ color: 0xe6dfd3, roughness: 0.72 }),
  courtRoof: new THREE.MeshStandardMaterial({ color: 0x7d848a, roughness: 0.56, metalness: 0.3 }),
  hubWall: new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.74 }),
  hubAccent: new THREE.MeshStandardMaterial({ color: 0x2f5d62, roughness: 0.64 }),
  hubRoof: new THREE.MeshStandardMaterial({ color: 0xb0b7bd, roughness: 0.5, metalness: 0.36 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x29445a,
    roughness: 0.2,
    metalness: 0.35,
    transparent: true,
    opacity: 0.78,
  }),
  concretePath: new THREE.MeshStandardMaterial({ color: 0xc7c2b8, roughness: 0.88 }),
  atriumTurf: new THREE.MeshStandardMaterial({ color: 0x4c6b42, roughness: 0.92 }),
  fenceMat: new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.8 }),
});

function createDefaultContext() {
  const buckets = new Map();
  const group = new THREE.Group();
  group.name = 'NarromineCourthousePrecinct';
  const colliders = [];
  const spots = [];

  const push = (mat, geo, matrix) => {
    const g = matrix ? geo.clone().applyMatrix4(matrix) : geo;
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(g);
  };

  const _m = new THREE.Matrix4();
  const _p = new THREE.Vector3();
  const _q = new THREE.Quaternion();
  const _s = new THREE.Vector3();
  const _e = new THREE.Euler();
  const _unitBox = new THREE.BoxGeometry(1, 1, 1);

  const box = (mat, x, y, z, sx, sy, sz, ry = 0) => {
    _p.set(x, y, z);
    _e.set(0, ry, 0);
    _q.setFromEuler(_e);
    _s.set(sx, sy, sz);
    _m.compose(_p, _q, _s);
    push(mat, _unitBox, _m);
  };

  const flatPoly = (mat, pts, y) => {
    if (pts.length < 3) return;
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], -pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], -pts[i][1]);
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    g.translate(0, y, 0);
    push(mat, g);
  };

  const flush = () => {
    for (const [mat, geos] of buckets.entries()) {
      if (!geos.length) continue;
      const merged = mergeGeometries(geos);
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  };

  return { group, buckets, colliders, spots, push, box, flatPoly, flush };
}

function addQuadWall(push, mat, [x0, z0], [x1, z1], y0, y1) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz);
  if (len < 1e-3) return;
  const nx = dz / len;
  const nz = -dx / len;
  const pos = new Float32Array([
    x0, y0, z0,
    x1, y0, z1,
    x1, y1, z1,
    x0, y1, z0,
  ]);
  const norm = new Float32Array([
    nx, 0, nz,
    nx, 0, nz,
    nx, 0, nz,
    nx, 0, nz,
  ]);
  const h = y1 - y0;
  const uv = new Float32Array([0, 0, len, 0, len, h, 0, h]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  push(mat, g);
}

function addExtrudedFootprintWalls(push, mat, pts, y0, y1) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    addQuadWall(push, mat, a, b, y0, y1);
  }
}

function addTriFace(push, mat, p0, p1, p2) {
  const ax = p1[0] - p0[0];
  const ay = p1[1] - p0[1];
  const az = p1[2] - p0[2];
  const bx = p2[0] - p0[0];
  const by = p2[1] - p0[1];
  const bz = p2[2] - p0[2];
  let nx = ay * bz - az * by;
  let ny = az * bx - ax * bz;
  let nz = ax * by - ay * bx;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  const l = Math.hypot(nx, ny, nz) || 1;
  nx /= l;
  ny /= l;
  nz /= l;
  const pos = new Float32Array([...p0, ...p1, ...p2]);
  const norm = new Float32Array([nx, ny, nz, nx, ny, nz, nx, ny, nz]);
  const uv = new Float32Array([0, 0, 1, 0, 0.5, 1]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex([0, 1, 2]);
  push(mat, g);
}

function addQuadFace(push, mat, p0, p1, p2, p3) {
  addTriFace(push, mat, p0, p1, p2);
  addTriFace(push, mat, p0, p2, p3);
}

/**
 * Builds a hipped roof over a 4-point rectangular polygon [p0, p1, p2, p3].
 * Assumes edges (p1->p2) and (p3->p0) are the long side edges when longAxis = '1-2',
 * or (p0->p1) and (p2->p3) when longAxis = '0-1'.
 */
function addHippedRoof4(push, mat, pts, eaveY, ridgeY, longAxis = '1-2', overhang = 0.35) {
  const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) * 0.25;
  const cz = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) * 0.25;
  const expanded = pts.map(([x, z]) => {
    const dx = x - cx;
    const dz = z - cz;
    const d = Math.hypot(dx, dz) || 1;
    return [x + (dx / d) * overhang, z + (dz / d) * overhang];
  });
  const [c0, c1, c2, c3] = expanded.map(([x, z]) => [x, eaveY, z]);

  if (longAxis === '1-2') {
    const m01 = [(c0[0] + c1[0]) * 0.5, (c0[2] + c1[2]) * 0.5];
    const m23 = [(c2[0] + c3[0]) * 0.5, (c2[2] + c3[2]) * 0.5];
    const r0 = [m01[0] * 0.65 + cx * 0.35, ridgeY, m01[1] * 0.65 + cz * 0.35];
    const r1 = [m23[0] * 0.65 + cx * 0.35, ridgeY, m23[1] * 0.65 + cz * 0.35];
    addTriFace(push, mat, c0, c1, r0);
    addQuadFace(push, mat, c1, c2, r1, r0);
    addTriFace(push, mat, c2, c3, r1);
    addQuadFace(push, mat, c3, c0, r0, r1);
  } else {
    const m12 = [(c1[0] + c2[0]) * 0.5, (c1[2] + c2[2]) * 0.5];
    const m30 = [(c3[0] + c0[0]) * 0.5, (c3[2] + c0[2]) * 0.5];
    const r0 = [m30[0] * 0.65 + cx * 0.35, ridgeY, m30[1] * 0.65 + cz * 0.35];
    const r1 = [m12[0] * 0.65 + cx * 0.35, ridgeY, m12[1] * 0.65 + cz * 0.35];
    addTriFace(push, mat, c3, c0, r0);
    addQuadFace(push, mat, c0, c1, r1, r0);
    addTriFace(push, mat, c1, c2, r1);
    addQuadFace(push, mat, c2, c3, r0, r1);
  }
}

/**
 * Adds a gabled roof + gable end triangles over a 4-point rectangle [p0, p1, p2, p3]
 * where (p0->p1) and (p2->p3) are the long side eaves and (p1->p2) / (p3->p0) are the gable ends.
 */
function addGabledRoof4(push, roofMat, gableMat, pts, eaveY, ridgeY) {
  const c0 = [pts[0][0], eaveY, pts[0][1]];
  const c1 = [pts[1][0], eaveY, pts[1][1]];
  const c2 = [pts[2][0], eaveY, pts[2][1]];
  const c3 = [pts[3][0], eaveY, pts[3][1]];
  const r0 = [(pts[3][0] + pts[0][0]) * 0.5, ridgeY, (pts[3][1] + pts[0][1]) * 0.5];
  const r1 = [(pts[1][0] + pts[2][0]) * 0.5, ridgeY, (pts[1][1] + pts[2][1]) * 0.5];
  addQuadFace(push, roofMat, c0, c1, r1, r0);
  addQuadFace(push, roofMat, c2, c3, r0, r1);
  addTriFace(push, gableMat, c1, c2, r1);
  addTriFace(push, gableMat, c3, c0, r0);
}

function addEdgeWindows(box, frameMat, glassMat, a, b, count, yMid, winW, winH) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 1;
  const yaw = Math.atan2(dx, dz);
  const nx = dz / len;
  const nz = -dx / len;
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const wx = a[0] + dx * t + nx * 0.08;
    const wz = a[1] + dz * t + nz * 0.08;
    box(frameMat, wx, yMid, wz, 0.14, winH + 0.14, winW + 0.14, yaw);
    box(glassMat, wx + nx * 0.03, yMid, wz + nz * 0.03, 0.08, winH, winW, yaw);
  }
}

function pushRotatedRectColliders(colliders, pts, slices = 3) {
  // Slice an oriented 4-point rectangle [p0, p1, p2, p3] along edge (0->3 / 1->2)
  // into tight axis-aligned AABB boxes so adjacent diagonal streets stay 100% clear.
  for (let s = 0; s < slices; s++) {
    const t0 = s / slices;
    const t1 = (s + 1) / slices;
    const a0 = [
      pts[0][0] + (pts[3][0] - pts[0][0]) * t0,
      pts[0][1] + (pts[3][1] - pts[0][1]) * t0,
    ];
    const a1 = [
      pts[1][0] + (pts[2][0] - pts[1][0]) * t0,
      pts[1][1] + (pts[2][1] - pts[1][1]) * t0,
    ];
    const b0 = [
      pts[0][0] + (pts[3][0] - pts[0][0]) * t1,
      pts[0][1] + (pts[3][1] - pts[0][1]) * t1,
    ];
    const b1 = [
      pts[1][0] + (pts[2][0] - pts[1][0]) * t1,
      pts[1][1] + (pts[2][1] - pts[1][1]) * t1,
    ];
    const xs = [a0[0], a1[0], b0[0], b1[0]];
    const zs = [a0[1], a1[1], b0[1], b1[1]];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    colliders.push([
      +(minX + maxX) * 0.5,
      +(minZ + maxZ) * 0.5,
      +(maxX - minX) * 0.5,
      +(maxZ - minZ) * 0.5,
    ]);
  }
}

/**
 * Constructs the complete Narromine Courthouse, Police & Civic Precinct on
 * Section 17, DP 758759:
 *   1. 35 Burraway Street — Former Narromine Courthouse (1898, LEP Item I5) + Rear Lock-up
 *   2. 49 Merilba Street  — Narromine Police Station & Residence (osm:174, 2011 LiDAR) + Garage
 *   3. 47 Merilba Street  — Narromine Courthouse (NSW Local Court) + Courtroom Clerestory + Portico
 *   4. 37 Burraway Street — Hub n Spoke Circular Atrium Co-Working Building
 */
export function buildNarromineCourthousePrecinct(ctx = {}) {
  const standalone = !ctx.push || !ctx.box;
  const env = standalone ? createDefaultContext() : ctx;
  const { push, box, flatPoly } = env;
  const colliders = env.colliders || [];
  const spots = env.spots || [];
  const mats = ctx.mats ? { ...DEFAULT_MATS(), ...ctx.mats } : DEFAULT_MATS();

  const [formerCourt, policeStation, localCourt, hubNSpoke] = NARROMINE_COURTHOUSE_BUILDINGS;

  // ── 1. 35 Burraway Street: Former Narromine Courthouse (1898, LEP Item I5) ──
  {
    const fp = formerCourt.footprintWorld;
    const vp = formerCourt.verandahWorld;
    const lp = formerCourt.lockupWorld;
    const { eaveHeightM, ridgeHeightM, lockupEaveM, lockupRidgeM } = formerCourt.dimensionsM;

    // Brick foundation plinth (0 -> 0.45 m) & weatherboard walls (0.45 -> 3.35 m)
    addExtrudedFootprintWalls(push, mats.brickPlinth, fp, 0.0, 0.45);
    addExtrudedFootprintWalls(push, mats.heritageWeatherboard, fp, 0.45, eaveHeightM);
    addHippedRoof4(push, mats.galvRoof, fp, eaveHeightM, ridgeHeightM, '1-2', 0.35);

    // Heritage brick chimney on NW wall
    const chX = (fp[3][0] + fp[0][0]) * 0.5 + 0.35;
    const chZ = (fp[3][1] + fp[0][1]) * 0.5 - 0.25;
    box(mats.brickPlinth, chX, 3.1, chZ, 0.75, 6.2, 0.75, 0.53);

    // Front Burraway Street skillion verandah (vp[0..1] front edge at y=2.55m -> vp[2..3] wall at y=3.05m)
    flatPoly(mats.concretePath, vp, 0.14);
    addQuadFace(
      push,
      mats.galvRoof,
      [vp[0][0], 2.55, vp[0][1]],
      [vp[1][0], 2.55, vp[1][1]],
      [vp[2][0], 3.05, vp[2][1]],
      [vp[3][0], 3.05, vp[3][1]]
    );
    // 4 timber verandah posts + decorative valence beam along front edge (vp[0] -> vp[1])
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const px = vp[0][0] + (vp[1][0] - vp[0][0]) * t;
      const pz = vp[0][1] + (vp[1][1] - vp[0][1]) * t;
      box(mats.heritageTrim, px, 1.32, pz, 0.14, 2.5, 0.14, 0.53);
    }
    const vMidX = (vp[0][0] + vp[1][0]) * 0.5;
    const vMidZ = (vp[0][1] + vp[1][1]) * 0.5;
    const vYaw = Math.atan2(vp[1][0] - vp[0][0], vp[1][1] - vp[0][1]);
    box(mats.heritageTrim, vMidX, 2.45, vMidZ, 0.16, 0.24, 7.35, vYaw);

    // Front entrance panelled timber door & double-hung sash windows
    const frontMidX = (fp[0][0] + fp[1][0]) * 0.5;
    const frontMidZ = (fp[0][1] + fp[1][1]) * 0.5;
    box(mats.heritageTrim, frontMidX, 1.35, frontMidZ, 0.18, 2.25, 1.15, vYaw);
    addEdgeWindows(box, mats.heritageTrim, mats.glass, fp[0], fp[1], 2, 1.85, 0.95, 1.35);
    addEdgeWindows(box, mats.heritageTrim, mats.glass, fp[1], fp[2], 4, 1.85, 1.05, 1.4);
    addEdgeWindows(box, mats.heritageTrim, mats.glass, fp[3], fp[0], 4, 1.85, 1.05, 1.4);

    // Historic 1898 Rear Lock-up Outbuilding on Lot 6
    addExtrudedFootprintWalls(push, mats.brickPlinth, lp, 0.0, 0.35);
    addExtrudedFootprintWalls(push, mats.lockupWall, lp, 0.35, lockupEaveM);
    addHippedRoof4(push, mats.galvRoof, lp, lockupEaveM, lockupRidgeM, '0-1', 0.25);
    addEdgeWindows(box, mats.heritageTrim, mats.glass, lp[0], lp[1], 2, 2.05, 0.65, 0.55);

    // Signboard on Burraway Street frontage if boardTexture is provided
    if (ctx.boardTexture && ctx.plane) {
      const signMat = new THREE.MeshStandardMaterial({
        map: ctx.boardTexture('FORMER COURT HOUSE (1898)', '35 BURRAWAY ST · LEP ITEM I5', '#5c2f24', '#f6efe2'),
        roughness: 0.72,
      });
      ctx.plane(signMat, vMidX, 2.75, vMidZ, 3.2, 0.48, vYaw + Math.PI / 2);
    }

    pushRotatedRectColliders(colliders, fp, 3);
    pushRotatedRectColliders(colliders, lp, 2);
  }

  // ── 2. 49 Merilba Street: Narromine Police Station & Residence (osm:174) ────
  {
    const [mainWing, northWing] = policeStation.partsWorld;
    // Main SW residence/station wing (hipped roof, LiDAR eave 3.16 m, ridge 5.95 m)
    addExtrudedFootprintWalls(push, mats.policeBrick, mainWing.pts, 0.0, 1.35);
    addExtrudedFootprintWalls(push, mats.policeUpperWall, mainWing.pts, 1.35, mainWing.eaveH);
    addHippedRoof4(push, mats.policeRoof, mainWing.pts, mainWing.eaveH, mainWing.ridgeH, '1-2', 0.35);
    addEdgeWindows(box, mats.policeBrick, mats.glass, mainWing.pts[0], mainWing.pts[1], 3, 1.75, 1.05, 1.25);
    addEdgeWindows(box, mats.policeBrick, mats.glass, mainWing.pts[3], mainWing.pts[0], 3, 1.75, 1.05, 1.25);

    // North-west to south-east administrative wing (gabled roof, LiDAR eave 3.16 m, ridge 6.39 m)
    addExtrudedFootprintWalls(push, mats.policeBrick, northWing.pts, 0.0, 1.35);
    addExtrudedFootprintWalls(push, mats.policeUpperWall, northWing.pts, 1.35, northWing.eaveH);
    addGabledRoof4(
      push,
      mats.policeRoof,
      mats.policeUpperWall,
      northWing.pts,
      northWing.eaveH,
      northWing.ridgeH
    );
    addEdgeWindows(box, mats.policeBrick, mats.glass, northWing.pts[0], northWing.pts[1], 4, 1.75, 1.1, 1.25);
    addEdgeWindows(box, mats.policeBrick, mats.glass, northWing.pts[2], northWing.pts[3], 4, 1.75, 1.1, 1.25);

    // NSW Police blue identification band & Merilba Street entry sign
    const pCornerX = -4603.5;
    const pCornerZ = -787.2;
    box(mats.policeBlue, pCornerX, 2.55, pCornerZ, 0.25, 0.42, 3.6, -0.53);
    if (ctx.boardTexture && ctx.plane) {
      const pSignMat = new THREE.MeshStandardMaterial({
        map: ctx.boardTexture('NARROMINE POLICE STATION', '49 MERILBA STREET · NSW POLICE', '#163e73', '#ffffff'),
        roughness: 0.65,
      });
      ctx.plane(pSignMat, pCornerX - 0.18, 2.55, pCornerZ, 3.4, 0.46, -0.53 + Math.PI / 2);
    }

    // Northern police vehicle garage outbuilding on Lot 5
    const gp = policeStation.garageWorld;
    addExtrudedFootprintWalls(push, mats.policeUpperWall, gp, 0.0, 2.9);
    addHippedRoof4(push, mats.policeRoof, gp, 2.9, 3.75, '0-1', 0.25);

    pushRotatedRectColliders(colliders, mainWing.pts, 3);
    pushRotatedRectColliders(colliders, northWing.pts, 3);
    pushRotatedRectColliders(colliders, gp, 1);
  }

  // ── 3. 47 Merilba Street: Narromine Courthouse (NSW Local Court) ────────────
  {
    const sp = localCourt.spineWorld;
    const pp = localCourt.porticoWorld;
    const ew = localCourt.eastWingWorld;
    const cl = localCourt.clerestoryWorld;
    const ax = localCourt.annexWorld;
    const { eaveHeightM, ridgeHeightM, clerestoryTopM, porticoEaveM, annexEaveM } =
      localCourt.dimensionsM;

    // Main north-south institutional buff-brick spine (26.0 m × 11.45 m)
    addExtrudedFootprintWalls(push, mats.courtDarkBrick, sp, 0.0, 0.55);
    addExtrudedFootprintWalls(push, mats.courtBuffBrick, sp, 0.55, eaveHeightM);
    addHippedRoof4(push, mats.courtRoof, sp, eaveHeightM, ridgeHeightM, '1-2', 0.4);

    // Eastern courtroom wing (9.25 m × 9.15 m)
    addExtrudedFootprintWalls(push, mats.courtDarkBrick, ew, 0.0, 0.55);
    addExtrudedFootprintWalls(push, mats.courtBuffBrick, ew, 0.55, eaveHeightM);
    addHippedRoof4(push, mats.courtRoof, ew, eaveHeightM, ridgeHeightM, '0-1', 0.35);

    // Raised central courtroom clerestory monitor (3.65 m -> 5.75 m) with clerestory ribbon windows
    addExtrudedFootprintWalls(push, mats.courtFascia, cl, eaveHeightM, clerestoryTopM);
    addHippedRoof4(push, mats.courtRoof, cl, clerestoryTopM, clerestoryTopM + 0.55, '0-1', 0.3);
    addEdgeWindows(box, mats.courtDarkBrick, mats.glass, cl[0], cl[1], 3, 4.85, 1.6, 0.65);
    addEdgeWindows(box, mats.courtDarkBrick, mats.glass, cl[2], cl[3], 3, 4.85, 1.6, 0.65);

    // Covered western Merilba Street entry portico with brick colonnade piers
    flatPoly(mats.concretePath, pp, 0.16);
    addExtrudedFootprintWalls(push, mats.courtFascia, pp, porticoEaveM - 0.45, porticoEaveM);
    flatPoly(mats.courtRoof, pp, porticoEaveM);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const px = pp[0][0] + (pp[3][0] - pp[0][0]) * t;
      const pz = pp[0][1] + (pp[3][1] - pp[0][1]) * t;
      box(mats.courtDarkBrick, px, (porticoEaveM - 0.45) * 0.5, pz, 0.38, porticoEaveM - 0.45, 0.38, 0.15);
    }

    // Glazed entry doors & high security windows along Merilba Street spine
    addEdgeWindows(box, mats.courtDarkBrick, mats.glass, sp[3], sp[0], 5, 2.05, 1.35, 1.45);
    addEdgeWindows(box, mats.courtDarkBrick, mats.glass, sp[0], sp[1], 3, 2.05, 1.25, 1.45);
    addEdgeWindows(box, mats.courtDarkBrick, mats.glass, ew[1], ew[2], 2, 2.15, 1.35, 1.25);

    // North-east registry/security annex
    addExtrudedFootprintWalls(push, mats.courtBuffBrick, ax, 0.0, annexEaveM);
    addHippedRoof4(push, mats.courtRoof, ax, annexEaveM, annexEaveM + 0.65, '1-2', 0.25);

    // Merilba Street "NARROMINE COURT HOUSE" signboard on portico fascia
    const portMidX = (pp[0][0] + pp[3][0]) * 0.5 - 0.12;
    const portMidZ = (pp[0][1] + pp[3][1]) * 0.5;
    const portYaw = Math.atan2(pp[3][0] - pp[0][0], pp[3][1] - pp[0][1]);
    if (ctx.boardTexture && ctx.plane) {
      const cSignMat = new THREE.MeshStandardMaterial({
        map: ctx.boardTexture('NARROMINE COURT HOUSE', 'NSW LOCAL COURT · 47 MERILBA ST', '#3b2b1d', '#f5efe6'),
        roughness: 0.68,
      });
      ctx.plane(cSignMat, portMidX, porticoEaveM - 0.22, portMidZ, 4.8, 0.48, portYaw - Math.PI / 2);
    }

    pushRotatedRectColliders(colliders, sp, 3);
    pushRotatedRectColliders(colliders, ew, 2);
    pushRotatedRectColliders(colliders, ax, 1);
  }

  // ── 4. 37 Burraway Street: Hub n Spoke Circular Atrium Co-Working Building ──
  {
    const [cx, cz] = hubNSpoke.centreWorld;
    const {
      coreOuterRadiusM: rOut,
      atriumInnerRadiusM: rIn,
      fanWingOuterRadiusM: rFan,
      coreEaveHeightM: yEave,
      coreApexHeightM: yApex,
      fanWingEaveHeightM: yFan,
      segments,
    } = hubNSpoke.dimensionsM;

    const outerPts = [];
    const innerPts = [];
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      outerPts.push([cx + Math.cos(a) * rOut, cz + Math.sin(a) * rOut]);
      innerPts.push([cx + Math.cos(a) * rIn, cz + Math.sin(a) * rIn]);
    }

    // Outer 16-sided drum wall + windows
    for (let i = 0; i < segments; i++) {
      const a = outerPts[i];
      const b = outerPts[(i + 1) % segments];
      addQuadWall(push, mats.hubWall, a, b, 0.0, yEave);
      addQuadWall(push, mats.hubAccent, a, b, yEave - 0.32, yEave);
      if (i % 2 === 0) {
        addEdgeWindows(box, mats.hubAccent, mats.glass, a, b, 1, 1.85, 1.55, 1.35);
      }
    }

    // Central open circular atrium oculus (glazed courtyard ring + inner garden turf)
    flatPoly(mats.atriumTurf, innerPts, 0.12);
    for (let i = 0; i < segments; i++) {
      const a = innerPts[(i + 1) % segments];
      const b = innerPts[i];
      addQuadWall(push, mats.glass, a, b, 0.0, yEave);
    }

    // Radial pitched annular roof rising from outer drum (rOut, yEave) to mid-ring (rMid, yApex)
    // and sloping down to the open central oculus ring (rIn, yEave + 0.25)
    const rMid = (rOut + rIn) * 0.52;
    for (let i = 0; i < segments; i++) {
      const i1 = (i + 1) % segments;
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = (i1 / segments) * Math.PI * 2;
      const m0 = [cx + Math.cos(a0) * rMid, yApex, cz + Math.sin(a0) * rMid];
      const m1 = [cx + Math.cos(a1) * rMid, yApex, cz + Math.sin(a1) * rMid];
      const o0 = [outerPts[i][0], yEave, outerPts[i][1]];
      const o1 = [outerPts[i1][0], yEave, outerPts[i1][1]];
      const n0 = [innerPts[i][0], yEave + 0.25, innerPts[i][1]];
      const n1 = [innerPts[i1][0], yEave + 0.25, innerPts[i1][1]];
      addQuadFace(push, mats.hubRoof, o0, o1, m1, m0);
      addQuadFace(push, mats.hubRoof, m0, m1, n1, n0);
    }

    // Two curved fan-shaped outer wing sectors (west & south sectors visible in NSW aerial imagery)
    const fanSectors = [
      [3, 7],   // South-east / south fan wing
      [9, 13],  // West / north-west Burraway entry fan wing
    ];
    for (const [s0, s1] of fanSectors) {
      for (let i = s0; i < s1; i++) {
        const i1 = (i + 1) % segments;
        const a0 = (i / segments) * Math.PI * 2;
        const a1 = (i1 / segments) * Math.PI * 2;
        const f0 = [cx + Math.cos(a0) * rFan, cz + Math.sin(a0) * rFan];
        const f1 = [cx + Math.cos(a1) * rFan, cz + Math.sin(a1) * rFan];
        addQuadWall(push, mats.hubWall, f0, f1, 0.0, yFan);
        addEdgeWindows(box, mats.hubAccent, mats.glass, f0, f1, 1, 1.7, 1.6, 1.25);
        addQuadFace(
          push,
          mats.hubRoof,
          [f0[0], yFan, f0[1]],
          [f1[0], yFan, f1[1]],
          [outerPts[i1][0], yEave - 0.1, outerPts[i1][1]],
          [outerPts[i][0], yEave - 0.1, outerPts[i][1]]
        );
      }
    }

    if (ctx.boardTexture && ctx.plane) {
      const hSignMat = new THREE.MeshStandardMaterial({
        map: ctx.boardTexture('HUB N SPOKE · 37 BURRAWAY ST', 'NARROMINE CO-WORKING & BUSINESS HUB', '#2f5d62', '#f4f1ea'),
        roughness: 0.68,
      });
      ctx.plane(hSignMat, cx - 3.5, 3.15, cz + 7.6, 4.2, 0.48, 0.53);
    }

    colliders.push([cx, cz, rOut * 0.85, rOut * 0.85]);
  }

  // ── 5. Forecourt Paths, Boundary Fences & Interactive Heritage Spots ────────
  for (const path of NARROMINE_COURTHOUSE_ACCESS.burrawayEntryPathsWorld) {
    flatPoly(mats.concretePath, path.pts, 0.11);
  }

  for (const fence of NARROMINE_COURTHOUSE_ACCESS.fencesWorld) {
    const dx = fence.b[0] - fence.a[0];
    const dz = fence.b[1] - fence.a[1];
    const len = Math.hypot(dx, dz) || 1;
    const yaw = Math.atan2(dx, dz);
    const mx = (fence.a[0] + fence.b[0]) * 0.5;
    const mz = (fence.a[1] + fence.b[1]) * 0.5;
    box(mats.fenceMat, mx, 0.55, mz, 0.09, 1.1, len, yaw);
  }

  const ep = NARROMINE_COURTHOUSE_ACCESS.pedestrianEntryPointsWorld;
  spots.push(
    {
      key: 'narromine-former-courthouse-35-burraway',
      label: 'Former Narromine Courthouse (1898 · 35 Burraway St)',
      pos: new THREE.Vector3(ep.formerCourthouseFront[0], 0, ep.formerCourthouseFront[1]),
      text:
        '35 Burraway Street (Lot 6, Section 17, DP 758759) — Narromine LEP 2011 Heritage Item I5 "Courthouse (former)". Built c. 1898 under NSW Government Architect Walter Liberty Vernon with a corrugated iron hipped roof, front verandah, and rear lock-up; later used as a local museum and Narromine Car Club clubrooms.',
    },
    {
      key: 'narromine-courthouse-47-merilba',
      label: 'Narromine Courthouse (NSW Local Court · 47 Merilba St)',
      pos: new THREE.Vector3(ep.localCourtFront[0], 0, ep.localCourtFront[1]),
      text:
        '47 Merilba Street (Lot 10, Section 17, DP 758759) — The operational Narromine Local Court house fronting Merilba Street, featuring a covered western colonnade portico, central courtroom clerestory monitor, and registry wing.',
    },
    {
      key: 'narromine-police-station-49-merilba',
      label: 'Narromine Police Station (49 Merilba St)',
      pos: new THREE.Vector3(ep.policeStationCorner[0], 0, ep.policeStationCorner[1]),
      text:
        '49 Merilba Street / Corner of Burraway & Merilba Streets (Lot 5, Section 17, DP 758759, osm:174) — Narromine Police Station & Residence wrapping around the 1898 Former Courthouse lot, with surveyed 2011 NSW Spatial Services LiDAR heights (3.16 m eave, 6.39 m ridge).',
    },
    {
      key: 'narromine-hub-n-spoke-37-burraway',
      label: 'Hub n Spoke (37 Burraway St)',
      pos: new THREE.Vector3(ep.hubNSpokeFront[0], 0, ep.hubNSpokeFront[1]),
      text:
        '37 Burraway Street (Lot 2 & Lot 12, Section 17, DP 758759) — Hub n Spoke, Narromine Shire Council’s circular radial-roofed co-working and business incubator building built around a central open circular atrium oculus.',
    }
  );

  if (standalone) {
    env.flush();
    return {
      group: env.group,
      colliders,
      spots,
      disambiguation: NARROMINE_COURTHOUSE_DISAMBIGUATION,
      cadastralLots: NARROMINE_COURTHOUSE_CADASTRAL_LOTS,
      buildings: NARROMINE_COURTHOUSE_BUILDINGS,
      integrationSpec: NARROMINE_COURTHOUSE_INTEGRATION_SPEC,
    };
  }

  return {
    colliders,
    spots,
    disambiguation: NARROMINE_COURTHOUSE_DISAMBIGUATION,
    cadastralLots: NARROMINE_COURTHOUSE_CADASTRAL_LOTS,
    buildings: NARROMINE_COURTHOUSE_BUILDINGS,
    integrationSpec: NARROMINE_COURTHOUSE_INTEGRATION_SPEC,
  };
}
