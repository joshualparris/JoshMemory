// Cadastral lot boundaries as one thin line object. A debug/QA overlay: hidden unless the page URL
// has ?lots=1. It is a single LineSegments draw call with no meshes and no colliders, so it cannot
// affect driving, walking or collisions. Lines sit just above the road surfaces (asphalt 0.075).
import * as THREE from 'three';
import { narromineLots } from './narromine-lots.js';
import { toWorld } from './narromine-layout.js';

export const LOT_LINE_Y = 0.12;
export const lotLinesRequested = () => typeof location !== 'undefined' && /[?&]lots=1(&|$)/.test(location.search || '');

export function buildNarromineLotLines(parent, { visible = lotLinesRequested() } = {}) {
  const lots = narromineLots(), pos = [];
  for (const { pts } of lots) {
    for (let i = 0; i < pts.length; i++) {
      const [ax, az] = toWorld(pts[i]), [bx, bz] = toWorld(pts[(i + 1) % pts.length]);
      pos.push(ax, LOT_LINE_Y, az, bx, LOT_LINE_Y, bz);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffd23f }));
  lines.name = 'Narromine lot boundaries (NSW cadastre, debug ?lots=1)';
  lines.visible = visible; lines.frustumCulled = false;
  parent.add(lines);
  return { lines, lotCount: lots.length, segmentCount: pos.length / 6 };
}
