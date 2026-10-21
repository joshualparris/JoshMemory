// Public entry is different from 24-hour operations: treatment plants, emergency
// response and utilities keep working when their front reception is locked.
import { workingAt } from './shop-attendance.js';

const RECEPTION_HOURS = Object.freeze({
  hotel: [7 * 60, 23 * 60],
  police: [7 * 60, 23 * 60],
  ambulance: [9 * 60, 17 * 60],
  fire: [9 * 60, 17 * 60],
  power: [9 * 60, 16 * 60],
  waterworks: [9 * 60, 16 * 60],
  sewage: [9 * 60, 16 * 60],
  farmhouse: [9 * 60, 17 * 60],
});
const SUPERVISED = new Set([
  'police','ambulance','fire','power','waterworks','sewage','landfill',
  'depot','mill','foundry','soyplant','soyfarm','school','clinic',
  'court','solicitor','recycling'
]);
const PERMANENT_HOSTS = new Set(['farmhouse','square']); // named residents/market guides
const CLOCK = (m) => `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
export function visitorHours(place) {
  return RECEPTION_HOURS[place.id] || [place.opens, place.closes];
}
export function onSiteWorkers(town, place) {
  return (town.villagers || []).filter(v => workingAt(v, place.id));
}
export function facilityAccess(town, place) {
  if (!place) return { allowed:false, reason:'unknown', message:'This entrance is unavailable.' };
  if (place.id === 'square') return { allowed:true, reason:'public', message:'Public space is open.' };
  const shift = town.jobsReport?.()?.active;
  if (shift?.site === place.id && shift.day === town.day)
    return { allowed:true, reason:'employee', message:'Your current work shift gives you access to your workplace.' };
  // A paid hotel booking grants guest access to their room overnight even if
  // public reception has closed; unbooked visitors must wait until morning.
  const booking = place.id === 'hotel' && town.needsReport?.()?.booking;
  if (booking) return { allowed:true, reason:'guest', message:'Your hotel room key grants access after reception closes.' };
  const [opens,closes] = visitorHours(place);
  if (!(town.minute >= opens && town.minute < closes))
    return { allowed:false, reason:'closed', message:`${place.name}: reception is locked. Visitor hours ${CLOCK(opens)}–${CLOCK(closes)}.${['police','ambulance','fire'].includes(place.id) ? ' Emergency services operate separately; use 000 (Game) for emergencies.' : ''}` };
  const staff = onSiteWorkers(town,place);
  if (!staff.length && !PERMANENT_HOSTS.has(place.id))
    return { allowed:false, reason:'unstaffed', message:`${place.name}: public entry is temporarily locked because no receptionist or authorised worker is on duty. Please return when staff are present.` };
  return { allowed:true, reason:SUPERVISED.has(place.id)?'supervised':'staffed',
    message:SUPERVISED.has(place.id)?`Welcome to ${place.name}. Report to the staff counter; workrooms and records are staff-only.`:`${place.name} is staffed and open.` };
}
