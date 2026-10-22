// Public politics regression: voluntary events, differing personalities,
// respectful opt-outs, physical NPC movement, private ballots and persistence.
import assert from 'node:assert/strict';
import {TownLife, ROSTER_SIZE} from '../src/world/life.js';
import {civicTemperament,civicIssue,initialisePublicLife,attendPublicForum,
  updatePublicForum,civicDialogue,publicForumReport} from '../src/world/public-forum.js';
const homes=[];
for(let r=0;r<8;r++)for(let c=0;c<26;c++){ if(r===7&&c>=6)continue;
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',
    door:{x:(c-12.5)*26,z:r*46-161+4}}); }
const make=()=>new TownLife({homes,minute:1080,seed:20261019});
const t=make();
const p=initialisePublicLife(t);
assert.equal(Object.keys(p.profiles).length,ROSTER_SIZE);
assert(new Set(Object.values(p.profiles).map(x=>x.temperament)).size>=4,
  'residents have different civic engagement');
assert(Object.values(p.profiles).some(x=>x.temperament==='avoids'));
assert(Object.values(p.profiles).some(x=>x.temperament==='engaged'));
assert.equal(civicTemperament(4),civicTemperament(4),'temperament is stable');
assert.equal(civicIssue(4),civicIssue(4),'local issues are stable');

t.day=2; // scheduled town-wide forum day
for(const v of t.villagers) v.doneToday={};
const speakers=t.villagers.filter(v=>['Vern','Arlo','Sadie'].includes(v.name));
const checked=speakers.filter(v=>attendPublicForum(t,v));
assert(checked.length>0,'at least one candidate has actually planned a public appearance');
assert(checked.some(v=>v.step.kind==='civic-speaker'));
const presenter=checked[0];
assert(presenter.path.length>0,'candidate must travel physically to Market Square');
const listeners=t.villagers.filter(v=>!['Vern','Arlo','Sadie'].includes(v.name)
  && civicTemperament(v.id)!=='avoids')
  .filter(v=>attendPublicForum(t,v));
assert(listeners.length>0,'ordinary residents choose to attend');
assert(listeners.some(v=>v.step.kind==='civic-audience'));
const listener=listeners[0];
const site=t.place('square').front;
for(const v of [presenter,listener]) {
  v.x=site.x;v.z=site.z;v.path=[]; // Simulate arrival after independently verified travel plan.
}
const start=t.civic.electionDay,before=JSON.stringify(t.civic.government.elections);
updatePublicForum(t);
assert(p.contacts.length>=1,'people in the same physical location converse');
assert.equal(t.civic.electionDay,start);
assert.equal(JSON.stringify(t.civic.government.elections),before,
  'public discussion must not edit election results or ballot rolls');
assert(p.profiles[String(listener.id)].visits>0,'contact creates lasting social memory');
updatePublicForum(t);
assert.equal(p.contacts.filter(e=>e.day===2&&e.speaker===presenter.name).length,1,
  'conversation not duplicated every simulation tick');
for(const v of t.villagers.filter(v=>civicTemperament(v.id)==='avoids')){
  assert.equal(attendPublicForum(t,v),false,'politics-avoidant residents never get drafted into a forum');
}
const ctx=civicDialogue(t,listener);
assert(['engaged','curious','practical','reserved','indifferent'].includes(ctx.temperament));
assert.equal(ctx.mayor,t.civic.mayor);
assert(!('ballot' in ctx),'conversation does not expose a private vote');
assert(!('choice' in ctx),'candidate preference remains private');
const summary=publicForumReport(t);
assert.equal(summary.contacts.length,1);
assert(summary.attendance.avoids>0);

const saved=t.snapshot();
const restored=make();
restored.restore(JSON.parse(JSON.stringify(saved)));
assert.equal(restored.civic.government.publicLife.contacts.length,p.contacts.length,
  'public forum history survives loading');
assert.equal(restored.civic.government.publicLife.profiles[String(listener.id)].visits,
  p.profiles[String(listener.id)].visits);
assert.equal(restored.civic.government.publicLife.profiles[String(listener.id)].temperament,
  p.profiles[String(listener.id)].temperament);
console.log('PASS: voluntary campaigning and councillor Q&A, spatial meetings, engagement diversity, respectful avoidance, ballot privacy and save/restore');
