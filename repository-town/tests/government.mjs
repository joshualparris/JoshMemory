// End-to-end governance regression: elections, real officers, meetings, funds,
// physical municipal jobs, public register and save migrations.
import assert from 'node:assert/strict';
import {TownLife,CANDIDATES} from '../src/world/life.js';
const homes=[];
for(let r=0;r<7;r++)for(let c=0;c<26;c+=2)
  homes.push({coordinate:String.fromCharCode(65+c)+(r+1),name:'House',door:{x:(c-12.5)*26,z:r*46-161+4}});
const make=()=>new TownLife({homes,minute:540,seed:20261019});
const run=(t,n)=>{for(let m=0;m<n;m+=.5)t.tick(.5)};
const town=make(),report=town.governmentReport();
assert.equal(CANDIDATES.length,3);
assert.equal(report.mayor,'Vern');
assert.equal(report.councillors.length,5,'five named elected councillors');
assert(new Set(report.councillors.map(x=>x.id)).size===5);
for(const c of report.councillors)assert.equal(town.villagers[c.id].name,c.name);
assert(town.villagers.some(v=>v.job==='general manager'&&v.name===report.manager));
assert(town.villagers.some(v=>v.job==='mayor'&&v.name===report.mayor));

assert.match(town.vote('Sadie'),/vote/);
const afterVote=JSON.parse(JSON.stringify(town.snapshot()));
const restored=make();restored.restore(afterVote);
assert.match(restored.vote('Vern'),/already voted/,'refresh must not permit duplicate vote');
run(restored,1440);
assert.match(restored.vote('Arlo'),/already voted/,'next-day vote is still locked to same election');

const m=make();
assert.match(m.proposeCouncilMotion('priority','roads'),/Motion/);
assert.match(m.proposeCouncilMotion('tax',.08),/Motion/);
assert.match(m.proposeCouncilMotion('permit','residential'),/Motion/);
assert.match(m.holdCouncilMeeting(),/Meeting held/);
const g=m.civic.government;
assert.equal(g.minutes[0].attendees.length,6,'mayor and five councillors make quorum');
assert(g.minutes[0].resolutions.every(r=>r.votes.length===6));
assert(g.motions.every(x=>x.status!=='tabled'));
assert(g.audit.some(e=>e.type==='resolution'));
assert.equal(m.holdCouncilMeeting(),'Council has already met today.');
assert(g.permits.every(p=>p.status==='approved in principle'),'permit is not magic construction');

const w=make();w.civic.services.water=42;
const cash=w.civic.treasury,parts=w.place('hall').stock.parts;
assert.match(w.repair('water'),/Request lodged/);
assert.equal(w.civic.services.water,42,'repair request is not instantly completed');
assert.equal(w.civic.treasury,cash,'no instant deduction before authorisation');
run(w,4);
assert.equal(w.civic.services.water,42,'travel and inspection require elapsed time');
run(w,300);
const done=w.civic.government.orders[0];
assert.equal(done.status,'done','a real water worker completed job on-site');
assert.equal(w.civic.services.water,77);
assert(done.approvedBy,'GM delegated an authorised routine job');
assert(w.civic.government.budget.spent>=90,'approved job drew down its spending allocation');
assert(w.place('hall').stock.parts>=0,'parts inventory cannot be negative');
assert(w.civic.government.audit.some(e=>e.type==='dispatch'));
assert(w.civic.government.audit.some(e=>e.type==='inspection'));
assert(w.civic.government.audit.some(e=>e.type==='authorisation'));
assert(w.civic.government.audit.some(e=>e.type==='completion'));

const noBudget=make();
noBudget.civic.services.roads=40;noBudget.place('hall').stock.parts=0;
assert.match(noBudget.repair('roads'),/Request lodged/);
run(noBudget,200);
assert.equal(noBudget.civic.services.roads,40,'missing supplies prevent phantom repairs');
assert.notEqual(noBudget.civic.government.orders[0].status,'done');

const election=make();
assert.match(election.vote('Vern'),/vote/);
run(election,6*1440+900);
assert(election.civic.government.elections.length>0,'election held after day 7');
const result=election.civic.government.elections[0];
const nResidents=election.villagers.filter(v=>v.job!=='student').length;
assert.equal(Object.values(result.candidates).reduce((a,b)=>a+b,0),nResidents+1,
  'each eligible resident and one player have one ballot');
assert(election.villagers.some(v=>v.name===election.civic.mayor&&v.job==='mayor'));
assert.equal(election.civic.government.councillors.length,5);
const copy=make();copy.restore(JSON.parse(JSON.stringify(election.snapshot())));
assert.equal(copy.civic.mayor,election.civic.mayor);
assert.equal(copy.civic.government.elections[0].winner,result.winner);
assert.equal(copy.civic.government.councillors.length,5);
assert.equal(copy.villagers.find(v=>v.job==='mayor')?.name,copy.civic.mayor);
console.log('PASS: resident ballots, persisted one-vote rule, elected mayor and five councillors, GM, meetings, permits, staffed/approved public works and save migration');
