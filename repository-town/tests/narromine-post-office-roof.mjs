// DISC-NR-007: the Post Office's two-storey wings share one L-shaped hipped roof.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { DETAILED } from '../src/world/narromine-layout.js';
import { NARROMINE_POST_OFFICE_ID } from '../src/world/narromine-post-office.js';
import { postOfficeRoofPlan, buildNarrominePostOfficeRoof, isPostOfficeRoofPart, POST_OFFICE_EAVE_H }
  from '../src/world/narromine-post-office-roof.js';

const site = DETAILED.find(d => d.id === NARROMINE_POST_OFFICE_ID);
assert.equal(site.address, '74 Dandaloo Street');
const north = site.parts.find(p => p.name === 'north wing'), front = site.parts.find(p => p.name === 'Dandaloo Street front');
const plan = postOfficeRoofPlan();

// Heights come straight from 2023 LiDAR.
assert.equal(north.lidar[0], 2023);
assert.equal(plan.eave, north.lidar[2], 'eave = north wing LiDAR p5');
assert.equal(plan.ridge, (north.lidar[3] + front.lidar[3]) / 2, 'ridge = mean LiDAR p98 of both wings');
assert.equal(POST_OFFICE_EAVE_H, plan.eave);
assert(plan.ridge - plan.eave > 0.5 && plan.ridge - plan.eave < 1.2, 'shallow hip, as measured');
for (const k of 'ABCDEF') assert.equal(plan.points[k][1], plan.eave, k + ' is on the eave');
for (const k of 'WJS') assert.equal(plan.points[k][1], plan.ridge, k + ' is on the ridge: both ridges meet without a step');

// Six facets, each planar.
assert.equal(Object.keys(plan.facets).length, 6);
for (const [name, ids] of Object.entries(plan.facets)) {
  const [a, b, c, ...rest] = ids.map(k => new THREE.Vector3(...plan.points[k]));
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  for (const p of rest) assert(Math.abs(n.dot(p.clone().sub(a))) < 1e-6, name + ' is planar');
}

// The facets tile the L exactly: their plan area equals the two arms minus their overlap.
const area = (ids) => { let s = 0; for (let i = 0; i < ids.length; i++) { const p = plan.local[ids[i]], q = plan.local[ids[(i + 1) % ids.length]]; s += p[0] * q[1] - q[0] * p[1]; } return Math.abs(s) / 2; };
const { north: nA, dandaloo: dA } = plan.arms;
const lArea = (nA.uE - nA.uW) * (nA.vS - nA.vN) + (dA.uE - dA.uW) * (dA.vS - dA.vN) - (dA.uE - dA.uW) * (nA.vS - nA.vN);
const facetArea = Object.values(plan.facets).reduce((s, ids) => s + area(ids), 0);
assert(Math.abs(facetArea - lArea) < 1e-6, `facets cover the L (${facetArea.toFixed(2)} vs ${lArea.toFixed(2)} m²)`);

// The roof covers both traced wings and nothing in the yard inside the L.
const toWorld = ([u, v]) => [plan.frame.origin[0] + u * plan.frame.u[0] + v * plan.frame.v[0], plan.frame.origin[1] + u * plan.frame.u[1] + v * plan.frame.v[1]];
for (const p of [...north.pts, ...front.pts]) {
  const h = plan.heightAt(...p);
  assert(h !== null && h >= plan.eave && h <= plan.ridge, 'traced wall corner is under the roof');
}
assert.equal(plan.heightAt(...toWorld([dA.uW - 2, nA.vS + 2])), null, 'no roof over the yard inside the L');
assert(Math.abs(plan.heightAt(...toWorld(plan.local.J)) - plan.ridge) < 1e-9);

// Built geometry: one roof mesh facing up, capping, fascia, soffit and the mast.
const pushed = [], boxes = [];
buildNarrominePostOfficeRoof({ push: (c, g) => pushed.push([c, g]), box: (...a) => boxes.push(a) }, plan);
const roof = pushed[0][1], pos = roof.attributes.position, nrm = roof.attributes.normal;
assert.equal(pos.count, 3 * (4 * 2 + 2 * 1), '10 roof triangles');
for (let i = 0; i < nrm.count; i++) assert(nrm.getY(i) > 0.9, 'roof faces up');
assert.equal(pushed.length, 1 + 2 + 5 + 1 + 6, 'roof + 2 ridges + 5 hips + 1 valley + 6 fascia boards');
const mast = boxes.find(b => b[0] === 0xb0b2b4 && b[2] === 4);
assert(Math.abs(mast[5] - 2 - plan.heightAt(mast[4], mast[6])) < 1e-9, 'mast stands on the roof, not through it');

// Wiring: only the two wings are taken over, and the generic roof is not also drawn under the new one.
assert(isPostOfficeRoofPart(NARROMINE_POST_OFFICE_ID, 'north wing'));
assert(isPostOfficeRoofPart(NARROMINE_POST_OFFICE_ID, 'Dandaloo Street front'));
assert(!isPostOfficeRoofPart(NARROMINE_POST_OFFICE_ID, 'rear section'));
assert(!isPostOfficeRoofPart('royal-hotel', 'north wing'));
const src = fs.readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.match(src, /const wallH = poRoof \? POST_OFFICE_EAVE_H :/);
assert.match(src, /if \(p\.fascia && !poRoof\)/);
assert.match(src, /if \(p\.mast && !poRoof\)/);
assert.match(src, /if \(poRoof\) \{[^}]*\}\s*else if \(p\.roof === 'hip'\)/);
assert.equal(src.match(/buildNarrominePostOfficeRoof\(/g).length, 1);

console.log(`PASS Post Office L-shaped hipped roof: eave ${plan.eave} m, ridge ${plan.ridge} m, ${facetArea.toFixed(1)} m² over six planar facets`);
