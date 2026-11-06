// Roof forms of traced footprints come from the 2023 LiDAR where it covers them; elsewhere unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { NARROMINE_ROOF_FORMS, NARROMINE_FOOTPRINTS_WITHOUT_LIDAR_ROOF } from '../src/world/narromine-roof-forms-data.js';
import { NARROMINE_FOOTPRINTS } from '../src/world/narromine-footprints-data.js';
import { FILL_HOUSES } from '../src/world/narromine-layout.js';
import { buildNarromine } from '../src/world/narromine.js';

const keys = new Set(NARROMINE_FOOTPRINTS.map(([x, z]) => x.toFixed(1) + ',' + z.toFixed(1)));
const forms = Object.entries(NARROMINE_ROOF_FORMS), kinds = {};
for (const [k, f] of forms) {
  assert(keys.has(k), k + ' is a real footprint');
  assert.match(f, /^(flat|hip-[wd]|gable-[wd]|skillion[+-][wd])$/, k + ' has a known form');
  const base = f.split(/[-+]/)[0]; kinds[base] = (kinds[base] || 0) + 1;
}
assert(forms.length > 300, 'hundreds of LiDAR-classified roofs');
assert(kinds.hip > kinds.gable && kinds.gable > 0 && kinds.skillion > 0 && kinds.flat > 0, 'hipped roofs most common, all forms present');
for (const k of NARROMINE_FOOTPRINTS_WITHOUT_LIDAR_ROOF) { assert(keys.has(k)); assert(!(k in NARROMINE_ROOF_FORMS), 'no form invented without points'); }
const header = fs.readFileSync(new URL('../src/world/narromine-roof-forms-data.js', import.meta.url), 'utf8').slice(0, 700);
assert.match(header, /2023/); assert.match(header, /CC BY 4\.0/);

// The scene builds with every form, and drawn houses use them.
const drawn = FILL_HOUSES.filter(h => NARROMINE_ROOF_FORMS[h.x.toFixed(1) + ',' + h.z.toFixed(1)]).length;
assert(drawn > 300, `drawn houses with a measured roof form: ${drawn}`);
const n = buildNarromine(new THREE.Group());
assert(n.colliders.length > 0);
const src = fs.readFileSync(new URL('../src/world/narromine.js', import.meta.url), 'utf8');
assert.match(src, /footprintRoof\(roofColour\(h, HOUSE_ROOFS\[h\.tone\]\), h, wall, roofH, HOUSE_WALLS\[h\.tone\]\)/);
// Helpers must be declared before the house loop that calls them (const functions are not hoisted).
assert(src.indexOf('const hipRoof') < src.indexOf('const footprintRoof') && src.indexOf('const gableRoof') < src.indexOf('const footprintRoof'));
assert(src.indexOf('const footprintRoof') < src.indexOf('for (const h of FILL_HOUSES)'));
console.log(`PASS roof forms: ${forms.length} LiDAR-classified (${Object.entries(kinds).map(([k, v]) => k + ' ' + v).join(', ')}), ${drawn} drawn houses use them; ${NARROMINE_FOOTPRINTS_WITHOUT_LIDAR_ROOF.length} footprints listed with no 2023 roof`);
