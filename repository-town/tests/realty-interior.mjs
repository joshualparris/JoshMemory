import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TownLife, ROSTER_SIZE} from '../src/world/life.js';
import {buildCivicInterior} from '../src/world/shop-interior.js';
import {REALTY_LAYOUT} from '../src/world/realty-interior.js';
import {agencyBoard,agencyDisplayText} from '../src/world/realty-listings.js';

const homes=[];
for(let r=0;r<8;r++)for(let c=0;c<26;c++){ if(r===7&&c>=6)continue;homes.push({
 coordinate:String.fromCharCode(65+c)+(r+1),name:'Repository '+c+'-'+r,
 door:{x:(c-12.5)*26,z:r*46-161+4}
}); }
const t=new TownLife({homes,seed:20261020,minute:10*60});
const p=t.place('realty');
assert(p,'M8 property office must exist in town places');
assert.equal(p.col,'M');
assert.equal(p.side,'south');
assert.equal(p.x,-.5*26);
assert.equal(p.name,'Repository Realty');
assert.equal(p.kind,'office');
assert.equal(p.opens,9*60);
assert.equal(p.closes,17*60);
assert.equal(p.till,650,'agency starts with finite, non-council investor funds');
const agent=t.villagers.find(v=>v.work==='realty');
assert(agent,'agency should be staffed by a real named villager');
assert.equal(agent.job,'real estate agent');
assert.equal(agent.name,'Gwen');
assert.equal(t.villagers.length,ROSTER_SIZE,'existing the original 38 residents retain their names and IDs alongside 23 employed neighbours');
assert(!['power','waterworks','sewage'].includes(agent.work),'not a public utility worker');
const listings=agencyBoard(t);
assert(listings.length>=4,'sample the real town address directory');
assert(listings.every(x=>homes.some(h=>h.coordinate===x.coordinate&&h.name===x.name)));
assert(listings.every(x=>x.listed===false&&x.askingPrice===null),'must never invent a legal sales listing');
assert.match(agencyDisplayText(t),/not a for-sale or for-rent listing/);
assert.equal(agencyBoard(null).length,0);
assert.match(agencyDisplayText(null),/not connected/);
const empty=buildCivicInterior({id:'realty',name:'Repository Realty'},
 ()=>new THREE.Sprite(new THREE.SpriteMaterial()));
const room=buildCivicInterior(p,()=>new THREE.Sprite(new THREE.SpriteMaterial()),t);
assert(room.realtyLayout,'must dispatch to custom agency, not generic shop');
assert(empty.realtyLayout,'dedicated agency works without a live TownLife too');
assert.equal(REALTY_LAYOUT.site,'M8');
assert.deepEqual(room.rooms.map(x=>x.name),REALTY_LAYOUT.zones);
assert.equal(room.interactables.length,16,'all agency operations and safe inspections');
assert.equal(room.sceneObjects.length,16,'all hotspots visible to scene-aware NPC chat');
assert.equal(room.windows.length,4);
assert.equal(room.staff.pos.x,REALTY_LAYOUT.staff.x);
assert(room.staff.pos.z<room.staff.use.z);
assert(room.seats.length>=4,'actual waiting and consultation seating');
assert(room.group.children.length>190,'significant furnishings rather than a generic counter');
for(const x of ['reception','directory','sales','rental','map','agents',
  'inspections','valuations','meeting','contracts','management',
  'keys','records','trust','kitchen','ledger']){
  assert(room.interactables.some(i=>i.key==='realty:'+x),'missing '+x);
}
assert.equal(room.interactables.filter(i=>i.act.do==='civic-ledger').length,1);
assert.match(room.interactables.find(i=>i.key==='realty:directory').act.text,/Repository/);
assert.match(room.interactables.find(i=>i.key==='realty:trust').act.text,/licensee in charge/);
assert.match(room.interactables.find(i=>i.key==='realty:contracts').act.text,/correct authority/);
const hit=(x,z,r=.35)=>room.colliders.some(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r);
const step=.25,queue=[[0,0]],seen=new Set(['0,0']),o=room.spawn;
assert(!hit(o.x,o.z),'entrance spawn unobstructed');
for(let i=0;i<queue.length;i++){
 const [gx,gz]=queue[i];
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=gx+dx,z=gz+dz,px=o.x+x*step,pz=o.z+z*step,k=x+','+z;
  if(seen.has(k)||px<-7||px>7||pz<-12||pz>6.45||hit(px,pz))continue;
  seen.add(k);queue.push([x,z]);
 }
}
const reachable=p=>queue.some(([gx,gz])=>Math.hypot(o.x+gx*step-p.x,o.z+gz*step-p.z)<.35);
for(const item of room.interactables){
 assert(!hit(item.pos.x,item.pos.z),item.key+' safely separated from furniture');
 assert(reachable(item.pos),item.key+' accessible from street doorway');
 const zone=room.rooms[item.room];
 assert(zone&&item.roomName===zone.name,'accurate zone name '+item.key);
 assert(item.pos.x>=zone.x0&&item.pos.x<=zone.x1&&item.pos.z>=zone.z0&&item.pos.z<=zone.z1,
  item.key+' inside claimed room');
}
for(const p of [room.staff.pos,room.staff.use,{x:0,z:6.15}]){
 assert(!hit(p.x,p.z),'staff or street exit is not blocked');
 assert(reachable(p),'player can reach staff or street exit');
}
for(const z of [5.2,3.75,2,0,-2,-4.2,-6.5,-8.5,-10.8])
 assert(!hit(0,z),'continuous central walk path at z='+z);
for(const roomZone of room.rooms)assert(queue.some(([x,z])=>{
 const px=o.x+x*step,pz=o.z+z*step;
 return px>roomZone.x0+.45&&px<roomZone.x1-.45&&pz>roomZone.z0+.45&&pz<roomZone.z1-.45;
}),'at least one area reachable in zone: '+roomZone.name);
room.group.updateMatrixWorld(true);
room.group.traverse(obj=>{
 if(!obj.isMesh)return;
 const box=new THREE.Box3().setFromObject(obj);
 assert([box.min.x,box.min.y,box.min.z,box.max.x,box.max.y,box.max.z].every(Number.isFinite));
 assert(box.min.x>=-7.36&&box.max.x<=7.36&&box.min.z>=-12.32&&box.max.z<=6.4,
  'furnishing contained inside shared interior shell');
});
for(const x of [room,empty])x.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose?.();});
console.log('PASS: M8 Repository Realty site, real villager staffing, actual address directory, realistic office layout, safe walking and privacy.');
