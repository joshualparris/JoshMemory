import assert from 'node:assert/strict';
import { TownLife } from '../src/world/life.js';
import { freshSocialState,initialBond,bond,recordSocialEvent,socialReport,chooseSocialVisit,restoreSocialState } from '../src/world/social-events.js';
const people=['Mabel','Arlo','Bea'];
assert.equal(initialBond('Mabel','Arlo'),initialBond('Arlo','Mabel'));
const state=freshSocialState();
const initial=bond(state,'Mabel','Arlo');
const happened=recordSocialEvent(state,'Mabel','Arlo','visit',2,18*60);
assert(happened?.text.includes('Mabel and Arlo'));
assert.equal(bond(state,'Mabel','Arlo'),initial+happened.change);
assert.equal(recordSocialEvent(state,'Arlo','Mabel','visit',2,18*60+20),null,'no duplicate visitor memories in one day');
assert(recordSocialEvent(state,'Arlo','Mabel','visit',3,18*60),'next day creates new memory');
assert.equal(state.memories.Mabel.length,2);
assert.equal(state.memories.Arlo.length,2);
assert(socialReport(state,'Mabel',people).recent[0].includes('Arlo'));
assert.equal(chooseSocialVisit(state,'Mabel',[],3),null);
const reset=restoreSocialState(JSON.parse(JSON.stringify(state)),people);
assert.equal(bond(reset,'Mabel','Arlo'),bond(state,'Mabel','Arlo'));
assert.equal(reset.memories.Mabel.length,2);
const hostile=restoreSocialState({version:1,ties:{'Mabel|Arlo':9999,'Mabel|Unknown':70},
 memories:{Mabel:[{day:2,minute:500,people:['Mabel','Unknown'],kind:'visit',text:'forged'}]},
 events:[],lastEncounter:{}},people);
assert.equal(bond(hostile,'Mabel','Arlo'),100,'corrupt values clamped');
assert.equal((hostile.memories.Mabel||[]).length,0,'unknown people cannot be inserted into memories');

const homes=[];
for(let row=0;row<7;row++)for(let col=0;col<26;col+=2)homes.push({
 coordinate:String.fromCharCode(65+col)+(row+1),name:'House',
 door:{x:(col-12.5)*26,z:row*46-161+4}
});
const t=new TownLife({homes,minute:19*60,seed:2121});
const a=t.villagers[0],b=t.villagers[1];
b.inside=true;b.path=[];b.step={kind:'idle',at:'home',dur:30,activity:'relaxing at home'};
a.path=[];a.inside=false;a.step={kind:'idle',at:'social',dur:15,activity:'visiting '+b.name,
 visit:b.home,socialTarget:b.name};
const before=bond(t.social,a.name,b.name);
t.arrive(a);
const event=t.social.events[0];
assert(event&&event.kind==='visit'&&event.people.includes(a.name));
assert.notEqual(bond(t.social,a.name,b.name),before);
assert(t.socialSummary(a.name).recent.some(m=>m.includes(b.name)));
assert(t.describe(a).social.recent.length>0,'social memory available for NPC context');
const saved=JSON.parse(JSON.stringify(t.snapshot()));
const copy=new TownLife({homes,minute:0,seed:2121});
assert(copy.restore(saved),'new-format save reloads');
assert.deepEqual(copy.socialSummary(a.name).recent,t.socialSummary(a.name).recent);
assert.deepEqual(copy.social.events,t.social.events);
assert(copy.restore({...saved,social:undefined}),'old saves without social remain valid');
assert.equal(copy.social.events.length,0,'old saves start without fabricated encounters');

const work=new TownLife({homes,minute:14*60,seed:2121});
const coworkers=work.villagers.filter(v=>v.work==='bakery');
assert.equal(coworkers.length,2);
const [w1,w2]=coworkers;
for(const v of coworkers){v.inside=true;v.path=[];v.step={kind:'work',at:'bakery',until:15*60,activity:'baking'};}
work.finish(w1);
assert(work.social.events.some(e=>e.kind==='work'&&e.people.includes(w2.name)),'working together creates a memory');
assert(work.socialSummary(w2.name).recent[0].includes(w1.name));
console.log('PASS: Neighborly-inspired relationships, witnessed visits/work, deterministic memory, persistence and legacy saves.');
