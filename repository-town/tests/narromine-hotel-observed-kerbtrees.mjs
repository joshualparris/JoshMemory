// Narromine real-place evidence: no invented street furniture or hotel-front occlusion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STREETS,DETAILED} from '../src/world/narromine-layout.js';
import {planDandalooSouth,planDandalooStreetscape} from '../src/world/narromine-dandaloo-streetscape-data.js';
const south=planDandalooSouth(STREETS);
const north=planDandalooStreetscape(STREETS);
for(const name of ['trees','lamps','poles'])
  assert.equal(south[name].length,0,'no invented South Dandaloo '+name);
for(const name of ['trees','lamps','parking'])
  assert.equal(north[name].length,0,'no unlocated north median '+name);
assert(south.kerbs.length>=120,'mapped south kerbs maintained');
assert(north.medians.length>=30,'mapped north median remains as geometry');
const hotel=DETAILED.find(x=>x.id==='narromine-hotel');
assert(hotel?.verandahs.some(x=>x.name==='Dandaloo Street verandah'),'verified frontage remains');
assert.equal(hotel.trees.length,4,'four aerial-located rear trees maintained');
const source=fs.readFileSync(new URL('../src/world/narromine-hotel.js',import.meta.url),'utf8');
assert(source.includes('for (const ts of [33.8])'),'northern photo-referenced tree remains');
assert(!source.includes('for (const ts of [21.5, 33.8])'),'unlocated hotel-front tree suppressed');
assert(source.includes('for (const [tx, tz] of nh.trees || [])'),'aerial rear tree builder remains');
const scene=fs.readFileSync(new URL('../src/world/narromine.js',import.meta.url),'utf8');
assert(scene.includes('buildNarromineHotel'),'actual scene calls independently verified hotel builder');
console.log('PASS hotel tree fidelity: only photo-referenced northern tree remains, 4 aerial rear trees; south & north invented furniture absent; mapped street geometry preserved');
