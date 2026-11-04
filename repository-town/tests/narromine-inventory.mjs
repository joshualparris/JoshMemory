// Authoritative Narromine survey and progress-map release gates.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { NARROMINE_OSM as OSM } from '../src/world/narromine-osm-data.js';
import { NARROMINE_BUILDINGS as DETAILED } from '../src/world/narromine-buildings-data.js';
import { NARROMINE_LIDAR as LIDAR } from '../src/world/narromine-lidar-data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'data/narromine-building-inventory.json'),'utf8'));
const photos=JSON.parse(fs.readFileSync(path.join(root,'data/narromine-photo-references.json'),'utf8'));
const entries=inventory.buildings,osm=entries.filter(x=>x.sourceType==='osm'),sites=entries.filter(x=>x.sourceType==='detailed');
assert.equal(osm.length,OSM.buildings.length,'every existing OSM outline catalogued');
assert.equal(sites.length,DETAILED.length,'every detailed site catalogued');
assert.equal(entries.length,osm.length+sites.length,'exactly one record per source outline/site');
assert.equal(new Set(entries.map(x=>x.id)).size,entries.length,'no duplicate stable IDs');
assert.equal(new Set(osm.map(x=>x.osmIndex)).size,osm.length,'no omitted or duplicate source OSM indices');
for(const [i,b] of osm.entries()){
  assert.equal(b.osmIndex,i,'original OSM order retained with stable identity');
  assert.deepEqual(b.footprintLocal,OSM.buildings[i].pts,'outline unchanged');
  assert.equal(b.footprintGeo.length,b.footprintLocal.length,'geographic shape complete');
  assert(/^[0-9a-f]{8}$/.test(b.geometryFingerprint),'geometry fingerprint');
  assert.equal(b.rendering.status,'Mapped','raw OSM does not pass visual QA');
  assert(!b.name||!/residence|'s house|'s home/i.test(b.name),'no named private homes');
}
for(const s of sites){
  assert(DETAILED.some(x=>x.id===s.siteId),'detailed site ID existing in source');
  assert.equal(s.rendering.status,'Modelled','detailed site is modelled, not certified accurate');
  assert.equal(s.parts.length,DETAILED.find(x=>x.id===s.siteId).parts.length);
}
assert.equal(osm.filter(x=>x.heightEvidence).length,inventory.counts.osmWithLidar);
assert.equal(osm.filter(x=>x.heightEvidence).length,Object.keys(LIDAR.heights).filter(x=>x.startsWith('osm:')).length,'OSM LiDAR tally');
assert.equal(sites.reduce((n,s)=>n+s.parts.filter(x=>x.heightEvidence).length,0),inventory.counts.detailedPartsWithLidar);
assert.equal(sites.reduce((n,s)=>n+s.verandahs.filter(x=>x.heightEvidence).length,0),inventory.counts.detailedVerandahsWithLidar);
for(const b of entries){
  assert(b.centreGeo[0]>=OSM.bbox.minlat-0.005&&b.centreGeo[0]<=OSM.bbox.maxlat+0.005,'latitude in export vicinity');
  assert(b.centreGeo[1]>=OSM.bbox.minlon-0.005&&b.centreGeo[1]<=OSM.bbox.maxlon+0.005,'longitude in export vicinity');
  assert.equal(b.visualQa.status,'not-reviewed','no invented visual QA');
  assert.equal(b.photoReferences.length,0,'no unlicensed photos asserted');
  assert(['Mapped','Modelled','Visual QA Passed','Verified Against Reference','Unsurveyed'].includes(b.rendering.status));
}
assert.equal(photos.records.length,0,'reference catalogue starts without invented photos');
assert.equal(inventory.counts.visuallyVerified,0);
assert(inventory.coverageAudit.knownGaps.some(x=>x.includes('incomplete')),'coverage limitations explicitly present');
assert(fs.readFileSync(path.join(root,'src/narromine-progress.html'),'utf8').includes('./narromine-building-inventory.json'),'map loads deployed inventory path');
execFileSync(process.execPath,[path.join(root,'tools/narromine-inventory.mjs'),'--check'],{stdio:'pipe'});
console.log('PASS Narromine inventory: '+osm.length+' OSM outlines + '+sites.length+' detailed sites; '+inventory.counts.osmWithLidar+' OSM LiDAR matches; '+inventory.counts.detailedPartsWithLidar+' parts and '+inventory.counts.detailedVerandahsWithLidar+' verandahs; zero unreviewed claims');
