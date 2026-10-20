import assert from 'node:assert/strict';
import * as THREE from 'three';
import { TownLife, PLACE_DEFS } from '../src/world/life.js';
import { buildCivicInterior } from '../src/world/shop-interior.js';
import { HARDWARE,QUALIFICATIONS,TRADE_STAFF,REPAIR_TYPES,
 tradeEducationReport,repairQuote,orderRepair,acceptRepair,cancelRepair,
 buyHardware,enrolQualification,advanceTradeEducation } from '../src/world/trade-education.js';
const homes=Array.from({length:188},(_,i)=>({coordinate:'H'+i,name:'Home '+i,door:{x:i*3,z:20}}));
const life=new TownLife({homes,minute:9*60});
const e=tradeEducationReport(life);
const ids=['hardware','trades','tafe','university'];
const sites=ids.map(id=>life.place(id));
assert.equal(new Set(sites.map(p=>p.col)).size,4,'four unique commercial lots');
assert(sites.every(p=>p.side==='south'&&p.kind&&p.opens<p.closes),'four real accessible properties');
assert(sites.every(p=>!PLACE_DEFS.some(other=>other.id!==p.id&&other.col===p.col&&other.side==='south')),'no existing south shop overwritten');
assert.equal(QUALIFICATIONS.length,14,'HSC + AQF I to 10 pathways provided');
for(const level of [1,2,3,4,5,6,7,8,9,10])
 assert(QUALIFICATIONS.some(q=>q.level===level),'AQF level '+level+' covered');
assert(QUALIFICATIONS.find(q=>q.id==='hsc').level===null,'HSC is separate from AQF');
assert(TRADE_STAFF.filter(s=>s.qualified&&s.licence).some(s=>s.trade==='electrical'));
assert(TRADE_STAFF.some(s=>s.supervisor&&!s.qualified),'apprentices clearly supervised');
assert(Object.values(REPAIR_TYPES).some(x=>x.trade==='it'),'general computer repair included');
const starting={...e.stock},cash=e.hardwareCash,held=()=>life.civic.player.wallet+life.civic.player.bank;
const initialMoney=held();assert.match(buyHardware(life,'timber'),/Bought/);
assert.equal(e.stock.timber,starting.timber-1,'purchase lowers finite stock');
assert.equal(e.hardwareCash,cash+HARDWARE.timber.price,'shop cash receives purchase money');
assert.equal(held(),initialMoney-HARDWARE.timber.price,'no money minted on purchase');
assert.equal(life.civic.player.bag.timber,1);
assert.match(buyHardware(life,'switch',11),/Choose 1–10/,'cannot buy implausible quantity');
life.civic.player.bank+=1500; // Fixture injects known externally earned funds, not production.
assert.match(orderRepair(life,'faultySwitch'),/written quote|Written quote/i);
const first=e.orders.at(-1);
assert.equal(first.status,'quoted');
assert.match(orderRepair(life,'faultySwitch'),/already an open ticket/);
assert.equal(first.paid,0,'not charged before customer accepts');
assert.match(acceptRepair(life,first.id),/Accepted/);
assert.equal(first.worker,'ella','electrical restricted work assigned only to licensed electrician');
assert.equal(e.stock.cable,starting.cable-1);
assert.equal(e.stock.switch,starting.switch-1);
let prog=0;while(first.status!=='completed'&&prog++<20){life.minute=10*60;advanceTradeEducation(life);}
assert.equal(first.status,'completed','inspection and multi-stage job completion');
assert.equal(first.signedOffBy,'ella');
assert.equal(first.escrow,0,'escrow released on signoff');
assert.match(cancelRepair(life,first.id),/cannot be cancelled/,'no refund on completed job');
const paidBefore=held();
assert.match(orderRepair(life,'laptop'),/Fault report/);
const laptop=e.orders.at(-1),parts=e.stock.parts;
assert.match(acceptRepair(life,laptop.id),/Accepted/);
assert.match(cancelRepair(life,laptop.id),/refunded/);
assert.equal(held(),paidBefore,'pre-work cancellation restores full customer funds');
assert.equal(e.stock.parts,parts,'pre-work cancellation returns materials');
assert.equal(e.orders.filter(x=>x.status==='completed').length,1,'no ghost repairs');
assert.match(enrolQualification(life,'doctorate'),/Entry requirement/);
assert.match(enrolQualification(life,'hsc'),/Enrolled/);
assert.match(enrolQualification(life,'cert1'),/Finish your current course/);
for(let d=1;d<=5;d++){life.day=d;life.minute=15*60;advanceTradeEducation(life);advanceTradeEducation(life);}
assert(e.qualifications.includes('hsc'),'HSC takes five distinct assessment days');
assert.equal(e.activeCourse,null);
assert.match(enrolQualification(life,'bachelor'),/Enrolled/);
for(let d=6;d<=15;d++){life.day=d;life.minute=15*60;advanceTradeEducation(life);}
assert(e.qualifications.includes('bachelor'),'Bachelor follows HSC in compressed academic timeline');
assert(!e.qualifications.some(x=>x.includes('licence')),'qualification does not invent an occupational licence');
const snap=life.snapshot();const restored=new TownLife({homes});
assert(restored.restore(snap),'valid saves continue to restore');
assert(restored.civic.tradeEducation.qualifications.includes('bachelor'),'earned qualifications survive saves');
assert(restored.civic.tradeEducation.orders.some(x=>x.id===first.id&&x.status==='completed'),'repair audit history survives saves');
const makeLabel=()=>new THREE.Sprite(new THREE.SpriteMaterial());
for(const site of sites){
 const room=buildCivicInterior(site,makeLabel,life);
 assert(room.group.children.length>35,site.id+' has specialised equipment and actual furniture');
 assert(room.colliders.length>=5,site.id+' has solid workstations and shelves');
 assert(room.interactables.length>=3,site.id+' has separate named work areas');
 assert(room.interactables.some(i=>i.act?.do==='civic-ledger'),'trade and study transactions have an in-world counter');
 assert(room.windows?.length>=2&&room.exitZone,'working front windows and exits');
 const x=0,z=4.2;
 assert(!room.colliders.some(b=>x>=b.x0-.3&&x<=b.x1+.3&&z>=b.z0-.3&&z<=b.z1+.3),
   site.id+' central door and arrival must remain open');
 room.group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});
}
console.log('PASS: 4 new vocational precinct buildings, finite sales, licensed repairs, escrow, signoff, refunds, AQF I–10, HSC distinction, save/restore and walkable rooms');
