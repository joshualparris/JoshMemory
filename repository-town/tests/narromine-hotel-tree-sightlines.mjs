// NR-HOTEL-TREE-SIGHTLINE-001: remove only unsurveyed street-tree guesses
// which obscure the cadastral Narromine Hotel street frontage.
// No Google Street View content or pixels are imported.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STREETS, DETAILED } from '../src/world/narromine-layout.js';
import { planDandalooSouth, planDandalooStreetscape } from '../src/world/narromine-dandaloo-streetscape-data.js';

const hotel=DETAILED.find(d=>d.id==='narromine-hotel');
assert(hotel,'hotel must remain in cadastral detailed inventory');
const frontage=hotel.verandahs.find(v=>v.name==='Dandaloo Street verandah');
assert(frontage?.pts.length===4,'mapped hotel Dandaloo verandah should remain explicit');
const zs=frontage.pts.map(([,z])=>z);
assert(zs.every(Number.isFinite),'hotel frontage world Z finite');
const min=Math.min(...zs)-12,max=Math.max(...zs)+12;
assert(max-min>=40&&max-min<=65,'conservative frontage corridor must not expand to whole street');
const isEstimatedHotelTree=({z})=>z>=min&&z<=max;
const before=planDandalooSouth(STREETS);
const after=planDandalooSouth(STREETS,()=>true,{excludeTreeAt:isEstimatedHotelTree});
const intended=before.trees.filter(isEstimatedHotelTree);
assert.equal(intended.length,4,'four unsurveyed generic tree guesses beside hotel sightline');
assert.equal(after.trees.length,before.trees.length-intended.length,'drop just those four trees');
assert(after.trees.every(t=>!isEstimatedHotelTree(t)),'no generated round-canopy trees obscure hotel frontage');
assert.deepEqual(after.trees,before.trees.filter(t=>!isEstimatedHotelTree(t)),'all other trees retained at original coordinates');
for(const key of ['lamps','poles','kerbs'])assert.deepEqual(after[key],before[key],key+' unchanged and streets remain usable');
const medianBefore=planDandalooStreetscape(STREETS);
assert(medianBefore.trees.length>=10 && medianBefore.lamps.length>=8,'northern median landscaping unchanged');
assert.equal(hotel.trees.length,4,'four separate mapped hotel-lot trees still available in detailed model');
const hotelBuilder=fs.readFileSync(new URL('../src/world/narromine-hotel.js',import.meta.url),'utf8');
assert(hotelBuilder.includes('for (const [tx, tz] of nh.trees || [])'),'hotel-owned rear trees not removed');
assert(hotelBuilder.includes('for (const ts of [21.5, 33.8])'),'hotel-specific photographed kerb tree models unchanged');
const scene=fs.readFileSync(new URL('../src/world/narromine.js',import.meta.url),'utf8');
assert(scene.includes('excludeSouthTreeAt')&&scene.includes('hotelFrontage?.pts.map'),'real 3D scene uses the frontage-derived exclusion');
const builder=fs.readFileSync(new URL('../src/world/narromine-dandaloo-streetscape.js',import.meta.url),'utf8');
assert(builder.includes('excludeTreeAt: excludeSouthTreeAt'),'south street renderer forwards exact tree exclusion');
console.log('PASS hotel tree sightlines: cadastral hotel frontage Z '+min.toFixed(2)+'..'+max.toFixed(2)+', '+intended.length+' unsurveyed roadside trees removed ('+before.trees.length+' → '+after.trees.length+'); all street furniture and hotel-owned trees preserved');
