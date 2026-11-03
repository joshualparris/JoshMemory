// Live Three.js geometry for Kierath's Shopping Square. The route is OPEN AIR:
// no solid box spans the courtyard. 10 individual bays flank it, with a separate
// round kiosk and a genuinely open arched rear canopy (rather than a blocked shed).
import * as THREE from 'three';
import { geoToWorld } from './narromine-layout.js';
import { siteToGeo, KIERATHS_ROUTE, KIERATHS_SHOPS, KIERATHS_KIOSK,
  KIERATHS_CANOPY, KIERATHS_REAR_PARKING } from './narromine-kieraths-data.js';

const world = p => geoToWorld(...siteToGeo(p));
const V = p => { const [x, z] = world(p); return new THREE.Vector3(x, 0, z); };
const BRICK = 0x995741, ROOF = 0x929ba0, FASCIA = 0xe2e1dc;
const FRAME = 0x58636a, GLASS = 0x354e5d, STEEL = 0x687579;

export function buildKieraths({ box, push, strip, flatPoly, plane, boardTexture, colliders, spots }) {
  const line = (colour, a, b, width = 0.1) => {
    const v0 = V(a), v1 = V(b), dx = v1.x - v0.x, dz = v1.z - v0.z;
    strip(colour, v0.x, v0.z, v1.x, v1.z, width, 0.14, 0.04);
    return { dx, dz };
  };
  const place = (colour, w, h, d, p, y, ry = 0) => {
    const [x, z] = world(p); box(colour, w, h, d, x, y, z, ry);
  };
  const beam = (colour, from, to, radius = 0.055) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const v = b.clone().sub(a), length = v.length();
    if (length < 0.005) return;
    const g = new THREE.CylinderGeometry(radius, radius, length, 6);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()));
    g.translate(...a.clone().add(b).multiplyScalar(0.5).toArray());
    push(colour, g);
  };
  const wp = (p, y) => { const [x, z] = world(p); return [x, y, z]; };

  // Rear parking forecourt, not an extra arbitrary shopping-centre footprint.
  flatPoly(0x616366, KIERATHS_REAR_PARKING.map(world), 0.083);
  for (let k = 0; k < 3; k++) {
    const x = -57 + k * 4.5;
    line(0xd5d2c8, [x, -40.4], [x + 1.2, -34.0], 0.13);
  }

  // Offset, paved pedestrian passage: open above, with no through-wall or roof collider.
  for (let i = 1; i < KIERATHS_ROUTE.length; i++) {
    const a = world(KIERATHS_ROUTE[i - 1]), b = world(KIERATHS_ROUTE[i]);
    strip(0xc1b5a5, ...a, ...b, 4.75, 0.091, 0.075);
    strip(0xa89989, ...a, ...b, 0.10, 0.133, 0.01);
  }
  // Tiled strips make the court legible, but are entirely flush with the paving.
  for (let i = 1; i < KIERATHS_ROUTE.length; i++) {
    const a = KIERATHS_ROUTE[i - 1], b = KIERATHS_ROUTE[i], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    for (let k = 1; k < len; k += 2.15) {
      const x = a[0] + dx * k / len, z = a[1] + dz * k / len, nx = -dz / len, nz = dx / len;
      const p = world([x - 2.25 * nx, z - 2.25 * nz]), q = world([x + 2.25 * nx, z + 2.25 * nz]);
      strip(0xb1a391, ...p, ...q, 0.055, 0.140, 0.005);
    }
  }

  for (const bay of KIERATHS_SHOPS) {
    const pts = bay.pts.map(world);
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const mass = new THREE.ExtrudeGeometry(shape, { depth: 3.75, bevelEnabled: false });
    mass.rotateX(-Math.PI / 2); push(BRICK, mass);
    // Individual galvanised roofs, distinct from a covered indoor shopping mall.
    const [a, b, c, d] = bay.pts;
    const front = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const rear = [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2];
    const depth = Math.hypot(front[0] - rear[0], front[1] - rear[1]);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const yaw = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const mid = [(front[0] + rear[0]) / 2, (front[1] + rear[1]) / 2];
    place(ROOF, len + 0.3, 0.16, depth + 0.3, mid, 3.87, yaw);
    place(FASCIA, len + 0.08, 0.5, 0.18, front, 3.42, yaw);
    // Glazed independent shopfronts: dark aluminium mullions and central door.
    const glass = world(front);
    const face = bay.side === 'north' ? 0.13 : -0.13;
    place(GLASS, len - 0.28, 2.65, 0.14, [front[0], front[1] + face], 1.47, yaw);
    for (let n = 0; n <= Math.max(2, Math.round(len / 1.45)); n++) {
      const count = Math.max(2, Math.round(len / 1.45)), t = n / count;
      place(FRAME, 0.07, 2.8, 0.13, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + face * 1.1], 1.45, yaw);
    }
    place(FRAME, len - 0.25, 0.065, 0.15, [front[0], front[1] + face], 2.73, yaw);
    const handle = [front[0], front[1] + face * 2.0];
    place(0xc6c9c7, 0.08, 0.38, 0.06, handle, 1.25, yaw);

    // Photo evidence: narrow white/grey cantilevered shop awnings on steel posts.
    const towardAisle = bay.side === 'north' ? 1 : -1;
    place(FASCIA, len + 0.12, 0.12, 1.05, [front[0] - 0.10, front[1] + 0.50 * towardAisle], 3.19, yaw);
    for (const t of [0.06, 0.94]) {
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + 0.83 * towardAisle];
      place(STEEL, 0.09, 3.05, 0.09, p, 1.53);
      const [x, z] = world(p); colliders.push({ x0: x - 0.1, x1: x + 0.1, z0: z - 0.1, z1: z + 0.1 });
    }
    // Split the angled walls into short AABBs so a giant bounding rectangle
    // cannot unexpectedly block the centre of the diagonally offset arcade.
    const slices = Math.max(3, Math.ceil(len / 1.2));
    for (let i = 0; i < slices; i++) {
      const t = (i + 0.5) / slices;
      const fx = a[0] + (b[0] - a[0]) * t, fz = a[1] + (b[1] - a[1]) * t;
      const bx = d[0] + (c[0] - d[0]) * t, bz = d[1] + (c[1] - d[1]) * t;
      const p = world([(fx + bx) / 2, (fz + bz) / 2]);
      const radiusX = Math.abs(bx - fx) / 2 + Math.abs(b[0] - a[0]) / slices / 2;
      const radiusZ = Math.abs(bz - fz) / 2 + Math.abs(b[1] - a[1]) / slices / 2;
      colliders.push({ x0: p[0] - radiusX, x1: p[0] + radiusX, z0: p[1] - radiusZ, z1: p[1] + radiusZ });
    }
  }

  // Round front kiosk. Only the kiosk itself collides; the forecourt remains walkable.
  const kiosk = KIERATHS_KIOSK, [kx, kz] = world(kiosk.at);
  const base = new THREE.CylinderGeometry(kiosk.radius, kiosk.radius, kiosk.height, 18);
  base.translate(kx, kiosk.height / 2, kz); push(0xb7a99a, base);
  const glazing = new THREE.CylinderGeometry(kiosk.radius + 0.025, kiosk.radius + 0.025, 1.4, 18);
  glazing.translate(kx, 1.72, kz); push(GLASS, glazing);
  const cap = new THREE.CylinderGeometry(kiosk.radius + 0.28, kiosk.radius + 0.25, 0.18, 20);
  cap.translate(kx, kiosk.height + 0.05, kz); push(FASCIA, cap);
  for (let i = 0; i < 12; i++) {
    const t = i / 12 * Math.PI * 2;
    place(FRAME, 0.075, 1.45, 0.075, [kiosk.at[0] + Math.cos(t) * kiosk.radius, kiosk.at[1] + Math.sin(t) * kiosk.radius], 1.72);
  }
  colliders.push({ x0: kx - kiosk.radius, x1: kx + kiosk.radius, z0: kz - kiosk.radius, z1: kz + kiosk.radius });

  // Real arched ENTRANCE shelter: a thin curved metal skin above an open walkway.
  // Long axis follows the diagonal rear-passage route, not the map's x/y axes.
  const canopy = KIERATHS_CANOPY, p = canopy.back, q = canopy.front;
  const dx = q[0] - p[0], dz = q[1] - p[1], length = Math.hypot(dx, dz);
  const nx = -dz / length, nz = dx / length;
  const at = (t, cross) => [p[0] + dx * t + nx * cross, p[1] + dz * t + nz * cross];
  const archY = cross => canopy.eaves + (canopy.crown - canopy.eaves) * (1 - Math.pow(2 * cross / canopy.width, 2));
  const mesh = [];
  const widthSteps = 16;
  for (let j = 0; j < widthSteps; j++) {
    const c0 = (j / widthSteps - 0.5) * canopy.width, c1 = ((j + 1) / widthSteps - 0.5) * canopy.width;
    const a = wp(at(0, c0), archY(c0)), b = wp(at(1, c0), archY(c0));
    const c = wp(at(1, c1), archY(c1)), d = wp(at(0, c1), archY(c1));
    mesh.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(mesh, 3));
  shell.computeVertexNormals(); push(0xc2c9c9, shell);
  for (const t of [0, 0.5, 1]) {
    for (let i = 0; i < widthSteps; i++) {
      const c0 = (i / widthSteps - 0.5) * canopy.width, c1 = ((i + 1) / widthSteps - 0.5) * canopy.width;
      beam(STEEL, wp(at(t, c0), archY(c0) - 0.09), wp(at(t, c1), archY(c1) - 0.09), 0.065);
    }
    for (const edge of [-canopy.width / 2, canopy.width / 2]) {
      const foot = at(t, edge), [x, z] = world(foot);
      beam(STEEL, [x, 0.1, z], [x, canopy.eaves, z], 0.092);
      if (t !== 0.5) colliders.push({ x0: x - 0.12, x1: x + 0.12, z0: z - 0.12, z1: z + 0.12 });
    }
  }
  for (const edge of [-canopy.width / 2, canopy.width / 2])
    beam(STEEL, wp(at(0, edge), canopy.eaves), wp(at(1, edge), canopy.eaves), 0.07);
  if (typeof document !== 'undefined') {
    const tex = boardTexture(["KIERATH'S", "SHOPPING SQUARE"], { bg: '#eeeeea', fg: '#234d40', border: '#eeeeea', w: 600, h: 230 });
    const [x, z] = world(at(0, 0));
    // Rear-facing sign, visible on foot from the rear car park.
    plane(tex, 3.75, 1.42, x - 0.25, 4.22, z - 0.04, -Math.PI / 2 + Math.atan2(dz, dx));
  }

  // Historic photograph: a small grey roller shutter with a red-and-yellow
  // Liquorland band immediately to the RIGHT of the rear canopy. Its business
  // sign is a dated visual reference, NOT a statement about current occupancy.
  // Placed outside the arch's pedestrian opening and inside the traced parcel.
  const shutter = [-38.5, -26.55], rearYaw = -Math.PI / 2;
  place(0xb0b1ae, 4.55, 4.15, 0.21, shutter, 2.07, rearYaw);
  place(0x88949a, 3.47, 2.72, 0.26, [shutter[0]-0.13, shutter[1]], 1.57, rearYaw);
  for (let k = 0; k < 14; k++)
    place(k % 2 ? 0x6c7b83 : 0xc0c6c5, 3.39, 0.028, 0.03,
      [shutter[0]-0.29, shutter[1]], 0.31 + 0.19 * k, rearYaw);
  for (const z of [shutter[1]-1.83, shutter[1]+1.83])
    place(0x8a8c89, 0.2, 2.9, 0.18, [shutter[0]-0.29, z], 1.52, rearYaw);
  if (typeof document !== 'undefined') {
    const historicalSign = boardTexture(['LIQUORLAND'], {
      bg: '#b02525', fg: '#ffdd54', border: '#d9c14a', w: 768, h: 170
    });
    const [x,z] = world([shutter[0]-0.31, shutter[1]]);
    plane(historicalSign, 3.83, 0.76, x, 3.55, z, -Math.PI / 2);
  }
  // The rear shutter is a wall, not a walk-through doorway. Keep its thin
  // collision rectangle separate from the nearby open arch.
  const [shx, shz] = world(shutter);
  colliders.push({ x0: shx - 0.16, x1: shx + 0.16,
    z0: shz - 2.3, z1: shz + 2.3 });

  // The rear-facing white Coles gable sign and metal plant visible in historic photos.
  if (typeof document !== 'undefined') {
    const tex = boardTexture(['coles'], { bg: '#f7f7f7', fg: '#cf1836', border: '#f7f7f7', w: 512, h: 180 });
    const [x, z] = world([-45, 7.4]);
    plane(tex, 5.4, 1.65, x - 0.2, 7.85, z, -Math.PI / 2);
  }
  for (const [sx, sz, w, d] of [[-32, 3, 4.5, 2.8], [-26, 4.5, 3.1, 3.2], [-19, 8, 2.5, 2.1]]) {
    place(0x9bacae, w, 1.0, d, [sx, sz], 8.65);
    place(0x5c6971, w - 0.35, 0.08, d - 0.35, [sx, sz], 9.18);
  }

  const [sx, sz] = world([-14, -27.4]);
  spots.push({ key: 'narromine:kieraths-shopping-square', label: "Kierath's Shopping Square",
    pos: new THREE.Vector3(sx, 0, sz), text: "Kierath's Shopping Square · Historic open-air arcade beside Coles; ten numbered units, a round front kiosk and the arched rear-car-park entrance. Shop occupancies and exact dimensions not verified." });
}
