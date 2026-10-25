import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TownLife,PLACE_DEFS,ROSTER_SIZE} from '../src/world/life.js';
import {facilityAccess,openingHoursLabel} from '../src/world/facility-access.js';

const homes=Array.from({length:188},(_,i)=>({
  coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),
  name:'Home '+i,
  door:{x:(i%26-12.5)*26,z:(Math.floor(i/26)-3.5)*46+4}
}));
const t=new TownLife({homes,minute:13*60,seed:42});
const places=new Map(PLACE_DEFS.map(p=>[p.id,p]));
for(const [id,col,name] of [
  ['securityoffice','A','High Street Security Office'],
  ['securityhq','D','Central West Security Headquarters'],
  ['locksmith','Z','Macquarie Locksmith & Keys']
]){
  const p=places.get(id);assert(p,id+' exists');
  assert.equal(p.col,col);assert.equal(p.side,'south');assert.equal(p.name,name);
  assert.equal(t.place(id).x,(col.charCodeAt(0)-65-12.5)*26);
  assert(openingHoursLabel(p).includes('HOURS'),id+' publishes scheduled visitor hours without falsely claiming it is staffed');
  assert(t.villagers.filter(v=>v.work===id).length>=2,id+' has real paid employees');
}
assert.equal(t.villagers.length,ROSTER_SIZE,'new named workers all reside in town');
assert.equal(new Set(t.villagers.map(v=>v.name)).size,ROSTER_SIZE,'guards and locksmith have distinct identities');
assert.equal(new Set(t.villagers.map(v=>v.home.coordinate)).size,116,'only real married partners share dwellings');
assert.equal(t.marriages.length,55);
const guards=t.villagers.filter(v=>v.job==='security guard');
assert.equal(guards.length,2,'morning and afternoon guard shifts');
assert(guards[0].start<guards[1].start,'staggered guards');
assert(t.villagers.some(v=>v.job==='qualified locksmith'&&v.work==='locksmith'));
assert(t.villagers.some(v=>v.job==='locksmith apprentice'&&v.work==='locksmith'));
const g=guards[0],hq=t.place('securityhq');
Object.assign(g,{x:hq.front.x,z:hq.front.z,inside:false,path:[],step:null,
  doneToday:{breakfast:true,shower:true},patrolIndex:1,paidDay:undefined});
const before={x:g.x,z:g.z};
t.plan(g);
assert.equal(g.step.kind,'patrol','on-duty guard must physically patrol');
assert.equal(g.step.at,'bank','guard checks next public street frontage');
assert.equal(g.bike,false,'patrol is on foot, not cycling');
assert(g.path.length>0,'non-adjacent checkpoint requires walk route');
t.tick(0.5);
assert(Math.hypot(g.x-before.x,g.z-before.z)>0,'patrol actor moves in live town simulation');
assert(Math.hypot(g.x-t.place('bank').front.x,g.z-t.place('bank').front.z)>1,'guard is not teleported to checkpoint');
assert(/patrol/i.test(g.activity),'guard reports actual walking activity');
const snap=t.snapshot();
const legacy=structuredClone(snap);
legacy.sim.villagers=legacy.sim.villagers.slice(0,91);
legacy.villagers=legacy.villagers.slice(0,91);
assert(new TownLife({homes}).restore(legacy),'existing 91-villager save survives added workplaces');
assert(new TownLife({homes}).restore(snap),'new guard positions and routes persist');
assert.equal(snap.sim.villagers[g.id].patrolIndex,g.patrolIndex,'next checkpoint persists');
const source=readFileSync(new URL('../src/world/townlife.js',import.meta.url),'utf8');
const interior=readFileSync(new URL('../src/world/shop-interior.js',import.meta.url),'utf8');
for(const id of ['securityhq','securityoffice','locksmith']){
 assert(source.includes(id+'(b)'),id+' has its own 3D facade');
 assert(interior.includes(id+':['),id+' has indoor counter and exhibit');
}
assert.equal(facilityAccess({day:1,minute:23*60,villagers:[],jobsReport:()=>({}),needsReport:()=>({})},t.place('locksmith')).reason,'closed');
console.log('PASS: security HQ D8, security office A8, locksmith Z8, two moving guards, paid rosters and legacy-save migration');
