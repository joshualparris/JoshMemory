import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Builder, lampMaterial } from './builder.js';
import { buildExterior } from './exterior.js';

// Town layout: 26 columns (A–Z) × 8 rows (streets). Every house faces +z onto its
// street. Rows are merged into one mesh each so the whole town is ~10 draw calls.
export const LOT_X = 26, LOT_Z = 46;
const COLS = 26;

export function lotPosition(coordinate) {
  const col = coordinate.charCodeAt(0) - 65, row = parseInt(coordinate.slice(1), 10) - 1;
  return { x: (col - (COLS - 1) / 2) * LOT_X, z: row * LOT_Z - 3.5 * LOT_Z, row, col };
}

export function buildTown(scene, houses, streets) {
  const group = new THREE.Group();
  scene.add(group);
  const colliders = [];
  const width = COLS * LOT_X + 60, depth = 8 * LOT_Z + 60;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(width + 400, depth + 400), new THREE.MeshLambertMaterial({ color: 0x79b46f }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  group.add(ground);

  const deco = new Builder();
  const lampGlobes = [];
  const globeGeo = new THREE.SphereGeometry(0.28, 8, 6);
  for (let r = 0; r < 8; r++) {
    const z = r * LOT_Z - 3.5 * LOT_Z + 16;
    deco.box(0x4b4f55, width - 40, 0.04, 9, 0, 0.02, z);
    for (let i = 0; i < 60; i++) deco.box(0xf2efe6, 2.2, 0.05, 0.2, -width / 2 + 30 + i * (width - 60) / 60, 0.03, z);
    deco.box(0xc9c4b8, width - 40, 0.08, 1.6, 0, 0.04, z - 5.3);
    deco.box(0xc9c4b8, width - 40, 0.08, 1.6, 0, 0.04, z + 5.3);
    // Streetlamps along each street verge (clear of sidewalks and avenues)
    for (let c = 1; c < COLS; c += 3) {
      const lx = (c - (COLS - 1) / 2) * LOT_X + 9.5, lz = z - 6.6;
      deco.cyl(0x2d333b, 0.09, 3.8, lx, 1.9, lz);
      deco.box(0x2d333b, 0.35, 0.12, 0.35, lx, 3.8, lz);
      const g = globeGeo.clone();
      g.translate(lx, 4.05, lz);
      lampGlobes.push(g);
    }
  }
  // Cross avenues every 5 columns so the grid is walkable without zig-zagging between yards.
  for (let c = 0; c <= COLS; c += 5) deco.box(0x55595f, 7, 0.035, depth - 20, (c - COLS / 2) * LOT_X, 0.018, 0);
  // Border trees frame the town and hide the ground edge.
  for (let i = 0; i < 70; i++) {
    for (const z of [-depth / 2 - 6, depth / 2 + 6]) { const x = -width / 2 + i * width / 70; deco.cyl(0x6a4a2a, 0.3, 3, x, 1.5, z); deco.ball([0x4e8a46, 0x5a9a50, 0x467e40][i % 3], 2.2, x, 4.2, z); }
  }
  // Town Guide kiosk at the starting square (between M4 road and sidewalk, no collider so walkers pass freely)
  const guideZ = lotPosition('M4').z + 12.8;
  deco.cyl(0x6b4a2e, 0.12, 1.8, 0, 0.9, guideZ);
  deco.box(0x3a5a78, 1.5, 1.0, 0.14, 0, 1.75, guideZ);
  deco.box(0xf4efe4, 1.32, 0.82, 0.16, 0, 1.75, guideZ);
  deco.box(0xd99b38, 1.62, 0.14, 0.24, 0, 2.3, guideZ);
  group.add(deco.build());
  if (lampGlobes.length) {
    const mergedLamps = mergeGeometries(lampGlobes, false);
    for (const g of lampGlobes) g.dispose();
    group.add(new THREE.Mesh(mergedLamps, lampMaterial));
  }

  // One mesh per house: frustum culling then skips houses behind or beyond the fog.
  const lots = new Map();
  for (const h of houses) {
    const lot = lotPosition(h.coordinate);
    const hb = new Builder();
    const fp = buildExterior(hb, h.ext, h.ext);
    const mesh = hb.build();
    mesh.position.set(lot.x, 0, lot.z);
    group.add(mesh);
    colliders.push({ x0: lot.x - fp.w / 2, x1: lot.x + fp.w / 2, z0: lot.z - fp.d / 2, z1: lot.z + fp.front - 0.05 });
    for (const y of fp.yard) colliders.push({ x0: lot.x + y.x0, x1: lot.x + y.x1, z0: lot.z + y.z0, z1: lot.z + y.z1 });
    const doorPos = new THREE.Vector3(lot.x + fp.door.x, 0, lot.z + fp.front);
    lots.set(h.coordinate, { house: h, lot, fp, doorPos, mesh });
  }

  // Front doors are individual hinged leaves so they can swing open on approach.
  const doors = [];
  for (const { house, doorPos, fp } of lots.values()) {
    const hinge = new THREE.Group();
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(fp.door.w - 0.08, 2.42, 0.1), new THREE.MeshLambertMaterial({ color: house.ext.door || 0x6b4a2e }));
    leaf.position.set((fp.door.w - 0.08) / 2, 1.21, 0);
    hinge.add(leaf);
    hinge.position.set(doorPos.x - fp.door.w / 2 + 0.04, 0, doorPos.z + 0.02);
    hinge.userData = { open: 0, coordinate: house.coordinate, centre: doorPos.clone() };
    group.add(hinge);
    doors.push(hinge);
  }
  const doorZones = [...lots.values()].map(({ house, doorPos, fp }) => ({
    coordinate: house.coordinate, x0: doorPos.x - fp.door.w / 2 + 0.15, x1: doorPos.x + fp.door.w / 2 - 0.15, z0: doorPos.z - 0.1, z1: doorPos.z + 0.6,
  }));

  const guidePos = new THREE.Vector3(0, 0, guideZ);
  return { group, ground, colliders, lots, doors, doorZones, streets, guidePos, bounds: { width, depth } };
}

// Street-name signs at both ends of each street, plus the Town Guide sign near spawn.
export function streetSigns(group, streets, makeLabel) {
  streets.forEach((name, r) => {
    const z = r * LOT_Z - 3.5 * LOT_Z + 16;
    for (const x of [-(COLS / 2) * LOT_X - 8, (COLS / 2) * LOT_X + 8]) {
      const s = makeLabel(`${name} · row ${r + 1}`, 'street');
      s.position.set(x, 3.6, z);
      group.add(s);
    }
  });
  const guideLabel = makeLabel('🗺️ Town Guide', 'interactive');
  guideLabel.position.set(0, 2.75, lotPosition('M4').z + 12.8);
  group.add(guideLabel);
}
