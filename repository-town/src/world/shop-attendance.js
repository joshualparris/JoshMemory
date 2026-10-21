// A roster is not proof of presence: council work can send somebody elsewhere.
export function workingAt(worker, site) {
  const id = typeof site === 'string' ? site : site?.id;
  if (worker?.step?.kind !== 'work' || worker.step.at !== id) return false;
  const front = typeof site === 'object' ? site.front : null;
  const positioned = Number.isFinite(worker.x) && Number.isFinite(worker.z);
  if (positioned && Number.isFinite(front?.x) && Number.isFinite(front?.z)) {
    // Live positions take priority over a stale route length: the last few
    // waypoints often remain after an actual cashier arrives at reception.
    if (Math.hypot(worker.x-front.x,worker.z-front.z) <= 2.75) return true;
    // Farm employees legitimately work in the paddock, not at a counter.
    // Their agricultural field is a real workplace within the site boundary.
    const field = site?.field;
    return !!field && worker.x >= field.x0 && worker.x <= field.x1 &&
      worker.z >= field.z0 && worker.z <= field.z1;
  }
  // Lightweight callers / synthetic tests without real coordinates retain
  // the conservative original rule: a route must be fully finished.
  return !(worker.path?.length);
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
