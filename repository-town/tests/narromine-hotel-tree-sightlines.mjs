// Narromine Hotel real-place sightline evidence gate.
// Do not generate roadside tree, lamp or power-pole objects merely by evenly
// spacing them along a real OSM street. Retain photo-located hotel details.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STREETS, DETAILED } from '../src/world/narromine-layout.js';
import { planDandalooSouth, planDandalooStreetscape } from '../src/world/narromine-dandaloo-streetscape-data.js';

const hotel=DETAILED.find(d=>d.id==='narromine-hotel');
assert(hotel,'hotel remains in the NSW cadastral detailed inventory');
const verandah=hotel.verandahs.find(v=>v.name==='Dandaloo Street verandah');
assert.equal(verandah?.pts.length,4,'mapped hotel Dandaloo verandah remains explicit');
const zs=verandah.pts.map(([,z])=>z);
assert(zs.every(Number.isFinite),'real site frontage coordinates finite');
const min=Math.min(...zs),max=Math.max(...zs);
assert(min < -730 && max > -710,'hotel mapped into expected Dandaloo local zone');

const south=planDandalooSouth(STREETS);
assert(south.kerbs.length>=120,'retain mapped street edges and kerbs');
for(const kind of ['trees','lamps','poles'])
  assert.deepEqual(south[kind],[], 'no guessed South Dandaloo '+kind+' based only on regular spacing');
const southText=fs.readFileSync(new URL('../src/world/narromine-dandaloo-streetscape-data.js',import.meta.url),'utf8');
assert(!/for\s*\(let z[^\n]*\bz\s*\+=\s*(22|40|44)/.test(southText),
  'unverified 22/40/44-m street-furniture loops are absent');
assert.match(south.source.spacing,/no automatic furniture spacing/,
  'evidence explicitly states synthetic furnishing is disabled');

// A verified object with an estimated size stays. The hotel-specific street
// features modelled using Josh's exterior photographs are unrelated to the
// abandoned synthetic 22m rows, as are the lot-internal aerial-survey trees.
assert.equal(hotel.trees.length,4,'all four independently located hotel-lot trees remain');
const hotelSource=fs.readFileSync(new URL('../src/world/narromine-hotel.js',import.meta.url),'utf8');
assert(hotelSource.includes('for (const ts of [33.8])'),
  'northern/end photo-referenced tree retained with approximate dimensions');
assert(!hotelSource.includes('for (const ts of [21.5, 33.8])'),
  'unlocated s=21.5 frontage tree no longer occludes the real hotel');
assert(hotelSource.includes('for (const [tx, tz] of nh.trees || [])'),
  'four aerial-based rear-lot trees remain');

const mainStreet=planDandalooStreetscape(STREETS);
assert(mainStreet.medians.length>=30,'OSM-based median footprint remains unchanged');
assert(mainStreet.trees.length>=10 && mainStreet.lamps.length>=8,
  'distinct landscaped median retained pending per-object provenance audit');
const renderer=fs.readFileSync(new URL('../src/world/narromine-dandaloo-streetscape.js',import.meta.url),'utf8');
assert(renderer.includes('const south = planDandalooSouth(streets, clear);'),
  'production scene uses the strict planner');
const scene=fs.readFileSync(new URL('../src/world/narromine.js',import.meta.url),'utf8');
assert(scene.includes('buildDandalooStreetscape({ streets: STREETS'),
  'actual Narromine scene renders the strict planner, not an unused test stub');
console.log('PASS real Narromine Hotel sightlines: no fabricated South Dandaloo street trees, lamps or poles; '+south.kerbs.length+' street kerb segments, mapped hotel canopy/lot-tree sources preserved');
