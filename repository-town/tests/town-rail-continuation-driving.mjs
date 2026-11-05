// Exercise real train traction/path-following physics WITHOUT needing a
// 10-minute software-WebGL render. This is not a fake visual-only track test.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createNarromineTrains} from '../src/world/narromine-trains.js';
import {RAIL_Z} from '../src/world/rail-corridor.js';

const attempts=[];
for(const desired of ['straight','right','left']){
 const map=new THREE.Group(),playable=new THREE.Group();
 const t=createNarromineTrains(map,playable);
 assert(t.network.nodes.length>100);
 assert.equal(playable.children.length,7,'player locomotive + six hoppers must be visible outside OSM map group');
 assert(t.board().includes('W/S'));
 t.setRoute(desired);
 const start=t.state().head;
 let onConnector=false,insideTown=false,northLeg=false,completed=false,reason='';
 let moved=0,highest=0,firstTown=null;
 for(let frame=0;frame<14000;frame++){
  const before=t.state(),max=Math.min(before.limitKmh,39);
  const throttle=before.speedKmh<max-1?1:0;
  t.update(.25,{movement:()=>({x:0,z:-throttle}),takeLook:()=>{}});
  const now=t.state(),head=now.head;
  moved+=Math.hypot(head.x-before.head.x,head.z-before.head.z);
  highest=Math.max(highest,now.speedKmh);
  if(head.x>-3000&&head.x<-500)onConnector=true;
  if(onConnector&&head.x>-390&&Math.abs(head.z-RAIL_Z)<6){insideTown=true;firstTown??=frame;}
  if(insideTown&&head.z<RAIL_Z-310&&head.x>-550&&head.x<650)northLeg=true;
  if(northLeg&&head.x>-320&&Math.abs(head.z-RAIL_Z)<6){completed=true;break;}
  if(t.message.includes('End of the line')||t.message.includes('rear of the train reached')){reason=t.message;break;}
 }
 attempts.push({desired,onConnector,insideTown,northLeg,completed,highest,
  metres:Math.round(moved),reason,start,finish:t.state().head});
 if(completed){
  assert(highest>10,'loco must genuinely accelerate');
  assert(moved>6500,'loco must drive from Narromine yard through game corridor and loop');
  assert(t.state().line==='Repository Town fictional return loop',
   'loco remains on the fictional track, not an invisible unrendered line');
  console.log('PASS playable train drove into Repo from mapped Narromine yard and around 180m-radius full loop: '+JSON.stringify(attempts));
  process.exit(0);
 }
}
assert.fail('Actual player train must reach Repository Town via mapped Narromine yard junction and complete oval: '+JSON.stringify(attempts));
