import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { BUILDINGS, OFFSET } from '../src/world/narromine-layout.js';
import { NARROMINE_OSM } from '../src/world/narromine-osm-data.js';
import { NARROMINE_LIDAR } from '../src/world/narromine-lidar-data.js';
import { ST_AUGUSTINES_OSM_INDEX, ST_AUGUSTINES_MODEL_ID,
  stAugustinesEvidence, churchFootprintColliders, buildNarromineStAugustines,
} from '../src/world/narromine-st-augustines.js';

const id=ST_AUGUSTINES_OSM_INDEX;
assert.equal(id,10,'church is mapped OSM #10; do not silently move to a different building');
assert.equal(NARROMINE_OSM.buildings[id].name,'St. Augustines');
assert.equal(NARROMINE_OSM.buildings[id].kind,'church');
const lidar=NARROMINE_LIDAR.heights['osm:'+id];
assert.equal(lidar[0],2023);
assert.equal(lidar[2],4.65);
assert.equal(lidar[3],10.54);
assert.equal(BUILDINGS[id].osmIndex,id);
const evidence=stAugustinesEvidence();
assert.equal(evidence.footprint.length,NARROMINE_OSM.buildings[id].pts.length);
for(let i=0;i<evidence.footprint.length;i++){
  const src=NARROMINE_OSM.buildings[id].pts[i],xy=evidence.footprint[i];
  assert.equal(xy[0],src[0]+OFFSET.x,'geographic x transform');
  assert.equal(xy[1],src[1]+OFFSET.z,'geographic z transform');
}
assert.equal(evidence.exterior.built,1933);
assert.equal(evidence.lidar.groundAhd,239.21);

function inPoly(poly,x,z){
  let found=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if(((a[1]>z)!==(b[1]>z))&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])found=!found;
  }
  return found;
}
const colliders=[],spots=[],colours=new Set(),geos=[];
const result=buildNarromineStAugustines({
  push:(colour,g)=>{assert(g.isBufferGeometry);colours.add(colour);geos.push(g);},
  colliders,spots,
});
assert(result.stats.geometryParts>55, 'church has procedural roof, windows, masonry and cross');
assert(result.stats.geometryParts<500, 'reasonable number of batched components');
assert.equal(colours.size>=7,true,'multi-material facade rather than generic box');
assert.equal(spots.length,1,'one Church spot');
assert.equal(spots[0].key,ST_AUGUSTINES_MODEL_ID);
assert.equal(result.stats.eaveM,4.65);
assert.equal(result.stats.ridgeM,10.54);
assert.equal(result.stats.collisionStrips,colliders.length);
assert(colliders.length>8&&colliders.length<80,'sliced site colliders (no huge bbox)');
const vertices=geos.reduce((n,g)=>n+(g.attributes.position?.count||0),0);
assert(vertices>500 && vertices<130000,'nontrivial but mobile-friendly geometry vertex count');
const bounds=new THREE.Box3();
for(const g of geos){
  const pos=g.attributes.position;
  assert(pos&&pos.count>0,'geometry has positions');
  for(let j=0;j<pos.count*3;j++)assert(Number.isFinite(pos.array[j]),'no NaN/Infinity geometry');
  g.computeBoundingBox();
  assert(!g.boundingBox.isEmpty());
  assert(g.boundingBox.min.y>=-.05,'no underground model parts');
  assert(g.boundingBox.max.y<14,'no unbounded roof geometry');
  bounds.union(g.boundingBox);
}
assert(bounds.max.y>12.1&&bounds.max.y<13.0,
  'documented Celtic cross above 10.54m LiDAR ridge by approximately 2.18m');
assert(bounds.min.x > -4780 && bounds.max.x < -4730,
  'church geometry stays on mapped side of Dandaloo Street');
assert(bounds.min.z > -1340 && bounds.max.z < -1285,
  'church geometry stays in its building precinct');
for(const c of colliders){
  assert(c.x1>c.x0&&c.z1>c.z0,'positive collision slice');
  const cx=(c.x0+c.x1)/2,cz=(c.z0+c.z1)/2;
  assert(inPoly(evidence.footprint,cx,cz),'collision slice centre inside authoritative OSM footprint');
}
const expected=churchFootprintColliders(evidence.footprint);
assert.deepEqual(colliders,expected,'builder uses real-footprint collision slices');
// Verify the live scene suppresses the old extrusion while invoking the new
// builder. A second generic mesh would z-fight and block doors.
const scene=fs.readFileSync(new URL('../src/world/narromine.js',import.meta.url),'utf8');
assert.match(scene,/ST_AUGUSTINES_OSM_INDEX\s*,/,'scene uses explicit suppression constant');
assert.match(scene,/RAILWAY_SUPPRESSED_OSM\s*=\s*new Set\(\[/,'scene OSM suppression set');
assert.match(scene,/if \(RAILWAY_SUPPRESSED_OSM\.has\(b\.osmIndex\)\) continue/,'generic OSM building is skipped');
assert.equal((scene.match(/buildNarromineStAugustines\(\{ push, colliders, spots \}\)/g)||[]).length,1,
  'dedicated church constructed exactly once');
const report={
  site:evidence.address, osmIndex:id, lidar:evidence.lidar,
  counts:{ geometries:geos.length,vertices,colliders:colliders.length,materials:colours.size,spots:spots.length },
  bbox:{min:bounds.min.toArray(),max:bounds.max.toArray()},
};
for(const g of geos)g.dispose();
console.log('PASS St Augustine’s church model — mapped footprint / LiDAR / architectural geometry / colliders / one-scene integration');
console.log(JSON.stringify(report,null,2));
