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


// Conversations contain attributable, deterministic lines and are not
// generated for pretend interactions when only one person is present.
const spoken=recordSocialEvent(freshSocialState(),'Mabel','Arlo','pub',5,20*60,{
 location:'The Merged Branch',placeId:'pub',x:10.41,z:22.91,jobA:'baker',jobB:'teacher'});
assert.equal(spoken.lines.length,4);
assert.deepEqual(spoken.lines.map(x=>x.speaker),['Mabel','Arlo','Mabel','Arlo']);
assert(spoken.lines.every(x=>x.text.length>8));
assert.deepEqual(spoken.position,{x:10.4,z:22.9});
const same=recordSocialEvent(freshSocialState(),'Mabel','Arlo','pub',5,20*60,{
 location:'The Merged Branch',placeId:'pub',x:10.41,z:22.91,jobA:'baker',jobB:'teacher'});
assert.deepEqual(same,spoken,'same time, history and people always give same dialogue');
const linesSaved=restoreSocialState({version:1,events:[spoken],memories:{Mabel:[spoken],Arlo:[spoken]}},people);
assert.deepEqual(linesSaved.events[0],spoken,'save/restore preserves exactly what was said');
assert.equal(socialReport(linesSaved,'Mabel',people).conversations[0].lines[0].text,spoken.lines[0].text);
const forged=restoreSocialState({version:1,events:[{...spoken,lines:[
 {speaker:'Intruder',text:'I am not a villager'},
 {speaker:'Mabel',text:'A genuine remark'}]}]},people);
assert.deepEqual(forged.events[0].lines,[{speaker:'Mabel',text:'A genuine remark'}],
 'a corrupt save cannot impersonate a third villager');
const pub=new TownLife({homes,minute:19*60+30,seed:2121});
const pair=pub.villagers.slice(0,2);
for(const v of pair){
 v.path=[];v.inside=true;v.x=pub.place('pub').front.x;v.z=pub.place('pub').front.z;
 v.step={kind:'idle',at:'pub',dur:40,activity:'relaxing at the pub'};
}
pub.arrive(pair[0]);
assert(pub.social.events.some(e=>e.kind==='pub'&&e.lines.length===4),
 'two residents actually sharing the pub should talk');
assert(pub.describe(pair[0]).social.conversations.length>0,'NPC should remember what was said');
const snap=JSON.parse(JSON.stringify(pub.snapshot()));
const loaded=new TownLife({homes,minute:0,seed:2121});
assert(loaded.restore(snap));
assert.deepEqual(loaded.social.events,pub.social.events,'pub transcript persists across reloads');
const alone=new TownLife({homes,minute:19*60,seed:2121});
const lone=alone.villagers[0];
for(const v of alone.villagers.slice(1)){
 v.path=[];v.step={kind:'idle',at:'home',dur:100};v.inside=true;
}
lone.step={kind:'idle',at:'pub',dur:15,activity:'relaxing'};
lone.path=[];
alone.arrive(lone);
assert.equal(alone.social.events.length,0,'one person at the pub is not a conversation');
const dialogueFile=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/ui/yarns.js',import.meta.url),'utf8'));
assert(dialogueFile.includes('captionText.textContent'),'captions must show the stored spoken text');
assert(dialogueFile.includes('setAttribute(\'aria-label\',\'Town conversations\')'),'dialogue history must be accessible');
console.log('PASS: attributable pub yarns, stable dialogue, memory, save/reload and no imaginary partners.');
