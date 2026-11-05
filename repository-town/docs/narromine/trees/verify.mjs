#!/usr/bin/env node
// NR-TREE-SURVEY-RESEARCH-001; self-contained, read-only data provenance checks.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NARROMINE_TREES } from '../../../src/world/narromine-trees-data.js';
import { NARROMINE_OSM } from '../../../src/world/narromine-osm-data.js';
const at = (name) => fileURLToPath(new URL(name, import.meta.url));
const readJson = name => JSON.parse(readFileSync(at(name), 'utf8'));
const candidates = readJson('./lidar-candidates-2023.geojson');
const confirmed = readJson('./verified-individual-trees.geojson');
const sites = readJson('./site-evidence.json');
const csv = readFileSync(at('./lidar-candidates-2023.csv'),'utf8');
const speciesCsv = readFileSync(at('./species-catalogue.csv'),'utf8');
const readme = readFileSync(at('./README.md'),'utf8');
const report = readFileSync(at('./RESEARCH_REPORT.md'),'utf8');
const source = readFileSync(at('./SOURCES.md'),'utf8');
assert.equal(NARROMINE_TREES.length, 3096,'do not assume an old candidate count');
assert.equal(candidates.type,'FeatureCollection');
assert.equal(candidates.features.length,NARROMINE_TREES.length,'GeoJSON must cover source 1:1');
assert.equal(candidates.metadata.individual_count,3096);
assert.equal(candidates.metadata.coordinates_crs,'EPSG:4326');
assert.equal(candidates.metadata.year,2023);
const ids=new Set();
const R = Math.PI / 180, E=6371008.8, a=NARROMINE_OSM.anchor;
const c=Math.cos(a.lat*R), tolerance=0.012;
for(let i=0;i<candidates.features.length;i++){
 const feature=candidates.features[i], original=NARROMINE_TREES[i];
 const expected='NAR-L23-'+String(i+1).padStart(5,'0');
 assert.equal(feature.id,expected);
 assert(!ids.has(feature.id),'duplicate id '+feature.id);ids.add(feature.id);
 assert.equal(feature.type,'Feature');
 assert.equal(feature.geometry.type,'Point');
 assert.equal(feature.properties.scientific_name,null,'no automatic species assignment permitted');
 assert.equal(feature.properties.evidence_level,'D','LiDAR by itself cannot identify species');
 assert.equal(feature.properties.height_m,original[2]);
 assert.equal(feature.properties.crown_radius_m,original[3]);
 const [lon,lat]=feature.geometry.coordinates;
 assert(lon>148.20 && lon<148.27 && lat>-32.26 && lat<-32.21,'outside Narromine bbox');
 const x=-2870+(lon-a.lon)*R*E*c;
 const z=-7-(lat-a.lat)*R*E;
 assert(Math.abs(x-original[0])<tolerance && Math.abs(z-original[1])<tolerance,
   'source transform drift '+feature.id);
}
const rows=csv.trimEnd().split('\n');
assert.equal(rows.length,3097,'header + all 3096 LiDAR candidates');
assert(rows[0].includes('scientific_name') && rows[0].includes('geometry_kind'));
assert.equal(confirmed.type,'FeatureCollection');
assert.equal(confirmed.features.length,0,'not one species+trunk map point has been verified');
assert.equal(confirmed.metadata.verified_count,0);
assert.equal(sites.records.length,22);
assert.equal(sites.species_and_individual_geolocation_pairs,0);
assert(sites.records.every(s=>s.source_url.startsWith('https://') &&
 s.individually_georeferenced===false && s.verified_individual_2026===false));
const airport=sites.records.filter(s=>s.site==='Narromine Aerodrome'&&s.record_kind==='field_survey_site_count');
assert.deepEqual(airport.map(x=>x.individual_count).sort((x,y)=>x-y),[3,7]);
const cemetery=sites.records.filter(s=>s.site==='Narromine Cemetery'&&s.record_kind==='council_historical_site_count');
assert.deepEqual(cemetery.map(x=>x.individual_count).sort((x,y)=>x-y),[15,20]);
assert.equal(speciesCsv.trimEnd().split('\n').length,13,'12 taxa + header expected');
assert(source.includes('**S18 (REJECT)**'),'reject wrong-extent Sydney ArcGIS');
assert(report.includes('2026-11-05') && report.includes('**0 verified individual matches'));
assert(readme.includes('3,096') && readme.includes('No publicly downloadable'));
console.log('PASS: 3096 source-linked LiDAR canopy candidates, exact transformed GPS and CSV parity, 22 provenance records, 12 scoped taxa, 0 invented species/trunk matches.');
