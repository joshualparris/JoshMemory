// Pure-logic check: delivery trucks must never overlap one another and must never deadlock.
// Runs several town days of the real simulation and tests oriented truck footprints every tick.
//   node tests/truck-collision.mjs [--days 4] [--step 0.05] [--player]
import { TownLife, SEC_PER_MIN } from '../src/world/life.js';
import { loadInventory } from '../tools/lib.mjs';
import { lotPosition } from '../src/world/town.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const DAYS = opt('--days', 4), STEP = opt('--step', 0.05);
const HL = 3.3, HW = 1.2;                  // truck half length / half width (see makeTruck in townlife.js)
const inventory = loadInventory();
const homes = inventory.projects.map((p) => { const l = lotPosition(p.coordinate); return { coordinate: p.coordinate, name: p.repo.split('/').pop(), door: { x: l.x, z: l.z + 10 } }; });
const life = new TownLife({ homes });

const corners = (t) => {
  const fx = Math.sin(t.heading), fz = Math.cos(t.heading), rx = fz, rz = -fx;
  return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => ({ x: t.x + fx * HL * a + rx * HW * b, z: t.z + fz * HL * a + rz * HW * b }));
};
const axes = (t) => [{ x: Math.sin(t.heading), z: Math.cos(t.heading) }, { x: Math.cos(t.heading), z: -Math.sin(t.heading) }];
function overlap(a, b) {
  const ca = corners(a), cb = corners(b);
  let minPen = Infinity;
  for (const ax of [...axes(a), ...axes(b)]) {
    const pa = ca.map((c) => c.x * ax.x + c.z * ax.z), pb = cb.map((c) => c.x * ax.x + c.z * ax.z);
    const pen = Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb));
    if (pen <= 0) return 0;
    minPen = Math.min(minPen, pen);
  }
  return minPen;
}

const ticks = Math.round((DAYS * 24 * 60) / STEP);
const stuck = [];
let overlaps = 0, worst = 0, first = null, maxBrake = 0, brake = [0, 0, 0], moved = [0, 0, 0], last = life.trucks.map((t) => ({ x: t.x, z: t.z })), deadlocks = 0;
const events = new Set();
for (let i = 0; i < ticks; i++) {
  life.tick(STEP);
  for (let a = 0; a < life.trucks.length; a++) for (let b = a + 1; b < life.trucks.length; b++) {
    const pen = overlap(life.trucks[a], life.trucks[b]);
    if (pen > 0.05) { overlaps++; worst = Math.max(worst, pen); if (!first) first = { day: life.day, time: life.time(), a: { ...pick(life.trucks[a]) }, b: { ...pick(life.trucks[b]) }, pen: +pen.toFixed(2) }; events.add(`${a}-${b}`); }
  }
  life.trucks.forEach((t, k) => {
    brake[k] = t.braking ? brake[k] + STEP : 0; maxBrake = Math.max(maxBrake, brake[k]);
    // A deadlock is a waiting circle: braking > 25 town minutes while the chain of trucks it waits
    // on loops back on itself. Waiting behind a truck that is unloading is ordinary traffic.
    if (brake[k] > 25 && brake[k] - STEP <= 25) {
      const seen = new Set([k]); let c = life.trucks[k].blockedBy, cyc = false;
      while (c != null && life.trucks[c]?.braking) { if (seen.has(c)) { cyc = true; break; } seen.add(c); c = life.trucks[c].blockedBy; }
      if (cyc || life.trucks[k].blockedBy == null) { deadlocks++; stuck.push({ day: life.day, time: life.time(), truck: k, by: life.trucks[k].blockedBy, why: life.trucks[k].why }); }
    }
  });
}
function pick(t) { return { id: t.id, x: +t.x.toFixed(1), z: +t.z.toFixed(1), heading: +t.heading.toFixed(2), state: t.state }; }
const result = { days: DAYS, ticks, overlapTicks: overlaps, worstPenetration_m: +worst.toFixed(2), pairs: [...events], first, longestBrake_townMin: +maxBrake.toFixed(1), deadlocks, stuck: stuck.slice(0, 5), deliveries: life.stats.deliveries, recalls: life.recalls || 0 };
console.log(JSON.stringify(result, null, 2));
process.exit(overlaps || deadlocks ? 1 : 0);
