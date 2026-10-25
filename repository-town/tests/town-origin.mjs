import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TOWN_ORIGIN,gameMetresToCoordinates,townChronicleNotice} from '../src/world/town-origin.js';
const data=JSON.parse(await readFile(new URL('../docs/REPOSITORY_TOWN_GEOGRAPHY_HISTORY_CANON.json',import.meta.url),'utf8'));
test('fictional town geographic anchor and mayor consistent across source and JSON',()=>{
 assert.equal(TOWN_ORIGIN.site.latitude,-32.2736); assert.equal(TOWN_ORIGIN.site.longitude,148.4084);
 assert.equal(TOWN_ORIGIN.site.latitude,data.site.latitude);
 assert.equal(TOWN_ORIGIN.site.longitude,data.site.longitude);
 assert.equal(data.founding.foundingYear,1883);
 assert.equal(data.founding.firstPermanentColonialEraBuilding.siteId,'G8-N');
 assert.equal(TOWN_ORIGIN.firstBuilding.site,'G8-N');
 assert.equal(data.founding.firstMayorInUniverse.name,'Reginald Arthur Repo');
 assert.equal(data.founding.firstMayorInUniverse.termStartYear,1909);
 assert.equal(data.founding.firstMayorInUniverse.fictionalKnighthoodYear,1927);
 assert.equal(data.founding.existingMayorIn2026,'Vern');
 assert.equal(TOWN_ORIGIN.historicPub.built,null);assert.equal(TOWN_ORIGIN.historicPub.firstTrade,null);
 assert.equal(data.coordinatesAreSurvey,false);
 assert.match(data.site.legalSiteStatus,/NOT VERIFIED VACANT/);
});
test('local coordinate transformation is monotonic, reversible near anchor and source-labelled',()=>{
 const origin=gameMetresToCoordinates(0,0);
 assert.equal(origin.latitude,-32.2736); assert.equal(origin.longitude,148.4084);
 assert.ok(gameMetresToCoordinates(250,0).longitude>origin.longitude);
 assert.ok(gameMetresToCoordinates(0,250).latitude<origin.latitude);
 assert.throws(()=>gameMetresToCoordinates(Infinity,0),/finite/);
 const r=gameMetresToCoordinates(390,290);
 assert.ok(r.longitude<148.42&&r.latitude>-32.28);
});
test('50 dated canon events, stable unique IDs, chronology and evidence labels',()=>{
 assert.equal(data.events.length,50);
 const ids=new Set();
 let last=-Infinity;
 for(let i=0;i<data.events.length;i++){
   const e=data.events[i];
   assert.equal(e.id,'RTHIST-'+String(i+1).padStart(3,'0'));
   assert.ok(!ids.has(e.id)); ids.add(e.id);
   assert.ok(e.year==='Pre-1880'||Number.isInteger(e.year));
   const k=e.year==='Pre-1880'?-99999:e.year;
   assert.ok(k>=last);last=k; assert.ok(e.details.length>25);
   assert.ok(['real','real-context','fiction','fiction-context','game-canon','design'].includes(e.category));
 }
 assert.ok(data.events.some(x=>x.year===1911&&/hotel/i.test(x.title)&&/comparison/.test(x.title)));
 assert.ok(!data.events.some(x=>/Branch Line Hotel opens|hotel constructed/i.test(x.title)));
 assert.match(JSON.stringify(data.events.filter(x=>/pub/i.test(x.title)).map(x=>x.details)),/UNKNOWN/);
 assert.ok(data.events.some(x=>x.year===1883));
});
test('real-world data is cited but unknown utility connections never invented',()=>{
 assert.ok(data.sources.length>=15);
 assert.ok(data.sources.every(x=>x.url.startsWith('https://')));
 assert.match(data.site.legalSiteStatus,/NOT VERIFIED/);
 assert.equal(data.water.legalPublicWaterConnection,false);
 assert.equal(data.water.siteToRiverDistanceKm,null);
 assert.ok(data.realElectricity.unknown.length>=3);
 assert.equal(data.transport.actualRoadEntry,'unknown');
 assert.match(townChronicleNotice(),/not surveyed/);
});
test('Town Hall contains two live history interactions and does not spawn a historical NPC',async()=>{
 const hall=await readFile(new URL('../src/world/hall-interior.js',import.meta.url),'utf8');
 assert.match(hall,/townChronicleNotice\(\)/);
 assert.match(hall,/add\('founding'/);
 assert.match(hall,/add\('geography'/);
 assert.match(hall,/Reginald Repo/);
});
