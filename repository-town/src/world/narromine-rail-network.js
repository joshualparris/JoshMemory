// Narromine rail network: the OpenStreetMap railway lines joined into one track graph, plus the
// path-following used by drivable trains. Pure logic (no three.js) so it can be tested in Node.
//
// Evidence (researched 4 Nov 2026):
// - Narromine lies on the Main Western line, 497.554 km from Sydney, standard gauge (1,435 mm).
//   The station opened in 1883 and closed to passenger trains in 1975; it is now an NSW TrainLink
//   coach stop, so no passenger trains run here (none are modelled).
// - The Parkes–Narromine line joins from the south (opened to Peak Hill 1910, Parkes 1914). It was
//   upgraded for Inland Rail (about 98 km upgraded, 5 km new track) and carries mainly grain.
// - Narromine yard was upgraded under NSW Fixing Country Rail to hold 1,500 m trains.
// - Typical traffic is grain trains of covered hopper wagons behind six-axle diesel-electrics,
//   plus ballast and general freight workings (ARTC train alteration notices list these).
// Track geometry is the mapped OSM centreline (ODbL). Speed limits below are game limits chosen
// to match typical country-line freight (80 km/h) and yard working (25 km/h); they are not taken
// from the ARTC route standards, which were not available to check.
export const RAIL_GAUGE_M = 1.435;
export const RAIL_TOP_Y = 0.49;          // top of rail above ground (ballast + sleeper + rail)
export const SPEED_LIMIT_KMH = Object.freeze({ main: 80, yard: 25 });
// OSM way indices that are yard loops and sidings beside the station (short, joined both ends to
// the main line); every other way is running line.
export const YARD_WAYS = Object.freeze([2, 3, 4, 5]);
export const RAIL_LINE_NAMES = Object.freeze({
  0: 'Parkes line connection', 1: 'Main Western line (to Nevertire)', 6: 'Parkes–Narromine line',
  7: 'Main Western line (to Dubbo)', 2: 'Narromine yard loop', 3: 'Narromine yard siding',
  4: 'Narromine yard siding', 5: 'Narromine yard siding',
});

const key = (a, b) => (a < b ? a + ':' + b : b + ':' + a);

export function buildRailNetwork(rail, snap = 1.5) {
  const nodes = [], adj = new Map(), edges = new Map();
  const nodeAt = ([x, z]) => {
    for (const n of nodes) if (Math.hypot(n.x - x, n.z - z) < snap) return n.id;
    const id = nodes.length; nodes.push({ id, x, z }); adj.set(id, new Set()); return id;
  };
  rail.forEach((way, w) => {
    let prev = null;
    for (const p of way.pts) {
      const id = nodeAt(p);
      if (prev !== null && prev !== id) {
        adj.get(prev).add(id); adj.get(id).add(prev);
        const k = key(prev, id), yard = YARD_WAYS.includes(w);
        const old = edges.get(k);
        edges.set(k, { way: old && !YARD_WAYS.includes(old.way) ? old.way : w, yard: old ? old.yard && yard : yard });
      }
      prev = id;
    }
  });
  const edge = (a, b) => edges.get(key(a, b));
  const limitKmh = (a, b) => (edge(a, b)?.yard ? SPEED_LIMIT_KMH.yard : SPEED_LIMIT_KMH.main);
  const lineName = (a, b) => RAIL_LINE_NAMES[edge(a, b)?.way] || 'Narromine railway';
  // Next node after travelling prev -> cur. Only gentle turns are real track continuations;
  // pref chooses at a junction: 'left', 'right' or 'straight'. null = end of track.
  function next(prev, cur, pref = 'straight') {
    const a = nodes[prev], c = nodes[cur], h = Math.atan2(c.z - a.z, c.x - a.x);
    const options = [...adj.get(cur)].filter(n => n !== prev).map(n => {
      const b = nodes[n]; let turn = Math.atan2(b.z - c.z, b.x - c.x) - h;
      turn = Math.atan2(Math.sin(turn), Math.cos(turn));
      return { n, turn };
    }).filter(o => Math.abs(o.turn) < 1.2);
    if (!options.length) return null;
    // In x-east/z-south world space, a negative turn is to the driver's left.
    if (pref === 'left') return options.reduce((m, o) => (o.turn < m.turn ? o : m)).n;
    if (pref === 'right') return options.reduce((m, o) => (o.turn > m.turn ? o : m)).n;
    return options.reduce((m, o) => (Math.abs(o.turn) < Math.abs(m.turn) ? o : m)).n;
  }
  const isJunction = (prev, cur) => [...adj.get(cur)].filter(n => n !== prev).length > 1;
  return { nodes, adj, edges, edge, next, isJunction, limitKmh, lineName };
}

// A train's position: a list of nodes it occupies and the head's distance s from path[0].
export function createTrainPath(net, startNodes, s) {
  let path = [...startNodes], cum = [];
  const rebuild = () => { cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(net.nodes[path[i]].x - net.nodes[path[i - 1]].x, net.nodes[path[i]].z - net.nodes[path[i - 1]].z)); };
  rebuild();
  const total = () => cum[cum.length - 1];
  function pointAt(d) {
    d = Math.max(0, Math.min(total(), d));
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const a = net.nodes[path[i - 1]], b = net.nodes[path[i]], seg = cum[i] - cum[i - 1] || 1, t = (d - cum[i - 1]) / seg;
    return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, a: path[i - 1], b: path[i] };
  }
  // Move the head by ds (negative = backwards) keeping `length` metres of train on the path.
  // Returns {blocked:'end'|'rear'|null, junction:boolean}.
  function move(ds, length, pref = 'straight') {
    let blocked = null, junction = false;
    s += ds;
    while (s > total()) {
      const n = path.length, nx = net.next(path[n - 2], path[n - 1], pref);
      if (nx === null) { s = total(); blocked = 'end'; break; }
      junction ||= net.isJunction(path[n - 2], path[n - 1]);
      path.push(nx); rebuild();
    }
    while (s - length < 0) {
      const pv = net.next(path[1], path[0], 'straight');
      if (pv === null) { s = length; blocked = 'rear'; break; }
      path.unshift(pv); rebuild(); s += cum[1];
    }
    // Forget track well behind the train so the path stays short.
    while (path.length > 3 && cum[2] < s - length - 60) { const drop = cum[1]; path.shift(); rebuild(); s -= drop; }
    return { blocked, junction };
  }
  return { pointAt, move, get s() { return s; }, get path() { return path; }, total };
}
