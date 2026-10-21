// A roster is not proof of presence: council work can send somebody elsewhere.
export function workingAt(worker, site) {
  const id = typeof site === 'string' ? site : site?.id;
  if (worker?.step?.kind !== 'work' || worker.step.at !== id) return false;
  if (!(worker.path?.length)) return true;
  // Real reception staff can be physically at the workplace while the NPC
  // navigator is clearing its final 1–3 short waypoints. Never classify a
  // worker two metres from the desk as absent solely because path.length > 0.
  const front = typeof site === 'object' ? site.front : null;
  return worker.inside !== true &&
    Number.isFinite(worker.x) && Number.isFinite(worker.z) &&
    Number.isFinite(front?.x) && Number.isFinite(front?.z) &&
    Math.hypot(worker.x-front.x,worker.z-front.z) <= 2.75;
}


// Retail counters need an actual worker, not merely an opening-hours sign.
const RETAIL = new Set(['store','bakery','greengrocer','butcher','cafe','pub']);
export function shopService(town, place) {
  if (!town.open(place)) return {available:false, reason:'closed', message:`${place.name} is closed.`};
  const staff = town.villagers.filter(v => workingAt(v, place));
  if (RETAIL.has(place.id) && !staff.length)
    return {available:false, reason:'unstaffed', message:`${place.name}: waiting for staff. Nobody is at the counter to serve you.`};
  return {available:true, reason:'serving', staff, message:staff.length ? `Serving now: ${staff.map(v=>v.name).join(', ')}.` : 'Open.'};
}
