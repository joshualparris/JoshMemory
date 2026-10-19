// Run locally with: node tests/shopkeepers.mjs
// No browser, API key or paid requests. Tests the public game's staff wiring.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('world/shop-staff.js');
const main=read('main.js');
const npc=read('ui/npc.js');
const life=await import('data:text/javascript;base64,'+Buffer.from(read('world/life.js')).toString('base64'));
const { PLACE_DEFS }=life;
const V3=class {constructor(x,y,z){Object.assign(this,{x,y,z})}set(x,y,z){Object.assign(this,{x,y,z})}};
const Group=class {constructor(){this.children=[];this.rotation={y:0};this.position=new V3()}add(v){this.children.push(v)}};
class Walker {
  constructor(model,pos,opts){this.group=model.group;this.pos=pos;this.name=opts.name;}
}
const fn=source.replace(/^import .*?;\s*$/gm,'').replace(/\bexport\s+(?=function|const|class)/g,'');
const populate=new Function('THREE','makePerson','Walker',fn+'\nreturn populateShopStaff;')(
 {Vector3:V3},()=>({group:new Group()}),Walker
);
assert.equal(PLACE_DEFS.length,20,'Expected the complete high street');
assert.match(main,/populateShopStaff\(site,life,built,makeLabel\)/);
assert.match(main,/inside=\{house:brief,place:site,\.\.\.built,people:staff\}/);
assert.match(main,/if\(inside\.place\)/);
assert.match(npc,/title: ctx\.workplace \?/);
for(const place of PLACE_DEFS){
 const interior={group:new Group(),interactables:[],sceneObjects:[],rooms:[{name:'Shop floor'}]};
 const name='Test '+place.id,job=place.kind==='shop'?'shopkeeper':place.kind;
 const lifeStub={villagers:[{name,job,work:place.id,step:{kind:'work',at:place.id},path:[]}]};
 const people=populate(place,lifeStub,interior,()=>({position:new V3(),userData:{}}));
 assert.equal(people.length,1,place.id);
 assert.equal(people[0].name,name,place.id+' should use assigned real worker name');
 assert.equal(people[0].v,lifeStub.villagers[0],place.id+' should link simulation resident');
 assert.equal(interior.group.children.length,1,place.id+' character should have a 3D model');
 const talk=interior.interactables.find(i=>i.key==='staff:'+place.id);
 assert(talk&&talk.person&&talk.act.name===name,place.id+' needs a talk hotspot');
 assert.equal(talk.act.role,'villager');
 assert(Math.hypot(talk.pos.x-people[0].pos.x,talk.pos.z-people[0].pos.z)<3.5,place.id+' unreachable counter dialogue');
 const noWorkers={villagers:[]};
 const fallback=populate(place,noWorkers,{group:new Group(),interactables:[],sceneObjects:[],rooms:[{name:'Shop'}]},()=>({position:new V3(),userData:{}}));
 assert.equal(fallback.length,1,place.id+' needs a guide even when no worker is assigned');
}
console.log('PASS: 20/20 shops spawn a visible staff member, grounded identity and separate talk interaction');
