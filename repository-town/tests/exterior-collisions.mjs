// 188 exteriors, every doorway and every yard prop: real shared world geometry.
// Checks the exact source layouts, including E7 NextJS-Expert's blue van.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Builder } from '../src/world/builder.js';
import { buildExterior } from '../src/world/exterior.js';
import { CollisionWorld } from '../src/engine/collision.js';
import { exteriorColliders, doorApproach, overlapping, PLAYER_RADIUS } from '../src/world/exterior-collision.js';
import { lotPosition } from '../src/world/town.js';

let total=0, objects=0, skipped=[], specific=false;
for(let row=1;row<=8;row++){
  const briefs=JSON.parse(readFileSync(new URL('../briefs/row-'+row+'.json',import.meta.url),'utf8'));
  assert.equal(briefs.length,row===8?6:26,'house inventory row count');
  for(let col=0;col<briefs.length;col++){
    const ext=briefs[col].ext,coord=String.fromCharCode(65+col)+row;
    const b=new Builder();
    const color=Object.fromEntries(['walls','roof','trim','door'].map(k=>[k,Number.parseInt(String(ext[k]).replace('#',''),16)]));
    const fp=buildExterior(b,ext,color);
    const lot=lotPosition(coord);
    const walls=exteriorColliders(fp,lot.x,lot.z);
    const full=[...walls,...fp.yard.map(q=>({x0:lot.x+q.x0,x1:lot.x+q.x1,z0:lot.z+q.z0,z1:lot.z+q.z1}))];
    const collisions=new CollisionWorld(full);
    const doorX=lot.x+fp.door.x,frontZ=lot.z+fp.front;
    // A walking-width opening must reach beyond the door sensor.
    for(let d=2.4;d>=-0.75;d-=0.14) {
      assert(!collisions.hits(doorX,frontZ+d,PLAYER_RADIUS),
        coord+' solid object blocks entrance at offset '+d.toFixed(2));
    }
    assert(collisions.hits(lot.x-fp.w/2+0.12,lot.z,PLAYER_RADIUS),
      coord+' wall is not solid');
    const frontClear=doorApproach(fp);
    for(let i=0;i<fp.yardObjects.length;i++){
      const a=fp.yardObjects[i];
      assert(!overlapping(a,frontClear,.35),coord+' yard object intersects door path');
      assert(a.x0>=-11.9&&a.x1<=11.9&&a.z1<=10.01,
        coord+' prop intrudes on neighbour lot or footpath');
      for(let j=0;j<i;j++)assert(!overlapping(a,fp.yardObjects[j],.35),
        coord+' yard objects overlap each other');
    }
    if(coord==='E7') {
      assert.equal(briefs[col].repo,'Parris-Tech-Services/NextJS-Expert');
      assert(fp.yardObjects.length>=3,'E7 outdoor furniture/van must remain visible');
      assert(!collisions.hits(doorX,frontZ+1.1,PLAYER_RADIUS),
        'E7 actual doorway must be accessible beside parked blue van');
      specific=true;
    }
    for(const name of fp.skippedYard||[])skipped.push(coord+': '+name);
    objects+=fp.yardObjects.length;total++;
    b.parts.forEach(g=>g.dispose());
  }
}
assert(specific);
assert(total===188);
assert(skipped.length<=8,'too many lost outdoor props: '+skipped.join(', '));
console.log('PASS: '+total+' exteriors have walkable real door gaps; '+objects+
  ' yard objects avoid each other, buildings, footpaths and E7 van; skipped '+skipped.length+
  (skipped.length?': '+skipped.join(', '):''));
