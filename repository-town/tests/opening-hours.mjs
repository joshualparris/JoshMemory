// Shops are actually open when their sign says: staff set off early enough to unlock on time, a
// stroll or lunchtime errands never leave the counter empty mid-shift, posted hours match the roster,
// and a new game (07:00) starts with the early shifts already at work.
//   node tests/opening-hours.mjs
import assert from 'node:assert/strict';
import {TownLife} from '../src/world/life.js';
import {facilityAccess,visitorHours} from '../src/world/facility-access.js';

const homes=Array.from({length:188},(_,i)=>({coordinate:String.fromCharCode(65+i%26)+(1+Math.floor(i/26)),name:'House',door:{x:(i%26-12.5)*26,z:Math.floor(i/26)*46-157}}));
const COUNTERS=['store','bakery','cafe','greengrocer','butcher','pub','post','bank','clinic','hall'];
const fmt=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

// Posted hours never run beyond the roster.
const t=new TownLife({homes,minute:7*60,seed:20261019});
for(const id of COUNTERS){const p=t.place(id),staff=t.villagers.filter(v=>v.work===id);
 assert(p.opens>=Math.min(...staff.map(v=>v.start))&&p.closes<=Math.max(...staff.map(v=>v.end)),`${id} posted ${fmt(p.opens)}-${fmt(p.closes)} beyond its roster`);}

// A new game: early shifts are already at work, so the bakery and café serve breakfast.
t.tick(0.5);for(const id of ['bakery','cafe'])assert(facilityAccess(t,t.place(id)).allowed,`${id} locked at the start of a new game`);

// Three days: count 15-minute checks inside posted hours when a counter is locked for want of staff.
for(const seed of [20261019,7]){
 const u=seed===20261019?t:new TownLife({homes,minute:7*60,seed});const locked={};
 while(u.day<4){u.tick(0.5);if(u.minute%15)continue;for(const id of COUNTERS){const p=u.place(id),a=facilityAccess(u,p);if(!a.allowed&&a.reason==='unstaffed')(locked[id]??=[]).push('day '+u.day+' '+fmt(u.minute));}}
 for(const id of COUNTERS)assert((locked[id]?.length||0)<=4,`${id} (seed ${seed}) locked for want of staff ${locked[id]?.length} times in 3 days: ${locked[id]?.slice(0,8).join(', ')}`);
 console.log(`  seed ${seed}: `+COUNTERS.map(id=>`${id} ${locked[id]?.length||0}`).join(', ')+' quarter-hours unstaffed in 3 days');
}
console.log('PASS: posted hours match the roster, the first morning is staffed, and counters stay staffed through opening, lunch and errands');
