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
const ownership=JSON.parse(fs.readFileSync(path.join(root,'data/narromine-renderer-ownership.json'),'utf8'));
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
  assert(Array.isArray(s.rendering.renderer)&&s.rendering.renderer.length,'detailed site '+s.siteId+' records its renderer');
  assert.equal(typeof s.rendering.owner,'string','detailed site '+s.siteId+' records its owner');
  assert(s.rendering.owner.length,'detailed site '+s.siteId+' owner non-empty');
}
assert.equal(Object.keys(ownership.detailedSites).length,DETAILED.length,'renderer register covers every detailed site');
for(const [idx,rep] of Object.entries(ownership.osmReplacement)){
  const o=osm.find(b=>b.osmIndex===Number(idx));
  assert(o,'replaced OSM index '+idx+' exists in inventory');
  assert.equal(o.rendering.mode,'replaced by bespoke builder','OSM '+idx+' marked replaced, not mapped extrusion');
  assert.deepEqual(o.rendering.renderer,[rep.renderer],'OSM '+idx+' renderer recorded');
  assert.equal(o.rendering.owner,rep.owner,'OSM '+idx+' owner recorded');
}
assert.equal(osm.filter(x=>x.heightEvidence).length,inventory.counts.osmWithLidar);
assert.equal(osm.filter(x=>x.heightEvidence).length,Object.keys(LIDAR.heights).filter(x=>x.startsWith('osm:')).length,'OSM LiDAR tally');
assert.equal(sites.reduce((n,s)=>n+s.parts.filter(x=>x.heightEvidence).length,0),inventory.counts.detailedPartsWithLidar);
assert.equal(sites.reduce((n,s)=>n+s.verandahs.filter(x=>x.heightEvidence).length,0),inventory.counts.detailedVerandahsWithLidar);
for(const b of entries){
  assert(b.centreGeo[0]>=OSM.bbox.minlat-0.005&&b.centreGeo[0]<=OSM.bbox.maxlat+0.005,'latitude in export vicinity');
  assert(b.centreGeo[1]>=OSM.bbox.minlon-0.005&&b.centreGeo[1]<=OSM.bbox.maxlon+0.005,'longitude in export vicinity');
  assert.equal(b.visualQa.status,'not-reviewed','no invented visual QA');
  for(const photoId of b.photoReferences)assert(photos.records.some(r=>r.id===photoId&&r.buildingIds.includes(b.id)),'only permission-reviewed building-linked photo IDs');
  assert(['Mapped','Modelled','Visual QA Passed','Verified Against Reference','Unsurveyed'].includes(b.rendering.status));
}
assert.equal(photos.records.length,2,'two individually verified Commons metadata references');
assert.equal(inventory.counts.photoReferences,photos.records.length);
assert.equal(entries.filter(b=>b.photoReferences.length).length,1,'one building now has a historical photo reference');
for(const ref of photos.records){assert(ref.reviewed&&ref.sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:')&&ref.licenceUrl==='https://creativecommons.org/licenses/by/3.0/');assert(ref.captureDate.startsWith('2017-11-28'));assert.equal(ref.isCurrentAsOf2026,false);}
assert.equal(inventory.counts.visuallyVerified,0);
assert.equal(inventory.counts.rendererOwnedSites,sites.length,'all detailed sites renderer-owned');
assert.equal(inventory.counts.rendererReplacedOsm,Object.keys(ownership.osmReplacement).length,'all replaced OSM outlines counted');
assert(!entries.some(b=>b.rendering.status==='Verified Against Reference'),'no building auto-promoted to Verified');
assert(inventory.coverageAudit.knownGaps.some(x=>x.includes('incomplete')),'coverage limitations explicitly present');
assert(fs.readFileSync(path.join(root,'src/narromine-progress.html'),'utf8').includes('./narromine-building-inventory.json'),'map loads deployed inventory path');
execFileSync(process.execPath,[path.join(root,'tools/narromine-inventory.mjs'),'--check'],{stdio:'pipe'});
console.log('PASS Narromine inventory: '+osm.length+' OSM outlines + '+sites.length+' detailed sites; '+inventory.counts.osmWithLidar+' OSM LiDAR matches; '+inventory.counts.detailedPartsWithLidar+' parts and '+inventory.counts.detailedVerandahsWithLidar+' verandahs; zero unreviewed claims');
