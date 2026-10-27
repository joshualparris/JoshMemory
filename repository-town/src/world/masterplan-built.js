// Builds the selected master plan (alternative D, research/masterplan/README.md) into the town:
// named, connected roads that tie into Street 8, surveyed parcels with boundary posts and
// numbered letterboxes, and street addresses. The geometry and numbering come from
// masterplan-model.js so the audit, the 3D town, driving and the map all share one source.
//
// Addressing follows the NSW urban convention used by councils applying the NSW Address
// Policy and User Manual: sequential numbers from the road's datum (its town end), odd on the
// left and even on the right when travelling away from the datum. These are fictional
// in-game addresses, not Geographical Names Board approvals.
import * as THREE from 'three';
import { SELECTED_PLAN, CORE_ROADS, planAddresses, roadRect, graph } from './masterplan-model.js';

// Fictional names: native plants for residential streets, working names for the farm and
// employment links. Links that continue an existing avenue line keep one name end to end.
export const PLAN_ROAD_NAMES = Object.freeze({
  'local-south': 'Wattle Street',
  'local-north': 'Banksia Street',
  'core-link-0': 'Kurrajong Road',
  'core-link-1': 'Bottlebrush Road',
  'core-link-2': 'Silo Lane',
  'employment-access': 'Saleyards Road',
});

const USE_LABEL = { residential: 'Residential lot', community: 'Community campus', park: 'Neighbourhood park', employment: 'Employment lot', buffer: 'Landscape buffer' };

export const PLAN_ROADS = Object.freeze(SELECTED_PLAN.roads.map((r) => Object.freeze({ ...r, name: PLAN_ROAD_NAMES[r.id] || r.id })));

const ADDRESS_RECORDS = planAddresses(SELECTED_PLAN);
export const PLAN_PARCELS = Object.freeze(SELECTED_PLAN.parcels.map((p) => {
  const a = ADDRESS_RECORDS.find((x) => x.parcelId === p.id);
  const roadName = a ? PLAN_ROAD_NAMES[a.roadId] : null;
  return Object.freeze({
    ...p,
    label: USE_LABEL[p.use] || p.use,
    number: a ? a.number : null,
    roadName,
    side: a ? a.side : null,
    address: a && roadName ? `${a.number} ${roadName}` : null,
    areaM2: p.w * p.d,
  });
}));

// One driveable road surface list for player driving: the existing streets and avenues
// bounded to their drawn extents (they used to be treated as infinitely long) plus the plan.
const pad = (rect, m) => ({ x0: rect.x0 - m, x1: rect.x1 + m, z0: rect.z0 - m, z1: rect.z1 + m });
export const DRIVEABLE_RECTS = Object.freeze([...CORE_ROADS, ...PLAN_ROADS].map((r) => Object.freeze(pad(roadRect(r), 0.5))));
export function onPlannedOrCoreRoad(x, z) {
  return DRIVEABLE_RECTS.some((b) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1);
}

// Junctions between plan roads and the existing streets, for signs and the map.
export function planJunctions() {
  const g = graph([...CORE_ROADS, ...PLAN_ROADS]);
  const byId = new Map([...CORE_ROADS, ...PLAN_ROADS].map((r) => [r.id, r]));
  return g.nodes.filter((n) => {
    const ids = new Set(n.edges.map((e) => e.roadId));
    return ids.size > 1 && [...ids].some((id) => PLAN_ROAD_NAMES[id]);
  }).map((n) => ({ x: n.x, z: n.z, roads: [...new Set(n.edges.map((e) => e.roadId))].map((id) => byId.get(id)?.name || id) }));
}

export function buildMasterplan(group, makeLabel = null) {
  const root = new THREE.Group(); root.name = 'Master plan D: southern neighbourhood';
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const asphalt = mat(0x4c4f52), path = mat(0xb9b4a8), line = mat(0xece6cf), lawn = mat(0x86b86e), lawnAlt = mat(0x7eaf68),
    post = mat(0x6e5a44), boxMat = mat(0x2f5d8c), parkMat = mat(0x6fae5a), campusMat = mat(0xa9b39a), workMat = mat(0xb3a586);
  const box = (m, w, h, d, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); root.add(o); return o; };

  for (const r of PLAN_ROADS) {
    const horizontal = r.a.z === r.b.z, len = horizontal ? Math.abs(r.b.x - r.a.x) : Math.abs(r.b.z - r.a.z);
    const cx = (r.a.x + r.b.x) / 2, cz = (r.a.z + r.b.z) / 2;
    // Carriageway, then a footpath inside each side of the 20 m reserve.
    box(asphalt, horizontal ? len + r.width : r.width, 0.03, horizontal ? r.width : len + r.width, cx, 0.012, cz).name = r.name;
    for (const s of [-1, 1]) {
      const off = r.width / 2 + 1.6;
      if (horizontal) box(path, len, 0.05, r.footpath, cx, 0.02, cz + s * off);
      else box(path, r.footpath, 0.05, len, cx + s * off, 0.02, cz);
    }
    // Dashed centre line.
    for (let t = 4; t < len - 2; t += 9) {
      const p = horizontal ? { x: Math.min(r.a.x, r.b.x) + t, z: cz } : { x: cx, z: Math.min(r.a.z, r.b.z) + t };
      box(line, horizontal ? 3 : 0.15, 0.035, horizontal ? 0.15 : 3, p.x, 0.03, p.z);
    }
  }

  for (const [i, p] of PLAN_PARCELS.entries()) {
    const m = p.use === 'park' ? parkMat : p.use === 'community' ? campusMat : p.use === 'employment' ? workMat : (i % 2 ? lawn : lawnAlt);
    box(m, p.w - 0.4, 0.04, p.d - 0.4, p.x, 0.005, p.z).name = `${p.id} ${p.address || p.label}`;
    // Corner survey posts mark the boundary without blocking movement.
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(post, 0.12, 0.7, 0.12, p.x + sx * (p.w / 2 - 0.2), 0.35, p.z + sz * (p.d / 2 - 0.2));
    const road = PLAN_ROADS.find((r) => r.id === p.roadId);
    if (!road || !p.number) continue;
    // Letterbox at the road frontage, a metre inside the boundary.
    const horizontal = road.a.z === road.b.z;
    const dir = horizontal ? Math.sign(road.a.z - p.z) : Math.sign(road.a.x - p.x);
    const fx = horizontal ? p.x - p.w / 2 + 1.5 : p.x + dir * (p.w / 2 - 1);
    const fz = horizontal ? p.z + dir * (p.d / 2 - 1) : p.z - p.d / 2 + 1.5;
    box(post, 0.1, 1.0, 0.1, fx, 0.5, fz);
    box(boxMat, 0.45, 0.3, 0.3, fx, 1.1, fz);
    if (makeLabel) {
      const tag = makeLabel(`${p.number}`, 'interactive');
      tag.scale.multiplyScalar(0.45); tag.position.set(fx, 1.75, fz); root.add(tag);
      if (p.use !== 'residential') {
        const big = makeLabel(`${p.label} · ${p.address}`, 'house');
        big.position.set(p.x, 3.4, p.z); root.add(big);
      }
    }
  }

  if (makeLabel) {
    for (const j of planJunctions()) {
      const s = makeLabel(j.roads.join(' / '), 'street');
      s.scale.multiplyScalar(0.8); s.position.set(j.x + 6, 3.2, j.z + 6); root.add(s);
    }
  }
  group.add(root);
  return { group: root, roads: PLAN_ROADS, parcels: PLAN_PARCELS };
}
