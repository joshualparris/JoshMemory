// Public buildings require an attended entrance; 24-hour operations do not
// mean that unescorted visitors may wander into records, workshops or utilities.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TownLife, PLACE_DEFS, ROSTER_SIZE, RELIEF_SITES } from '../src/world/life.js';
import { facilityAccess, onSiteWorkers, visitorHours, openingHoursLabel } from '../src/world/facility-access.js';
import { populateShopStaff } from '../src/world/shop-staff.js';

const homes=Array.from({length:188},(_,i)=>({
  coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
  name:'Home '+i,door:{x:(i%26-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}
}));
const life=new TownLife({homes,minute:10*60});
assert.equal(life.villagers.length,ROSTER_SIZE,'existing people plus paid relief staff join the town');
assert.equal(new Set(life.villagers.map(v=>v.name)).size,ROSTER_SIZE,'every rostered worker has a unique name');
assert.equal(new Set(life.villagers.map(v=>v.home.coordinate)).size,ROSTER_SIZE,'each worker has an actual distinct household');
for(const p of PLACE_DEFS) {
  assert(p.id==='farmhouse'||life.villagers.some(v=>v.work===p.id),'no empty workplace roster: '+p.id);
}
for(const [id,role] of [['hotel','hotel receptionist'],['police','police desk officer'],
 ['ambulance','ambulance dispatcher'],['court','court registry officer'],
 ['solicitor','legal receptionist'],['sewage','wastewater operator'],
 ['landfill','weighbridge officer'],['tafe','TAFE student-services officer']])
 assert(life.villagers.some(v=>v.work===id&&v.job===role),id+' missing real specialist');
// Every visitor workplace has at least two genuine workers, so one may take
// a break without turning a 13:00 business into an unstaffed empty building.
for(const p of PLACE_DEFS.filter(p=>!['home','park'].includes(p.kind))){
 const team=life.villagers.filter(v=>v.work===p.id&&!['student','retired'].includes(v.job));
 assert(team.length>=2,p.name+' must have paid primary and relief staff');
 assert.equal(openingHoursLabel(p).includes('OPEN')||openingHoursLabel(p).includes('RECEPTION'),true,p.id+' has a readable hours sign');
}
for(const id of ['store','bank','court','solicitor','soyplant','soyfarm','power','waterworks','sewage','clinic','hardware']){
 const p=life.place(id),[opens,closes]=visitorHours(p);
 assert(opens<=13*60&&closes>13*60,id+' publishes lunch-time visitor hours');
}
assert(RELIEF_SITES.includes('bank')&&RELIEF_SITES.includes('court')&&RELIEF_SITES.includes('power'),'the previously unmanned counters have genuine relief workers');
// Reproduce the reported 13:00 closures with real resident commutes, breaks
// and attendance (never bypass entry checks or create decorative ghost staff).
const lunchtime=new TownLife({homes,minute:9*60,seed:42});
const noonSites=['store','bakery','cafe','bank','court','solicitor','soyfarm','soyplant','power','waterworks','sewage','clinic','post','hardware'];
for(const minute of [12*60+45,13*60+15,13*60+45]){
 while(lunchtime.minute<minute)lunchtime.tick(.5);
 for(const id of noonSites){
  const site=lunchtime.place(id),access=facilityAccess(lunchtime,site);
  assert(access.allowed,id+' should admit visitors at '+lunchtime.time()+
    ', not '+access.reason+': '+JSON.stringify(lunchtime.villagers.filter(v=>v.work===id).map(v=>({
      name:v.name,step:v.step?.kind,at:v.step?.at,path:v.path.length
    }))));
 }
}
const original=life.villagers.slice(0,38).map(v=>[v.name,v.home.coordinate]);
const saved=life.snapshot();
const old=structuredClone(saved);
old.villagers=old.villagers.slice(0,38);old.sim.villagers=old.sim.villagers.slice(0,38);
const restored=new TownLife({homes,minute:10*60});
assert(restored.restore(old),'legacy 38-person saved game must still load');
assert.deepEqual(restored.villagers.slice(0,38).map(v=>[v.name,v.home.coordinate]),original,
 'existing people retain their names and homes when saves migrate');
assert.equal(restored.villagers.length,ROSTER_SIZE,'new workers are added to restored saves');
assert(restored.restore(saved),'new expanded-town saved game must load');

const place=(id,opens=9*60,closes=17*60)=>({id,name:id+' building',opens,closes});
const t={day:1,minute:12*60,villagers:[],jobsReport:()=>({active:null}),needsReport:()=>({booking:null})};
const p=place('court');
assert.equal(facilityAccess(t,p).reason,'unstaffed','unmanned public lobby is locked');
const officer={name:'Jules',work:'court',step:{kind:'work',at:'court'},path:[{x:0,z:0}]};
t.villagers.push(officer);
assert.equal(onSiteWorkers(t,p).length,0,'travelling to work does not count as staffed');
assert.equal(facilityAccess(t,p).reason,'unstaffed');
officer.path=[];
assert.equal(facilityAccess(t,p).allowed,true,'court opens once real registry officer arrives');
t.minute=18*60;
assert.equal(facilityAccess(t,p).reason,'closed','office locked after published hours');
t.minute=12*60;
const power=place('power',0,1440);
assert.deepEqual(visitorHours(power),[480,1080],'24-hour operation is not a 24-hour public lobby');
assert.equal(facilityAccess(t,power).reason,'unstaffed');
t.villagers.push({name:'Ash',work:'power',step:{kind:'work',at:'power'},path:[]});
assert.equal(facilityAccess(t,power).allowed,true,'daytime utility reception staffed');
t.minute=19*60;
assert.equal(facilityAccess(t,power).reason,'closed','power plant locked after visitor hours');
const hotel=place('hotel',0,1440);
t.minute=12*60; // Reset after the power-plant evening check; midday is inside hotel reception hours.
assert.equal(facilityAccess(t,hotel).reason,'unstaffed','open-hour hotel lobby still requires real staff');
t.minute=23*60-1;
assert.equal(facilityAccess(t,hotel).reason,'unstaffed','late reception must remain staffed, not grant free access');
t.minute=23*60;
assert.deepEqual(visitorHours(hotel),[7*60,23*60],'hotel reception hours are independent of 24-hour hotel operations');
assert.equal(facilityAccess(t,hotel).reason,'closed','unbooked lobby locked exactly at 23:00');
t.minute=23*60+1;
assert.equal(facilityAccess(t,hotel).reason,'closed','locked until morning after closing time');
t.needsReport=()=>({booking:{room:2}});
assert.equal(facilityAccess(t,hotel).reason,'guest','paid guests retain overnight key access');
t.needsReport=()=>({booking:null});
assert.equal(facilityAccess(t,place('square',0,1440)).allowed,true,'public square remains available');
t.jobsReport=()=>({active:{site:'power',day:1}});
assert.equal(facilityAccess(t,power).reason,'employee','active employees can safely return to their workplace');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(main.includes('facilityAccess(life,site)'), 'entry must be checked in the real 3D door transition');
assert(main.includes('if(!enterShop(place.id, true))'), 'locked front door must repel movement, not load an interior');
console.log('PASS: '+ROSTER_SIZE+' named residents, relief rosters, posted hours, historical save migration, real attendance and locked public entrances');
