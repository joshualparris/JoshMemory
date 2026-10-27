// Day 1 is Monday 26 Oct 2026 in Australian civil time, regardless of client
// timezone, daylight saving or restored save day. NPCs ACT differently at weekends.
import assert from 'node:assert/strict';
import {townDate,townDateLabel,isWeekend,venueHoursOnDay,residentWorksToday} from '../src/world/town-calendar.js';
import {TownLife} from '../src/world/life.js';
import {facilityAccess,visitorHours} from '../src/world/facility-access.js';

assert.equal(townDate(1).iso,'2026-10-26');
assert.equal(townDateLabel(1),'Monday 26 October 2026');
assert.equal(townDate(6).label,'Saturday 31 October 2026');
assert.equal(townDate(7).label,'Sunday 1 November 2026');
assert.equal(townDate(8).label,'Monday 2 November 2026');
assert.equal(townDate(365).iso,'2027-10-25');
assert.equal(townDate(492).iso,'2028-02-29','leap years must work');
assert.equal(isWeekend(6),true);assert.equal(isWeekend(7),true);assert.equal(isWeekend(8),false);
assert.equal(venueHoursOnDay({id:'school',opens:510,closes:900},6),null);
assert.equal(venueHoursOnDay({id:'bank',opens:510,closes:1050},7),null);
assert.deepEqual(venueHoursOnDay({id:'store',opens:420,closes:1200},6),[480,1080]);
assert.deepEqual(venueHoursOnDay({id:'store',opens:420,closes:1200},7),[480,960]);
assert.deepEqual(venueHoursOnDay({id:'pub',opens:660,closes:1380},7),[720,1260]);
assert.deepEqual(venueHoursOnDay({id:'dairy',opens:300,closes:840},7),[300,840]);
const roster=[{id:2,work:'cafe'},{id:3,work:'cafe'}],cafe={id:'cafe',opens:390,closes:1020};
assert(residentWorksToday(6,roster[0],cafe,roster));
assert(!residentWorksToday(7,roster[0],cafe,roster));
assert(!residentWorksToday(6,roster[1],cafe,roster));
assert(residentWorksToday(7,roster[1],cafe,roster));

const homes=[];for(let r=0;r<8;r++)for(let c=0;c<26;c++)homes.push({
 coordinate:String.fromCharCode(65+c)+(r+1),name:'Home',
 door:{x:(c-12.5)*26,z:r*46-161+4}
});
const life=new TownLife({homes,minute:12*60,seed:20261026});
assert.equal(life.dateLabel(),'Monday 26 October 2026');
assert.equal(life.weekday(),'Monday');
const teacher=life.villagers.find(v=>v.job==='teacher');
assert(teacher,'school teacher fixture');
const bank=life.place('bank'),school=life.place('school'),store=life.place('store');
assert(life.shiftToday(teacher),'teacher should be at school Monday');
assert(life.open(school));assert(life.open(bank));
life.day=6;life.minute=12*60;
assert.equal(life.weekday(),'Saturday');
assert.equal(life.shiftToday(teacher),null,'teacher Saturday must be off duty');
assert.equal(life.open(school),false);
assert.equal(life.open(bank),false);
assert.equal(life.open(store),true);
assert.equal(facilityAccess(life,school).reason,'closed-day');
assert.equal(visitorHours(school,6),null);
teacher.doneToday={};teacher.path=[];teacher.queue=[];teacher.step=null;
life.plan(teacher);
assert(teacher.step&&teacher.step.kind!=='work'&&teacher.step.kind!=='preopen','weekend teacher actually gets leisure activity');
assert(!/class|teaching/i.test(teacher.activity||''),'teacher does not teach on Saturday');
life.day=7;life.minute=12*60;teacher.doneToday={};teacher.path=[];teacher.queue=[];teacher.step=null;
assert.equal(life.dateLabel(),'Sunday 1 November 2026');
life.plan(teacher);
assert(teacher.step&&!['work','preopen'].includes(teacher.step.kind),'Sunday is not a fake work shift');
assert.equal(life.open(store),true);assert.equal(life.open(bank),false);
life.day=8;life.minute=12*60;
assert.equal(life.weekday(),'Monday');
assert(life.shiftToday(teacher),'second Monday resumes weekday roster');
assert.equal(life.open(school),true);
assert.equal(life.open(bank),true);
const saved=life.snapshot();const restored=new TownLife({homes,minute:420,seed:1});
assert(restored.restore(saved));assert.equal(restored.calendar().iso,'2026-11-02','date derives from saved day');
const legacy=JSON.parse(JSON.stringify(saved));delete legacy.sim;
const migrated=new TownLife({homes,minute:420,seed:1});assert(migrated.restore(legacy));
assert.equal(migrated.dateLabel(),'Monday 2 November 2026','legacy saves inherit stable epoch');
console.log('PASS: Monday 26 Oct 2026 origin, weekend trading, NPC day-off decisions, alternating rosters and save continuity');
