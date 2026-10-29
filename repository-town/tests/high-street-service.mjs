import {pubStandards,pubStandardsAction} from '../src/world/pub-standards.js';
import {pubStandardsPanel} from '../src/ui/pub-standards-panel.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { populateShopStaff } from '../src/world/shop-staff.js';
import { workingAt, shopService } from '../src/world/shop-attendance.js';
import { COUNTERS, lineAt, pendingOrders } from '../src/world/counter-queue.js';

const interior=()=>({group:new THREE.Group(),rooms:Array.from({length:4},()=>({name:'Room'})),interactables:[],sceneObjects:[]});
const label=()=>new THREE.Group();
const worker={name:'Bea',job:'grocer',work:'store',step:{kind:'work',at:'store'},path:[{x:1,z:2}],activity:'walking to work'};
const life={villagers:[worker]};
const room=interior(), [npc]=populateShopStaff({id:'store',name:'General Store',kind:'shop'},life,room,label);
const update=()=>npc.update(.016,1,{pos:new THREE.Vector3(0,0,0)},npc.plan);
assert(!npc.group.visible,'worker still travelling must not be cloned behind the counter');
assert.equal(room.interactables.length,0,'no ghost conversation prompt');
worker.path=[];worker.activity='serving customers';update();
assert(npc.group.visible);assert.equal(npc.v,worker);assert.equal(room.interactables[0].act.name,'Bea');
worker.step={kind:'work',at:'hall'};update();
assert(!npc.group.visible,'worker dispatched elsewhere leaves the shop');
assert.equal(room.interactables.length,0);assert.equal(room.sceneObjects.length,0);
const relief={name:'Cas',job:'shopkeeper',work:'store',step:{kind:'work',at:'store'},path:[],activity:'covering the counter'};
life.villagers.push(relief);update();
assert(npc.group.visible);assert.equal(npc.v,relief);assert.equal(npc.name,'Cas');
assert.equal(room.interactables[0].act.name,'Cas','relief worker conversation uses the actual person');
relief.step={kind:'sleep',at:'home'};update();assert(!npc.group.visible);
assert(!populateShopStaff({id:'depot',name:'Depot'}, {villagers:[]},interior(),label)[0].group.visible,'no invented cover worker');
assert(populateShopStaff({id:'farmhouse',name:'Farmhouse'}, {villagers:[]},interior(),label)[0].group.visible,'Nell remains a real named host');

// Execute the actual panel builder with a small deterministic town fixture.
// Dependency fixtures keep this test independent of browser/DOM services.
const source=readFileSync(new URL('../src/ui/townpanels.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');
const goods={bread:{name:'bread',price:5},pie:{name:'pie',price:8},roast:{name:'roast',price:18}};
const cafeMenu=[{id:'coffee',name:'Coffee',category:'Drinks',price:4},{id:'tea',name:'Tea',category:'Drinks',price:3}];
const fixtureAccess = (town, p) => ({ allowed: town.open(p) && town.villagers.some(v => workingAt(v, p.id, p)), reason: town.open(p) ? 'unstaffed' : 'closed' });
const panels=new Function('servicesFor','serviceBlock','useService','GOODS','VENUE_MENU','CAFE_MENU','cafeAvailable','workingAt','shopService','esc','amount','timeText','JOB_BOARD','COUNTERS','lineAt','pendingOrders','facilityAccess','visitorHours','pubStandards','pubStandardsAction','pubStandardsPanel',source+'\nreturn placePanel;')(
  ()=>[],()=>null,()=>'',goods,{pub:{roast:{}}},cafeMenu,(p,item)=>item.id==='coffee',workingAt,shopService,String,(g,n)=>n+' '+g,String,[],COUNTERS,lineAt,pendingOrders,fixtureAccess,(p)=>[p.opens,p.closes],pubStandards,pubStandardsAction,pubStandardsPanel);
const site={id:'store',name:'General Store',kind:'shop',opens:480,closes:1080,stock:{bread:4,pie:2},out:{},target:{bread:8},sells:['bread'],till:0};
let open=false;
const town={place:()=>site,open:()=>open,time:()=>open?'10:00':'23:00',villagers:[worker],civic:{player:{wallet:20,bank:40,bag:{bread:1}}},needsReport:()=>({hunger:0,fatigue:0}),menuAvailability:()=>true};
let panel=panels(town,'store');
assert(!panel.actions.some(a=>/^(Buy|Sell back|Order) /.test(a.label)),'closed store has no trading buttons');
assert(panel.body.includes('Cash in till:'),'zero cash balance is displayed honestly');
assert(!panel.body.includes('here now'),'dispatched worker is not shown as present');
open=true;panel=panels(town,'store');assert(!panel.actions.some(a=>a.label.startsWith('Buy')));assert(panel.body.includes('waiting for staff'));
worker.step={kind:'work',at:'store'};panel=panels(town,'store');assert(panel.actions.some(a=>a.label.startsWith('Buy bread')));
site.stock.bread=0;panel=panels(town,'store');assert(!panel.actions.some(a=>a.label.startsWith('Buy bread')));
site.id='pub';site.kind='pub';open=false;panel=panels(town,'pub');assert(!panel.actions.some(a=>a.label.startsWith('Order')));assert(panel.body.includes('service closed'));
const confirm=panel.actions.find(a=>a.label==='Confirm character is 18+');assert(confirm.primary,'ID confirmation is a primary action even while closed');
panel=confirm.run();assert(pubStandards(town).verifiedAdult);confirm.run();assert(pubStandards(town).verifiedAdult,'repeat confirmation does not revoke ID');assert(panel.body.includes('Adult ID: confirmed'));
const controls=panel.actions.find(a=>a.label==='Pub service controls');assert(controls.primary);assert(controls.run().actions.find(a=>a.label==='Back to pub menu').run().body.includes('Adult ID: confirmed'));
site.id='cafe';site.kind='cafe';panel=panels(town,'cafe');assert(!panel.actions.some(a=>a.label.startsWith('Order')));
open=true;worker.step={kind:'work',at:'cafe'};panel=panels(town,'cafe');assert(panel.actions.some(a=>a.label.startsWith('Order Coffee')));assert(!panel.actions.some(a=>a.label.startsWith('Order Tea')));
assert(panel.body.includes('Tea · $3 (sold out)'),'sold-out goods stay visible on the menu');
console.log('PASS: real counter attendance, travel/dispatch/shift changes, named hosts, closed trading, sold-out menus and honest till balances');

