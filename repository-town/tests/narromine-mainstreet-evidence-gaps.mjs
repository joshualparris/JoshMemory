// Guard #332's unverified main-street locations against OSM off-by-one errors
// and accidental "photo verified" upgrades without an explicit evidence record.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { NARROMINE_NW_DANDALOO_INTEGRATION_SPEC } from '../src/world/narromine-nw-dandaloo-evidence.js';
import { PHYSIO_FACADE } from '../src/world/narromine-mainstreet-physio.js';
const inventory = JSON.parse(fs.readFileSync(new URL('../data/narromine-building-inventory.json',import.meta.url),'utf8'));
const ledger = JSON.parse(fs.readFileSync(new URL('../data/narromine-mainstreet-evidence-gaps.json',import.meta.url),'utf8'));
assert.equal(ledger.schemaVersion,1);
assert.deepEqual(ledger.unresolved.map(x=>x.stableBuildingId), ['NR-OSM-0165','NR-OSM-0168','NR-OSM-0169']);
assert.deepEqual(ledger.unresolved.map(x=>x.osmIndex),[164,167,168], 'stable NR-OSM ID is one-based; data array index zero-based');
assert.deepEqual(ledger.integratedExistingPilot[0].osmIndices,
  NARROMINE_NW_DANDALOO_INTEGRATION_SPEC.suppressedOsmBuildingIndices,
  'never claim a different set of NW Block buildings are modelled');
assert.deepEqual(ledger.integratedExistingPilot[1].osmIndices,[PHYSIO_FACADE.osmIndex]);
const claimed = new Set(ledger.integratedExistingPilot.flatMap(x=>x.osmIndices));
assert.equal(ledger.unresolved.filter(x=>claimed.has(x.osmIndex)).length,0,
  'no duplicate claim of already bespoke-modeled building');
for (const item of ledger.unresolved) {
  const b = inventory.buildings.find(x=>x.id===item.stableBuildingId);
  assert(b&&b.sourceType==='osm','stable building ID must exist in canonical register');
  assert.equal(b.osmIndex,item.osmIndex);
  assert.equal(b.geometryFingerprint,item.geometryFingerprint,'map geometry change requires evidence refresh');
  assert.deepEqual(b.centreGeo,item.centreWgs84);
  assert.equal(b.footprintLocal.length,item.footprintVertices);
  assert.equal(NARROMINE_OSM.buildings[item.osmIndex]?.kind,b.kind);
  assert(b.heightEvidence,'LiDAR proxy source must be present');
  const h=item.measurements.height;
  assert.equal(h.tier,'lidar-2023-envelope');
  assert.equal(h.year,b.heightEvidence.surveyYear);
  assert.equal(h.eaveProxyM,b.heightEvidence.eaveProxyM);
  assert.equal(h.ridgeProxyM,b.heightEvidence.ridgeProxyM);
  assert.equal(h.medianRoofM,b.heightEvidence.medianRoofM);
  assert.equal(h.notArchitecturalSurvey,true);
  assert.equal(item.measurements.footprint.tier,'mapped-OSM');
  assert.equal(item.currentRenderTier,'C','do not silently mark visually finished');
  for(const [name,record] of Object.entries(item.measurements)){
    if(name==='footprint'||name==='height')continue;
    assert.equal(record.tier,'unverified',name+' has no permission-cleared source yet');
    assert.equal(record.source,null,'no invented source for '+name);
    assert(record.requires.length>=12);
  }
  assert.equal(item.visualQaStatus,'not-reviewed');
  assert.equal(item.photoLicence,'none-cleared-for-this-building');
}
console.log('PASS #332: 3 stable mapped but unphotographed OSM frontages, 2023 LiDAR proxies, no duplicate detailed geometry or false evidence tiers');
