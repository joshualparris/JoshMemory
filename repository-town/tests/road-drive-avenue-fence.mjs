// Regression for the exact 2026-11-04 invisible car wall on a paved avenue.
// Farm fences are real obstacles but cannot extend into mapped road lanes.
import assert from 'node:assert/strict';
import { TownLife, AVENUES } from '../src/world/life.js';
import { onPlannedOrCoreRoad } from '../src/world/masterplan-built.js';
import { CollisionWorld } from '../src/engine/collision.js';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',
    door:{x:(c-12.5)*26,z:r*46-161+4}});
const life=new TownLife({homes,minute:420,seed:20261104});
const dairy=life.place('dairy');
assert(dairy?.field,'original dairy farm field must remain');
assert(AVENUES.includes(182),'avenue-4 remains at x=182');
assert(dairy.field.x0>=187.5,'dairy fence moved away from public avenue lane');
assert(dairy.field.x1-dairy.field.x0>=10,'dairy crop field stays physically useful');
// The former 0.3m solid fence at x=184.5 was hit by a 1.12m-radius
// vehicle on the x=183.6 right lane. Its new fence is at x>=188.0.
const oldFence=new CollisionWorld([{x0:184.35,x1:184.65,z0:200.5,z1:210.5}]);
assert(oldFence.hits(183.6,201,1.12),'recorded x=183.6,z=201 phantom road stop reproduced');
const newFenceCentre=dairy.field.x0+.5;
const newFence=new CollisionWorld([{x0:newFenceCentre-.15,x1:newFenceCentre+.15,z0:200.5,z1:210.5}]);
for(const z of [201,202,203,204]) {
  assert(onPlannedOrCoreRoad(183.6,z),'sample lies on mapped avenue-4 asphalt at z='+z);
  assert(!newFence.hits(183.6,z,1.12),'car has road clearance at z='+z);
}
const inspected=[];
for(const p of life.places.values()) if(p.field) {
  const width=p.field.x1-p.field.x0;
  assert(width>4,p.id+' cannot lose all farmland to lane clearance');
  for(const avenue of AVENUES) for(const edge of [p.field.x0+.5,p.field.x1-.5]) {
    assert(Math.abs(edge-avenue)>=5.0,p.id+' fence intrudes into core public avenue at x='+avenue);
  }
  inspected.push(p.id);
}
assert(inspected.length>=6,'all farm fence records checked');
const snap=life.snapshot();
assert.equal(snap.places.find(([id])=>id==='dairy').length,5,'farm field coordinates are not serialized or retroactively corrupt saved games');
console.log('PASS core avenue farm fences: '+inspected.length+' farms retained; 4 formerly blocked x=183.6 lane probes are clear; no save migration');
