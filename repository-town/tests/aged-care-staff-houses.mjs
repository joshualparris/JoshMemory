// Southside houses are existing addresses, not newly invented extra lots.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {loadBriefs,loadInventory,toHouse,sanitise} from '../tools/lib.mjs';
import {mergeDiscovery} from '../tools/merge-discovery.mjs';
import {buildInterior} from '../src/world/interior.js';
import {createFloorStack} from '../src/world/multifloor.js';
import {assignCareHousing,careStaff} from '../src/world/aged-care-operations.js';
import {TownLife} from '../src/world/life.js';
const inventory=loadInventory(),briefs=loadBriefs(),games=new Map();
for(const g of JSON.parse(fs.readFileSync(new URL('../data/games.json',import.meta.url))).games){
 if(!games.has(g.repo))games.set(g.repo,[]);games.get(g.repo).push(g);
}
const available=inventory.projects.map(x=>x.coordinate);
const towns=new TownLife({homes:inventory.projects.map(x=>({coordinate:x.coordinate,name:x.repo,door:{x:0,z:0}}))});
const existing=new Set(towns.villagers.map(v=>v.home.coordinate));
assert.equal(existing.size,116,'do not overwrite 116 real existing resident households');
const people=[...careStaff('bracken-house'),...careStaff('yeoval-aged-care')]
  .sort((a,b)=>a.staffRoleIndex-b.staffRoleIndex||a.role.localeCompare(b.role)||a.facility.localeCompare(b.facility));
const roster=assignCareHousing(people,available,existing);
assert([...roster.houses.keys()].every(c=>!existing.has(c)&&Number(c.slice(1))>=6));
assert(new Set([...roster.houses.values()].flat().map(x=>x.facility)).size===2,'both aged care sites have local resident employees');

assert(roster.houses.size>0);
let checked=0;
for(const row of inventory.projects.filter(x=>roster.houses.has(x.coordinate)).slice(0,5)){
 const base=mergeDiscovery(sanitise(toHouse(briefs.get(row.repo),row,inventory.grid.streetNames,{},games)));
 const workers=roster.houses.get(row.coordinate);
 const h={...base,careHousehold:true,careWorkers:workers,marriedCouple:false,householdResidents:workers};
 const floors=createFloorStack(h,()=>new THREE.Object3D());
 const built=floors?floors.levels[0]:buildInterior(h,()=>new THREE.Object3D());
 const names=built.rooms.map(x=>x.name);
 for(const room of ['Kitchen','Bathroom and laundry','Living room'])
  assert(names.includes(room),'missing shared staff '+room+' in '+row.coordinate);
 for(let i=0;i<workers.length;i++)assert(names.includes('Care-worker bedroom '+(i+1)),
  'missing private room '+i+' in '+row.coordinate);
 assert(built.colliders.length>20,'complete furniture/collision geometry');
 assert(built.interactables.some(x=>x.act?.do==='info'&&/private bedroom/.test(x.act.title||'')),
  'personal beds have role-specific contextual information');
 for(const x of [built,...(floors?.levels.slice(1)||[])])
  x.group.traverse(o=>o.geometry?.dispose?.());
 checked++;
}
assert(checked>=3,'at least three existing southern homes walkable as staff houses');
console.log('PASS '+checked+' southern staff houses: '+roster.houses.size+' staffed addresses, '+roster.staffHoused+' locally housed care workers/'+people.length+' total, no old households changed');
