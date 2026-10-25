import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TOWN_ORIGIN} from '../src/world/town-origin.js';
const evidence=JSON.parse(await readFile(new URL('../audit/geography/RTGEO_003_SITE_ASSESSMENT_2026-10-25.json',import.meta.url),'utf8'));
const canon=JSON.parse(await readFile(new URL('../docs/REPOSITORY_TOWN_GEOGRAPHY_HISTORY_CANON.json',import.meta.url),'utf8'));
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('site has official Minore / Dubbo Regional / RU1 / lot ID from NSW GIS',()=>{
 assert.equal(evidence.id,'RTGEO-003');
 assert.equal(evidence.anchor.latitude,TOWN_ORIGIN.site.latitude);
 assert.equal(evidence.anchor.longitude,TOWN_ORIGIN.site.longitude);
 assert.equal(evidence.gisData.cadastre.lotPlan,'105//DP835474');
 assert.equal(evidence.gisData.administration.suburb,'MINORE');
 assert.equal(evidence.gisData.administration.postcode,'2830');
 assert.equal(evidence.gisData.administration.lga,'DUBBO REGIONAL');
 assert.equal(evidence.gisData.landUse.zoneCode,'RU1');
 assert.equal(canon.site.registeredParcel,TOWN_ORIGIN.site.officialLotPlan);
 assert.equal(canon.site.landUseZone,'RU1');
});
test('coverage includes all sides of model and envelope intersects precisely one cadastral, zone and LGA polygon',()=>{
 assert.equal(evidence.samplePoints.length,9);
 assert.deepEqual(evidence.samplePoints.map(x=>x.label),['centre','NW','NE','SW','SE','N-mid','S-mid','E-mid','W-mid']);
 assert.ok(evidence.samplePoints.every(x=>x.lot==='105//DP835474'));
 assert.deepEqual([evidence.rectangleIntersectionCheck.cadastreFeatures,evidence.rectangleIntersectionCheck.zoningFeatures,evidence.rectangleIntersectionCheck.lgaFeatures],[1,1,1]);
 assert.equal(evidence.plannedFootprint.approxHectares,37.44);
});
test('no falsely asserted 2026 vacancy, right to develop or visual aerial inspection',()=>{
 assert.equal(evidence.vacancyAndOwnership.claimVacant,false);
 assert.equal(evidence.vacancyAndOwnership.permissionToBuild,false);
 assert.equal(evidence.vacancyAndOwnership.actualVacancyStatus,'UNKNOWN');
 assert.equal(evidence.gisData.imagery.captureStartDate,'2015-10-06');
 assert.equal(evidence.gisData.imagery.viewerAttempt.outcome,'UNABLE-TO-INSPECT-PIXELS');
 assert.equal(evidence.siteStatus,'ASSESSMENT-COMPLETE — NOT AN APPROVED REAL-TOWN SITE');
 assert.equal(evidence.gisData.landUse.zoneCode,'RU1');
 assert.equal(canon.site.aerialPixelsInspected,false);
 assert.equal(TOWN_ORIGIN.site.approvedRealTown,false);
 assert.ok(evidence.sources.zoning.startsWith('https://mapprod3.environment.nsw.gov.au'));
});
test('roadmap closes GIS audit as fail/no-go but keeps aerial, cultural, flood, utility and alternative tasks open',async()=>{
 const todo=await read('docs/REPOSITORY_TOWN_GEOGRAPHY_TODO.md');
 const lines=todo.split('\n');
 for(const [id,status] of [['RTGEO-003','COMPLETE GIS RESEARCH'],['RTGEO-004','OPEN'],['RTGEO-005','OPEN'],['RTGEO-006','OPEN'],['RTGEO-007','OPEN'],['RTGEO-017','OPEN'],['RTGEO-018','OPEN']]){
  const row=lines.find(l=>l.startsWith('| **'+id+'**'));
  assert.ok(row,id+' missing');
  assert.match(row,new RegExp(status));
 }
 const hall=await read('src/world/hall-interior.js');
 assert.match(hall,/Lot 105 DP835474/);
 assert.match(hall,/RU1 Primary Production/);
});
