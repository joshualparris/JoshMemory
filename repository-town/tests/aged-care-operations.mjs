import assert from 'node:assert/strict';
import {CARE_FACILITIES,careResidents,careStaff,careRoster,careOnDuty,careDailyMetrics,assignCareHousing,careActivity,careShiftAt} from '../src/world/aged-care-operations.js';
for(const id of Object.keys(CARE_FACILITIES)){
 const facility=CARE_FACILITIES[id],people=careResidents(id),staff=careStaff(id);
 assert.equal(people.length,facility.capacity);
 assert(new Set(people.map(p=>p.id)).size===people.length);
 assert(new Set(people.map(p=>p.name)).size===people.length,'names unique within facility');
 assert(people.every(p=>p.age>=65&&p.age<=105&&p.status.includes('Fictional')));
 assert(new Set(staff.map(p=>p.id)).size===staff.length);
 assert(staff.some(p=>p.role==='rn')&&staff.some(p=>p.role==='pcw')&&staff.some(p=>p.role==='chef'));
 for(let day=1;day<=28;day++){
   const metrics=careDailyMetrics(id,day);
   assert(metrics.rnMinutesPerResident>=44,'RN indicative baseline for '+id);
   assert(metrics.directMinutesPerResident>=215,'total indicative baseline for '+id);
   const seenToday=new Set();
   for(let shift=0;shift<3;shift++){
    const duty=careRoster(id,day,shift);
    assert(duty.some(p=>p.role==='rn'),id+' missing RN on day '+day+' shift '+shift);
    assert(duty.some(p=>p.role==='pcw'),id+' missing care assistants');
    for(const p of duty){
     assert(!seenToday.has(p.id),'same staff must not work multiple eight-hour shifts in same day '+p.id);
     seenToday.add(p.id);
    }
   }
   for(const minute of [0,359,419,420,899,900,1379,1380,1439]){
    assert(careOnDuty(id,day,minute).some(p=>p.role==='rn'),'RN continuity '+id+':'+day+':'+minute);
   }
 }
 for(const w of staff){
  for(let first=1;first<=22;first+=7){
   let shifts=0;
   for(let d=first;d<first+7;d++)for(let shift=0;shift<3;shift++)
    shifts+=careRoster(id,d,shift).filter(p=>p.id===w.id).length;
   assert(shifts<=5,'more than five eight-hour shifts/week for '+w.id+': '+shifts);
  }
 }
}
assert.equal(careResidents('bracken-house').filter(x=>x.household.startsWith('Lavender')).length,20);
assert.equal(careShiftAt(6*60),2);assert.equal(careShiftAt(12*60),0);assert.equal(careShiftAt(20*60),1);
assert.match(careActivity(12*60,2),/lunch/);
const all=[...careStaff('bracken-house'),...careStaff('yeoval-aged-care')];
const homes=[];for(let row=1;row<=8;row++)for(let col=0;col<26;col++)homes.push(String.fromCharCode(65+col)+row);
const occupied=new Set(homes.slice(0,33));
const housing=assignCareHousing(all,homes,occupied);
assert(housing.houses.size>0);
assert(housing.staffHoused<=housing.totalStaff);
assert([...housing.houses.keys()].every(c=>Number(c.slice(1))>=6&&!occupied.has(c)));
assert([...housing.houses.values()].every(v=>v.length<=3));
assert(new Set([...housing.houses.values()].flat().map(x=>x.id)).size===housing.staffHoused);
console.log('PASS 28 days x 3 shifts x both aged-care homes: 24/7 RN, realistic casemix care hours, stable 5-shift staff rotation, fictional residents and vacant southern share-houses');
