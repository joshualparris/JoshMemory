// A roster is not proof of presence: council work can send somebody elsewhere.
export function workingAt(worker, siteId) {
  return worker?.step?.kind === 'work' &&
    worker.step.at === siteId && !(worker.path?.length);
}


// Retail counters need an actual worker, not merely an opening-hours sign.
const RETAIL = new Set(['store','bakery','greengrocer','butcher','cafe','pub']);
export function shopService(town, place) {
  if (!town.open(place)) return {available:false, reason:'closed', message:`${place.name} is closed.`};
  const staff = town.villagers.filter(v => workingAt(v, place.id));
  if (RETAIL.has(place.id) && !staff.length)
    return {available:false, reason:'unstaffed', message:`${place.name}: waiting for staff. Nobody is at the counter to serve you.`};
  return {available:true, reason:'serving', staff, message:staff.length ? `Serving now: ${staff.map(v=>v.name).join(', ')}.` : 'Open.'};
}
